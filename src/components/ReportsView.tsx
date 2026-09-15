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
  getTargetKpi,
  exportToCsv
} from '../utils/kpiCalculator';
import { 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  Clock, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Eye, 
  TrendingUp, 
  ShoppingBag, 
  Database, 
  Scale, 
  Sparkles 
} from 'lucide-react';
import { generateSalesPdf } from '../utils/pdfGenerator';
import { PdfReportModal } from './PdfReportModal';

interface ReportsViewProps {
  currentUser: User | null;
  allUsers: User[];
  records: SalesRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentUser,
  allUsers,
  records
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [period, setPeriod] = useState<TimeFilterPeriod>('daily');
  const [singleDate, setSingleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [copied, setCopied] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const daysCount = useMemo(() => {
    return getPeriodDays(period, customRange);
  }, [period, customRange]);

  const activeEmployeeUsers = useMemo(() => {
    const employees = allUsers.filter(u => u.role === 'employee');
    if (selectedUserId !== 'all') {
      return employees.filter(u => u.id === selectedUserId);
    }
    return employees;
  }, [allUsers, selectedUserId]);

  const filteredRecords = useMemo(() => {
    return filterRecordsByPeriod(
      records,
      period,
      selectedUserId,
      customRange,
      singleDate
    );
  }, [records, period, selectedUserId, customRange, singleDate]);

  const summaries = useMemo(() => {
    const calculated = calculateUserSummaries(allUsers, filteredRecords, period, customRange);
    if (selectedUserId !== 'all') {
      return calculated.filter(s => s.userId === selectedUserId);
    }
    return calculated;
  }, [allUsers, filteredRecords, period, customRange, selectedUserId]);

  const targetKpiTotal = useMemo(() => {
    return getTargetKpi(period, activeEmployeeUsers.length, customRange);
  }, [period, activeEmployeeUsers, customRange]);

  const totalSales = useMemo(() => {
    return summaries.reduce((sum, s) => sum + s.totalSales, 0);
  }, [summaries]);

  const totalPancake = useMemo(() => {
    return summaries.reduce((sum, s) => sum + s.totalPancake, 0);
  }, [summaries]);

  const totalJst = useMemo(() => {
    return summaries.reduce((sum, s) => sum + s.totalJst, 0);
  }, [summaries]);

  const totalDiffer = totalPancake - totalJst;
  const overallKpiPct = targetKpiTotal > 0 ? (totalSales / targetKpiTotal) * 100 : 0;
  const isOverallPassed = totalSales >= targetKpiTotal;

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily':
        return `รายวัน (${formatThaiDate(singleDate)})`;
      case 'weekly':
        return `รายสัปดาห์ (7 วันย้อนหลัง)`;
      case 'monthly':
        return `รายเดือน (30 วันย้อนหลัง)`;
      case 'yearly':
        return `รายปี (365 วัน)`;
      case 'custom':
        return `ช่วงเวลาที่เลือก (${formatThaiDate(customRange.startDate)} - ${formatThaiDate(customRange.endDate)})`;
    }
  };

  // 1. Google Sheets Export handler
  const handleExportSheets = () => {
    exportToCsv(summaries, filteredRecords, getPeriodLabel());
  };

  // Copy data formatted for pasting into Google Sheets
  const handleCopyForSheets = () => {
    let tsv = `ID\tชื่อ\tยอดขาย (บาท)\t% ยอดขายเทียบ KPI\tออเดอร์ Pancake\tจำนวนในระบบ JST\tDiffer\tสถานะ KPI\n`;
    summaries.forEach(s => {
      tsv += `${s.userId}\t${s.userName}\t${s.totalSales}\t${s.kpiPercentage.toFixed(1)}%\t${s.totalPancake}\t${s.totalJst}\t${s.differ}\t${s.isKpiPassed ? 'ผ่านเกณฑ์' : 'รอเป้า'}\n`;
    });
    navigator.clipboard.writeText(tsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // 2. PDF Export handler (Download directly)
  const handleDownloadPdf = () => {
    generateSalesPdf(
      summaries,
      filteredRecords,
      getPeriodLabel(),
      totalSales,
      totalPancake,
      totalJst,
      totalDiffer,
      targetKpiTotal
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Filter Bar with Dropdown User & Time Period (รายวัน, รายสัปดาห์, รายเดือน, รายปี, กำหนดเอง) */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-pink-100/80 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* User selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="w-4 h-4 text-pink-500" />
              <span>เรียกดูข้อมูล User:</span>
            </div>
            
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="px-3.5 py-2 bg-pink-50/50 hover:bg-pink-50 border border-pink-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer"
            >
              <option value="all">👥 พนักงานทั้งหมด (All)</option>
              {allUsers
                .filter(u => u.role === 'employee')
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.id} - {user.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Time Filter Tabs */}
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

        {/* Date Row */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>ช่วงเวลาคำนวณ: </span>
            <strong className="text-slate-800">{getPeriodLabel()}</strong>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-pink-50 text-rose-600 font-medium border border-pink-100">
              เกณฑ์ KPI 185,000 ฿/คน/วัน
            </span>
          </div>

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

      {/* Primary Export Action Cards: ปุ่มรายงาน Sheets กับ ปุ่มรายงาน PDF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card: รายงาน Google Sheets */}
        <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white rounded-3xl p-6 border border-emerald-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                Google Sheets / Excel CSV
              </span>
            </div>

            <h3 className="font-heading font-semibold text-xl text-slate-800 mt-4">
              รายงาน Sheets (Google Sheets)
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              ส่งออกข้อมูลยอดขาย ออเดอร์ Pancake, JST, Differ และคำนวณ KPI รายวัน/สัปดาห์/เดือน/ปี เข้าสู่ Google Sheets ทันที
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-emerald-100 flex flex-wrap items-center gap-2">
            <button
              id="btn-export-sheets"
              onClick={handleExportSheets}
              className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ Sheets (CSV)</span>
            </button>

            <button
              onClick={handleCopyForSheets}
              className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              title="คัดลอกตารางไปวางใน Google Sheet โดยตรง"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกตาราง'}</span>
            </button>

            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 transition-colors cursor-pointer"
              title="เปิด Google Sheets แผ่นใหม่ในแท็บใหม่"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Card: รายงาน PDF */}
        <div className="bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white rounded-3xl p-6 border border-pink-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-100/70 text-rose-800 border border-rose-200">
                Print & Audit PDF
              </span>
            </div>

            <h3 className="font-heading font-semibold text-xl text-slate-800 mt-4">
              รายงาน PDF (PDF Audit Report)
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              สร้างเอกสาร PDF สรุปข้อมูลครบถ้วน: ID, ชื่อ, ยอดขาย, % ยอดขายเทียบ KPI, ออเดอร์ Pancake, จำนวนในระบบ JST, Differ
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-pink-100 flex flex-wrap items-center gap-2">
            <button
              id="btn-preview-pdf"
              onClick={() => setShowPdfModal(true)}
              className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold shadow-sm shadow-pink-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>พรีวิวและพิมพ์เอกสาร PDF</span>
            </button>

            <button
              id="btn-download-pdf-direct"
              onClick={handleDownloadPdf}
              className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด PDF</span>
            </button>
          </div>
        </div>

      </div>

      {/* 8. Table Matching User Request: ID, ชื่อ, ยอดขาย, % ยอดขายเทียบ KPI, ออเดอร์ Pancake, จำนวนในระบบ JST, Differ */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-pink-100/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 text-rose-700 font-bold">
                ข้อ 8
              </span>
              <h3 className="font-heading font-semibold text-lg text-slate-800">
                ข้อมูลสรุปรายงาน (Data Preview for Sheets & PDF)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดง ID, ชื่อ, ยอดขาย, % ยอดขายเทียบ KPI (185,000 ฿/วัน), ออเดอร์ Pancake, จำนวนในระบบ JST และ Differ
            </p>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            เป้าหมาย KPI รวม: <strong className="text-slate-800">{formatCurrency(targetKpiTotal)}</strong>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-pink-50/60 text-slate-700 font-heading border-b border-pink-100">
                <th className="py-3 px-3 rounded-l-xl">ID User</th>
                <th className="py-3 px-3">ชื่อ</th>
                <th className="py-3 px-3 text-right">ยอดขาย (บาท)</th>
                <th className="py-3 px-3 text-center">% ยอดขายเทียบ KPI</th>
                <th className="py-3 px-3 text-right">ออเดอร์ Pancake</th>
                <th className="py-3 px-3 text-right">จำนวนในระบบ JST</th>
                <th className="py-3 px-3 text-center rounded-r-xl">Differ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map((row) => {
                const isPassed = row.isKpiPassed;
                return (
                  <tr key={row.userId} className="hover:bg-pink-50/25 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                        {row.userId}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={row.avatar}
                          alt={row.userName}
                          className="w-6 h-6 rounded-full border border-pink-200 bg-white"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-semibold text-slate-800">{row.userName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-slate-800">
                      {formatCurrency(row.totalSales)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isPassed 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {row.kpiPercentage.toFixed(1)}% {isPassed ? '✓' : ''}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                      {formatNumber(row.totalPancake)}
                    </td>

                    <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                      {formatNumber(row.totalJst)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        row.differ === 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {row.differ === 0 ? '0' : `${row.differ > 0 ? '+' : ''}${row.differ}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-rose-50/70 font-bold border-t border-rose-200 text-slate-800 text-xs">
                <td colSpan={2} className="py-3 px-3">
                  รวมทั้งหมด ({summaries.length} พนักงาน)
                </td>
                <td className="py-3 px-3 text-right text-rose-700">
                  {formatCurrency(totalSales)}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={isOverallPassed ? 'text-emerald-700' : 'text-amber-700'}>
                    {overallKpiPct.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  {formatNumber(totalPancake)}
                </td>
                <td className="py-3 px-3 text-right">
                  {formatNumber(totalJst)}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={totalDiffer === 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {totalDiffer === 0 ? '0' : `${totalDiffer > 0 ? '+' : ''}${totalDiffer}`}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* PDF Modal */}
      <PdfReportModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        summaries={summaries}
        records={filteredRecords}
        periodLabel={getPeriodLabel()}
        totalSales={totalSales}
        totalPancake={totalPancake}
        totalJst={totalJst}
        totalDiffer={totalDiffer}
        targetKpiTotal={targetKpiTotal}
      />

    </div>
  );
};
