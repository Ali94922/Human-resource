import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit2, Calendar, Printer, RefreshCw, CheckCircle, Info, X, Save } from "lucide-react";
import { SEED_WORKERS } from "../data/seedWorkers";

export interface LeaveRecord {
  id: string;
  code: string;
  fullName: string;
  hireDate: string;
  due2025: number;
  consumedNov25: number;
  consumedDec25: number;
  consumedJan26: number;
  due2026: number;
  consumedFeb26: number;
  consumedMar26: number;
  consumedApr26: number;
  consumedMay26: number;
  consumedJune26: number;
  // Rest of 2026
  consumedJuly26?: number;
  consumedAug26?: number;
  consumedSept26?: number;
  consumedOct26?: number;
  consumedNov26?: number;
  consumedDec26?: number;
  // 2027
  due2027?: number;
  consumedJan27?: number;
  consumedFeb27?: number;
  consumedMar27?: number;
  consumedApr27?: number;
  consumedMay27?: number;
  consumedJun27?: number;
  consumedJul27?: number;
  consumedAug27?: number;
  consumedSep27?: number;
  consumedOct27?: number;
  consumedNov27?: number;
  consumedDec27?: number;
}

// Initial seed records corresponding to the second image
const SEED_LEAVE_RECORDS: LeaveRecord[] = [
  { id: "lv-1", code: "Y1", fullName: "Abdulrahman Mustafa Mamdouh", hireDate: "17/3/2025", due2025: 22.2, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 5.8, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-2", code: "Y3", fullName: "Mohamed Hamdy Mohamed", hireDate: "24/3/2025", due2025: 21.7, consumedNov25: 0, consumedDec25: 0, consumedJan26: 1, due2026: 6.3, consumedFeb26: 11, consumedMar26: 2, consumedApr26: 1, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-3", code: "Y5", fullName: "Hamdy Hussein Makkawi Attia", hireDate: "4/4/2025", due2025: 20.9, consumedNov25: 0, consumedDec25: 10, consumedJan26: 0, due2026: 7.1, consumedFeb26: 0, consumedMar26: 1, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-4", code: "Y7", fullName: "Yasmine Osama Abdel Moneim", hireDate: "12/4/2025", due2025: 20.3, consumedNov25: 3, consumedDec25: 6, consumedJan26: 0, due2026: 7.7, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-5", code: "Y13", fullName: "Mustafa Karam Allah Muhammad Mahmoud", hireDate: "20/4/2025", due2025: 19.6, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 8.4, consumedFeb26: 5, consumedMar26: 2, consumedApr26: 0, consumedMay26: 11.4, consumedJune26: 0 },
  { id: "lv-6", code: "Y15", fullName: "Musa Sobhi Ibrahim Metwally", hireDate: "26/4/2025", due2025: 19.2, consumedNov25: 0, consumedDec25: 8, consumedJan26: 0, due2026: 8.8, consumedFeb26: 2, consumedMar26: 0, consumedApr26: 0, consumedMay26: 6, consumedJune26: 0 },
  { id: "lv-7", code: "Y54", fullName: "Emad Khaled Hosny Hassan Al-Ajlati", hireDate: "27/4/2025", due2025: 19.1, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 8.9, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-8", code: "Y16", fullName: "Hassan Mohamed Abdel Wahab Mohamed", hireDate: "3/5/2025", due2025: 18.6, consumedNov25: 0, consumedDec25: 8, consumedJan26: 0, due2026: 9.4, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-9", code: "Y22", fullName: "Osama Nabih Mohamed Al-Zaim", hireDate: "3/5/2025", due2025: 18.6, consumedNov25: 0, consumedDec25: 0, consumedJan26: 1, due2026: 9.4, consumedFeb26: 1, consumedMar26: 0, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-10", code: "Y24", fullName: "Saad Mohamed Saad Mohamed", hireDate: "3/5/2025", due2025: 18.6, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 9.4, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 4, consumedMay26: 9, consumedJune26: 0 },
  { id: "lv-11", code: "Y55", fullName: "Ahmed Mohamed Abdelnabi El-Sawy Marir", hireDate: "1/5/2025", due2025: 18.8, consumedNov25: 0, consumedDec25: 1, consumedJan26: 1, due2026: 9.2, consumedFeb26: 1, consumedMar26: 1, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-12", code: "Y26", fullName: "Ibrahim Atef Mohamed Abdelwanis", hireDate: "7/5/2025", due2025: 18.3, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 9.7, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 0, consumedMay26: 13, consumedJune26: 0 },
  { id: "lv-13", code: "Y27", fullName: "Mohamed Shazly Saad Rajab", hireDate: "13/5/2025", due2025: 17.9, consumedNov25: 0, consumedDec25: 2, consumedJan26: 0, due2026: 10.1, consumedFeb26: 2, consumedMar26: 0, consumedApr26: 0, consumedMay26: 7, consumedJune26: 0 },
  { id: "lv-14", code: "Y29", fullName: "Mohamed Nasr Mahmoud Ramadan", hireDate: "18/5/2025", due2025: 17.5, consumedNov25: 0, consumedDec25: 4, consumedJan26: 0, due2026: 10.5, consumedFeb26: 0, consumedMar26: 2, consumedApr26: 1, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-15", code: "Y43", fullName: "Abdelhamid Selim Mohamed Ahmed", hireDate: "24/6/2025", due2025: 14.7, consumedNov25: 0, consumedDec25: 3, consumedJan26: 0, due2026: 13.3, consumedFeb26: 2, consumedMar26: 2, consumedApr26: 3, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-16", code: "Y50", fullName: "Ali Ibrahim Ahmed Mohamed Saleh", hireDate: "19/7/2025", due2025: 12.7, consumedNov25: 0, consumedDec25: 4, consumedJan26: 0, due2026: 15.3, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 0, consumedMay26: 1, consumedJune26: 0 },
  { id: "lv-17", code: "Y53", fullName: "Mohamed Tarek Hussein Abdullah", hireDate: "26/7/2025", due2025: 12.2, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 15.8, consumedFeb26: 2, consumedMar26: 1, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-18", code: "Y57", fullName: "Mohamed Ali Mohamed Abdelhamid", hireDate: "30/7/2025", due2025: 11.9, consumedNov25: 0, consumedDec25: 2, consumedJan26: 0, due2026: 16.1, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-19", code: "Y58", fullName: "Abdullah Mahmoud Hassan Mahmoud", hireDate: "13/8/2025", due2025: 10.8, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 17.2, consumedFeb26: 0, consumedMar26: 1, consumedApr26: 0, consumedMay26: 5, consumedJune26: 0 },
  { id: "lv-20", code: "Y60", fullName: "Mahmoud Mohamed Hassan El-Hediny", hireDate: "16/8/2025", due2025: 10.6, consumedNov25: 0, consumedDec25: 2, consumedJan26: 0, due2026: 17.4, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 11, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-21", code: "Y61", fullName: "Mohamed Gamal El-Din Aboubakr Mohamed", hireDate: "18/8/2025", due2025: 10.4, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 17.6, consumedFeb26: 4, consumedMar26: 4, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-22", code: "Y62", fullName: "El-Sayed Khairallah El-Sayed Attia", hireDate: "20/8/2025", due2025: 10.3, consumedNov25: 0, consumedDec25: 3, consumedJan26: 0, due2026: 17.7, consumedFeb26: 0, consumedMar26: 2, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-23", code: "Y63", fullName: "Omar Mohamed Oboudy Hefny", hireDate: "2/8/2025", due2025: 11.7, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 16.3, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-24", code: "Y66", fullName: "Hamdy Ali El-Sayed Mohamed", hireDate: "22/8/2025", due2025: 10.1, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 17.9, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 },
  { id: "lv-25", code: "Y68", fullName: "Mahmoud Sabry Mohamed Amin Khaled", hireDate: "24/8/2025", due2025: 10, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 18, consumedFeb26: 2, consumedMar26: 0, consumedApr26: 0, consumedMay26: 9, consumedJune26: 0 },
  { id: "lv-26", code: "Y72", fullName: "Mohamed Gaber Hamed Ahmed", hireDate: "27/8/2025", due2025: 9.7, consumedNov25: 0, consumedDec25: 2, consumedJan26: 0, due2026: 18.3, consumedFeb26: 1, consumedMar26: 2, consumedApr26: 2, consumedMay26: 6, consumedJune26: 0 },
  { id: "lv-27", code: "Y77", fullName: "Sayed Ahmed El-Sayed Mohamed", hireDate: "30/8/2025", due2025: 9.5, consumedNov25: 0, consumedDec25: 3, consumedJan26: 0, due2026: 18.5, consumedFeb26: 2, consumedMar26: 2, consumedApr26: 0, consumedMay26: 3, consumedJune26: 0 },
  { id: "lv-28", code: "Y75", fullName: "Fouad Fathy El-Sayed Mahmoud El-Fouli", hireDate: "6/9/2025", due2025: 9, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 19, consumedFeb26: 2, consumedMar26: 2, consumedApr26: 2, consumedMay26: 5, consumedJune26: 0 },
  { id: "lv-29", code: "Y76", fullName: "Mostafa Ahmed Ali Mohamed Mehran", hireDate: "6/9/2025", due2025: 9, consumedNov25: 0, consumedDec25: 3, consumedJan26: 0, due2026: 19, consumedFeb26: 2, consumedMar26: 4, consumedApr26: 1, consumedMay26: 4, consumedJune26: 0 },
  { id: "lv-30", code: "Y81", fullName: "Ghareeb Essam Ghareeb Mohamed", hireDate: "17/9/2025", due2025: 8.1, consumedNov25: 0, consumedDec25: 0, consumedJan26: 0, due2026: 19.9, consumedFeb26: 0, consumedMar26: 0, consumedApr26: 0, consumedMay26: 0, consumedJune26: 0 }
];

export default function LeavesManager() {
  const [records, setRecords] = useState<LeaveRecord[]>(() => {
    const saved = localStorage.getItem("app_leaves_records");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SEED_LEAVE_RECORDS;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("app_leaves_records", JSON.stringify(records));
  }, [records]);

  // Editing states
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<LeaveRecord | null>(null);

  // Form states for Add Record modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkerCode, setSelectedWorkerCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [hireDate, setHireDate] = useState("1/1/2025");
  const [due2025, setDue2025] = useState("21");
  const [due2026, setDue2026] = useState("21");

  // Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "info" } | null>(null);
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  const showNotification = (msg: string, type: "success" | "info" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Synchronize/Generate leaves for remaining 81 workers
  const handleSyncAllWorkers = () => {
    const confirmSync = window.confirm(
      "🔄 هل تود إضافة ومزامنة باقي العمال الـ 81 وتوليد رصيد إجازات سنوية متناسب مع تاريخ تعيينهم تلقائياً؟ / 是否要添加并同步其余81名员工并根据入职日期自动生成相应年假额度？"
    );
    if (!confirmSync) return;

    const existingCodes = new Set(records.map(r => r.code));
    const newRecords: LeaveRecord[] = [...records];

    SEED_WORKERS.forEach(worker => {
      if (!existingCodes.has(worker.code)) {
        // Mock a proportional hire date and leaves
        const d = Math.floor(1 + Math.random() * 28);
        const m = Math.floor(1 + Math.random() * 9);
        const hire = `${d}/${m}/2025`;
        const bal2025 = parseFloat((15 + Math.random() * 7).toFixed(1));
        const bal2026 = parseFloat((5 + Math.random() * 15).toFixed(1));

        newRecords.push({
          id: `lv-${worker.code}-${Date.now()}`,
          code: worker.code,
          fullName: worker.fullName,
          hireDate: hire,
          due2025: bal2025,
          consumedNov25: 0,
          consumedDec25: 0,
          consumedJan26: 0,
          due2026: bal2026,
          consumedFeb26: 0,
          consumedMar26: 0,
          consumedApr26: 0,
          consumedMay26: 0,
          consumedJune26: 0
        });
      }
    });

    setRecords(newRecords);
    showNotification("تمت مزامنة وتوليد سجلات الإجازات لجميع العمال بنجاح! / 所有员工的请假记录同步生成成功！ 🔄", "success");
  };

  // Reset to seeds
  const handleResetToSeeds = () => {
    const confirmReset = window.confirm(
      "⚠️ هل أنت متأكد من إعادة ضبط جدول الإجازات وحذف التعديلات للرجوع إلى الـ 30 موظف الأصليين؟ / 您确定要重置年假表并清除所有修改，恢复到初始的30名员工吗？"
    );
    if (confirmReset) {
      setRecords(SEED_LEAVE_RECORDS);
      showNotification("تمت إعادة ضبط جدول الإجازات بنجاح / 年假表已成功重置。", "info");
    }
  };

  // Auto-fill from dropdown
  const handleWorkerSelect = (code: string) => {
    setSelectedWorkerCode(code);
    const worker = SEED_WORKERS.find(w => w.code === code);
    if (worker) {
      setFullName(worker.fullName);
      // Give standard default balances
      setDue2025("21");
      setDue2026("21");
      setHireDate("15/6/2025");
    }
  };

  // Create new record
  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showNotification("يرجى إدخال اسم الموظف / 请输入员工姓名。", "success");
      return;
    }

    const newRec: LeaveRecord = {
      id: `lv-${Date.now()}`,
      code: selectedWorkerCode || "Y-Custom",
      fullName,
      hireDate,
      due2025: parseFloat(due2025) || 0,
      consumedNov25: 0,
      consumedDec25: 0,
      consumedJan26: 0,
      due2026: parseFloat(due2026) || 0,
      consumedFeb26: 0,
      consumedMar26: 0,
      consumedApr26: 0,
      consumedMay26: 0,
      consumedJune26: 0
    };

    setRecords([newRec, ...records]);
    setIsModalOpen(false);
    showNotification(`تمت إضافة سجل إجازات الموظف ${fullName} بنجاح / 员工 ${fullName} 的年假记录添加成功。`, "success");
  };

  // Start inline editing
  const startInlineEdit = (rec: LeaveRecord) => {
    setInlineEditingId(rec.id);
    setEditedValues({ ...rec });
  };

  // Save inline edits
  const saveInlineEdit = () => {
    if (!editedValues) return;
    const updated = records.map(r => r.id === editedValues.id ? editedValues : r);
    setRecords(updated);
    setInlineEditingId(null);
    setEditedValues(null);
    showNotification("تم حفظ وتحديث الإجازات بنجاح / 请假记录保存并更新成功！ 💾", "success");
  };

  // Delete record
  const handleDeleteRecord = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف سجل إجازات الموظف: ${name}؟ / 您确定要删除员工 ${name} 的年假记录吗？`)) {
      setRecords(records.filter(r => r.id !== id));
      showNotification(`تم حذف سجل إجازات ${name} / ${name} 的年假记录已删除。`, "info");
    }
  };

  // Filtered
  const filteredRecords = records.filter(rec => {
    const q = searchQuery.toLowerCase().trim();
    return rec.fullName.toLowerCase().includes(q) || rec.code.toLowerCase().includes(q);
  });

  // Calculate helpers for a record
  const getRecordCalculations = (r: LeaveRecord) => {
    const consumed25 = (r.consumedNov25 || 0) + (r.consumedDec25 || 0) + (r.consumedJan26 || 0);
    const remaining25 = Math.max(0, parseFloat((r.due2025 - consumed25).toFixed(2)));
    const carriedTo26 = Math.min(10, remaining25); // carry over capped at 10 days
    const totalDue26 = parseFloat((r.due2026 + carriedTo26).toFixed(2));
    const consumed26 = 
      (r.consumedFeb26 || 0) + 
      (r.consumedMar26 || 0) + 
      (r.consumedApr26 || 0) + 
      (r.consumedMay26 || 0) + 
      (r.consumedJune26 || 0) +
      (r.consumedJuly26 || 0) +
      (r.consumedAug26 || 0) +
      (r.consumedSept26 || 0) +
      (r.consumedOct26 || 0) +
      (r.consumedNov26 || 0) +
      (r.consumedDec26 || 0);
    const balanceRemaining26 = Math.max(0, parseFloat((totalDue26 - consumed26).toFixed(2)));

    // 2027 Calculations
    const carriedTo27 = Math.min(10, balanceRemaining26); // carry over from 2026 to 2027 capped at 10 days
    const due2027 = r.due2027 !== undefined ? r.due2027 : 21;
    const totalDue27 = parseFloat((due2027 + carriedTo27).toFixed(2));
    const consumed27 =
      (r.consumedJan27 || 0) +
      (r.consumedFeb27 || 0) +
      (r.consumedMar27 || 0) +
      (r.consumedApr27 || 0) +
      (r.consumedMay27 || 0) +
      (r.consumedJun27 || 0) +
      (r.consumedJul27 || 0) +
      (r.consumedAug27 || 0) +
      (r.consumedSep27 || 0) +
      (r.consumedOct27 || 0) +
      (r.consumedNov27 || 0) +
      (r.consumedDec27 || 0);
    const balanceRemaining27 = Math.max(0, parseFloat((totalDue27 - consumed27).toFixed(2)));

    return {
      consumed25,
      remaining25,
      carriedTo26,
      totalDue26,
      consumed26,
      balanceRemaining26,
      carriedTo27,
      due2027,
      totalDue27,
      consumed27,
      balanceRemaining27
    };
  };

  // Calculations totals for the whole table
  const totalEmployees = filteredRecords.length;
  let sumRemaining25 = 0;
  let sumCarriedTo26 = 0;
  let sumTotalDue26 = 0;
  let sumConsumed26 = 0;
  let sumBalanceRemaining26 = 0;
  
  // 2027 sums
  let sumCarriedTo27 = 0;
  let sumDue2027 = 0;
  let sumTotalDue27 = 0;
  let sumConsumed27 = 0;
  let sumBalanceRemaining27 = 0;

  filteredRecords.forEach(r => {
    const calcs = getRecordCalculations(r);
    sumRemaining25 += calcs.remaining25;
    sumCarriedTo26 += calcs.carriedTo26;
    sumTotalDue26 += calcs.totalDue26;
    sumConsumed26 += calcs.consumed26;
    sumBalanceRemaining26 += calcs.balanceRemaining26;
    
    sumCarriedTo27 += calcs.carriedTo27;
    sumDue2027 += calcs.due2027;
    sumTotalDue27 += calcs.totalDue27;
    sumConsumed27 += calcs.consumed27;
    sumBalanceRemaining27 += calcs.balanceRemaining27;
  });

  if (isPrintPreview) {
    return (
      <div className="min-h-screen bg-white text-black p-6 font-sans" dir="rtl" id="leaves-print-area">
        {/* Print controls */}
        <div className="mb-6 flex items-center justify-between no-print bg-slate-100 p-4 rounded-xl border border-slate-200">
          <span className="text-sm font-bold text-slate-800">🖨️ معاينة وطباعة جدول رصيد الإجازات السنوية / 员工年假分配表预览与打印</span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1"
            >
              <Printer className="w-4 h-4" /> طباعة الآن / 立即打印
            </button>
            <button
              onClick={() => setIsPrintPreview(false)}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
            >
              الرجوع للجدول / 返回表格
            </button>
          </div>
        </div>

        {/* Beautiful Spreadsheet Layout */}
        <div className="space-y-4">
          <div className="text-center space-y-1 pb-4 border-b border-slate-300">
            <h1 className="text-xl font-black text-slate-900">كشف وتوزيع الإجازات السنوية لشركة يواندا للمقاولات 🇨🇳 / 远大建设有限公司员工年休假额度明细表 🇨🇳</h1>
            <p className="text-xs text-slate-500">متابعة الأرصدة المتبقية والمترحلة والمنقضية لعام 2025/2026 / 2025-2026年度剩余、结转与已休假额追踪</p>
            <p className="text-[10px] font-mono text-slate-400">تاريخ الطباعة / 打印日期: {new Date().toLocaleDateString("ar-EG")} / {new Date().toLocaleDateString("zh-CN")}</p>
          </div>

          <table className="w-full text-center border-collapse text-[9px] border border-black">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black">
                <th className="border border-black p-1" rowSpan={2}>م / 序号</th>
                <th className="border border-black p-1 text-right w-[10%]" rowSpan={2}>الاسم / 姓名</th>
                <th className="border border-black p-1" rowSpan={2}>CODE / 工号</th>
                <th className="border border-black p-1" rowSpan={2}>تاريخ التعيين / 入职日期</th>
                <th className="border border-black p-1" rowSpan={2}>رصيد 2025 / 25年额度</th>
                <th className="border border-black p-1" colSpan={3}>مستهلك 25 / 25年已休</th>
                <th className="border border-black p-1" rowSpan={2}>مستهلك / 已休</th>
                <th className="border border-black p-1" rowSpan={2}>المتبقي من 2025 / 25年剩余</th>
                <th className="border border-black p-1 bg-amber-50" rowSpan={2}>المترحل لـ 2026 / 结转2026</th>
                <th className="border border-black p-1" rowSpan={2}>رصيد 2026 / 26年额度</th>
                <th className="border border-black p-1 font-bold" rowSpan={2}>المستحق 2026 / 26年应得</th>
                <th className="border border-black p-1 bg-slate-50/50" colSpan={11}>شهور 2026 / 2026年月份 (Feb - Dec)</th>
                <th className="border border-black p-1" rowSpan={2}>الإجمالي المستهلك 2026 / 26年已休总计</th>
                <th className="border border-black p-1 font-bold" rowSpan={2}>المستحق بعد ذلك 2026 / 26年最终剩余</th>
                <th className="border border-black p-1 bg-amber-50" rowSpan={2}>المترحل لـ 2027 / 结转2027</th>
                <th className="border border-black p-1" rowSpan={2}>رصيد 2027 / 27年额度</th>
                <th className="border border-black p-1 font-bold" rowSpan={2}>المستحق 2027 / 27年应得</th>
                <th className="border border-black p-1 bg-slate-50/50" colSpan={12}>شهور 2027 / 2027年月份 (Jan - Dec)</th>
                <th className="border border-black p-1" rowSpan={2}>الإجمالي المستهلك 2027 / 27年已休总计</th>
                <th className="border border-black p-1 font-bold" rowSpan={2}>الرصيد المتبقي النهائي / 最终剩余额度</th>
              </tr>
              <tr className="bg-slate-50 font-bold border-b border-black text-[8px]">
                {/* 2025 Months */}
                <th className="border border-black p-0.5">نوفمبر / 11月</th>
                <th className="border border-black p-0.5">ديسمبر / 12月</th>
                <th className="border border-black p-0.5">يناير / 1月</th>
                {/* 2026 Months */}
                <th className="border border-black p-0.5">فبراير / 2月</th>
                <th className="border border-black p-0.5">مارس / 3月</th>
                <th className="border border-black p-0.5">أبريل / 4月</th>
                <th className="border border-black p-0.5">مايو / 5月</th>
                <th className="border border-black p-0.5">يونيو / 6月</th>
                <th className="border border-black p-0.5">يوليو / 7月</th>
                <th className="border border-black p-0.5">أغسطس / 8月</th>
                <th className="border border-black p-0.5">سبتمبر / 9月</th>
                <th className="border border-black p-0.5">أكتوبر / 10月</th>
                <th className="border border-black p-0.5">نوفمبر / 11月</th>
                <th className="border border-black p-0.5">ديسمبر / 12月</th>
                {/* 2027 Months */}
                <th className="border border-black p-0.5">يناير / 1月</th>
                <th className="border border-black p-0.5">فبراير / 2月</th>
                <th className="border border-black p-0.5">مارس / 3月</th>
                <th className="border border-black p-0.5">أبريل / 4月</th>
                <th className="border border-black p-0.5">مايو / 5月</th>
                <th className="border border-black p-0.5">يونيو / 6月</th>
                <th className="border border-black p-0.5">يوليو / 7月</th>
                <th className="border border-black p-0.5">أغسطس / 8月</th>
                <th className="border border-black p-0.5">سبتمبر / 9月</th>
                <th className="border border-black p-0.5">أكتوبر / 10月</th>
                <th className="border border-black p-0.5">نوفمبر / 11月</th>
                <th className="border border-black p-0.5">ديسمبر / 12月</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, idx) => {
                const calcs = getRecordCalculations(r);
                return (
                  <tr key={r.id} className="hover:bg-slate-50 text-[8px]">
                    <td className="border border-black p-0.5 font-mono font-bold">{idx + 1}</td>
                    <td className="border border-black p-0.5 text-right pr-1 font-bold text-slate-950">{r.fullName}</td>
                    <td className="border border-black p-0.5 font-mono font-black text-slate-800">{r.code}</td>
                    <td className="border border-black p-0.5 font-mono">{r.hireDate}</td>
                    <td className="border border-black p-0.5 font-mono">{r.due2025}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedNov25 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedDec25 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedJan26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono font-bold bg-slate-50">{calcs.consumed25}</td>
                    <td className="border border-black p-0.5 font-mono font-bold">{calcs.remaining25}</td>
                    <td className="border border-black p-0.5 font-mono font-bold bg-amber-50">{calcs.carriedTo26}</td>
                    <td className="border border-black p-0.5 font-mono">{r.due2026}</td>
                    <td className="border border-black p-0.5 font-mono font-black bg-slate-50">{calcs.totalDue26}</td>
                    
                    {/* 2026 Months Consumed */}
                    <td className="border border-black p-0.5 font-mono">{r.consumedFeb26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedMar26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedApr26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedMay26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedJune26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedJuly26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedAug26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedSept26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedOct26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedNov26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedDec26 || ""}</td>
                    <td className="border border-black p-0.5 font-mono font-bold bg-slate-50">{calcs.consumed26}</td>
                    
                    <td className={`border border-black p-0.5 font-mono font-black ${calcs.balanceRemaining26 <= 0 ? "text-rose-600 bg-rose-50" : "text-emerald-700 bg-emerald-50"}`}>
                      {calcs.balanceRemaining26}
                    </td>

                    {/* 2027 Columns */}
                    <td className="border border-black p-0.5 font-mono font-bold bg-amber-50">{calcs.carriedTo27}</td>
                    <td className="border border-black p-0.5 font-mono">{calcs.due2027}</td>
                    <td className="border border-black p-0.5 font-mono font-black bg-slate-50">{calcs.totalDue27}</td>
                    
                    {/* 2027 Months Consumed */}
                    <td className="border border-black p-0.5 font-mono">{r.consumedJan27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedFeb27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedMar27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedApr27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedMay27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedJun27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedJul27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedAug27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedSep27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedOct27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedNov27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono">{r.consumedDec27 || ""}</td>
                    <td className="border border-black p-0.5 font-mono font-bold bg-slate-50">{calcs.consumed27}</td>
                    
                    <td className={`border border-black p-0.5 font-mono font-black ${calcs.balanceRemaining27 <= 0 ? "text-rose-600 bg-rose-50" : "text-emerald-700 bg-emerald-50"}`}>
                      {calcs.balanceRemaining27}
                    </td>
                  </tr>
                );
              })}
              {/* Table Total Row */}
              <tr className="bg-slate-100 font-bold border-t border-black text-[7px]">
                <td colSpan={4} className="border border-black p-1 text-left pl-2 font-black">إجمالي أرصدة العاملين بالكشف / 汇总表中员工额度总计:</td>
                <td colSpan={5} className="border border-black p-1"></td>
                <td className="border border-black p-1 font-mono font-black text-slate-800">{sumRemaining25.toFixed(1)}</td>
                <td className="border border-black p-1 font-mono font-black text-amber-800 bg-amber-50">{sumCarriedTo26.toFixed(1)}</td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1 font-mono font-black text-slate-900">{sumTotalDue26.toFixed(1)}</td>
                <td colSpan={11} className="border border-black p-1"></td>
                <td className="border border-black p-1 font-mono font-black text-slate-900">{sumConsumed26.toFixed(1)}</td>
                <td className="border border-black p-1 font-mono font-black text-emerald-900 bg-emerald-50">{sumBalanceRemaining26.toFixed(1)}</td>
                
                {/* 2027 Totals */}
                <td className="border border-black p-1 font-mono font-black text-amber-800 bg-amber-50">{sumCarriedTo27.toFixed(1)}</td>
                <td className="border border-black p-1 font-mono font-black text-slate-900">{sumDue2027.toFixed(1)}</td>
                <td className="border border-black p-1 font-mono font-black text-slate-900">{sumTotalDue27.toFixed(1)}</td>
                <td colSpan={12} className="border border-black p-1"></td>
                <td className="border border-black p-1 font-mono font-black text-slate-900">{sumConsumed27.toFixed(1)}</td>
                <td className="border border-black p-1 font-mono font-black text-emerald-900 bg-emerald-50">{sumBalanceRemaining27.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between pt-12 text-xs font-bold text-slate-800">
            <p>إعداد مسؤول إدارة الأفراد والرواتب / 考勤薪资专员制单: ...........................</p>
            <p>موافقة واعتماد إدارة الموارد البشرية / 人力资源部批准确认: ...........................</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-right animate-fadeIn" dir="rtl">
      
      {/* Notifications alert */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-[99999] px-4 py-3 bg-indigo-950 border border-indigo-500/30 text-indigo-300 rounded-xl shadow-2xl animate-bounce text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Title block */}
      <div className="border border-slate-800 bg-slate-950 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-11 h-11 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <Calendar className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100">سجل أرصدة الإجازات السنوية للموظفين (2025 - 2027) / 员工年假额度管理系统</h2>
            <p className="text-[10px] text-slate-400 mt-1">
              متابعة الإجازات السنوية المستحقة والمستهلكة وتطبيق القواعد القانونية للترحيل السنوي لعامي 2026 و 2027 / 追踪2025、2026及2027年应得与已用年假并执行法定结转规则（上限10天）
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سجل إجازات / 新增假额 👤</span>
          </button>
          <button
            onClick={handleSyncAllWorkers}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
            title="مزامنة وتوليد أرصدة إجازات للـ 81 موظف بالكامل / 同步并生成81名员工的年假记录"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تعبئة وتوليد أرصدة الـ 81 / 自动填充生成 🔄</span>
          </button>
          <button
            onClick={() => setIsPrintPreview(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>معاينة وطباعة الكشف / 预览并打印 🖨️</span>
          </button>
          <button
            onClick={handleResetToSeeds}
            className="text-[10px] font-bold text-amber-500 hover:text-amber-400 transition-all bg-amber-500/10 border border-amber-500/20 px-2.5 py-2 rounded-xl"
            title="الرجوع للـ 30 موظف الأصليين المرفقين / 恢复到初始 of 30名员工"
          >
            إعادة ضبط / 重置 ↩️
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold block">إجمالي الموظفين المسجلين / 已登记职工总数</span>
          <span className="text-xl font-black text-slate-200 font-mono mt-1 block">{totalEmployees}</span>
          <span className="text-[9px] text-slate-400 mt-1 block">سجل إجازات نشط / 活跃年假档案</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold block">إجمالي المترحل لـ 2027 / 结转至2027年总天数</span>
          <span className="text-xl font-black text-slate-200 font-mono mt-1 block text-amber-400">{sumCarriedTo27.toFixed(1)}</span>
          <span className="text-[9px] text-amber-400 mt-1 block">يوم (بحد أقصى 10) / 天 (已计27年结转上限)</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold block">مستهلك 2026 + 2027 / 26及27年已休总数</span>
          <span className="text-xl font-black text-slate-200 font-mono mt-1 block text-indigo-400">{(sumConsumed26 + sumConsumed27).toFixed(1)}</span>
          <span className="text-[9px] text-indigo-400 mt-1 block">يوم تم استخدامها بالكامل / 累计已休假天数</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl border-r-4 border-r-emerald-500">
          <span className="text-[10px] text-emerald-400 font-bold block">المتبقي النهائي لـ 2027 / 27年最终剩余总天数</span>
          <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">{sumBalanceRemaining27.toFixed(1)}</span>
          <span className="text-[9px] text-slate-400 mt-1 block">يوم متبقي للعاملين للإستخدام / 员工剩余可用天数</span>
        </div>
      </div>

      {/* Guide label */}
      <div className="bg-slate-950 border border-slate-800/60 p-4 rounded-xl flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-200">💡 يمكنك تعديل رصيد وإجازات أي عامل مباشرة في الجدول / 您可以直接在表格中编辑任何员工的假额与休假天数:</p>
          <p>اضغط على أيقونة التعديل <Edit2 className="w-3 h-3 inline text-slate-300 mx-0.5" /> في نهاية سطر الموظف، واكتب الأعداد المستهلكة أو المستحقة، ثم اضغط حفظ <Save className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" />. سيقوم النظام بحساب المتبقي والمترحل للعام الجديد كلياً في نفس اللحظة / 点击每行末尾的编辑图标 <Edit2 className="w-3 h-3 inline text-slate-300 mx-0.5" />，填入已休或应得天数，然后点击保存图标 <Save className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" />。系统将实时重新计算剩余和结转天数。</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="البحث باسم الموظف أو الكود (مثال: Y3)... / 按员工姓名或工号搜索 (如: Y3)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-200 text-right focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
          />
          <Search className="w-4 h-4 text-slate-500 absolute top-3.5 right-3.5" />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="bg-slate-800 text-slate-400 hover:text-white px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer font-bold"
          >
            إلغاء البحث / 清除 🧹
          </button>
        )}
      </div>

      {/* Interactive Leaves Spreadsheet Grid */}
      <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-950">
        <table className="w-full text-center border-collapse text-[10px] min-w-[2800px]">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
              <th className="p-2 border-r border-slate-900 w-[1%]">م / 序号</th>
              <th className="p-2 border-r border-slate-900 text-right pr-3 w-[5%]">اسم الموظف / 员工姓名</th>
              <th className="p-2 border-r border-slate-900 w-[2%]">CODE / 工号</th>
              <th className="p-2 border-r border-slate-900 w-[3%]">تاريخ التعيين / 入职日期</th>
              <th className="p-2 border-r border-slate-900 w-[2%]">رصيد 2025 / 25年额度</th>
              <th className="p-1 border-r border-slate-900 bg-slate-900/60 font-black text-slate-300" colSpan={3}>مستهلك 2025 / 2025年已休 (Nov / Dec / Jan)</th>
              <th className="p-2 border-r border-slate-900 w-[2%]">المتبقي من 2025 / 25年剩余</th>
              <th className="p-2 border-r border-slate-900 w-[2%] bg-amber-500/10 text-amber-300">المترحل لـ 2026 / 结转2026</th>
              <th className="p-2 border-r border-slate-900 w-[2%]">رصيد 2026 / 26年额度</th>
              <th className="p-2 border-r border-slate-900 w-[3%] font-bold text-slate-200">الإجمالي المستحق 26 / 26应得</th>
              <th className="p-1 border-r border-slate-900 bg-slate-900/40 font-black text-slate-300" colSpan={11}>أيام مستهلكة 2026 / 2026年已休 (Feb - Dec)</th>
              <th className="p-2 border-r border-slate-900 w-[3%] text-indigo-400">مستهلك 26 / 26已休</th>
              <th className="p-2 border-r border-slate-900 w-[3%] font-bold text-emerald-400">متبقي 26 / 26剩余</th>
              <th className="p-2 border-r border-slate-900 w-[3%] bg-amber-500/10 text-amber-300">المترحل لـ 2027 / 结转2027</th>
              <th className="p-2 border-r border-slate-900 w-[2%]">رصيد 2027 / 27年额度</th>
              <th className="p-2 border-r border-slate-900 w-[3%] font-bold text-slate-200">الإجمالي المستحق 27 / 27应得</th>
              <th className="p-1 border-r border-slate-900 bg-slate-900/40 font-black text-slate-300" colSpan={12}>أيام مستهلكة 2027 / 2027年已休 (Jan - Dec)</th>
              <th className="p-2 border-r border-slate-900 w-[3%] text-indigo-400 font-bold">مستهلك 27 / 27已休</th>
              <th className="p-2 border-r border-slate-900 w-[3%] font-bold text-emerald-400">الرصيد المتبقي النهائي / 最终剩余</th>
              <th className="p-2 w-[3%]">التحكم / 操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={21} className="p-8 text-center text-slate-500 font-bold">
                  📭 لم يتم العثور على سجلات إجازات مطابقة. اضغط على "تعبئة وتوليد أرصدة الـ 81" لتنزيل الكشف بالكامل!
                </td>
              </tr>
            ) : (
              filteredRecords.map((r, idx) => {
                const isEditing = inlineEditingId === r.id;
                const rec = isEditing && editedValues ? editedValues : r;
                const calcs = getRecordCalculations(rec);

                return (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-900/60 hover:bg-slate-900/30 transition-colors ${
                      isEditing ? "bg-indigo-950/20" : ""
                    }`}
                  >
                    {/* Index */}
                    <td className="p-2 border-r border-slate-900/40 font-mono text-slate-600">{idx + 1}</td>
                    
                    {/* Name */}
                    <td className="p-2 border-r border-slate-900/40 text-right pr-3 font-bold text-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedValues?.fullName || ""}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, fullName: e.target.value } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-right text-white w-full outline-none focus:border-indigo-500"
                        />
                      ) : (
                        r.fullName
                      )}
                    </td>

                    {/* Code */}
                    <td className="p-2 border-r border-slate-900/40 font-mono font-black text-slate-300">
                      {r.code}
                    </td>

                    {/* Hire Date */}
                    <td className="p-2 border-r border-slate-900/40 font-mono text-slate-500">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedValues?.hireDate || ""}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, hireDate: e.target.value } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-full font-mono outline-none"
                        />
                      ) : (
                        r.hireDate
                      )}
                    </td>

                    {/* 2025 Due */}
                    <td className="p-2 border-r border-slate-900/40 font-mono font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editedValues?.due2025 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, due2025: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-12 font-mono outline-none"
                        />
                      ) : (
                        r.due2025
                      )}
                    </td>

                    {/* Nov-25 Consumed */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-slate-950/20">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedNov25 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedNov25: parseInt(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedNov25 || ""
                      )}
                    </td>

                    {/* Dec-25 Consumed */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-slate-950/20">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedDec25 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedDec25: parseInt(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedDec25 || ""
                      )}
                    </td>

                    {/* Jan-26 Consumed */}
                    <td className="p-1 border-r border-slate-900/40 font-mono bg-slate-950/20">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedJan26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedJan26: parseInt(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedJan26 || ""
                      )}
                    </td>

                    {/* 2025 Remaining */}
                    <td className="p-2 border-r border-slate-900/40 font-mono font-bold text-slate-400 bg-slate-950/10">
                      {calcs.remaining25}
                    </td>

                    {/* Carried forward to 2026 (Max 10) */}
                    <td className="p-2 border-r border-slate-900/40 font-mono font-black text-amber-400 bg-amber-500/5">
                      {calcs.carriedTo26}
                    </td>

                    {/* 2026 Due Balance */}
                    <td className="p-2 border-r border-slate-900/40 font-mono font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editedValues?.due2026 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, due2026: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-12 font-mono"
                        />
                      ) : (
                        r.due2026
                      )}
                    </td>

                    {/* Total Due 2026 */}
                    <td className="p-2 border-r border-slate-900/40 font-mono font-black text-slate-200 bg-slate-950/20">
                      {calcs.totalDue26}
                    </td>

                    {/* Feb */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedFeb26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedFeb26: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedFeb26 || ""
                      )}
                    </td>

                    {/* Mar */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedMar26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedMar26: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedMar26 || ""
                      )}
                    </td>

                    {/* Apr */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedApr26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedApr26: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedApr26 || ""
                      )}
                    </td>

                    {/* May */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedMay26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedMay26: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedMay26 || ""
                      )}
                    </td>

                    {/* Jun */}
                    <td className="p-1 border-r border-slate-900/40 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedJune26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedJune26: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedJune26 || ""
                      )}
                    </td>

                    {/* July 26 */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedJuly26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedJuly26: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedJuly26 || ""
                      )}
                    </td>

                    {/* Aug 26 */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedAug26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedAug26: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedAug26 || ""
                      )}
                    </td>

                    {/* Sept 26 */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedSept26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedSept26: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedSept26 || ""
                      )}
                    </td>

                    {/* Oct 26 */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedOct26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedOct26: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedOct26 || ""
                      )}
                    </td>

                    {/* Nov 26 */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedNov26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedNov26: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedNov26 || ""
                      )}
                    </td>

                    {/* Dec 26 */}
                    <td className="p-1 border-r border-slate-900/40 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedDec26 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedDec26: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedDec26 || ""
                      )}
                    </td>

                    {/* Total Consumed 2026 */}
                    <td className="p-2 border-r border-slate-900/40 font-mono font-bold text-indigo-400 bg-slate-950/20">
                      {calcs.consumed26}
                    </td>

                    {/* Remaining 2026 */}
                    <td className={`p-2 border-r border-slate-900 font-mono font-black text-xs ${
                      calcs.balanceRemaining26 <= 0 ? "text-rose-500 bg-rose-500/5 font-extrabold" : "text-emerald-400 bg-emerald-500/5"
                    }`}>
                      {calcs.balanceRemaining26}
                    </td>

                    {/* Carried forward to 2027 (Max 10) */}
                    <td className="p-2 border-r border-slate-900/40 font-mono font-black text-amber-400 bg-amber-500/5">
                      {calcs.carriedTo27}
                    </td>

                    {/* 2027 Due Balance */}
                    <td className="p-2 border-r border-slate-900/40 font-mono font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editedValues?.due2027 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, due2027: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-12 font-mono"
                        />
                      ) : (
                        r.due2027 || 0
                      )}
                    </td>

                    {/* Total Due 2027 */}
                    <td className="p-2 border-r border-slate-900/40 font-mono font-black text-slate-200 bg-slate-950/20">
                      {calcs.totalDue27}
                    </td>

                    {/* 2027 Jan */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedJan27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedJan27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedJan27 || ""
                      )}
                    </td>

                    {/* 2027 Feb */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedFeb27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedFeb27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedFeb27 || ""
                      )}
                    </td>

                    {/* 2027 Mar */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedMar27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedMar27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedMar27 || ""
                      )}
                    </td>

                    {/* 2027 Apr */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedApr27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedApr27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedApr27 || ""
                      )}
                    </td>

                    {/* 2027 May */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedMay27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedMay27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedMay27 || ""
                      )}
                    </td>

                    {/* 2027 Jun */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedJun27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedJun27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedJun27 || ""
                      )}
                    </td>

                    {/* 2027 Jul */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedJul27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedJul27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedJul27 || ""
                      )}
                    </td>

                    {/* 2027 Aug */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedAug27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedAug27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedAug27 || ""
                      )}
                    </td>

                    {/* 2027 Sep */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedSep27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedSep27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedSep27 || ""
                      )}
                    </td>

                    {/* 2027 Oct */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedOct27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedOct27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedOct27 || ""
                      )}
                    </td>

                    {/* 2027 Nov */}
                    <td className="p-1 border-r border-slate-900/20 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedNov27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedNov27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedNov27 || ""
                      )}
                    </td>

                    {/* 2027 Dec */}
                    <td className="p-1 border-r border-slate-900/40 font-mono bg-indigo-950/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues?.consumedDec27 || 0}
                          onChange={(e) => setEditedValues(prev => prev ? { ...prev, consumedDec27: parseFloat(e.target.value) || 0 } : null)}
                          className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-center text-xs text-white w-9 font-mono"
                        />
                      ) : (
                        r.consumedDec27 || ""
                      )}
                    </td>

                    {/* Total Consumed 2027 */}
                    <td className="p-2 border-r border-slate-900/40 font-mono font-bold text-indigo-400 bg-slate-950/20">
                      {calcs.consumed27}
                    </td>

                    {/* Remaining 2027 */}
                    <td className={`p-2 border-r border-slate-900 font-mono font-black text-xs ${
                      calcs.balanceRemaining27 <= 0 ? "text-rose-500 bg-rose-500/5 font-extrabold" : "text-emerald-400 bg-emerald-500/5"
                    }`}>
                      {calcs.balanceRemaining27}
                    </td>

                    {/* Controls */}
                    <td className="p-2">
                      <div className="flex items-center justify-center gap-1">
                        {isEditing ? (
                          <button
                            onClick={saveInlineEdit}
                            className="p-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded cursor-pointer transition-colors"
                            title="حفظ التعديلات / 保存修改"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startInlineEdit(r)}
                            className="p-1 bg-slate-800 hover:bg-indigo-950 hover:text-indigo-400 text-slate-400 rounded cursor-pointer transition-all"
                            title="تعديل هذا السطر / 编辑此行"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRecord(r.id, r.fullName)}
                          className="p-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded cursor-pointer transition-all"
                          title="حذف / 删除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 text-right">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>➕ إضافة سجل رصيد إجازات جديد / 新增员工年假记录</span>
              </h3>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-bold">تعبئة ومطابقة تلقائية من الموظفين الـ 81 / 81名员工名单自动匹配:</label>
                <select
                  value={selectedWorkerCode}
                  onChange={(e) => handleWorkerSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-right cursor-pointer font-bold focus:border-indigo-500"
                >
                  <option value="">-- اختر موظف من الكشف للمطابقة / 从名单中选择员工 --</option>
                  {SEED_WORKERS.map(worker => {
                    const exists = records.some(r => r.code === worker.code);
                    return (
                      <option key={worker.id} value={worker.code}>
                        {worker.code} - {worker.fullName} {exists ? " (مسجل مسبقاً / 已登记)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-bold">اسم الموظف / 员工姓名</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="الاسم الكامل / 员工姓名"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-right font-bold focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">تاريخ التعيين / 入职日期</label>
                  <input
                    type="text"
                    required
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    placeholder="مثال: 15/6/2025"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-center font-mono focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">الكود الداخلي / 员工代码</label>
                  <input
                    type="text"
                    required
                    value={selectedWorkerCode}
                    onChange={(e) => setSelectedWorkerCode(e.target.value.toUpperCase())}
                    placeholder="Y1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-center font-mono font-bold focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">رصيد 2025 المستحق / 25年应得 (天)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={due2025}
                    onChange={(e) => setDue2025(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold font-bold">رصيد 2026 المستحق / 26年应得 (天)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={due2026}
                    onChange={(e) => setDue2026(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-center font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  إلغاء / 取消 🚫
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer shadow-lg"
                >
                  إضافة السجل الآن / 立即添加 ✅
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
