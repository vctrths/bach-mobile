-- Supabase Storage setup for profile, garden, and log images.
-- Run this in the Supabase SQL Editor after your base schema.

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

ALTER TABLE public.garden_logs
  ADD COLUMN IF NOT EXISTS image_url text;

DROP POLICY IF EXISTS "Users can upload own app images" ON storage.objects;
CREATE POLICY "Users can upload own app images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'app-images'
    AND (storage.foldername(name))[1] IN ('profiles', 'gardens', 'logs')
    AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
    AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp')
  );

DROP POLICY IF EXISTS "Users can update own app images" ON storage.objects;
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

DROP POLICY IF EXISTS "Users can delete own app images" ON storage.objects;
CREATE POLICY "Users can delete own app images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'app-images'
    AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
  );
