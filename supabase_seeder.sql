-- 1. Insert Sample Profile
INSERT INTO public.profiles (id, first_name, last_name, email, role, description, created_at)
VALUES 
  ('987ded8c-4313-4a18-8920-60815678ffaa', 'John', 'Doe', 'johndoe@example.com', 'Tuineigenaar', 'Gepassioneerde tuinier uit Leuven.', now())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Sample Gardens with image URLs
INSERT INTO public.gardens (id, owner_id, name, location, latitude, longitude, description, image_url, appliances, created_at)
VALUES 
  ('d049d10d-580c-42a0-9de4-947e72794266', '987ded8c-4313-4a18-8920-60815678ffaa', 'Stadstuin Leuven', 'Leuven', 50.8798, 4.7005, 'Een verborgen parel in hartje Leuven. Deze compacte stadstuin biedt een perfecte mix van bloemen en eetbare planten, ideaal voor iemand die houdt van verticaal tuinieren in een stedelijke omgeving.', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', '{"water", "electricity", "tools"}', now()),
  ('3a42b613-2fbd-413a-8555-f2c6962e8790', '987ded8c-4313-4a18-8920-60815678ffaa', 'Groene Heuvel', 'Heverlee', 50.8624, 4.6758, 'Gelegen op een zonnige helling in Heverlee. Deze ruime tuin heeft een rijke bodem die perfect is voor een uitgebreide moestuin. Er is al een serre aanwezig voor het kweken van tomaten en paprika''s.', 'https://images.unsplash.com/photo-1598902108854-10e335ad8e2e?w=800', '{"water", "greenhouse"}', now()),
  ('12bdd142-c97c-4539-96a4-76465eb35124', '987ded8c-4313-4a18-8920-60815678ffaa', 'Kruidentuin Kessel-Lo', 'Kessel-Lo', 50.8850, 4.7230, 'Een paradijs voor liefhebbers van geuren en smaken. Deze tuin is volledig ingericht voor de kweek van zeldzame medicinale en culinaire kruiden. Inclusief een actieve composthoop en regentonnen.', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800', '{"water", "electricity", "compost"}', now()),
  ('f71f8a1d-04b8-45e7-aa2f-61bcf252aebf', '987ded8c-4313-4a18-8920-60815678ffaa', 'John’s Tuin', 'Willebroek', 51.0606816, 4.3588917, 'Een rustige, goed onderhouden tuin in Willebroek. Veel gazon maar ook borders die wachten op een creatieve hand. Perfect voor wie rustig wil beginnen met tuinieren zonder al te veel zwaar werk.', 'https://images.unsplash.com/photo-1558905757-0bc302685732?w=800', '{"water", "tools"}', now()),
  ('dd842ca6-58fa-4ec1-b114-d369203eb77d', '93471971-ae19-46f5-a044-4a56c2635844', 'Jane’s Tuin', 'Mechelen', 51.0281381, 4.4803453, 'Een gezellige familietuin in Mechelen met veel schaduwrijke plekken dankzij de volwassen bomen. Ideaal voor het kweken van schaduwminnende planten of het onderhouden van een natuurlijke bostuin.', 'https://images.unsplash.com/photo-1600250395178-40fe752e5189?w=800', '{"shade", "toilet", "compost", "electricity", "water", "tools"}', now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  appliances = EXCLUDED.appliances;

-- 3. Insert Sample Garden Logs
INSERT INTO public.garden_logs (garden_id, user_id, title, status, created_at)
VALUES 
  (
    'd049d10d-580c-42a0-9de4-947e72794266',
    '987ded8c-4313-4a18-8920-60815678ffaa',
    'Planten water geven',
    '["completed", "pending"]'::jsonb,
    now()
  ),
  (
    '3a42b613-2fbd-413a-8555-f2c6962e8790',
    '987ded8c-4313-4a18-8920-60815678ffaa',
    'Onkruid wieden',
    '["completed", "completed"]'::jsonb,
    now()
  ),
  (
    '12bdd142-c97c-4539-96a4-76465eb35124',
    '987ded8c-4313-4a18-8920-60815678ffaa',
    'Snoeien van de lavendel',
    '["pending"]'::jsonb,
    now()
  )
ON CONFLICT DO NOTHING;
