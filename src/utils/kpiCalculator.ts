import { DAILY_KPI_PER_PERSON, TimeFilterPeriod, DateRange, SalesRecord, UserSalesSummary, User } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('th-TH').format(num);
};

export const formatThaiDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10) + 543; // Buddhist Era
      const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
      const day = parseInt(parts[2], 10);
      return `${day} ${month} ${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
};

export const getPeriodDays = (period: TimeFilterPeriod, dateRange?: DateRange): number => {
  switch (period) {
    case 'daily':
      return 1;
    case 'weekly':
      return 7;
    case 'monthly':
      return 30;
    case 'yearly':
      return 365;
    case 'custom': {
      if (dateRange?.startDate && dateRange?.endDate) {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return Math.max(1, diffDays);
      }
      return 1;
    }
    default:
      return 1;
  }
};

export const getTargetKpi = (period: TimeFilterPeriod, personCount: number = 1, dateRange?: DateRange): number => {
  const days = getPeriodDays(period, dateRange);
  return DAILY_KPI_PER_PERSON * days * Math.max(1, personCount);
};

export const filterRecordsByPeriod = (
  records: SalesRecord[],
  period: TimeFilterPeriod,
  selectedUserId?: string,
  dateRange?: DateRange,
  selectedSingleDate?: string
): SalesRecord[] => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return records.filter(record => {
    // User filter
    if (selectedUserId && selectedUserId !== 'all' && record.userId !== selectedUserId) {
      return false;
    }

    // Time filter
    if (period === 'daily') {
      const targetDate = selectedSingleDate || todayStr;
      return record.date === targetDate;
    }

    if (period === 'weekly') {
      const recordDate = new Date(record.date);
      const pastWeek = new Date(now);
      pastWeek.setDate(now.getDate() - 7);
      return recordDate >= pastWeek && recordDate <= now;
    }

    if (period === 'monthly') {
      const recordDate = new Date(record.date);
      const pastMonth = new Date(now);
      pastMonth.setDate(now.getDate() - 30);
      return recordDate >= pastMonth && recordDate <= now;
    }

    if (period === 'yearly') {
      const recordDate = new Date(record.date);
      const pastYear = new Date(now);
      pastYear.setDate(now.getDate() - 365);
      return recordDate >= pastYear && recordDate <= now;
    }

    if (period === 'custom') {
      if (!dateRange?.startDate || !dateRange?.endDate) return true;
      return record.date >= dateRange.startDate && record.date <= dateRange.endDate;
    }

    return true;
  });
};

export const calculateUserSummaries = (
  users: User[],
  records: SalesRecord[],
  period: TimeFilterPeriod,
  dateRange?: DateRange
): UserSalesSummary[] => {
  const employeeUsers = users.filter(u => u.role === 'employee');
  const days = getPeriodDays(period, dateRange);
  const targetPerPerson = DAILY_KPI_PER_PERSON * days;

  return employeeUsers.map(user => {
    const userRecords = records.filter(r => r.userId === user.id);
    const totalSales = userRecords.reduce((sum, r) => sum + r.salesAmount, 0);
    const totalPancake = userRecords.reduce((sum, r) => sum + r.pancakeOrders, 0);
    const totalJst = userRecords.reduce((sum, r) => sum + r.jstSystemOrders, 0);
    const differ = totalPancake - totalJst;
    const kpiPercentage = targetPerPerson > 0 ? (totalSales / targetPerPerson) * 100 : 0;

    return {
      userId: user.id,
      userName: user.name,
      avatar: user.avatar,
      role: user.role,
      totalSales,
      totalPancake,
      totalJst,
      differ,
      recordCount: userRecords.length,
      targetKpi: targetPerPerson,
      kpiPercentage,
      isKpiPassed: totalSales >= targetPerPerson
    };
  });
};

export const exportToCsv = (
  summaries: UserSalesSummary[],
  records: SalesRecord[],
  periodTitle: string
) => {
  // UTF-8 BOM for Thai language Excel / Google Sheets compatibility
  const BOM = '\uFEFF';
  
  let csvContent = `รายงานสรุปยอดขายพนักงาน และเปรียบเทียบ KPI\n`;
  csvContent += `ช่วงเวลา: ${periodTitle}\n`;
  csvContent += `เกณฑ์ KPI: 185,000 บาท/คน/วัน\n`;
  csvContent += `วันที่ออกรายงาน: ${new Date().toLocaleString('th-TH')}\n\n`;

  // Summary Table
  csvContent += `--- ตารางสรุปรายบุคคล ---\n`;
  csvContent += `ID,ชื่อพนักงาน,ยอดขายรวม (บาท),เป้าหมาย KPI (บาท),% เทียบ KPI,ออเดอร์ Pancake,จำนวนระบบ JST,Differ (ผลต่าง),สถานะ KPI\n`;

  summaries.forEach(s => {
    const status = s.isKpiPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์';
    csvContent += `"${s.userId}","${s.userName}",${s.totalSales},${s.targetKpi},${s.kpiPercentage.toFixed(2)}%,${s.totalPancake},${s.totalJst},${s.differ},"${status}"\n`;
  });

  csvContent += `\n--- รายการบันทึกยอดขายรายวัน ---\n`;
  csvContent += `วันที่,ID พนักงาน,ชื่อพนักงาน,ยอดขาย (บาท),ออเดอร์ Pancake,จำนวนระบบ JST,Differ,หมายเหตุ\n`;

  records.forEach(r => {
    csvContent += `"${r.date}","${r.userId}","${r.userName}",${r.salesAmount},${r.pancakeOrders},${r.jstSystemOrders},${r.differ},"${r.notes || '-'}"\n`;
  });

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
