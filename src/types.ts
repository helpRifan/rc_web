export interface Member {
  name: string;
  role: string;
  image: string;
  email: string;
  github: string;
  bio?: string;
  department?: "Teaching" | "Projects" | "Web Dev" | "Media and Design" | "Operations" | "Marketing and Sponsorship" | "Alumni & Advisory" | "Core Leadership";
  departmentId?: string;
  subsystem?: string;
  linkedin?: string;
  instagram?: string;
}

export interface ActivityLog {
  id: string;
  status: "Active" | "Muted" | string;
  name: string;
  role: string;
  dept: string;
  time: string;
}

export interface DeploymentEvent {
  title: string;
  date: string;
  image: string;
  desc: string;
  status: "Registration Open" | "Coming Soon" | string;
  registrationLink?: string;
}

export interface ArchiveItem {
  title: string;
  category: string;
  image: string;
  desc?: string;
  year?: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export type ClubTab = "home" | "about" | "departments" | "members" | "activities" | "certificates" | "admin" | "achievements";
