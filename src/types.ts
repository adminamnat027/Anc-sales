export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string; // ID User e.g. EMP-101, ADM-001, MGR-001
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  position?: string;
  department?: string;
  joinedDate?: string;
}

export interface SalesRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  salesAmount: number;
  pancakeOrders: number;
  jstSystemOrders: number;
  differ: number; // pancakeOrders - jstSystemOrders
  notes?: string;
  createdAt: string;
}

export type TimeFilterPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

// Daily KPI target per person is 185,000 THB
export const DAILY_KPI_PER_PERSON = 185000;

export interface KpiSummary {
  periodDays: number;
  targetKpiPerPerson: number;
  totalTargetKpi: number;
  actualSales: number;
  achievementPercentage: number;
  isPassed: boolean;
}

export interface UserSalesSummary {
  userId: string;
  userName: string;
  avatar: string;
  role: UserRole;
  totalSales: number;
  totalPancake: number;
  totalJst: number;
  differ: number;
  recordCount: number;
  targetKpi: number;
  kpiPercentage: number;
  isKpiPassed: boolean;
}
