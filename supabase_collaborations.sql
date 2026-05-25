-- 1. Create the Collaborations Table
CREATE TABLE IF NOT EXISTS public.collaborations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Core relationships
  garden_id     uuid REFERENCES public.gardens(id) ON DELETE CASCADE,
  gardener_id   uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id      uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id    uuid REFERENCES public.garden_requests(id) ON DELETE SET NULL,

  -- Status & Lifecycle
  status        text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  terms         text,

  -- Active Planning (Mutable state, originally seeded from request)
  days                  text[] DEFAULT '{}',
  start_date            date,
  collaboration_type    text,

  -- Termination Data
  ended_at      timestamp with time zone,
  ended_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ended_reason  text,

  -- Timestamps
  created_at  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Setup Row Level Security (RLS)
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

-- Policy: Both participants can view their active or past collaborations
CREATE POLICY "Collaborations viewable by participants"
  ON public.collaborations FOR SELECT USING (
    auth.uid() = owner_id OR auth.uid() = gardener_id
  );

-- Policy: Only the garden owner can create the collaboration (upon accepting a request)
CREATE POLICY "Owners can create collaborations"
  ON public.collaborations FOR INSERT WITH CHECK (
    auth.uid() = owner_id
  );

-- Policy: Both participants can update the collaboration (e.g., to change status to 'ended' or 'paused')
CREATE POLICY "Participants can update collaborations"
  ON public.collaborations FOR UPDATE USING (
    auth.uid() = owner_id OR auth.uid() = gardener_id
  );
