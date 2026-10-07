-- The launch roster (inventory 2.3, spec 7.3, plan Task 16), for production at cutover: the
-- members' first names and roles as the old site showed them, all unpublished (an admin publishes
-- them by hand for launch, team brief 8), plus the faculty coordinator, published with VIT's own
-- photo and profile link.
--
-- The member import (scripts/import-members.ts) later fills these rows in from the Google Form,
-- matching them by first name and role and keeping their slugs, so shared links keep working.
--
-- The same rows are in supabase/dev/fixtures.sql for rcweb-dev. Idempotent: running it again never
-- overwrites a row that the import or an admin has changed.
insert into public.members (slug, full_name, role_title, level, division, photo_url, portfolio_url, sort_order, is_published) values
  ('arockia-selvakumar', 'Dr. Arockia Selvakumar', 'Faculty Coordinator', 'faculty', 'none', 'https://ik.imagekit.io/Rifan/robotics-club/faculty/fc.jpg', 'https://chennai.vit.ac.in/member/dr-arockia-selvakumar/', 0, true),
  ('ihsan', 'Ihsan', 'Vice-Chair', 'board', 'none', null, null, 10, false),
  ('grace', 'Grace', 'Secretary', 'board', 'none', null, null, 20, false),
  ('vinayak', 'Vinayak', 'Co-Secretary', 'board', 'none', null, null, 30, false),
  ('karthik', 'Karthik', 'Projects Head', 'head', 'projects', null, null, 40, false),
  ('akshaj', 'Akshaj', 'Projects Lead', 'lead', 'projects', null, null, 50, false),
  ('tarun', 'Tarun', 'Projects Lead', 'lead', 'projects', null, null, 60, false),
  ('pranjal', 'Pranjal', 'Technical Head', 'head', 'webdev', null, null, 70, false),
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
