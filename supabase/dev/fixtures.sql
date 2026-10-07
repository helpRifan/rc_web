-- rcweb-dev only (never a migration, never production). The same real content as
-- src/lib/data/fixtures.ts, so pages read the same rows once the secret key is in .env.local.
-- Events and photos are published here so dev pages render. Gallery captions are DRAFTS for owner
-- approval. Roster members stay unpublished, as spec 7.3 says. Idempotent.

insert into public.events (id, slug, title, status, series, is_published) values
  ('00000000-0000-4000-8000-000000000001', 'line-follower', 'Line Follower', 'completed', 'TechnoVIT ''26', true),
  ('00000000-0000-4000-8000-000000000002', 'obstacle-race', 'Obstacle Race', 'completed', 'TechnoVIT ''26', true),
  ('00000000-0000-4000-8000-000000000003', 'robo-race', 'Robo Race', 'completed', 'TechnoVIT ''26', true),
  ('00000000-0000-4000-8000-000000000004', 'robo-soccer', 'Robo Soccer', 'completed', 'TechnoVIT ''26', true),
  ('00000000-0000-4000-8000-000000000005', 'robo-sumo', 'Robo Sumo', 'completed', 'TechnoVIT ''26', true)
on conflict (id) do nothing;

insert into public.gallery_items (id, image_url, caption, sort_order, width, height, is_published) values
  ('00000000-0000-4000-9000-000000000001', 'https://ik.imagekit.io/Rifan/robotics-club/gallery/10.jpg', 'Club group photo on the steps, with the core team in club polos at the front.', 1, 1600, 1200, true),
  ('00000000-0000-4000-9000-000000000002', 'https://ik.imagekit.io/Rifan/robotics-club/gallery/5.jpg', 'Students soldering at an outdoor workbench.', 2, 1280, 853, true),
  ('00000000-0000-4000-9000-000000000003', 'https://ik.imagekit.io/Rifan/robotics-club/gallery/2.jpg', 'Workshop group photo, each student holding a small robot car.', 3, 1280, 720, true),
  ('00000000-0000-4000-9000-000000000004', 'https://ik.imagekit.io/Rifan/robotics-club/gallery/3.jpg', 'ROBOTICA-25, Otomatiks'' national inter-school robotics competition, at VIT Chennai in February 2025.', 4, 1600, 1066, true),
  ('00000000-0000-4000-9000-000000000005', 'https://ik.imagekit.io/Rifan/robotics-club/gallery/9.jpg', 'Prize-giving on stage, with trophies.', 5, 1600, 1066, true),
  ('00000000-0000-4000-9000-000000000006', 'https://ik.imagekit.io/Rifan/robotics-club/gallery/7.jpg', 'A build at night: an RC transmitter, a controller board and a small robot arm.', 6, 1200, 1600, true),
  ('00000000-0000-4000-9000-000000000007', 'https://ik.imagekit.io/Rifan/robotics-club/gallery/6.jpg?tr=cm-extract,x-0,y-250,w-589,h-780', 'A packed computer-lab session.', 7, 589, 780, true),
  ('00000000-0000-4000-9000-000000000008', 'https://ik.imagekit.io/Rifan/robotics-club/gallery/8.jpg', 'An electronics trainer kit and a multimeter.', 8, 1600, 1066, true),
  ('00000000-0000-4000-9000-000000000009', 'https://ik.imagekit.io/Rifan/robotics-club/gallery/1.jpg', 'Group photo at the RIACT ''26 conference in a VIT Chennai auditorium.', 9, 1280, 576, true)
on conflict (id) do nothing;

insert into public.members (slug, full_name, role_title, level, division, photo_url, portfolio_url, sort_order, is_published) values
  ('arockia-selvakumar', 'Dr. Arockia Selvakumar', 'Faculty Coordinator', 'faculty', 'none', 'https://ik.imagekit.io/Rifan/robotics-club/faculty/fc.jpg', 'https://chennai.vit.ac.in/member/dr-arockia-selvakumar/', 0, true),
  ('ihsan', 'Ihsan', 'Vice-Chair', 'board', 'none', null, null, 10, false),
  ('grace', 'Grace', 'Secretary', 'board', 'none', null, null, 20, false),
  ('vinayak', 'Vinayak', 'Co-Secretary', 'board', 'none', null, null, 30, false),
  ('karthik', 'Karthik', 'Projects Head', 'head', 'projects', null, null, 40, false),
  ('akshaj', 'Akshaj', 'Projects Lead', 'lead', 'projects', null, null, 50, false),
  ('tarun', 'Tarun', 'Projects Lead', 'lead', 'projects', null, null, 60, false),
  ('pranjal', 'Pranjal', 'Technical Head', 'head', 'webdev', null, null, 70, false),
  ('rifan', 'Rifan', 'Web Dev Lead', 'lead', 'webdev', null, null, 75, false),
  ('aurka', 'Aurka', 'Teaching Lead', 'lead', 'teaching', null, null, 80, false),
  ('basil', 'Basil', 'Design / Creative Head', 'head', 'media', null, null, 90, false),
  ('leni', 'Leni', 'Design / Creative Lead', 'lead', 'media', null, null, 100, false),
  ('goutham', 'Goutham', 'Management Head', 'head', 'operations', null, null, 110, false),
  ('akshita', 'Akshita', 'Management Lead', 'lead', 'operations', null, null, 120, false),
  ('aditya', 'Aditya', 'Management Lead', 'lead', 'operations', null, null, 130, false),
  ('gurudeep', 'Gurudeep', 'Outreach Head', 'head', 'marketing', null, null, 140, false),
  ('madhava', 'Madhava', 'Outreach Lead', 'lead', 'marketing', null, null, 150, false),
  ('ashton', 'Ashton', 'Publicity Head', 'head', 'marketing', null, null, 160, false),
  ('daksh', 'Daksh', 'Publicity Lead', 'lead', 'marketing', null, null, 170, false)
on conflict (slug) do nothing;

-- The faculty coordinator's profile (owner's update, 2026-10-08), from his VIT Faculty Directory
-- page. The same text as FACULTY in src/lib/site.ts, which also holds his longer message.
update public.members set
  full_name = 'Dr. Arockia Selvakumar Arockia Doss',
  degree = 'PhD in Mechanical Engineering (robotic manipulator design), MIT Campus, Anna University, Chennai',
  tags = array['Robotics and automation', 'CAD/CAM/CAE'],
  about = 'Professor at VIT Chennai. His PhD, at MIT Campus, Anna University, was on robotic manipulator design, and his specialisations are robotics and automation, and CAD/CAM/CAE.',
  portfolio_url = 'https://directorycc.vit.ac.in/faculty/50444-dr-arockia-selvakumar'
where slug = 'arockia-selvakumar';
