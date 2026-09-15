import React, { useState, useEffect } from 'react';
import { User, SalesRecord, DAILY_KPI_PER_PERSON } from '../types';
import { formatCurrency, formatNumber } from '../utils/kpiCalculator';
import { PlusCircle, Sparkles, CheckCircle, AlertTriangle, Calculator, FileEdit } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SalesRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (record: Partial<SalesRecord>) => void;
  currentUser: User;
  allUsers: User[];
  editingRecord?: SalesRecord | null;
}

export const SalesRecordModal: React.FC<SalesRecordModalProps> = ({
  isOpen,
  onClose,
  onSaveRecord,
  currentUser,
  allUsers,
  editingRecord
}) => {
  const isEmployee = currentUser.role === 'employee';
  const employeeUsers = allUsers.filter(u => u.role === 'employee');

  const [selectedUserId, setSelectedUserId] = useState<string>(
    editingRecord ? editingRecord.userId : isEmployee ? currentUser.id : (employeeUsers[0]?.id || currentUser.id)
  );
  const [date, setDate] = useState<string>(
    editingRecord ? editingRecord.date : new Date().toISOString().split('T')[0]
  );
  const [salesAmount, setSalesAmount] = useState<number | string>(
    editingRecord ? editingRecord.salesAmount : 185000
  );
  const [pancakeOrders, setPancakeOrders] = useState<number | string>(
    editingRecord ? editingRecord.pancakeOrders : 130
  );
  const [jstSystemOrders, setJstSystemOrders] = useState<number | string>(
    editingRecord ? editingRecord.jstSystemOrders : 130
  );
  const [notes, setNotes] = useState<string>(editingRecord ? editingRecord.notes || '' : '');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingRecord) {
      setSelectedUserId(editingRecord.userId);
      setDate(editingRecord.date);
      setSalesAmount(editingRecord.salesAmount);
      setPancakeOrders(editingRecord.pancakeOrders);
      setJstSystemOrders(editingRecord.jstSystemOrders);
      setNotes(editingRecord.notes || '');
    } else {
      setSelectedUserId(isEmployee ? currentUser.id : (employeeUsers[0]?.id || currentUser.id));
      setDate(new Date().toISOString().split('T')[0]);
      setSalesAmount(185000);
      setPancakeOrders(130);
      setJstSystemOrders(130);
      setNotes('');
    }
  }, [editingRecord, isOpen, currentUser, isEmployee]);

  if (!isOpen) return null;

  const numSales = Number(salesAmount) || 0;
  const numPancake = Number(pancakeOrders) || 0;
  const numJst = Number(jstSystemOrders) || 0;
  const differ = numPancake - numJst;
  const kpiPercentage = DAILY_KPI_PER_PERSON > 0 ? (numSales / DAILY_KPI_PER_PERSON) * 100 : 0;
  const isKpiPassed = numSales >= DAILY_KPI_PER_PERSON;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (numSales < 0 || numPancake < 0 || numJst < 0) {
      setErrorMsg('กรุณากรอกตัวเลขที่ถูกต้อง ไม่สามารถเป็นค่าลบได้');
      return;
    }

    const matchedUser = allUsers.find(u => u.id === selectedUserId);
    const userName = matchedUser ? matchedUser.name : currentUser.name;

    // Trigger celebratory confetti if hitting KPI!
    if (isKpiPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fde047']
        });
      } catch (e) {
        // ignore confetti errors
      }
    }

    onSaveRecord({
      id: editingRecord ? editingRecord.id : `REC-${Date.now().toString().slice(-5)}`,
      userId: selectedUserId,
      userName: userName,
      date: date,
      salesAmount: numSales,
      pancakeOrders: numPancake,
      jstSystemOrders: numJst,
      differ: differ,
      notes: notes,
      createdAt: editingRecord ? editingRecord.createdAt : new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFDFB] w-full max-w-lg rounded-3xl shadow-2xl border border-pink-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-amber-50 p-5 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-500">
              {editingRecord ? <FileEdit className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg text-slate-800">
                {editingRecord ? 'แก้ไขบันทึกยอดขาย' : 'บันทึกยอดขายพนักงาน'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Pancake Orders vs JST System • KPI 185,000 ฿/วัน
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* User selector & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                พนักงาน (Employee) {isEmployee && <span className="text-slate-400">(สิทธิ์เฉพาะตนเอง)</span>}
              </label>
              {isEmployee ? (
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 flex items-center gap-2">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-5 h-5 rounded-full" />
                  <span className="truncate">{currentUser.name}</span>
                </div>
              ) : (
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white cursor-pointer"
                >
                  {employeeUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.id} - {user.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                วันที่บันทึก (Date) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
              />
            </div>
          </div>

          {/* Sales Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">
                ยอดขาย (บาท / THB) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                เป้าหมายรายวัน: {formatCurrency(DAILY_KPI_PER_PERSON)}
              </span>
            </div>
            <input
              type="number"
              required
              min="0"
              step="100"
              value={salesAmount}
              onChange={e => setSalesAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
              placeholder="185000"
            />
          </div>

          {/* Real-time KPI Card */}
          <div className={`p-3 rounded-2xl border transition-all ${
            isKpiPassed 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50/70 border-amber-200 text-amber-800'
          }`}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-medium">
                {isKpiPassed ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>ผ่านเป้าหมาย KPI ประจำวัน! ({kpiPercentage.toFixed(1)}%)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>ยังขาดอีก {formatCurrency(Math.max(0, DAILY_KPI_PER_PERSON - numSales))} ({kpiPercentage.toFixed(1)}%)</span>
                  </>
                )}
              </div>
              <span className="font-semibold">{formatCurrency(numSales)}</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isKpiPassed ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, kpiPercentage)}%` }}
              />
            </div>
          </div>

          {/* Pancake Orders vs JST System */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                จำนวนออเดอร์ Pancake <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={pancakeOrders}
                onChange={e => setPancakeOrders(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
                placeholder="เช่น 130"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                จำนวนในระบบ JST <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={jstSystemOrders}
                onChange={e => setJstSystemOrders(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
                placeholder="เช่น 130"
              />
            </div>
          </div>

          {/* Real-time Differ Display Box */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            differ === 0
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
              : differ > 0
              ? 'bg-orange-50/80 border-orange-200 text-orange-800'
              : 'bg-rose-50/80 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold">
                  Differ (Pancake - JST):
                </span>
                <span className="text-base font-bold">
                  {differ === 0 ? '0' : `${differ > 0 ? '+' : ''}${differ}`}
                </span>
              </div>

              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                differ === 0 
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {differ === 0 
                  ? '✓ ข้อมูลตรงกัน 100%' 
                  : differ > 0 
                  ? '⚠️ Pancake เกินระบบ JST' 
                  : '⚠️ JST เกินระบบ Pancake'}
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-1">
              {differ === 0 
                ? 'ออเดอร์ในระบบ Pancake ตรงกับบันทึกใน JST เรียบร้อย' 
                : 'กรุณาระบุหมายเหตุหรือตรวจสอบรายการบิลที่ยังไม่ได้ตัดสต็อก/ลูกค้ายกเลิก'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              หมายเหตุ / บันทึกเพิ่มเติม
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="ระบุสาเหตุ Differ หรือรายละเอียดเพิ่มเติม..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-semibold shadow-md shadow-pink-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{editingRecord ? 'บันทึกการแก้ไข' : 'ยืนยันบันทึกยอดขาย'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
