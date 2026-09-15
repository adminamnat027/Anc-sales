import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { 
  BarChart3, 
  Users, 
  FileText, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  Sparkles, 
  ChevronDown, 
  UserCheck, 
  PlusCircle,
  Briefcase,
  Camera,
  Trash2,
  Upload
} from 'lucide-react';
import { resizeImageToBase64, getDefaultAvatarUrl } from '../utils/imageHelper';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'dashboard' | 'userCards' | 'reports' | 'manageUsers';
  setActiveTab: (tab: 'dashboard' | 'userCards' | 'reports' | 'manageUsers') => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  onOpenNewRecord: () => void;
  onUpdateUser?: (user: User) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  onSwitchUser,
  allUsers,
  onOpenNewRecord,
  onUpdateUser
}) => {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [isPhotoUpdating, setIsPhotoUpdating] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !onUpdateUser) return;
    try {
      setIsPhotoUpdating(true);
      const dataUrl = await resizeImageToBase64(file, 256, 256);
      onUpdateUser({
        ...currentUser,
        avatar: dataUrl
      });
    } catch (err) {
      console.error("Error updating profile photo:", err);
    } finally {
      setIsPhotoUpdating(false);
      if (profileFileInputRef.current) {
        profileFileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteProfilePhoto = () => {
    if (!currentUser || !onUpdateUser) return;
    const defaultAvatar = getDefaultAvatarUrl(currentUser.name || currentUser.id);
    onUpdateUser({
      ...currentUser,
      avatar: defaultAvatar
    });
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: 'ผู้ดูแลระบบ (Admin)',
          badge: 'bg-rose-100 text-rose-700 border-rose-200',
          dot: 'bg-rose-500'
        };
      case 'manager':
        return {
          label: 'ผู้จัดการ (Manager)',
          badge: 'bg-purple-100 text-purple-700 border-purple-200',
          dot: 'bg-purple-500'
        };
      case 'employee':
        return {
          label: 'พนักงาน (Employee)',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
    }
  };

  const roleInfo = currentUser ? getRoleBadge(currentUser.role) : null;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-300 via-rose-200 to-amber-100 flex items-center justify-center shadow-inner text-rose-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-semibold text-xl text-slate-800 tracking-tight">
                  ระบบจัดเก็บยอด
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 font-medium border border-pink-200 hidden sm:inline-block">
                  Sales & JST Differ
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1 bg-rose-50/60 p-1.5 rounded-2xl border border-rose-100">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-rose-600 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-rose-100/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                หน้าหลัก
              </button>

              <button
                id="nav-tab-user-cards"
                onClick={() => setActiveTab('userCards')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'userCards'
                    ? 'bg-white text-rose-600 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-rose-100/50'
                }`}
              >
                <Users className="w-4 h-4" />
                ข้อมูลราย User
              </button>

              {/* Reports: Admin & Manager ONLY (ยกเว้นสิทธิ์ระดับพนักงาน) */}
              {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                <button
                  id="nav-tab-reports"
                  onClick={() => setActiveTab('reports')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'reports'
                      ? 'bg-white text-rose-600 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-rose-100/50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  สรุปรายงาน
                </button>
              )}

              {/* Admin & Manager can access user management */}
              {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                <button
                  id="nav-tab-manage-users"
                  onClick={() => setActiveTab('manageUsers')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'manageUsers'
                      ? 'bg-white text-rose-600 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-rose-100/50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  {currentUser.role === 'admin' ? 'จัดการข้อมูลทั้งหมด' : 'ข้อมูลพนักงาน'}
                </button>
              )}
            </nav>
          )}

          {/* Right Section: Add Record Button + User Role Pill + Auth */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                {/* Action button: Record Sales */}
                <button
                  id="btn-add-record-quick"
                  onClick={onOpenNewRecord}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white text-sm font-medium shadow-sm shadow-pink-200 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>บันทึกยอดขาย</span>
                </button>

                {/* User Profile & Role Info */}
                <div className="relative">
                  <button
                    id="btn-user-profile-menu"
                    onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                    className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left cursor-pointer"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full border border-pink-200 bg-pink-50 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="hidden sm:block text-xs">
                      <div className="font-medium text-slate-800 leading-tight">
                        <span>{currentUser.name}</span>
                      </div>
                      {roleInfo && (
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-md font-medium border mt-0.5 ${roleInfo.badge}`}>
                          {roleInfo.label}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Logged-in User Info Menu (No switcher) */}
                  {showSwitchMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-pink-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Current User Card */}
                      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl mb-2.5 border border-slate-100">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full border border-pink-200 bg-white object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-800 truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                          <div className="mt-1">
                            {roleInfo && (
                              <span className={`inline-block px-2 py-0.5 text-[10px] rounded-md font-semibold border ${roleInfo.badge}`}>
                                {roleInfo.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="px-2 py-1.5 text-[11px] text-slate-500 space-y-1 border-b border-slate-100 pb-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">รหัสผู้ใช้:</span>
                          <span className="font-mono text-slate-700">{currentUser.id}</span>
                        </div>
                        {currentUser.department && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">แผนก:</span>
                            <span className="text-slate-700 truncate max-w-[130px]">{currentUser.department}</span>
                          </div>
                        )}
                        {currentUser.position && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">ตำแหน่ง:</span>
                            <span className="text-slate-700 truncate max-w-[130px]">{currentUser.position}</span>
                          </div>
                        )}
                      </div>

                      {/* Photo management for current profile */}
                      <div className="p-2 bg-pink-50/50 rounded-xl my-2 border border-pink-100/60">
                        <input
                          type="file"
                          ref={profileFileInputRef}
                          onChange={handleProfilePhotoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <div className="text-[10px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3 text-pink-500" />
                            <span>รูปภาพโปรไฟล์</span>
                          </span>
                          {isPhotoUpdating && <span className="text-pink-500 animate-pulse">กำลังประมวลผล...</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => profileFileInputRef.current?.click()}
                            disabled={isPhotoUpdating}
                            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white border border-pink-200 hover:bg-pink-100/40 text-[10px] font-medium text-slate-700 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3 h-3 text-pink-500" />
                            <span>{isPhotoUpdating ? 'กำลังอัปโหลด' : 'เปลี่ยนรูป'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteProfilePhoto}
                            disabled={isPhotoUpdating}
                            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-[10px] font-medium text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-rose-500" />
                            <span>ลบรูป</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          id="btn-logout"
                          onClick={() => {
                            setShowSwitchMenu(false);
                            onLogout();
                          }}
                          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>ออกจากระบบ</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-nav-login"
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-pink-50 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </button>
                <button
                  id="btn-nav-register"
                  onClick={onOpenRegister}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-400 hover:bg-pink-500 text-white text-sm font-medium shadow-sm shadow-pink-200 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>สมัคร User</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        {currentUser && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-pink-100/60 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
                activeTab === 'dashboard' ? 'text-rose-600 font-semibold' : 'text-slate-500'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>หน้าหลัก</span>
            </button>
            <button
              onClick={() => setActiveTab('userCards')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
                activeTab === 'userCards' ? 'text-rose-600 font-semibold' : 'text-slate-500'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>ราย User</span>
            </button>
            {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
                  activeTab === 'reports' ? 'text-rose-600 font-semibold' : 'text-slate-500'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>รายงาน</span>
              </button>
            )}
            {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
              <button
                onClick={() => setActiveTab('manageUsers')}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
                  activeTab === 'manageUsers' ? 'text-rose-600 font-semibold' : 'text-slate-500'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>พนักงาน</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
