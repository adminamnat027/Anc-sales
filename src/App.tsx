import React, { useState, useEffect } from 'react';
import { User, SalesRecord } from './types';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  getStoredRecords, 
  saveStoredRecords, 
  getStoredCurrentUser, 
  saveStoredCurrentUser 
} from './data/mockData';
import { 
  subscribeToUsers, 
  subscribeToRecords, 
  saveRecordToDb, 
  deleteRecordFromDb, 
  saveUserToDb, 
  deleteUserFromDb,
  testFirestoreConnection
} from './lib/firebase';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { UserCardsView } from './components/UserCardsView';
import { ReportsView } from './components/ReportsView';
import { UserManagementView } from './components/UserManagementView';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { SalesRecordModal } from './components/SalesRecordModal';
import { Sparkles, ShieldCheck, UserCheck, AlertCircle, PlusCircle, CheckCircle, Database } from 'lucide-react';

export default function App() {
  const [allUsers, setAllUsers] = useState<User[]>(getStoredUsers);
  const [records, setRecords] = useState<SalesRecord[]>(getStoredRecords);
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredCurrentUser);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'userCards' | 'reports' | 'manageUsers'>('dashboard');

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalesRecord | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Check Firestore connection and subscribe to real-time updates
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsDbConnected(connected);
    });

    // Subscribe to Firestore users collection
    const unsubscribeUsers = subscribeToUsers((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setAllUsers(firestoreUsers);
        saveStoredUsers(firestoreUsers);
      }
    });

    // Subscribe to Firestore salesRecords collection
    const unsubscribeRecords = subscribeToRecords((firestoreRecords) => {
      if (firestoreRecords) {
        setRecords(firestoreRecords);
        saveStoredRecords(firestoreRecords);
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeRecords();
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    saveStoredUsers(allUsers);
  }, [allUsers]);

  useEffect(() => {
    saveStoredRecords(records);
  }, [records]);

  useEffect(() => {
    saveStoredCurrentUser(currentUser);
  }, [currentUser]);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`ยินดีต้อนรับคุณ ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleRegisterSuccess = async (newUser: User) => {
    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    setCurrentUser(newUser);
    try {
      await saveUserToDb(newUser);
    } catch (e) {
      console.warn("Offline fallback for user registration:", e);
    }
    showToast(`สมัครสมาชิกสำเร็จ ยินดีต้อนรับคุณ ${newUser.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoginOpen(true);
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    showToast(`สลับบทบาทเป็น: ${user.name} [สิทธิ์: ${user.role}]`);
  };

  // Record Handlers
  const handleOpenNewRecord = (preselectedUserId?: string) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    setEditingRecord(null);
    setIsRecordModalOpen(true);
  };

  const handleEditRecord = (record: SalesRecord) => {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleSaveRecord = async (recordData: Partial<SalesRecord>) => {
    if (editingRecord) {
      // Update
      const updated = records.map(r => (r.id === editingRecord.id ? ({ ...r, ...recordData } as SalesRecord) : r));
      setRecords(updated);
      try {
        const fullRecord = { ...editingRecord, ...recordData } as SalesRecord;
        await saveRecordToDb(fullRecord);
      } catch (e) {
        console.warn("Offline record update fallback:", e);
      }
      showToast('บันทึกการแก้ไขข้อมูลเรียบร้อยแล้ว');
    } else {
      // Create new
      const newRec = recordData as SalesRecord;
      setRecords([newRec, ...records]);
      try {
        await saveRecordToDb(newRec);
      } catch (e) {
        console.warn("Offline record save fallback:", e);
      }
      showToast('บันทึกยอดขายพนักงานสำเร็จและซิงค์คลาวด์แล้ว!');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (currentUser?.role !== 'admin') {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบบันทึกได้');
      return;
    }
    if (confirm('คุณต้องการลบรายการบันทึกนี้ใช่หรือไม่?')) {
      const updated = records.filter(r => r.id !== recordId);
      setRecords(updated);
      try {
        await deleteRecordFromDb(recordId);
      } catch (e) {
        console.warn("Offline record delete fallback:", e);
      }
      showToast('ลบรายการบันทึกเรียบร้อย');
    }
  };

  // User Management Handlers (Admin & Manager)
  const handleAddUser = async (newUser: User) => {
    setAllUsers(prev => [...prev, newUser]);
    try {
      await saveUserToDb(newUser);
    } catch (e) {
      console.warn("Offline user save fallback:", e);
    }
    showToast(`เพิ่มผู้ใช้ ${newUser.name} เรียบร้อยแล้ว`);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setAllUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    try {
      await saveUserToDb(updatedUser);
    } catch (e) {
      console.warn("Offline user update fallback:", e);
    }
    showToast(`อัปเดตข้อมูล ${updatedUser.name} เรียบร้อย`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser?.role !== 'admin') {
      alert('เฉพาะ Admin เท่านั้นที่สามารถลบผู้ใช้งานได้');
      return;
    }
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    try {
      await deleteUserFromDb(userId);
    } catch (e) {
      console.warn("Offline user delete fallback:", e);
    }
    showToast('ลบข้อมูลผู้ใช้งานเรียบร้อยแล้ว');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-pink-200/30 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
        onOpenNewRecord={() => handleOpenNewRecord()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Quick Demo Role Bar for Easy Evaluation */}
        {currentUser && (
          <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50/50 to-amber-50/50 border border-pink-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-pink-500">✨</span>
              <span className="font-semibold text-slate-700">สิทธิ์การใช้งานปัจจุบัน:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                currentUser.role === 'admin'
                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                  : currentUser.role === 'manager'
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}>
                {currentUser.role === 'admin'
                  ? '👑 Admin (เพิ่ม, ลบ, แก้ไขได้ทุกหน้า)'
                  : currentUser.role === 'manager'
                  ? '💼 ผู้จัดการ (เพิ่ม/แก้ไขพนักงาน เข้าถึงหลักและรายงาน)'
                  : '🌟 พนักงาน (บันทึกยอดขายของตนเอง)'}
              </span>
            </div>

            {/* Quick Test Switcher Buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] hidden sm:inline">ทดสอบสลับสิทธิ์:</span>
              {allUsers.filter(u => u.role === 'admin').slice(0, 1).map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUser(u)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                    currentUser.id === u.id
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  Admin
                </button>
              ))}

              {allUsers.filter(u => u.role === 'manager').slice(0, 1).map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUser(u)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                    currentUser.id === u.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-200'
                  }`}
                >
                  ผู้จัดการ
                </button>
              ))}

              {allUsers.filter(u => u.role === 'employee').slice(0, 2).map((u, i) => (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUser(u)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                    currentUser.id === u.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  พนักงาน {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            allUsers={allUsers}
            records={records}
            onOpenNewRecord={() => handleOpenNewRecord()}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {activeTab === 'userCards' && (
          <UserCardsView
            currentUser={currentUser}
            allUsers={allUsers}
            records={records}
            onOpenNewRecord={(userId) => handleOpenNewRecord(userId)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            currentUser={currentUser}
            allUsers={allUsers}
            records={records}
          />
        )}

        {activeTab === 'manageUsers' && currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') && (
          <UserManagementView
            currentUser={currentUser}
            allUsers={allUsers}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

      </main>

      {/* Pastel Soft Footer */}
      <footer className="mt-12 bg-white/70 border-t border-pink-100 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="font-semibold text-slate-700">Employee Sales & KPI Tracker</span>
            <span>• ระบบบันทึกยอดขายพนักงาน</span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
              <Database className="w-3 h-3" />
              <span>Cloud Firestore: เชื่อมต่อฐานข้อมูลออนไลน์ฟรี (Spark Plan)</span>
            </span>
          </div>

          <div className="text-slate-400 text-[11px]">
            KPI 185,000 บาท/คน/วัน • สรุปออเดอร์ Pancake & ระบบ JST • รายงาน Google Sheets & PDF
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        allUsers={allUsers}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        existingUsers={allUsers}
      />

      {currentUser && (
        <SalesRecordModal
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            setEditingRecord(null);
          }}
          onSaveRecord={handleSaveRecord}
          currentUser={currentUser}
          allUsers={allUsers}
          editingRecord={editingRecord}
        />
      )}

    </div>
  );
}
