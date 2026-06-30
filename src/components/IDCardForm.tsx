import React, { useState, useRef, useEffect } from "react";
import { Upload, Loader2, Sparkles, User, FileDigit, Calendar, MapPin, Briefcase, DollarSign, Clock, HelpCircle, FileText, Check, AlertCircle, Phone } from "lucide-react";
import { ContractFormData, ContractType, ContractorType, EgyptianIDData } from "../types";

interface IDCardFormProps {
  formData: ContractFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContractFormData>>;
  onAutoFilled: () => void;
  onSaveUpdatedContract?: () => void;
}

export default function IDCardForm({ formData, setFormData, onAutoFilled, onSaveUpdatedContract }: IDCardFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotating loading messages
  useEffect(() => {
    if (!isUploading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [isUploading]);

  // Monitor National ID input changes to trigger instant auto-decoding!
  const handleNationalIdChange = async (val: string) => {
    // Only keep numeric digits
    const cleanNum = val.replace(/\D/g, "");
    if (cleanNum.length > 14) return;

    setFormData((prev) => ({ ...prev, nationalId: cleanNum }));
    setDecodeError(null);

    // If we have exactly 14 digits, invoke the decode API!
    if (cleanNum.length === 14) {
      try {
        const response = await fetch("/api/id-card/decode-number", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nationalId: cleanNum })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.data) {
            const { dateOfBirth, governorate, gender } = resData.data;
            setFormData((prev) => ({
              ...prev,
              dateOfBirth,
              governorate,
              gender
            }));
            onAutoFilled();
          }
        } else {
          setDecodeError("عذراً، الرقم القومي غير صالح أو غير معترف برموز ترميزه.");
        }
      } catch (err) {
        console.error("Decode error:", err);
      }
    }
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

  const handleFileUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      setUploadError("يرجى رفع ملف صورة صالح (PNG, JPG, JPEG) أو ملف PDF لبطاقة الرقم القومي.");
      return;
    }

    setIsUploading(true);
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
        let errorMsg = "حدث خطأ أثناء قراءة بطاقة الرقم القومي بواسطة الذكاء الاصطناعي.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const payload: EgyptianIDData = resData.data;
        setFormData((prev) => ({
          ...prev,
          fullName: payload.fullName || prev.fullName,
          nationalId: payload.nationalId || prev.nationalId,
          address: payload.address || prev.address,
          jobTitle: payload.jobTitle || prev.jobTitle,
          dateOfBirth: payload.dateOfBirth || prev.dateOfBirth,
          governorate: payload.governorate || prev.governorate,
          gender: payload.gender || prev.gender,
          cardIssueDate: payload.cardIssueDate || prev.cardIssueDate,
        }));
        onAutoFilled();
      } else {
        throw new Error("لم تكتمل قراءة البيانات. يرجى مراجعة جودة الصورة وإعادة المحاولة.");
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "فشلت عملية مسح البطاقة الشخصية. يرجى ملء البيانات يدوياً.");
    } finally {
      setIsUploading(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Switch Employer depending on Contract Type
  const handleContractTypeChange = (type: ContractType) => {
    setFormData((prev) => ({
      ...prev,
      contractType: type,
      employer: type === "daily" ? "altariq" : "yuanda_permanent",
      dailyWage: type === "daily" ? 250 : undefined,
      monthlySalary: type === "permanent" ? 6000 : undefined,
    }));
  };

  // Load a quick Egyptian mock National ID to demonstrate
  const handleLoadDemo = () => {
    const mockID = "29408151203487"; // April 15, 1994, Dakahlia, Male
    setFormData((prev) => ({
      ...prev,
      fullName: "محمد أحمد محمود سليمان",
      nationalId: mockID,
      phoneNumber: "01023456789",
      address: "المنصورة، حي الجامعة، شارع جلال الدين، عمارة السلام",
      jobTitle: "فني تركيبات وتوصيلات هندسية",
      dateOfBirth: "1994-08-15",
      governorate: "الدقهلية",
      gender: "ذكر",
      contractType: "daily",
      employer: "altariq",
      dailyWage: 320,
      workingHours: 8,
      startDate: new Date().toISOString().split("T")[0],
      notes: "يلتزم العامل بتقديم تقرير يومي لمهندس الموقع عن إنجاز الأعمال الإنشائية المسندة."
    }));
    onAutoFilled();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-right">
      
      {/* 1. Header with Instructions */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 justify-end">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            تعبئة بيانات العقد تلقائياً
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            قم بتصوير أو رفع بطاقة الرقم القومي، أو اكتب الرقم القومي لفك شفرته تلقائياً
          </p>
        </div>
        <button
          onClick={handleLoadDemo}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400/60 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          تحميل بيانات تجريبية
        </button>
      </div>

      {formData.id && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-right flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fadeIn">
          <div>
            <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-md">حالة تعديل العقد ⚠️</span>
            <p className="text-xs font-bold text-white mt-1.5">أنت الآن تقوم بتعديل وتحديث بيانات عقد مسجل مسبقاً بالأرشيف.</p>
            <p className="text-[10px] text-slate-400 mt-1">سيتم استبدال وحفظ التعديلات الجديدة مباشرة عند النقر على "حفظ وتحديث" أو الطباعة.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, id: undefined }));
            }}
            className="text-[10px] font-bold text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500/50 bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer self-start sm:self-center"
          >
            إلغاء التعديل والبدء كعقد جديد 🆕
          </button>
        </div>
      )}

      {/* 2. Upload Area for Egyptian ID Card */}
      <div>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 bg-slate-950/40 flex flex-col items-center justify-center ${
            isDragging
              ? "border-indigo-500 bg-indigo-950/20 scale-98"
              : "border-slate-700 hover:border-indigo-400/80 hover:bg-slate-950/70"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept="image/*,application/pdf"
            className="hidden"
          />

          {isUploading ? (
            <div className="space-y-4 py-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 bg-indigo-500/10 rounded-full animate-ping"></div>
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin relative z-10" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-slate-200">
                  {loadingStep === 0 && "⏳ جاري رفع وقراءة ملف البطاقة..."}
                  {loadingStep === 1 && "🧠 جاري تحليل الحروف والبيانات بذكاء..."}
                  {loadingStep === 2 && "🔍 جاري استخراج الاسم، الوظيفة، والعنوان بدقة..."}
                  {loadingStep === 3 && "✨ جاري فك ترميز الحقول وتدقيق البيانات..."}
                </h4>
                
                {/* Visual steps indicator */}
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {[0, 1, 2, 3].map((step) => (
                    <div 
                      key={step} 
                      className={`h-1.5 rounded-full transition-all duration-350 ${
                        step === loadingStep ? "w-6 bg-indigo-500" : "w-1.5 bg-slate-800"
                      }`}
                    ></div>
                  ))}
                </div>

                <p className="text-[11px] text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg inline-block animate-pulse">
                  ⚠️ يرجى التأكد من وضوح الصورة/ملف الـ PDF لتسهيل القراءة.
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  يقوم نموذج الذكاء الاصطناعي بمعالجة الملف محلياً واستخراج البيانات بالكامل لتوفير وقت الكتابة اليدوية.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-300">اسحب صورة وجه/ظهر البطاقة أو ملف PDF هنا</h4>
              <p className="text-[10px] text-slate-500">صيغ PNG, JPG, JPEG أو ملفات PDF مدعومة</p>
              <span className="mt-3 inline-block text-[10px] font-bold text-white bg-indigo-600 px-2.5 py-1.5 rounded-md hover:bg-indigo-700 transition-colors">
                اختر ملف من جهازك
              </span>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl space-y-3 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-rose-400">عذراً! فشلت قراءة بيانات البطاقة:</p>
                <p className="text-[11px] leading-relaxed text-rose-300/90">{uploadError}</p>
              </div>
            </div>
            
            <div className="pt-2.5 border-t border-rose-500/20 text-right space-y-1.5">
              <p className="font-bold text-[11px] text-slate-300 flex items-center gap-1 justify-end">
                <span>💡 نصائح هامة للمسح الضوئي الناجح:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-[10px] text-slate-400 pr-2">
                <li>التقط الصورة في إضاءة واضحة وموزعة جيداً (تجنب فلاش الكاميرا المباشر أو الظلال الشديدة).</li>
                <li>تأكد من أن جميع الحروف والأرقام واضحة وغير مشوشة أو مهتزة.</li>
                <li>ضع البطاقة أفقياً مستقيمة في إطار الصورة دون قطع لأي من حوافها.</li>
                <li>إذا استمر الخطأ، يمكنك دائماً كتابة البيانات يدوياً وبسهولة في الخانات أدناه.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 3. Contract Type Selection (Daily vs Fixed) */}
      <div className="grid grid-cols-2 gap-4 p-1 bg-slate-950 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => handleContractTypeChange("permanent")}
          className={`py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            formData.contractType === "permanent"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          عقد موظف ثابت (شركة يواندا)
        </button>
        <button
          type="button"
          onClick={() => handleContractTypeChange("daily")}
          className={`py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            formData.contractType === "daily"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          عقد يومية (مقاولين / يومية)
        </button>
      </div>

      {/* 4. Employer Selection depend on Contract Type */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300">الشركة المتعاقد معها (الطرف الأول):</label>
        {formData.contractType === "daily" ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, employer: "altariq" }))}
              className={`p-3 border rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                formData.employer === "altariq"
                  ? "bg-slate-800 border-indigo-500 text-white shadow-inner"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              مقاولين الطارق
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, employer: "yuanda" }))}
              className={`p-3 border rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                formData.employer === "yuanda"
                  ? "bg-slate-800 border-indigo-500 text-white shadow-inner"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              شركة يواندا (يومية)
            </button>
          </div>
        ) : (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-indigo-400 text-center">
            شركة يواندا الصينية للمقاولات والتطوير (عقد ثابت)
          </div>
        )}
      </div>

      {/* 5. Form Fields with Icons */}
      <div className="space-y-4">
        
        {/* National ID manual input & auto decoder */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1.5">
            <span className="text-[10px] text-slate-500 font-normal">(14 رقم لكشف تاريخ الميلاد والمحافظة تلقائياً)</span>
            <span>الرقم القومي المصري</span>
            <FileDigit className="w-4 h-4 text-slate-400" />
          </label>
          <input
            type="text"
            maxLength={14}
            value={formData.nationalId}
            onChange={(e) => handleNationalIdChange(e.target.value)}
            placeholder="اكتب 14 رقم باللغة الإنجليزية"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white text-left focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono tracking-wider"
          />
          {decodeError && (
            <p className="text-[10px] text-rose-400 mt-1">{decodeError}</p>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1.5">
            الاسم الرباعي بالكامل
            <User className="w-4 h-4 text-slate-400" />
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="الاسم الرباعي كما هو ببطاقة الرقم القومي"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1.5">
            رقم الهاتف المحمول (موبايل)
            <Phone className="w-4 h-4 text-slate-400" />
          </label>
          <input
            type="text"
            maxLength={11}
            value={formData.phoneNumber || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setFormData((prev) => ({ ...prev, phoneNumber: val }));
            }}
            placeholder="مثال: 01012345678"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-left tracking-wider"
          />
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1.5">
            العنوان السكني الحالي بالتفصيل
            <MapPin className="w-4 h-4 text-slate-400" />
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="المحافظة، المركز، اسم الشارع ورقم العقار"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Job Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1.5">
            المسمى الوظيفي أو المهنة
            <Briefcase className="w-4 h-4 text-slate-400" />
          </label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
            placeholder="مثال: عامل حفر، سائق كلارك، فني كهرباء، إلخ"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Qualification (only shown or prioritized for permanent contract) */}
        <div className="space-y-1.5 animate-fadeIn">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1.5">
            المؤهل الدراسي
            <span className="text-[10px] text-indigo-400 font-normal">(مطلوب لعقود يواندا الثابتة)</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </label>
          <input
            type="text"
            value={formData.qualification || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, qualification: e.target.value }))}
            placeholder="مثال: بكالوريوس هندسة، دبلوم صنايع، إلخ"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Card Issue Date / Code (رقم الصادر) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1.5">
            رقم الصادر (في ظهر البطاقة مثل 2/2026)
            <span className="text-[10px] text-slate-500 font-normal">(صادر بتاريخ)</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </label>
          <input
            type="text"
            value={formData.cardIssueDate || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, cardIssueDate: e.target.value }))}
            placeholder="مثال: 2/2026 أو 12/2023"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-left font-mono tracking-wide"
          />
        </div>

        {/* Decode Details Grid: DoB, Governorate, Gender */}
        <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-slate-500 block">النوع</span>
            <span className="text-xs text-white font-bold">{formData.gender || "—"}</span>
          </div>
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-slate-500 block">محافظة الميلاد</span>
            <span className="text-xs text-white font-bold">{formData.governorate || "—"}</span>
          </div>
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-slate-500 block">تاريخ الميلاد</span>
            <span className="text-xs text-white font-mono font-bold">{formData.dateOfBirth || "—"}</span>
          </div>
        </div>

        {/* Start Date & End Date Grid */}
        <div className="grid grid-cols-2 gap-3">
          {formData.contractType === "permanent" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">تاريخ انتهاء التعاقد:</label>
              <input
                type="date"
                value={formData.endDate || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-left font-mono"
              />
            </div>
          )}
          <div className={`${formData.contractType === "daily" ? "col-span-2" : "col-span-1"} space-y-1.5`}>
            <label className="text-xs font-bold text-slate-300 block">تاريخ مباشرة العمل (الطرفين):</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-left font-mono"
            />
          </div>
        </div>

        {/* Wage / Salary & Hours Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1">
              ساعات العمل اليومية
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <input
              type="number"
              value={formData.workingHours}
              onChange={(e) => setFormData((prev) => ({ ...prev, workingHours: parseInt(e.target.value) || 8 }))}
              placeholder="8"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white text-center focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1">
              {formData.contractType === "daily" ? "الأجر اليومي (بالجنيه)" : "الراتب الشهري (بالجنيه)"}
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <input
              type="number"
              value={formData.contractType === "daily" ? (formData.dailyWage || "") : (formData.monthlySalary || "")}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setFormData((prev) =>
                  formData.contractType === "daily"
                    ? { ...prev, dailyWage: val }
                    : { ...prev, monthlySalary: val }
                );
              }}
              placeholder={formData.contractType === "daily" ? "250" : "6000"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white text-center focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Written Custom Amount (Arabic wording or custom layout) */}
        <div className="space-y-1.5 animate-fadeIn">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1.5">
            المبلغ المالي المكتوب في العقد (اختياري)
            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
          </label>
          <input
            type="text"
            value={formData.customAmount || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, customAmount: e.target.value }))}
            placeholder="مثال: فقط وقدره مائتان وخمسون جنيهاً مصرياً لا غير"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white text-right focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans"
          />
          <p className="text-[10px] text-slate-500 text-right mt-0.5">
            💡 إذا تركت هذه الخانة فارغة، سيقوم النظام تلقائياً بكتابة المبلغ الرقمي المدخل أعلاه مع إضافة عبارة "جنيهاً مصرياً".
          </p>
        </div>

        {/* Special Notes / Terms */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">شروط إضافية أو ملاحظات:</label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="اكتب أي ملاحظات أو شروط خاصة ترغب بإضافتها في البند السادس للعقد..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
          />
        </div>

        {formData.id && onSaveUpdatedContract && (
          <button
            type="button"
            onClick={onSaveUpdatedContract}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1.5 mt-2 animate-pulse"
          >
            <Check className="w-4 h-4" />
            حفظ وتحديث بيانات العقد في الأرشيف 💾
          </button>
        )}

      </div>

    </div>
  );
}
