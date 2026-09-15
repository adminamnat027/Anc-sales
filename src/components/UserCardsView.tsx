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
  getPeriodDays
} from '../utils/kpiCalculator';
import { 
  Filter, 
  Clock, 
  PlusCircle, 
  ShoppingBag, 
  Database, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Award,
  Sparkles,
  Search
} from 'lucide-react';

interface UserCardsViewProps {
  currentUser: User | null;
  allUsers: User[];
  records: SalesRecord[];
  onOpenNewRecord: (preselectedUserId?: string) => void;
}

export const UserCardsView: React.FC<UserCardsViewProps> = ({
  currentUser,
  allUsers,
  records,
  onOpenNewRecord
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [period, setPeriod] = useState<TimeFilterPeriod>('daily');
  const [singleDate, setSingleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const daysCount = useMemo(() => {
    return getPeriodDays(period, customRange);
  }, [period, customRange]);

  const isEmployee = currentUser?.role === 'employee';

  const effectiveUserId = useMemo(() => {
    if (isEmployee && currentUser) {
      return currentUser.id;
    }
    return selectedUserId;
  }, [isEmployee, currentUser, selectedUserId]);

  const filteredRecords = useMemo(() => {
    return filterRecordsByPeriod(
      records,
      period,
      effectiveUserId,
      customRange,
      singleDate
    );
  }, [records, period, effectiveUserId, customRange, singleDate]);

  const userSummaries = useMemo(() => {
    let summaries = calculateUserSummaries(allUsers, filteredRecords, period, customRange);
    if (isEmployee && currentUser) {
      summaries = summaries.filter(s => s.userId === currentUser.id);
    } else if (selectedUserId !== 'all') {
      summaries = summaries.filter(s => s.userId === selectedUserId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      summaries = summaries.filter(s => 
        s.userName.toLowerCase().includes(q) || 
        s.userId.toLowerCase().includes(q)
      );
    }
    return summaries;
  }, [allUsers, filteredRecords, period, customRange, isEmployee, currentUser, selectedUserId, searchQuery]);

  const targetPerPerson = DAILY_KPI_PER_PERSON * daysCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Filter Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-pink-100/80 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* User selector & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Filter className="w-4 h-4 text-pink-500" />
              <span>User:</span>
            </div>
            
            {isEmployee && currentUser ? (
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{currentUser.name} ({currentUser.id})</span>
              </div>
            ) : (
              <>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="px-3 py-1.5 bg-pink-50/50 hover:bg-pink-50 border border-pink-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer"
                >
                  <option value="all">👥 ทั้งหมด ({allUsers.length} คน)</option>
                  {allUsers
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.id} - {user.name} ({user.role === 'employee' ? 'พนักงาน' : user.role === 'manager' ? 'ผู้จัดการ' : 'แอดมิน'})
                      </option>
                    ))}
                </select>

                {/* Quick Search for many users */}
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อหรือรหัส..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 pr-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-200 w-36 sm:w-44 transition-all"
                  />
                </div>
              </>
            )}
          </div>

          {/* Time filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
            <button
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

        {/* Date Selector Row */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>ช่วงเวลาคำนวณ KPI ({daysCount} วัน):</span>
            <span className="font-semibold text-slate-800">
              {period === 'daily' && `ประจำวันที่ ${formatThaiDate(singleDate)}`}
              {period === 'weekly' && `7 วันล่าสุด`}
              {period === 'monthly' && `30 วันล่าสุด`}
              {period === 'yearly' && `1 ปี`}
              {period === 'custom' && `${formatThaiDate(customRange.startDate)} ถึง ${formatThaiDate(customRange.endDate)}`}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-pink-50 text-pink-600 font-medium border border-pink-100">
              เป้าหมายรายคน: {formatCurrency(targetPerPerson)}
            </span>
          </div>

          {period === 'daily' && (
            <div className="flex items-center gap-2">
              <label className="text-slate-500">เลือกวันที่:</label>
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

      {/* Grid of User Boxes: รูป ID, ชื่อ, ยอดขาย, จำนวน Pancake, จำนวนระบบ JST, ค่า Differ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {userSummaries.map((user) => {
          const isPassed = user.isKpiPassed;
          const userObj = allUsers.find(u => u.id === user.userId);
          const canAddForUser = 
            currentUser?.role === 'admin' || 
            currentUser?.role === 'manager' || 
            (currentUser?.role === 'employee' && currentUser.id === user.userId);

          return (
            <div
              key={user.userId}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-pink-100/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Top Corner Ribbon / Badge */}
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  isPassed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isPassed ? (
                    <>
                      <Award className="w-3 h-3 text-emerald-500" />
                      <span>ผ่าน ({user.kpiPercentage.toFixed(0)}%)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{user.kpiPercentage.toFixed(0)}% เป้า</span>
                    </>
                  )}
                </span>
              </div>

              {/* Profile Header: รูป, ID, ชื่อ */}
              <div>
                <div className="flex items-center gap-2.5 pr-18">
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.userName}
                      className="w-11 h-11 rounded-xl border border-pink-200 bg-pink-50 object-cover shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-pink-200 flex items-center justify-center text-[9px] font-bold text-rose-500">
                      ★
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-100 text-rose-700 font-bold">
                        {user.userId}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {userObj?.position || 'ฝ่ายขาย'}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-sm text-slate-800 mt-0.5 truncate" title={user.userName}>
                      {user.userName}
                    </h3>
                  </div>
                </div>

                {/* Main Stat: ยอดขาย (Sales) */}
                <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-pink-50/70 via-rose-50/30 to-white border border-pink-100/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                    <span>ยอดขาย:</span>
                    <span className="text-[10px] text-slate-400">เป้า {formatCurrency(user.targetKpi)}</span>
                  </div>
                  <div className="text-base font-heading font-bold text-slate-800">
                    {formatCurrency(user.totalSales)}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-1.5 w-full h-1.5 bg-pink-100/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPassed ? 'bg-emerald-400' : 'bg-pink-400'
                      }`}
                      style={{ width: `${Math.min(100, user.kpiPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* 3 Metric Boxes: จำนวน Pancake, จำนวนระบบ JST, ค่า Differ */}
                <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
                  
                  {/* Pancake Orders */}
                  <div className="p-1.5 rounded-xl bg-amber-50/70 border border-amber-100/80">
                    <div className="flex items-center justify-center gap-0.5 text-[9px] font-medium text-amber-700 mb-0.5">
                      <ShoppingBag className="w-2.5 h-2.5" />
                      <span>Pancake</span>
                    </div>
                    <div className="font-heading font-bold text-xs text-slate-800">
                      {formatNumber(user.totalPancake)}
                    </div>
                  </div>

                  {/* JST System */}
                  <div className="p-1.5 rounded-xl bg-sky-50/70 border border-sky-100/80">
                    <div className="flex items-center justify-center gap-0.5 text-[9px] font-medium text-sky-700 mb-0.5">
                      <Database className="w-2.5 h-2.5" />
                      <span>ระบบ JST</span>
                    </div>
                    <div className="font-heading font-bold text-xs text-slate-800">
                      {formatNumber(user.totalJst)}
                    </div>
                  </div>

                  {/* ค่า Differ */}
                  <div className={`p-1.5 rounded-xl border ${
                    user.differ === 0 
                      ? 'bg-emerald-50/70 border-emerald-100/80' 
                      : 'bg-rose-50/70 border-rose-100/80'
                  }`}>
                    <div className="flex items-center justify-center gap-0.5 text-[9px] font-medium text-slate-700 mb-0.5">
                      <Scale className="w-2.5 h-2.5" />
                      <span>Differ</span>
                    </div>
                    <div className={`font-heading font-bold text-xs ${
                      user.differ === 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {user.differ === 0 ? '0' : `${user.differ > 0 ? '+' : ''}${user.differ}`}
                    </div>
                  </div>

                </div>
              </div>

              {/* Action: Add Record for this User */}
              {canAddForUser && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => onOpenNewRecord(user.userId)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-rose-600 text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>ลงยอดขาย</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
