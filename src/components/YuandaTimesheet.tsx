import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { SEED_WORKERS } from "../data/seedWorkers";
import { 
  Calendar, 
  User, 
  Clock, 
  Printer, 
  FileSpreadsheet, 
  RefreshCw, 
  Check, 
  Sliders, 
  Sparkles,
  Info,
  ShieldAlert,
  Download,
  Plus,
  Trash2
} from "lucide-react";

interface PermitWorker {
  id: string;
  fullName: string;
  nationalId: string;
  governorate: string;
  jobTitle: string;
}

interface TimesheetRow {
  day: number;
  dateStr: string;
  inTime: string;
  outTime: string;
  overtime: string;
  employeeSign: string;
  supervisorSign: string;
  remark: string;
}

const ARABIC_MONTHS = [
  { value: 1, label: "يناير" },
  { value: 2, label: "فبراير" },
  { value: 3, label: "مارس" },
  { value: 4, label: "أبريل" },
  { value: 5, label: "مايو" },
  { value: 6, label: "يونيو" },
  { value: 7, label: "يوليو" },
  { value: 8, label: "أغسطس" },
  { value: 9, label: "سبتمبر" },
  { value: 10, label: "أكتوبر" },
  { value: 11, label: "نوفمبر" },
  { value: 12, label: "ديسمبر" },
];

const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate();
};

export default function YuandaTimesheet() {
  // Load workers list from shared localStorage
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

  // Selected state
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  // Timesheet metadata
  const [department, setDepartment] = useState<string>("south");
  const [employeeIdCustom, setEmployeeIdCustom] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("201007932476");

  // Timesheet rows state
  const [rows, setRows] = useState<TimesheetRow[]>([]);
  
  // Overtime summaries
  const [overtimeDay, setOvertimeDay] = useState<string>("0");
  const [overtimeNight, setOvertimeNight] = useState<string>("0");

  // Custom Confirmation Modal
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

  // Notification state
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  const showNotification = (text: string, type: "success" | "info" | "error" = "success") => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Reset/Sync to original 81 workers from spreadsheet
  const handleSyncSeedWorkers = () => {
    askConfirmation(
      "🔄 إعادة ضبط ومزامنة البيانات / 重置并同步数据",
      "هل تريد إعادة ضبط كشف التصاريح ومزامنة الـ 81 موظف الأصليين؟ سيتم استبدال البيانات الحالية بالبيانات الأصلية من الكشف. / 您是否要重置工作证档案并同步原本的81位员工？当前数据将被覆盖。",
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
        showNotification("تم استعادة ومزامنة الـ 81 موظف الأصليين بنجاح / 81位原始员工名册已成功重置并同步！ 🔄", "success");
      }
    );
  };

  // Get selected worker object
  const activeWorker = workers.find(w => w.id === selectedWorkerId);

  // Initialize/Update employee ID custom when active worker changes
  useEffect(() => {
    if (activeWorker) {
      // Create a default code like Y plus last 3 digits of National ID or random
      const nationalId = activeWorker.nationalId || "";
      const lastDigits = nationalId.slice(-3) || Math.floor(Math.random() * 900 + 100).toString();
      setEmployeeIdCustom("Y" + lastDigits);
    } else {
      setEmployeeIdCustom("");
    }
  }, [selectedWorkerId]);

  // Load timesheet data from localStorage when worker/month/year changes
  useEffect(() => {
    if (!selectedWorkerId) {
      setRows([]);
      return;
    }

    const key = `yuanda_ts_v1_${selectedWorkerId}_${selectedMonth}_${selectedYear}`;
    const saved = localStorage.getItem(key);
    const totalDays = getDaysInMonth(selectedMonth, selectedYear);

    // Generate date strings and baseline
    const initialRows: TimesheetRow[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(selectedYear, selectedMonth - 1, d);
      const dateStr = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      });

      initialRows.push({
        day: d,
        dateStr,
        inTime: "",
        outTime: "",
        overtime: "",
        employeeSign: "",
        supervisorSign: "",
        remark: ""
      });
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved data with empty template to ensure correctness
        const merged = initialRows.map(row => {
          const matchedSaved = parsed.rows?.find((r: any) => r.day === row.day);
          if (matchedSaved) {
            return {
              ...row,
              inTime: matchedSaved.inTime || "",
              outTime: matchedSaved.outTime || "",
              overtime: matchedSaved.overtime || "",
              remark: matchedSaved.remark || ""
            };
          }
          return row;
        });
        setRows(merged);
        setDepartment(parsed.department || "south");
        setEmployeeIdCustom(parsed.employeeId || "");
        setOvertimeDay(parsed.overtimeDay || "0");
        setOvertimeNight(parsed.overtimeNight || "0");
        setContactPhone(parsed.contactPhone || "201007932476");
      } catch (e) {
        console.error("Error loading saved timesheet:", e);
        setRows(initialRows);
      }
    } else {
      // No saved data, load default days
      setRows(initialRows);
      setOvertimeDay("0");
      setOvertimeNight("0");
      setContactPhone("201007932476");
    }
  }, [selectedWorkerId, selectedMonth, selectedYear]);

  // Save active timesheet to localStorage
  const saveTimesheet = (currentRows = rows, dept = department, empId = employeeIdCustom, ovDay = overtimeDay, ovNight = overtimeNight, phone = contactPhone) => {
    if (!selectedWorkerId) return;
    const key = `yuanda_ts_v1_${selectedWorkerId}_${selectedMonth}_${selectedYear}`;
    const dataToSave = {
      rows: currentRows,
      department: dept,
      employeeId: empId,
      overtimeDay: ovDay,
      overtimeNight: ovNight,
      contactPhone: phone,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
  };

  // Row edit handler
  const handleCellChange = (day: number, field: keyof TimesheetRow, val: string) => {
    const updated = rows.map(r => {
      if (r.day === day) {
        const newRow = { ...r, [field]: val };
        // Auto calculate overtime if both IN and OUT are filled with valid HH:MM
        if (field === "inTime" || field === "outTime") {
          const inTime = field === "inTime" ? val : r.inTime;
          const outTime = field === "outTime" ? val : r.outTime;
          
          if (inTime && outTime) {
            const calculatedOt = calcOvertime(inTime, outTime);
            if (calculatedOt > 0) {
              newRow.overtime = calculatedOt.toString();
            } else {
              newRow.overtime = "";
            }
          }
        }
        return newRow;
      }
      return r;
    });
    setRows(updated);
    saveTimesheet(updated);
  };

  // Helper to calculate hours
  const calcOvertime = (inTime: string, outTime: string): number => {
    try {
      const [inH, inM] = inTime.split(":").map(Number);
      const [outH, outM] = outTime.split(":").map(Number);
      if (isNaN(inH) || isNaN(outH)) return 0;
      
      let diff = (outH + outM / 60) - (inH + inM / 60);
      if (diff < 0) diff += 24; // handles overnight shifts
      
      // Standard shift is 8 or 9 hours (8 hours work + 1 hour break).
      // Yuanda usually calculates anything above 8 hours of net work as overtime.
      const standardHours = 8;
      if (diff > standardHours) {
        return Math.round((diff - standardHours) * 2) / 2; // round to nearest 0.5
      }
    } catch (e) {}
    return 0;
  };

  // Auto calculate sum of day overtime column
  const syncOvertimeDayFromTable = () => {
    let sum = 0;
    rows.forEach(r => {
      const ot = parseFloat(r.overtime);
      if (!isNaN(ot)) {
        sum += ot;
      }
    });
    setOvertimeDay(sum.toString());
    saveTimesheet(rows, department, employeeIdCustom, sum.toString(), overtimeNight);
    showNotification(`⚡ تم حساب إجمالي الإضافي النهاري تلقائياً: ${sum} ساعة`, "info");
  };

  // Auto-fill from core Attendance db
  const handleAutoFillFromAttendance = () => {
    if (!selectedWorkerId) {
      showNotification("يرجى اختيار العامل أولاً!", "error");
      return;
    }

    // Load attendance from PermitManager format
    const key = `app_attendance_v1_${selectedMonth}_${selectedYear}`;
    const saved = localStorage.getItem(key);
    
    if (!saved) {
      // If no attendance DB is found, fallback to setting standard 8:00 - 17:00 on non-Fridays
      const updated = rows.map(r => {
        const dateObj = new Date(selectedYear, selectedMonth - 1, r.day);
        const isFriday = dateObj.getDay() === 5;
        if (!isFriday) {
          return {
            ...r,
            inTime: "08:00",
            outTime: "17:00",
            overtime: "1", // 9 hours total, 8 work + 1 break, leaves 1 hour overtime
            remark: "حضور"
          };
        } else {
          return {
            ...r,
            inTime: "",
            outTime: "",
            overtime: "",
            remark: "عطلة إسبوعية"
          };
        }
      });
      setRows(updated);
      saveTimesheet(updated);
      showNotification("⚠️ لم يتم العثور على سجل حضور مخزن؛ تم ملء الأيام العادية افتراضياً (08:00-17:00).", "info");
      return;
    }

    try {
      const attendanceDb = JSON.parse(saved);
      const workerAttendance = attendanceDb[selectedWorkerId] || {};
      
      let filledCount = 0;
      const updated = rows.map(r => {
        const status = workerAttendance[r.day];
        if (status === "ح") {
          filledCount++;
          return {
            ...r,
            inTime: "08:00",
            outTime: "17:00",
            overtime: "1",
            remark: "حضور"
          };
        } else if (status === "غ") {
          return {
            ...r,
            inTime: "غائب",
            outTime: "غائب",
            overtime: "",
            remark: "غياب"
          };
        } else if (status === "ع") {
          return {
            ...r,
            inTime: "",
            outTime: "",
            overtime: "",
            remark: "عطلة رسمية/جمعة"
          };
        } else if (status === "إ") {
          return {
            ...r,
            inTime: "",
            outTime: "",
            overtime: "",
            remark: "إجازة مدفوعة"
          };
        }
        return r;
      });

      setRows(updated);
      saveTimesheet(updated);
      showNotification(`🎉 نجاح! تم مزج وتعبئة عدد (${filledCount}) أيام حضور من كشف الحضور والإنصراف النشط.`, "success");
    } catch (e) {
      console.error(e);
      showNotification("فشل قراءة سجل الحضور.", "error");
    }
  };

  // Reset entire month timesheet
  const handleClearTimesheet = () => {
    askConfirmation(
      "🗑️ تصفير ساعات الشهر / 清空月度工时",
      "هل أنت متأكد من تصفير وإفراغ جميع ساعات هذا الشهر لهذا العامل؟ / 您确定要清空该员工本月的所有工时吗？",
      () => {
        const cleared = rows.map(r => ({
          ...r,
          inTime: "",
          outTime: "",
          overtime: "",
          remark: ""
        }));
        setRows(cleared);
        setOvertimeDay("0");
        setOvertimeNight("0");
        saveTimesheet(cleared, department, employeeIdCustom, "0", "0");
        showNotification("تم تصفير جميع ساعات الحضور والإنصراف بنجاح / 所有考勤工时已成功清空。", "info");
      }
    );
  };

  // Export beautiful Yuanda spreadsheet
  const handleExportExcel = () => {
    if (!activeWorker) {
      showNotification("يرجى اختيار العامل أولاً! / 请先选择员工！", "error");
      return;
    }

    const monthLabel = ARABIC_MONTHS.find(m => m.value === selectedMonth)?.label || "";

    const wb = XLSX.utils.book_new();
    const dataRows: any[] = [];

    // Title Block
    dataRows.push(["Yuanda Time Sheet / 远大考勤表 / جدول زمني لشركة يواندا"]);
    dataRows.push([]); // blank

    // Meta Block
    dataRows.push(["Department / 部门 / قسم", department, "Name / 姓名 / الاسم", activeWorker.fullName]);
    dataRows.push(["Position / 工种 / الوظيفة", activeWorker.jobTitle, "Employee ID / 工号 / الكود الوظيفي", employeeIdCustom]);
    dataRows.push(["Contact Phone / 电话 / رقم الهاتف", contactPhone]);
    dataRows.push([]); // blank

    // Table Headers
    dataRows.push([
      "Date / 日期 / التاريخ",
      "IN / 在场 / دخول",
      "OUT / 离开 / انصراف",
      "OVER Time / 加时 / الوقت الإضافي",
      "Employee Sign / 签字 / توقيع الموظف",
      "Supervisor/Chief Sign / 负责人签字 / توقيع المشرف",
      "Remark / 备注 / الملاحظات"
    ]);

    // Populate rows
    rows.forEach(r => {
      dataRows.push([
        r.dateStr,
        r.inTime,
        r.outTime,
        r.overtime,
        "", // sign
        "", // supervisor sign
        r.remark
      ]);
    });

    dataRows.push([]); // spacer
    dataRows.push(["OVER TIME HOURS (إجمالي الساعات الإضافية)"]);
    dataRows.push(["NO of overtime hours during the day (الإضافي النهاري)", overtimeDay]);
    dataRows.push(["NO of overtime hours during the night (الإضافي الليلي)", overtimeNight]);

    const ws = XLSX.utils.aoa_to_sheet(dataRows);

    // Styling column widths
    ws["!cols"] = [
      { wch: 30 }, // Date
      { wch: 12 }, // IN
      { wch: 12 }, // OUT
      { wch: 15 }, // Overtime
      { wch: 20 }, // Sign
      { wch: 20 }, // Supervisor
      { wch: 25 }, // Remark
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Yuanda Timesheet");
    XLSX.writeFile(wb, `تايم_شيت_يواندا_${activeWorker.fullName}_${monthLabel}_${selectedYear}.xlsx`);
    showNotification("تم تصدير ملف الإكسيل للتايم شيت بنجاح / 考勤表Excel文件导出成功！", "success");
  };

  // Handle direct print
  const handlePrint = () => {
    if (!activeWorker) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      // Fallback to normal print if window.open is blocked
      window.print();
      return;
    }

    const rowsHtml = rows.map((row) => {
      const isHoliday = row.remark.includes("عطلة") || row.remark.includes("جمعة");
      const isAbsent = row.remark.includes("غياب") || row.remark.includes("غائب");
      return `
        <tr style="border-bottom: 1px solid #cbd5e1; page-break-inside: avoid; ${isHoliday ? "background-color: #f8fafc;" : ""}">
          <td style="border-left: 2px solid #0f172a; border-bottom: 1px solid #0f172a; padding: 6px 8px; text-align: right; font-weight: 500; font-size: 11px;">
            ${row.dateStr}
          </td>
          <td style="border-left: 1px solid #94a3b8; border-bottom: 1px solid #0f172a; padding: 6px; text-align: center; font-family: monospace; font-size: 11px; ${isAbsent ? "color: #e11d48; font-weight: bold;" : ""}">
            ${row.inTime || "-"}
          </td>
          <td style="border-left: 1px solid #94a3b8; border-bottom: 1px solid #0f172a; padding: 6px; text-align: center; font-family: monospace; font-size: 11px; ${isAbsent ? "color: #e11d48; font-weight: bold;" : ""}">
            ${row.outTime || "-"}
          </td>
          <td style="border-left: 1px solid #94a3b8; border-bottom: 1px solid #0f172a; padding: 6px; text-align: center; font-family: monospace; font-weight: bold; font-size: 11px; color: #4f46e5;">
            ${row.overtime || "-"}
          </td>
          <td style="border-left: 1px solid #94a3b8; border-bottom: 1px solid #0f172a; padding: 6px;"></td>
          <td style="border-left: 1px solid #94a3b8; border-bottom: 1px solid #0f172a; padding: 6px;"></td>
          <td style="border-left: 2px solid #0f172a; border-bottom: 1px solid #0f172a; padding: 6px 8px; text-align: right; font-size: 11px; ${isHoliday ? "color: #2563eb; font-weight: bold;" : isAbsent ? "color: #e11d48; font-weight: bold;" : ""}">
            ${row.remark || ""}
          </td>
        </tr>
      `;
    }).join("");

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>Yuanda Time Sheet - ${activeWorker.fullName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body {
              font-family: 'Cairo', 'Inter', sans-serif;
              direction: rtl;
              background-color: #ffffff;
              color: #0f172a;
              padding: 0;
              margin: 0;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              @page {
                size: portrait;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body class="p-4">
          <div class="w-full max-w-[800px] mx-auto bg-white border-2 border-slate-950 p-6 text-slate-950 relative">
            
            <!-- Title Section -->
            <div class="text-center space-y-1 border-b-2 border-slate-900 pb-4">
              <h1 class="text-xl font-extrabold tracking-wide uppercase">Yuanda Time Sheet</h1>
              <h2 class="text-lg font-bold tracking-widest text-slate-900">远大考勤表</h2>
              <h3 class="text-sm font-bold text-slate-800">جدول زمني لشركة يواندا</h3>
            </div>

            <!-- Header Metadata Table -->
            <div class="grid grid-cols-2 border-b-2 border-r-2 border-slate-900 mt-4 text-xs">
              
              <!-- Dept Field -->
              <div class="border-l-2 border-b-2 border-slate-900 flex">
                <div class="w-24 bg-slate-100 border-l border-slate-300 px-2 py-1 flex flex-col justify-center font-bold text-[10px] text-right shrink-0">
                  <span>Department</span>
                  <span class="text-[9px] opacity-75">部门</span>
                  <span>قسم</span>
                </div>
                <div class="p-2 flex-1 font-mono font-bold uppercase flex items-center">
                  ${department}
                </div>
              </div>

              <!-- Name Field -->
              <div class="border-l-2 border-b-2 border-slate-900 flex">
                <div class="w-24 bg-slate-100 border-l border-slate-300 px-2 py-1 flex flex-col justify-center font-bold text-[10px] text-right shrink-0">
                  <span>Name</span>
                  <span class="text-[9px] opacity-75">姓名</span>
                  <span>الاسم</span>
                </div>
                <div class="p-2 flex-1 font-bold text-slate-900 flex items-center text-sm">
                  ${activeWorker.fullName}
                </div>
              </div>

              <!-- Position Field -->
              <div class="border-l-2 border-slate-900 flex">
                <div class="w-24 bg-slate-100 border-l border-slate-300 px-2 py-1 flex flex-col justify-center font-bold text-[10px] text-right shrink-0">
                  <span>Position</span>
                  <span class="text-[9px] opacity-75">工种</span>
                  <span>الوظيفة</span>
                </div>
                <div class="p-2 flex-1 font-bold text-slate-800 flex items-center text-xs">
                  ${activeWorker.jobTitle}
                </div>
              </div>

              <!-- Employee ID Field -->
              <div class="border-l-2 border-slate-900 flex">
                <div class="w-24 bg-slate-100 border-l border-slate-300 px-2 py-1 flex flex-col justify-center font-bold text-[10px] text-right shrink-0">
                  <span>Employee ID</span>
                  <span class="text-[9px] opacity-75">工号</span>
                  <span>الكود الوظيفي</span>
                </div>
                <div class="p-2 flex-1 font-mono font-bold text-slate-900 flex items-center text-sm">
                  ${employeeIdCustom || "---"}
                </div>
              </div>

            </div>

            <!-- Attendance Days Grid -->
            <div class="mt-5 overflow-hidden border-t-2 border-r-2 border-slate-900">
              <table class="w-full text-center border-collapse text-[10px]">
                <thead>
                  <tr class="bg-slate-50 border-b-2 border-slate-900 font-bold">
                    <th class="border-l-2 border-slate-900 px-1 py-1 w-44 text-right">
                      <div class="font-bold">Date</div>
                      <div class="text-[8px] opacity-75">日期</div>
                      <div>التاريخ</div>
                    </th>
                    <th class="border-l border-slate-400 px-1 py-1 w-16">
                      <div class="font-bold">IN</div>
                      <div class="text-[8px] opacity-75">在场</div>
                      <div>دخول</div>
                    </th>
                    <th class="border-l border-slate-400 px-1 py-1 w-16">
                      <div class="font-bold">OUT</div>
                      <div class="text-[8px] opacity-75">离开</div>
                      <div>انصراف</div>
                    </th>
                    <th class="border-l border-slate-400 px-1 py-1 w-20">
                      <div class="font-bold">OVER Time</div>
                      <div class="text-[8px] opacity-75">加时</div>
                      <div>الوقت الإضافي</div>
                    </th>
                    <th class="border-l border-slate-400 px-1 py-1 w-28">
                      <div class="font-bold">Employee Sign</div>
                      <div class="text-[8px] opacity-75">签字</div>
                      <div>توقيع الموظف</div>
                    </th>
                    <th class="border-l border-slate-400 px-1 py-1 w-28">
                      <div class="font-bold">Supervisor Sign</div>
                      <div class="text-[8px] opacity-75">负责人签字</div>
                      <div>توقيع المشرف</div>
                    </th>
                    <th class="border-l-2 border-slate-900 px-1 py-1">
                      <div class="font-bold">Remark</div>
                      <div class="text-[8px] opacity-75">备注</div>
                      <div>الملاحظات</div>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y border-b-2 border-slate-900 divide-slate-300">
                  ${rowsHtml}
                </tbody>
              </table>
            </div>

            <!-- Overtime Hours Summary Section -->
            <div class="mt-5 border-2 border-slate-900 p-3 text-xs space-y-3 bg-slate-50/40 text-right">
              <span class="font-extrabold block text-center border-b border-slate-400 pb-1.5 uppercase tracking-wider text-[10px]">
                OVER TIME HOURS / 加时赛 / ساعات العمل الإضافية
              </span>

              <div class="grid grid-cols-2 gap-4 divide-x divide-slate-400 text-center" style="direction: ltr;">
                
                <!-- Night Overtime (left in ltr) -->
                <div class="space-y-1">
                  <span class="text-[10px] font-bold text-slate-700 block">NO of overtime hours during the night</span>
                  <span class="text-[9px] text-slate-500 block">夜间加班小时数</span>
                  <span class="text-[10px] font-bold block">عدد الساعات الإضافية الليلية</span>
                  <span class="text-sm font-black text-indigo-700 block pt-1">${overtimeNight} ساعة</span>
                </div>

                <!-- Day Overtime (right in ltr) -->
                <div class="space-y-1">
                  <span class="text-[10px] font-bold text-slate-700 block">NO of overtime hours during the day</span>
                  <span class="text-[9px] text-slate-500 block">额外日照时数</span>
                  <span class="text-[10px] font-bold block">عدد الساعات الإضافية النهارية</span>
                  <span class="text-sm font-black text-indigo-700 block pt-1">${overtimeDay} ساعة</span>
                </div>

              </div>
            </div>

            <!-- Signature blocks at bottom -->
            <div class="grid grid-cols-2 gap-4 border-t-2 border-slate-900 mt-6 pt-5 text-[10px]">
              
              <!-- Supervisor sign block -->
              <div class="space-y-8 text-center">
                <div class="space-y-0.5">
                  <span class="font-bold block">Supervisor/Chief Sign</span>
                  <span class="text-[8px] text-slate-500 block">负责人签字</span>
                  <span class="font-bold block text-slate-800">توقيع المشرف</span>
                </div>
                <div class="border-b border-dashed border-slate-400 w-32 mx-auto pt-2"></div>
              </div>

              <!-- Dept manager sign block -->
              <div class="space-y-8 text-center">
                <div class="space-y-0.5">
                  <span class="font-bold block">Dept Manager Sign</span>
                  <span class="text-[8px] text-slate-500 block">部门经理</span>
                  <span class="font-bold block text-slate-800">توقيع مدير القسم</span>
                </div>
                <div class="border-b border-dashed border-slate-400 w-32 mx-auto pt-2"></div>
              </div>

            </div>

            <!-- Serial code / barcode representation on bottom right -->
            <div class="mt-6 flex justify-between items-center text-[8px] font-mono text-slate-400">
              <span>Yuanda Security Standard Form 2026 v1.2</span>
              <span class="font-bold text-[9px] text-slate-800 bg-slate-100 px-1 py-0.5 border border-slate-300 rounded">${contactPhone}</span>
            </div>

          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      
      {/* 1. Header with instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">منشئ ومحرر نموذج تايم شيت شركة يواندا (Yuanda Time Sheet) / 远大考勤表生成与编辑器 📊</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">تصميم متزامن وثنائي اللغة مخصص للطباعة والاستيراد المباشر والمطابقة مع كشف حضور مقاولي الباطن / 专为直接打印、导入以及分包商考勤比对而设计的双语同步考勤表</p>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
            جاهز للطباعة والملء / 已就绪
          </span>
        </div>
        
        <p className="text-[11px] text-slate-400 leading-relaxed">
          💡 <strong>حول هذه الأداة / 关于此工具：</strong> يتيح لك هذا التبويب توليد وطباعة نموذج الحضور الصيني المعتمد لشركة <strong>يواندا (Yuanda)</strong> لعام 2026. يمكنك تحديد أي موظف من قاعدة بيانات العمال، وتعديل ساعاته، أو ملئها تلقائياً بضغطة واحدة من واقع كشف الحضور والإنصراف العام، ثم طباعتها مباشرة كاستمارة رسمية مطابقة تماماً للمستند الأصلي. / 此选项卡允许您生成并打印2026年远大公司（Yuanda）批准的中文考勤表模板。您可以从工人数据库中选择任何员工、修改其工时，或根据总考勤表一键自动填写，然后直接打印为与原件完全一致的官方正式表格。
        </p>
      </div>

      {/* Toast Notification inside view */}
      {alertMsg && (
        <div className={`fixed bottom-6 left-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border text-xs font-bold transition-all animate-bounce ${
          alertMsg.type === "success" 
            ? "bg-slate-900 border-emerald-500/30 text-emerald-400" 
            : alertMsg.type === "error"
              ? "bg-slate-900 border-rose-500/30 text-rose-400"
              : "bg-slate-900 border-indigo-500/30 text-indigo-400"
        }`}>
          <Sparkles className="w-4 h-4" />
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* 2. Control Form (Hides on Print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 print:hidden">
        <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
          <Sliders className="w-4 h-4" />
          لوحة الإعدادات وتغذية البيانات / 设置与数据输入面板
        </span>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Worker Selector */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs text-slate-400 font-bold flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>اختر العامل من قاعدة البيانات / 从数据库选择员工:</span>
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">-- اختر من قائمة عمال التصاريح / 请选择员工 --</option>
              {workers.map((w, index) => (
                <option key={w.id} value={w.id}>
                  {index + 1}- {w.fullName} ({w.jobTitle})
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px]">
              {workers.length === 0 ? (
                <span className="text-rose-400 font-bold">⚠️ قاعدة بيانات العمال فارغة حالياً / 员工数据库当前为空。</span>
              ) : (
                <span className="text-slate-500 font-medium">عدد الموظفين / 员工数: {workers.length}</span>
              )}
              <button
                type="button"
                onClick={handleSyncSeedWorkers}
                className="text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="إعادة ضبط ومزامنة الـ 81 موظف الأصليين من الكشف / 重置并同步81名原始员工名册"
              >
                <RefreshCw className="w-3 h-3 text-amber-500" />
                <span>مزامنة الـ 81 الأصليين / 同步81名原始员工 🔄</span>
              </button>
            </div>
          </div>

          {/* Month Selector */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs text-slate-400 font-bold">شهر التايم شيت / 考勤月份:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {ARABIC_MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label} ({String(m.value).padStart(2, "0")})</option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs text-slate-400 font-bold">السنة / 年度:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {[2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs text-slate-400 font-bold">القسم / 部门 (Department):</label>
            <input
              type="text"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                saveTimesheet(rows, e.target.value);
              }}
              placeholder="مثال: south / 例如: south"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {selectedWorkerId && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
            {/* Custom Employee ID */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs text-slate-400 font-bold">الكود الوظيفي / 员工工号 (Employee ID):</label>
              <input
                type="text"
                value={employeeIdCustom}
                onChange={(e) => {
                  setEmployeeIdCustom(e.target.value);
                  saveTimesheet(rows, department, e.target.value, overtimeDay, overtimeNight, contactPhone);
                }}
                placeholder="مثال: Y77 / 例如: Y77"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Contact Phone Number */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs text-slate-400 font-bold">رقم الهاتف / 手机号码 (Phone Number):</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => {
                  setContactPhone(e.target.value);
                  saveTimesheet(rows, department, employeeIdCustom, overtimeDay, overtimeNight, e.target.value);
                }}
                placeholder="مثال: 201007932476 / 例如: 201007932476"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Overtime Day Manual */}
            <div className="md:col-span-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400 font-bold">الإضافي النهاري (ساعة) / 日间加班 (小时):</label>
                <button
                  onClick={syncOvertimeDayFromTable}
                  className="text-[9px] text-indigo-400 hover:text-white transition-all font-bold cursor-pointer"
                >
                  🔄 جرد تلقائي / 自动统计
                </button>
              </div>
              <input
                type="text"
                value={overtimeDay}
                onChange={(e) => {
                  setOvertimeDay(e.target.value);
                  saveTimesheet(rows, department, employeeIdCustom, e.target.value, overtimeNight, contactPhone);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Overtime Night Manual */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs text-slate-400 font-bold">الإضافي الليلي (ساعة) / 夜间加班 (小时):</label>
              <input
                type="text"
                value={overtimeNight}
                onChange={(e) => {
                  setOvertimeNight(e.target.value);
                  saveTimesheet(rows, department, employeeIdCustom, overtimeDay, e.target.value, contactPhone);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Buttons Row */}
        <div className="pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={!selectedWorkerId}
              onClick={handleAutoFillFromAttendance}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تعبئة تلقائية من كشف الحضور / 自动从考勤表填入 ⚡</span>
            </button>

            <button
              disabled={!selectedWorkerId}
              onClick={handleClearTimesheet}
              className="bg-rose-950/40 hover:bg-rose-900/40 disabled:opacity-50 disabled:cursor-not-allowed text-rose-400 border border-rose-900/30 text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تصفير وساعات فارغة / 全部清空 ❌</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={!selectedWorkerId}
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel / 导出 📊</span>
            </button>

            <button
              disabled={!selectedWorkerId}
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كملف PDF / ورقي / 打印为PDF或纸质版 🖨️</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. The Live High-Fidelity Paper Template Previsualizer */}
      {!selectedWorkerId ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-700/50">
            <Calendar className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">بانتظار اختيار عامل التصريح / 等待选择员工 👤</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">اختر عاملاً من القائمة المنسدلة بالأعلى لتوليد وعرض التايم شيت الشهري الرسمي الخاص به والمطابق لنموذج شركة يواندا الصينية. / 从上方下拉菜单中选择一名工人，即可生成并查看与中国远大公司模板相符的官方月度考勤表。</p>
          </div>
        </div>
      ) : (
        <div className="bg-white text-slate-950 p-6 md:p-10 rounded-3xl shadow-2xl overflow-x-auto print:p-0 print:shadow-none print:rounded-none">
          
          {/* Print instructions warning */}
          <div className="mb-4 bg-amber-50 text-amber-800 border border-amber-200 p-3 rounded-xl text-xs print:hidden flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>نصيحة طباعة: يفضل اختيار الاتجاه العمودي (Portrait) في إعدادات الطباعة، وإلغاء هوامش المتصفح الافتراضية للحصول على مستند نظيف ومثالي. / 打印建议：建议在打印设置中选择纵向（Portrait）并取消浏览器默认页眉页脚，以获得最完美的打印效果。</span>
          </div>

          {/* Core Yuanda Sheet (Aesthetic White/Black Layout) */}
          <div className="w-full max-w-[800px] mx-auto bg-white border-2 border-slate-950 p-6 text-slate-950 relative print:border-0 print:p-2" id="yuanda-timesheet-print-area">
            
            {/* Title Section */}
            <div className="text-center space-y-1.5 border-b-2 border-slate-900 pb-4">
              <h1 className="text-lg md:text-xl font-extrabold tracking-wide uppercase font-sans">Yuanda Time Sheet</h1>
              <h2 className="text-base md:text-lg font-bold tracking-widest text-slate-900 font-sans">远大考勤表</h2>
              <h3 className="text-sm md:text-base font-bold font-sans text-slate-800">جدول زمني لشركة يواندا</h3>
            </div>

            {/* Header Metadata Table */}
            <div className="grid grid-cols-2 border-b-2 border-r-2 border-slate-900 mt-4 text-xs">
              
              {/* Dept Field */}
              <div className="border-l-2 border-b-2 border-slate-900 flex">
                <div className="w-24 bg-slate-100 border-l border-slate-300 px-2 py-1.5 flex flex-col justify-center font-bold text-[10px] text-right shrink-0">
                  <span>Department</span>
                  <span className="text-[9px] opacity-75">部门</span>
                  <span>قسم</span>
                </div>
                <div className="p-2 flex-1 font-mono font-bold uppercase flex items-center">
                  {department}
                </div>
              </div>

              {/* Name Field */}
              <div className="border-l-2 border-b-2 border-slate-900 flex">
                <div className="w-24 bg-slate-100 border-l border-slate-300 px-2 py-1.5 flex flex-col justify-center font-bold text-[10px] text-right shrink-0">
                  <span>Name</span>
                  <span className="text-[9px] opacity-75">姓名</span>
                  <span>الاسم</span>
                </div>
                <div className="p-2 flex-1 font-bold text-slate-900 flex items-center text-sm">
                  {activeWorker?.fullName}
                </div>
              </div>

              {/* Position Field */}
              <div className="border-l-2 border-slate-900 flex">
                <div className="w-24 bg-slate-100 border-l border-slate-300 px-2 py-1.5 flex flex-col justify-center font-bold text-[10px] text-right shrink-0">
                  <span>Position</span>
                  <span className="text-[9px] opacity-75">工种</span>
                  <span>الوظيفة</span>
                </div>
                <div className="p-2 flex-1 font-bold text-slate-800 flex items-center text-xs">
                  {activeWorker?.jobTitle}
                </div>
              </div>

              {/* Employee ID Field */}
              <div className="border-l-2 border-slate-900 flex">
                <div className="w-24 bg-slate-100 border-l border-slate-300 px-2 py-1.5 flex flex-col justify-center font-bold text-[10px] text-right shrink-0">
                  <span>Employee ID</span>
                  <span className="text-[9px] opacity-75">工号</span>
                  <span>الكود الوظيفي</span>
                </div>
                <div className="p-2 flex-1 font-mono font-bold text-slate-900 flex items-center text-sm">
                  {employeeIdCustom || "---"}
                </div>
              </div>

            </div>

            {/* Attendance Days Grid */}
            <div className="mt-5 overflow-hidden border-t-2 border-r-2 border-slate-900">
              <table className="w-full text-center border-collapse text-[10px] md:text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-900 font-bold">
                    <th className="border-l-2 border-slate-900 px-1 py-1 w-44 text-right">
                      <div className="font-bold">Date</div>
                      <div className="text-[8px] opacity-75">日期</div>
                      <div>التاريخ</div>
                    </th>
                    <th className="border-l border-slate-400 px-1 py-1 w-16">
                      <div className="font-bold">IN</div>
                      <div className="text-[8px] opacity-75">在场</div>
                      <div>دخول</div>
                    </th>
                    <th className="border-l border-slate-400 px-1 py-1 w-16">
                      <div className="font-bold">OUT</div>
                      <div className="text-[8px] opacity-75">离开</div>
                      <div>انصراف</div>
                    </th>
                    <th className="border-l border-slate-400 px-1 py-1 w-20">
                      <div className="font-bold">OVER Time</div>
                      <div className="text-[8px] opacity-75">加时</div>
                      <div>الوقت الإضافي</div>
                    </th>
                    <th className="border-l border-slate-400 px-1 py-1 w-28">
                      <div className="font-bold">Employee Sign</div>
                      <div className="text-[8px] opacity-75">签字</div>
                      <div>توقيع الموظف</div>
                    </th>
                    <th className="border-l border-slate-400 px-1 py-1 w-28">
                      <div className="font-bold">Supervisor/Chief Sign</div>
                      <div className="text-[8px] opacity-75">负责人签字</div>
                      <div>توقيع المشرف</div>
                    </th>
                    <th className="border-l-2 border-slate-900 px-1 py-1">
                      <div className="font-bold">Remark</div>
                      <div className="text-[8px] opacity-75">备注</div>
                      <div>الملاحظات</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b-2 border-slate-900 divide-slate-300">
                  {rows.map((row) => {
                    const isHoliday = row.remark.includes("عطلة") || row.remark.includes("جمعة");
                    const isAbsent = row.remark.includes("غياب") || row.remark.includes("غائب");
                    return (
                      <tr 
                        key={row.day} 
                        className={`hover:bg-slate-50 transition-colors ${
                          isHoliday ? "bg-slate-50/50 print:bg-slate-50" : ""
                        }`}
                      >
                        {/* Date column (Text Left for English date) */}
                        <td className="border-l-2 border-slate-900 px-2 py-1 text-right font-medium text-[9px] md:text-[10px] text-slate-800">
                          {row.dateStr}
                        </td>

                        {/* IN Time */}
                        <td className="border-l border-slate-400 p-0 text-center font-mono">
                          <input
                            type="text"
                            value={row.inTime}
                            onChange={(e) => handleCellChange(row.day, "inTime", e.target.value)}
                            className={`w-full text-center py-1 text-xs border-0 bg-transparent focus:ring-0 focus:outline-none print:p-0 ${
                              isAbsent ? "text-rose-600 font-bold" : "text-slate-900"
                            }`}
                          />
                        </td>

                        {/* OUT Time */}
                        <td className="border-l border-slate-400 p-0 text-center font-mono">
                          <input
                            type="text"
                            value={row.outTime}
                            onChange={(e) => handleCellChange(row.day, "outTime", e.target.value)}
                            className={`w-full text-center py-1 text-xs border-0 bg-transparent focus:ring-0 focus:outline-none print:p-0 ${
                              isAbsent ? "text-rose-600 font-bold" : "text-slate-900"
                            }`}
                          />
                        </td>

                        {/* Overtime (in hours) */}
                        <td className="border-l border-slate-400 p-0 text-center font-mono font-bold">
                          <input
                            type="text"
                            value={row.overtime}
                            onChange={(e) => handleCellChange(row.day, "overtime", e.target.value)}
                            placeholder="-"
                            className="w-full text-center py-1 text-xs border-0 bg-transparent focus:ring-0 focus:outline-none placeholder-slate-300 text-indigo-700 font-bold print:p-0"
                          />
                        </td>

                        {/* Signatures blank spaces */}
                        <td className="border-l border-slate-400 px-1 py-1 text-[9px] text-slate-300 italic">
                          {/* Blank for manual sign on paper */}
                          <span className="opacity-0">Signature</span>
                        </td>

                        <td className="border-l border-slate-400 px-1 py-1 text-[9px] text-slate-300 italic">
                          <span className="opacity-0">Approved</span>
                        </td>

                        {/* Remarks */}
                        <td className="border-l-2 border-slate-900 p-0 text-right">
                          <input
                            type="text"
                            value={row.remark}
                            onChange={(e) => handleCellChange(row.day, "remark", e.target.value)}
                            className={`w-full text-right px-2 py-1 text-[10px] border-0 bg-transparent focus:ring-0 focus:outline-none print:p-0 ${
                              isHoliday ? "text-blue-600 font-bold" : isAbsent ? "text-rose-600 font-bold" : "text-slate-800"
                            }`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Overtime Hours Summary Section */}
            <div className="mt-5 border-2 border-slate-900 p-3 text-xs space-y-3 bg-slate-50/40">
              <span className="font-extrabold block text-center border-b border-slate-400 pb-1.5 uppercase tracking-wider text-[10px]">
                OVER TIME HOURS / 加时赛 / ساعات العمل الإضافية
              </span>

              <div className="grid grid-cols-2 gap-4 divide-x divide-slate-400 text-center">
                
                {/* Day Overtime */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-700 block">NO of overtime hours during the day</span>
                  <span className="text-[9px] text-slate-500 block">额外日照时数</span>
                  <span className="text-[10px] font-bold block">عدد الساعات الإضافية النهارية</span>
                  <span className="text-sm font-black text-indigo-700 block pt-1">{overtimeDay} ساعة</span>
                </div>

                {/* Night Overtime */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-700 block">NO of overtime hours during the night</span>
                  <span className="text-[9px] text-slate-500 block">夜间加班小时数</span>
                  <span className="text-[10px] font-bold block">عدد الساعات الإضافية الليلية</span>
                  <span className="text-sm font-black text-indigo-700 block pt-1">{overtimeNight} ساعة</span>
                </div>

              </div>
            </div>

            {/* Signature blocks at bottom */}
            <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-900 mt-6 pt-5 text-[10px]">
              
              {/* Supervisor sign block */}
              <div className="space-y-8 text-center">
                <div className="space-y-0.5">
                  <span className="font-bold block">Supervisor/Chief Sign</span>
                  <span className="text-[8px] text-slate-500 block">负责人签字</span>
                  <span className="font-bold block text-slate-800">توقيع المشرف</span>
                </div>
                <div className="border-b border-dashed border-slate-400 w-32 mx-auto pt-2"></div>
              </div>

              {/* Dept manager sign block */}
              <div className="space-y-8 text-center">
                <div className="space-y-0.5">
                  <span className="font-bold block">Dept Manager Sign</span>
                  <span className="text-[8px] text-slate-500 block">部门经理</span>
                  <span className="font-bold block text-slate-800">توقيع مدير القسم</span>
                </div>
                <div className="border-b border-dashed border-slate-400 w-32 mx-auto pt-2"></div>
              </div>

            </div>

            {/* Serial code / barcode representation on bottom right */}
            <div className="mt-6 flex justify-between items-center text-[8px] font-mono text-slate-400">
              <span>Yuanda Security Standard Form 2026 v1.2</span>
              <span className="font-bold text-[9px] text-slate-800 bg-slate-100 px-1 py-0.5 border border-slate-300 rounded">{contactPhone}</span>
            </div>

          </div>

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
