import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { SEED_WORKERS } from "../data/seedWorkers";
import { 
  FileSpreadsheet, 
  Upload, 
  Loader2, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Plus, 
  Check, 
  Clipboard, 
  MapPin, 
  User, 
  Search, 
  FileDown, 
  X, 
  Briefcase,
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  UserCheck,
  RefreshCw
} from "lucide-react";

interface PermitWorker {
  id: string;
  fullName: string;
  nationalId: string;
  governorate: string;
  jobTitle: string;
}

// Map of Egyptian Governorates code from National ID
const GOVERNORATES_MAP: Record<string, string> = {
  "01": "القاهرة",
  "02": "الإسكندرية",
  "03": "بورسعيد",
  "04": "السويس",
  "11": "دمياط",
  "12": "الدقهلية",
  "13": "الشرقية",
  "14": "القليوبية",
  "15": "كفر الشيخ",
  "16": "الغربية",
  "17": "المنوفية",
  "18": "البحيرة",
  "19": "الإسماعيلية",
  "21": "الجيزة",
  "22": "بني سويف",
  "23": "الفيوم",
  "24": "المنيا",
  "25": "أسيوط",
  "26": "سوهاج",
  "27": "قنا",
  "28": "أسوان",
  "29": "الأقصر",
  "31": "البحر الأحمر",
  "32": "الوادي الجديد",
  "33": "مطروح",
  "34": "شمال سيناء",
  "35": "جنوب سيناء",
  "88": "خارج جمهورية مصر العربية"
};

// Helper function to decode Governorate from Egyptian National ID
function decodeGovernorate(idStr: string): string {
  const cleanId = idStr.replace(/\D/g, "");
  if (cleanId.length < 9) return "غير محدد";
  const govCode = cleanId.substring(7, 9);
  return GOVERNORATES_MAP[govCode] || "غير محدد";
}

const ARABIC_MONTHS = [
  { value: 1, label: "يناير (01)" },
  { value: 2, label: "فبراير (02)" },
  { value: 3, label: "مارس (03)" },
  { value: 4, label: "أبريل (04)" },
  { value: 5, label: "مايو (05)" },
  { value: 6, label: "يونيو (06)" },
  { value: 7, label: "يوليو (07)" },
  { value: 8, label: "أغسطس (08)" },
  { value: 9, label: "سبتمبر (09)" },
  { value: 10, label: "أكتوبر (10)" },
  { value: 11, label: "نوفمبر (11)" },
  { value: 12, label: "ديسمبر (12)" },
];

const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate();
};

export default function PermitManager() {
  const [workers, setWorkers] = useState<PermitWorker[]>(() => {
    const saved = localStorage.getItem("app_permit_workers_v1");
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
    // Seed the 81 real workers mapped to PermitWorker structure
    return SEED_WORKERS.map(w => ({
      id: w.id,
      fullName: w.fullName,
      nationalId: w.nationalId,
      governorate: w.governorate || "القاهرة",
      jobTitle: w.jobTitle
    }));
  });

  // Top level sections: 'workers' database or 'timesheet' monthly attendance
  const [activeSection, setActiveSection] = useState<"workers" | "timesheet">("workers");

  // Timesheet state variables
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [attendance, setAttendance] = useState<Record<string, Record<number, "ح" | "غ" | "ع" | "إ">>>({});
  const [timesheetViewMode, setTimesheetViewMode] = useState<"table" | "daily" | "worker">("table");
  const [activeEditDay, setActiveEditDay] = useState<number>(1);
  const [activeEditWorkerId, setActiveEditWorkerId] = useState<string>("");

  const [inputTab, setInputTab] = useState<"excel" | "scan" | "whatsapp" | "manual">("excel");
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

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

  // Excel file upload ref
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    fullName: "",
    nationalId: "",
    governorate: "",
    jobTitle: ""
  });

  // WhatsApp text area state
  const [whatsappText, setWhatsappText] = useState("");
  const [isParsingText, setIsParsingText] = useState(false);

  // File Upload state for single ID scan
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<PermitWorker | null>(null);

  // Auto-save state to localStorage
  useEffect(() => {
    localStorage.setItem("app_permit_workers_v1", JSON.stringify(workers));
  }, [workers]);

  // Load attendance from localStorage when month/year/workers change
  useEffect(() => {
    if (workers.length === 0) return;
    const key = `app_attendance_v1_${selectedMonth}_${selectedYear}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all current workers exist in the parsed data, if not, fill default
        const updated = { ...parsed };
        let changed = false;
        const totalDays = getDaysInMonth(selectedMonth, selectedYear);
        
        workers.forEach(w => {
          if (!updated[w.id]) {
            updated[w.id] = {};
            for (let d = 1; d <= totalDays; d++) {
              const date = new Date(selectedYear, selectedMonth - 1, d);
              const dayOfWeek = date.getDay();
              updated[w.id][d] = dayOfWeek === 5 ? "ع" : "ح"; // Friday is 'ع', others 'ح'
            }
            changed = true;
          }
        });
        
        if (changed) {
          localStorage.setItem(key, JSON.stringify(updated));
        }
        setAttendance(updated);
      } catch (e) {
        console.error("Error parsing saved attendance:", e);
      }
    } else {
      // Generate new defaults
      const defaultAttendance: Record<string, Record<number, "ح" | "غ" | "ع" | "إ">> = {};
      const totalDays = getDaysInMonth(selectedMonth, selectedYear);
      
      workers.forEach(w => {
        defaultAttendance[w.id] = {};
        for (let d = 1; d <= totalDays; d++) {
          const date = new Date(selectedYear, selectedMonth - 1, d);
          const dayOfWeek = date.getDay();
          defaultAttendance[w.id][d] = dayOfWeek === 5 ? "ع" : "ح";
        }
      });
      
      localStorage.setItem(key, JSON.stringify(defaultAttendance));
      setAttendance(defaultAttendance);
    }
  }, [selectedMonth, selectedYear, workers]);

  // Auto-save attendance helper
  const saveAttendanceToStorage = (updatedAttendance: typeof attendance) => {
    const key = `app_attendance_v1_${selectedMonth}_${selectedYear}`;
    localStorage.setItem(key, JSON.stringify(updatedAttendance));
    setAttendance(updatedAttendance);
  };

  const toggleAttendanceStatus = (workerId: string, day: number) => {
    const currentStatus = attendance[workerId]?.[day] || "ح";
    let nextStatus: "ح" | "غ" | "ع" | "إ" = "ح";
    if (currentStatus === "ح") nextStatus = "غ";
    else if (currentStatus === "غ") nextStatus = "ع";
    else if (currentStatus === "ع") nextStatus = "إ";
    else nextStatus = "ح";
    
    const updated = {
      ...attendance,
      [workerId]: {
        ...(attendance[workerId] || {}),
        [day]: nextStatus
      }
    };
    saveAttendanceToStorage(updated);
  };

  const setSingleAttendanceStatus = (workerId: string, day: number, status: "ح" | "غ" | "ع" | "إ") => {
    const updated = {
      ...attendance,
      [workerId]: {
        ...(attendance[workerId] || {}),
        [day]: status
      }
    };
    saveAttendanceToStorage(updated);
  };

  // Bulk actions
  const bulkMarkAllAs = (status: "ح" | "غ" | "ع" | "إ") => {
    const totalDays = getDaysInMonth(selectedMonth, selectedYear);
    const updated = { ...attendance };
    
    workers.forEach(w => {
      updated[w.id] = { ...(updated[w.id] || {}) };
      for (let d = 1; d <= totalDays; d++) {
        updated[w.id][d] = status;
      }
    });
    saveAttendanceToStorage(updated);
  };

  // Auto mark Fridays
  const autoMarkFridays = () => {
    const totalDays = getDaysInMonth(selectedMonth, selectedYear);
    const updated = { ...attendance };
    
    workers.forEach(w => {
      updated[w.id] = { ...(updated[w.id] || {}) };
      for (let d = 1; d <= totalDays; d++) {
        const date = new Date(selectedYear, selectedMonth - 1, d);
        if (date.getDay() === 5) {
          updated[w.id][d] = "ع";
        }
      }
    });
    saveAttendanceToStorage(updated);
  };

  // Export beautiful Timesheet with styled XLSX layout
  const handleExportTimesheetExcel = () => {
    if (workers.length === 0) {
      alert("كشف العمال فارغ! يرجى إضافة عمال أولاً.");
      return;
    }

    const totalDays = getDaysInMonth(selectedMonth, selectedYear);
    const monthName = ARABIC_MONTHS.find(m => m.value === selectedMonth)?.label || "";

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create array of array data
    const dataRows: any[] = [];

    // Title Row
    dataRows.push([`كشف حضور وانصراف وساعات عمل عمال التصاريح - شهر ${monthName} لسنة ${selectedYear}`]);
    dataRows.push([]); // Empty spacing

    // Headers Row
    const headers = ["م", "الاسم بالكامل", "الرقم القومي", "المهنة"];
    for (let d = 1; d <= totalDays; d++) {
      headers.push(String(d));
    }
    headers.push("إجمالي الحضور", "إجمالي الغياب", "إجمالي الإجازات والعطلات");
    dataRows.push(headers);

    // Workers Rows
    workers.forEach((w, idx) => {
      const row = [
        idx + 1,
        w.fullName,
        w.nationalId,
        w.jobTitle
      ];

      let presentCount = 0;
      let absentCount = 0;
      let leaveCount = 0;

      for (let d = 1; d <= totalDays; d++) {
        const status = attendance[w.id]?.[d] || "ح";
        row.push(status);
        if (status === "ح") presentCount++;
        else if (status === "غ") absentCount++;
        else leaveCount++;
      }

      row.push(presentCount, absentCount, leaveCount);
      dataRows.push(row);
    });

    // Convert to worksheet
    const ws = XLSX.utils.aoa_to_sheet(dataRows);

    // Set column widths (narrow days, wider strings)
    const colWidths = [
      { wch: 5 },   // Index
      { wch: 25 },  // Name
      { wch: 18 },  // National ID
      { wch: 15 },  // Job
    ];
    for (let d = 1; d <= totalDays; d++) {
      colWidths.push({ wch: 4 });
    }
    colWidths.push({ wch: 12 }, { wch: 12 }, { wch: 15 });
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "الحضور والإنصراف");
    
    // Download file
    XLSX.writeFile(wb, `تايم_شيت_حضور_وانصراف_${selectedMonth}_${selectedYear}.xlsx`);
  };

  // Handle single National ID change in manual form to auto-fill Governorate
  const handleManualIdChange = (idVal: string) => {
    const cleanId = idVal.replace(/\D/g, "").substring(0, 14);
    let gov = manualForm.governorate;
    if (cleanId.length === 14) {
      gov = decodeGovernorate(cleanId);
    }
    setManualForm(prev => ({
      ...prev,
      nationalId: cleanId,
      governorate: gov
    }));
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Str = reader.result as string;
        const cleanBase64 = base64Str.split(",")[1];
        resolve(cleanBase64);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Import and parse Excel or CSV spreadsheet of permits
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Extract raw JSON rows (array of arrays)
        const jsonRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (jsonRows.length === 0) {
          alert("الملف المرفوع فارغ!");
          return;
        }

        const firstRow = jsonRows[0] || [];
        let fullNameIdx = -1;
        let nationalIdIdx = -1;
        let governorateIdx = -1;
        let jobTitleIdx = -1;

        // Try to identify headers intelligently
        for (let i = 0; i < firstRow.length; i++) {
          const val = String(firstRow[i] || "").trim().toLowerCase();
          if (
            val.includes("الاسم") || 
            val.includes("اسم") || 
            val.includes("name") || 
            val.includes("العامل") ||
            val.includes("الاسم الرباعي")
          ) {
            fullNameIdx = i;
          } else if (
            val.includes("القومي") || 
            val.includes("بطاقة") || 
            val.includes("id") || 
            val.includes("national") ||
            val.includes("الرقم القومي")
          ) {
            nationalIdIdx = i;
          } else if (
            val.includes("محافظة") || 
            val.includes("المحافظة") || 
            val.includes("الحافظة") || 
            val.includes("gov") || 
            val.includes("city")
          ) {
            governorateIdx = i;
          } else if (
            val.includes("مهنة") || 
            val.includes("المهنة") || 
            val.includes("وظيفة") || 
            val.includes("الوظيفة") || 
            val.includes("job") || 
            val.includes("role")
          ) {
            jobTitleIdx = i;
          }
        }

        // Fallback defaults if headers aren't detected
        if (fullNameIdx === -1) fullNameIdx = 0;
        if (nationalIdIdx === -1) {
          // Look for column containing 14-digit numeric sequences
          for (let r = 1; r < Math.min(jsonRows.length, 6); r++) {
            const row = jsonRows[r] || [];
            for (let c = 0; c < row.length; c++) {
              const cellVal = String(row[c] || "").trim().replace(/\D/g, "");
              if (cellVal.length === 14) {
                nationalIdIdx = c;
                break;
              }
            }
            if (nationalIdIdx !== -1) break;
          }
          if (nationalIdIdx === -1) nationalIdIdx = 1;
        }
        if (governorateIdx === -1) governorateIdx = 2;
        if (jobTitleIdx === -1) jobTitleIdx = 3;

        const parsedWorkers: PermitWorker[] = [];

        // Parse starting from row index 1 to skip headers
        for (let i = 1; i < jsonRows.length; i++) {
          const row = jsonRows[i];
          if (!row || row.length === 0) continue;

          let fullName = String(row[fullNameIdx] !== undefined ? row[fullNameIdx] : "").trim();
          let rawId = String(row[nationalIdIdx] !== undefined ? row[nationalIdIdx] : "").trim();
          let nationalId = rawId.replace(/\D/g, ""); // strip scientific formatting artifacts
          let jobTitle = String(row[jobTitleIdx] !== undefined ? row[jobTitleIdx] : "").trim();

          // Skip if row duplicates header labels
          if (fullName.includes("الاسم") || nationalId.includes("القومي")) continue;
          if (!fullName && !nationalId) continue; // skip fully empty lines

          const autoGov = nationalId.length === 14 ? decodeGovernorate(nationalId) : "غير محدد";
          let governorate = String(row[governorateIdx] !== undefined ? row[governorateIdx] : "").trim() || autoGov;

          parsedWorkers.push({
            id: "worker_" + Math.random().toString(36).substr(2, 9),
            fullName: fullName || "عامل غير مسمى",
            nationalId: nationalId,
            governorate: governorate || "غير محدد",
            jobTitle: jobTitle || "عامل"
          });
        }

        if (parsedWorkers.length === 0) {
          alert("لم نتمكن من العثور على أي صفوف صالحة لاستيرادها. يرجى مراجعة صياغة الملف.");
          return;
        }

        setWorkers(prev => [...parsedWorkers, ...prev]);
        alert(`🎉 نجاح تام! تم استيراد عدد (${parsedWorkers.length}) عمال من شيت الإكسيل بنجاح.`);
        
        // Reset file input
        if (excelFileInputRef.current) excelFileInputRef.current.value = "";
      } catch (err) {
        console.error(err);
        alert("فشل قراءة ملف الإكسيل المرفوع. تأكد من رفعه بصيغة Excel أو CSV صالحة.");
      }
    };

    reader.readAsBinaryString(file);
  };

  // Upload single ID photo to parse
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      setUploadError("يرجى رفع ملف صورة صالح (PNG, JPG, JPEG) أو ملف PDF لبطاقة الرقم القومي.");
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const base64Data = await fileToBase64(file);
      const mimeType = isPdf ? "application/pdf" : file.type;

      const response = await fetch("/api/id-card/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data, mimeType })
      });

      if (!response.ok) {
        throw new Error("فشل الذكاء الاصطناعي في معالجة وقراءة البطاقة المرفوعة.");
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const payload = resData.data;
        
        // Add new worker
        const newWorker: PermitWorker = {
          id: "worker_" + Math.random().toString(36).substr(2, 9),
          fullName: payload.fullName || "عامل غير معروف",
          nationalId: payload.nationalId || "",
          governorate: payload.governorate || decodeGovernorate(payload.nationalId || ""),
          jobTitle: payload.jobTitle || "عامل"
        };

        setWorkers(prev => [newWorker, ...prev]);
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        throw new Error("لم نتمكن من العثور على بيانات واضحة للرقم القومي والاسم بالبطاقة.");
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "فشل مسح البطاقة. يرجى تجربة الإدخال اليدوي أو كشوفات واتساب.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Parse WhatsApp text copied message using Gemini
  const handleParseWhatsappText = async () => {
    if (!whatsappText.trim()) return;

    setIsParsingText(true);
    try {
      const response = await fetch("/api/permits/parse-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textContent: whatsappText })
      });

      if (!response.ok) {
        throw new Error("فشل الخادم في معالجة وتحليل رسالة واتساب المنسوخة.");
      }

      const resData = await response.json();
      if (resData.success && resData.data && Array.isArray(resData.data)) {
        const parsedList = resData.data;
        if (parsedList.length === 0) {
          alert("تمت معالجة النص ولكن لم يستطع الذكاء الاصطناعي استخراج أي عمال ببطاقات صالحة.");
          return;
        }

        const newWorkers: PermitWorker[] = parsedList.map((item: any) => ({
          id: "worker_" + Math.random().toString(36).substr(2, 9),
          fullName: item.fullName || "عامل",
          nationalId: item.nationalId || "",
          governorate: item.governorate || decodeGovernorate(item.nationalId || ""),
          jobTitle: item.jobTitle || "عامل"
        }));

        setWorkers(prev => [...newWorkers, ...prev]);
        setWhatsappText("");
        alert(`🎉 نجاح خارق! تم التعرف واستخراج (${parsedList.length}) عمال وإضافتهم للكشف تلقائياً.`);
      } else {
        throw new Error("الاستجابة غير صالحة من الخادم.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "حدث خطأ أثناء معالجة رسالة الواتس آب.");
    } finally {
      setIsParsingText(false);
    }
  };

  // Add Manual Worker
  const handleAddManualWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.fullName || !manualForm.nationalId) {
      alert("الرجاء إدخال الاسم بالكامل والرقم القومي.");
      return;
    }

    if (manualForm.nationalId.length !== 14) {
      alert("الرقم القومي المصري يجب أن يتكون من 14 رقماً بالضبط.");
      return;
    }

    const newWorker: PermitWorker = {
      id: "worker_" + Math.random().toString(36).substr(2, 9),
      fullName: manualForm.fullName,
      nationalId: manualForm.nationalId,
      governorate: manualForm.governorate || decodeGovernorate(manualForm.nationalId),
      jobTitle: manualForm.jobTitle || "عامل"
    };

    setWorkers(prev => [newWorker, ...prev]);
    
    // Clear form
    setManualForm({
      fullName: "",
      nationalId: "",
      governorate: "",
      jobTitle: ""
    });
  };

  // Start Inline Edit
  const startEditing = (worker: PermitWorker) => {
    setEditingId(worker.id);
    setEditingForm({ ...worker });
  };

  // Save Inline Edit
  const saveEditing = () => {
    if (!editingForm) return;

    if (editingForm.nationalId.length !== 14) {
      alert("الرقم القومي المصري يجب أن يتكون من 14 رقماً بالضبط.");
      return;
    }

    // Auto calculate governorate if ID was changed
    const finalGov = decodeGovernorate(editingForm.nationalId);

    setWorkers(prev => prev.map(w => {
      if (w.id === editingForm.id) {
        return {
          ...editingForm,
          governorate: finalGov
        };
      }
      return w;
    }));

    setEditingId(null);
    setEditingForm(null);
  };

  // Delete Worker
  const deleteWorker = (id: string) => {
    askConfirmation(
      "🗑️ حذف عامل",
      "هل أنت متأكد من رغبتك في حذف هذا العامل من كشف التصاريح؟",
      () => {
        setWorkers(prev => prev.filter(w => w.id !== id));
      }
    );
  };

  // Clear All
  const clearAllWorkers = () => {
    askConfirmation(
      "⚠️ تصفير كشف التصاريح",
      "تحذير: هل أنت متأكد من مسح جميع الأسماء والبطاقات المدرجة في كشف التصاريح بالكامل؟ لا يمكن التراجع عن هذا الإجراء.",
      () => {
        setWorkers([]);
      }
    );
  };

  // Reset/Sync to original 81 workers from spreadsheet
  const handleSyncSeedWorkers = () => {
    askConfirmation(
      "🔄 إعادة ضبط ومزامنة البيانات",
      "هل تريد إعادة ضبط كشف التصاريح ومزامنة الـ 81 موظف الأصليين؟ سيتم استبدال البيانات الحالية بالبيانات الأصلية من الكشف.",
      () => {
        const original = SEED_WORKERS.map(w => ({
          id: w.id,
          fullName: w.fullName,
          nationalId: w.nationalId,
          governorate: w.governorate || "القاهرة",
          jobTitle: w.jobTitle
        }));
        setWorkers(original);
        localStorage.setItem("app_permit_workers_v1", JSON.stringify(original));
        // Using custom modal/notification or inline rather than native alert if possible, or simple alert is okay since it's success. Let's just update the state
      }
    );
  };

  // Export to Excel (CSV with UTF-8 BOM)
  const handleExportExcel = () => {
    if (workers.length === 0) {
      alert("كشف التصاريح فارغ! يرجى إضافة عمال أولاً.");
      return;
    }

    // Headers as requested: الاسم, الرقم القومي, الحافظة, المهنة, كود, كود 2 (كود 1 وكود 2 فارغين)
    const headers = ["الاسم", "الرقم القومي", "الحافظة", "المهنة", "كود", "كود 2"];
    
    const rows = workers.map(w => [
      `"${w.fullName.replace(/"/g, '""')}"`,
      `="${w.nationalId}"`, // Force Excel to treat 14-digit National ID as text to avoid scientific notation
      `"${w.governorate.replace(/"/g, '""')}"`,
      `"${w.jobTitle.replace(/"/g, '""')}"`,
      "", // Empty Code 1
      ""  // Empty Code 2
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    // Add UTF-8 BOM for perfect Excel Arabic encoding support
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Get current date for file naming
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `شيت_تصاريح_العمل_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy WhatsApp formatted text of list
  const handleCopyWhatsappText = () => {
    if (workers.length === 0) {
      alert("الكشف فارغ!");
      return;
    }

    const dateStr = new Date().toLocaleDateString("ar-EG");
    let textStr = `📋 *كشف تصاريح العمل المقررة بتاريخ: ${dateStr}*\n`;
    textStr += `*إجمالي المقيدين:* ${workers.length} عمال\n`;
    textStr += `ـــــــــــــــــــــــــــــــــــــــــــــــــ\n\n`;

    workers.forEach((w, idx) => {
      textStr += `*${idx + 1}-* 👤 *الاسم:* ${w.fullName}\n`;
      textStr += `   🪪 *الرقم القومي:* \`${w.nationalId}\`\n`;
      textStr += `   📍 *المحافظة:* ${w.governorate}\n`;
      textStr += `   🛠️ *المهنة:* ${w.jobTitle}\n`;
      textStr += `\n`;
    });

    textStr += `ـــــــــــــــــــــــــــــــــــــــــــــــــ\n`;
    textStr += `🛡️ *تم التجهيز والمراجعة تلقائياً بواسطة أنظمة Yuanda HR*`;

    navigator.clipboard.writeText(textStr)
      .then(() => alert("📋 تم نسخ الكشف بالكامل بصيغة منسقة للواتساب بنجاح! يمكنك الآن لصقها وإرسالها لأي مجموعة أو محادثة."))
      .catch(err => console.error(err));
  };

  const renderTimesheetSection = () => {
    if (workers.length === 0) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">كشف العمال فارغ حالياً 📋</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">يرجى إضافة أو استيراد عمال التصاريح أولاً من تبويب "قاعدة بيانات العمال" لتتمكن من ملء ومتابعة شيت الحضور والتايم شيت الشهري.</p>
          </div>
          <button
            onClick={() => setActiveSection("workers")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
          >
            📋 إضافة عمال الآن
          </button>
        </div>
      );
    }

    const totalDays = getDaysInMonth(selectedMonth, selectedYear);
    
    // Quick helpers
    const getWorkerStats = (workerId: string) => {
      let present = 0;
      let absent = 0;
      let leave = 0;
      let off = 0;
      
      for (let d = 1; d <= totalDays; d++) {
        const s = attendance[workerId]?.[d] || "ح";
        if (s === "ح") present++;
        else if (s === "غ") absent++;
        else if (s === "ع") off++;
        else if (s === "إ") leave++;
      }
      return { present, absent, leave, off };
    };

    const ARABIC_WEEKDAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const getWeekdayName = (day: number, month: number, year: number): string => {
      const d = new Date(year, month - 1, day);
      return ARABIC_WEEKDAYS[d.getDay()];
    };
    
    const getWeekdayShort = (day: number, month: number, year: number): string => {
      const d = new Date(year, month - 1, day);
      const shorts = ["أحد", "إثن", "ثلا", "أرب", "خميس", "جمعة", "سبت"];
      return shorts[d.getDay()];
    };

    return (
      <div className="space-y-6">
        {/* Controls block */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">كشف الحضور والإنصراف وساعات العمل الشهري (Time Sheet)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">جدول تفاعلي متزامن شهرياً يدعم التصدير الفوري لملفات Excel و WhatsApp للجهات المعنية</p>
              </div>
            </div>
            
            <button
              onClick={handleExportTimesheetExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer self-stretch sm:self-auto"
            >
              <FileDown className="w-4 h-4" />
              <span>تنزيل التايم شيت الشهري (Excel) 📊</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Month Picker */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">الشهر المستهدف</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {ARABIC_MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Year Picker */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">السنة</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {[2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">نمط العرض والتحرير</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setTimesheetViewMode("table")}
                  className={`py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timesheetViewMode === "table" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  💻 الجدول الكامل
                </button>
                <button
                  onClick={() => setTimesheetViewMode("daily")}
                  className={`py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timesheetViewMode === "daily" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  📱 تعديل يومي (موبايل)
                </button>
                <button
                  onClick={() => {
                    setTimesheetViewMode("worker");
                    if (workers.length > 0 && !activeEditWorkerId) {
                      setActiveEditWorkerId(workers[0].id);
                    }
                  }}
                  className={`py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timesheetViewMode === "worker" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  👤 تعديل بالموظف
                </button>
              </div>
            </div>
          </div>

          {/* Bulk actions and Legends */}
          <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold ml-1">إجراءات سريعة لجميع الصفوف:</span>
              <button
                onClick={() => {
                  if(confirm("هل أنت متأكد من تغيير حالة جميع أيام هذا الشهر لجميع العمال إلى (حاضر)؟")) {
                    bulkMarkAllAs("ح");
                  }
                }}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                ✅ تعبئة الكل (حاضر)
              </button>
              <button
                onClick={() => {
                  if(confirm("هل أنت متأكد من تغيير حالة جميع أيام هذا الشهر لجميع العمال إلى (غياب)؟")) {
                    bulkMarkAllAs("غ");
                  }
                }}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                ❌ تعبئة الكل (غياب)
              </button>
              <button
                onClick={autoMarkFridays}
                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/10 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '3s' }} />
                <span>عطلة الجمعة التلقائية</span>
              </button>
            </div>

            {/* Legends */}
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-slate-500">دليل الرموز التفاعلية:</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> حضور (ح)</span>
              <span className="flex items-center gap-1 font-bold text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> غياب (غ)</span>
              <span className="flex items-center gap-1 font-bold text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> عطلة (ع)</span>
              <span className="flex items-center gap-1 font-bold text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> إجازة (إ)</span>
            </div>
          </div>
        </div>

        {/* Dynamic content rendering based on selected view mode */}
        {timesheetViewMode === "table" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <span className="text-xs font-bold text-white">جدول التايم شيت الشهري للموقع بالكامل</span>
              <span className="text-[10px] text-slate-400">انقر على أي خلية لتبديل الحالة وتحديث الإحصائيات مباشرة</span>
            </div>

            {/* Sticky column layout with custom horizontal scroll */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px]">
                    <th className="px-3 py-3 font-bold text-slate-200 border-l border-slate-800 text-right sticky right-0 bg-slate-950 z-10 w-44 min-w-[176px]">اسم الموظف / العامل</th>
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => {
                      const date = new Date(selectedYear, selectedMonth - 1, d);
                      const isFriday = date.getDay() === 5;
                      return (
                        <th 
                          key={d} 
                          className={`px-1.5 py-2 border-l border-slate-800/60 min-w-[32px] ${
                            isFriday ? "bg-rose-950/20 text-rose-400 font-black" : ""
                          }`}
                        >
                          <div>{d}</div>
                          <div className="text-[8px] opacity-70 font-normal">{getWeekdayShort(d, selectedMonth, selectedYear)}</div>
                        </th>
                      );
                    })}
                    <th className="px-2 py-3 font-bold text-emerald-400 border-r border-slate-800 min-w-[48px]">ح</th>
                    <th className="px-2 py-3 font-bold text-rose-400 border-r border-slate-800/60 min-w-[48px]">غ</th>
                    <th className="px-2 py-3 font-bold text-blue-400 border-r border-slate-800/60 min-w-[48px]">ع</th>
                    <th className="px-2 py-3 font-bold text-amber-400 border-r border-slate-800/60 min-w-[48px]">إ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {workers.map((worker) => {
                    const stats = getWorkerStats(worker.id);
                    return (
                      <tr key={worker.id} className="hover:bg-slate-800/20 transition-colors">
                        {/* Worker Name (Sticky Right) */}
                        <td className="px-3 py-2.5 font-bold text-white border-l border-slate-800 text-right sticky right-0 bg-slate-900 z-10 shadow-md">
                          <div className="truncate w-40 font-bold" title={worker.fullName}>{worker.fullName}</div>
                          <div className="text-[9px] text-slate-500 font-normal mt-0.5">{worker.jobTitle}</div>
                        </td>

                        {/* Attendance days */}
                        {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => {
                          const status = attendance[worker.id]?.[d] || "ح";
                          return (
                            <td 
                              key={d} 
                              onClick={() => toggleAttendanceStatus(worker.id, d)}
                              className="p-0.5 border-l border-slate-800/30 text-center select-none cursor-pointer hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-center w-full h-8">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all transform hover:scale-110 ${
                                  status === "ح" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                  status === "غ" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                  status === "ع" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                  "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}>
                                  {status}
                                </span>
                              </div>
                            </td>
                          );
                        })}

                        {/* Totals */}
                        <td className="px-1 py-2 font-bold text-emerald-400 border-r border-slate-800 bg-emerald-950/10">{stats.present}</td>
                        <td className="px-1 py-2 font-bold text-rose-400 border-r border-slate-800/60 bg-rose-950/10">{stats.absent}</td>
                        <td className="px-1 py-2 font-bold text-blue-400 border-r border-slate-800/60 bg-blue-950/10">{stats.off}</td>
                        <td className="px-1 py-2 font-bold text-amber-400 border-r border-slate-800/60 bg-amber-950/10">{stats.leave}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-[10px] text-slate-400">
              💡 نصيحة ممتازة لمستخدمي الموبايل: قم بالتبديل لنمط "تعديل يومي (موبايل)" بالأعلى لتتمكن من رصد الحضور بسهولة وسرعة فائقة بإصبعك.
            </div>
          </div>
        )}

        {timesheetViewMode === "daily" && (
          <div className="space-y-4">
            {/* Days list slider */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <span className="text-xs font-bold text-slate-300 block mb-2.5">اختر اليوم من الشهر لتسجيل وحفظ حضور جميع العمال:</span>
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => {
                  const date = new Date(selectedYear, selectedMonth - 1, d);
                  const isFriday = date.getDay() === 5;
                  const isActive = activeEditDay === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setActiveEditDay(d)}
                      className={`flex-none w-11 h-12 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isActive 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md font-bold" 
                          : isFriday
                            ? "bg-rose-950/20 border-rose-500/20 text-rose-400 hover:bg-rose-950/40"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <span className="text-xs font-black">{d}</span>
                      <span className="text-[8px] opacity-75">{getWeekdayShort(d, selectedMonth, selectedYear)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workers list for activeEditDay */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-800">
              <div className="p-4 bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">حضور العمال ليوم {activeEditDay} {getWeekdayName(activeEditDay, selectedMonth, selectedYear)}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">انقر على الحالة لحفظ الحضور الفردي لهذا اليوم بسرعة</p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      const updated = { ...attendance };
                      workers.forEach(w => {
                        updated[w.id] = { ...(updated[w.id] || {}), [activeEditDay]: "ح" };
                      });
                      saveAttendanceToStorage(updated);
                    }}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    كلهم حضور (ح)
                  </button>
                  <button 
                    onClick={() => {
                      const updated = { ...attendance };
                      workers.forEach(w => {
                        updated[w.id] = { ...(updated[w.id] || {}), [activeEditDay]: "ع" };
                      });
                      saveAttendanceToStorage(updated);
                    }}
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    كلهم عطلة (ع)
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
                {workers.map((worker, idx) => {
                  const status = attendance[worker.id]?.[activeEditDay] || "ح";
                  return (
                    <div key={worker.id} className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-900 w-5 h-5 rounded-full flex items-center justify-center">{idx + 1}</span>
                        <div>
                          <span className="text-xs font-bold text-white block">{worker.fullName}</span>
                          <span className="text-[9px] text-slate-500">{worker.jobTitle}</span>
                        </div>
                      </div>

                      {/* Rapid buttons row for mobile */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setSingleAttendanceStatus(worker.id, activeEditDay, "ح")}
                          className={`w-9 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            status === "ح" 
                              ? "bg-emerald-600 text-white shadow font-black scale-105" 
                              : "bg-slate-900 text-slate-400 hover:text-white"
                          }`}
                        >
                          ح
                        </button>
                        <button
                          onClick={() => setSingleAttendanceStatus(worker.id, activeEditDay, "غ")}
                          className={`w-9 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            status === "غ" 
                              ? "bg-rose-600 text-white shadow font-black scale-105" 
                              : "bg-slate-900 text-slate-400 hover:text-white"
                          }`}
                        >
                          غ
                        </button>
                        <button
                          onClick={() => setSingleAttendanceStatus(worker.id, activeEditDay, "ع")}
                          className={`w-9 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            status === "ع" 
                              ? "bg-blue-600 text-white shadow font-black scale-105" 
                              : "bg-slate-900 text-slate-400 hover:text-white"
                          }`}
                        >
                          ع
                        </button>
                        <button
                          onClick={() => setSingleAttendanceStatus(worker.id, activeEditDay, "إ")}
                          className={`w-9 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            status === "إ" 
                              ? "bg-amber-600 text-white shadow font-black scale-105" 
                              : "bg-slate-900 text-slate-400 hover:text-white"
                          }`}
                        >
                          إ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {timesheetViewMode === "worker" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Worker select pane */}
            <div className="md:col-span-4 space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <span className="text-xs font-bold text-slate-300 block">اختر العامل لرصد ومراجعة شهره:</span>
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {workers.map((w, idx) => {
                  const isActive = activeEditWorkerId === w.id;
                  const stats = getWorkerStats(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => setActiveEditWorkerId(w.id)}
                      className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isActive 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md font-bold" 
                          : "bg-slate-950 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{idx + 1}- {w.fullName}</span>
                        <span className={`text-[9px] ${isActive ? "text-indigo-200" : "text-slate-500"}`}>{w.jobTitle}</span>
                      </div>
                      
                      {/* Badge count of presents */}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-indigo-700 text-indigo-100" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10"
                      }`}>
                        {stats.present} يوم حضور
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual calendar grid */}
            {(() => {
              const activeWorkerObj = workers.find(w => w.id === activeEditWorkerId) || workers[0];
              if (!activeWorkerObj) return null;
              const stats = getWorkerStats(activeWorkerObj.id);
              
              return (
                <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-bold">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs text-indigo-400 font-bold block">السجل الفردي وتعديلات الشهر للـعامل:</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">👤 {activeWorkerObj.fullName}</h4>
                    </div>
                    <span className="text-[10px] bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400">{activeWorkerObj.jobTitle}</span>
                  </div>

                  {/* Visual mini-report widget */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl text-center">
                    <div className="p-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <span className="text-[9px] text-slate-500 block">حضور</span>
                      <span className="text-sm font-black text-emerald-400 mt-0.5 inline-block">{stats.present}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-rose-500/5 border border-rose-500/10">
                      <span className="text-[9px] text-slate-500 block">غياب</span>
                      <span className="text-sm font-black text-rose-400 mt-0.5 inline-block">{stats.absent}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <span className="text-[9px] text-slate-500 block">عطلة</span>
                      <span className="text-sm font-black text-blue-400 mt-0.5 inline-block">{stats.off}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <span className="text-[9px] text-slate-500 block">إجازة</span>
                      <span className="text-sm font-black text-amber-400 mt-0.5 inline-block">{stats.leave}</span>
                    </div>
                  </div>

                  {/* Calendar 31 cells */}
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-2">
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => {
                      const date = new Date(selectedYear, selectedMonth - 1, d);
                      const isFriday = date.getDay() === 5;
                      const status = attendance[activeWorkerObj.id]?.[d] || "ح";
                      
                      return (
                        <div 
                          key={d}
                          onClick={() => toggleAttendanceStatus(activeWorkerObj.id, d)}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-between select-none cursor-pointer hover:border-indigo-500/60 transition-all ${
                            status === "ح" ? "bg-emerald-500/5 border-emerald-500/15" :
                            status === "غ" ? "bg-rose-500/5 border-rose-500/15" :
                            status === "ع" ? "bg-blue-500/5 border-blue-500/15" :
                            "bg-amber-500/5 border-amber-500/15"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[9px] text-slate-500 font-normal">{getWeekdayShort(d, selectedMonth, selectedYear)}</span>
                            <span className="text-[10px] font-bold text-slate-200">{d}</span>
                          </div>
                          
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black mt-2 transform transition-transform hover:scale-110 ${
                            status === "ح" ? "bg-emerald-500 text-slate-950" :
                            status === "غ" ? "bg-rose-500 text-white" :
                            status === "ع" ? "bg-blue-500 text-white" :
                            "bg-amber-500 text-slate-950"
                          }`}>
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  // Filtered workers
  const filteredWorkers = workers.filter(w => {
    const s = searchTerm.toLowerCase();
    return (
      w.fullName.toLowerCase().includes(s) ||
      w.nationalId.includes(s) ||
      w.governorate.toLowerCase().includes(s) ||
      w.jobTitle.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn text-right" dir="rtl">

      {/* High-level section switcher */}
      <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-2xl shadow-lg">
        <button
          onClick={() => setActiveSection("workers")}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSection === "workers"
              ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-md font-black"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>📋 قاعدة بيانات تصاريح العمال ({workers.length})</span>
        </button>
        <button
          onClick={() => setActiveSection("timesheet")}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSection === "timesheet"
              ? "bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-md font-black"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📅 جدول حضور وانصراف الموظفين (Time Sheet) 📊</span>
        </button>
      </div>

      {activeSection === "workers" ? (
        <>
          {/* Tab Selector for Intake Source */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600/20 text-teal-400 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">إدخال كشوفات وبطاقات تصاريح العمل</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">اختر المصدر الأسهل لك لإضافة البطاقات والأسماء تلقائياً</p>
                </div>
              </div>
              <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-bold">
                العدد الحالي: {workers.length} عامل
              </span>
            </div>

        {/* Action Tabs buttons */}
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setInputTab("excel")}
            className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputTab === "excel"
                ? "bg-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>رفع شيت Excel / CSV 📊</span>
          </button>

          <button
            onClick={() => setInputTab("scan")}
            className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputTab === "scan"
                ? "bg-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>تصوير/رفع بطاقة 🪪</span>
          </button>

          <button
            onClick={() => setInputTab("whatsapp")}
            className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputTab === "whatsapp"
                ? "bg-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>سحب من الواتس 📱</span>
          </button>

          <button
            onClick={() => setInputTab("manual")}
            className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputTab === "manual"
                ? "bg-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة يدوية ✍️</span>
          </button>
        </div>

        {/* Tab contents */}
        {inputTab === "excel" && (
          <div className="pt-2 space-y-4">
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center hover:border-teal-500/40 transition-all cursor-pointer relative bg-slate-950/40">
              <input
                type="file"
                ref={excelFileInputRef}
                onChange={handleExcelImport}
                accept=".xlsx,.xls,.csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center transition-colors">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-200">اسحب شيت الإكسيل (Excel) أو ملف الـ CSV هنا أو اضغط للاختيار</p>
                  <p className="text-[10px] text-slate-500">يدعم تنسيقات (.xlsx, .xls, .csv) ويستخلص الأسماء، البطاقات، والمهن تلقائياً</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-white block mb-1">💡 ميزة الاستيراد الذكية:</span>
              <p>يقوم النظام آلياً بتحليل الأعمدة لتحديد (الاسم، الرقم القومي، المحافظة، والمهنة) حتى وإن كانت مبعثرة أو بأسماء مختلفة، ويقوم بفك ترميز المحافظة من واقع الرقم القومي بدقة فائقة.</p>
            </div>
          </div>
        )}

        {inputTab === "scan" && (
          <div className="pt-2 space-y-4">
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center hover:border-teal-500/40 transition-all cursor-pointer relative bg-slate-950/40">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploadingImage}
              />
              {isUploadingImage ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                  <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-teal-400">جاري قراءة البطاقة بالذكاء الاصطناعي...</p>
                    <p className="text-[10px] text-slate-500">نقوم باستخلاص الاسم والمهنة والرقام القومية بدقة فائقة</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-teal-400 transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-200">اسحب صورة بطاقة الرقم القومي هنا أو اضغط للتصوير</p>
                    <p className="text-[10px] text-slate-500">يدعم رفع الصور (PNG, JPG) وملفات PDF الممسوحة ضوئياً</p>
                  </div>
                </div>
              )}
            </div>
            {uploadError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-white block mb-1">💡 فكرة ذكية ومريحة:</span>
              <p>بمجرد معالجة البطاقة، ستتم قراءة كافة البيانات واستخلاص محافظة الميلاد وإضافة العامل فوراً للكشف المتداول.</p>
            </div>
          </div>
        )}

        {inputTab === "whatsapp" && (
          <div className="pt-2 space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">الصق نص رسالة كشف عمال الواتساب هنا 👇</label>
              <textarea
                value={whatsappText}
                onChange={(e) => setWhatsappText(e.target.value)}
                placeholder="مثال للرسالة المنسوخة:&#10;١. محمد احمد حسانين رقم قومي 29305121200456 نجار&#10;٢. ابراهيم متولي جابر 28811021400234 حداد بموقع الشروق"
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
              />
            </div>

            <button
              onClick={handleParseWhatsappText}
              disabled={isParsingText || !whatsappText.trim()}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-teal-900/20"
            >
              {isParsingText ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري معالجة الكشف واستخلاص الأسماء بالكامل...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>بدء الاستخلاص الفوري بالذكاء الاصطناعي 🚀</span>
                </>
              )}
            </button>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-white block mb-1">🌟 تكنولوجيا خارقة:</span>
              <p>الصق أي نص عشوائي يحتوي على أرقام قومية وأسماء ومهن بأي صيغة كانت، وسيقوم الذكاء الاصطناعي بتنظيفه، فلترته، وفك محافظة الميلاد، ووضعهم في جدول منظم وجاهز للتصدير!</p>
            </div>
          </div>
        )}

        {inputTab === "manual" && (
          <form onSubmit={handleAddManualWorker} className="pt-2 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  الاسم بالكامل (رباعي)
                </label>
                <input
                  type="text"
                  value={manualForm.fullName}
                  onChange={(e) => setManualForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="مثال: محمود محمد عبد الرحمن"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  الرقم القومي (14 رقماً)
                </label>
                <input
                  type="text"
                  value={manualForm.nationalId}
                  onChange={(e) => handleManualIdChange(e.target.value)}
                  placeholder="مثال: 29408151203487"
                  maxLength={14}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500 font-mono tracking-wider"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                  المهنة / الوظيفة
                </label>
                <input
                  type="text"
                  value={manualForm.jobTitle}
                  onChange={(e) => setManualForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="مثال: نجار، حداد، عامل عادي"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  المحافظة / الحافظة
                </label>
                <input
                  type="text"
                  value={manualForm.governorate}
                  onChange={(e) => setManualForm(prev => ({ ...prev, governorate: e.target.value }))}
                  placeholder="المحافظة (تُستخرج تلقائياً من الرقم القومي)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-teal-500 bg-slate-900/40"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-teal-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة العامل يدوياً للكشف</span>
            </button>
          </form>
        )}
      </div>

      {/* Main Table / Grid of Added Workers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        
        {/* Search, Clear & Export Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute top-3.5 right-3.5" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الرقم القومي أو المحافظة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            
            {/* Download Excel */}
            <button
              onClick={handleExportExcel}
              disabled={workers.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-900/20"
              title="تحميل شيت إكسيل معتمد لتصاريح البوابة فوراً"
            >
              <FileDown className="w-4 h-4" />
              <span>تنزيل شيت Excel (التصاريح) 📥</span>
            </button>

            {/* Sync / Seed Workers Button */}
            <button
              onClick={handleSyncSeedWorkers}
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-amber-400/30"
              title="مزامنة وتنزيل الـ 81 موظف الأصليين بنقرة واحدة"
            >
              <RefreshCw className="w-4 h-4 text-slate-950" />
              <span>تنزيل الـ 81 موظف الأصليين 🔄</span>
            </button>

            {/* Copy WhatsApp */}
            <button
              onClick={handleCopyWhatsappText}
              disabled={workers.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="نسخ الكشف مرتب بصيغة رسالة للواتساب"
            >
              <Clipboard className="w-4 h-4" />
              <span>نسخ للواتساب 📋</span>
            </button>

            {/* Clear All */}
            {workers.length > 0 && (
              <button
                onClick={clearAllWorkers}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                title="تصفير الكشف الحالي بالكامل"
              >
                <Trash2 className="w-4 h-4" />
                <span>تصفير 🗑️</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 select-none">
                <th className="px-4 py-3.5 font-bold">#</th>
                <th className="px-4 py-3.5 font-bold">الاسم الرباعي</th>
                <th className="px-4 py-3.5 font-bold">الرقم القومي (14 رقم)</th>
                <th className="px-4 py-3.5 font-bold">الحافظة (المحافظة)</th>
                <th className="px-4 py-3.5 font-bold">المهنة</th>
                <th className="px-4 py-3.5 font-bold text-center">كود 1 (فارغ)</th>
                <th className="px-4 py-3.5 font-bold text-center">كود 2 (فارغ)</th>
                <th className="px-4 py-3.5 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500 select-none">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileSpreadsheet className="w-8 h-8 text-slate-600 animate-pulse" />
                      <p className="text-xs font-bold">كشف تصاريح العمل فارغ حالياً.</p>
                      <p className="text-[10px] text-slate-600">ارفع بطاقة أو الصق رسالة كشف من واتساب لتوليد شيت الإكسيل فوراً.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker, index) => {
                  const isEditing = editingId === worker.id;

                  return (
                    <tr 
                      key={worker.id}
                      className="hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-slate-500 font-mono select-none">{index + 1}</td>
                      
                      {/* Name Column */}
                      <td className="px-4 py-3.5">
                        {isEditing && editingForm ? (
                          <input
                            type="text"
                            value={editingForm.fullName}
                            onChange={(e) => setEditingForm(prev => prev ? { ...prev, fullName: e.target.value } : null)}
                            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white w-full focus:outline-none focus:border-teal-500"
                          />
                        ) : (
                          <span className="font-bold text-white block">{worker.fullName}</span>
                        )}
                      </td>

                      {/* National ID Column */}
                      <td className="px-4 py-3.5">
                        {isEditing && editingForm ? (
                          <input
                            type="text"
                            value={editingForm.nationalId}
                            onChange={(e) => setEditingForm(prev => prev ? { ...prev, nationalId: e.target.value.replace(/\D/g, "").substring(0, 14) } : null)}
                            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white w-full focus:outline-none focus:border-teal-500 font-mono tracking-wider"
                            maxLength={14}
                          />
                        ) : (
                          <span className="text-slate-300 font-mono tracking-wider">{worker.nationalId}</span>
                        )}
                      </td>

                      {/* Governorate Column */}
                      <td className="px-4 py-3.5">
                        {isEditing && editingForm ? (
                          <span className="text-slate-400 bg-slate-900 px-2 py-1 rounded text-[11px] block text-center border border-slate-800">
                            {decodeGovernorate(editingForm.nationalId)}
                          </span>
                        ) : (
                          <span className="text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                            {worker.governorate}
                          </span>
                        )}
                      </td>

                      {/* Job Title Column */}
                      <td className="px-4 py-3.5">
                        {isEditing && editingForm ? (
                          <input
                            type="text"
                            value={editingForm.jobTitle}
                            onChange={(e) => setEditingForm(prev => prev ? { ...prev, jobTitle: e.target.value } : null)}
                            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white w-full focus:outline-none focus:border-teal-500"
                          />
                        ) : (
                          <span className="text-slate-400">{worker.jobTitle}</span>
                        )}
                      </td>

                      {/* Code 1 Empty Column */}
                      <td className="px-4 py-3.5 text-center text-slate-600 select-none font-mono">
                        -
                      </td>

                      {/* Code 2 Empty Column */}
                      <td className="px-4 py-3.5 text-center text-slate-600 select-none font-mono">
                        -
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEditing}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded p-1.5 transition-all cursor-pointer"
                                title="حفظ التعديلات"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditingForm(null); }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-400 rounded p-1.5 transition-all cursor-pointer"
                                title="إلغاء التعديل"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(worker)}
                                className="bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-400 rounded p-1.5 transition-all cursor-pointer"
                                title="تعديل هذا الصف"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteWorker(worker.id)}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded p-1.5 transition-all cursor-pointer"
                                title="حذف العامل"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Helpful instructions footer */}
        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex items-start gap-2.5 text-right">
          <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-400 leading-relaxed space-y-1">
            <strong className="text-slate-200 block">تعليمات بوابات التصاريح الرسمية:</strong>
            <p>1. شيت الإكسل المصدر يتم حفظه بتنسيق CSV متوافق بالكامل مع جميع نسخ Excel الداعمة للغة العربية بدون مشاكل في الحروف.</p>
            <p>2. تم استيفاء أعمدة الكودين لتركها فارغة تماماً كطلب الجهة المانحة للتصاريح ليتم ملؤها يدوياً أو آلياً لاحقاً بواسطة جهة فحص التصاريح.</p>
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="space-y-6">
      {renderTimesheetSection()}
    </div>
  )}

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
