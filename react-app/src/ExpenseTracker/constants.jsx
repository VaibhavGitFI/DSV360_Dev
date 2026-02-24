export const INITIAL_TEAMS = [
  { id: 'A', name: 'Alpha Squad', description: 'Enterprise Solutions', color: 'blue', capacity: 4 },
  { id: 'B', name: 'Beta Force', description: 'Mobile & Consumer', color: 'emerald', capacity: 3 },
  { id: 'C', name: 'Gamma Labs', description: 'R&D & AI', color: 'violet', capacity: 5 },
  { id: 'D', name: 'Projects Team', description: 'Enterprise Solutions', color: 'blue', capacity: 4 },
  { id: 'E', name: 'Product Team', description: 'Mobile & Consumer', color: 'emerald', capacity: 3 },
  { id: 'F', name: 'Mumbai Team', description: 'R&D & AI', color: 'violet', capacity: 5 },
];

export const INITIAL_PROJECTS = [
  { id: 'p1', name: 'E-Com Platform', revenue: 45000, description: 'Full stack overhaul', type: 'Web', teamId: 'A' },
  { id: 'p2', name: 'ESD Portal', revenue: 32000, description: 'Native web view', type: 'Web', teamId: 'B' },
  { id: 'p3', name: 'AI Chatbot', revenue: 28000, description: 'Customer support agent', type: 'AI', teamId: 'C' },
  { id: 'p4', name: 'DOVIDA HRMS', revenue: 55000, description: 'Real-time tracking', type: 'Web', teamId: 'D' },
  { id: 'p5', name: 'ESD Mobile', revenue: 15000, description: 'Wearable integration', type: 'Mobile', teamId: null },
  { id: 'p6', name: 'Logo Rebrand', revenue: 8000, description: 'Vector assets', type: 'Design', teamId: null },
  { id: 'p7', name: 'Data Warehouse', revenue: 72000, description: 'Snowflake migration', type: 'Web', teamId: null },
  { id: 'p8', name: 'Vision Pro POC', revenue: 40000, description: 'Spatial computing', type: 'AI', teamId: null },
];
