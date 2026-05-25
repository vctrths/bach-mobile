-- Safe reusable schema script
-- Run this in Supabase SQL Editor anytime you need to update/reset schema
-- Existing data is preserved; policies are dropped and recreated to avoid "already exists" errors

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  last_name text,
  email text,
  description text,
  role text,
  profile_image text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 2. GARDENS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gardens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL,
  latitude double precision,
  longitude double precision,
  rating float DEFAULT 5.0,
  image_url text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gardens are viewable by everyone" ON public.gardens;
CREATE POLICY "Gardens are viewable by everyone" ON public.gardens FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own gardens" ON public.gardens;
CREATE POLICY "Users can create own gardens" ON public.gardens FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- ============================================================
-- 3. GARDEN LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.garden_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id uuid REFERENCES public.gardens(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  status jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.garden_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Garden logs are viewable by everyone" ON public.garden_logs;
CREATE POLICY "Garden logs are viewable by everyone" ON public.garden_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own logs" ON public.garden_logs;
CREATE POLICY "Users can create own logs" ON public.garden_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. GARDEN REQUESTS
-- ============================================================
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

DROP POLICY IF EXISTS "Garden requests are viewable by garden owner and requester" ON public.garden_requests;
CREATE POLICY "Garden requests are viewable by garden owner and requester" 
  ON public.garden_requests FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT owner_id FROM public.gardens WHERE id = garden_id)
  );

DROP POLICY IF EXISTS "Users can create requests" ON public.garden_requests;
CREATE POLICY "Users can create requests" 
  ON public.garden_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own requests" ON public.garden_requests;
CREATE POLICY "Users can update own requests" 
  ON public.garden_requests FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 5. CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

-- ============================================================
-- 6. MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Trigger to auto-update updated_at on conversations
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_updated_at ON public.messages;
CREATE TRIGGER trigger_update_conversation_updated_at
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- Conversations RLS Policies
DROP POLICY IF EXISTS "Users can view conversations they are part of" ON public.conversations;
CREATE POLICY "Users can view conversations they are part of"
  ON public.conversations FOR SELECT USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Messages RLS Policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT USING (
    auth.uid() IN (
      SELECT user1_id FROM public.conversations WHERE id = conversation_id
      UNION
      SELECT user2_id FROM public.conversations WHERE id = conversation_id
    )
  );

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations"
  ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT user1_id FROM public.conversations WHERE id = conversation_id
      UNION
      SELECT user2_id FROM public.conversations WHERE id = conversation_id
    )
  );

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('request_accepted', 'request_rejected', 'message', 'reminder', 'system')),
  title text NOT NULL,
  body text,
  read boolean DEFAULT false,
  related_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP INDEX IF EXISTS idx_notifications_user_id;
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

DROP INDEX IF EXISTS idx_notifications_created_at;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
