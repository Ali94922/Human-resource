import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  FileSpreadsheet, 
  Plus, 
  X, 
  Check, 
  DollarSign, 
  Phone, 
  Briefcase, 
  Layers, 
  Hash, 
  Download, 
  Upload,
  Coins,
  Calculator,
  RefreshCw
} from "lucide-react";
import { SEED_WORKERS } from "../data/seedWorkers";

export interface DirectoryWorker {
  id: string;
  code: string;
  fullName: string;
  jobTitle: string;
  salary: number;
  mealAllowance: number;
  phone: string;
  department: string;
}

export default function WorkersDirectory() {
  // Load initial state
  const [workers, setWorkers] = useState<DirectoryWorker[]>(() => {
    const saved = localStorage.getItem("app_workers_directory_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Seed the 81 real workers from the provided spreadsheet data
    return SEED_WORKERS.map(w => ({
      id: w.id,
      code: w.code,
      fullName: w.fullName,
      jobTitle: w.jobTitle,
      salary: w.salary,
      mealAllowance: w.mealAllowance,
      phone: w.phone,
      department: w.department
    }));
  });

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [editingWorker, setEditingWorker] = useState<DirectoryWorker | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formState, setFormState] = useState({
    code: "",
    fullName: "",
    jobTitle: "",
    salary: "",
    mealAllowance: "",
    phone: "",
    department: "south"
  });

  // Excel Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifications
  const [alert, setAlert] = useState<{ text: string; type: "success" | "error" } | null>(null);
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

  const triggerAlert = (text: string, type: "success" | "error" = "success") => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("app_workers_directory_v1", JSON.stringify(workers));
  }, [workers]);

  // Sync / Reset to the 81 authentic workers
  const handleSyncSeedWorkers = () => {
    askConfirmation(
      "🔄 إعادة ضبط ومزامنة البيانات / 重置并同步数据",
      "هل تريد إعادة ضبط السجل ومزامنة الـ 81 موظف الأصليين من الكشف؟ سيتم استبدال البيانات الحالية بالبيانات الأصلية. / 您是否要重置档案并同步名单中原本的81位员工？当前数据将被覆盖。",
      () => {
        const original = SEED_WORKERS.map(w => ({
          id: w.id,
          code: w.code,
          fullName: w.fullName,
          jobTitle: w.jobTitle,
          salary: w.salary,
          mealAllowance: w.mealAllowance,
          phone: w.phone,
          department: w.department
        }));
        setWorkers(original);
        localStorage.setItem("app_workers_directory_v1", JSON.stringify(original));
        triggerAlert("تمت إعادة ضبط ومزامنة الـ 81 موظف الأصليين بنجاح / 81位原始员工名册已成功重置并同步！ 🔄");
      }
    );
  };

  // Handle Form Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Add Worker
  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.fullName || !formState.code || !formState.jobTitle) {
      triggerAlert("يرجى ملء الحقول الأساسية: الاسم، الكود، والوظيفة / 请填写必填项：姓名、工号和岗位", "error");
      return;
    }

    // Check if code already exists
    const codeExists = workers.some(w => w.code.trim().toLowerCase() === formState.code.trim().toLowerCase());
    if (codeExists) {
      triggerAlert(`عذراً، كود الموظف (${formState.code}) مستخدم بالفعل! / 抱歉，该工号 (${formState.code}) 已被使用！`, "error");
      return;
    }

    const newWorker: DirectoryWorker = {
      id: Date.now().toString(),
      code: formState.code.trim(),
      fullName: formState.fullName.trim(),
      jobTitle: formState.jobTitle.trim(),
      salary: parseFloat(formState.salary) || 0,
      mealAllowance: parseFloat(formState.mealAllowance) || 0,
      phone: formState.phone.trim(),
      department: formState.department.trim() || "south"
    };

    setWorkers(prev => [newWorker, ...prev]);
    resetForm();
    setShowAddModal(false);
    triggerAlert(`تمت إضافة الموظف الجديد ${formState.fullName} بنجاح / 员工 ${formState.fullName} 添加成功！ 👤`);
  };

  // Edit Worker trigger
  const startEdit = (worker: DirectoryWorker) => {
    setEditingWorker(worker);
    setFormState({
      code: worker.code,
      fullName: worker.fullName,
      jobTitle: worker.jobTitle,
      salary: worker.salary.toString(),
      mealAllowance: worker.mealAllowance.toString(),
      phone: worker.phone,
      department: worker.department
    });
  };

  // Save Edit Worker
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    if (!formState.fullName || !formState.code || !formState.jobTitle) {
      triggerAlert("يرجى ملء الحقول الأساسية / 请填写所有必填字段", "error");
      return;
    }

    // Check code duplication excluding current editing worker
    const codeExists = workers.some(w => w.id !== editingWorker.id && w.code.trim().toLowerCase() === formState.code.trim().toLowerCase());
    if (codeExists) {
      triggerAlert(`عذراً، كود الموظف (${formState.code}) مستخدم بالفعل! / 抱歉，该工号 (${formState.code}) 已被使用！`, "error");
      return;
    }

    const updated = workers.map(w => {
      if (w.id === editingWorker.id) {
        return {
          ...w,
          code: formState.code.trim(),
          fullName: formState.fullName.trim(),
          jobTitle: formState.jobTitle.trim(),
          salary: parseFloat(formState.salary) || 0,
          mealAllowance: parseFloat(formState.mealAllowance) || 0,
          phone: formState.phone.trim(),
          department: formState.department.trim()
        };
      }
      return w;
    });

    setWorkers(updated);
    setEditingWorker(null);
    resetForm();
    triggerAlert("تم تحديث بيانات الموظف بنجاح / 员工数据更新成功！ 💾");
  };

  // Delete Worker
  const handleDelete = (id: string, name: string) => {
    askConfirmation(
      "🗑️ حذف موظف / 删除员工",
      `هل أنت متأكد من حذف الموظف (${name}) نهائياً؟ / 您确定要永久删除员工 (${name}) 吗？`,
      () => {
        setWorkers(prev => prev.filter(w => w.id !== id));
        triggerAlert("تم حذف الموظف بنجاح / 员工删除成功。");
      }
    );
  };

  // Reset form inputs
  const resetForm = () => {
    setFormState({
      code: "",
      fullName: "",
      jobTitle: "",
      salary: "",
      mealAllowance: "",
      phone: "",
      department: "south"
    });
  };

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const dataRows = [
      ["كود الموظف / 工号", "اسم الموظف / 姓名", "الوظيفة / 岗位", "المرتب الأساسي / 基本工资", "بدل الوجبة / 餐补", "رقم الهاتف / 手机号", "القسم / الموقع / 部门区域"],
      ...workers.map(w => [w.code, w.fullName, w.jobTitle, w.salary, w.mealAllowance, w.phone, w.department])
    ];

    const ws = XLSX.utils.aoa_to_sheet(dataRows);
    ws["!cols"] = [
      { wch: 15 }, // Code
      { wch: 28 }, // Name
      { wch: 22 }, // Job Title
      { wch: 15 }, // Salary
      { wch: 15 }, // Meal Allowance
      { wch: 18 }, // Phone
      { wch: 15 }  // Department
    ];

    XLSX.utils.book_append_sheet(wb, ws, "كشف المرتبات والبيانات");
    XLSX.writeFile(wb, `سجل_المرتبات_والموظفين_${new Date().getFullYear()}.xlsx`);
    triggerAlert("تم تصدير شيت الإكسيل بنجاح / Excel导出成功！ 📊");
  };

  // Import from Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        // Parse rows
        const parsedWorkers: DirectoryWorker[] = [];
        // Skip header row
        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length < 3 || !row[1]) continue; // Needs at least code and name

          parsedWorkers.push({
            id: (Date.now() + i).toString(),
            code: String(row[0] || `Y${Math.floor(Math.random() * 900 + 100)}`).trim(),
            fullName: String(row[1]).trim(),
            jobTitle: String(row[2] || "عامل").trim(),
            salary: parseFloat(row[3]) || 0,
            mealAllowance: parseFloat(row[4]) || 0,
            phone: String(row[5] || "").trim(),
            department: String(row[6] || "south").trim()
          });
        }

        if (parsedWorkers.length > 0) {
          // Merge or replace
          askConfirmation(
            "📊 استيراد موظفين من ملف",
            `تم العثور على (${parsedWorkers.length}) موظف في الملف. هل تود إضافتهم إلى القائمة الحالية؟`,
            () => {
              setWorkers(prev => [...parsedWorkers, ...prev]);
              triggerAlert(`تم استيراد ${parsedWorkers.length} موظف بنجاح! 📥`);
            }
          );
        } else {
          triggerAlert("لم يتم العثور على أي صفوف صالحة للاستيراد. يرجى مراجعة ترتيب الأعمدة.", "error");
        }
      } catch (err) {
        console.error(err);
        triggerAlert("فشل قراءة ملف الإكسيل. تأكد من توافق الصيغة.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Get list of departments
  const departments = ["all", ...Array.from(new Set(workers.map(w => w.department))).filter(Boolean)];

  // Filtered list
  const filteredWorkers = workers.filter(w => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      w.fullName.toLowerCase().includes(s) ||
      w.code.toLowerCase().includes(s) ||
      w.jobTitle.toLowerCase().includes(s) ||
      w.phone.includes(s) ||
      w.department.toLowerCase().includes(s);

    const matchesDept = selectedDept === "all" || w.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  // Finance summaries
  const totalEmployees = filteredWorkers.length;
  const totalSalaries = filteredWorkers.reduce((sum, w) => sum + w.salary, 0);
  const totalMealAllowances = filteredWorkers.reduce((sum, w) => sum + w.mealAllowance, 0);
  const totalBudget = totalSalaries + totalMealAllowances;

  return (
    <div className="space-y-6 text-right animate-fadeIn" dir="rtl" id="workers-directory-section">
      
      {/* 1. Header widget with alerts */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full filter blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-600/5 rounded-full filter blur-3xl -z-10"></div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">سجل بيانات ومستحقات الموظفين والعمال / 员工数据与应得薪资名册 💳</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">قاعدة بيانات ذكية لإدارة الكود والوظيفة والمرتب وبدل الوجبة ورقم الهاتف والقسم مع ميزات البحث والتصدير / 管理员工工号、岗位、薪资、餐补、手机号及部门的智能系统，支持搜索与导出</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Import Button */}
            <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>استيراد Excel / 导入 📥</span>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                ref={fileInputRef} 
                onChange={handleImportExcel} 
                className="hidden" 
              />
            </label>

            {/* Export Button */}
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel / 导出 📊</span>
            </button>

            {/* Sync / Seed Workers Button */}
            <button
              onClick={handleSyncSeedWorkers}
              className="bg-amber-600/95 hover:bg-amber-500 text-slate-950 text-xs font-black px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer border border-amber-400/30"
              title="مزامنة وتنزيل الـ 81 موظف الأصليين بنقرة واحدة / 一键同步并下载81位原始员工名册"
            >
              <RefreshCw className="w-4 h-4 text-slate-950" />
              <span>تنزيل الـ 81 موظف الأصليين / 同步81名员工 🔄</span>
            </button>

            {/* Add New Button */}
            <button
              onClick={() => {
                resetForm();
                setEditingWorker(null);
                setShowAddModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة موظف جديد / 新增员工 👤</span>
            </button>
          </div>
        </div>

        {/* 2. Visual financial dashboard metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Count */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">إجمالي الموظفين / 员工总数</span>
              <span className="text-xl font-black text-white block">{totalEmployees} <span className="text-xs text-slate-400 font-normal">موظف / 员工</span></span>
            </div>
            <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          {/* Salaries Sum */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">مجموع الرواتب الأساسية / 基本薪资总额</span>
              <span className="text-xl font-black text-emerald-400 block">{totalSalaries.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ج.م / 埃镑</span></span>
            </div>
            <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          {/* Meals Sum */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">مجموع بدل الوجبات / 餐费补贴总额</span>
              <span className="text-xl font-black text-amber-400 block">{totalMealAllowances.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ج.م / 埃镑</span></span>
            </div>
            <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>

          {/* Budget Commitment */}
          <div className="bg-slate-900/60 border border-indigo-500/10 p-4 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">التكلفة المالية الإجمالية / 财务预算总成本</span>
              <span className="text-xl font-black text-indigo-400 block">{totalBudget.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ج.م / 埃镑</span></span>
            </div>
            <div className="w-9 h-9 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Alert toast inside container */}
      {alert && (
        <div className={`p-4 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 border animate-fadeIn ${
          alert.type === "success" 
            ? "bg-slate-900 border-emerald-500/30 text-emerald-400" 
            : "bg-slate-900 border-rose-500/30 text-rose-400"
        }`}>
          <Check className="w-4 h-4 shrink-0" />
          <span>{alert.text}</span>
        </div>
      )}

      {/* 3. Filtering & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم، الكود، الوظيفة، رقم الهاتف أو القسم... / 按姓名、工号、岗位、手机号或部门搜索..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-bold">تصفية حسب القسم / 按部门筛选:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === "all" ? "📋 جميع الأقسام / 所有部门" : `🏢 قسم ${dept} / ${dept} 部门`}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* 4. Main Edit Panel / Add Form Block inline if editing */}
      {editingWorker && (
        <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-slideDown">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-black text-indigo-400 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4" />
              تعديل بيانات العامل / الموظف / 编辑员工信息: <span className="text-white">({editingWorker.fullName})</span>
            </h4>
            <button 
              onClick={() => {
                setEditingWorker(null);
                resetForm();
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Code */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block">كود الموظف / 员工工号:</label>
              <input
                type="text"
                name="code"
                required
                value={formState.code}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Name */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block">الاسم بالكامل / 员工全名:</label>
              <input
                type="text"
                name="fullName"
                required
                value={formState.fullName}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Job */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block">الوظيفة / 岗位:</label>
              <input
                type="text"
                name="jobTitle"
                required
                value={formState.jobTitle}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Department */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block">القسم / 部门:</label>
              <input
                type="text"
                name="department"
                value={formState.department}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Salary */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block">المرتب الأساسي (ج.م) / 基本工资(埃镑):</label>
              <input
                type="number"
                name="salary"
                value={formState.salary}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Meal Allowance */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block">بدل الوجبة (ج.م) / 餐费补贴(埃镑):</label>
              <input
                type="number"
                name="mealAllowance"
                value={formState.mealAllowance}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Phone */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block">رقم الهاتف / 手机号码:</label>
              <input
                type="text"
                name="phone"
                value={formState.phone}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Save Button */}
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                حفظ التغييرات / 保存修改 💾
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 5. Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>إضافة موظف أو عامل جديد للسجل / 新增员工名册</span>
              </span>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWorker} className="space-y-4 text-xs font-bold text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                {/* Code */}
                <div className="space-y-1.5 col-span-1">
                  <label>الكود الوظيفي (مثال: Y77) / 员工工号 (如: Y77):</label>
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="Y77"
                    value={formState.code}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Name */}
                <div className="space-y-1.5 col-span-1">
                  <label>اسم الموظف بالكامل / 员工全名:</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="سيد أحمد السيد محمد"
                    value={formState.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Job */}
                <div className="space-y-1.5 col-span-1">
                  <label>الوظيفة / 岗位:</label>
                  <input
                    type="text"
                    name="jobTitle"
                    required
                    placeholder="مشرف سلامة"
                    value={formState.jobTitle}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5 col-span-1">
                  <label>القسم / الموقع / 部门、区域:</label>
                  <input
                    type="text"
                    name="department"
                    placeholder="south"
                    value={formState.department}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Salary */}
                <div className="space-y-1.5 col-span-1">
                  <label>المرتب الأساسي (ج.م) / 基本工资(埃镑):</label>
                  <input
                    type="number"
                    name="salary"
                    placeholder="12000"
                    value={formState.salary}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Meal */}
                <div className="space-y-1.5 col-span-1">
                  <label>بدل الوجبة (ج.م) / 餐费补贴(埃镑):</label>
                  <input
                    type="number"
                    name="mealAllowance"
                    placeholder="1500"
                    value={formState.mealAllowance}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label>رقم الهاتف / التواصل / 手机号码、联络方式:</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="201007932476"
                  value={formState.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء / 取消 ❌
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  حفظ وإضافة العامل / 保存并添加 ✅
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 6. Directory List Table Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <span>قائمة الموظفين والعمال النشطة / 活跃员工与工人在册名单</span>
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full text-indigo-400 font-normal">
              إجمالي {filteredWorkers.length} صف / 共 {filteredWorkers.length} 行
            </span>
          </span>
          <span className="text-[10px] text-slate-400">انقر على أيقونة التعديل أو الحذف لإدارة الموظفين / 点击编辑或删除图标管理员工信息</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] font-bold">
                <th className="px-4 py-3 border-l border-slate-800/60">كود الموظف / 员工工号</th>
                <th className="px-4 py-3 border-l border-slate-800/60">الاسم بالكامل / 员工全名</th>
                <th className="px-4 py-3 border-l border-slate-800/60">الوظيفة / 岗位</th>
                <th className="px-4 py-3 border-l border-slate-800/60">القسم / الموقع / 部门、区域</th>
                <th className="px-4 py-3 border-l border-slate-800/60">المرتب الأساسي / 基本工资</th>
                <th className="px-4 py-3 border-l border-slate-800/60">بدل الوجبة / 餐费补贴</th>
                <th className="px-4 py-3 border-l border-slate-800/60">رقم الهاتف / 手机号码</th>
                <th className="px-4 py-3 text-center">الإجراءات / 操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 font-medium space-y-2">
                    <Users className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-xs">لا يوجد موظفين يطابقون معايير البحث والفلترة المحددة / 没有找到匹配的员工信息。</p>
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-800/20 transition-colors">
                    
                    {/* Code */}
                    <td className="px-4 py-3 border-l border-slate-800/30 font-mono font-bold text-indigo-400 text-sm">
                      {worker.code}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3 border-l border-slate-800/30 font-extrabold text-white text-sm">
                      {worker.fullName}
                    </td>

                    {/* Job */}
                    <td className="px-4 py-3 border-l border-slate-800/30 text-slate-200 font-medium">
                      {worker.jobTitle}
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 border-l border-slate-800/30 text-indigo-300">
                      <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px]">
                        {worker.department}
                      </span>
                    </td>

                    {/* Salary */}
                    <td className="px-4 py-3 border-l border-slate-800/30 font-black text-emerald-400 text-sm">
                      {worker.salary.toLocaleString()} ج.م / 埃镑
                    </td>

                    {/* Meal */}
                    <td className="px-4 py-3 border-l border-slate-800/30 font-black text-amber-400 text-sm">
                      {worker.mealAllowance.toLocaleString()} ج.م / 埃镑
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 border-l border-slate-800/30 font-mono text-slate-300">
                      {worker.phone || "---"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => startEdit(worker)}
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/10 transition-all cursor-pointer"
                          title="تعديل / 编辑"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(worker.id, worker.fullName)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 transition-all cursor-pointer"
                          title="حذف / 删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-[10px] text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
          <span>💡 نصيحة استيراد: عند استيراد ملف Excel، تأكد من أن الأعمدة مرتبة كالتالي: (الكود، الاسم، الوظيفة، المرتب، بدل الوجبة، رقم الهاتف، القسم) / 💡 导入建议：导入 Excel 文件时，请确保列的排列顺序为：（工号、姓名、岗位、基本工资、餐补、手机号、部门）。</span>
          <span className="font-bold text-indigo-400">سجل بيانات ومستحقات الموظفين والعمال / 员工数据与应得薪资名册 v1.2</span>
        </div>

      </div>

      {confirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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
                إلغاء / 取消 🚫
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl cursor-pointer transition-all shadow-md shadow-amber-900/10"
              >
                تأكيد وبدء العمل / 确认并执行 ✅
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
