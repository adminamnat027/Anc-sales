import { User, SalesRecord } from '../types';

// Only real users currently in Firestore database
export const INITIAL_USERS: User[] = [
  {
    id: 'ADMIN2008',
    name: 'Pitipong kansar',
    email: 'kira_755@hotmail.com',
    password: 'Pitipong963',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Pitipong%20kansar&backgroundColor=bae6fd',
    position: 'ผู้ดูแลระบบ (Admin)',
    department: 'Admin',
    joinedDate: '2026-09-15'
  },
  {
    id: 'ADMIN000',
    name: 'นางสาวชลิตา  พานิชกุล',
    email: 'aernchalita.98@gmail.com',
    password: 'Aernnoii20',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper&backgroundColor=ffd5dc',
    position: 'หัวหน้าแอดมินอจ.',
    department: 'ทีมบริการลูกค้า',
    joinedDate: '2026-09-15'
  },
  {
    id: 'AD-001',
    name: 'ฝน',
    email: 'ppp@gmail.com',
    password: 'password123',
    role: 'employee',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=%E0%B8%9D%E0%B8%99&backgroundColor=ffd5dc',
    position: 'พนักงานขาย',
    department: 'แอดมินveok0',
    joinedDate: '2026-09-15'
  }
];

// No mock records - only real records from database
export const INITIAL_SALES_RECORDS: SalesRecord[] = [
  {
    id: 'REC-39832',
    userId: 'AD-001',
    userName: 'ฝน',
    date: '2026-09-15',
    salesAmount: 100000,
    pancakeOrders: 130,
    jstSystemOrders: 120,
    differ: 10,
    notes: '',
    createdAt: '2026-09-15T12:25:39.832Z'
  }
];

export const STORAGE_KEYS = {
  USERS: 'emp_sales_users_v2',
  RECORDS: 'emp_sales_records_v2',
  CURRENT_USER: 'emp_sales_curr_user_v2'
};

// Clean legacy mock keys from browser storage
const cleanupLegacyStorage = () => {
  try {
    localStorage.removeItem('emp_sales_users_v1');
    localStorage.removeItem('emp_sales_records_v1');
  } catch {
    // Ignore in case of restricted environments
  }
};
cleanupLegacyStorage();

export const getStoredUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out any stale mock users from previous versions
        const cleaned = parsed.filter((u: User) => !u.id.startsWith('EMP-10') && u.id !== 'ADM-001' && u.id !== 'MGR-001');
        if (cleaned.length > 0) return cleaned;
      }
    }
  } catch (e) {
    console.error('Error loading users from storage:', e);
  }
  return INITIAL_USERS;
};

export const saveStoredUsers = (users: User[]) => {
  try {
    const cleaned = users.filter((u: User) => !u.id.startsWith('EMP-10') && u.id !== 'ADM-001' && u.id !== 'MGR-001');
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Error saving users to storage:', e);
  }
};

export const getStoredRecords = (): SalesRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Filter out legacy mock records
        const cleaned = parsed.filter((r: SalesRecord) => 
          !r.id.startsWith('REC-00') && !r.userId.startsWith('EMP-10') && r.userId !== 'ADM-001' && r.userId !== 'MGR-001'
        );
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Error loading records from storage:', e);
  }
  return INITIAL_SALES_RECORDS;
};

export const saveStoredRecords = (records: SalesRecord[]) => {
  try {
    const cleaned = records.filter((r: SalesRecord) => 
      !r.id.startsWith('REC-00') && !r.userId.startsWith('EMP-10') && r.userId !== 'ADM-001' && r.userId !== 'MGR-001'
    );
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Error saving records to storage:', e);
  }
};

export const getStoredCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && parsed.id && !parsed.id.startsWith('EMP-10') && parsed.id !== 'ADM-001' && parsed.id !== 'MGR-001') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading current user:', e);
  }
  return null;
};

export const saveStoredCurrentUser = (user: User | null) => {
  try {
    if (user && !user.id.startsWith('EMP-10') && user.id !== 'ADM-001' && user.id !== 'MGR-001') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (e) {
    console.error('Error saving current user:', e);
  }
};
