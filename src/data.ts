import { Member, DeploymentEvent, ArchiveItem } from "./types";

export const CLUB_MEMBERS: Member[] = [
  // BOARD
  {
    name: "Ihsan",
    role: "Vice-Chair",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
    email: "ihsan.2023@vitstudent.ac.in",
    github: "github.com/ihsan-robotics",
    bio: "Vice-Chair steering club governance, technical roadmaps, and multi-disciplinary autonomous systems.",
    instagram: "instagram.com/ihsan_robotics",
    department: "Projects",
    departmentId: "projects",
    subsystem: "Executive Leadership"
  },
  {
    name: "Grace",
    role: "Secretary",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
    email: "grace.2023@vitstudent.ac.in",
    github: "github.com/grace-operations",
    bio: "Secretary managing administrative operations, institutional coordination, and club documentation.",
    instagram: "instagram.com/grace_operations",
    department: "Operations",
    departmentId: "operations",
    subsystem: "Executive Administration"
  },
  {
    name: "Vinayak",
    role: "Co-Secretary",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    email: "vinayak.2023@vitstudent.ac.in",
    github: "github.com/vinayak-ops",
    bio: "Co-Secretary coordinating executive records, event compliances, and inter-departmental logistics.",
    instagram: "instagram.com/vinayak_ops",
    department: "Operations",
    departmentId: "operations",
    subsystem: "Executive Operations"
  },

  // CORE HEADS & LEADS
  {
    name: "Pranjal",
    role: "Technical Head",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    email: "pranjal.2023@vitstudent.ac.in",
    github: "github.com/pranjal-tech",
    bio: "Technical Head leading software infrastructure, telemetry pipelines, and computational architecture.",
    instagram: "instagram.com/pranjal_tech",
    department: "Web Dev",
    departmentId: "webdev",
    subsystem: "Full-Stack & Systems"
  },
  {
    name: "Aurka",
    role: "Teaching Lead",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    email: "aurka.2023@vitstudent.ac.in",
    github: "github.com/aurka-teaching",
    bio: "Teaching Lead heading hands-on workshops, technical curricula, and embedded systems mentorship.",
    instagram: "instagram.com/aurka_teaching",
    department: "Teaching",
    departmentId: "teaching",
    subsystem: "Curriculum & Mentorship"
  },
  {
    name: "Karthik",
    role: "Projects Head",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300",
    email: "karthik.2023@vitstudent.ac.in",
    github: "github.com/karthik-projects",
    bio: "Projects Head leading autonomous robotic platforms, kinematics modeling, and hardware prototyping.",
    instagram: "instagram.com/karthik_projects",
    department: "Projects",
    departmentId: "projects",
    subsystem: "R&D & Robotics"
  },
  {
    name: "Akshaj",
    role: "Projects Lead",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300",
    email: "akshaj.2023@vitstudent.ac.in",
    github: "github.com/akshaj-mech",
    bio: "Projects Lead directing mechanical CAD modeling, chassis fabrication, and robotic arm kinematics.",
    instagram: "instagram.com/akshaj_mech",
    department: "Projects",
    departmentId: "projects",
    subsystem: "Structures & Kinematics"
  },
  {
    name: "Tarun",
    role: "Projects Lead",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=300",
    email: "tarun.2023@vitstudent.ac.in",
    github: "github.com/tarun-embedded",
    bio: "Projects Lead heading embedded electronics, sensor integration, and motor driver architectures.",
    instagram: "instagram.com/tarun_embedded",
    department: "Projects",
    departmentId: "projects",
    subsystem: "Embedded Systems & PCB"
  },
  {
    name: "Basil",
    role: "Design / Creative Head",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300",
    email: "basil.2023@vitstudent.ac.in",
    github: "github.com/basil-design",
    bio: "Design & Creative Head shaping the club's visual branding, 3D CAD renders, and UI/UX design systems.",
    instagram: "instagram.com/basil_creative",
    department: "Media and Design",
    departmentId: "media",
    subsystem: "3D CAD & Creative Direction"
  },
  {
    name: "Leni",
    role: "Design / Creative Lead",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    email: "leni.2023@vitstudent.ac.in",
    github: "github.com/leni-creative",
    bio: "Design & Creative Lead crafting digital media, symposium trailers, and promotional design assets.",
    instagram: "instagram.com/leni_creative",
    department: "Media and Design",
    departmentId: "media",
    subsystem: "UI/UX & Visual Media"
  },
  {
    name: "Gurudeep",
    role: "Outreach Head",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
    email: "gurudeep.2023@vitstudent.ac.in",
    github: "github.com/gurudeep-outreach",
    bio: "Outreach Head spearheading corporate sponsorships, external partnerships, and industrial linkages.",
    instagram: "instagram.com/gurudeep_outreach",
    department: "Marketing and Sponsorship",
    departmentId: "marketing",
    subsystem: "Corporate Sponsorships"
  },
  {
    name: "Madhava",
    role: "Outreach Lead",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300",
    email: "madhava.2023@vitstudent.ac.in",
    github: "github.com/madhava-outreach",
    bio: "Outreach Lead fostering collaborative alliances with academic institutions and robotics consortiums.",
    instagram: "instagram.com/madhava_outreach",
    department: "Marketing and Sponsorship",
    departmentId: "marketing",
    subsystem: "Industrial Alliances"
  },
  {
    name: "Goutham",
    role: "Management Head",
    image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&q=80&w=300",
    email: "goutham.2023@vitstudent.ac.in",
    github: "github.com/goutham-ops",
    bio: "Management Head orchestrating symposium operations, resource pipelines, and cross-team workflows.",
    instagram: "instagram.com/goutham_ops",
    department: "Operations",
    departmentId: "operations",
    subsystem: "Operations & Sprint Management"
  },
  {
    name: "Akshita",
    role: "Management Lead",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    email: "akshita.2023@vitstudent.ac.in",
    github: "github.com/akshita-ops",
    bio: "Management Lead coordinating venue logistics, event schedules, and team synchronization.",
    instagram: "instagram.com/akshita_ops",
    department: "Operations",
    departmentId: "operations",
    subsystem: "Event Coordination"
  },
  {
    name: "Aditya",
    role: "Management Lead",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300",
    email: "aditya.2023@vitstudent.ac.in",
    github: "github.com/aditya-ops",
    bio: "Management Lead managing inventory tracking, lab equipment allocations, and internal logistics.",
    instagram: "instagram.com/aditya_ops",
    department: "Operations",
    departmentId: "operations",
    subsystem: "Supply Chain & Lab Logistics"
  },
  {
    name: "Ashton",
    role: "Publicity Head",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300",
    email: "ashton.2023@vitstudent.ac.in",
    github: "github.com/ashton-publicity",
    bio: "Publicity Head directing high-impact campus campaigns, social media growth, and event promotions.",
    instagram: "instagram.com/ashton_publicity",
    department: "Marketing and Sponsorship",
    departmentId: "marketing",
    subsystem: "Campaign Strategy & PR"
  },
  {
    name: "Daksh",
    role: "Publicity Lead",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
    email: "daksh.2023@vitstudent.ac.in",
    github: "github.com/daksh-publicity",
    bio: "Publicity Lead driving engagement initiatives, community broadcasts, and student relations.",
    instagram: "instagram.com/daksh_publicity",
    department: "Marketing and Sponsorship",
    departmentId: "marketing",
    subsystem: "Community Outreach & Media"
  }
];

export const UPCOMING_EVENTS: DeploymentEvent[] = [
  {
    title: "Advanced Kinematics",
    type: "Workshop",
    date: "14.10.24",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=500",
    desc: "Hands-on session detailing inverse kinematics for 6-DOF industrial robotic manipulators. Highly recommended for mechanics enthusiasts.",
    status: "Registration Open"
  },
  {
    title: "AI in Automation",
    type: "Guest Lecture",
    date: "22.10.24",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=500",
    desc: "Industry expert talk on integrating convolutional neural networks with legacy programmable logic control (PLC) hardware suites.",
    status: "Registration Open"
  },
  {
    title: "RoboClash 2024",
    type: "Competition",
    date: "05.11.24",
    image: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&q=80&w=500",
    desc: "Annual autonomous combat robotics tournament on the custom reinforced campus arena. Prepare your chassis for high-impact trials.",
    status: "Coming Soon"
  }
];

export const ARCHIVE_RECAPS: ArchiveItem[] = [
  {
    title: "Drone Dynamics Challenge",
    category: "Competition Recap",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=500",
    desc: "Team VITC secured 1st place with an innovative swarm-logic algorithm for decentralized autonomous navigation."
  },
  {
    title: "PCB Design Basics",
    category: "Workshop Recap",
    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=500",
    desc: "Introduction to double-layer routing, high-frequency signals, ground planes layout, and manufacturing prep."
  },
  {
    title: "Arm Manipulator V2",
    category: "Project Spotlight",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=500",
    desc: "Deploying standard 6-axis hardware manipulators with sub-millimeter repeatable grasping kinematics."
  },
  {
    title: "Automata '23 Exhibition",
    category: "Symposium Recap",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=500",
    desc: "VITC team projects demonstrate dynamic balance controllers and spatial mapping sensors to high acclaim."
  }
];

export const GALLERY_ITEMS = [
  {
    id: 1,
    title: "Technical Seminar",
    subtitle: "Embedded Systems",
    image: "/gallery/1.jpg",
    story: "Our senior design leads host bi-weekly open seminar sessions for junior members. In this specific session, we walked through the implementation of real-time operating systems (FreeRTOS) on STM32 microcontrollers."
  },
  {
    id: 2,
    title: "Chassis Optimization Test",
    subtitle: "R&D Lab",
    image: "/gallery/2.jpg",
    story: "Late night testing in the R&D Lab. Here, the mechanical team is measuring torsional rigidity and load distribution across a new lightweight aluminum chassis design intended for our autonomous rover project."
  },
  {
    id: 3,
    title: "Team Collaboration Meeting",
    subtitle: "ERC 24-25 Setup",
    image: "/gallery/3.jpg",
    story: "Preparation for the European Rover Challenge (ERC). This was a critical sprint planning meeting where the software, hardware, and management divisions aligned their timelines."
  },
  {
    id: 4,
    title: "Robotic Arm Testing",
    subtitle: "Sensor Integration",
    image: "/gallery/4.jpg",
    story: "A major milestone was achieved when we successfully calibrated our 6-axis robotic manipulator using custom inverse kinematics algorithms."
  },
  {
    id: 5,
    title: "Lecture Audiences",
    subtitle: "Automata Keynote",
    image: "/gallery/5.jpg",
    story: "We frequently invite industry professionals and alumni to present at our organized events. During the 'Automata Keynote', guest speakers discussed the future of reinforcement learning."
  },
  {
    id: 6,
    title: "Auditorium Presentations",
    subtitle: "Symposium Showcase",
    image: "/gallery/6.jpg",
    story: "The culmination of a semester's worth of hard work. Our core teams presented their functional prototypes on the big stage during the annual tech symposium."
  },
  {
    id: 7,
    title: "Precision Soldering",
    subtitle: "Circuit Assembly",
    image: "/gallery/7.jpg",
    story: "Detailed surface-mount component soldering for our custom motor driver circuits. High precision is required to ensure signal integrity across the dual-layer PCBs."
  },
  {
    id: 8,
    title: "Drone Flight Tests",
    subtitle: "Aerodynamics",
    image: "/gallery/8.jpg",
    story: "Outdoor field testing of our autonomous quadcopter fleet. We rigorously verified the visual-inertial odometry algorithms under heavy wind conditions."
  },
  {
    id: 9,
    title: "Software Deployment",
    subtitle: "Neural Networks",
    image: "/gallery/9.jpg",
    story: "Deploying a lightweight YOLOv8 model directly onto the edge compute modules of our navigation rovers for real-time obstacle detection."
  },
  {
    id: 10,
    title: "Final Assembly Line",
    subtitle: "Integration Phase",
    image: "/gallery/10.jpg",
    story: "The exciting final integration phase where the carbon fiber frame meets the electrical harness and the primary compute stack is powered on for the first time."
  }
];

export const DIVISIONAL_MEMBERS: Member[] = [
  // PROJECTS
  {
    name: "Karthik",
    role: "Projects Head",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300",
    email: "karthik.2023@vitstudent.ac.in",
    github: "github.com/karthik-projects",
    bio: "Autonomous robotics specialist leading mechanical kinematics, chassis dynamics, and heavy-payload arm prototypes.",
    department: "Projects",
    subsystem: "Robotics & Hardware",
    linkedin: "linkedin.com/in/karthik-projects",
    instagram: "instagram.com/karthik_projects"
  },
  {
    name: "Akshaj",
    role: "Projects Lead",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300",
    email: "akshaj.2023@vitstudent.ac.in",
    github: "github.com/akshaj-mech",
    bio: "CAD optimization engineer specializing in autonomous rover suspension systems and rigid finite element analysis.",
    department: "Projects",
    subsystem: "Structures & Kinematics",
    linkedin: "linkedin.com/in/akshaj-mech",
    instagram: "instagram.com/akshaj_mech"
  },
  {
    name: "Tarun",
    role: "Projects Lead",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=300",
    email: "tarun.2023@vitstudent.ac.in",
    github: "github.com/tarun-embedded",
    bio: "High-speed board routing and power delivery specialist. Optimizes motor controllers and sensor communication buses.",
    department: "Projects",
    subsystem: "Embedded Systems & PCB",
    linkedin: "linkedin.com/in/tarun-embedded",
    instagram: "instagram.com/tarun_embedded"
  },
  {
    name: "Ihsan",
    role: "Vice-Chair",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
    email: "ihsan.2023@vitstudent.ac.in",
    github: "github.com/ihsan-robotics",
    bio: "Steers high-level system architecture, rover autonomous navigation loops, and cross-division engineering pipelines.",
    department: "Projects",
    subsystem: "System Architecture",
    linkedin: "linkedin.com/in/ihsan-robotics",
    instagram: "instagram.com/ihsan_robotics"
  },

  // TEACHING
  {
    name: "Aurka",
    role: "Teaching Lead",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    email: "aurka.2023@vitstudent.ac.in",
    github: "github.com/aurka-teaching",
    bio: "Directs technical pedagogy, hands-on micro-controller bootcamps, and robotics training curriculum for junior cohorts.",
    department: "Teaching",
    subsystem: "Curriculum & Mentorship",
    linkedin: "linkedin.com/in/aurka-teaching",
    instagram: "instagram.com/aurka_teaching"
  },

  // WEB DEV
  {
    name: "Pranjal",
    role: "Technical Head",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    email: "pranjal.2023@vitstudent.ac.in",
    github: "github.com/pranjal-tech",
    bio: "Full-stack engineer directing club web architecture, high-frequency telemetry dashboards, and cloud backend APIs.",
    department: "Web Dev",
    subsystem: "Full-Stack & Systems",
    linkedin: "linkedin.com/in/pranjal-tech",
    instagram: "instagram.com/pranjal_tech"
  },

  // MEDIA AND DESIGN
  {
    name: "Basil",
    role: "Design / Creative Head",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300",
    email: "basil.2023@vitstudent.ac.in",
    github: "github.com/basil-design",
    bio: "Directs visual brand language, 3D CAD visualization, and immersive media assets for club symposia and competitions.",
    department: "Media and Design",
    subsystem: "3D CAD & Creative Direction",
    linkedin: "linkedin.com/in/basil-design",
    instagram: "instagram.com/basil_creative"
  },
  {
    name: "Leni",
    role: "Design / Creative Lead",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    email: "leni.2023@vitstudent.ac.in",
    github: "github.com/leni-creative",
    bio: "Designs digital interfaces, video teasers, and promotional graphics to translate engineering achievements into engaging media.",
    department: "Media and Design",
    subsystem: "UI/UX & Visual Media",
    linkedin: "linkedin.com/in/leni-creative",
    instagram: "instagram.com/leni_creative"
  },

  // OPERATIONS
  {
    name: "Goutham",
    role: "Management Head",
    image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&q=80&w=300",
    email: "goutham.2023@vitstudent.ac.in",
    github: "github.com/goutham-ops",
    bio: "Coordinates lab resources, symposium timelines, inter-team sprints, and operational workflows across the club.",
    department: "Operations",
    subsystem: "Operations & Sprint Management",
    linkedin: "linkedin.com/in/goutham-ops",
    instagram: "instagram.com/goutham_ops"
  },
  {
    name: "Grace",
    role: "Secretary",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
    email: "grace.2023@vitstudent.ac.in",
    github: "github.com/grace-operations",
    bio: "Manages institutional compliance, official university liaison, meeting minutes, and executive administration.",
    department: "Operations",
    subsystem: "Executive Administration",
    linkedin: "linkedin.com/in/grace-operations",
    instagram: "instagram.com/grace_operations"
  },
  {
    name: "Vinayak",
    role: "Co-Secretary",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    email: "vinayak.2023@vitstudent.ac.in",
    github: "github.com/vinayak-ops",
    bio: "Coordinates event documentation, member registry archives, and logistical alignments for major symposiums.",
    department: "Operations",
    subsystem: "Executive Operations",
    linkedin: "linkedin.com/in/vinayak-ops",
    instagram: "instagram.com/vinayak_ops"
  },
  {
    name: "Akshita",
    role: "Management Lead",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    email: "akshita.2023@vitstudent.ac.in",
    github: "github.com/akshita-ops",
    bio: "Oversees event venues, team itineraries, speaker arrangements, and internal club logistics.",
    department: "Operations",
    subsystem: "Event Coordination",
    linkedin: "linkedin.com/in/akshita-ops",
    instagram: "instagram.com/akshita_ops"
  },
  {
    name: "Aditya",
    role: "Management Lead",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300",
    email: "aditya.2023@vitstudent.ac.in",
    github: "github.com/aditya-ops",
    bio: "Manages hardware inventory, procurement tracking, and ensures laboratory equipment uptime.",
    department: "Operations",
    subsystem: "Supply Chain & Lab Logistics",
    linkedin: "linkedin.com/in/aditya-ops",
    instagram: "instagram.com/aditya_ops"
  },

  // MARKETING AND SPONSORSHIP
  {
    name: "Gurudeep",
    role: "Outreach Head",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
    email: "gurudeep.2023@vitstudent.ac.in",
    github: "github.com/gurudeep-outreach",
    bio: "Bridges the club with corporate sponsors, external technical partners, and funding organizations.",
    department: "Marketing and Sponsorship",
    subsystem: "Corporate Sponsorships",
    linkedin: "linkedin.com/in/gurudeep-outreach",
    instagram: "instagram.com/gurudeep_outreach"
  },
  {
    name: "Madhava",
    role: "Outreach Lead",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300",
    email: "madhava.2023@vitstudent.ac.in",
    github: "github.com/madhava-outreach",
    bio: "Fosters inter-university robotics alliances, competition registrations, and outreach partnerships.",
    department: "Marketing and Sponsorship",
    subsystem: "Industrial Alliances",
    linkedin: "linkedin.com/in/madhava-outreach",
    instagram: "instagram.com/madhava_outreach"
  },
  {
    name: "Ashton",
    role: "Publicity Head",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300",
    email: "ashton.2023@vitstudent.ac.in",
    github: "github.com/ashton-publicity",
    bio: "Directs campus publicity campaigns, social media growth, and flagship event media coverage.",
    department: "Marketing and Sponsorship",
    subsystem: "Campaign Strategy & PR",
    linkedin: "linkedin.com/in/ashton-publicity",
    instagram: "instagram.com/ashton_publicity"
  },
  {
    name: "Daksh",
    role: "Publicity Lead",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
    email: "daksh.2023@vitstudent.ac.in",
    github: "github.com/daksh-publicity",
    bio: "Drives community engagement, event broadcasts, and promotional student drives across campus.",
    department: "Marketing and Sponsorship",
    subsystem: "Community Outreach & Media",
    linkedin: "linkedin.com/in/daksh-publicity",
    instagram: "instagram.com/daksh_publicity"
  }
];
