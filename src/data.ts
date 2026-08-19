import { Member, DeploymentEvent, ArchiveItem } from "./types";

export const CLUB_MEMBERS: Member[] = [
  {
    name: "Rahul Sharma",
    role: "President",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
    email: "rahul.sharma2022@vitstudent.ac.in",
    github: "github.com/rahul-sharma-vit",
    bio: "Project architect steering the club's autonomous vehicle projects and high-level structural design paradigms.",
    instagram: "instagram.com/rahul_sharma_vit",
    department: "Projects",
    departmentId: "projects"
  },
  {
    name: "Priya Patel",
    role: "Vice President",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
    email: "priya.patel2022@vitstudent.ac.in",
    github: "github.com/priya-patel-systems",
    bio: "Lead educational mentor specializing in disseminating embedded systems, RTOS configurations, and DSP fundamentals to junior cohorts.",
    instagram: "instagram.com/priya.patel_systems",
    department: "Teaching",
    departmentId: "teaching"
  },
  {
    name: "Arjun Singh",
    role: "Technical Head",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    email: "arjun.singh2022@vitstudent.ac.in",
    github: "github.com/arjun-robotics",
    bio: "Robotic manipulator specialist actively managing inverse dynamics firmware for our heavy-payload multi-axis arm projects.",
    instagram: "instagram.com/arjun_sing_robotics",
    department: "Projects",
    departmentId: "projects"
  },
  {
    name: "Neha Gupta",
    role: "Operations Lead",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    email: "neha.gupta2022@vitstudent.ac.in",
    github: "github.com/neha-operations",
    bio: "Operations coordinator managing club logistics, symposium execution, external industry linkages, and team synchronization.",
    instagram: "instagram.com/neha_operations",
    department: "Operations",
    departmentId: "operations"
  },
  {
    name: "Karthik Iyer",
    role: "Web Infrastructure Lead",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    email: "karthik.iyer2022@vitstudent.ac.in",
    github: "github.com/karthik-iyer-ai",
    bio: "Full-stack engineer building robust web architectures, telemetry dashboards, and the club's public-facing digital platforms.",
    instagram: "instagram.com/karthik_iyer_ai",
    department: "Web Dev",
    departmentId: "webdev"
  },
  {
    name: "Ananya Rao",
    role: "Design Lead",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300",
    email: "ananya.rao2022@vitstudent.ac.in",
    github: "github.com/ananya-designs",
    bio: "UI/UX and media expert shaping the club's visual branding, social media content, and external digital interfaces.",
    instagram: "instagram.com/ananya_uiux",
    department: "Media and Design",
    departmentId: "media"
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
    name: "Rohan Das",
    role: "Senior Project Lead",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    email: "rohan.das2022@vitstudent.ac.in",
    github: "github.com/rohan-das-mech",
    bio: "CAD optimization engineer specializing in autonomous rover suspension systems and rigid finite element analysis.",
    department: "Projects",
    subsystem: "Structures & Suspension",
    linkedin: "linkedin.com/in/rohan-das-mech",
    instagram: "instagram.com/rohan_das_mech"
  },
  {
    name: "Shalini Verma",
    role: "Hardware Project Architect",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    email: "shalini.verma2022@vitstudent.ac.in",
    github: "github.com/shalini-pcb",
    bio: "High-speed multi-layer board routing and power delivery specialist. Optimizes decoupling systems on micro-grids.",
    department: "Projects",
    subsystem: "PCB Design & Power",
    linkedin: "linkedin.com/in/shalini-verma-pcb",
    instagram: "instagram.com/shalini_pcb"
  },
  {
    name: "David Miller",
    role: "Sensor Integration Lead",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300",
    email: "david.miller2023@vitstudent.ac.in",
    github: "github.com/david-m-sensors",
    bio: "Works with real-time ADC profiling, signal filtering pipelines, and interfacing LiDAR arrays over SPI/I2C protocols.",
    department: "Projects",
    subsystem: "Signal Acq & Sensoring",
    linkedin: "linkedin.com/in/david-miller-sensors",
    instagram: "instagram.com/david_m_sensors"
  },

  // TEACHING
  {
    name: "Kabir Mehta",
    role: "Manufacturing Mentor",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300",
    email: "kabir.mehta2022@vitstudent.ac.in",
    github: "github.com/kabir-machinist",
    bio: "Translates structural designs into toolpaths for CNC machining and configures the additive manufacturing pipeline.",
    department: "Teaching",
    subsystem: "CNC & Toolpath Mentorship",
    linkedin: "linkedin.com/in/kabir-mehta-mfg",
    instagram: "instagram.com/kabir_mfg"
  },
  {
    name: "Vikram Malhotra",
    role: "Firmware Instructor",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=300",
    email: "vikram.malhotra2022@vitstudent.ac.in",
    github: "github.com/vikram-m-firmware",
    bio: "Teaches microcontrollers how to behave. Developed VITC's custom RTOS interrupt managers for CAN Bus packets.",
    department: "Teaching",
    subsystem: "Low-level Drivers",
    linkedin: "linkedin.com/in/vikram-m-firmware",
    instagram: "instagram.com/vikram_firmware"
  },

  // WEB DEV
  {
    name: "Maya Rao",
    role: "Full-Stack Developer",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
    email: "maya.rao2022@vitstudent.ac.in",
    github: "github.com/maya-web",
    bio: "Builds and maintains the club's high-performance telemetry dashboards and robust internal APIs.",
    department: "Web Dev",
    subsystem: "Frontend Architecture",
    linkedin: "linkedin.com/in/maya-web",
    instagram: "instagram.com/maya_web"
  },
  {
    name: "Tanya Malhotra",
    role: "Systems Developer",
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=300",
    email: "tanya.malhotra2023@vitstudent.ac.in",
    github: "github.com/tanya-nodes",
    bio: "Formulated the early navigation kernels of the club and now ports backend logic into the web interface.",
    department: "Web Dev",
    subsystem: "Backend & Cloud",
    linkedin: "linkedin.com/in/tanya-malhotra-dev",
    instagram: "instagram.com/tanya_m_nodes"
  },

  // MEDIA AND DESIGN
  {
    name: "Sam Wood",
    role: "3D Visualization Designer",
    image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&q=80&w=300",
    email: "sam.wood2023@vitstudent.ac.in",
    github: "github.com/sam-w-design",
    bio: "Creates stunning 3D renders of our robotic assemblies for external media campaigns and symposium showcases.",
    department: "Media and Design",
    subsystem: "3D Rendering",
    linkedin: "linkedin.com/in/sam-w-design",
    instagram: "instagram.com/sam_wood_design"
  },
  {
    name: "Aisha Khan",
    role: "Creative Director",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300",
    email: "aisha.khan2022@vitstudent.ac.in",
    github: "github.com/aisha-creative",
    bio: "Minds the visual aesthetics, public symposium announcements, and UI/UX layouts of club dashboards.",
    department: "Media and Design",
    subsystem: "Branding & Media Layout",
    linkedin: "linkedin.com/in/aisha-creative",
    instagram: "instagram.com/aisha_creative"
  },

  // OPERATIONS
  {
    name: "Sarah Connor",
    role: "Logistics Engineer",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    email: "sarah.connor2023@vitstudent.ac.in",
    github: "github.com/sarahorganic",
    bio: "Ensures parts are ordered on time, coordinates cross-team testing schedules, and handles club logistics.",
    department: "Operations",
    subsystem: "Supply Chain",
    linkedin: "linkedin.com/in/sarah-connor-ops",
    instagram: "instagram.com/sarah_dynamics"
  },
  {
    name: "Riya Sen",
    role: "Event Coordinator",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300",
    email: "riya.sen2022@vitstudent.ac.in",
    github: "github.com/riya-nodes",
    bio: "Configures event spaces, manages guest speaker itineraries, and handles internal meeting arrangements.",
    department: "Operations",
    subsystem: "Internal Affairs",
    linkedin: "linkedin.com/in/riya-ops",
    instagram: "instagram.com/riya_nodes"
  },

  // MARKETING AND SPONSORSHIP
  {
    name: "Dev Patel",
    role: "Corporate Outreach Officer",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300",
    email: "dev.patel2023@vitstudent.ac.in",
    github: "github.com/devbox-shares",
    bio: "Bridges VITC Robotics Lab with industry mentors, arranges industrial safety gear sponsorships, and controls logistics budgets.",
    department: "Marketing and Sponsorship",
    subsystem: "Sponsorship & Outreach",
    linkedin: "linkedin.com/in/devbox-shares",
    instagram: "instagram.com/dev_patel_outreach"
  },
  {
    name: "Vikram Prasad",
    role: "Marketing Strategist",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300",
    email: "vikram.prasad2020@vitstudent.ac.in",
    github: "github.com/vikramprasad-robotics",
    bio: "Drives the marketing campaigns for RoboClash and other flagship events to maximize campus engagement.",
    department: "Marketing and Sponsorship",
    subsystem: "Campaign Strategy",
    linkedin: "linkedin.com/in/vikramprasad",
    instagram: "instagram.com/vikram_prasad"
  }
];
