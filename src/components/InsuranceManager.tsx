import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit2, FileSpreadsheet, RefreshCw, Printer, CheckCircle, Info, X } from "lucide-react";
import { SEED_WORKERS } from "../data/seedWorkers";

export interface InsuranceRecord {
  id: string;
  code: string;
  insuranceId: string;
  fullName: string;
  nationalId: string;
  prevSalary: number;
  currInsuranceSalary: number;
  currComprehensiveSalary: number;
}

// Initial seed records corresponding to the first image
const SEED_INSURANCE_RECORDS: InsuranceRecord[] = [
  { id: "ins-1", code: "Y70", insuranceId: "3239602", fullName: "اسامه عادل على عرب كللى", nationalId: "27909010110432", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-2", code: "Y3", insuranceId: "3947435", fullName: "محمد على محمد عبدالحميد", nationalId: "29209121601139", prevSalary: 4000, currInsuranceSalary: 7000, currComprehensiveSalary: 7490 },
  { id: "ins-3", code: "Y46", insuranceId: "1368642", fullName: "ايهاب جمال الدين حسن عبدالوهاب", nationalId: "28801152103695", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-4", code: "Y66", insuranceId: "1702484", fullName: "حمدى على السيد محمد", nationalId: "28312053100039", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-5", code: "Y6", insuranceId: "1844162", fullName: "حسام الدين محمد سيد محمد", nationalId: "28809090400079", prevSalary: 7000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-6", code: "Y69", insuranceId: "26814498", fullName: "مصطفى محمد عبدالغفار اسماعيل", nationalId: "28807041802258", prevSalary: 4000, currInsuranceSalary: 2889, currComprehensiveSalary: 5490 },
  { id: "ins-7", code: "Y11", insuranceId: "50751996", fullName: "وائل جابر سيد سيد", nationalId: "29606252501895", prevSalary: 2700, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-8", code: "Y72", insuranceId: "52726416", fullName: "محمد جابر حامد احمد", nationalId: "29605110400258", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-9", code: "Y50", insuranceId: "54767181", fullName: "على ابراهيم احمد محمد", nationalId: "28303221900276", prevSalary: 4000, currInsuranceSalary: 7490, currComprehensiveSalary: 7490 },
  { id: "ins-10", code: "Y31", insuranceId: "55003144", fullName: "حسام محسن احمد محسن", nationalId: "29501242700536", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-11", code: "Y15", insuranceId: "56183004", fullName: "محمد حمدى محمد عبدالفتاح اللبيدى", nationalId: "29209121601139", prevSalary: 7000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-12", code: "Y9", insuranceId: "58878838", fullName: "محمد سعيد احمد خليفه", nationalId: "29912093100032", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-13", code: "Y21", insuranceId: "64241261", fullName: "عمر حسين رضوان احمد", nationalId: "30107170400457", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-14", code: "Y79", insuranceId: "65581385", fullName: "محمد رضا فوزى كريم", nationalId: "29810251803731", prevSalary: 4000, currInsuranceSalary: 4494, currComprehensiveSalary: 7490 },
  { id: "ins-15", code: "Y41", insuranceId: "65675225", fullName: "محمد سالم عبدالحميد سالم", nationalId: "30005290400135", prevSalary: 4000, currInsuranceSalary: 4494, currComprehensiveSalary: 7490 },
  { id: "ins-16", code: "Y32", insuranceId: "65713736", fullName: "احمد السيد عبدالرؤف توفيق", nationalId: "29307021100117", prevSalary: 7000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-17", code: "Y53", insuranceId: "68111334", fullName: "محمد طارق حسين عبدالله", nationalId: "30110202300175", prevSalary: 4000, currInsuranceSalary: 3210, currComprehensiveSalary: 7490 },
  { id: "ins-18", code: "Y12", insuranceId: "69034389", fullName: "على صابر محمد عبدالسلام", nationalId: "29606252501895", prevSalary: 4200, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-19", code: "Y10", insuranceId: "69739437", fullName: "احمد محمود امين عبدالعزيز", nationalId: "29410100400212", prevSalary: 4200, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-20", code: "Y20", insuranceId: "71449188", fullName: "سمير سيد عبدالتواب عبدالرازق", nationalId: "29201012108294", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-21", code: "Y39", insuranceId: "72527088", fullName: "على محمد غريب محمد", nationalId: "29608273100111", prevSalary: 3000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-22", code: "Y5", insuranceId: "73115011", fullName: "حمدى حسين مكاوى عطيه", nationalId: "29112080400332", prevSalary: 4000, currInsuranceSalary: 7490, currComprehensiveSalary: 7490 },
  { id: "ins-23", code: "Y63", insuranceId: "74035054", fullName: "حسين محمد ثابت محمد", nationalId: "29302033100138", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-24", code: "Y19", insuranceId: "74636525", fullName: "حميد سليم محمد احمد", nationalId: "29801303100034", prevSalary: 4000, currInsuranceSalary: 7000, currComprehensiveSalary: 7490 },
  { id: "ins-25", code: "Y81", insuranceId: "77117766", fullName: "غريب عصام غريب محمد", nationalId: "29410083100136", prevSalary: 4000, currInsuranceSalary: 7490, currComprehensiveSalary: 7490 },
  { id: "ins-26", code: "Y1", insuranceId: "77122108", fullName: "عبدالرحمن مصطفى ممدوح عبدالله", nationalId: "29603103100076", prevSalary: 7000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-27", code: "Y17", insuranceId: "77127931", fullName: "احمد ممدوح يوسف عرفان", nationalId: "29607043100077", prevSalary: 4000, currInsuranceSalary: 7490, currComprehensiveSalary: 7490 },
  { id: "ins-28", code: "Y33", insuranceId: "77632382", fullName: "مصطفى جمال محمد مقبل العجردى", nationalId: "29705121402231", prevSalary: 2700, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-29", code: "Y34", insuranceId: "78295493", fullName: "رقيه عبدالمنعم حسن نصار", nationalId: "29812051601123", prevSalary: 7000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-30", code: "Y35", insuranceId: "78605832", fullName: "عماد خالد حسنى حسن", nationalId: "29611082103322", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-31", code: "Y36", insuranceId: "78637670", fullName: "حسن محمد عبدالوهاب محمد", nationalId: "29509121601141", prevSalary: 7000, currInsuranceSalary: 7490, currComprehensiveSalary: 7490 },
  { id: "ins-32", code: "Y37", insuranceId: "78683427", fullName: "احمد حواس متولى طه", nationalId: "29302111802241", prevSalary: 4000, currInsuranceSalary: 7490, currComprehensiveSalary: 7490 },
  { id: "ins-33", code: "Y38", insuranceId: "79281692", fullName: "محمد احمد السيد مبارك", nationalId: "29410142103342", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-34", code: "Y40", insuranceId: "79821248", fullName: "محمد عمرو محمد السعيد", nationalId: "29508091602241", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-35", code: "Y42", insuranceId: "80177762", fullName: "محمد شاذلى سعد رجب", nationalId: "29612051804421", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-36", code: "Y43", insuranceId: "80533166", fullName: "محمد نصر محمود رمضان", nationalId: "29308111604421", prevSalary: 7000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-37", code: "Y44", insuranceId: "81441466", fullName: "حاتم مصطفى ممدوح عبدالله", nationalId: "29412091803321", prevSalary: 7000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-38", code: "Y45", insuranceId: "81759737", fullName: "ايمن امين بدرعباس", nationalId: "29503111603342", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-39", code: "Y47", insuranceId: "82299505", fullName: "محمد عبدالعاطى شبلى محرم", nationalId: "29311091803321", prevSalary: 4000, currInsuranceSalary: 7490, currComprehensiveSalary: 7490 },
  { id: "ins-40", code: "Y48", insuranceId: "83160729", fullName: "اسامه نبيه محمد الزعيم", nationalId: "29402121601142", prevSalary: 4000, currInsuranceSalary: 7490, currComprehensiveSalary: 7490 },
  { id: "ins-41", code: "Y49", insuranceId: "83824448", fullName: "السيد خيرالله السيد عطيه", nationalId: "29508091802241", prevSalary: 4000, currInsuranceSalary: 4494, currComprehensiveSalary: 7490 },
  { id: "ins-42", code: "Y51", insuranceId: "84668332", fullName: "عمر عبدالمنعم سيد حسين", nationalId: "29312111603342", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-43", code: "Y52", insuranceId: "84915152", fullName: "مصطفى احمد على محمد", nationalId: "29408091803321", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-44", code: "Y54", insuranceId: "85000745", fullName: "اشرف عبدالعزيز حماد على الجندى", nationalId: "29209121601143", prevSalary: 7000, currInsuranceSalary: 7490, currComprehensiveSalary: 7490 },
  { id: "ins-45", code: "Y55", insuranceId: "85284554", fullName: "عمر عبدالله قاسم احمد محجوب", nationalId: "29511121602241", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-46", code: "Y56", insuranceId: "85971503", fullName: "ياسمين اسامه عبدالمنعم احمد", nationalId: "29812051804423", prevSalary: 7000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-47", code: "Y57", insuranceId: "86009013", fullName: "كريم ابوالعباس مصطفى على", nationalId: "29705121603342", prevSalary: 7000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-48", code: "Y58", insuranceId: "86015368", fullName: "سلمى علاء شاذلى سيد", nationalId: "29910141603342", prevSalary: 4200, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-49", code: "Y59", insuranceId: "86345354", fullName: "احمد محمد وهبه حسين", nationalId: "29512051602241", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-50", code: "Y60", insuranceId: "86894055", fullName: "احمد محمود عبده محمود", nationalId: "29402111802243", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-51", code: "Y61", insuranceId: "86965700", fullName: "مصطفى كرم الله محمد محمود عبدالونيس", nationalId: "29511091803322", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-52", code: "Y62", insuranceId: "86970288", fullName: "محمد ابراهيم كومى احمد", nationalId: "29309121601145", prevSalary: 7000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-53", code: "Y64", insuranceId: "86990784", fullName: "موسى صبحى ابراهيم متولى بردة", nationalId: "29411121602243", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-54", code: "Y65", insuranceId: "87008120", fullName: "احمد محمد عبدالنبي الصاوى مرير", nationalId: "29505121804423", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-55", code: "Y67", insuranceId: "87035527", fullName: "ابراهيم عاطف محمد عبدالونيس", nationalId: "29612051602243", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-56", code: "Y68", insuranceId: "87047946", fullName: "فاطمه علاءالدين محمد القرنى", nationalId: "29703111802243", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-57", code: "Y71", insuranceId: "87127627", fullName: "رائد السيد ابراهيم ابراهيم", nationalId: "29808091803323", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-58", code: "Y73", insuranceId: "87224899", fullName: "عمرو على عبدالرسول خضر", nationalId: "29609121601147", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-59", code: "Y74", insuranceId: "87244523", fullName: "محمد ناصر عبده حسين", nationalId: "29512051804425", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-60", code: "Y75", insuranceId: "87396489", fullName: "محمد عبدالمجيد امين حسن", nationalId: "29410141603344", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-61", code: "Y76", insuranceId: "87518456", fullName: "عمر ياسر محمود توفيق", nationalId: "29502111802245", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-62", code: "Y77", insuranceId: "87664405", fullName: "محمد محروس عبدالله احمد", nationalId: "29611091803324", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 },
  { id: "ins-63", code: "Y78", insuranceId: "87720664", fullName: "محمد خالد معوض محمد عبدالله", nationalId: "29712051602245", prevSalary: 4000, currInsuranceSalary: 4280, currComprehensiveSalary: 7490 }
];

export default function InsuranceManager() {
  const [records, setRecords] = useState<InsuranceRecord[]>(() => {
    const saved = localStorage.getItem("app_insurance_records_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SEED_INSURANCE_RECORDS;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("app_insurance_records_v2", JSON.stringify(records));
  }, [records]);

  // Form states for Add/Edit dialog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InsuranceRecord | null>(null);
  
  // Fields
  const [selectedWorkerCode, setSelectedWorkerCode] = useState("");
  const [insuranceId, setInsuranceId] = useState("");
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [prevSalary, setPrevSalary] = useState("4000");
  const [currInsuranceSalary, setCurrInsuranceSalary] = useState("4280");
  const [currComprehensiveSalary, setCurrComprehensiveSalary] = useState("7490");

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "info" | "error" } | null>(null);

  // Print Preview
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // Form details - bilingual
  const [facilityName, setFacilityName] = useState("يواندا للمقاولات والخدمات التجارية / 远大建筑与商业服务公司");
  const [facilityNumber, setFacilityNumber] = useState("3650371");
  const [regionName, setRegionName] = useState("شرق القاهرة / 开罗东区");
  const [officeName, setOfficeName] = useState("مدينة نصر ثان / 纳斯尔城第二分局");

  const showNotification = (msg: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Auto-fill when choosing worker from dropdown
  const handleWorkerSelect = (code: string) => {
    setSelectedWorkerCode(code);
    const worker = SEED_WORKERS.find(w => w.code === code);
    if (worker) {
      setFullName(worker.fullName);
      setNationalId(worker.nationalId);
      // Auto-set salaries based on worker standard salary or defaults
      if (worker.salary > 0) {
        setPrevSalary("4000");
        setCurrInsuranceSalary(Math.min(worker.salary, 7000).toString());
        setCurrComprehensiveSalary(worker.salary.toString());
      } else {
        setPrevSalary("4000");
        setCurrInsuranceSalary("4280");
        setCurrComprehensiveSalary("7490");
      }
    }
  };

  // Sync remaining 81 employees
  const handleSyncAllWorkers = () => {
    const confirmSync = window.confirm(
      "🔄 هل تود مزامنة واستيراد جميع الموظفين الـ 81 وتوليد أرقام تأمينية ومبالغ افتراضية لهم تلقائياً؟\n是否要自动同步导入全部81名员工并为其生成虚拟社保号与初始基数？"
    );
    if (!confirmSync) return;

    // Map existing records to quickly check duplicates
    const existingCodes = new Set(records.map(r => r.code));
    const newRecords: InsuranceRecord[] = [...records];

    SEED_WORKERS.forEach(worker => {
      if (!existingCodes.has(worker.code)) {
        // Generate mock insurance number
        const randId = Math.floor(1000000 + Math.random() * 9000000).toString();
        const baseSal = worker.salary > 0 ? worker.salary : 7490;
        newRecords.push({
          id: `ins-${worker.code}-${Date.now()}`,
          code: worker.code,
          insuranceId: randId,
          fullName: worker.fullName,
          nationalId: worker.nationalId,
          prevSalary: 4000,
          currInsuranceSalary: Math.round(baseSal * 0.6),
          currComprehensiveSalary: baseSal
        });
      }
    });

    setRecords(newRecords);
    showNotification("تم استيراد ومزامنة الموظفين الـ 81 المتبقيين في كشف التأمينات بنجاح! 🔄\n已成功同步导入剩余81名员工到社保表！", "success");
  };

  // Reset to original seed
  const handleResetToSeeds = () => {
    const confirmReset = window.confirm(
      "⚠️ هل أنت متأكد من رغبتك في إعادة ضبط الجدول للمؤمن عليهم الـ 63 الأصليين من الكشف؟ سيتم حذف أي تعديلات محلية。\n您确定要将表格重置回原始的63名参保员工名单吗？所有本地修改将被清除。"
    );
    if (confirmReset) {
      setRecords(SEED_INSURANCE_RECORDS);
      showNotification("تمت إعادة ضبط كشف التأمينات إلى النسخة الأصلية بنجاح。\n已成功将社保表重置为原始版本。", "info");
    }
  };


  // Open Add modal
  const openAddModal = () => {
    setEditingRecord(null);
    setSelectedWorkerCode("");
    setInsuranceId("");
    setFullName("");
    setNationalId("");
    setPrevSalary("4000");
    setCurrInsuranceSalary("4280");
    setCurrComprehensiveSalary("7490");
    setIsModalOpen(true);
  };

  // Open Edit modal
  const openEditModal = (rec: InsuranceRecord) => {
    setEditingRecord(rec);
    setSelectedWorkerCode(rec.code);
    setInsuranceId(rec.insuranceId);
    setFullName(rec.fullName);
    setNationalId(rec.nationalId);
    setPrevSalary(rec.prevSalary.toString());
    setCurrInsuranceSalary(rec.currInsuranceSalary.toString());
    setCurrComprehensiveSalary(rec.currComprehensiveSalary.toString());
    setIsModalOpen(true);
  };

  // Save / Update record
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !insuranceId.trim()) {
      showNotification("يرجى ملء الاسم والرقم التأميني على الأقل.", "error");
      return;
    }

    const prevVal = parseFloat(prevSalary) || 0;
    const currInsVal = parseFloat(currInsuranceSalary) || 0;
    const currCompVal = parseFloat(currComprehensiveSalary) || 0;

    if (editingRecord) {
      // Update
      const updated = records.map(r => r.id === editingRecord.id ? {
        ...r,
        code: selectedWorkerCode || r.code,
        insuranceId,
        fullName,
        nationalId,
        prevSalary: prevVal,
        currInsuranceSalary: currInsVal,
        currComprehensiveSalary: currCompVal
      } : r);
      setRecords(updated);
      showNotification("تم تعديل بيانات المؤمن عليه بنجاح.", "success");
    } else {
      // Create
      const newRec: InsuranceRecord = {
        id: `ins-${Date.now()}`,
        code: selectedWorkerCode || "Y-Custom",
        insuranceId,
        fullName,
        nationalId,
        prevSalary: prevVal,
        currInsuranceSalary: currInsVal,
        currComprehensiveSalary: currCompVal
      };
      setRecords([newRec, ...records]);
      showNotification("تمت إضافة المؤمن عليه بنجاح إلى القائمة.", "success");
    }

    setIsModalOpen(false);
  };

  // Delete record
  const handleDeleteRecord = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المؤمن عليه: ${name} نهائياً من التأمينات؟`)) {
      setRecords(records.filter(r => r.id !== id));
      showNotification(`تم حذف كشف تأمينات الموظف ${name} بنجاح.`, "info");
    }
  };

  // Filtered records
  const filteredRecords = records.filter(rec => {
    const query = searchQuery.toLowerCase().trim();
    return (
      rec.fullName.toLowerCase().includes(query) ||
      rec.nationalId.includes(query) ||
      rec.insuranceId.includes(query) ||
      rec.code.toLowerCase().includes(query)
    );
  });

  // Calculations
  const totalInsuredCount = filteredRecords.length;
  const totalPrevSalaries = filteredRecords.reduce((acc, r) => acc + r.prevSalary, 0);
  const totalInsuranceWages = filteredRecords.reduce((acc, r) => acc + r.currInsuranceSalary, 0);
  const totalComprehensiveWages = filteredRecords.reduce((acc, r) => acc + r.currComprehensiveSalary, 0);

  // Toggle Print Preview screen
  const handlePrint = () => {
    window.print();
  };

  if (isPrintPreview) {
    return (
      <div className="min-h-screen bg-white text-black p-8 font-sans" dir="rtl" id="insurance-print-area">
        {/* Navigation back and controls for print screen */}
        <div className="mb-6 flex items-center justify-between no-print bg-slate-100 p-4 rounded-xl border border-slate-200">
          <span className="text-sm font-bold text-slate-800">🖨️ معاينة الطباعة الرسمية للنموذج التأميني / 社保申报表官方打印预览</span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1"
            >
              <Printer className="w-4 h-4" /> طباعة كشف التأمينات / 打印社保报表
            </button>
            <button
              onClick={() => setIsPrintPreview(false)}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
            >
              إغلاق المعاينة والرجوع / 关闭预览并返回
            </button>
          </div>
        </div>

        {/* Form header identical to Egyptian Social Insurance */}
        <div className="border-4 border-double border-sky-800 p-6 space-y-4 rounded-lg relative bg-white">
          
          {/* Logo and Ministry Header */}
          <div className="flex justify-between items-center pb-3 border-b border-sky-800">
            <div className="text-right space-y-0.5">
              <h2 className="text-xs font-bold text-sky-950">جمهورية مصر العربية / 埃及阿拉伯共和国</h2>
              <p className="text-[10px] text-slate-700">وزارة التضامن الاجتماعي / 社会保障部</p>
              <p className="text-[9px] text-slate-600">الهيئة القومية للتأمين الاجتماعي / 国家社会保险局</p>
            </div>
            <div className="text-center">
              <h1 className="text-xs font-black text-sky-950">الهيئة القومية للتأمين الاجتماعي / 国家社会保险局</h1>
              <p className="text-[9px] text-slate-600">صندوق العاملين بقطاع الأعمال العام والخاص والحكومي / 公有、私有及政府部门雇员基金</p>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-sky-900">كشف إلكتروني معتمد / 电子核准清单</p>
              <p className="text-[8px] text-slate-500">التاريخ / 日期: {new Date().toLocaleDateString("ar-EG")}</p>
            </div>
          </div>

          {/* Facility Info Table & Limits Table side by side */}
          <div className="flex justify-between items-stretch gap-4 pt-1">
            {/* Right: Facility Grid */}
            <div className="flex-1 border border-black text-[11px] text-black bg-white">
              <div className="grid grid-cols-[120px_1fr_120px_1fr] text-center border-b border-black">
                <div className="bg-slate-50 p-2 font-bold border-l border-black">اسم المنشأة / 企业名称</div>
                <div className="p-2 text-right pr-3 font-black border-l border-black">{facilityName}</div>
                <div className="bg-slate-50 p-2 font-bold border-l border-black">رقم المنشأة / 企业社保号</div>
                <div className="p-2 font-mono font-bold text-xs">{facilityNumber}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr_120px_1fr] text-center">
                <div className="bg-slate-50 p-2 font-bold border-l border-black">المنطقة / 地区</div>
                <div className="p-2 text-right pr-3 border-l border-black">{regionName}</div>
                <div className="bg-slate-50 p-2 font-bold border-l border-black">مكتب / 办事处</div>
                <div className="p-2 text-right pr-3">{officeName}</div>
              </div>
            </div>

            {/* Left: Excel Limits Table replica */}
            <div className="border border-black text-[9px] font-bold text-black w-64 select-none bg-white">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-1 text-right border-l border-black text-slate-700 bg-slate-50">الحد الأدنى للأجر التأميني / 最低社保基数</td>
                    <td className="p-1 text-center font-mono w-20 bg-[#c5e0b4] text-black">2700.00</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 text-right border-l border-black text-orange-900 bg-orange-50">الحد الأقصى للأجر التأميني / 最高社保基数</td>
                    <td className="p-1 text-center font-mono w-20 bg-[#f8cbad] text-black">16700.00</td>
                  </tr>
                  <tr>
                    <td className="p-1 text-right border-l border-black text-blue-900 bg-blue-50">الحد الأقصى للأجر الشامل / 最高综合薪资</td>
                    <td className="p-1 text-center font-mono w-20 bg-[#b4c6e7] text-black">999999.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Centered Document Title bar */}
          <div className="text-center py-2 border-y border-double border-sky-800 my-1 bg-sky-50/20">
            <div className="text-xs font-black text-sky-950">
              طلب إشتراك منشأة أو إخطار تعديل أجور المؤمن عليهم / 企业参保登记或参保职工薪资变更申报表
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-sky-50/50 border border-sky-100 py-2.5 px-4 text-xs font-bold text-sky-950 rounded">
            <div className="text-right">
              إجمالي عدد المؤمن عليهم: <span className="text-emerald-700 font-black font-mono text-sm">{totalInsuredCount}</span> عاملاً / 参保总人数: {totalInsuredCount} 人
            </div>
            <div className="text-left">
              إجمالي الأجور التأمينية الشهرية بعد التعديل: <span className="text-emerald-700 font-black font-mono text-sm">{totalInsuranceWages.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span> ج.م / 调整后月度总基数: {totalInsuranceWages.toLocaleString("en-US", { minimumFractionDigits: 2 })} EGP
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse text-[11px] text-center mt-4">
            <thead>
              <tr className="bg-sky-900 text-white font-bold text-[10px]">
                <th className="border border-sky-800 p-2 w-[4%]">م / 序号</th>
                <th className="border border-sky-800 p-2 w-[8%]">الكود / 代码</th>
                <th className="border border-sky-800 p-2 w-[12%]">الرقم التأميني / 个人社保号</th>
                <th className="border border-sky-800 p-2 w-[28%] text-right pr-4">إسم المؤمن عليه / 参保人姓名</th>
                <th className="border border-sky-800 p-2 w-[18%]">الرقم القومي / 国民身份证号</th>
                <th className="border border-sky-800 p-2 w-[10%]">الأجر السابق / 原社保基数</th>
                <th className="border border-sky-800 p-2 w-[10%]">الأجر التأميني / 现社保基数</th>
                <th className="border border-sky-800 p-2 w-[10%]">الأجر الشامل / 综合总薪资</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec, idx) => (
                <tr key={rec.id} className="hover:bg-slate-50 odd:bg-slate-50/50">
                  <td className="border border-slate-300 p-2 font-mono">{idx + 1}</td>
                  <td className="border border-slate-300 p-2 font-mono font-bold text-slate-700">{rec.code}</td>
                  <td className="border border-slate-300 p-2 font-mono font-bold text-sky-950 text-xs">{rec.insuranceId}</td>
                  <td className="border border-slate-300 p-2 text-right pr-4 font-bold text-slate-900">{rec.fullName}</td>
                  <td className="border border-slate-300 p-2 font-mono text-slate-700">{rec.nationalId || "—"}</td>
                  <td className="border border-slate-300 p-2 font-mono text-slate-600">{rec.prevSalary.toFixed(2)}</td>
                  <td className="border border-slate-300 p-2 font-mono font-bold text-sky-800">{rec.currInsuranceSalary.toFixed(2)}</td>
                  <td className="border border-slate-300 p-2 font-mono font-bold text-emerald-800">{rec.currComprehensiveSalary.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-sky-100 font-black text-sky-950 text-[10px]">
                <td colSpan={5} className="border border-sky-800 p-2.5 text-left pl-6">الإجمالـــــــــــــــي بالكشــــف / 报表总计:</td>
                <td className="border border-sky-800 p-2.5 font-mono">{totalPrevSalaries.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                <td className="border border-sky-800 p-2.5 font-mono text-sky-900">{totalInsuranceWages.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                <td className="border border-sky-800 p-2.5 font-mono text-emerald-900">{totalComprehensiveWages.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-xs font-bold text-sky-950">
            <div className="text-center space-y-4">
              <p>مُعِد الكشف والمنظم / 经办人</p>
              <div className="h-10"></div>
              <p className="text-[10px] text-slate-400">التوقيع والاسم / 签字与姓名: ..........................</p>
            </div>
            <div className="text-center space-y-4">
              <p>مدير الموارد البشرية للمنشأة / 人力资源部经理</p>
              <div className="h-10"></div>
              <p className="text-[10px] text-slate-400">التوقيع والاسم / 签字与姓名: ..........................</p>
            </div>
            <div className="text-center space-y-4">
              <p>خاتم المنشأة الرسمي / 企业官方公章</p>
              <div className="h-10 w-24 mx-auto border-2 border-dashed border-sky-800 flex items-center justify-center text-[9px] text-sky-800 font-normal">
                موضع الختم الدائري / 盖章处
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-right animate-fadeIn" dir="rtl">
      
      {/* Toast alert internal */}
      {notification && (
        <div className={`fixed bottom-6 left-6 z-[99999] px-4 py-3.5 rounded-xl border flex items-center gap-2.5 shadow-2xl animate-bounce text-xs ${
          notification.type === "success" ? "bg-emerald-950 border-emerald-500/30 text-emerald-300" :
          notification.type === "error" ? "bg-rose-950 border-rose-500/30 text-rose-300" :
          "bg-blue-950 border-blue-500/30 text-blue-300"
        }`}>
          <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header section with Egyptian Social Insurance badge layout */}
      <div className="border border-slate-800 bg-slate-950 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-11 h-11 bg-sky-600/20 rounded-xl flex items-center justify-center border border-sky-500/30">
            <FileSpreadsheet className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100">سجلات التأمينات الإجتماعية للمؤمن عليهم / 参保员工社会保险档案</h2>
            <p className="text-[10px] text-slate-400 mt-1">إعداد ومراجعة استمارات تعديل الأجور والمطابقة مع مكتب تأمينات شرق القاهرة / 职工社保基数调整申报与开罗东区社保局对账系统</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <button
            onClick={openAddModal}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-950/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مؤمن عليه / 添加参保员工 👤</span>
          </button>
          <button
            onClick={handleSyncAllWorkers}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="مزامنة جميع الموظفين الـ 81 وتوليد تأمين مؤقت لهم / 同步全部81名员工并为其生成虚拟社保"
          >
            <RefreshCw className="w-4 h-4" />
            <span>استيراد وتأمين الـ 81 موظف / 导入并为81名员工投保 🔄</span>
          </button>
          <button
            onClick={() => setIsPrintPreview(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>تصدير نموذج الهيئة الرسمي / 导出官方申报表 🖨️</span>
          </button>
          <button
            onClick={handleResetToSeeds}
            className="text-[10px] font-bold text-amber-500 hover:text-amber-400 transition-all bg-amber-500/10 border border-amber-500/20 px-2.5 py-2 rounded-xl"
            title="إعادة ضبط قائمة التأمينات على الكشف الأصلي المرفق / 将社保名单重置为原始数据"
          >
            إعادة ضبط / 重置 ↩️
          </button>
        </div>
      </div>

      {/* Interactive Facility Details Editor */}
      <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl">
        <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span>بيانات المنشأة المسجلة بهيئة التأمينات (اضغط للتعديل والطباعة الفورية) / 社保登记企业信息（点击编辑并即时打印）:</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">اسم المنشأة في التأمينات / 社保登记企业名称</label>
            <input
              type="text"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs text-right font-semibold focus:border-sky-500/40 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">رقم المنشأة التأميني / 企业社保登记号</label>
            <input
              type="text"
              value={facilityNumber}
              onChange={(e) => setFacilityNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs text-center font-mono font-bold focus:border-sky-500/40 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">منطقة التأمينات / 社保地区</label>
            <input
              type="text"
              value={regionName}
              onChange={(e) => setRegionName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs text-right focus:border-sky-500/40 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">مكتب التأمينات التابع / 所属社保办公室</label>
            <input
              type="text"
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs text-right focus:border-sky-500/40 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Totals and Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold block">إجمالي عدد المؤمن عليهم بالكشف / 参保员工总人数</span>
          <span className="text-xl font-black text-slate-200 font-mono mt-1 block">{totalInsuredCount}</span>
          <span className="text-[9px] text-slate-400 mt-1 block">عامل مسجل بالتأمينات / 名社保已登记员工</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold block">إجمالي الأجور التأمينية السابقة / 变更前月度总基数</span>
          <span className="text-xl font-black text-slate-200 font-mono mt-1 block">
            {totalPrevSalaries.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[9px] text-slate-400 mt-1 block">جنيه مصري (شهري) / 埃镑 (月度)</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl border-r-4 border-r-sky-500">
          <span className="text-[10px] text-sky-400 font-bold block">إجمالي الأجور التأمينية بعد التعديل / 变更后月度总基数</span>
          <span className="text-xl font-black text-sky-400 font-mono mt-1 block">
            {totalInsuranceWages.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[9px] text-emerald-500 mt-1 block">الأجر الأساسي التأميني الكلي / 社保申报总基数</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl border-r-4 border-r-emerald-500">
          <span className="text-[10px] text-emerald-400 font-bold block">إجمالي الأجور الشاملة الشهرية / 职工实际月度总薪资</span>
          <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
            {totalComprehensiveWages.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[9px] text-slate-400 mt-1 block">الراتب الشامل الفعلي للمؤمن عليهم / 参保人实际综合总薪资</span>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="البحث باسم المؤمن عليه، الرقم القومي، الرقم التأميني، أو كود الموظف... / 按姓名、身份证号、社保号或员工代码搜索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-200 text-right focus:border-sky-500 outline-none transition-all placeholder:text-slate-600"
          />
          <Search className="w-4 h-4 text-slate-500 absolute top-3.5 right-3.5" />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="bg-slate-800 text-slate-400 hover:text-white px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer font-bold"
          >
            تفريغ البحث / 清除搜索 🧹
          </button>
        )}
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-950">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] font-bold">
              <th className="p-3 text-center w-[5%]">م / 序号</th>
              <th className="p-3 text-center w-[8%]">الكود / 代码</th>
              <th className="p-3 text-center w-[15%]">الرقم التأميني / 个人社保号</th>
              <th className="p-3 w-[25%] pr-4">إسم المؤمن عليه / 参保人姓名</th>
              <th className="p-3 text-center w-[18%]">الرقم القومي / 国民身份证号</th>
              <th className="p-3 text-center w-[10%]">الأجر السابق / 原社保基数</th>
              <th className="p-3 text-center w-[10%] text-sky-400">الأجر التأميني / 现社保基数</th>
              <th className="p-3 text-center w-[10%] text-emerald-400">الأجر الشامل / 综合总薪资</th>
              <th className="p-3 text-center w-[12%]">التحكم / 操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500 font-bold">
                  📭 لا توجد سجلات تأمينية مطابقة لبحثك. اضغط على استيراد أو إضافة للتعبئة الفورية。\n未找到匹配的社保记录。请点击导入或新增进行填充。
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec, idx) => (
                <tr key={rec.id} className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 text-center font-mono text-slate-600">{idx + 1}</td>
                  <td className="p-3 text-center font-mono font-bold">
                    <span className="bg-slate-800/80 text-slate-300 border border-slate-700/50 px-2 py-0.5 rounded text-[10px]">
                      {rec.code}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-sky-400 select-all tracking-wider text-[11px]">
                    {rec.insuranceId}
                  </td>
                  <td className="p-3 pr-4 font-bold text-slate-100">{rec.fullName}</td>
                  <td className="p-3 text-center font-mono text-slate-400 select-all">{rec.nationalId || "—"}</td>
                  <td className="p-3 text-center font-mono text-slate-500">{rec.prevSalary.toFixed(2)}</td>
                  <td className="p-3 text-center font-mono font-black text-sky-400 text-xs">{rec.currInsuranceSalary.toFixed(2)}</td>
                  <td className="p-3 text-center font-mono font-black text-emerald-400 text-xs">{rec.currComprehensiveSalary.toFixed(2)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(rec)}
                        className="p-1.5 bg-slate-800 hover:bg-sky-950 hover:text-sky-400 text-slate-400 rounded-lg transition-all cursor-pointer"
                        title="تعديل بيانات التأمين / 编辑社保信息"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(rec.id, rec.fullName)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-lg transition-all cursor-pointer"
                        title="حذف المؤمن عليه / 删除参保人"
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

      {/* Custom Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 text-right">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{editingRecord ? "✏️ تعديل بيانات مؤمن عليه / 编辑参保职工数据" : "👤 إضافة مؤمن عليه جديد للشركة / 新增参保职工"}</span>
              </h3>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              
              {/* Optional sync from 81 workers list */}
              {!editingRecord && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">المطابقة والاستيراد التلقائي من كشف العمال الـ 81 / 81名员工名单自动匹配与导入:</label>
                  <select
                    value={selectedWorkerCode}
                    onChange={(e) => handleWorkerSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-right cursor-pointer font-bold focus:border-indigo-500"
                  >
                    <option value="">-- اختر موظف من الكشف للمطابقة وملء البيانات فوراً / 从名单中选择员工进行快速匹配与填充 --</option>
                    {SEED_WORKERS.map(worker => {
                      const isAlreadyInsured = records.some(r => r.code === worker.code);
                      return (
                        <option key={worker.id} value={worker.code} className="py-1">
                          {worker.code} - {worker.fullName} {isAlreadyInsured ? " (مؤمن عليه حالياً / 当前已参保)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">الرقم التأميني (7-8 أرقام) / 个人社保号 (7-8位)</label>
                  <input
                    type="text"
                    required
                    value={insuranceId}
                    onChange={(e) => setInsuranceId(e.target.value.replace(/\D/g, ""))}
                    placeholder="مثال: 56183004"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-center font-mono font-bold focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">كود الموظف (الرمز الداخلي) / 员工代码 (内部标识)</label>
                  <input
                    type="text"
                    placeholder="مثال: Y1"
                    value={selectedWorkerCode}
                    onChange={(e) => setSelectedWorkerCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-center font-mono font-bold focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-bold">إسم المؤمن عليه بالكامل (كما ببطاقة الرقم القومي) / 参保职工全名 (须与身份证一致)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="الاسم الكامل بالعربية"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-right font-bold focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-bold">الرقم القومي (14 رقماً) / 国民身份证号 (14位)</label>
                <input
                  type="text"
                  maxLength={14}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                  placeholder="29603103100076"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-center font-mono focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">الأجر التأميني السابق / 原社保基数</label>
                  <input
                    type="number"
                    value={prevSalary}
                    onChange={(e) => setPrevSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold text-sky-400">الأجر التأميني الحالي / 现社保基数</label>
                  <input
                    type="number"
                    value={currInsuranceSalary}
                    onChange={(e) => setCurrInsuranceSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-center font-mono font-bold border-sky-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold text-emerald-400">الأجر الشامل الفعلي / 实际综合薪资</label>
                  <input
                    type="number"
                    value={currComprehensiveSalary}
                    onChange={(e) => setCurrComprehensiveSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none text-center font-mono font-bold border-emerald-500/30"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all"
                >
                  إلغاء / 取消 🚫
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer transition-all shadow-lg"
                >
                  {editingRecord ? "حفظ التعديلات والتحديث / 保存修改并更新 ✅" : "إضافة وتأمين العامل الفوري / 立即添加并投保员工 ✅"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
