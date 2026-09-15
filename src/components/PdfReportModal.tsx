import React from 'react';
import { UserSalesSummary, SalesRecord, DAILY_KPI_PER_PERSON } from '../types';
import { formatCurrency, formatNumber, formatThaiDate } from '../utils/kpiCalculator';
import { Printer, Download, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateSalesPdf } from '../utils/pdfGenerator';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaries: UserSalesSummary[];
  records: SalesRecord[];
  periodLabel: string;
  totalSales: number;
  totalPancake: number;
  totalJst: number;
  totalDiffer: number;
  targetKpiTotal: number;
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  summaries,
  records,
  periodLabel,
  totalSales,
  totalPancake,
  totalJst,
  totalDiffer,
  targetKpiTotal
}) => {
  if (!isOpen) return null;

  const overallKpiPct = targetKpiTotal > 0 ? (totalSales / targetKpiTotal) * 100 : 0;
  const isOverallPassed = totalSales >= targetKpiTotal;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generateSalesPdf(
      summaries,
      records,
      periodLabel,
      totalSales,
      totalPancake,
      totalJst,
      totalDiffer,
      targetKpiTotal
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FFFDFB] w-full max-w-4xl rounded-3xl shadow-2xl border border-pink-100 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-amber-50 p-4 border-b border-pink-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-base text-slate-800">
                พรีวิวรายงานเอกสารสรุป PDF (Sales Audit Report)
              </h2>
              <p className="text-[11px] text-slate-500">
                เกณฑ์ KPI 185,000 บาท/คน/วัน • สรุปข้อมูลรายบุคคลและผลต่าง Differ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>พิมพ์รายงาน (Print)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold shadow-sm shadow-pink-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดไฟล์ PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer text-xs ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* A4 Printable Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50 print:bg-white print:p-0">
          <div className="bg-white max-w-3xl mx-auto p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200/80 print:shadow-none print:border-none print:p-0">
            
            {/* Document Letterhead */}
            <div className="border-b-2 border-rose-200 pb-5 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-pink-100 text-rose-700 font-bold">
                      INTERNAL AUDIT
                    </span>
                    <span className="text-xs text-slate-400">
                      Doc No: RPT-{new Date().toISOString().split('T')[0].replace(/-/g, '')}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 font-heading">
                    รายงานสรุปยอดขายและการตรวจสอบระบบ (Sales & Audit Report)
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    เปรียบเทียบคำนวณ KPI รายวัน/สัปดาห์/เดือน/ปี และผลต่าง Pancake vs JST
                  </p>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div><strong>วันที่ออกรายงาน:</strong> {new Date().toLocaleDateString('th-TH')}</div>
                  <div><strong>เวลา:</strong> {new Date().toLocaleTimeString('th-TH')}</div>
                  <div className="text-rose-600 font-semibold mt-1">KPI: 185,000 ฿/คน/วัน</div>
                </div>
              </div>

              {/* Summary Metadata Strip */}
              <div className="mt-4 p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex flex-wrap items-center justify-between text-xs text-slate-700">
                <div>
                  <span className="text-slate-500">ช่วงเวลาสรุป: </span>
                  <strong className="text-slate-800">{periodLabel}</strong>
                </div>
                <div>
                  <span className="text-slate-500">ยอดขายรวม: </span>
                  <strong className="text-rose-700">{formatCurrency(totalSales)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">ความสำเร็จ KPI: </span>
                  <strong className={isOverallPassed ? 'text-emerald-700' : 'text-amber-700'}>
                    {overallKpiPct.toFixed(1)}% ({isOverallPassed ? 'ผ่านเกณฑ์' : 'รอเป้า'})
                  </strong>
                </div>
              </div>
            </div>

            {/* 8. Required PDF Table Columns: ID, ชื่อ, ยอดขาย, % ยอดขายเทียบ KPI, ออเดอร์ Pancake, จำนวนในระบบ JST, Differ */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 font-heading flex items-center justify-between">
                <span>ตารางสรุปรายบุคคล (Summary by Employee)</span>
                <span className="text-xs text-slate-500 font-normal">จำนวน {summaries.length} คน</span>
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">ชื่อ</th>
                      <th className="py-2.5 px-3 text-right">ยอดขาย (บาท)</th>
                      <th className="py-2.5 px-3 text-center">% ยอดขายเทียบ KPI</th>
                      <th className="py-2.5 px-3 text-right">ออเดอร์ Pancake</th>
                      <th className="py-2.5 px-3 text-right">จำนวนในระบบ JST</th>
                      <th className="py-2.5 px-3 text-center">Differ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summaries.map((s) => {
                      const isPassed = s.isKpiPassed;
                      return (
                        <tr key={s.userId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{s.userId}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{s.userName}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                            {formatCurrency(s.totalSales)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {s.kpiPercentage.toFixed(1)}% {isPassed ? '✓' : ''}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                            {formatNumber(s.totalPancake)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                            {formatNumber(s.totalJst)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] ${
                              s.differ === 0 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {s.differ === 0 ? '0' : `${s.differ > 0 ? '+' : ''}${s.differ}`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-rose-50/70 font-bold border-t border-rose-200 text-slate-800">
                      <td colSpan={2} className="py-3 px-3">รวมทั้งหมด</td>
                      <td className="py-3 px-3 text-right text-rose-700">{formatCurrency(totalSales)}</td>
                      <td className="py-3 px-3 text-center">{overallKpiPct.toFixed(1)}%</td>
                      <td className="py-3 px-3 text-right">{formatNumber(totalPancake)}</td>
                      <td className="py-3 px-3 text-right">{formatNumber(totalJst)}</td>
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

            {/* Audit Findings & Explanation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-8 space-y-1.5">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>เกณฑ์การวิเคราะห์ระบบ (Audit Metrics):</span>
              </div>
              <p>• <strong>เกณฑ์ยอดขาย (KPI):</strong> กำหนดเป้าหมายมาตรฐาน 185,000 บาท/คน/วัน โดยคำนวณตามจำนวนวันและพนักงานในช่วงเวลาที่เลือก</p>
              <p>• <strong>Differ (ผลต่าง):</strong> คำนวณจาก [จำนวนออเดอร์ Pancake] ลบ [จำนวนในระบบ JST]</p>
              <p>• หาก Differ เป็น 0 แสดงว่ายอดออเดอร์ใน Pancake ตัดสต็อกตรงกับบันทึกใน JST เรียบร้อยสมบูรณ์</p>
            </div>

            {/* Signature Area */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
              <div>
                <div className="h-14 border-b border-dashed border-slate-300 w-48 mx-auto" />
                <p className="mt-2 font-medium text-slate-800">ผู้จัดทำรายงาน (Prepared by)</p>
                <p className="text-[11px] text-slate-400">เจ้าหน้าที่ฝ่ายขาย / บันทึกข้อมูล</p>
              </div>

              <div>
                <div className="h-14 border-b border-dashed border-slate-300 w-48 mx-auto" />
                <p className="mt-2 font-medium text-slate-800">ผู้ตรวจสอบและอนุมัติ (Approved by)</p>
                <p className="text-[11px] text-slate-400">ผู้จัดการฝ่ายขาย / ผู้ดูแลระบบ</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
