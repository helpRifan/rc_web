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
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'Registration Open',
    registration_link TEXT DEFAULT 'https://eventhubcc.vit.ac.in/EventHub/',
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
-- SEED DATA FOR GALLERY & COLLABORATIONS
-- ==============================================================================
INSERT INTO public.collaborations (name, category, description, summary, logo_url, website_url, order_index)
VALUES
    ('Jet Aerospace', 'Aerospace & UAV', 'Collaborating to establish an Innovation Center and Drone Technology Park. We conduct joint R&D projects leveraging their ASSC-accredited framework for UAV prototyping.', 'Provides complete solutions for academics & industries in Aerospace & Aviation. Partners with IHFC (IIT Delhi) for advanced Drone Tech Park infrastructures.', 'https://www.google.com/s2/favicons?domain=jetaero.in&sz=128', 'https://jetaero.in', 1),
    ('Alstruct India', 'Automation & Handling', 'Partnering to develop modular automated assembly lines. Our members utilize their premium aluminium extrusion profiles for high-load robotic chassis and intelligent conveyors.', 'Specializes in material handling and assembly technology products, including precision aluminium extrusions, modular conveyors, and IoT-integrated assembly work stations.', 'https://www.google.com/s2/favicons?domain=alstrut.com&sz=128', 'https://www.alstrut.com', 2),
    ('Unbox Robotics', 'Supply Chain Systems', 'Exploring next-generation robotics-based fulfillment. We collaborate on optimizing algorithms for rapid parcel sortation and express logistics using swarm intelligence.', 'Leading supply chain robotics technology company accelerating parcel sortation and order fulfillment for massive e-commerce, retail, and logistics enterprises.', 'https://www.google.com/s2/favicons?domain=unboxrobotics.com&sz=128', 'https://www.unboxrobotics.com', 3),
    ('Prag Robotics', 'Industrial Education', 'Bridging the gap between our student engineers and the industry through the ''T-bridge'' platform, focusing on seamless techno-education and process enhancement solutions.', 'Offers unique ''T-bridge'' learning platform blending techno-education for academia with advanced process enhancement robotic solutions for industrial manufacturing.', 'https://www.google.com/s2/favicons?domain=pragrobotics.com&sz=128', 'https://pragrobotics.com', 4),
    ('EPR LABS', 'Power Electronics', 'Executing joint research in advanced power electronics, STATCOM systems, and harmonic filtering to solve challenging hardware power-draw problems in our autonomous vehicles.', 'High-tech power electronics specialists designing and manufacturing heavy industrial electronic systems, including STATCOM and complex harmonic filtering solutions.', 'https://www.google.com/s2/favicons?domain=eprlabs.com&sz=128', 'https://eprlabs.com', 5),
    ('Tezznova', 'Applied Robotics', 'Engaging in continuous R&D with their expert teams to prototype and test novel artificial intelligence architectures designed for robust industrial integration.', 'Innovates customized products for industrial and domestic purposes, driving forward extreme energy efficiency, reliability, and modern applied Artificial Intelligence.', 'https://www.google.com/s2/favicons?domain=tezznova.com&sz=128', 'https://tezznova.com', 6),
    ('L&T Technology Services', 'Engineering & R&D', 'Gaining critical exposure to global ER&D standards. Our students participate in knowledge-sharing sessions focused on smart manufacturing and autonomous welding innovations.', 'Global leader in Engineering and R&D (ER&D) services, innovating across smart manufacturing, digitalization, and deep-tech aerospace solutions with 1000+ patents.', 'https://www.google.com/s2/favicons?domain=ltts.com&sz=128', 'https://www.ltts.com', 7),
    ('PepsiCo', 'FMCG Automation', 'Analyzing large-scale automated manufacturing operations. We study their sustainability tech and supply-chain efficiency to inform our own large-scale automation projects.', 'Global food beverage industry leader implementing state-of-the-art FMCG automation, sustainability practices, and advanced precision supply-chain mechanics.', 'https://www.google.com/s2/favicons?domain=pepsico.com&sz=128', 'https://www.pepsico.com', 8)
ON CONFLICT DO NOTHING;
