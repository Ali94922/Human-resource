import React, { useState, useEffect } from "react";
import { Sparkles, FileText, CheckCircle2, ShieldCheck, Info, HelpCircle, Users, Award, FileCode, UserCheck } from "lucide-react";
import { ContractFormData, SystemUser, AppPermissions, UserPermissions, ContractorType } from "./types";
import IDCardForm from "./components/IDCardForm";
import ContractTemplate from "./components/ContractTemplate";
import TemplateManager from "./components/TemplateManager";
import UserManager from "./components/UserManager";
import ContractReports from "./components/ContractReports";
import TeamLauncher from "./components/TeamLauncher";
import AppLock from "./components/AppLock";
import PermitManager from "./components/PermitManager";
import YuandaTimesheet from "./components/YuandaTimesheet";
import WorkersDirectory from "./components/WorkersDirectory";
import InsuranceManager from "./components/InsuranceManager";
import LeavesManager from "./components/LeavesManager";
import { defaultDailyTemplate, defaultPermanentTemplate } from "./data/defaultTemplates";

const DEFAULT_PERMISSIONS: AppPermissions = {
  user1: { form: true, template: true, users: true, reports: true },
  user2: { form: true, template: true, users: true, reports: true },
  user3: { form: true, template: true, users: true, reports: true },
  user4: { form: true, template: true, users: true, reports: true },
  user5: { form: true, template: true, users: true, reports: true },
};

export default function App() {
  const [formData, setFormData] = useState<ContractFormData>({
    fullName: "",
    nationalId: "",
    address: "",
    jobTitle: "",
    dateOfBirth: "",
    governorate: "",
    gender: "",
    qualification: "",
    cardIssueDate: "",
    contractType: "daily",
    employer: "altariq",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    dailyWage: 250,
    customAmount: "",
    workingHours: 8,
    notes: ""
  });

  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [rightTab, setRightTab] = useState<"form" | "template" | "users" | "reports" | "launcher" | "permits" | "timesheet" | "directory" | "insurance" | "leaves">("form");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("app_authenticated") === "true";
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return sessionStorage.getItem("app_current_user") || "";
  });
  const [activeUser, setActiveUser] = useState<SystemUser | null>(null);

  const [permissions, setPermissions] = useState<AppPermissions>(() => {
    const saved = localStorage.getItem("app_user_permissions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PERMISSIONS;
      }
    }
    return DEFAULT_PERMISSIONS;
  });

  const activeUserPermissions: UserPermissions = currentUser.toLowerCase() === "ali"
    ? { form: true, template: true, users: true, reports: true }
    : permissions[currentUser.toLowerCase()] || { form: true, template: true, users: true, reports: true };

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    const userKey = currentUser.trim().toLowerCase();
    if (userKey === "ali") return;

    const userPerms = permissions[userKey];
    if (userPerms) {
      if (!userPerms[rightTab as keyof UserPermissions]) {
        const availableTabs: ("form" | "template" | "users" | "reports")[] = ["form", "template", "users", "reports"];
        const fallbackTab = availableTabs.find(tab => userPerms[tab]);
        if (fallbackTab) {
          setRightTab(fallbackTab);
        }
      }
    }
  }, [currentUser, isAuthenticated, permissions, rightTab]);

  const handleUpdatePermissions = (updated: AppPermissions) => {
    setPermissions(updated);
    localStorage.setItem("app_user_permissions", JSON.stringify(updated));
    triggerNotification("تم حفظ وتحديث صلاحيات مستخدمي النظام بنجاح!", "success");
  };

  // Editable/Customizable Contract templates state
  const [dailyTemplate, setDailyTemplate] = useState<string>(() => {
    return localStorage.getItem("app_daily_template_v3") || defaultDailyTemplate;
  });
  const [permanentTemplate, setPermanentTemplate] = useState<string>(() => {
    return localStorage.getItem("app_permanent_template_v3") || defaultPermanentTemplate;
  });

  // Persist template changes in localStorage
  useEffect(() => {
    localStorage.setItem("app_daily_template_v3", dailyTemplate);
  }, [dailyTemplate]);

  useEffect(() => {
    localStorage.setItem("app_permanent_template_v3", permanentTemplate);
  }, [permanentTemplate]);

  const activeTemplateText = formData.contractType === "daily" ? dailyTemplate : permanentTemplate;

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

  const triggerNotification = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleResetToSystemDefaults = () => {
    askConfirmation(
      "🔄 إعادة ضبط قالب العقد",
      "هل أنت متأكد من رغبتك في إعادة ضبط وتحديث قالب العقد بالكامل لأحدث نسخة معتمدة من النظام؟ سيقوم هذا الإجراء بتنزيل الصيغة الرسمية الفورية وتجاوز أي كاش قديم بمتصفحك.",
      () => {
        if (formData.contractType === "daily") {
          localStorage.removeItem("app_daily_template_v3");
          setDailyTemplate(defaultDailyTemplate);
        } else {
          localStorage.removeItem("app_permanent_template_v3");
          setPermanentTemplate(defaultPermanentTemplate);
        }
        triggerNotification("تم تحديث وإعادة توليد العقد من القوالب الرسمية للنظام بنجاح! 🎉", "success");
      }
    );
  };

  const handleEditContract = (contract: any) => {
    // Map employer back to form value
    let employerVal: ContractorType | "yuanda_permanent" = "altariq";
    if (contract.employer.includes("الطارق")) {
      employerVal = "altariq";
    } else if (contract.employer.includes("يواندا") && contract.contractType === "permanent") {
      employerVal = "yuanda_permanent";
    } else {
      employerVal = "yuanda";
    }

    setFormData({
      id: contract.id,
      fullName: contract.fullName,
      nationalId: contract.nationalId,
      phoneNumber: contract.phoneNumber || "",
      address: contract.address || "",
      jobTitle: contract.jobTitle,
      dateOfBirth: "", // will auto-decode based on 14 digit ID
      governorate: "", // will auto-decode based on 14 digit ID
      gender: "",      // will auto-decode based on 14 digit ID
      contractType: contract.contractType,
      employer: employerVal,
      startDate: contract.startDate,
      endDate: contract.endDate,
      dailyWage: contract.contractType === "daily" ? contract.wageOrSalary : undefined,
      monthlySalary: contract.contractType === "permanent" ? contract.wageOrSalary : undefined,
      workingHours: contract.workingHours || 8,
      notes: contract.notes || ""
    });

    setRightTab("form");
    triggerNotification(`تم تحميل بيانات العقد للموظف (${contract.fullName}) لتعديلها وتحديثها! 📝`, "info");
  };

  const handleSaveUpdatedContract = () => {
    if (!formData.id) return;

    const existingContractsStr = localStorage.getItem("archived_contracts");
    let archivedContractsList = [];
    if (existingContractsStr) {
      try {
        archivedContractsList = JSON.parse(existingContractsStr);
      } catch (e) {
        console.error(e);
      }
    }

    const employerText = formData.employer === "altariq"
      ? "مؤسسة الطارق للمقاولات العمومية"
      : "شركة يواندا للتطوير والمقاولات ش.م.م";

    const existingIndex = archivedContractsList.findIndex((c: any) => c.id === formData.id);

    const updatedContract = {
      id: formData.id,
      fullName: formData.fullName || "موظف جديد",
      nationalId: formData.nationalId || "غير محدد",
      phoneNumber: formData.phoneNumber || "",
      jobTitle: formData.jobTitle || "عامل",
      contractType: formData.contractType,
      employer: employerText,
      startDate: formData.startDate || new Date().toISOString().split("T")[0],
      endDate: formData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      wageOrSalary: formData.contractType === "daily" ? formData.dailyWage : formData.monthlySalary,
      workingHours: formData.workingHours,
      notes: formData.notes
    };

    if (existingIndex > -1) {
      archivedContractsList[existingIndex] = updatedContract;
      triggerNotification(`تم تحديث وحفظ بيانات العقد للموظف (${formData.fullName}) بالأرشيف بنجاح! 💾`, "success");
    } else {
      archivedContractsList.unshift(updatedContract);
      triggerNotification(`تمت أرشفة وحفظ بيانات العقد بنجاح! 💾`, "success");
    }

    localStorage.setItem("archived_contracts", JSON.stringify(archivedContractsList));
    setFormData((prev) => ({ ...prev, id: undefined }));
  };

  const handleContractPrinted = () => {
    if (!activeUser) return;
    const saved = localStorage.getItem("system_users");
    if (saved) {
      try {
        const usersList: SystemUser[] = JSON.parse(saved);
        const updated = usersList.map((u) => {
          if (u.id === activeUser.id) {
            const nextCount = u.createdContractsCount + 1;
            return { ...u, createdContractsCount: nextCount };
          }
          return u;
        });
        localStorage.setItem("system_users", JSON.stringify(updated));
        
        // Update local activeUser state
        const updatedActive = updated.find((u) => u.id === activeUser.id);
        if (updatedActive) setActiveUser(updatedActive);

        // Also save/archive the printed contract in archived_contracts list
        const existingContractsStr = localStorage.getItem("archived_contracts");
        let archivedContractsList = [];
        if (existingContractsStr) {
          try {
            archivedContractsList = JSON.parse(existingContractsStr);
          } catch (e) {
            console.error(e);
          }
        }

        const employerText = formData.employer === "altariq"
          ? "مؤسسة الطارق للمقاولات العمومية"
          : "شركة يواندا للتطوير والمقاولات ش.م.م";

        const existingIndex = formData.id
          ? archivedContractsList.findIndex((c: any) => c.id === formData.id)
          : -1;

        const updatedContract = {
          id: formData.id || "cont_" + Math.random().toString(36).substr(2, 9),
          fullName: formData.fullName || "موظف جديد",
          nationalId: formData.nationalId || "غير محدد",
          phoneNumber: formData.phoneNumber || "",
          jobTitle: formData.jobTitle || "عامل",
          contractType: formData.contractType,
          employer: employerText,
          startDate: formData.startDate || new Date().toISOString().split("T")[0],
          endDate: formData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          wageOrSalary: formData.contractType === "daily" ? formData.dailyWage : formData.monthlySalary,
          workingHours: formData.workingHours,
          notes: formData.notes
        };

        if (existingIndex > -1) {
          archivedContractsList[existingIndex] = updatedContract;
          triggerNotification(`تم تحديث وطباعة العقد للموظف (${formData.fullName}) بنجاح! 💾`, "success");
        } else {
          archivedContractsList.unshift(updatedContract);
          triggerNotification(`تم تسجيل وتوثيق طباعة العقد وأرشفته باسم المسؤول: ${activeUser.fullName}`);
        }

        localStorage.setItem("archived_contracts", JSON.stringify(archivedContractsList));
        
        // Clear editing ID after print/save
        setFormData((prev) => ({ ...prev, id: undefined }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <AppLock 
        onUnlock={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* 1. Header Area with RTL and Premium Branding */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 shrink-0 shadow-lg relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/40">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2 font-sans">
                برنامج Yuanda HR / 远大卓越人力资源管理系统
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  مطور بالذكاء الاصطناعي / AI 赋能
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5">
                توليد عقود اليومية والعقود الثابتة تلقائياً لمقاولي الطارق وشركة يواندا بمجرد إدخال الرقم القومي أو تصوير البطاقة الشخصية / 智能匹配埃及国民身份证自动生成日薪和固定合同（Al-Tariq & Yuanda 承包商专用）
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 animate-fadeIn">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-slate-300 font-bold">
                  {currentUser.toLowerCase() === "ali" ? "المدير / 管理员: Ali 👑" : `المستخدم / 用户: ${currentUser} 👤`}
                </span>
                <button
                  onClick={() => {
                    sessionStorage.removeItem("app_authenticated");
                    sessionStorage.removeItem("app_current_user");
                    setIsAuthenticated(false);
                    setCurrentUser("");
                  }}
                  className="mr-1.5 text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer text-[10px] hover:underline border-r border-slate-800 pr-2"
                  title="تسجيل الخروج من النظام / 退出登录"
                >
                  تسجيل الخروج / 退出登录
                </button>
              </div>
            )}
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-semibold shrink-0">
              <ShieldCheck className="w-4 h-4" /> خادم آمن وقراءة بيانات مشفرة / 安全服务器与加密数据读取
            </span>
          </div>

        </div>
      </header>

      {/* 2. Main Content Split-Screen Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 overflow-hidden gap-6 p-6 relative z-10">
        
        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/30 text-white rounded-xl px-5 py-4 shadow-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-right">
              <h4 className="text-xs font-bold text-slate-100">تحديث ناجح</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{notification.message}</p>
            </div>
          </div>
        )}

        {/* Right Side Pane: ID Scanner & Control Forms or Template Editor (Cols 1-5 on large screens, or 12 for Permits/Timesheet/Directory/Insurance/Leaves) */}
        <section className={`${(rightTab === "permits" || rightTab === "timesheet" || rightTab === "directory" || rightTab === "insurance" || rightTab === "leaves") ? "lg:col-span-12" : "lg:col-span-5"} flex flex-col gap-6`}>
          
          {/* Custom Tabs to easily switch between Form/Scanner, Custom Template Editor, and User Management */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex flex-wrap gap-1">
            {activeUserPermissions.form && (
              <button
                onClick={() => setRightTab("form")}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer min-w-[100px] ${
                  rightTab === "form"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ١. البيانات / 1. 信息录入
              </button>
            )}
            {activeUserPermissions.template && (
              <button
                onClick={() => setRightTab("template")}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer min-w-[100px] ${
                  rightTab === "template"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ٢. القوالب / 2. 合同模板
              </button>
            )}
            {activeUserPermissions.users && (
              <button
                onClick={() => setRightTab("users")}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer min-w-[100px] ${
                  rightTab === "users"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ٣. الحسابات / 3. 账号管理
              </button>
            )}
            {activeUserPermissions.reports && (
              <button
                onClick={() => setRightTab("reports")}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer min-w-[100px] ${
                  rightTab === "reports"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ٤. التقارير / 4. 统计报表
              </button>
            )}
            <button
              onClick={() => setRightTab("permits")}
              className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer min-w-[100px] ${
                rightTab === "permits"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              💼 التصاريح / 工作证
            </button>
            <button
              onClick={() => setRightTab("timesheet")}
              className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer min-w-[110px] ${
                rightTab === "timesheet"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📅 تايم شيت يواندا / 考勤表
            </button>
            <button
              onClick={() => setRightTab("directory")}
              className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer min-w-[130px] ${
                rightTab === "directory"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              💵 سجل الموظفين والرواتب / 员工薪资名册
            </button>
            <button
              onClick={() => setRightTab("insurance")}
              className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer min-w-[100px] ${
                rightTab === "insurance"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🛡️ التأمينات / 社会保险
            </button>
            <button
              onClick={() => setRightTab("leaves")}
              className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer min-w-[100px] ${
                rightTab === "leaves"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🌴 الإجازات السنوية / 年假管理
            </button>
            {currentUser?.toLowerCase() === "ali" && (
              <button
                onClick={() => setRightTab("launcher")}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer min-w-[110px] ${
                  rightTab === "launcher"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ٥. تشغيل / 5. 分享运行
              </button>
            )}
          </div>

          {rightTab === "form" ? (
            <>
              {/* Active Operator Status Indicator */}
              {activeUser ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between text-right animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-bold">
                    <UserCheck className="w-4 h-4" />
                    <span>المُعِد النشط</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{activeUser.fullName}</span>
                    <span className="text-[9px] text-slate-400">قسم {activeUser.department} (أصدر {activeUser.createdContractsCount} عقود)</span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-right">
                  <span className="text-xs font-bold text-amber-400 block">تنبيه: لم يتم تحديد مُعد العقد</span>
                  <span className="text-[9px] text-slate-400">يرجى اختيار حسابك من تبويب "حسابات الموظفين" لتوثيق الطباعة باسمك.</span>
                </div>
              )}

              <IDCardForm
                formData={formData}
                setFormData={setFormData}
                onAutoFilled={() => triggerNotification("تم فك رموز وتعبئة كافة البيانات بنجاح تلقائياً!", "success")}
                onSaveUpdatedContract={handleSaveUpdatedContract}
              />

              {/* Quick Info & Guidelines Sidebar */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 text-right">
                <h4 className="text-xs font-bold text-white flex items-center justify-end gap-1.5 border-b border-slate-800/60 pb-2">
                  دليل وتوضيح فك شفرة الرقم القومي
                  <Info className="w-4 h-4 text-indigo-400" />
                </h4>
                <div className="text-[11px] text-slate-400 leading-relaxed space-y-2.5">
                  <p>
                    💡 <strong>النظام يقوم بالتالي:</strong> بمجرد كتابة الـ 14 رقماً للرقم القومي المصري أو رفع الصورة، نقوم فوراً وبشكل آمن باستخلاص:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside pr-1">
                    <li><strong>تاريخ الميلاد:</strong> من الرمز (C YY MM DD)</li>
                    <li><strong>محافظة الإقامة/الميلاد:</strong> من كود المحافظة المعتمد بجمهورية مصر العربية (مثل 12 للدقهلية، 01 للقاهرة)</li>
                    <li><strong>النوع (ذكر/أنثى):</strong> من الرقم الـ13 في الهوية الشخصية (الفردي ذكر والزوجي أنثى)</li>
                  </ul>
                  <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-indigo-400 font-bold">
                      <Users className="w-3.5 h-3.5" /> مقاولي الطارق & شركة يواندا
                    </span>
                    <span>تحديثات مستمرة 2026</span>
                  </div>
                </div>
              </div>
            </>
          ) : rightTab === "template" ? (
            <TemplateManager
              contractType={formData.contractType}
              dailyTemplate={dailyTemplate}
              permanentTemplate={permanentTemplate}
              setDailyTemplate={setDailyTemplate}
              setPermanentTemplate={setPermanentTemplate}
              onTemplateUpdated={(msg) => triggerNotification(msg, "info")}
            />
          ) : rightTab === "users" ? (
            <UserManager
              selectedUserId={activeUser?.id || null}
              onUserSelected={(u) => setActiveUser(u)}
              onUserChangeNotification={(msg) => triggerNotification(msg, "success")}
              onEditContract={handleEditContract}
            />
          ) : rightTab === "reports" ? (
            <ContractReports 
              onEditContract={handleEditContract}
            />
          ) : rightTab === "permits" ? (
            <PermitManager />
          ) : rightTab === "timesheet" ? (
            <YuandaTimesheet />
          ) : rightTab === "directory" ? (
            <WorkersDirectory />
          ) : rightTab === "insurance" ? (
            <InsuranceManager />
          ) : rightTab === "leaves" ? (
            <LeavesManager />
          ) : currentUser?.toLowerCase() === "ali" ? (
            <TeamLauncher 
              permissions={permissions} 
              onPermissionsChange={handleUpdatePermissions} 
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 text-right">
              <p className="text-sm font-bold text-rose-400">عذراً! ليس لديك صلاحية الوصول إلى هذه الصفحة.</p>
              <p className="text-xs text-slate-400">هذا التبويب مخصص فقط للمدير المسؤول (Ali) لمشاركة التطبيق وإدارته.</p>
              <button 
                onClick={() => setRightTab("form")} 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
              >
                العودة إلى البيانات
              </button>
            </div>
          )}
        </section>

        {/* Left Side Pane: Dynamic Interactive Legal Contract Sheet (Cols 6-12 on large screens) */}
        {(rightTab !== "permits" && rightTab !== "timesheet" && rightTab !== "directory" && rightTab !== "insurance" && rightTab !== "leaves") && (
          <section className="lg:col-span-7 h-full flex flex-col animate-fadeIn">
            <ContractTemplate 
              data={formData} 
              activeTemplateText={activeTemplateText} 
              onContractPrinted={handleContractPrinted}
              onResetTemplates={handleResetToSystemDefaults}
            />
          </section>
        )}

      </main>

      {/* 3. Aesthetic Egyptian Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-3.5 px-6 text-center text-[10px] text-slate-500 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>برنامج Yuanda HR الموحد لشركة يواندا الصينية للمقاولات والتطوير © 2026 / 远大埃及人力资源管理系统联合合同版 © 2026.</span>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 font-mono">آخر تحديث للأنظمة الأمنية وقوانين العمل: يونيو 2026 / 安全系统与劳动法最后更新：2026年6月</span>
          </div>
        </div>
      </footer>

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
