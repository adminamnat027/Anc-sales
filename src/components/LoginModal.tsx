import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, KeyRound, ShieldAlert, Sparkles, User as UserIcon } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
  allUsers: User[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
  allUsers
}) => {
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedId = userIdInput.trim();
    if (!trimmedId || !passwordInput) {
      setErrorMsg('กรุณากรอก User ID และ Password ให้ครบถ้วน');
      return;
    }

    // Match by ID (case insensitive) or Email
    const matchedUser = allUsers.find(
      u => u.id.toLowerCase() === trimmedId.toLowerCase() || u.email.toLowerCase() === trimmedId.toLowerCase()
    );

    if (!matchedUser) {
      setErrorMsg('ไม่พบข้อมูลผู้ใช้นี้ในระบบ กรุณาตรวจสอบ ID หรือสมัครสมาชิกใหม่');
      return;
    }

    // Check password (allow default password or matched)
    if (matchedUser.password && matchedUser.password !== passwordInput) {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      return;
    }

    onLoginSuccess(matchedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFDFB] w-full max-w-md rounded-3xl shadow-2xl border border-pink-100 overflow-hidden relative">
        
        {/* Pastel Top Header */}
        <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-amber-50 p-6 border-b border-pink-100 text-center relative">
          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center text-rose-500">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-semibold text-2xl text-slate-800">
            เข้าสู่ระบบ (Log-in)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ระบบบันทึกยอดขายพนักงาน และตรวจสอบสิทธิ์การเข้าใช้งาน
          </p>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ID User หรือ Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="เช่น AD-001, ADMIN2008 หรือ email"
                  value={userIdInput}
                  onChange={e => setUserIdInput(e.target.value)}
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
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-medium text-sm shadow-md shadow-pink-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-5 text-center text-xs text-slate-500">
            <span>ยังไม่มีบัญชีผู้ใช้งาน? </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="font-medium text-pink-600 hover:text-pink-700 underline cursor-pointer"
            >
              สมัคร User ใหม่
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
