import React, { useState } from 'react';
import { User } from '../types';
import { 
  LogIn, 
  UserPlus, 
  KeyRound, 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Database,
  Lock
} from 'lucide-react';

interface AuthGateViewProps {
  allUsers: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (newUser: User) => void;
}

export const AuthGateView: React.FC<AuthGateViewProps> = ({
  allUsers,
  onLoginSuccess,
  onRegisterSuccess
}) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');

  // Login form states
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form states
  const [regId, setRegId] = useState(`EMP-${Math.floor(100 + Math.random() * 900)}`);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('ทีมขายหน้าร้าน A');
  const [regPosition, setRegPosition] = useState('เจ้าหน้าที่ฝ่ายขาย (Sales)');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmed = loginId.trim();
    if (!trimmed || !loginPassword) {
      setLoginError('กรุณากรอก User ID / Email และ Password ให้ครบถ้วน');
      return;
    }

    const matched = allUsers.find(
      u => u.id.toLowerCase() === trimmed.toLowerCase() || u.email.toLowerCase() === trimmed.toLowerCase()
    );

    if (!matched) {
      setLoginError('ไม่พบข้อมูลผู้ใช้นี้ในระบบ กรุณาตรวจสอบ ID หรือสมัครสมาชิกใหม่');
      return;
    }

    if (matched.password && matched.password !== loginPassword) {
      setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      return;
    }

    onLoginSuccess(matched);
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regId.trim() || !regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    const existingId = allUsers.some(u => u.id.toLowerCase() === regId.trim().toLowerCase());
    if (existingId) {
      setRegError(`User ID "${regId}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`);
      return;
    }

    const existingEmail = allUsers.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (existingEmail) {
      setRegError(`อีเมล "${regEmail}" ถูกใช้งานไปแล้ว`);
      return;
    }

    const avatarSeeds = ['Aneka', 'Felix', 'Sawyer', 'Mimi', 'Jasper', 'Bailey', 'Oliver'];
    const randomSeed = avatarSeeds[Math.floor(Math.random() * avatarSeeds.length)];

    const newUser: User = {
      id: regId.trim().toUpperCase(),
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      role: 'employee',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}&backgroundColor=ffd5dc`,
      position: regPosition.trim() || 'เจ้าหน้าที่ฝ่ายขาย',
      department: regDepartment,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    onRegisterSuccess(newUser);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-pink-100/60 border border-pink-100/80 overflow-hidden">
        
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-pink-100 via-rose-100/70 to-amber-50 p-7 text-center border-b border-pink-100">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-800 tracking-tight">
            ระบบจัดเก็บยอด
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            กรุณาเข้าสู่ระบบเพื่อตรวจสอบสิทธิ์การใช้งาน
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-emerald-200/60 text-[11px] text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Database className="w-3 h-3 text-emerald-600" />
            <span>Cloud Database ออนไลน์</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveMode('login')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'login'
                ? 'bg-white text-pink-600 border-b-2 border-pink-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>เข้าสู่ระบบ (Log-in)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('register')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'register'
                ? 'bg-white text-pink-600 border-b-2 border-pink-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>ลงทะเบียนพนักงาน (Register)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {activeMode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  User ID หรือ Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="เช่น AD-001, ADMIN2008 หรือ email"
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
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
                    placeholder="กรอกรหัสผ่านของคุณ"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-medium text-sm shadow-md shadow-pink-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>เข้าสู่ระบบเพื่อตรวจสอบสิทธิ์</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                <span>ยังไม่มีบัญชีพนักงาน? </span>
                <button
                  type="button"
                  onClick={() => setActiveMode('register')}
                  className="font-semibold text-pink-600 hover:text-pink-700 underline cursor-pointer"
                >
                  ลงทะเบียนใหม่ที่นี่
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    รหัสพนักงาน (ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regId}
                    onChange={e => setRegId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    สิทธิ์การใช้งาน
                  </label>
                  <div className="w-full py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700 text-center">
                    พนักงาน (Employee)
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="เช่น คุณสมชาย ใจดี"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  อีเมล (Email) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="somchai@company.co.th"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    แผนก
                  </label>
                  <select
                    value={regDepartment}
                    onChange={e => setRegDepartment(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
                  >
                    <option value="ทีมขายหน้าร้าน A">ทีมขายหน้าร้าน A</option>
                    <option value="ทีมขายออนไลน์ B">ทีมขายออนไลน์ B</option>
                    <option value="ทีมขายสาขา C">ทีมขายสาขา C</option>
                    <option value="ทีมบริการลูกค้า">ทีมบริการลูกค้า</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ตำแหน่ง
                  </label>
                  <input
                    type="text"
                    placeholder="Sales Officer"
                    value={regPosition}
                    onChange={e => setRegPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    รหัสผ่าน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="รหัสผ่าน"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="ยืนยันอีกครั้ง"
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium text-sm shadow-md shadow-emerald-100 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>สมัครสมาชิกและเข้าสู่ระบบ</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                <span>มีบัญชีผู้ใช้อยู่แล้ว? </span>
                <button
                  type="button"
                  onClick={() => setActiveMode('login')}
                  className="font-semibold text-pink-600 hover:text-pink-700 underline cursor-pointer"
                >
                  เข้าสู่ระบบที่นี่
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security and role note */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
            <span>ระบบตรวจสอบสิทธิ์ 3 ระดับ (Admin / Manager / Employee)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
