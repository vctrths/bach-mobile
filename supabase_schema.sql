-- 1. Profiles Table (Matches your onboarding logic)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  last_name text,
  email text,
  description text,
  role text,
  profile_image text,
  expo_push_token text,
  is_premium boolean DEFAULT false NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  premium_activated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS premium_activated_at timestamp with time zone;

-- 2. Gardens Table
CREATE TABLE IF NOT EXISTS public.gardens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL,
  latitude double precision,
  longitude double precision,
  image_url text,
  description text,
  appliances text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Garden Logs Table
CREATE TABLE IF NOT EXISTS public.garden_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id uuid REFERENCES public.gardens(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  status jsonb DEFAULT '[]'::jsonb, -- Stores arrays like ["completed", "pending"]
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.garden_logs
  ADD COLUMN IF NOT EXISTS image_url text;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

REVOKE UPDATE (
  is_premium,
  stripe_customer_id,
  stripe_subscription_id,
  premium_activated_at
) ON public.profiles FROM anon, authenticated;

CREATE POLICY "Gardens are viewable by everyone" ON public.gardens FOR SELECT USING (true);
CREATE POLICY "Users can create own gardens" ON public.gardens FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Garden logs are viewable by everyone" ON public.garden_logs FOR SELECT USING (true);
CREATE POLICY "Users can create own logs" ON public.garden_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON public.garden_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Garden Requests Table
CREATE TABLE IF NOT EXISTS public.garden_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id uuid REFERENCES public.gardens(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  motivation text CHECK (char_length(motivation) <= 300),
  collaboration_type text,
  days text[] DEFAULT '{}',
  start_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.garden_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Garden requests are viewable by garden owner and requester" 
  ON public.garden_requests FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT owner_id FROM public.gardens WHERE id = garden_id)
  );

CREATE POLICY "Users can create requests" 
  ON public.garden_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own requests"
  ON public.garden_requests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Garden owners can update requests for their gardens"
  ON public.garden_requests FOR UPDATE USING (
    auth.uid() IN (SELECT owner_id FROM public.gardens WHERE id = garden_id)
  );

-- 5. App image storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-images',
  'app-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Users can upload own app images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'app-images'
    AND (storage.foldername(name))[1] IN ('profiles', 'gardens', 'logs')
    AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
    AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp')
  );

CREATE POLICY "Users can update own app images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'app-images'
    AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'app-images'
    AND (storage.foldername(name))[1] IN ('profiles', 'gardens', 'logs')
    AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
    AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp')
  );

CREATE POLICY "Users can delete own app images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'app-images'
    AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
  );
