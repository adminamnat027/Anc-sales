import React, { useState } from 'react';
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
  Briefcase
} from 'lucide-react';

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
  onOpenNewRecord
}) => {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

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
                  ระบบบันทึกยอดขายพนักงาน
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

              {/* Reports: Admin & Manager & Employee can view reports */}
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

                {/* User Dropdown & Fast Role Switcher */}
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
                      <div className="font-medium text-slate-800">
                        <span>{currentUser.name}</span>
                      </div>
                      {roleInfo && (
                        <span className={`inline-block px-1.5 py-0.2 text-[10px] rounded-md font-medium border ${roleInfo.badge}`}>
                          {roleInfo.label}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Switch Role / Account Menu */}
                  {showSwitchMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-pink-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-semibold text-slate-700">สลับบัญชีเพื่อทดสอบระบบ (3 สิทธิ์)</p>
                        <p className="text-[11px] text-slate-400">เลือกบทบาทเพื่อตรวจเช็คสิทธิ์การใช้งาน</p>
                      </div>

                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {allUsers.map(user => {
                          const isCurrent = user.id === currentUser.id;
                          const userBadge = getRoleBadge(user.role);
                          return (
                            <button
                              key={user.id}
                              onClick={() => {
                                onSwitchUser(user);
                                setShowSwitchMenu(false);
                              }}
                              className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'bg-pink-50/80 text-pink-700 font-medium'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="truncate font-medium">{user.name}</div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-slate-400">{user.id}</span>
                                  <span className={`text-[9px] px-1 rounded border ${userBadge.badge}`}>
                                    {user.role}
                                  </span>
                                </div>
                              </div>
                              {isCurrent && <UserCheck className="w-4 h-4 text-pink-500" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
                        <button
                          onClick={() => {
                            setShowSwitchMenu(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
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
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
                activeTab === 'reports' ? 'text-rose-600 font-semibold' : 'text-slate-500'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>รายงาน</span>
            </button>
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
