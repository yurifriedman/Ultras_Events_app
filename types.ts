
export interface Participant {
  id: string;
  name: string;
  phone: string;
  registeredAt: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  registrations: Participant[];
}

export interface SiteConfig {
  brandName: string;
  heroTitle: string;
  heroSubtitle: string;
  rosterTitle: string;
  rosterSubtitle: string;
  registerButtonText: string;
  viewRosterButtonText: string;
}

export interface AppState {
  events: EventData[];
  selectedEventId: string | null;
  siteConfig: SiteConfig;
}
