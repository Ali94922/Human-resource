import React, { useState, useRef } from "react";
import { Sparkles, Upload, Loader2, PlusCircle, Check, HelpCircle, FileText, RefreshCw, Trash2, Code, FileCode, Download, FileDown } from "lucide-react";
import { defaultDailyTemplate, defaultPermanentTemplate } from "../data/defaultTemplates";
import { ContractType } from "../types";
import * as mammoth from "mammoth";

interface TemplateManagerProps {
  contractType: ContractType;
  dailyTemplate: string;
  permanentTemplate: string;
  setDailyTemplate: (val: string) => void;
  setPermanentTemplate: (val: string) => void;
  onTemplateUpdated: (msg: string) => void;
}

export default function TemplateManager({
  contractType,
  dailyTemplate,
  permanentTemplate,
  setDailyTemplate,
  setPermanentTemplate,
  onTemplateUpdated
}: TemplateManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const activeTemplate = contractType === "daily" ? dailyTemplate : permanentTemplate;
  const setActiveTemplate = contractType === "daily" ? setDailyTemplate : setPermanentTemplate;

  const placeholders = [
    { tag: "{{الاسم_الكامل}}", label: "اسم الموظف" },
    { tag: "{{الرقم_القومي}}", label: "الرقم القومي" },
    { tag: "{{العنوان}}", label: "العنوان الحالي" },
    { tag: "{{الوظيفة}}", label: "المسمى الوظيفي" },
    { tag: "{{المؤهل}}", label: "المؤهل الدراسي" },
    { tag: "{{تاريخ_الميلاد}}", label: "تاريخ الميلاد" },
    { tag: "{{المحافظة}}", label: "محافظة الميلاد" },
    { tag: "{{النوع}}", label: "النوع (ذكر/أنثى)" },
    { tag: "{{صادر_بتاريخ}}", label: "رقم الصادر في ظهر البطاقة" },
    { tag: "{{الأجر}}", label: "الأجر اليومي" },
    { tag: "{{الراتب_الشهري}}", label: "الراتب الشهري" },
    { tag: "{{ساعات_العمل}}", label: "ساعات العمل" },
    { tag: "{{تاريخ_البداية}}", label: "تاريخ بداية العمل" },
    { tag: "{{تاريخ_النهاية}}", label: "تاريخ انتهاء العمل" },
    { tag: "{{يوم}}", label: "يوم البدء (مثل السبت، الأحد)" },
    { tag: "{{اسم_الشركة}}", label: "اسم الشركة المتعاقد معها" },
    { tag: "{{عنوان_الشركة}}", label: "عنوان الشركة" },
    { tag: "{{سجل_تجاري}}", label: "رقم السجل التجاري" },
    { tag: "{{بطاقة_ضريبية}}", label: "رقم البطاقة الضريبية" },
    { tag: "{{ممثل_الشركة}}", label: "ممثل الشركة مفوض التوقيع" },
    { tag: "{{صفة_ممثل_الشركة}}", label: "صفة ممثل الشركة" },
    { tag: "{{موقع_المشروع}}", label: "موقع المشروع/العمل" },
    { tag: "{{اليوم}}", label: "تاريخ اليوم" }
  ];

  const handlePlaceholderClick = (tag: string) => {
    setActiveTemplate(activeTemplate + " " + tag);
    onTemplateUpdated(`تمت إضافة الكلمة المفتاحية ${tag} بنجاح!`);
  };

  const handleReset = () => {
    askConfirmation(
      "🔄 إعادة ضبط القالب",
      "هل أنت متأكد من رغبتك في إعادة ضبط هذا النموذج إلى الصيغة الافتراضية؟",
      () => {
        if (contractType === "daily") {
          setDailyTemplate(defaultDailyTemplate);
        } else {
          setPermanentTemplate(defaultPermanentTemplate);
        }
        onTemplateUpdated("تمت إعادة ضبط النموذج للافتراضي.");
      }
    );
  };

  const handleDownloadTemplate = (type: "daily" | "permanent", format: "txt" | "word" | "pdf" = "txt") => {
    const content = type === "daily" ? dailyTemplate : permanentTemplate;
    const isWord = format === "word";
    const isPdf = format === "pdf";

    if (isPdf) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html dir="rtl" lang="ar">
            <head>
              <title>صيغة قالب عقد - ${type === "daily" ? "اليومية" : "الثابت"}</title>
              <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
              <style>
                body {
                  font-family: 'Cairo', sans-serif;
                  padding: 40px;
                  color: #1e293b;
                  line-height: 1.8;
                  background-color: #ffffff;
                }
                .template-card {
                  max-width: 800px;
                  margin: 0 auto;
                  white-space: pre-wrap;
                  text-align: justify;
                  font-size: 14px;
                  border: 1px solid #e2e8f0;
                  padding: 30px;
                  border-radius: 8px;
                }
                @media print {
                  body { padding: 0; margin: 0; }
                  .template-card { border: none; padding: 0; }
                  @page { size: A4; margin: 20mm; }
                }
              </style>
            </head>
            <body>
              <div class="template-card">
                <h2 style="text-align: center; color: #4f46e5; margin-bottom: 25px;">
                  قالب عقد ${type === "daily" ? "العمل المؤقت / اليومية (مؤسسة الطارق)" : "العمل السنوي / الثابت (شركة يواندا)"}
                </h2>
                ${content.replace(/\n/g, "<br/>")}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        onTemplateUpdated(`تم فتح نافذة طباعة/حفظ قالب العقد كـ PDF بنجاح!`);
      }
      return;
    }

    const extension = isWord ? "doc" : "txt";
    const mimeType = isWord ? "application/msword;charset=utf-8" : "text/plain;charset=utf-8";
    const filename = type === "daily" 
      ? `قالب_عقد_اليومية_الطارق.${extension}` 
      : `قالب_العقد_الثابت_يواندا.${extension}`;
    
    const element = document.createElement("a");
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onTemplateUpdated(`تم تحميل ملف القالب بنجاح بصيغة ${isWord ? "Word" : "نصية"}: ${filename}`);
  };

  // Dynamically load pdfjsLib from CDN to avoid complex Vite worker compilation
  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
      script.onload = () => {
        const pdfjs = (window as any).pdfjsLib;
        pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
        resolve(pdfjs);
      };
      script.onerror = () => {
        reject(new Error("فشل تحميل مكتبة قراءة ملفات PDF من الخادم السحابي."));
      };
      document.head.appendChild(script);
    });
  };

  // Upload and read .txt, .docx or .pdf file
  const handleTemplateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith(".docx")) {
      setIsUploading(true);
      setError(null);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (arrayBuffer) {
          try {
            const result = await mammoth.extractRawText({ arrayBuffer });
            if (result && result.value) {
              setActiveTemplate(result.value);
              onTemplateUpdated("تم قراءة واستخراج صيغة العقد بنجاح من ملف الوورد (Word DOCX)!");
              setError(null);
            } else {
              setError("الملف فارغ أو لا يحتوي على نصوص قابلة للقراءة.");
            }
          } catch (err: any) {
            console.error("Mammoth error:", err);
            setError("فشل استخراج النصوص من ملف Word (.docx). يرجى التأكد من أن الملف غير تالف.");
          } finally {
            setIsUploading(false);
          }
        }
      };
      reader.onerror = () => {
        setError("فشل قراءة ملف الوورد.");
        setIsUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith(".pdf")) {
      setIsUploading(true);
      setError(null);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (arrayBuffer) {
          try {
            const pdfjs = await loadPdfJs();
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            let extractedText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(" ");
              extractedText += pageText + "\n";
            }

            if (extractedText.trim()) {
              setActiveTemplate(extractedText);
              onTemplateUpdated("تم استخراج وقراءة صيغة العقد بنجاح من ملف PDF!");
              setError(null);
            } else {
              setError("لم نتمكن من العثور على نصوص قابلة للقراءة في ملف PDF. قد يكون الملف عبارة عن صورة ممسوحة ضوئياً، يرجى استخدام ميزة المسح بالذكاء الاصطناعي في هذه الحالة.");
            }
          } catch (err: any) {
            console.error("PDF extraction error:", err);
            setError("فشل قراءة واستخراج النص من ملف PDF. يرجى التأكد من أن الملف سليم ويحتوي على نصوص وليس مجرد صورة.");
          } finally {
            setIsUploading(false);
          }
        }
      };
      reader.onerror = () => {
        setError("فشل قراءة ملف PDF.");
        setIsUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith(".txt")) {
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setActiveTemplate(text);
          onTemplateUpdated("تم تحميل صيغة العقد بنجاح من الملف النصي!");
          setError(null);
        }
      };
      reader.onerror = () => {
        setError("فشل قراءة الملف النصي.");
      };
      reader.readAsText(file);
    } else {
      setError("صيغة الملف غير مدعومة. يرجى رفع ملف نصي (.txt)، ملف وورد (.docx)، أو ملف بي دي إف (.pdf).");
    }
  };

  // Convert image to Base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Str = reader.result as string;
        resolve(base64Str.split(",")[1]);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Upload contract image/scanned form to Gemini to parse into placeholder template
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("يرجى رفع ملف صورة صالح لمسح النموذج.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type;

      const response = await fetch("/api/template/parse-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data, mimeType })
      });

      if (!response.ok) {
        throw new Error("حدث خطأ أثناء معالجة الصورة في الخادم السحابي.");
      }

      const resData = await response.json();
      if (resData.success && resData.data?.templateText) {
        setActiveTemplate(resData.data.templateText);
        onTemplateUpdated("تم قراءة وتحليل صورة العقد بنجاح وتحويلها لقالب بذكاء اصطناعي!");
      } else {
        throw new Error("فشل توليد القالب. يرجى التأكد من وضوح نص العقد بالصورة.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "فشلت معالجة العقد بالذكاء الاصطناعي.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-right">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 justify-end">
            <FileCode className="w-5 h-5 text-indigo-400" />
            التحكم في صيغة قوالب العقود
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ارفع نموذج عقد بصيغة <span className="font-mono text-indigo-400 font-bold">.docx / .pdf / .txt</span> أو صور العقد ليقوم الذكاء الاصطناعي بصياغته!
          </p>
        </div>
        
        <button
          onClick={handleReset}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          title="إعادة ضبط الصيغة للافتراضية"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          إعادة الضبط
        </button>
      </div>

      {/* Upload Controls Box */}
      <div className="grid grid-cols-2 gap-4">
        {/* Upload text, docx or pdf template file */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleTemplateFileUpload}
            accept=".txt,.docx,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 rounded-xl bg-slate-950/50 text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-bold text-slate-300">رفع ملف (.docx / .pdf / .txt)</span>
            <span className="text-[10px] text-slate-500">تحميل قالب وورد، PDF، أو نصي مباشرة</span>
          </button>
        </div>

        {/* Upload scanned image contract */}
        <div>
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-full h-24 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 rounded-xl bg-slate-950/50 text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-bold text-slate-300">مسح صورة عقد بالذكاء الاصطناعي</span>
            <span className="text-[10px] text-slate-500">استخراج القالب والبنود فوراً</span>
          </button>
        </div>
      </div>

      {/* Download Current Templates Section */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-4 text-right">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            التحرير والتحميل المتقدم
          </span>
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 justify-end">
            تصدير وتنزيل قوالب العقود النشطة:
            <Download className="w-4 h-4 text-indigo-400" />
          </h4>
        </div>

        <div className="space-y-3">
          {/* Daily contract download options */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 block">عقد العمل المؤقت / اليومية (مؤسسة الطارق)</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDownloadTemplate("daily", "word")}
                className="flex items-center justify-center gap-1 p-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/15 hover:border-indigo-500/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                Word (.doc)
              </button>
              <button
                type="button"
                onClick={() => handleDownloadTemplate("daily", "pdf")}
                className="flex items-center justify-center gap-1 p-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-500/15 hover:border-rose-500/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                PDF
              </button>
              <button
                type="button"
                onClick={() => handleDownloadTemplate("daily", "txt")}
                className="flex items-center justify-center gap-1 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                نصي (.txt)
              </button>
            </div>
          </div>

          {/* Permanent contract download options */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 block">عقد العمل السنوي / الثابت (شركة يواندا)</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDownloadTemplate("permanent", "word")}
                className="flex items-center justify-center gap-1 p-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/15 hover:border-indigo-500/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                Word (.doc)
              </button>
              <button
                type="button"
                onClick={() => handleDownloadTemplate("permanent", "pdf")}
                className="flex items-center justify-center gap-1 p-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-500/15 hover:border-rose-500/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                PDF
              </button>
              <button
                type="button"
                onClick={() => handleDownloadTemplate("permanent", "txt")}
                className="flex items-center justify-center gap-1 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                نصي (.txt)
              </button>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 leading-normal text-right">
          💡 <strong>المرونة والتوافق:</strong> يمكنك الآن تنزيل الصيغ النشطة وتصديرها كملفات <strong>Word (.doc)</strong>، أو ملفات <strong>PDF</strong> جاهزة للطباعة والمراجعة الورقية، أو ملفات <strong>نصية (.txt)</strong>. كما يدعم النظام رفع واستخراج النصوص تلقائياً من صيغ <strong>Word (.docx)</strong>، <strong>PDF</strong>، أو <strong>TXT</strong> مباشرة!
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Text Editor Area */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-300">
          <span>محرر الصيغة القانونية للعقد الحالية:</span>
          <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md text-[10px]">
            {contractType === "daily" ? "عقد اليومية" : "العقد الثابت"}
          </span>
        </div>
        
        <textarea
          value={activeTemplate}
          onChange={(e) => setActiveTemplate(e.target.value)}
          placeholder="اكتب صيغة العقد هنا واستخدم الكلمات المفتاحية بالأسفل..."
          className="w-full h-[280px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed custom-scrollbar text-right"
        />
      </div>

      {/* Placeholders helper chips */}
      <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
        <h4 className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
          الكلمات المفتاحية المتاحة (اضغط للإدراج في نهاية النص):
          <Code className="w-4 h-4 text-indigo-400" />
        </h4>
        <p className="text-[10px] text-slate-500 leading-normal">
          تستخدم الكلمات المفتاحية بالأسفل لملئ بيانات الموظف والشركة تلقائياً في العقد بمجرد فك ترميز الرقم القومي أو رفعه. يمكنك كتابتها بأي مكان بالنموذج.
        </p>

        <div className="flex flex-wrap gap-2 justify-start max-h-[140px] overflow-y-auto custom-scrollbar p-1">
          {placeholders.map((item) => (
            <button
              key={item.tag}
              onClick={() => handlePlaceholderClick(item.tag)}
              className="text-[10px] bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700/80 hover:border-indigo-500 transition-all font-mono font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>{item.label}</span>
              <span className="text-indigo-400 font-semibold group-hover:text-white">{item.tag}</span>
            </button>
          ))}
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
