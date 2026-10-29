// client/src/games/spyfall/locations.ts

export interface SpyfallLocation {
  id: string;
  name: string;
  category: string;
  roles: string[];
}

export const SPYFALL_LOCATIONS: SpyfallLocation[] = [
  {
    id: 'loc-1',
    name: 'Ramoji Film City',
    category: 'Film & Tourism',
    roles: ['Action Stunt Director', 'Hero Body Double', 'Excited Tourist', 'Dance Choreographer', 'Costume Designer']
  },
  {
    id: 'loc-2',
    name: 'Tollywood Big Budget Movie Set',
    category: 'Film Studio',
    roles: ['Assistant Director', 'Spot Boy with Chai', 'Lead Heroine', 'Lighting Tech', 'Sound Recordist']
  },
  {
    id: 'loc-3',
    name: 'Charminar Biryani Hotel',
    category: 'Old City Dining',
    roles: ['Master Dum Chef (Ustad)', 'Waiter Carrying 6 Plates', 'Food Vlogger with Camera', 'Cash Counter Seth', 'Hungry Customer']
  },
  {
    id: 'loc-4',
    name: 'Golconda Fort Acoustical Vault',
    category: 'Historical Heritage',
    roles: ['Heritage Tour Guide', 'Archaeologist', 'Student on School Picnic', 'Security Guard', 'History Enthusiast']
  },
  {
    id: 'loc-5',
    name: 'Cyber Towers, Hitec City',
    category: 'Tech & IT Hub',
    roles: ['Software Engineer debugging code', 'Startup Founder', 'Food Delivery Rider', 'HR Recruiter', 'Security Check Guard']
  },
  {
    id: 'loc-6',
    name: 'Tirumala Tirupati Devasthanam',
    category: 'Sacred Pilgrimage',
    roles: ['Laddu Prasadam Priest', 'Pilgrim waiting in line', 'Kalyanakatta Barber', 'Temple Security', 'Devotional Singer']
  },
  {
    id: 'loc-7',
    name: 'Hussain Sagar Ferry Boat',
    category: 'Lakeside Monument',
    roles: ['Ferry Boat Captain', 'Tourist looking at Buddha Statue', 'Photographer', 'Safety Lifejacket Guard', 'Evening Commuter']
  },
  {
    id: 'loc-8',
    name: 'RK Beach, Visakhapatnam',
    category: 'Coastal Tourist Spot',
    roles: ['Submarine Museum Guide', 'Roasted Corn Vendor', 'Morning Jogger', 'College Bunk Student', 'Lifeguard']
  }
];

export function getRandomLocation(): SpyfallLocation {
  return SPYFALL_LOCATIONS[Math.floor(Math.random() * SPYFALL_LOCATIONS.length)];
}
