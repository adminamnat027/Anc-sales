import React, { useState, useMemo } from 'react';
import { 
  User, 
  SalesRecord, 
  TimeFilterPeriod, 
  DateRange, 
  DAILY_KPI_PER_PERSON 
} from '../types';
import { 
  formatCurrency, 
  formatNumber, 
  formatThaiDate, 
  filterRecordsByPeriod, 
  calculateUserSummaries,
  getPeriodDays,
  getTargetKpi
} from '../utils/kpiCalculator';
import { 
  TrendingUp, 
  ShoppingBag, 
  Database, 
  Scale, 
  Calendar, 
  Filter, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  PieChart as PieChartIcon,
  Search,
  Sparkles,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User | null;
  allUsers: User[];
  records: SalesRecord[];
  onOpenNewRecord: () => void;
  onEditRecord: (record: SalesRecord) => void;
  onDeleteRecord: (recordId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  allUsers,
  records,
  onOpenNewRecord,
  onEditRecord,
  onDeleteRecord
}) => {
  // Filters
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [period, setPeriod] = useState<TimeFilterPeriod>('daily');
  const [singleDate, setSingleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Permission checks
  const canDelete = currentUser?.role === 'admin';
  const canEditRecord = (record: SalesRecord) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager') return true;
    if (currentUser.role === 'employee') return record.userId === currentUser.id;
    return false;
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return filterRecordsByPeriod(
      records,
      period,
      selectedUserId,
      customRange,
      singleDate
    );
  }, [records, period, selectedUserId, customRange, singleDate]);

  // Days in period & KPI
  const daysCount = useMemo(() => {
    return getPeriodDays(period, customRange);
  }, [period, customRange]);

  // Number of employees considered
  const activeEmployeeUsers = useMemo(() => {
    const employees = allUsers.filter(u => u.role === 'employee');
    if (selectedUserId !== 'all') {
      return employees.filter(u => u.id === selectedUserId);
    }
    return employees;
  }, [allUsers, selectedUserId]);

  const targetKpiTotal = useMemo(() => {
    const personMultiplier = Math.max(1, activeEmployeeUsers.length);
    return getTargetKpi(period, personMultiplier, customRange);
  }, [period, activeEmployeeUsers, customRange]);

  // Aggregate totals
  const totalSales = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.salesAmount, 0);
  }, [filteredRecords]);

  const totalPancake = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.pancakeOrders, 0);
  }, [filteredRecords]);

  const totalJst = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.jstSystemOrders, 0);
  }, [filteredRecords]);

  const totalDiffer = totalPancake - totalJst;

  const kpiPercentage = targetKpiTotal > 0 ? (totalSales / targetKpiTotal) * 100 : 0;
  const isOverallKpiPassed = totalSales >= targetKpiTotal;

  // Summaries per user for Pie chart and ranking
  const userSummaries = useMemo(() => {
    return calculateUserSummaries(allUsers, filteredRecords, period, customRange);
  }, [allUsers, filteredRecords, period, customRange]);

  // Pie chart calculation
  const pieData = useMemo(() => {
    const colors = [
      { fill: '#f472b6', bg: 'bg-pink-400', text: 'text-pink-600', name: 'Rose' },
      { fill: '#38bdf8', bg: 'bg-sky-400', text: 'text-sky-600', name: 'Sky' },
      { fill: '#a78bfa', bg: 'bg-purple-400', text: 'text-purple-600', name: 'Lavender' },
      { fill: '#34d399', bg: 'bg-emerald-400', text: 'text-emerald-600', name: 'Mint' },
      { fill: '#fbbf24', bg: 'bg-amber-400', text: 'text-amber-600', name: 'Butter' },
      { fill: '#fb923c', bg: 'bg-orange-400', text: 'text-orange-600', name: 'Peach' }
    ];

    const total = userSummaries.reduce((sum, u) => sum + u.totalSales, 0);
    let cumulativePercent = 0;

    return userSummaries.map((user, idx) => {
      const pct = total > 0 ? (user.totalSales / total) * 100 : 0;
      const startAngle = cumulativePercent * 3.6; // 360 / 100
      cumulativePercent += pct;
      const endAngle = cumulativePercent * 3.6;
      const color = colors[idx % colors.length];

      return {
        ...user,
        percent: pct,
        startAngle,
        endAngle,
        color
      };
    });
  }, [userSummaries]);

  // Search filtered records for the table
  const displayedTableRecords = useMemo(() => {
    if (!searchQuery.trim()) return filteredRecords;
    const q = searchQuery.toLowerCase();
    return filteredRecords.filter(
      r =>
        r.userName.toLowerCase().includes(q) ||
        r.userId.toLowerCase().includes(q) ||
        r.date.includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q))
    );
  }, [filteredRecords, searchQuery]);

  // Helpers for SVG pie chart slices
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Filter Bar: User selector, Time period filter, Custom Date range */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-pink-100/80 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: User Select Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="w-4 h-4 text-pink-500" />
              <span>เรียกดูข้อมูล User:</span>
            </div>
            
            <select
              id="select-user-filter"
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="px-3.5 py-2 bg-pink-50/50 hover:bg-pink-50 border border-pink-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer"
            >
              <option value="all">👥 พนักงานทั้งหมด (All Users)</option>
              {allUsers
                .filter(u => u.role === 'employee')
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.id} - {user.name}
                  </option>
                ))}
            </select>

            {/* If single user selected, show mini badge */}
            {selectedUserId !== 'all' && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 font-medium">
                {allUsers.find(u => u.id === selectedUserId)?.name}
              </span>
            )}
          </div>

          {/* Right: Period Tabs (รายวัน, รายสัปดาห์, รายเดือน, รายปี, กำหนดเอง) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              id="btn-period-daily"
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                period === 'daily'
                  ? 'bg-white text-rose-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายวัน
            </button>
            <button
              id="btn-period-weekly"
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                period === 'weekly'
                  ? 'bg-white text-rose-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายสัปดาห์
            </button>
            <button
              id="btn-period-monthly"
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                period === 'monthly'
                  ? 'bg-white text-rose-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายเดือน
            </button>
            <button
              id="btn-period-yearly"
              onClick={() => setPeriod('yearly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                period === 'yearly'
                  ? 'bg-white text-rose-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายปี
            </button>
            <button
              id="btn-period-custom"
              onClick={() => setPeriod('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                period === 'custom'
                  ? 'bg-white text-rose-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เลือกช่วงเวลาได้เอง
            </button>
          </div>
        </div>

        {/* Date Sub-Filter Row */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>ช่วงเวลาการคำนวณ: </span>
            <span className="font-semibold text-slate-800">
              {period === 'daily' && `ประจำวันที่ ${formatThaiDate(singleDate)}`}
              {period === 'weekly' && `7 วันย้อนหลัง (${daysCount} วัน)`}
              {period === 'monthly' && `30 วันย้อนหลัง (${daysCount} วัน)`}
              {period === 'yearly' && `1 ปี (${daysCount} วัน)`}
              {period === 'custom' && `${formatThaiDate(customRange.startDate)} - ${formatThaiDate(customRange.endDate)} (${daysCount} วัน)`}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-medium border border-rose-100">
              เกณฑ์ KPI 185,000 ฿/คน/วัน
            </span>
          </div>

          {/* Date Picker Controls for Daily or Custom */}
          {period === 'daily' && (
            <div className="flex items-center gap-2">
              <label className="text-slate-500">เลือกวัน:</label>
              <input
                type="date"
                value={singleDate}
                onChange={e => setSingleDate(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
              />
            </div>
          )}

          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <label className="text-slate-500">ตั้งแต่:</label>
              <input
                type="date"
                value={customRange.startDate}
                onChange={e => setCustomRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
              />
              <span className="text-slate-400">ถึง:</span>
              <input
                type="date"
                value={customRange.endDate}
                onChange={e => setCustomRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4 Main Summary Cards in Pastel Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: สรุปยอดขาย & KPI Target */}
        <div className="bg-gradient-to-br from-pink-50/90 via-rose-50/50 to-white p-5 rounded-3xl border border-pink-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-600">สรุปยอดขายรวม (Sales)</span>
            <div className="w-9 h-9 rounded-2xl bg-pink-100 text-rose-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="font-heading font-semibold text-2xl text-slate-800">
              {formatCurrency(totalSales)}
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">เป้า KPI ({daysCount} วัน):</span>
              <span className="font-medium text-slate-700">{formatCurrency(targetKpiTotal)}</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 w-full h-2 bg-pink-100/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverallKpiPassed ? 'bg-emerald-400' : 'bg-pink-400'
                }`}
                style={{ width: `${Math.min(100, kpiPercentage)}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className={`font-semibold ${isOverallKpiPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isOverallKpiPassed ? '✓ ทะลุเป้าหมาย KPI' : 'กำลังเร่งทำเป้า'}
              </span>
              <span className="font-bold text-slate-700">{kpiPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: จำนวนออเดอร์ Pancake */}
        <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white p-5 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">ออเดอร์ Pancake รวม</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="font-heading font-semibold text-2xl text-slate-800">
              {formatNumber(totalPancake)} <span className="text-sm font-normal text-slate-500">ออเดอร์</span>
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              เฉลี่ย {activeEmployeeUsers.length > 0 ? (totalPancake / activeEmployeeUsers.length).toFixed(1) : 0} ออเดอร์/คน
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-100/50 px-2.5 py-1 rounded-xl w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>จากระบบสั่งซื้อ Pancake</span>
            </div>
          </div>
        </div>

        {/* Card 3: จำนวนระบบ JST */}
        <div className="bg-gradient-to-br from-sky-50/90 via-blue-50/40 to-white p-5 rounded-3xl border border-sky-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-700">จำนวนในระบบ JST รวม</span>
            <div className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="font-heading font-semibold text-2xl text-slate-800">
              {formatNumber(totalJst)} <span className="text-sm font-normal text-slate-500">รายการ</span>
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              เฉลี่ย {activeEmployeeUsers.length > 0 ? (totalJst / activeEmployeeUsers.length).toFixed(1) : 0} รายการ/คน
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-sky-700 bg-sky-100/50 px-2.5 py-1 rounded-xl w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>บันทึกบัญชีระบบ JST</span>
            </div>
          </div>
        </div>

        {/* Card 4: แสดง Differ ของ Pancake และ JST */}
        <div className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${
          totalDiffer === 0 
            ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border-emerald-100'
            : 'bg-gradient-to-br from-rose-50/90 via-orange-50/40 to-white border-rose-100'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${totalDiffer === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              Differ (Pancake - JST)
            </span>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              totalDiffer === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <h3 className="font-heading font-semibold text-2xl text-slate-800">
                {totalDiffer === 0 ? '0' : `${totalDiffer > 0 ? '+' : ''}${totalDiffer}`}
              </h3>
              <span className="text-xs text-slate-500">ผลต่าง</span>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl font-medium ${
                totalDiffer === 0 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {totalDiffer === 0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ข้อมูลตรงกันสมบูรณ์ 100%</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{totalDiffer > 0 ? 'Pancake เกิน JST' : 'JST เกิน Pancake'}</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {totalDiffer === 0 
                ? 'ยอดออเดอร์ตัดสต็อกสมบูรณ์' 
                : 'มีรายการรอตรวจสอบระหว่างระบบ'}
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Pie Chart (สัดส่วน % ของ User) + KPI Progress Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pie Chart Card (5 cols) */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-pink-100/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-rose-500 flex items-center justify-center">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-base text-slate-800">
                    กราฟ Pie Chart แสดง % ของ User
                  </h3>
                  <p className="text-xs text-slate-500">
                    สัดส่วนยอดขายเปรียบเทียบระหว่างพนักงาน
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Interactive Pastel Donut / Pie SVG */}
            <div className="py-2 flex flex-col items-center justify-center">
              {totalSales > 0 ? (
                <div className="relative w-56 h-56">
                  <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
                    {pieData.map((slice, i) => {
                      if (slice.percent === 0) return null;
                      const [startX, startY] = getCoordinatesForPercent(slice.startAngle / 360);
                      const [endX, endY] = getCoordinatesForPercent(slice.endAngle / 360);
                      const largeArcFlag = slice.percent > 50 ? 1 : 0;
                      const pathData = [
                        `M ${startX} ${startY}`,
                        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                        'L 0 0',
                      ].join(' ');

                      return (
                        <path
                          key={slice.userId}
                          d={pathData}
                          fill={slice.color.fill}
                          stroke="#ffffff"
                          strokeWidth="0.04"
                          className="hover:opacity-85 transition-opacity cursor-pointer"
                        >
                          <title>{`${slice.userName}: ${formatCurrency(slice.totalSales)} (${slice.percent.toFixed(1)}%)`}</title>
                        </path>
                      );
                    })}
                    {/* Inner hole for cute Donut feel */}
                    <circle cx="0" cy="0" r="0.55" fill="#ffffff" />
                  </svg>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[11px] text-slate-400 font-medium">ยอดรวม</span>
                    <span className="font-heading font-bold text-sm text-slate-700">
                      {formatCurrency(totalSales)}
                    </span>
                    <span className="text-[10px] text-pink-500 font-medium">
                      {userSummaries.length} พนักงาน
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  ไม่มีข้อมูลยอดขายในช่วงเวลานี้
                </div>
              )}
            </div>
          </div>

          {/* Pie Chart Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            {pieData.map((user) => (
              <div 
                key={user.userId} 
                onClick={() => setSelectedUserId(user.userId)}
                className={`flex items-center gap-2 p-1.5 rounded-xl transition-colors cursor-pointer ${
                  selectedUserId === user.userId ? 'bg-pink-50 text-rose-700 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <span 
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                  style={{ backgroundColor: user.color.fill }} 
                />
                <div className="truncate flex-1 min-w-0">
                  <div className="truncate text-[11px]">{user.userName.split(' ')[1] || user.userName}</div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {user.percent.toFixed(1)}% ({formatCurrency(user.totalSales)})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Performance & KPI Rankings (7 cols) */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-pink-100/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-base text-slate-800">
                    ความคืบหน้ายอดขายเทียบ KPI (185,000 ฿/คน/วัน)
                  </h3>
                  <p className="text-xs text-slate-500">
                    เป้าหมายรายคนสำหรับ {daysCount} วัน: {formatCurrency(DAILY_KPI_PER_PERSON * daysCount)}
                  </p>
                </div>
              </div>

              <button
                id="btn-add-sales-from-dash"
                onClick={onOpenNewRecord}
                className="hidden sm:inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 font-medium transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ เพิ่มยอด</span>
              </button>
            </div>

            {/* Performance List */}
            <div className="space-y-3.5">
              {userSummaries.map((user) => {
                const target = DAILY_KPI_PER_PERSON * daysCount;
                const isPassed = user.totalSales >= target;
                return (
                  <div 
                    key={user.userId} 
                    className="p-3 rounded-2xl bg-slate-50/70 hover:bg-pink-50/40 border border-slate-100 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <img 
                          src={user.avatar} 
                          alt={user.userName} 
                          className="w-7 h-7 rounded-full bg-white border border-slate-200 object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                        <div>
                          <span className="font-medium text-slate-800">{user.userName}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">({user.userId})</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-semibold text-slate-800">{formatCurrency(user.totalSales)}</span>
                        <span className={`text-[11px] ml-2 font-semibold ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ({user.kpiPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPassed ? 'bg-emerald-400' : 'bg-pink-400'
                        }`}
                        style={{ width: `${Math.min(100, user.kpiPercentage)}%` }}
                      />
                    </div>

                    {/* Stats pills: Pancake, JST, Differ */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-3">
                        <span>Pancake: <strong className="text-slate-700">{formatNumber(user.totalPancake)}</strong></span>
                        <span>JST: <strong className="text-slate-700">{formatNumber(user.totalJst)}</strong></span>
                        <span className={`px-2 py-0.2 rounded-full font-medium ${
                          user.differ === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          Differ: {user.differ === 0 ? '0 (ตรงกัน)' : `${user.differ > 0 ? '+' : ''}${user.differ}`}
                        </span>
                      </div>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isPassed ? '✓ ผ่าน KPI' : 'รอเป้าหมาย'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Daily Records Table for Fast Analysis (ตารางสรุปข้อมูลล่าสุดรายวันเพื่อการวิเคราะห์ที่รวดเร็ว) */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-pink-100/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-slate-800">
                ตารางสรุปบันทึกยอดขายรายวัน (Daily Logs & Audit)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงข้อมูลล่าสุดรายวันเพื่อการวิเคราะห์ที่รวดเร็ว เปรียบเทียบ Pancake, JST และ Differ
            </p>
          </div>

          {/* Search box & Add button */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส, วันที่..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 w-44 sm:w-56"
              />
            </div>

            <button
              id="btn-add-record-table"
              onClick={onOpenNewRecord}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs font-medium shadow-sm hover:from-pink-500 hover:to-rose-500 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>บันทึกยอดขาย</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-pink-50/60 text-slate-600 border-b border-pink-100 font-heading">
                <th className="py-3 px-3 rounded-l-xl">วันที่</th>
                <th className="py-3 px-3">พนักงาน</th>
                <th className="py-3 px-3 text-right">ยอดขาย (บาท)</th>
                <th className="py-3 px-3 text-center">% KPI วันนี้</th>
                <th className="py-3 px-3 text-right">Pancake</th>
                <th className="py-3 px-3 text-right">JST System</th>
                <th className="py-3 px-3 text-center">Differ</th>
                <th className="py-3 px-3">หมายเหตุ</th>
                <th className="py-3 px-3 text-center rounded-r-xl">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedTableRecords.length > 0 ? (
                displayedTableRecords.map((record) => {
                  const dailyKpiPct = (record.salesAmount / DAILY_KPI_PER_PERSON) * 100;
                  const isDailyPassed = record.salesAmount >= DAILY_KPI_PER_PERSON;
                  const allowEdit = canEditRecord(record);

                  return (
                    <tr key={record.id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {formatThaiDate(record.date)}
                      </td>
                      
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-[10px] flex items-center justify-center font-bold">
                            {record.userId.replace('EMP-', '')}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800">{record.userName}</span>
                            <span className="text-[10px] text-slate-400 block">{record.userId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                        {formatCurrency(record.salesAmount)}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDailyPassed 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {dailyKpiPct.toFixed(1)}% {isDailyPassed ? '✓' : ''}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {formatNumber(record.pancakeOrders)}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {formatNumber(record.jstSystemOrders)}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          record.differ === 0 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {record.differ === 0 ? '0' : `${record.differ > 0 ? '+' : ''}${record.differ}`}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate text-[11px]">
                        {record.notes || '-'}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {allowEdit ? (
                            <button
                              onClick={() => onEditRecord(record)}
                              title="แก้ไขบันทึก"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">-</span>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => onDeleteRecord(record.id)}
                              title="ลบบันทึก (Admin only)"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                    ไม่พบรายการบันทึกยอดขายในช่วงเวลาที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            รวมทั้งสิ้น <span className="font-semibold text-slate-800">{displayedTableRecords.length}</span> รายการ
          </div>
          <div className="flex items-center gap-4">
            <span>ยอดรวม: <strong className="text-slate-800">{formatCurrency(totalSales)}</strong></span>
            <span>Pancake: <strong className="text-slate-800">{formatNumber(totalPancake)}</strong></span>
            <span>JST: <strong className="text-slate-800">{formatNumber(totalJst)}</strong></span>
            <span>Differ รวม: <strong className={totalDiffer === 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {totalDiffer === 0 ? '0' : `${totalDiffer > 0 ? '+' : ''}${totalDiffer}`}
            </strong></span>
          </div>
        </div>
      </div>

    </div>
  );
};
