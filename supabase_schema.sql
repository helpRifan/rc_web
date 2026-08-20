-- ==============================================================================
-- VIT CHENNAI ROBOTICS CLUB - SUPABASE DATABASE SCHEMA
-- Schema aligned with existing tables + creation of missing tables (gallery, collaborations, form_submissions)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TABLE: members (Ensures all fields match)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    department_id TEXT NOT NULL,
    subsystem TEXT,
    email TEXT,
    github TEXT,
    linkedin TEXT,
    instagram TEXT,
    bio TEXT,
    image_url TEXT,
    is_core BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. TABLE: events
-- ==============================================================================
DROP TABLE IF EXISTS public.events CASCADE;

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT, -- e.g. for archive categories
    date TEXT,
    description TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'Upcoming',
    registration_link TEXT,
    stage TEXT NOT NULL DEFAULT 'upcoming' CHECK (stage IN ('upcoming', 'completed')),
    year TEXT,
    link TEXT, -- External link (e.g., Google Photos gallery)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABLE: certificates
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_id TEXT UNIQUE NOT NULL,
    year TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    event_name TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_lookup ON public.certificates(year, roll_number);

-- ==============================================================================
-- 4. TABLE: gallery (Create if missing)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Competition', 'R&D', 'Workshop', 'Outreach'
    image_url TEXT NOT NULL,
    description TEXT,
    year TEXT DEFAULT '2024',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABLE: collaborations (Create if missing)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    summary TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABLE: form_submissions (Create if missing)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_type TEXT DEFAULT 'recruitment', -- 'recruitment', 'contact', 'sponsorship'
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    roll_number TEXT,
    department_preference TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'contacted', 'rejected'
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public Read Members" ON public.members;
CREATE POLICY "Public Read Members" ON public.members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Events" ON public.events;
CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth Insert Events" ON public.events;
CREATE POLICY "Auth Insert Events" ON public.events FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth Update Events" ON public.events;
CREATE POLICY "Auth Update Events" ON public.events FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth Delete Events" ON public.events;
CREATE POLICY "Auth Delete Events" ON public.events FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Public Read Certificates" ON public.certificates;
CREATE POLICY "Public Read Certificates" ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Gallery" ON public.gallery;
CREATE POLICY "Public Read Gallery" ON public.gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Collaborations" ON public.collaborations;
CREATE POLICY "Public Read Collaborations" ON public.collaborations FOR SELECT USING (true);

-- Form Submissions Policies
DROP POLICY IF EXISTS "Public Insert Form Submissions" ON public.form_submissions;
CREATE POLICY "Public Insert Form Submissions" ON public.form_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Read Form Submissions" ON public.form_submissions;
CREATE POLICY "Admin Read Form Submissions" ON public.form_submissions FOR SELECT TO authenticated USING (true);

-- ==============================================================================
-- SEED DATA FOR EVENTS
-- ==============================================================================
INSERT INTO public.events (title, category, date, description, image_url, status, stage, registration_link)
VALUES
    ('Roborace', 'Roborace', 'Technovit26''', 'High-velocity autonomous and remote-controlled robotic sprint across specialized obstacle chicanes, steep banked turns, and precision track sections.', '/gallery/8.jpg', 'Upcoming', 'upcoming', 'https://eventhubcc.vit.ac.in/EventHub/'),
    ('Line Follower', 'Autonomous', 'Technovit26''', 'Autonomous navigation battle testing high-speed infrared optical arrays, PID algorithmic loop convergence, and micro-second path tracking precision.', '/gallery/7.jpg', 'Upcoming', 'upcoming', 'https://eventhubcc.vit.ac.in/EventHub/'),
    ('Robosoccer', 'Combat & Sports', 'Technovit26''', 'Dynamic robotic soccer showdown featuring custom pneumatic kicking levers, omni-directional drive bases, and tactical ball control in the campus arena.', '/gallery/3.jpg', 'Upcoming', 'upcoming', 'https://eventhubcc.vit.ac.in/EventHub/'),
    ('Obstacle Course', 'All-Terrain', 'Technovit26''', 'Extreme terrain traversal challenge requiring rugged suspension kinematics, bridge balancing, trench navigation, and precision pilot control under time trials.', '/gallery/2.jpg', 'Upcoming', 'upcoming', 'https://eventhubcc.vit.ac.in/EventHub/'),
    ('Robosumo', 'Robowars & Sumo', 'Technovit26''', 'High-torque robotic wrestling clash where reinforced combat bots maneuver, counter-leverage, and forcefully eject opponents outside the ring perimeter.', '/gallery/4.jpg', 'Upcoming', 'upcoming', 'https://eventhubcc.vit.ac.in/EventHub/')
ON CONFLICT DO NOTHING;

