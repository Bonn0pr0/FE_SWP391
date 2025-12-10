export interface Room {
  id: string;
  name: string;
  type: 'Meeting Room' | 'Computer Lab' | 'Sport Field' | 'Lecture Hall';
  campus: 'campus1' | 'campus2';
  capacity: number;
  availability: {
    [key: string]: boolean[]; 
  };
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  userEmail: string;
  date: string;
  startTime: number;
  endTime: number;
  status: 'Approved' | 'Rejected' | 'Cancelled' | 'Pending';
  purpose: string;
  createdAt: string;
}

// Generate mock rooms
export const mockRooms: Room[] = [
  {
    id: 'r1',
    name: 'Meeting Room A101',
    type: 'Meeting Room',
    campus: 'campus1',
    capacity: 20,
    availability: {},
  },
  {
    id: 'r2',
    name: 'Computer Lab B201',
    type: 'Computer Lab',
    campus: 'campus1',
    capacity: 40,
    availability: {},
  },
  {
    id: 'r3',
    name: 'Sport Field C1 - Sân bóng đá',
    type: 'Sport Field',
    campus: 'campus2',
    capacity: 100,
    availability: {},
  },
  {
    id: 'r4',
    name: 'Lecture Hall D301',
    type: 'Lecture Hall',
    campus: 'campus2',
    capacity: 150,
    availability: {},
  },
  {
    id: 'r5',
    name: 'Meeting Room A102',
    type: 'Meeting Room',
    campus: 'campus1',
    capacity: 15,
    availability: {},
  },
  {
    id: 'r6',
    name: 'Computer Lab B202',
    type: 'Computer Lab',
    campus: 'campus1',
    capacity: 35,
    availability: {},
  },
  {
    id: 'r7',
    name: 'Sport Field S1 - Sân bóng rổ',
    type: 'Sport Field',
    campus: 'campus1',
    capacity: 50,
    availability: {},
  },
  {
    id: 'r8',
    name: 'Sport Field S2 - Sân cầu lông',
    type: 'Sport Field',
    campus: 'campus1',
    capacity: 30,
    availability: {},
  },
  {
    id: 'r9',
    name: 'Sport Field C2 - Sân tennis',
    type: 'Sport Field',
    campus: 'campus2',
    capacity: 20,
    availability: {},
  },
];

// Generate mock bookings
export const mockBookings: Booking[] = [
  {
    id: 'b1',
    roomId: 'r1',
    roomName: 'Meeting Room A101',
    userId: 'u1',
    userEmail: 'nguyenvana@fpt.edu.vn',
    date: '2025-12-05',
    startTime: 9,
    endTime: 11,
    status: 'Approved',
    purpose: 'Team meeting',
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'b2',
    roomId: 'r2',
    roomName: 'Computer Lab B201',
    userId: 'u2',
    userEmail: 'nguyenvanb@fe.edu.vn',
    date: '2025-12-06',
    startTime: 13,
    endTime: 15,
    status: 'Approved',
    purpose: 'Lab session',
    createdAt: '2025-12-01T11:00:00Z',
  },
  {
    id: 'b3',
    roomId: 'r3',
    roomName: 'Sport Field C1',
    userId: 'u1',
    userEmail: 'nguyenvana@fpt.edu.vn',
    date: '2025-12-07',
    startTime: 15,
    endTime: 17,
    status: 'Pending',
    purpose: 'Football practice',
    createdAt: '2025-12-02T09:00:00Z',
  },
];

// Dashboard statistics
export interface DashboardStats {
  totalRooms: number;
  utilizationRate7Days: number;
  utilizationRate30Days: number;
  totalApprovedBookings: number;
  rejectedBookings: number;
  topUsedRooms: { name: string; usage: number }[];
  leastUsedRooms: { name: string; usage: number }[];
}

export const mockDashboardStats: DashboardStats = {
  totalRooms: 9,
  utilizationRate7Days: 68.5,
  utilizationRate30Days: 72.3,
  totalApprovedBookings: 124,
  rejectedBookings: 8,
  topUsedRooms: [
    { name: 'Computer Lab B201', usage: 92 },
    { name: 'Meeting Room A101', usage: 85 },
    { name: 'Sport Field S1 - Sân bóng rổ', usage: 81 },
    { name: 'Lecture Hall D301', usage: 78 },
    { name: 'Computer Lab B202', usage: 74 },
  ],
  leastUsedRooms: [
    { name: 'Sport Field C2 - Sân tennis', usage: 38 },
    { name: 'Sport Field C1 - Sân bóng đá', usage: 45 },
    { name: 'Sport Field S2 - Sân cầu lông', usage: 52 },
    { name: 'Meeting Room A102', usage: 58 },
    { name: 'Computer Lab B202', usage: 62 },
  ],
};

// Chart data for reports
export const mockChartData = {
  daily: [
    { date: '2025-11-25', used: 48, available: 144 },
    { date: '2025-11-26', used: 52, available: 140 },
    { date: '2025-11-27', used: 45, available: 147 },
    { date: '2025-11-28', used: 58, available: 134 },
    { date: '2025-11-29', used: 62, available: 130 },
    { date: '2025-11-30', used: 38, available: 154 },
    { date: '2025-12-01', used: 55, available: 137 },
  ],
  heatmap: [
    { day: 'Mon', '8h': 80, '9h': 90, '10h': 85, '11h': 75, '13h': 70, '14h': 85, '15h': 90, '16h': 80 },
    { day: 'Tue', '8h': 75, '9h': 85, '10h': 90, '11h': 80, '13h': 75, '14h': 80, '15h': 85, '16h': 75 },
    { day: 'Wed', '8h': 85, '9h': 95, '10h': 90, '11h': 85, '13h': 80, '14h': 90, '15h': 95, '16h': 85 },
    { day: 'Thu', '8h': 70, '9h': 80, '10h': 85, '11h': 75, '13h': 70, '14h': 75, '15h': 80, '16h': 70 },
    { day: 'Fri', '8h': 90, '9h': 95, '10h': 90, '11h': 85, '13h': 80, '14h': 85, '15h': 90, '16h': 80 },
  ],
};
