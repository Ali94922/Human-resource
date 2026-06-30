import React, { useState, useEffect } from "react";
import { 
  Users, UserPlus, Shield, ShieldCheck, Mail, Key, Trash2, 
  ToggleLeft, ToggleRight, CheckCircle2, UserCheck, AlertCircle, 
  RefreshCw, KeyRound, Briefcase, Bell, AlertTriangle, CalendarClock, 
  Calendar, Clock, Sparkles, Check, ChevronDown, RefreshCcw, Edit
} from "lucide-react";
import { SystemUser, UserRole } from "../types";

export interface ArchivedContract {
  id: string;
  fullName: string;
  nationalId: string;
  jobTitle: string;
  contractType: "daily" | "permanent";
  employer: string;
  startDate: string;
  endDate: string;
  phoneNumber?: string;
  wageOrSalary?: number;
}

interface UserManagerProps {
  onUserSelected: (user: SystemUser | null) => void;
  selectedUserId: string | null;
  onUserChangeNotification: (msg: string) => void;
  onEditContract?: (contract: ArchivedContract) => void;
}

export default function UserManager({
  onUserSelected,
  selectedUserId,
  onUserChangeNotification,
  onEditContract
}: UserManagerProps) {
  // Load users from localStorage or default list
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [contracts, setContracts] = useState<ArchivedContract[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("entry");
  const [department, setDepartment] = useState("الموارد البشرية");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const askConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      }
    });
  };

  // Helper to offset current date by a number of days
  const dateOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  // Helper to calculate remaining days dynamically
  const getDaysRemaining = (endDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Initial dummy users and archived contracts for demonstration
  useEffect(() => {
    // 1. Users Setup
    const savedUsers = localStorage.getItem("system_users");
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        setUsers(parsed);
        if (parsed.length > 0 && !selectedUserId) {
          const activeUser = parsed.find((u: SystemUser) => u.status === "active");
          if (activeUser) onUserSelected(activeUser);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultUsers: SystemUser[] = [
        {
          id: "usr_1",
          fullName: "أحمد رأفت الشناوي",
          username: "ahmed_sh",
          email: "ahmed.s@eltariq.com",
          role: "admin",
          status: "active",
          department: "إدارة شؤون العاملين",
          createdContractsCount: 14,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          tempPassword: "EltariqAdmin@2026"
        },
        {
          id: "usr_2",
          fullName: "محمود عبد العزيز",
          username: "mahmoud_entry",
          email: "m.aziz@yuanda.com",
          role: "entry",
          status: "active",
          department: "شؤون الموظفين - يواندا",
          createdContractsCount: 8,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          tempPassword: "YuandaEntry#99"
        }
      ];
      setUsers(defaultUsers);
      localStorage.setItem("system_users", JSON.stringify(defaultUsers));
      onUserSelected(defaultUsers[0]);
    }

    // 2. Archived Contracts Setup (with smart dynamic dates relative to current review time)
    const savedContracts = localStorage.getItem("archived_contracts");
    if (savedContracts) {
      try {
        setContracts(JSON.parse(savedContracts));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultContracts: ArchivedContract[] = [
        {
          id: "cont_1",
          fullName: "كمال عبد الحميد السعدني",
          nationalId: "29410151201458",
          jobTitle: "عامل بناء خرسانة مسلح",
          contractType: "permanent",
          employer: "شركة يواندا للتطوير والمقاولات ش.م.م",
          startDate: dateOffset(-350),
          endDate: dateOffset(12), // Expires in 12 days! (Warning)
          phoneNumber: "01098765432",
          wageOrSalary: 7500
        },
        {
          id: "cont_2",
          fullName: "مصطفى السيد أحمد البدري",
          nationalId: "28805120101897",
          jobTitle: "مهندس موقع مساعد",
          contractType: "permanent",
          employer: "مؤسسة الطارق للمقاولات العمومية",
          startDate: dateOffset(-340),
          endDate: dateOffset(24), // Expires in 24 days! (Warning)
          phoneNumber: "01234567890",
          wageOrSalary: 9500
        },
        {
          id: "cont_3",
          fullName: "رامي جلال النجار",
          nationalId: "29011231801224",
          jobTitle: "فني كهربائي تركيبات",
          contractType: "permanent",
          employer: "مؤسسة الطارق للمقاولات العمومية",
          startDate: dateOffset(-365),
          endDate: dateOffset(-2), // Expired 2 days ago! (Danger)
          phoneNumber: "01555123456",
          wageOrSalary: 6200
        },
        {
          id: "cont_4",
          fullName: "سلوى رشاد زكي",
          nationalId: "29608140101569",
          jobTitle: "أخصائية موارد بشرية",
          contractType: "permanent",
          employer: "شركة يواندا للتطوير والمقاولات ش.م.م",
          startDate: dateOffset(-100),
          endDate: dateOffset(265), // Safe (265 days remaining)
          phoneNumber: "01122334455",
          wageOrSalary: 8000
        },
        {
          id: "cont_5",
          fullName: "جرجس صبحي ميخائيل",
          nationalId: "29502181203498",
          jobTitle: "عامل حداد مسلح",
          contractType: "daily",
          employer: "مؤسسة الطارق للمقاولات العمومية",
          startDate: dateOffset(-85), // Approaching 3 months (85 days ago)
          endDate: dateOffset(280),
          phoneNumber: "01011223344",
          wageOrSalary: 300 // daily wage
        },
        {
          id: "cont_6",
          fullName: "علاء نبيل عبدالوهاب",
          nationalId: "29204121201475",
          jobTitle: "فني تبريد وتكييف",
          contractType: "daily",
          employer: "شركة يواندا للتطوير والمقاولات ش.م.م",
          startDate: dateOffset(-120), // Exceeded 3 months (120 days ago)
          endDate: dateOffset(245),
          phoneNumber: "01233445566",
          wageOrSalary: 350 // daily wage
        }
      ];
      setContracts(defaultContracts);
      localStorage.setItem("archived_contracts", JSON.stringify(defaultContracts));
    }
  }, []);

  const saveUsersToStorage = (updatedUsers: SystemUser[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("system_users", JSON.stringify(updatedUsers));
  };

  const saveContractsToStorage = (updatedContracts: ArchivedContract[]) => {
    setContracts(updatedContracts);
    localStorage.setItem("archived_contracts", JSON.stringify(updatedContracts));
  };

  const getRoleBadgeColor = (userRole: UserRole) => {
    if (userRole === "admin") return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    if (userRole === "reviewer") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  };

  const getRoleLabel = (userRole: UserRole) => {
    if (userRole === "admin") return "مدير النظام (كامل الصلاحيات)";
    if (userRole === "reviewer") return "راجع ومدقق عقود";
    return "مدخل بيانات ومسؤول عقود";
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !username || !email) {
      setError("يرجى تعبئة كافة الحقول المطلوبة لإنشاء الحساب.");
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      setError("اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم مستخدم آخر.");
      return;
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let generatedPassword = "";
    for (let i = 0; i < 10; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newUser: SystemUser = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      fullName,
      username: username.toLowerCase().replace(/\s+/g, "_"),
      email,
      role,
      status: "active",
      department,
      createdContractsCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      tempPassword: generatedPassword
    };

    const updated = [...users, newUser];
    saveUsersToStorage(updated);
    onUserSelected(newUser);

    setFullName("");
    setUsername("");
    setEmail("");
    setRole("entry");
    setShowAddForm(false);
    onUserChangeNotification(`تم إنشاء حساب جديد بنجاح للموظف: ${fullName}`);
  };

  const handleToggleStatus = (id: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const nextStatus = u.status === "active" ? "inactive" : "active";
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveUsersToStorage(updated);
    onUserChangeNotification("تم تحديث حالة تفعيل حساب المستخدم.");
  };

  const handleDeleteUser = (id: string, name: string) => {
    askConfirmation(
      "🗑️ حذف مستخدم",
      `هل أنت متأكد من حذف حساب المستخدم: ${name} نهائياً؟`,
      () => {
        const updated = users.filter((u) => u.id !== id);
        saveUsersToStorage(updated);
        
        if (selectedUserId === id) {
          const nextActive = updated.find((u) => u.status === "active") || null;
          onUserSelected(nextActive);
        }
        onUserChangeNotification(`تم حذف حساب الموظف ${name} بنجاح.`);
      }
    );
  };

  const handleResetPassword = (id: string, name: string) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
    let newPass = "";
    for (let i = 8; i > 0; --i) newPass += chars[Math.floor(Math.random() * chars.length)];

    const updated = users.map((u) => {
      if (u.id === id) {
        return { ...u, tempPassword: newPass };
      }
      return u;
    });
    saveUsersToStorage(updated);
    alert(`تم إعادة تعيين كلمة المرور للمستخدم (${name}) إلى:\n\n${newPass}\n\nيرجى حفظها وتزويد الموظف بها.`);
    onUserChangeNotification("تم تجديد كلمة المرور المؤقتة.");
  };

  // RENEW CONTRACT ACTION: Extends the contract for 1 more year from its current end date
  const handleRenewContract = (id: string, name: string) => {
    const updated = contracts.map((c) => {
      if (c.id === id) {
        const currentEnd = new Date(c.endDate);
        currentEnd.setFullYear(currentEnd.getFullYear() + 1);
        const newEndDate = currentEnd.toISOString().split("T")[0];
        return { ...c, endDate: newEndDate };
      }
      return c;
    });
    saveContractsToStorage(updated);
    onUserChangeNotification(`تم تجديد عقد الموظف (${name}) وتمديده لمدة سنة إضافية بنجاح!`);
  };

  // DELETE CONTRACT ACTION
  const handleDeleteContract = (id: string, name: string) => {
    askConfirmation(
      "🗑️ حذف عقد",
      `هل أنت متأكد من حذف عقد الموظف: ${name} من الأرشيف؟`,
      () => {
        const updated = contracts.filter((c) => c.id !== id);
        saveContractsToStorage(updated);
        onUserChangeNotification("تم حذف العقد من قائمة السجلات.");
      }
    );
  };

  // Filter expiring contracts (remaining <= 30 days)
  const expiringSoonContracts = contracts.filter((c) => {
    const remaining = getDaysRemaining(c.endDate);
    return remaining <= 30;
  });

  const expiredCount = expiringSoonContracts.filter(c => getDaysRemaining(c.endDate) < 0).length;
  const warningCount = expiringSoonContracts.filter(c => getDaysRemaining(c.endDate) >= 0).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-right">
      
      {/* Dynamic Expiry Alerts Banner Dashboard */}
      {expiringSoonContracts.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 space-y-3.5 animate-pulse-subtle">
          <div className="flex items-start justify-between">
            <span className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              <Bell className="w-4 h-4 text-rose-400 animate-bounce" />
              تنبيهات العقود النشطة
            </span>
            <div className="text-right">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
                نظام الإنذار المبكر لانتهاء العقود
                <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />
              </h3>
              <p className="text-[10px] text-slate-300 mt-1">
                تم رصد <strong className="text-rose-400">{expiredCount} عقود منتهية</strong> و <strong className="text-amber-400">{warningCount} عقود توشك على الانتهاء</strong> (أقل من 30 يوماً).
              </p>
            </div>
          </div>

          {/* Expiring List */}
          <div className="space-y-2 pt-1 border-t border-rose-500/10">
            {expiringSoonContracts.map((c) => {
              const remaining = getDaysRemaining(c.endDate);
              const isExpired = remaining < 0;

              return (
                <div 
                  key={c.id} 
                  className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-right transition-all ${
                    isExpired 
                      ? "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10" 
                      : "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
                  }`}
                >
                  {/* Actions to Renew or Delete */}
                  <div className="flex items-center gap-1.5 justify-start">
                    {onEditContract && (
                      <button
                        onClick={() => onEditContract(c)}
                        className="text-[10px] font-semibold text-slate-400 hover:text-indigo-400 bg-slate-900 border border-slate-800 p-1 rounded-md hover:border-indigo-500/30 transition-all cursor-pointer"
                        title="تعديل وتحديث بيانات هذا العقد"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleRenewContract(c.id, c.fullName)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 cursor-pointer transition-all ${
                        isExpired
                          ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-500"
                          : "bg-amber-600 hover:bg-amber-700 text-white border-amber-500"
                      }`}
                    >
                      <RefreshCw className="w-3 h-3 animate-spin-slow" />
                      تجديد سنة إضافية
                    </button>
                    
                    <button
                      onClick={() => handleDeleteContract(c.id, c.fullName)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 p-1 rounded-md hover:border-rose-500/30 transition-all cursor-pointer"
                      title="حذف من الأرشيف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Info Column */}
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        isExpired 
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse" 
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {isExpired ? "مُنتهي الصلاحية" : `ينتهي خلال ${remaining} يوم`}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100">{c.fullName}</h4>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">{c.jobTitle} • {c.employer}</p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Header Operator & Users Account Administration */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 justify-end">
            <Users className="w-5 h-5 text-indigo-400" />
            إدارة حسابات فريق العمل والموظفين
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            أنشئ حسابات تفعيلية للموظفين والمراجعين لتتبع صياغة العقود وتفويض الصلاحيات
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-semibold text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-500/50 bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {showAddForm ? "إلغاء وإغلاق" : "إضافة مستخدم جديد"}
        </button>
      </div>

      {/* 1. Select Active Operator / Logged-in User */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <label className="block text-xs font-bold text-slate-300">
          المستخدم الحالي النشط للنظام (معد العقود):
        </label>
        <div className="flex gap-3">
          <select
            value={selectedUserId || ""}
            onChange={(e) => {
              const u = users.find((user) => user.id === e.target.value);
              if (u) {
                onUserSelected(u);
                onUserChangeNotification(`تم تعيين ${u.fullName} كمستخدم نشط حالي للنظام.`);
              }
            }}
            className="flex-1 bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">-- اختر مستخدم لتسجيل الدخول --</option>
            {users.filter(u => u.status === "active").map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName} ({getRoleLabel(user.role)})
              </option>
            ))}
          </select>
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[10px] text-slate-500">
          * يتم تسجيل اسم هذا المستخدم في كشوف المعاينة والأرشفة السحابية كونه المسؤول الذي أصدر وطبع العقد.
        </p>
      </div>

      {/* 2. Create User Form (Accordion-like layout) */}
      {showAddForm && (
        <form onSubmit={handleCreateUser} className="bg-slate-950 p-4 rounded-xl border border-indigo-500/20 space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-white border-b border-slate-800 pb-2">بيانات حساب المستخدم الجديد:</h3>
          
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">الاسم الثلاثي أو الرباعي للموظف:</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: يوسف كمال الدين الشافعي"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">اسم المستخدم (Username بالإنجليزية):</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: y_kamal"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white text-left focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">البريد الإلكتروني المهني:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white text-left focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Role Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">الصلاحيات والوظيفة:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="entry">مدخل بيانات</option>
                  <option value="reviewer">مراجع عقود</option>
                  <option value="admin">مدير نظام</option>
                </select>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">القسم التابع له:</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="الموارد البشرية"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg transition-all cursor-pointer shadow-md hover:shadow-indigo-900/40"
          >
            تأكيد وإنشاء مستخدم جديد
          </button>
        </form>
      )}

      {/* 3. Users List Panel */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300">المستخدمين المسجلين حالياً ومستويات الوصول:</h3>
        
        <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
          {users.map((user) => {
            const isActive = user.status === "active";
            const isSelf = selectedUserId === user.id;

            return (
              <div
                key={user.id}
                className={`p-3.5 border rounded-xl transition-all flex flex-col gap-2 bg-slate-950/40 ${
                  isSelf 
                    ? "border-indigo-500/80 bg-indigo-950/10 shadow-lg shadow-indigo-950/20" 
                    : "border-slate-800/80 hover:border-slate-700/80"
                }`}
              >
                {/* Core Header info */}
                <div className="flex justify-between items-start">
                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    {/* Reset Password */}
                    <button
                      onClick={() => handleResetPassword(user.id, user.fullName)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-md transition-colors cursor-pointer"
                      title="تجديد كلمة المرور"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Active Status */}
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        isActive ? "text-emerald-500 hover:bg-emerald-950/10" : "text-slate-500 hover:bg-slate-900"
                      }`}
                      title={isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
                    >
                      {isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>

                    {/* Delete User */}
                    <button
                      onClick={() => handleDeleteUser(user.id, user.fullName)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/10 rounded-md transition-colors cursor-pointer"
                      title="حذف نهائياً"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Identity */}
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
                      {isSelf && (
                        <span className="text-[9px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded-md">الحالي</span>
                      )}
                      {user.fullName}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">@{user.username}</span>
                  </div>
                </div>

                {/* Sub details */}
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                  <div>
                    <span className="text-slate-600 block">العقود المنجزة</span>
                    <span className="font-mono font-bold text-white">{user.createdContractsCount} عقود</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block">القسم</span>
                    <span className="font-medium text-slate-300">{user.department}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-600 block text-left">مستوى الصلاحية</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded-md border ${getRoleBadgeColor(user.role)}`}>
                      {user.role === "admin" ? "مدير" : user.role === "reviewer" ? "مراجع" : "مدخل"}
                    </span>
                  </div>
                </div>

                {/* Show temp password for admin transparency */}
                {user.tempPassword && (
                  <div className="mt-1 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800/60 flex items-center justify-between">
                    <span className="text-[9px] text-slate-500">كلمة المرور المؤقتة للحساب:</span>
                    <code className="text-[10px] text-indigo-400 font-mono font-bold">{user.tempPassword}</code>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {confirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-right">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-100 flex items-center justify-end gap-2 border-b border-slate-800 pb-3">
              <span>{confirmModal.title}</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed py-2">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-start gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all border border-slate-700/50"
              >
                إلغاء 🚫
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl cursor-pointer transition-all shadow-md shadow-amber-900/10"
              >
                تأكيد وبدء العمل ✅
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
