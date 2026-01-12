
import { EventData, SiteConfig } from './types';

export const INITIAL_EVENTS: EventData[] = [
  {
    id: 'evt-1',
    title: 'Hike 1',
    description: 'The premier demonstration trek. This route offers a perfect balance of challenge and scenery, ideal for testing our new registration system.',
    date: '2025-05-15',
    location: 'Mount Tabor Trail, Lower Galilee',
    category: 'Ultra',
    registrations: [
      { id: 'p-1', name: 'Courtney Dauwalter', phone: '+1 555-0101', registeredAt: '2024-10-01' },
      { id: 'p-2', name: 'Kilian Jornet', phone: '+1 555-0102', registeredAt: '2024-10-02' }
    ]
  }
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandName: 'Ultras',
  heroTitle: 'Hiking Portal',
  heroSubtitle: 'Exclusive registration and management for the premier ultra event.',
  rosterTitle: 'Live Participant Roster',
  rosterSubtitle: 'Tracking registrations for the hike',
  registerButtonText: 'Register to Hike',
  viewRosterButtonText: 'View Roster'
};
