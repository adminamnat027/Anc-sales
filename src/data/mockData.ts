import { User, SalesRecord } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'ADM-001',
    name: 'คุณมนัสวี วงศ์สวัสดิ์',
    email: 'admin.manas@company.co.th',
    password: 'password123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Manaswee&backgroundColor=ffd5dc',
    position: 'ผู้ดูแลระบบสูงสุด (System Admin)',
    department: 'ฝ่ายเทคโนโลยีและบริหาร',
    joinedDate: '2024-01-10'
  },
  {
    id: 'MGR-001',
    name: 'คุณณภัทร สุขเกษม',
    email: 'manager.naphat@company.co.th',
    password: 'password123',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Naphat&backgroundColor=d8b4fe',
    position: 'ผู้จัดการฝ่ายขาย (Sales Manager)',
    department: 'ฝ่ายบริหารงานขาย',
    joinedDate: '2024-03-01'
  },
  {
    id: 'EMP-101',
    name: 'คุณกานดา ชัยมงคล',
    email: 'kanda.c@company.co.th',
    password: 'password123',
    role: 'employee',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kanda&backgroundColor=fbcfe8',
    position: 'เจ้าหน้าที่ฝ่ายขายอาวุโส (Senior Sales)',
    department: 'ทีมขายหน้าร้าน A',
    joinedDate: '2024-06-15'
  },
  {
    id: 'EMP-102',
    name: 'คุณพีรพล เลิศรัตน์',
    email: 'peerapol.l@company.co.th',
    password: 'password123',
    role: 'employee',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Peerapol&backgroundColor=bae6fd',
    position: 'เจ้าหน้าที่ฝ่ายขาย (Sales Officer)',
    department: 'ทีมขายออนไลน์ B',
    joinedDate: '2024-08-01'
  },
  {
    id: 'EMP-103',
    name: 'คุณชัญญา วารีสุข',
    email: 'chanya.w@company.co.th',
    password: 'password123',
    role: 'employee',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Chanya&backgroundColor=bbf7d0',
    position: 'เจ้าหน้าที่ฝ่ายขาย (Sales Officer)',
    department: 'ทีมขายหน้าร้าน A',
    joinedDate: '2024-09-12'
  },
  {
    id: 'EMP-104',
    name: 'คุณวรเมธ นิลประเสริฐ',
    email: 'worameth.n@company.co.th',
    password: 'password123',
    role: 'employee',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Worameth&backgroundColor=fed7aa',
    position: 'เจ้าหน้าที่ฝ่ายขาย (Sales Officer)',
    department: 'ทีมขายพิเศษ C',
    joinedDate: '2024-11-20'
  }
];

// Generate dates for current year / month
const today = new Date();
const formatDate = (offsetDays: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_SALES_RECORDS: SalesRecord[] = [
  // Today's records
  {
    id: 'REC-001',
    userId: 'EMP-101',
    userName: 'คุณกานดา ชัยมงคล',
    date: formatDate(0),
    salesAmount: 195400,
    pancakeOrders: 142,
    jstSystemOrders: 142,
    differ: 0,
    notes: 'ออเดอร์หน้าร้านตรงกับระบบ 100%',
    createdAt: new Date().toISOString()
  },
  {
    id: 'REC-002',
    userId: 'EMP-102',
    userName: 'คุณพีรพล เลิศรัตน์',
    date: formatDate(0),
    salesAmount: 188200,
    pancakeOrders: 130,
    jstSystemOrders: 128,
    differ: 2,
    notes: 'Pancake เกินระบบ JST 2 ออเดอร์ (รอตัดสต็อกช่วงค่ำ)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'REC-003',
    userId: 'EMP-103',
    userName: 'คุณชัญญา วารีสุข',
    date: formatDate(0),
    salesAmount: 172000,
    pancakeOrders: 115,
    jstSystemOrders: 115,
    differ: 0,
    notes: 'ยอดขายช่วงบ่ายกำลังเร่งทำเป้า',
    createdAt: new Date().toISOString()
  },
  {
    id: 'REC-004',
    userId: 'EMP-104',
    userName: 'คุณวรเมธ นิลประเสริฐ',
    date: formatDate(0),
    salesAmount: 191500,
    pancakeOrders: 138,
    jstSystemOrders: 140,
    differ: -2,
    notes: 'ระบบ JST มากกว่า Pancake 2 ออเดอร์จากลูกค้ายกเลิก',
    createdAt: new Date().toISOString()
  },

  // Yesterday's records
  {
    id: 'REC-005',
    userId: 'EMP-101',
    userName: 'คุณกานดา ชัยมงคล',
    date: formatDate(1),
    salesAmount: 210000,
    pancakeOrders: 155,
    jstSystemOrders: 155,
    differ: 0,
    notes: 'ยอดขายทะลุเป้า KPI สวยงาม',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'REC-006',
    userId: 'EMP-102',
    userName: 'คุณพีรพล เลิศรัตน์',
    date: formatDate(1),
    salesAmount: 186500,
    pancakeOrders: 129,
    jstSystemOrders: 129,
    differ: 0,
    notes: 'ผ่านเกณฑ์ KPI รายวัน',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'REC-007',
    userId: 'EMP-103',
    userName: 'คุณชัญญา วารีสุข',
    date: formatDate(1),
    salesAmount: 189000,
    pancakeOrders: 133,
    jstSystemOrders: 131,
    differ: 2,
    notes: 'มี Differ 2 รายการ ตรวจสอบแล้วเป็นออเดอร์หน้าร้านชำระเงินสด',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'REC-008',
    userId: 'EMP-104',
    userName: 'คุณวรเมธ นิลประเสริฐ',
    date: formatDate(1),
    salesAmount: 179000,
    pancakeOrders: 120,
    jstSystemOrders: 120,
    differ: 0,
    notes: 'ยอดดีขึ้น ปิดยอดเร็วกว่าปกติ',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },

  // 2 days ago
  {
    id: 'REC-009',
    userId: 'EMP-101',
    userName: 'คุณกานดา ชัยมงคล',
    date: formatDate(2),
    salesAmount: 202500,
    pancakeOrders: 148,
    jstSystemOrders: 148,
    differ: 0,
    notes: 'ยอดเยี่ยม',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'REC-010',
    userId: 'EMP-102',
    userName: 'คุณพีรพล เลิศรัตน์',
    date: formatDate(2),
    salesAmount: 178000,
    pancakeOrders: 122,
    jstSystemOrders: 125,
    differ: -3,
    notes: 'JST เกิน 3 รายการ รอเคลียร์บิล',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'REC-011',
    userId: 'EMP-103',
    userName: 'คุณชัญญา วารีสุข',
    date: formatDate(2),
    salesAmount: 194000,
    pancakeOrders: 139,
    jstSystemOrders: 139,
    differ: 0,
    notes: 'ผ่าน KPI เกิน 185,000',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'REC-012',
    userId: 'EMP-104',
    userName: 'คุณวรเมธ นิลประเสริฐ',
    date: formatDate(2),
    salesAmount: 185500,
    pancakeOrders: 131,
    jstSystemOrders: 131,
    differ: 0,
    notes: 'ผ่าน KPI พอดี',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },

  // 3 days ago
  {
    id: 'REC-013',
    userId: 'EMP-101',
    userName: 'คุณกานดา ชัยมงคล',
    date: formatDate(3),
    salesAmount: 189000,
    pancakeOrders: 135,
    jstSystemOrders: 135,
    differ: 0,
    notes: 'ปกติ',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'REC-014',
    userId: 'EMP-102',
    userName: 'คุณพีรพล เลิศรัตน์',
    date: formatDate(3),
    salesAmount: 192000,
    pancakeOrders: 140,
    jstSystemOrders: 139,
    differ: 1,
    notes: 'Differ 1 รายการ',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'REC-015',
    userId: 'EMP-103',
    userName: 'คุณชัญญา วารีสุข',
    date: formatDate(3),
    salesAmount: 181000,
    pancakeOrders: 125,
    jstSystemOrders: 125,
    differ: 0,
    notes: 'ใกล้ถึงเป้า',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'REC-016',
    userId: 'EMP-104',
    userName: 'คุณวรเมธ นิลประเสริฐ',
    date: formatDate(3),
    salesAmount: 188000,
    pancakeOrders: 132,
    jstSystemOrders: 132,
    differ: 0,
    notes: 'ผ่าน KPI',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },

  // 4 days ago
  {
    id: 'REC-017',
    userId: 'EMP-101',
    userName: 'คุณกานดา ชัยมงคล',
    date: formatDate(4),
    salesAmount: 198000,
    pancakeOrders: 145,
    jstSystemOrders: 145,
    differ: 0,
    notes: 'ผ่านเกณฑ์',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'REC-018',
    userId: 'EMP-102',
    userName: 'คุณพีรพล เลิศรัตน์',
    date: formatDate(4),
    salesAmount: 187000,
    pancakeOrders: 130,
    jstSystemOrders: 130,
    differ: 0,
    notes: 'ตรงตามระบบ',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

export const STORAGE_KEYS = {
  USERS: 'emp_sales_users_v1',
  RECORDS: 'emp_sales_records_v1',
  CURRENT_USER: 'emp_sales_curr_user_v1'
};

export const getStoredUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading users from storage:', e);
  }
  return INITIAL_USERS;
};

export const saveStoredUsers = (users: User[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to storage:', e);
  }
};

export const getStoredRecords = (): SalesRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading records from storage:', e);
  }
  return INITIAL_SALES_RECORDS;
};

export const saveStoredRecords = (records: SalesRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving records to storage:', e);
  }
};

export const getStoredCurrentUser = (): User => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {
    console.error('Error loading current user:', e);
  }
  return INITIAL_USERS[0]; // Default to Admin for full testing
};

export const saveStoredCurrentUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (e) {
    console.error('Error saving current user:', e);
  }
};
