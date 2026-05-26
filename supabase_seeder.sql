-- 1. Insert Sample Profile
INSERT INTO public.profiles (id, first_name, last_name, email, role, description, created_at)
VALUES 
  ('987ded8c-4313-4a18-8920-60815678ffaa', 'John', 'Doe', 'johndoe@example.com', 'Tuineigenaar', 'Gepassioneerde tuinier uit Leuven.', now())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Sample Gardens with image URLs
INSERT INTO public.gardens (owner_id, name, location, latitude, longitude, rating, description, image_url, appliances, created_at)
VALUES 
  ('987ded8c-4313-4a18-8920-60815678ffaa', 'Stadstuin Leuven', 'Leuven', 50.8798, 4.7005, 4.8, 'Een compacte maar groene oase in het centrum van de stad.', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', '{"water", "electricity", "tools"}', now()),
  ('987ded8c-4313-4a18-8920-60815678ffaa', 'Groene Heuvel', 'Heverlee', 50.8624, 4.6758, 4.5, 'Grote tuin met veel potentieel voor groenten.', 'https://images.unsplash.com/photo-1598902108854-10e335ad8e2e?w=800', '{"water", "greenhouse"}', now()),
  ('987ded8c-4313-4a18-8920-60815678ffaa', 'Kruidentuin Kessel-Lo', 'Kessel-Lo', 50.8850, 4.7230, 4.9, 'Gespecialiseerd in zeldzame medicinale kruiden.', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800', '{"water", "electricity", "compost"}', now())
ON CONFLICT DO NOTHING;

-- 3. Insert Sample Garden Logs
INSERT INTO public.garden_logs (garden_id, user_id, title, status, created_at)
VALUES 
  (
    (SELECT id FROM public.gardens WHERE name = 'Stadstuin Leuven' LIMIT 1),
    '987ded8c-4313-4a18-8920-60815678ffaa',
    'Planten water geven',
    '["completed", "pending"]'::jsonb,
    now()
  ),
  (
    (SELECT id FROM public.gardens WHERE name = 'Groene Heuvel' LIMIT 1),
    '987ded8c-4313-4a18-8920-60815678ffaa',
    'Onkruid wieden',
    '["completed", "completed"]'::jsonb,
    now()
  ),
  (
    (SELECT id FROM public.gardens WHERE name = 'Kruidentuin Kessel-Lo' LIMIT 1),
    '987ded8c-4313-4a18-8920-60815678ffaa',
    'Snoeien van de lavendel',
    '["pending"]'::jsonb,
    now()
  )
ON CONFLICT DO NOTHING;
