import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, User as UserIcon, Mail, KeyRound, Sparkles, CheckSquare, Square, AlertCircle } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (newUser: User) => void;
  onSwitchToLogin: () => void;
  existingUsers: User[];
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onSwitchToLogin,
  existingUsers
}) => {
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanId = userId.trim();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanId || !cleanName || !cleanEmail || !password) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('กรุณาคลิกเลือก "ยินยอมรับเงื่อนไขและนโยบายการใช้งาน"');
      return;
    }

    // Check if ID already exists
    const idConflict = existingUsers.some(u => u.id.toLowerCase() === cleanId.toLowerCase());
    if (idConflict) {
      setErrorMsg(`User ID "${cleanId}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`);
      return;
    }

    // Check email format
    if (!cleanEmail.includes('@')) {
      setErrorMsg('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    const pastelColors = ['ffd5dc', 'd8b4fe', 'fbcfe8', 'bae6fd', 'bbf7d0', 'fed7aa'];
    const randomBg = pastelColors[Math.floor(Math.random() * pastelColors.length)];

    const newUser: User = {
      id: cleanId.toUpperCase(),
      name: cleanName,
      email: cleanEmail,
      password: password,
      role: role,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=${randomBg}`,
      position: role === 'employee' ? 'พนักงานขาย (Sales Officer)' : role === 'manager' ? 'ผู้จัดการ (Manager)' : 'ผู้ดูแลระบบ (Admin)',
      department: 'ทีมขาย',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    onRegisterSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFDFB] w-full max-w-md rounded-3xl shadow-2xl border border-pink-100 overflow-hidden relative">
        
        {/* Pastel Header */}
        <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-amber-50 p-6 border-b border-pink-100 text-center relative">
          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center text-rose-500">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-semibold text-2xl text-slate-800">
            สมัครสมาชิกใหม่ (Register)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สร้างบัญชีผู้ใช้สำหรับระบบบันทึกยอดขายและตรวจสอบสิทธิ์
          </p>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ID User (รหัสพนักงาน) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="เช่น EMP-105"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ชื่อ-นามสกุล <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น คุณกฤษณา ชัยศิลป์"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email (อีเมล) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@company.co.th"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password (รหัสผ่าน) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="กำหนดรหัสผ่านอย่างน้อย 4 ตัวอักษร"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ระดับสิทธิ์การใช้งาน (User Role)
              </label>
              <div className="w-full">
                <div className="p-2.5 rounded-xl text-xs font-medium border text-center bg-emerald-50 border-emerald-200 text-emerald-800 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>พนักงาน (Employee)</span>
                </div>
              </div>
            </div>

            {/* Checkbox Consent (check ยินยอม) */}
            <div className="pt-2">
              <label 
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-pink-50/60 border border-pink-100 cursor-pointer hover:bg-pink-50 transition-colors"
              >
                <div className="mt-0.5 text-pink-600 shrink-0">
                  {agreeTerms ? (
                    <CheckSquare className="w-5 h-5 fill-pink-500 text-white" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="text-xs text-slate-700 leading-snug">
                  <span className="font-medium text-slate-800">check ยินยอม: </span>
                  ข้าพเจ้ายินยอมรับเงื่อนไขและข้อตกลงการใช้งาน รวมถึงนโยบายการบันทึกและตรวจสอบยอดขายในระบบ
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-medium text-sm shadow-md shadow-pink-200 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ยืนยันการสมัคร User</span>
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-4 text-center text-xs text-slate-500">
            <span>มีบัญชีอยู่แล้ว? </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToLogin();
              }}
              className="font-medium text-pink-600 hover:text-pink-700 underline cursor-pointer"
            >
              เข้าสู่ระบบที่นี่
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
