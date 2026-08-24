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
-- 4. TABLE: gallery (Create if missing or alter)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT, -- e.g. 'Embedded Systems', 'R&D Lab'
    category TEXT, -- 'Competition', 'R&D', 'Workshop', 'Outreach'
    image_url TEXT NOT NULL,
    story TEXT,    -- Full details narrative shown in 'View Project Details' modal
    description TEXT,
    year TEXT DEFAULT '2025',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was previously created with older schema
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS story TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

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
-- 7. TABLE: admins (For dynamic admin access delegation)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'Club Admin',
    added_by TEXT DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was previously created with older schema
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Club Admin';
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS added_by TEXT DEFAULT 'System';

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

DROP POLICY IF EXISTS "Auth Insert Gallery" ON public.gallery;
CREATE POLICY "Auth Insert Gallery" ON public.gallery FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth Update Gallery" ON public.gallery;
CREATE POLICY "Auth Update Gallery" ON public.gallery FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth Delete Gallery" ON public.gallery;
CREATE POLICY "Auth Delete Gallery" ON public.gallery FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Public Read Collaborations" ON public.collaborations;
CREATE POLICY "Public Read Collaborations" ON public.collaborations FOR SELECT USING (true);

-- Admins Table Policies
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Admins" ON public.admins;
CREATE POLICY "Public Read Admins" ON public.admins FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth Insert Admins" ON public.admins;
CREATE POLICY "Auth Insert Admins" ON public.admins FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth Update Admins" ON public.admins;
CREATE POLICY "Auth Update Admins" ON public.admins FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth Delete Admins" ON public.admins;
CREATE POLICY "Auth Delete Admins" ON public.admins FOR DELETE TO authenticated USING (true);

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

-- ==============================================================================
-- SEED DATA FOR GALLERY (OPERATIONS RECAP HIGHLIGHTS)
-- ==============================================================================
INSERT INTO public.gallery (title, subtitle, category, image_url, story, description, order_index)
VALUES
    ('Technical Seminar', 'Embedded Systems', 'Workshop', '/gallery/1.jpg', 'Our senior design leads host bi-weekly open seminar sessions for junior members. In this specific session, we walked through the implementation of real-time operating systems (FreeRTOS) on STM32 microcontrollers.', 'Technical Seminar on Embedded Systems', 1),
    ('Chassis Optimization Test', 'R&D Lab', 'R&D', '/gallery/2.jpg', 'Late night testing in the R&D Lab. Here, the mechanical team is measuring torsional rigidity and load distribution across a new lightweight aluminum chassis design intended for our autonomous rover project.', 'Chassis Optimization Test in R&D Lab', 2),
    ('Team Collaboration Meeting', 'ERC 24-25 Setup', 'Competition', '/gallery/3.jpg', 'Preparation for the European Rover Challenge (ERC). This was a critical sprint planning meeting where the software, hardware, and management divisions aligned their timelines.', 'Team Collaboration Meeting for ERC 24-25', 3),
    ('Robotic Arm Testing', 'Sensor Integration', 'R&D', '/gallery/4.jpg', 'A major milestone was achieved when we successfully calibrated our 6-axis robotic manipulator using custom inverse kinematics algorithms.', 'Robotic Arm Testing and Sensor Integration', 4),
    ('Lecture Audiences', 'Automata Keynote', 'Outreach', '/gallery/5.jpg', 'We frequently invite industry professionals and alumni to present at our organized events. During the ''Automata Keynote'', guest speakers discussed the future of reinforcement learning.', 'Automata Keynote lecture audiences', 5),
    ('Auditorium Presentations', 'Symposium Showcase', 'Outreach', '/gallery/6.jpg', 'The culmination of a semester''s worth of hard work. Our core teams presented their functional prototypes on the big stage during the annual tech symposium.', 'Auditorium Presentations during Symposium Showcase', 6),
    ('Precision Soldering', 'Circuit Assembly', 'Workshop', '/gallery/7.jpg', 'Detailed surface-mount component soldering for our custom motor driver circuits. High precision is required to ensure signal integrity across the dual-layer PCBs.', 'Precision Soldering and Circuit Assembly', 7),
    ('Drone Flight Tests', 'Aerodynamics', 'R&D', '/gallery/8.jpg', 'Outdoor field testing of our autonomous quadcopter fleet. We rigorously verified the visual-inertial odometry algorithms under heavy wind conditions.', 'Drone Flight Tests and Aerodynamics', 8),
    ('Software Deployment', 'Neural Networks', 'R&D', '/gallery/9.jpg', 'Deploying a lightweight YOLOv8 model directly onto the edge compute modules of our navigation rovers for real-time obstacle detection.', 'Software Deployment with Neural Networks', 9),
    ('Final Assembly Line', 'Integration Phase', 'Competition', '/gallery/10.jpg', 'The exciting final integration phase where the carbon fiber frame meets the electrical harness and the primary compute stack is powered on for the first time.', 'Final Assembly Line during Integration Phase', 10)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- SEED DATA FOR ADMINS (CORE CLUB LEADERSHIP)
-- ==============================================================================
INSERT INTO public.admins (email, name, role, added_by)
VALUES
    ('mohamed.rifanajmal2025@vitstudent.ac.in', 'Mohamed Rifan Ajmal', 'Lead Developer & Admin', 'System Core'),
    ('rifanajmal@gmail.com', 'Rifan Ajmal', 'System Superadmin', 'System Core'),
    ('ihsan.hashir2024@vitstudent.ac.in', 'Ihsan Hashir', 'President / Core Leadership', 'System Core'),
    ('aditya.kumarsahu2025@vitstudent.ac.in', 'Aditya Kumar Sahu', 'Core Leadership', 'System Core'),
    ('robotics.club@vit.ac.in', 'Robotics Club Official', 'Club Mailbox', 'System Core')
ON CONFLICT (email) DO NOTHING;


