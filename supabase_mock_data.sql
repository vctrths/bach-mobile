-- Repeatable mock data for local/demo Supabase projects.
-- All mock accounts use password: MockPass123!

with mock_users (
  id,
  email,
  first_name,
  last_name,
  role,
  description,
  profile_image,
  is_premium
) as (
  values
    ('00000000-0000-4000-8000-000000000101'::uuid, 'anna.owner@groenevingers.test', 'Anna', 'De Smet', 'Tuineigenaar', 'Heeft een zonnige stadstuin in Gent en zoekt hulp voor een moestuin met veel kruiden.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces', true),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'bram.owner@groenevingers.test', 'Bram', 'Vermeulen', 'Tuineigenaar', 'Deelt graag zijn ruime tuin met buurtbewoners die willen experimenteren met groenten.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces', false),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'lotte.owner@groenevingers.test', 'Lotte', 'Peeters', 'Tuineigenaar', 'Houdt van bloemen, bessenstruiken en duidelijke afspraken met vaste tuinmomenten.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces', false),
    ('00000000-0000-4000-8000-000000000201'::uuid, 'noor.gardener@groenevingers.test', 'Noor', 'Janssens', 'Tuinzoeker', 'Beginnende tuinier met veel zin om te leren over compost, kruiden en seizoensgroenten.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces', false),
    ('00000000-0000-4000-8000-000000000202'::uuid, 'milan.gardener@groenevingers.test', 'Milan', 'Claes', 'Tuinzoeker', 'Ervaren moestuinier die graag tomaten, courgettes en pompoenen kweekt.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces', true),
    ('00000000-0000-4000-8000-000000000203'::uuid, 'sara.gardener@groenevingers.test', 'Sara', 'Maes', 'Tuinzoeker', 'Zoekt een rustige plek om bloemen te verzorgen en een kleine pluktuin te starten.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces', false),
    ('00000000-0000-4000-8000-000000000204'::uuid, 'elias.gardener@groenevingers.test', 'Elias', 'Dubois', 'Tuinzoeker', 'Werkt graag buiten en helpt met zwaardere klussen zoals snoeien en bedden voorbereiden.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces', false)
)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  '00000000-0000-0000-0000-000000000000',
  id,
  'authenticated',
  'authenticated',
  email,
  crypt('MockPass123!', gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email']),
  jsonb_build_object('first_name', first_name, 'last_name', last_name, 'role', role),
  now(),
  now()
from mock_users
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = coalesce(auth.users.email_confirmed_at, excluded.email_confirmed_at),
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

with mock_users (
  id,
  email,
  first_name,
  last_name,
  role,
  description,
  profile_image,
  is_premium
) as (
  values
    ('00000000-0000-4000-8000-000000000101'::uuid, 'anna.owner@groenevingers.test', 'Anna', 'De Smet', 'Tuineigenaar', 'Heeft een zonnige stadstuin in Gent en zoekt hulp voor een moestuin met veel kruiden.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces', true),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'bram.owner@groenevingers.test', 'Bram', 'Vermeulen', 'Tuineigenaar', 'Deelt graag zijn ruime tuin met buurtbewoners die willen experimenteren met groenten.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces', false),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'lotte.owner@groenevingers.test', 'Lotte', 'Peeters', 'Tuineigenaar', 'Houdt van bloemen, bessenstruiken en duidelijke afspraken met vaste tuinmomenten.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces', false),
    ('00000000-0000-4000-8000-000000000201'::uuid, 'noor.gardener@groenevingers.test', 'Noor', 'Janssens', 'Tuinzoeker', 'Beginnende tuinier met veel zin om te leren over compost, kruiden en seizoensgroenten.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces', false),
    ('00000000-0000-4000-8000-000000000202'::uuid, 'milan.gardener@groenevingers.test', 'Milan', 'Claes', 'Tuinzoeker', 'Ervaren moestuinier die graag tomaten, courgettes en pompoenen kweekt.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces', true),
    ('00000000-0000-4000-8000-000000000203'::uuid, 'sara.gardener@groenevingers.test', 'Sara', 'Maes', 'Tuinzoeker', 'Zoekt een rustige plek om bloemen te verzorgen en een kleine pluktuin te starten.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces', false),
    ('00000000-0000-4000-8000-000000000204'::uuid, 'elias.gardener@groenevingers.test', 'Elias', 'Dubois', 'Tuinzoeker', 'Werkt graag buiten en helpt met zwaardere klussen zoals snoeien en bedden voorbereiden.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces', false)
)
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  id,
  id::text,
  jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now()
from mock_users
on conflict (provider_id, provider) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

insert into public.profiles (
  id,
  first_name,
  last_name,
  email,
  role,
  description,
  profile_image,
  is_premium,
  created_at
)
values
  ('00000000-0000-4000-8000-000000000101', 'Anna', 'De Smet', 'anna.owner@groenevingers.test', 'Tuineigenaar', 'Heeft een zonnige stadstuin in Gent en zoekt hulp voor een moestuin met veel kruiden.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces', true, now() - interval '24 days'),
  ('00000000-0000-4000-8000-000000000102', 'Bram', 'Vermeulen', 'bram.owner@groenevingers.test', 'Tuineigenaar', 'Deelt graag zijn ruime tuin met buurtbewoners die willen experimenteren met groenten.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces', false, now() - interval '21 days'),
  ('00000000-0000-4000-8000-000000000103', 'Lotte', 'Peeters', 'lotte.owner@groenevingers.test', 'Tuineigenaar', 'Houdt van bloemen, bessenstruiken en duidelijke afspraken met vaste tuinmomenten.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces', false, now() - interval '19 days'),
  ('00000000-0000-4000-8000-000000000201', 'Noor', 'Janssens', 'noor.gardener@groenevingers.test', 'Tuinzoeker', 'Beginnende tuinier met veel zin om te leren over compost, kruiden en seizoensgroenten.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces', false, now() - interval '18 days'),
  ('00000000-0000-4000-8000-000000000202', 'Milan', 'Claes', 'milan.gardener@groenevingers.test', 'Tuinzoeker', 'Ervaren moestuinier die graag tomaten, courgettes en pompoenen kweekt.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces', true, now() - interval '16 days'),
  ('00000000-0000-4000-8000-000000000203', 'Sara', 'Maes', 'sara.gardener@groenevingers.test', 'Tuinzoeker', 'Zoekt een rustige plek om bloemen te verzorgen en een kleine pluktuin te starten.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces', false, now() - interval '14 days'),
  ('00000000-0000-4000-8000-000000000204', 'Elias', 'Dubois', 'elias.gardener@groenevingers.test', 'Tuinzoeker', 'Werkt graag buiten en helpt met zwaardere klussen zoals snoeien en bedden voorbereiden.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces', false, now() - interval '11 days')
on conflict (id) do update set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  email = excluded.email,
  role = excluded.role,
  description = excluded.description,
  profile_image = excluded.profile_image,
  is_premium = excluded.is_premium;

insert into public.gardens (id, owner_id, name, location, latitude, longitude, image_url, description, appliances, created_at)
values
  ('00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000101', 'Dakterras vol kruiden', 'Gent', 51.0543, 3.7174, 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=900', 'Een zonnig dakterras met verhoogde bakken, ideaal voor basilicum, munt, eetbare bloemen en compacte groenten.', array['water', 'tools', 'compost'], now() - interval '20 days'),
  ('00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000101', 'Binnenkoer met druivelaar', 'Gentbrugge', 51.0367, 3.7588, 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=900', 'Beschutte binnenkoer met een oude druivelaar, veel potten en plaats voor een kleine verticale tuin.', array['water', 'electricity'], now() - interval '18 days'),
  ('00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000102', 'Moestuin achter de schuur', 'Antwerpen', 51.2194, 4.4025, 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=900', 'Ruime lap grond achter een rijhuis met volle zon en genoeg plaats voor aardappelen, pompoen en bonen.', array['water', 'tools', 'greenhouse'], now() - interval '17 days'),
  ('00000000-0000-4000-8000-000000001004', '00000000-0000-4000-8000-000000000102', 'Serre in Berchem', 'Berchem', 51.1919, 4.4322, 'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?w=900', 'Kleine serre met tomatenrekken, regenton en werktafel. Perfect voor iemand die graag zaait en opkweekt.', array['greenhouse', 'water', 'tools', 'electricity'], now() - interval '15 days'),
  ('00000000-0000-4000-8000-000000001005', '00000000-0000-4000-8000-000000000103', 'Pluktuin aan de Dijle', 'Mechelen', 51.0259, 4.4775, 'https://images.unsplash.com/photo-1495908333425-29a1e0918c5f?w=900', 'Bloemrijke tuin met vaste planten, bessenstruiken en vrije ruimte voor een plukhoek.', array['water', 'compost', 'tools'], now() - interval '13 days'),
  ('00000000-0000-4000-8000-000000001006', '00000000-0000-4000-8000-000000000103', 'Rustige schaduwtuin', 'Hofstade', 50.9919, 4.4936, 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=900', 'Groene tuin met volwassen bomen, ideaal voor varens, hosta’s en onderhoud in de koelte.', array['shade', 'water', 'tools'], now() - interval '10 days')
on conflict (id) do update set
  owner_id = excluded.owner_id,
  name = excluded.name,
  location = excluded.location,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  image_url = excluded.image_url,
  description = excluded.description,
  appliances = excluded.appliances;

insert into public.garden_logs (id, garden_id, user_id, title, status, image_url, created_at)
values
  ('00000000-0000-4000-8000-000000002001', '00000000-0000-4000-8000-000000001001', 'Munt en basilicum verpot', '00000000-0000-4000-8000-000000000201', '["completed", "completed", "pending"]', 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=700', now() - interval '9 days'),
  ('00000000-0000-4000-8000-000000002002', '00000000-0000-4000-8000-000000001003', 'Bonenstaken geplaatst', '00000000-0000-4000-8000-000000000202', '["completed", "pending"]', 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=700', now() - interval '7 days'),
  ('00000000-0000-4000-8000-000000002003', '00000000-0000-4000-8000-000000001005', 'Dahlia bed voorbereid', '00000000-0000-4000-8000-000000000203', '["completed", "completed"]', 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=700', now() - interval '5 days'),
  ('00000000-0000-4000-8000-000000002004', '00000000-0000-4000-8000-000000001004', 'Tomaten opgebonden', '00000000-0000-4000-8000-000000000202', '["pending", "pending"]', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=700', now() - interval '3 days')
on conflict (id) do update set
  garden_id = excluded.garden_id,
  user_id = excluded.user_id,
  title = excluded.title,
  status = excluded.status,
  image_url = excluded.image_url;

insert into public.garden_requests (id, garden_id, user_id, motivation, collaboration_type, days, start_date, status, created_at)
values
  ('00000000-0000-4000-8000-000000003001', '00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000201', 'Ik wil graag leren hoe ik kruiden op een kleine oppervlakte kan combineren.', 'Wekelijks onderhoud', array['Maandag', 'Donderdag'], current_date + interval '3 days', 'approved', now() - interval '12 days'),
  ('00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000202', 'Ik heb ervaring met grotere moestuinen en kan helpen met planning en zware klussen.', 'Seizoensmoestuin', array['Woensdag', 'Zaterdag'], current_date + interval '5 days', 'approved', now() - interval '10 days'),
  ('00000000-0000-4000-8000-000000003003', '00000000-0000-4000-8000-000000001005', '00000000-0000-4000-8000-000000000203', 'Een pluktuin lijkt me zalig. Ik wil vooral bloemen zaaien en verzorgen.', 'Bloemen en onderhoud', array['Dinsdag'], current_date + interval '7 days', 'pending', now() - interval '4 days'),
  ('00000000-0000-4000-8000-000000003004', '00000000-0000-4000-8000-000000001006', '00000000-0000-4000-8000-000000000204', 'Ik help graag met snoeien en het vrijmaken van bedden in de schaduwtuin.', 'Eenmalige hulp', array['Vrijdag'], current_date + interval '10 days', 'pending', now() - interval '2 days'),
  ('00000000-0000-4000-8000-000000003005', '00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000203', 'Ik zoek een rustige plek voor potten met eetbare bloemen.', 'Potten en bloemen', array['Zondag'], current_date + interval '14 days', 'rejected', now() - interval '8 days')
on conflict (id) do update set
  garden_id = excluded.garden_id,
  user_id = excluded.user_id,
  motivation = excluded.motivation,
  collaboration_type = excluded.collaboration_type,
  days = excluded.days,
  start_date = excluded.start_date,
  status = excluded.status;

insert into public.collaborations (id, garden_id, gardener_id, owner_id, request_id, status, terms, days, start_date, collaboration_type, ended_at, ended_by, ended_reason, created_at)
values
  ('00000000-0000-4000-8000-000000004001', '00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000003001', 'active', 'Noor komt twee keer per week langs en deelt de kruidenoogst met Anna.', array['Maandag', 'Donderdag'], current_date - interval '6 days', 'Wekelijks onderhoud', null, null, null, now() - interval '11 days'),
  ('00000000-0000-4000-8000-000000004002', '00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000003002', 'ended', 'Milan hielp met de eerste aanleg van de moestuinbedden.', array['Woensdag', 'Zaterdag'], current_date - interval '20 days', 'Seizoensmoestuin', now() - interval '2 days', '00000000-0000-4000-8000-000000000102', 'Voorjaarsaanleg afgerond.', now() - interval '18 days')
on conflict (id) do update set
  garden_id = excluded.garden_id,
  gardener_id = excluded.gardener_id,
  owner_id = excluded.owner_id,
  request_id = excluded.request_id,
  status = excluded.status,
  terms = excluded.terms,
  days = excluded.days,
  start_date = excluded.start_date,
  collaboration_type = excluded.collaboration_type,
  ended_at = excluded.ended_at,
  ended_by = excluded.ended_by,
  ended_reason = excluded.ended_reason;

insert into public.reviews (id, collaboration_id, reviewer_id, target_id, target_type, rating, comment, created_at)
values
  ('00000000-0000-4000-8000-000000005001', '00000000-0000-4000-8000-000000004002', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000202', 'user', 5, 'Milan werkte zelfstandig en liet alles netjes achter.', now() - interval '1 day'),
  ('00000000-0000-4000-8000-000000005002', '00000000-0000-4000-8000-000000004002', '00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', 'user', 4, 'Goede afspraken en fijne tuin om in te werken.', now() - interval '1 day')
on conflict (collaboration_id, reviewer_id) do update set
  target_id = excluded.target_id,
  target_type = excluded.target_type,
  rating = excluded.rating,
  comment = excluded.comment;

insert into public.saved_gardens (id, user_id, garden_id, created_at)
values
  ('00000000-0000-4000-8000-000000006001', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000001004', now() - interval '6 days'),
  ('00000000-0000-4000-8000-000000006002', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000001005', now() - interval '5 days'),
  ('00000000-0000-4000-8000-000000006003', '00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000001001', now() - interval '4 days'),
  ('00000000-0000-4000-8000-000000006004', '00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000001006', now() - interval '3 days')
on conflict (user_id, garden_id) do update set
  created_at = excluded.created_at;

insert into public.conversations (id, user1_id, user2_id, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000007001', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', now() - interval '11 days', now() - interval '1 hours'),
  ('00000000-0000-4000-8000-000000007002', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000202', now() - interval '18 days', now() - interval '3 hours'),
  ('00000000-0000-4000-8000-000000007003', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000203', now() - interval '5 days', now() - interval '1 day')
on conflict (user1_id, user2_id) do update set
  updated_at = excluded.updated_at;

insert into public.messages (id, conversation_id, sender_id, content, created_at)
values
  ('00000000-0000-4000-8000-000000008001', '00000000-0000-4000-8000-000000007001', '00000000-0000-4000-8000-000000000201', 'Dag Anna, ik zag je kruidenterras en dat lijkt me ideaal om te starten.', now() - interval '10 days'),
  ('00000000-0000-4000-8000-000000008002', '00000000-0000-4000-8000-000000007001', '00000000-0000-4000-8000-000000000101', 'Leuk! Donderdagavond past voor mij om alles te tonen.', now() - interval '9 days'),
  ('00000000-0000-4000-8000-000000008003', '00000000-0000-4000-8000-000000007001', '00000000-0000-4000-8000-000000000201', 'Perfect, dan breng ik alvast plantlabels mee.', now() - interval '1 hours'),
  ('00000000-0000-4000-8000-000000008004', '00000000-0000-4000-8000-000000007002', '00000000-0000-4000-8000-000000000102', 'De bedden liggen klaar. Wil je zaterdag starten met bonen en courgettes?', now() - interval '4 days'),
  ('00000000-0000-4000-8000-000000008005', '00000000-0000-4000-8000-000000007002', '00000000-0000-4000-8000-000000000202', 'Ja, ik neem bindtouw en zaden mee.', now() - interval '3 hours'),
  ('00000000-0000-4000-8000-000000008006', '00000000-0000-4000-8000-000000007003', '00000000-0000-4000-8000-000000000203', 'Hoi Lotte, zijn er bloemen die je absoluut wil houden?', now() - interval '2 days'),
  ('00000000-0000-4000-8000-000000008007', '00000000-0000-4000-8000-000000007003', '00000000-0000-4000-8000-000000000103', 'Zeker, de rozen en de salie blijven graag staan.', now() - interval '1 day')
on conflict (id) do update set
  conversation_id = excluded.conversation_id,
  sender_id = excluded.sender_id,
  content = excluded.content,
  created_at = excluded.created_at;

insert into public.notifications (id, user_id, type, title, body, read, related_id, created_at)
values
  ('00000000-0000-4000-8000-000000009001', '00000000-0000-4000-8000-000000000201', 'request_accepted', 'Aanvraag goedgekeurd', 'Anna heeft je aanvraag voor Dakterras vol kruiden goedgekeurd.', false, '00000000-0000-4000-8000-000000003001', now() - interval '11 days'),
  ('00000000-0000-4000-8000-000000009002', '00000000-0000-4000-8000-000000000202', 'request_accepted', 'Je kan starten', 'Bram heeft je aanvraag voor Moestuin achter de schuur goedgekeurd.', true, '00000000-0000-4000-8000-000000003002', now() - interval '9 days'),
  ('00000000-0000-4000-8000-000000009003', '00000000-0000-4000-8000-000000000103', 'request_received', 'Nieuwe aanvraag', 'Sara wil graag helpen in Pluktuin aan de Dijle.', false, '00000000-0000-4000-8000-000000003003', now() - interval '4 days'),
  ('00000000-0000-4000-8000-000000009004', '00000000-0000-4000-8000-000000000101', 'message', 'Nieuw bericht van Noor', 'Perfect, dan breng ik alvast plantlabels mee.', false, '00000000-0000-4000-8000-000000007001', now() - interval '1 hours'),
  ('00000000-0000-4000-8000-000000009005', '00000000-0000-4000-8000-000000000204', 'reminder', 'Tuinmoment vrijdag', 'Vergeet je afspraak voor de schaduwtuin niet te bevestigen.', false, '00000000-0000-4000-8000-000000003004', now() - interval '12 hours')
on conflict (id) do update set
  user_id = excluded.user_id,
  type = excluded.type,
  title = excluded.title,
  body = excluded.body,
  read = excluded.read,
  related_id = excluded.related_id,
  created_at = excluded.created_at;
