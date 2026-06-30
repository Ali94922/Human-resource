import React, { useState, useEffect } from "react";
import { 
  Users, Calendar, AlertTriangle, CheckCircle2, Clock, Phone, 
  Building2, User, FileDigit, DollarSign, AlertCircle, RefreshCw, 
  Bell, FileText, Search, Share2, HelpCircle, FileSpreadsheet, Edit
} from "lucide-react";
import { ArchivedContract } from "./UserManager";

interface ContractReportsProps {
  onEditContract?: (contract: ArchivedContract) => void;
}

export default function ContractReports({ onEditContract }: ContractReportsProps) {
  const [contracts, setContracts] = useState<ArchivedContract[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEmployer, setFilterEmployer] = useState<"all" | "altariq" | "yuanda">("all");
  const [filterAlert, setFilterAlert] = useState<"all" | "passed_3m" | "approaching_3m" | "expiring_soon">("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load contracts from localStorage on mount and when refresh is triggered
  useEffect(() => {
    const savedContracts = localStorage.getItem("archived_contracts");
    if (savedContracts) {
      try {
        setContracts(JSON.parse(savedContracts));
      } catch (e) {
        console.error("Error parsing archived contracts in reports:", e);
      }
    }
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExportToExcel = () => {
    if (filteredContracts.length === 0) {
      alert("لا توجد بيانات لتصديرها حالياً بناءً على نتائج البحث الحالية.");
      return;
    }

    // Creating an XML/HTML template that Microsoft Excel natively understands as a Spreadsheet.
    // Includes custom styles, RTL orientation and column formatting to prevent trimming leading zeros.
    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>سجل العقود والموظفين</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayRightToLeft/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #4f46e5; color: #ffffff; font-weight: bold; padding: 12px; border: 1px solid #cbd5e1; text-align: center; font-size: 13px; }
          td { padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-size: 12px; }
          .title-container { text-align: center; margin-bottom: 20px; padding: 15px; }
          .title { font-size: 18px; font-weight: bold; color: #1e1b4b; }
          .subtitle { font-size: 11px; color: #475569; margin-top: 5px; }
          .altariq { background-color: #f8fafc; }
          .yuanda { background-color: #f1f5f9; }
          .header-row { background-color: #4f46e5; }
        </style>
      </head>
      <body>
        <div class="title-container">
          <div class="title">تقرير وتصدير بيانات عقود الموظفين والمقاولين</div>
          <div class="subtitle">تم التصدير تلقائياً بتاريخ: ${new Date().toLocaleDateString("ar-EG")} | إجمالي العمالة المصدرة: ${filteredContracts.length}</div>
        </div>
        <table>
          <thead>
            <tr class="header-row">
              <th>م</th>
              <th>اسم الموظف بالكامل</th>
              <th>الرقم القومي</th>
              <th>رقم الهاتف المحمول</th>
              <th>المسمى الوظيفي</th>
              <th>نوع التعاقد</th>
              <th>جهة العمل المتعاقد معها</th>
              <th>مبلغ الأجر / الراتب</th>
              <th>تاريخ التعيين والبدء</th>
              <th>تاريخ انتهاء التعاقد</th>
              <th>حالة فترة الاختبار (٣ شهور)</th>
              <th>حالة صلاحية العقد</th>
            </tr>
          </thead>
          <tbody>
            ${filteredContracts.map((c, index) => {
              const probation = getProbationStatus(c.startDate).label;
              const expiry = getExpiryStatus(c.endDate).label;
              const isPermanent = c.contractType === "permanent";
              const wageText = c.wageOrSalary 
                ? `${c.wageOrSalary} ج.م` 
                : "غير محدد";
              const rowClass = c.employer.includes("الطارق") ? "altariq" : "yuanda";
              
              return `
                <tr class="${rowClass}">
                  <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                  <td style="font-weight: 600; color: #0f172a;">${c.fullName}</td>
                  <td style="mso-number-format:'@'; text-align: center; font-family: monospace;">${c.nationalId}</td>
                  <td style="mso-number-format:'@'; text-align: center; font-family: monospace;">${c.phoneNumber || "غير مسجل"}</td>
                  <td>${c.jobTitle}</td>
                  <td style="text-align: center;">${isPermanent ? "عقد سنوي ثابت" : "أجر يومية مؤقت"}</td>
                  <td>${c.employer}</td>
                  <td style="text-align: center; font-weight: bold; color: #047857;">${wageText}</td>
                  <td style="text-align: center;">${c.startDate}</td>
                  <td style="text-align: center;">${c.endDate}</td>
                  <td style="text-align: center;">${probation}</td>
                  <td style="text-align: center;">${expiry}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.href = url;
    element.download = `سجل_العقود_الذكية_${new Date().toISOString().split("T")[0]}.xls`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Date parsing helper
  const parseDate = (dateStr: string): Date => {
    try {
      return new Date(dateStr);
    } catch {
      return new Date();
    }
  };

  // Calculate probation stats
  // "Passed 3 months": startDate is more than 90 days ago
  // "Approaching 3 months": startDate is between 60 and 90 days ago (approaching completion)
  // "New": startDate is less than 60 days ago
  const getProbationStatus = (startDateStr: string) => {
    const startDate = parseDate(startDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const passed = now.getTime() >= startDate.getTime();

    if (!passed) {
      return {
        status: "not_started" as const,
        days: 0,
        label: "لم يبدأ بعد",
        color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        desc: "تاريخ البدء في المستقبل"
      };
    }

    if (diffDays > 90) {
      return {
        status: "passed" as const,
        days: diffDays,
        label: "تخطى ٣ أشهر (مثبت)",
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        desc: `مر عليه ${diffDays} يوماً (أتم فترة الاختبار)`
      };
    } else if (diffDays >= 60 && diffDays <= 90) {
      return {
        status: "approaching" as const,
        days: diffDays,
        label: "تنبيه: يقترب من ٣ أشهر",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse",
        desc: `مر عليه ${diffDays} يوماً (متبقي أقل من شهر على إتمام ٣ أشهر!)`
      };
    } else {
      return {
        status: "under" as const,
        days: diffDays,
        label: "حديث (تحت الاختبار)",
        color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        desc: `مر عليه ${diffDays} يوماً (في فترة التجربة الأولى)`
      };
    }
  };

  // Calculate Expiry status
  const getExpiryStatus = (endDateStr: string) => {
    const endDate = parseDate(endDateStr);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: "expired" as const,
        days: diffDays,
        label: "منتهي!",
        color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        desc: `انتهى منذ ${Math.abs(diffDays)} يوم`
      };
    } else if (diffDays <= 30) {
      return {
        status: "expiring" as const,
        days: diffDays,
        label: "ينتهي قريباً جداً!",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse",
        desc: `متبقي ${diffDays} يوماً فقط`
      };
    } else {
      return {
        status: "valid" as const,
        days: diffDays,
        label: "ساري وآمن",
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        desc: `متبقي ${diffDays} يوماً`
      };
    }
  };

  // WhatsApp individual share
  const handleShareWhatsApp = (contract: ArchivedContract) => {
    const wageText = contract.wageOrSalary 
      ? `${contract.wageOrSalary} ج.م` 
      : "غير محدد بالملف";

    const text = `*تقرير موظف موثق* 📋\n\n` +
      `👤 *الاسم:* ${contract.fullName}\n` +
      `🆔 *الرقم القومي:* ${contract.nationalId}\n` +
      `📞 *رقم الموبايل:* ${contract.phoneNumber || "غير محدد"}\n` +
      `💼 *الوظيفة:* ${contract.jobTitle}\n` +
      `🏢 *الشركة المتعاقد معها:* ${contract.employer}\n` +
      `📅 *تاريخ التعيين:* ${contract.startDate}\n` +
      `⏳ *تاريخ انتهاء العقد:* ${contract.endDate}\n` +
      `💰 *المبلغ المستحق:* ${wageText}\n` +
      `⚠️ *حالة فترة الاختبار:* ${getProbationStatus(contract.startDate).label}\n\n` +
      `*تم استخلاص وتدقيق البيانات تلقائياً عبر برنامج Yuanda HR الذكي 🇨🇳🇪🇬*`;

    const encodedText = encodeURIComponent(text);
    const url = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, "_blank");
  };

  // Counts and statistics
  const totalEmployees = contracts.length;
  
  const altariqCount = contracts.filter(c => 
    c.employer.includes("الطارق")
  ).length;

  const yuandaCount = contracts.filter(c => 
    c.employer.includes("يواندا")
  ).length;

  // Alerts counters
  const passed3mCount = contracts.filter(c => getProbationStatus(c.startDate).status === "passed").length;
  const approaching3mCount = contracts.filter(c => getProbationStatus(c.startDate).status === "approaching").length;
  const expiringSoonCount = contracts.filter(c => getExpiryStatus(c.endDate).status === "expiring" || getExpiryStatus(c.endDate).status === "expired").length;

  // Filter & Search logic
  const filteredContracts = contracts.filter(c => {
    // 1. Search Query
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      c.fullName.toLowerCase().includes(query) ||
      c.nationalId.includes(query) ||
      c.jobTitle.toLowerCase().includes(query) ||
      (c.phoneNumber && c.phoneNumber.includes(query));

    // 2. Employer Filter
    let matchesEmployer = true;
    if (filterEmployer === "altariq") {
      matchesEmployer = c.employer.includes("الطارق");
    } else if (filterEmployer === "yuanda") {
      matchesEmployer = c.employer.includes("يواندا");
    }

    // 3. Alert Filter
    let matchesAlert = true;
    const probationInfo = getProbationStatus(c.startDate);
    const expiryInfo = getExpiryStatus(c.endDate);

    if (filterAlert === "passed_3m") {
      matchesAlert = probationInfo.status === "passed";
    } else if (filterAlert === "approaching_3m") {
      matchesAlert = probationInfo.status === "approaching";
    } else if (filterAlert === "expiring_soon") {
      matchesAlert = expiryInfo.status === "expiring" || expiryInfo.status === "expired";
    }

    return matchesSearch && matchesEmployer && matchesAlert;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6 text-right animate-fadeIn">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportToExcel}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 hover:border-emerald-400 rounded-lg text-white transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold shadow-md hover:shadow-emerald-500/20"
            title="تصدير نتائج البحث الحالية إلى ملف Excel مميز"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            تصدير Excel
          </button>
          <button
            onClick={handleRefresh}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer text-xs"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            تحديث
          </button>
        </div>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 justify-end">
            <Bell className="w-5 h-5 text-indigo-400" />
            تقارير وتنبيهات العقود الذكية
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إحصائيات المقاولين، مواعيد انتهاء العقود الثابتة، وتتبع فترات الاختبار (3 شهور) بدقة
          </p>
        </div>
      </div>

      {/* Contractor & Probation Statistics Cards */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Al-Tariq Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-xl -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2.5 py-1 rounded-full">
              مقاول بناء
            </span>
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-semibold">مؤسسة الطارق للمقاولات</h4>
            <div className="flex items-baseline justify-end gap-1.5 mt-2">
              <span className="text-2xl font-bold text-white font-mono">{altariqCount}</span>
              <span className="text-[10px] text-slate-500">موظفين مسجلين</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/40">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${totalEmployees ? (altariqCount / totalEmployees) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-slate-500 mt-1 block">
              نسبة {totalEmployees ? Math.round((altariqCount / totalEmployees) * 100) : 0}% من إجمالي العمالة
            </span>
          </div>
        </div>

        {/* Yuanda Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-600/5 rounded-full blur-xl -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold px-2.5 py-1 rounded-full">
              الشركة الأم
            </span>
            <Building2 className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-semibold">شركة يواندا للتطوير والمقاولات</h4>
            <div className="flex items-baseline justify-end gap-1.5 mt-2">
              <span className="text-2xl font-bold text-white font-mono">{yuandaCount}</span>
              <span className="text-[10px] text-slate-500">موظفين مسجلين</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/40">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-teal-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${totalEmployees ? (yuandaCount / totalEmployees) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-slate-500 mt-1 block">
              نسبة {totalEmployees ? Math.round((yuandaCount / totalEmployees) * 100) : 0}% من إجمالي العمالة
            </span>
          </div>
        </div>

      </div>

      {/* Probation Alerts Badges & Filter Row */}
      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 space-y-3">
        <span className="text-[11px] font-bold text-slate-300 block">مرشحات ذكية سريعة (التنبيهات):</span>
        <div className="grid grid-cols-4 gap-2">
          
          <button
            onClick={() => setFilterAlert(filterAlert === "all" ? "all" : "all")}
            className={`p-2 rounded-lg border text-right transition-all cursor-pointer ${
              filterAlert === "all"
                ? "bg-indigo-600/15 border-indigo-500/30 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="text-[9px] text-slate-500">إجمالي العقود</div>
            <div className="text-xs font-bold font-mono mt-0.5">{totalEmployees}</div>
          </button>

          <button
            onClick={() => setFilterAlert("passed_3m")}
            className={`p-2 rounded-lg border text-right transition-all cursor-pointer ${
              filterAlert === "passed_3m"
                ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="text-[9px] text-slate-400 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              تخطوا ٣ شهور
            </div>
            <div className="text-xs font-bold font-mono mt-0.5">{passed3mCount}</div>
          </button>

          <button
            onClick={() => setFilterAlert("approaching_3m")}
            className={`p-2 rounded-lg border text-right transition-all cursor-pointer ${
              filterAlert === "approaching_3m"
                ? "bg-amber-600/20 border-amber-500/40 text-amber-300 animate-pulse"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="text-[9px] text-slate-400 flex items-center justify-end gap-1">
              <Clock className="w-2.5 h-2.5 text-amber-400" />
              يقتربون من ٣ أشهر
            </div>
            <div className="text-xs font-bold font-mono mt-0.5">{approaching3mCount}</div>
          </button>

          <button
            onClick={() => setFilterAlert("expiring_soon")}
            className={`p-2 rounded-lg border text-right transition-all cursor-pointer ${
              filterAlert === "expiring_soon"
                ? "bg-rose-600/20 border-rose-500/40 text-rose-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="text-[9px] text-slate-400 flex items-center justify-end gap-1">
              <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
              منتهي/ينتهي قريباً
            </div>
            <div className="text-xs font-bold font-mono mt-0.5">{expiringSoonCount}</div>
          </button>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {/* Employer Filter */}
          <select
            value={filterEmployer}
            onChange={(e: any) => setFilterEmployer(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">كل المقاولين</option>
            <option value="altariq">مؤسسة الطارق فقط</option>
            <option value="yuanda">شركة يواندا فقط</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الرقم القومي، الوظيفة أو رقم الموبايل..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-4 pl-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Employees Report Table & Cards List */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-8 bg-slate-950/20 rounded-xl border border-slate-800 border-dashed">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h5 className="text-xs font-bold text-slate-400">لا توجد بيانات تطابق البحث</h5>
            <p className="text-[10px] text-slate-500 mt-1">تأكد من كتابة الاسم صحيحاً أو تغيير الفلتر.</p>
          </div>
        ) : (
          filteredContracts.map((contract) => {
            const probationInfo = getProbationStatus(contract.startDate);
            const expiryInfo = getExpiryStatus(contract.endDate);
            const isPermanent = contract.contractType === "permanent";

            return (
              <div 
                key={contract.id} 
                className="bg-slate-950/50 border border-slate-800/70 rounded-xl p-3.5 space-y-3 hover:border-slate-700/80 transition-all"
              >
                {/* Row 1: Header (Name & Employer) */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    {onEditContract && (
                      <button
                        onClick={() => onEditContract(contract)}
                        className="p-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 rounded-md transition-all cursor-pointer"
                        title="تعديل وتحديث بيانات هذا العقد"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleShareWhatsApp(contract)}
                      className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 rounded-md transition-all cursor-pointer"
                      title="مشاركة على الواتساب"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      isPermanent 
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {isPermanent ? "ثابت (يواندا)" : "يومية / مؤقت"}
                    </span>
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-white leading-normal">{contract.fullName}</h4>
                    <span className="text-[9px] text-slate-500 block mt-0.5">{contract.employer}</span>
                  </div>
                </div>

                {/* Row 2: Basic Info Grid (Phone, National ID, Job, Wage) */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-slate-400 bg-slate-950/30 p-2.5 rounded-lg border border-slate-900">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="font-mono text-slate-200">{contract.phoneNumber || "غير مسجل"}</span>
                    <span className="text-slate-500">موبايل:</span>
                    <Phone className="w-3 h-3 text-slate-500" />
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="font-mono text-slate-200">{contract.nationalId}</span>
                    <span className="text-slate-500">رقم قومي:</span>
                    <FileDigit className="w-3 h-3 text-slate-500" />
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="font-semibold text-slate-200">{contract.wageOrSalary ? `${contract.wageOrSalary} ج.م` : "غير محدد"}</span>
                    <span className="text-slate-500">{isPermanent ? "الراتب:" : "الأجر اليومي:"}</span>
                    <DollarSign className="w-3 h-3 text-slate-500" />
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="font-semibold text-slate-200">{contract.jobTitle}</span>
                    <span className="text-slate-500">الوظيفة:</span>
                    <User className="w-3 h-3 text-slate-500" />
                  </div>
                </div>

                {/* Row 3: Timings & Status Indicators */}
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  
                  {/* Expiration date alert for permanent contracts */}
                  <div className="space-y-1 text-right">
                    <span className="text-slate-500 block">انتهاء التعاقد:</span>
                    <div className="flex items-center justify-end gap-1">
                      <span className={`px-2 py-0.5 rounded-md font-bold border ${expiryInfo.color}`}>
                        {expiryInfo.label}
                      </span>
                      <span className="text-slate-300 font-mono">{contract.endDate}</span>
                    </div>
                    <span className="text-[8px] text-slate-500 block leading-tight">{expiryInfo.desc}</span>
                  </div>

                  {/* 3-Month Probation Alert */}
                  <div className="space-y-1 text-right border-r border-slate-800 pr-2">
                    <span className="text-slate-500 block">تتبع فترة الاختبار (٣ شهور):</span>
                    <div className="flex items-center justify-end gap-1">
                      <span className={`px-2 py-0.5 rounded-md font-bold border ${probationInfo.color}`}>
                        {probationInfo.label}
                      </span>
                      <span className="text-slate-300 font-mono">{contract.startDate}</span>
                    </div>
                    <span className="text-[8px] text-slate-500 block leading-tight">{probationInfo.desc}</span>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Guide/Clarification text footer */}
      <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-800/60 text-[9px] text-slate-500 leading-normal flex gap-1.5 items-start">
        <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-right">
          💡 <strong>آلية التنبيهات:</strong> يقوم النظام بحساب الفارق الزمني منذ تاريخ بدء العمل الفعلي تلقائياً.
          إذا تخطى الموظف 90 يوماً، يتم تصنيفه كـ <strong>"تخطى ٣ أشهر (مثبت)"</strong>.
          وإذا كان الموظف بين 60 و 90 يوماً، فإنه يصنف كـ <strong>"يقترب من ٣ أشهر"</strong> لمراجعة أدائه واتخاذ قرار تجديد عقده قبل فوات الأوان.
        </p>
      </div>

    </div>
  );
}
