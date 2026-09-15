import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Briefcase, 
  KeyRound, 
  Sparkles, 
  AlertCircle,
  Shield,
  CheckCircle2,
  Camera,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { resizeImageToBase64, getDefaultAvatarUrl } from '../utils/imageHelper';

interface UserManagementViewProps {
  currentUser: User;
  allUsers: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  allUsers,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [quickPhotoUserId, setQuickPhotoUserId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    const generatedId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
    setEditingUser(null);
    setUserId(generatedId);
    setName('');
    setEmail('');
    setRole('employee');
    setPosition('เจ้าหน้าที่ฝ่ายขาย');
    setDepartment('ทีมขาย');
    setAvatar(getDefaultAvatarUrl(generatedId));
    setShowUrlInput(false);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPosition(user.position || '');
    setDepartment(user.department || '');
    setAvatar(user.avatar || getDefaultAvatarUrl(user.name || user.id));
    setShowUrlInput(false);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const dataUrl = await resizeImageToBase64(file, 256, 256);
      setAvatar(dataUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg('ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsUploading(false);
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
    }
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9);
    const styles = ['adventurer', 'lorelei', 'notionists', 'micah', 'bottts'];
    const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
    setAvatar(`https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${randomSeed}&backgroundColor=ffd5dc,d1fae5,e0e7ff`);
  };

  const handleDeletePhoto = () => {
    setAvatar(getDefaultAvatarUrl(name || userId));
  };

  // Quick Photo Change for Admin directly from table
  const triggerQuickPhotoUpload = (targetUserId: string) => {
    setQuickPhotoUserId(targetUserId);
    quickFileInputRef.current?.click();
  };

  const handleQuickFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quickPhotoUserId) return;
    try {
      const dataUrl = await resizeImageToBase64(file, 256, 256);
      const targetUser = allUsers.find(u => u.id === quickPhotoUserId);
      if (targetUser) {
        onUpdateUser({
          ...targetUser,
          avatar: dataUrl
        });
      }
    } catch (err) {
      console.error("Error updating avatar:", err);
    } finally {
      setQuickPhotoUserId(null);
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
    }
  };

  const handleQuickPhotoDelete = (targetUser: User) => {
    if (!isAdmin) return;
    if (confirm(`คุณต้องการลบรูปภาพของ ${targetUser.name} และใช้รูปเริ่มต้นใช่หรือไม่?`)) {
      onUpdateUser({
        ...targetUser,
        avatar: getDefaultAvatarUrl(targetUser.name || targetUser.id)
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !userId.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
      return;
    }

    if (!editingUser) {
      const exists = allUsers.some(u => u.id.toLowerCase() === userId.trim().toLowerCase());
      if (exists) {
        setErrorMsg(`User ID ${userId} มีอยู่ในระบบแล้ว`);
        return;
      }
    }

    const updatedUser: User = {
      id: userId.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim(),
      password: editingUser ? editingUser.password : 'password123',
      role: isAdmin ? role : 'employee', // Manager can only manage employees
      avatar: avatar.trim() || (editingUser ? editingUser.avatar : getDefaultAvatarUrl(name)),
      position: position.trim() || 'พนักงานขาย',
      department: department.trim() || 'ทีมขาย',
      joinedDate: editingUser?.joinedDate || new Date().toISOString().split('T')[0]
    };

    if (editingUser) {
      onUpdateUser(updatedUser);
    } else {
      onAddUser(updatedUser);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Role Guide Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-pink-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-rose-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-xl text-slate-800">
                {isAdmin ? 'จัดการข้อมูลและสิทธิ์ผู้ใช้งานทั้งหมด (Admin Control)' : 'จัดการข้อมูลพนักงาน (Manager Access)'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAdmin 
                  ? 'Admin: เพิ่ม, ลบ, แก้ไขข้อมูลได้ทั้งหมด และเข้าถึงได้ทุกหน้า' 
                  : 'ผู้จัดการ: เพิ่ม, แก้ไข ข้อมูลพนักงานแค่นั้น (ไม่สามารถลบข้อมูลผู้ใช้ได้)'}
              </p>
            </div>
          </div>
        </div>

        {/* Add User Button */}
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-semibold shadow-sm shadow-pink-200 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdmin ? '+ เพิ่มผู้ใช้งานใหม่' : '+ เพิ่มข้อมูลพนักงาน'}</span>
        </button>
      </div>

      {/* Permissions Breakdown Guide Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Admin Card */}
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70">
          <div className="flex items-center gap-2 font-semibold text-rose-800 text-xs mb-1.5">
            <span className="text-base">👑</span>
            <span>ระดับที่ 1: Admin (ผู้ดูแลระบบ)</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            สามารถเพิ่ม, ลบ, แก้ไข ข้อมูลได้ทั้งหมด และเข้าถึงได้ทุกหน้าในระบบ รวมทั้งจัดการตั้งค่าผู้ใช้
          </p>
        </div>

        {/* Manager Card */}
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/70">
          <div className="flex items-center gap-2 font-semibold text-purple-800 text-xs mb-1.5">
            <span className="text-base">💼</span>
            <span>ระดับที่ 2: ผู้จัดการ (Manager)</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            สามารถเพิ่ม, แก้ไข ข้อมูลพนักงานแค่นั้น เข้าถึงหน้าหลัก และหน้ารายงานได้ (ไม่สามารถลบข้อมูล)
          </p>
        </div>

        {/* Employee Card */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
          <div className="flex items-center gap-2 font-semibold text-emerald-800 text-xs mb-1.5">
            <span className="text-base">🌟</span>
            <span>ระดับที่ 3: พนักงาน (Employee)</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            สามารถเพิ่ม ยอดขาย, จำนวนออเดอร์ Pancake, จำนวนในระบบ JST ของตัวเองได้แค่นั้น
          </p>
        </div>

      </div>

      {/* Users Directory Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-pink-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-pink-50/50 text-slate-600 border-b border-pink-100 font-heading">
                <th className="py-3 px-3 rounded-l-xl">ผู้ใช้ / รูป</th>
                <th className="py-3 px-3">User ID</th>
                <th className="py-3 px-3">อีเมล</th>
                <th className="py-3 px-3">ตำแหน่ง / แผนก</th>
                <th className="py-3 px-3 text-center">ระดับสิทธิ์</th>
                <th className="py-3 px-3 text-center rounded-r-xl">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map(user => {
                const isThisAdmin = user.role === 'admin';
                const isThisManager = user.role === 'manager';
                const isThisEmployee = user.role === 'employee';

                // Manager cannot edit Admin
                const canEdit = isAdmin || (isManager && isThisEmployee);
                const canDelete = isAdmin && user.id !== currentUser.id;

                return (
                  <tr key={user.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="relative group shrink-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full bg-pink-50 border border-pink-200 object-cover shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => triggerQuickPhotoUpload(user.id)}
                              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                              title="คลิกเพื่อเปลี่ยนรูปพนักงาน"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => triggerQuickPhotoUpload(user.id)}
                                className="text-[10px] text-pink-500 hover:text-pink-600 hover:underline hidden sm:inline"
                              >
                                (เปลี่ยนรูป)
                              </button>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">เริ่มงาน: {user.joinedDate || '-'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                        {user.id}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-slate-800 font-medium">{user.position || '-'}</div>
                      <div className="text-[10px] text-slate-400">{user.department || '-'}</div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isThisAdmin
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isThisManager
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {isThisAdmin ? '👑 Admin' : isThisManager ? '💼 ผู้จัดการ' : '🌟 พนักงาน'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => triggerQuickPhotoUpload(user.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                              title="เปลี่ยนรูปภาพพนักงาน"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickPhotoDelete(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="ลบ/รีเซ็ตรูปภาพพนักงาน"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </>
                        )}

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`คุณต้องการลบผู้ใช้ ${user.name} (${user.id}) ใช่หรือไม่?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="ลบผู้ใช้ (Admin only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!canEdit && !canDelete && !isAdmin && (
                          <span className="text-[10px] text-slate-300">จำกัดสิทธิ์</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden file input for table-level quick photo upload */}
      <input
        type="file"
        ref={quickFileInputRef}
        onChange={handleQuickFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFDFB] w-full max-w-md rounded-3xl shadow-2xl border border-pink-100 overflow-hidden relative">
            
            <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-amber-50 p-5 border-b border-pink-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-base text-slate-800">
                  {editingUser ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้งานใหม่'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-400 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Photo Management Section in Modal */}
              <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-100">
                <input
                  type="file"
                  ref={modalFileInputRef}
                  onChange={handleModalFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center gap-3.5">
                  <div className="relative group shrink-0">
                    <img
                      src={avatar || getDefaultAvatarUrl(name || userId)}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-2xl bg-white border-2 border-pink-200 object-cover shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] cursor-pointer"
                      title="คลิกเพื่ออัปโหลดรูป"
                    >
                      <Upload className="w-3.5 h-3.5 mb-0.5" />
                      <span>อัปโหลด</span>
                    </button>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">รูปภาพพนักงาน</span>
                      {isUploading && <span className="text-[10px] text-pink-500 animate-pulse">กำลังประมวลผล...</span>}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => modalFileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-2 py-1 rounded-lg bg-white border border-pink-200 hover:bg-pink-100/50 text-[11px] font-medium text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-pink-500" />
                        <span>อัปโหลด</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRandomizeAvatar}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-medium text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        title="สุ่มรูปภาพการ์ตูนน่ารัก"
                      >
                        <RefreshCw className="w-3 h-3 text-indigo-500" />
                        <span>สุ่มรูป</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-medium text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3 text-sky-500" />
                        <span>ลิงก์</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDeletePhoto}
                        className="px-2 py-1 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-[11px] font-medium text-rose-600 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        title="ลบรูปภาพและใช้ค่าเริ่มต้น"
                      >
                        <Trash2 className="w-3 h-3 text-rose-500" />
                        <span>ลบรูป</span>
                      </button>
                    </div>

                    {showUrlInput && (
                      <div className="pt-1">
                        <input
                          type="url"
                          placeholder="วาง URL รูปภาพ (https://...)"
                          value={avatar}
                          onChange={e => setAvatar(e.target.value)}
                          className="w-full px-2.5 py-1 bg-white border border-pink-200 rounded-lg text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">User ID</label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs disabled:opacity-60"
                  placeholder="เช่น EMP-105"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="เช่น คุณกานดา ชัยมงคล"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="name@company.co.th"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="เช่น เจ้าหน้าที่ฝ่ายขาย"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">แผนก</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="เช่น ทีมขาย A"
                  />
                </div>
              </div>

              {/* Role selection: Only Admin can change roles */}
              {isAdmin && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ระดับสิทธิ์ (Role)</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="employee">พนักงาน (Employee)</option>
                    <option value="manager">ผู้จัดการ (Manager)</option>
                    <option value="admin">แอดมิน (Admin)</option>
                  </select>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
