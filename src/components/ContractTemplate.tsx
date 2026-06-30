import React, { useRef, useState } from "react";
import { Printer, Download, CheckCircle2, ShieldCheck, FileText, FileDown, Info, HelpCircle, X, Share2, Sparkles, RefreshCw } from "lucide-react";
import { ContractFormData } from "../types";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface ContractTemplateProps {
  data: ContractFormData;
  activeTemplateText: string;
  onContractPrinted?: () => void;
  onResetTemplates?: () => void;
}

export default function ContractTemplate({ data, activeTemplateText, onContractPrinted, onResetTemplates }: ContractTemplateProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [showPdfGuide, setShowPdfGuide] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleShareWhatsApp = () => {
    if (!data.fullName) {
      alert("يرجى ملء بيانات الموظف أولاً لتتمكن من مشاركتها.");
      return;
    }

    const wageText = data.contractType === "daily" 
      ? `الأجر اليومي: ${data.dailyWage || 0} ج.م` 
      : `الراتب الشهري: ${data.monthlySalary || 0} ج.م`;

    const employerText = data.employer === "altariq"
      ? "مؤسسة الطارق للمقاولات العمومية"
      : "شركة يواندا الصينية للتطوير والمقاولات ش.م.م";

    const text = `*تفاصيل عقد العمل الجديد* 📝\n\n` +
      `👤 *الاسم:* ${data.fullName}\n` +
      `🆔 *الرقم القومي:* ${data.nationalId || "غير محدد"}\n` +
      `📞 *رقم الهاتف:* ${data.phoneNumber || "غير محدد"}\n` +
      `💼 *الوظيفة:* ${data.jobTitle || "غير محدد"}\n` +
      `🏢 *الشركة:* ${employerText}\n` +
      `📅 *تاريخ البدء:* ${data.startDate || "غير محدد"}\n` +
      `💰 *الأجر/الراتب:* ${wageText}\n\n` +
      `*تم إنشاء العقد وتدقيقه آلياً بنجاح عبر النظام الذكي 🚀*`;

    const encodedText = encodeURIComponent(text);
    const url = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, "_blank");
  };

  const getEmployerName = () => {
    if (data.employer === "altariq") {
      return "الطارق للاستثمار العقاري والتوريدات العموميه والمقاولات";
    }
    return "شركة يواندا للمقاولات و الخدمات التجاريه";
  };

  const getEmployerCR = () => {
    if (data.employer === "altariq") {
      return "137843";
    }
    return "207375";
  };

  const getEmployerTaxCard = () => {
    if (data.employer === "altariq") {
      return "719/329/469";
    }
    return "752/703/218";
  };

  const getEmployerAddress = () => {
    if (data.employer === "altariq") {
      return "9 شارع طلعت نعيم – منطقة حدائق حلوان – مدينة حلوان – القاهرة";
    }
    return "فيلا 3 – منطقه 12024 – ش الامام البصيري – التجمع الاول";
  };

  const getEmployerRep = () => {
    if (data.employer === "altariq") {
      return "طارق سيد محمد حسن";
    }
    return "---------------------------------";
  };

  const getEmployerRepTitle = () => {
    if (data.employer === "altariq") {
      return "صاحب المنشأه";
    }
    return "مدير فرع او ما ينوب عنه";
  };

  const getProjectLocation = () => {
    if (data.employer === "altariq") {
      return "الشيخ فضل -رأس غارب";
    }
    return "غرب بكر (الشمالي)";
  };

  const formattedDate = (dateStr: string) => {
    if (!dateStr) return "____/__/__";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const getWageOrSalary = () => {
    if (data.customAmount && data.customAmount.trim() !== "") {
      return data.customAmount;
    }
    if (data.contractType === "daily") {
      return (data.dailyWage || "___") + " جنيهاً مصرياً";
    } else {
      return (data.monthlySalary || "_____") + " جنيهاً مصرياً";
    }
  };

  // Parser helper to replace placeholders in real-time
  const parseContractText = () => {
    let text = activeTemplateText || "";
    
    // Helper to replace both {{tag}} and »tag« / »tag_« formats
    const replacePlaceholder = (tagAr: string[], replacement: string) => {
      // 1. Double curly braces: {{tagAr}}
      for (const ar of tagAr) {
        const regexCurly = new RegExp(`\\{\\{${ar}\\}\\}`, 'g');
        text = text.replace(regexCurly, replacement);
      }
      // 2. Arabic Guillemets: »tagAr« or »tagAr_«
      for (const ar of tagAr) {
        const regexGuill1 = new RegExp(`»${ar}«`, 'g');
        const regexGuill2 = new RegExp(`»${ar}_«`, 'g');
        text = text.replace(regexGuill1, replacement);
        text = text.replace(regexGuill2, replacement);
      }
    };

    const getArabicDayName = (dateStr: string) => {
      if (!dateStr) return "_________";
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ar-EG", { weekday: "long" });
      } catch {
        return "_________";
      }
    };

    replacePlaceholder(["الاسم_الكامل", "الاسم", "السيد", "السيد/السيدة", "طرف_الثاني", "الطرف_الثاني"], data.fullName || "__________________");
    replacePlaceholder(["الرقم_القومي", "رقم_القومي"], data.nationalId || "______________");
    replacePlaceholder(["العنوان", "عنوان"], data.address || "__________________");
    replacePlaceholder(["الوظيفة", "المهنة", "مهنة", "مهنة1"], data.jobTitle || "__________________");
    replacePlaceholder(["المؤهل", "مؤهل"], data.qualification || "__________________");
    replacePlaceholder(["تاريخ_الميلاد"], data.dateOfBirth || "____/__/__");
    replacePlaceholder(["المحافظة"], data.governorate || "______");
    replacePlaceholder(["النوع"], data.gender || "_____");
    replacePlaceholder(["اسم_الشركة", "طرف_الاول", "طرف_الاول_"], getEmployerName());
    replacePlaceholder(["عنوان_الشركة", "مقر_الشركة"], getEmployerAddress());
    replacePlaceholder(["سجل_تجاري"], getEmployerCR());
    replacePlaceholder(["بطاقة_ضريبية", "بطاقه_ضريبيه"], getEmployerTaxCard());
    replacePlaceholder(["ممثل_الشركة", "يمثلها"], getEmployerRep());
    replacePlaceholder(["صفة_ممثل_الشركة", "بصفته"], getEmployerRepTitle());
    replacePlaceholder(["موقع_المشروع"], getProjectLocation());
    replacePlaceholder(["تاريخ_البداية", "تاريخ", "تاريخ_"], formattedDate(data.startDate));
    replacePlaceholder(["صادر_بتاريخ"], data.cardIssueDate || "______");
    replacePlaceholder(["تاريخ_النهاية"], data.endDate ? formattedDate(data.endDate) : "____/__/__");
    replacePlaceholder(["ساعات_العمل"], String(data.workingHours || 8));
    replacePlaceholder(["الأجر", "الراتب_الشهري", "مبلغ", "قدره"], getWageOrSalary());
    replacePlaceholder(["يوم", "يوم_"], getArabicDayName(data.startDate));
    replacePlaceholder(["اليوم"], formattedDate(new Date().toISOString()));

    return text;
  };

  const renderContractJSX = () => {
    const text = parseContractText();
    const lines = text.split("\n");
    const isBilingual = text.includes("|||");

    if (isBilingual) {
      const elements: React.ReactNode[] = [];
      let signatureIndex = -1;

      // Find where signature section starts (looking for 签字页 or التوقيعات)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("签字页") || lines[i].includes("التوقيعات")) {
          signatureIndex = i;
          break;
        }
      }

      const tableLines = signatureIndex !== -1 ? lines.slice(0, signatureIndex) : lines;

      for (let i = 0; i < tableLines.length; i++) {
        const rawLine = tableLines[i];
        const line = rawLine.trim();
        
        // Render empty lines as spacing
        if (!line) {
          elements.push(
            <div key={`empty-${i}`} className="col-span-2 h-4 w-full" />
          );
          continue;
        }

        if (line.includes("|||")) {
          const parts = line.split("|||");
          const leftText = parts[0].trim();
          const rightText = parts[1].trim();

          elements.push(
            <div 
              className="grid grid-cols-2 gap-0 border-b border-slate-200 w-full" 
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", direction: "rtl" }}
              key={`bilingual-row-${i}`}
            >
              {/* Right Column (Arabic) - rendered first so in RTL it is on the rightmost */}
              <div className="p-3 text-right text-[11px] sm:text-xs text-slate-900 font-sans leading-relaxed whitespace-pre-wrap border-l border-slate-200" style={{ direction: "rtl", textAlign: "right" }}>
                {rightText}
              </div>
              {/* Left Column (Chinese / Other Language) - rendered second so in RTL it is on the leftmost */}
              <div className="p-3 text-left text-[10px] sm:text-xs text-slate-700 font-sans leading-relaxed bg-slate-50/20 whitespace-pre-wrap" style={{ direction: "ltr", textAlign: "left" }}>
                {leftText}
              </div>
            </div>
          );
        } else {
          // Full-width line
          elements.push(
            <div 
              className="col-span-2 p-2 text-right text-xs sm:text-sm text-slate-950 font-bold font-sans w-full whitespace-pre-wrap" 
              style={{ direction: "rtl", textAlign: "right" }}
              key={`bilingual-full-${i}`}
            >
              {line}
            </div>
          );
        }
      }

      return (
        <div className="space-y-4 text-right w-full font-sans animate-fadeIn" style={{ direction: "rtl", textAlign: "right" }}>
          {/* Table Container */}
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-xs w-full bg-white divide-y divide-slate-200">
            {elements}
          </div>

          {/* Bilingual Signature Block Side-by-Side */}
          <div className="mt-8 pt-6 border-t border-dashed border-slate-300 w-full" style={{ direction: "rtl" }}>
            <div className="flex justify-between gap-4 w-full" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "16px", direction: "rtl", width: "100%" }}>
              {/* Right Box (First Party / الطرف الأول / 甲方) */}
              <div className="border border-slate-300 border-dashed rounded-xl p-4 bg-slate-50/40 space-y-3 text-right" style={{ width: "48%", boxSizing: "border-box", direction: "rtl", float: "right" }}>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 border-b border-slate-200 pb-1.5">
                  الطرف الأول (صاحب العمل) / 甲方 (雇主)
                </h4>
                <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-800">
                  <p className="font-medium"><span className="text-slate-500 font-normal">الاسم:</span> {getEmployerName()}</p>
                  <p className="font-medium" style={{ direction: "ltr", textAlign: "right" }}><span className="text-slate-500 font-normal">名称:</span> 远大建筑与商业服务公司</p>
                  <div className="pt-2">
                    <p className="text-slate-600 font-sans">التوقيع والختم: ............................................</p>
                    <p className="text-[10px] text-slate-400 font-sans">(توقيع المفوض وختم الشركة)</p>
                  </div>
                  <p className="text-slate-600 pt-1 font-sans">التاريخ: ............................................</p>
                </div>
              </div>

              {/* Left Box (Second Party / الطرف الثاني / 乙方) */}
              <div className="border border-slate-300 border-dashed rounded-xl p-4 bg-slate-50/40 space-y-3 text-right" style={{ width: "48%", boxSizing: "border-box", direction: "rtl", float: "left" }}>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 border-b border-slate-200 pb-1.5">
                  الطرف الثاني (العامل) / 乙方 (员工)
                </h4>
                <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-800">
                  <p className="font-bold text-slate-950"><span className="text-slate-500 font-normal">الاسم:</span> {data.fullName || "_____________________"}</p>
                  <p className="font-medium" style={{ direction: "ltr", textAlign: "right" }}><span className="text-slate-500 font-normal">姓名:</span> {data.fullName || "_____________________"}</p>
                  <div className="pt-2">
                    <p className="text-slate-600 font-sans">التوقيع أو البصمة: ............................................</p>
                    <p className="text-[10px] text-slate-400 font-sans">(توقيع العامل وبصمة الإبهام)</p>
                  </div>
                  <p className="text-slate-600 pt-1 font-sans">التاريخ: ............................................</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Non-bilingual (e.g. Daily Caseworker contract)
    // We render the parsed text directly with pre-wrap to preserve all custom layouts, spacing, and signatures exactly as typed!
    const sigIndex = text.indexOf("توقيع الطرف الأول");
    if (sigIndex !== -1) {
      const bodyText = text.substring(0, sigIndex).trim();
      return (
        <div className="space-y-6 w-full font-sans animate-fadeIn text-right" style={{ direction: "rtl" }}>
          <div 
            className="whitespace-pre-wrap leading-relaxed text-justify text-slate-900 text-xs sm:text-sm font-sans w-full space-y-1.5"
            style={{ direction: "rtl", textAlign: "right" }}
          >
            {bodyText}
          </div>

          {/* Daily Signature Block Side-by-Side */}
          <div className="mt-8 pt-6 border-t border-dashed border-slate-300 w-full" style={{ direction: "rtl" }}>
            <div className="flex justify-between gap-4 w-full" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "16px", direction: "rtl", width: "100%" }}>
              {/* Right Box (First Party / الطرف الأول) */}
              <div className="border border-slate-300 border-dashed rounded-xl p-4 bg-slate-50/40 space-y-3 text-right" style={{ width: "48%", boxSizing: "border-box", direction: "rtl", float: "right" }}>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 border-b border-slate-200 pb-1.5">
                  الطرف الأول (صاحب العمل)
                </h4>
                <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-800">
                  <p className="font-medium"><span className="text-slate-500 font-normal">الاسم:</span> {getEmployerName()}</p>
                  <div className="pt-2">
                    <p className="text-slate-600 font-sans">التوقيع والختم: ............................................</p>
                    <p className="text-[10px] text-slate-400 font-sans">(توقيع المفوض وختم الشركة)</p>
                  </div>
                  <p className="text-slate-600 pt-1 font-sans">التاريخ: ............................................</p>
                </div>
              </div>

              {/* Left Box (Second Party / الطرف الثاني) */}
              <div className="border border-slate-300 border-dashed rounded-xl p-4 bg-slate-50/40 space-y-3 text-right" style={{ width: "48%", boxSizing: "border-box", direction: "rtl", float: "left" }}>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 border-b border-slate-200 pb-1.5">
                  الطرف الثاني (العامل)
                </h4>
                <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-800">
                  <p className="font-bold text-slate-950"><span className="text-slate-500 font-normal">الاسم:</span> {data.fullName || "_____________________"}</p>
                  <div className="pt-2">
                    <p className="text-slate-600 font-sans">التوقيع أو البصمة: ............................................</p>
                    <p className="text-[10px] text-slate-400 font-sans">(توقيع العامل أو بصمة الإبهام)</p>
                  </div>
                  <p className="text-slate-600 pt-1 font-sans">التاريخ: ............................................</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="whitespace-pre-wrap leading-relaxed text-justify text-slate-900 text-xs sm:text-sm font-sans w-full space-y-1.5 animate-fadeIn"
        style={{ direction: "rtl", textAlign: "right" }}
      >
        {text}
      </div>
    );
  };

  const handlePrint = (asPdf = false) => {
    if (asPdf) {
      setShowPdfGuide(true);
    }
    
    const printContent = printAreaRef.current?.innerHTML;

    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html dir="rtl" lang="ar">
            <head>
              <title>عقد عمل رسمي - ${data.fullName || "موظف"}</title>
              <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
              <script src="https://cdn.tailwindcss.com"></script>
              <script>
                tailwind.config = {
                  theme: {
                    extend: {
                      fontFamily: {
                        sans: ['Cairo', 'sans-serif'],
                      }
                    }
                  }
                }
              </script>
              <style>
                body {
                  font-family: 'Cairo', sans-serif;
                  direction: rtl;
                  background-color: #ffffff;
                }
                @media print {
                  body { padding: 0; margin: 0; background-color: #ffffff; }
                  @page { size: A4; margin: 15mm; }
                }
              </style>
            </head>
            <body class="p-8 sm:p-12 text-slate-900 leading-relaxed font-sans" dir="rtl">
              <div class="max-w-[800px] mx-auto text-justify">${printContent}</div>
              <script>
                window.onload = function() {
                  setTimeout(() => {
                    window.print();
                    window.onafterprint = function() {
                      window.close();
                    };
                  }, 500);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
    if (onContractPrinted) {
      onContractPrinted();
    }
  };

  const handleExportDirectPdf = async () => {
    if (!printAreaRef.current) return;
    
    setIsGeneratingPdf(true);
    try {
      const element = printAreaRef.current;
      const parent = element.parentElement;
      
      // Save original styles of parent scroll container
      const originalMaxHeight = parent ? parent.style.maxHeight : "";
      const originalOverflowY = parent ? parent.style.overflowY : "";
      const originalHeight = parent ? parent.style.height : "";
      
      // Temporarily expand the parent so the entire contract page is rendered fully without any scroll clamping
      if (parent) {
        parent.style.maxHeight = "none";
        parent.style.overflowY = "visible";
        parent.style.height = "auto";
      }
      
      // Run html2canvas directly on the actual visible element to capture perfect fonts & CSS rules
      const canvas = await html2canvas(element, {
        scale: 2.0, // HD quality for gorgeous Arabic font subsetting
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800, // Fixed standard layout width
      });
      
      // Restore original styles
      if (parent) {
        parent.style.maxHeight = originalMaxHeight;
        parent.style.overflowY = originalOverflowY;
        parent.style.height = originalHeight;
      }
      
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;
      
      // Automatic multi-page splitting
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }
      
      const fileName = `عقد_عمل_${(data.fullName || "موظف").trim().replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);
      
      if (onContractPrinted) {
        onContractPrinted();
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("حدث خطأ أثناء تصدير ملف PDF. يمكنك استخدام زر 'تحميل ملف الطباعة HTML' كبديل ذكي وسريع للحصول على جودة خارقة.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    const htmlString = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>عقد عمل رسمي - ${data.fullName || "موظف"}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Cairo', 'sans-serif'],
            }
          }
        }
      }
    </script>
    <style>
      body {
        font-family: 'Cairo', sans-serif;
        direction: rtl;
        background-color: #f1f5f9;
      }
      @media print {
        body { padding: 0; margin: 0; background-color: #ffffff; }
        .no-print { display: none !important; }
        @page { size: A4; margin: 15mm; }
        .page-container {
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          max-width: 100% !important;
        }
      }
    </style>
  </head>
  <body class="p-4 sm:p-12 text-slate-900 leading-relaxed font-sans" dir="rtl">
    <!-- Action Bar -->
    <div class="max-w-[850px] mx-auto mb-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between no-print gap-4">
      <div class="text-right">
        <h1 class="text-sm font-bold text-slate-900">مستند العقد الرسمي جاهز للطباعة</h1>
        <p class="text-xs text-slate-500 mt-1">لقد قمت بتحميل العقد كملف مستقل لتجاوز قيود المتصفح. يمكنك حفظه كـ PDF بجودة نص خارقة أو طباعته فوراً.</p>
      </div>
      <div class="flex gap-2 w-full sm:w-auto shrink-0">
        <button onclick="window.print()" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-sm shadow-indigo-500/20">
          طباعة أو حفظ كـ PDF 🖨️
        </button>
      </div>
    </div>

    <!-- Main Contract Sheet -->
    <div class="page-container max-w-[850px] mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-14 shadow-sm text-justify">
      ${printContent}
    </div>

    <script>
      // Automatically prompt print/save dialog on load
      window.onload = function() {
        setTimeout(() => {
          window.print();
        }, 800);
      }
    </script>
  </body>
</html>`;

    const blob = new Blob([htmlString], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `عقد_عمل_${(data.fullName || "موظف").trim().replace(/\s+/g, "_")}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full shadow-2xl relative animate-fadeIn">
      
      {/* PDF Guidelines Modal Overlay */}
      {showPdfGuide && (
        <div className="absolute inset-0 bg-slate-950/90 rounded-2xl backdrop-blur-xs z-30 flex items-center justify-center p-6 text-right animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setShowPdfGuide(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileDown className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold text-white text-center">خطوات حفظ العقد كملف PDF رسمي:</h3>
            
            <div className="space-y-3.5 pt-2">
              <div className="flex gap-3 items-start justify-end">
                <div className="text-right">
                  <h4 className="text-xs font-bold text-slate-200">الخطوة الأولى: تحديد الطابعة</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">من قائمة الطابعات المتاحة (Destination) بالنافذة المفتوحة، اختر <strong>"حفظ بتنسيق PDF" (Save as PDF)</strong> أو <strong>"Microsoft Print to PDF"</strong>.</p>
                </div>
                <span className="w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">١</span>
              </div>

              <div className="flex gap-3 items-start justify-end">
                <div className="text-right">
                  <h4 className="text-xs font-bold text-slate-200">الخطوة الثانية: ضبط حجم الورقة</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">تأكد من ضبط حجم الورق في الإعدادات الإضافية على المقاس العالمي <strong>A4</strong> لضمان تنسيق ممتاز للطباعة.</p>
                </div>
                <span className="w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">٢</span>
              </div>

              <div className="flex gap-3 items-start justify-end">
                <div className="text-right">
                  <h4 className="text-xs font-bold text-slate-200">الخطوة الثالثة: الحفظ النهائي</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">اضغط على زر <strong>حفظ (Save)</strong> بالأسفل واختر المجلد المراد حفظ ملف العقد فيه على جهازك.</p>
                </div>
                <span className="w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">٣</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex gap-2">
              <button
                onClick={() => {
                  setShowPdfGuide(false);
                  handlePrint(true);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg transition-all cursor-pointer text-center"
              >
                بدء الطباعة اليدوية للحفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual controls and guidance */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div className="text-right">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 justify-end">
            معاينة العقد وتصديره الذكي
            <FileText className="w-5 h-5 text-indigo-400" />
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">تتم صياغة العقد بالكامل تلقائياً بموجب قالبك المختار والبيانات المستخرجة</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Restart / Reset Template to System defaults */}
          {onResetTemplates && (
            <button
              onClick={onResetTemplates}
              className="bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 font-bold text-[11px] px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              title="إعادة تشغيل العقد وتحديث القوالب إلى أحدث صيغ النظام الافتراضية"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              تحديث وإعادة تشغيل العقد 🔄
            </button>
          )}

          {/* WhatsApp Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:shadow-emerald-500/25"
            title="مشاركة تفاصيل العقد عبر واتساب"
          >
            <Share2 className="w-3.5 h-3.5" />
            شير واتساب
          </button>

          {/* New Vector HTML File Downloader */}
          <button
            onClick={handleDownloadHtml}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:shadow-sky-500/25 relative overflow-hidden"
            title="تحميل ملف عقد تفاعلي فائق الجودة للطباعة الفورية خارج المتصفح"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>تحميل ملف الطباعة HTML 📄</span>
          </button>

          {/* Automatic High-Quality PDF Exporter */}
          <button
            onClick={handleExportDirectPdf}
            disabled={isGeneratingPdf}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white font-bold text-[11px] px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:shadow-indigo-500/25 relative overflow-hidden"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري تحميل الـ PDF...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>تحميل PDF فوري</span>
              </>
            )}
          </button>

          {/* Save as PDF via Browser Guide Button */}
          <button
            onClick={() => setShowPdfGuide(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:shadow-teal-500/25"
            title="خطوات الحفظ اليدوي عبر المتصفح"
          >
            <FileDown className="w-3.5 h-3.5" />
            دليل حفظ PDF
          </button>

          {/* Standard Print Button */}
          <button
            onClick={() => handlePrint(false)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            طباعة (A4)
          </button>
        </div>
      </div>

      {/* Contract Sheet Wrapper with Paper look */}
      <div className="flex-1 bg-white text-slate-800 p-8 sm:p-12 rounded-xl shadow-inner border border-slate-200 overflow-y-auto max-h-[650px] custom-scrollbar text-right leading-relaxed font-sans select-text">
        <div 
          ref={printAreaRef} 
          id="printable-contract-sheet" 
          className="text-xs text-slate-800 leading-relaxed text-justify space-y-2 font-sans w-full"
        >
          {renderContractJSX()}
        </div>
      </div>
    </div>
  );
}
