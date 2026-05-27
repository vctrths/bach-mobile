-- 1. Add rating to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating float DEFAULT NULL;

-- 2. Create the reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  collaboration_id uuid REFERENCES public.collaborations(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_id uuid NOT NULL, -- profile_id
  target_type text NOT NULL CHECK (target_type = 'user'),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text CHECK (char_length(comment) <= 500),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure one review per collaboration per reviewer
  UNIQUE(collaboration_id, reviewer_id)
);

-- 3. Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Participants can insert reviews for ended collaborations" 
  ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND 
    EXISTS (
      SELECT 1 FROM public.collaborations 
      WHERE id = collaboration_id 
      AND status = 'ended'
      AND (owner_id = auth.uid() OR gardener_id = auth.uid())
    )
  );

-- 5. Trigger function to update averages
CREATE OR REPLACE FUNCTION public.update_rating_averages() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_type = 'user' THEN
    UPDATE public.profiles 
    SET rating = (
      SELECT ROUND(AVG(rating)::numeric, 1) 
      FROM public.reviews 
      WHERE target_id = NEW.target_id AND target_type = 'user'
    ) 
    WHERE id = NEW.target_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Attach the trigger
DROP TRIGGER IF EXISTS sync_ratings_trigger ON public.reviews;
CREATE TRIGGER sync_ratings_trigger 
AFTER INSERT OR UPDATE ON public.reviews 
FOR EACH ROW EXECUTE FUNCTION public.update_rating_averages();
