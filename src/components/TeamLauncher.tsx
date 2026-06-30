import React, { useState } from "react";
import { 
  Download, Share2, Laptop, Smartphone, Copy, Check, 
  QrCode, ExternalLink, HelpCircle, Monitor, ShieldCheck, 
  Compass, Info, Send, Sliders, Lock, Unlock
} from "lucide-react";
import { AppPermissions, UserPermissions } from "../types";

const appIcon = "/src/assets/images/app_launcher_icon_1782520961373.jpg";

interface TeamLauncherProps {
  permissions: AppPermissions;
  onPermissionsChange: (updated: AppPermissions) => void;
}

export default function TeamLauncher({ permissions, onPermissionsChange }: TeamLauncherProps) {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to download a desktop shortcut (.url file)
  const handleDownloadShortcut = () => {
    const shortcutContent = `[InternetShortcut]\nURL=${currentUrl}\nIDList=\nHotKey=0\nIconFile=`;
    const blob = new Blob([shortcutContent], { type: "text/plain;charset=utf-8" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = "برنامج Yuanda HR.url";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // WhatsApp sharing of the app link to other teams
  const handleShareWhatsApp = () => {
    const text = `*رابط تشغيل برنامج Yuanda HR* 🚀\n\n` +
      `السلام عليكم، هذا هو الرابط الرسمي المباشر لتشغيل برنامج Yuanda HR لتعبئة عقود الموظفين واليومية لجميع فرق العمل والمقاولين (مؤسسة الطارق وشركة يواندا):\n\n` +
      `🔗 *رابط البرنامج المباشر:* ${currentUrl}\n\n` +
      `💡 *مميزات البرنامج:* \n` +
      `- سحب تلقائي لبيانات بطاقة الرقم القومي بالذكاء الاصطناعي 📸\n` +
      `- كتابة وتعديل صيغ العقود آلياً وبثوانٍ معدودة 📝\n` +
      `- متابعة وتنبيه فترات الاختبار (3 شهور) ومواعيد انتهاء العقود الثابتة ⚠️\n` +
      `- شير واتساب وتصدير العقود بصيغ PDF و Word 📱`;

    const encodedText = encodeURIComponent(text);
    const url = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, "_blank");
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}&color=6366f1&bgcolor=020617`;

  const standardUsers = ["user1", "user2", "user3", "user4", "user5"];

  const handleTogglePermission = (username: string, field: keyof UserPermissions) => {
    const userKey = username.toLowerCase();
    const currentPerms = permissions[userKey] || { form: true, template: true, users: true, reports: true };
    const updated = {
      ...permissions,
      [userKey]: {
        ...currentPerms,
        [field]: !currentPerms[field],
      }
    };
    onPermissionsChange(updated);
  };

  const handleSetAll = (username: string, value: boolean) => {
    const userKey = username.toLowerCase();
    const updated = {
      ...permissions,
      [userKey]: {
        form: value,
        template: value,
        users: value,
        reports: value,
      }
    };
    onPermissionsChange(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6 text-right animate-fadeIn">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 justify-end">
          <Monitor className="w-5 h-5 text-indigo-400" />
          تجهيز وتشغيل التطبيق لفرق العمل
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          قم بمشاركة البرنامج مع الفرق الأخرى، وحمّل أيقونة التشغيل واختصار سطح المكتب لتسريع العمل اليومي
        </p>
      </div>

      {/* SECTION: Standard Users Permissions Management Panel */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-slate-800/60 pb-3">
          <div className="text-right">
            <h3 className="text-xs font-bold text-indigo-400 flex items-center justify-end gap-2">
              لوحة التحكم وصلاحيات مستخدمي النظام (user1 - user5)
              <Sliders className="w-4 h-4 text-indigo-400" />
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
              حدد الأقسام والتبويبات التي يمكن لكل موظف الدخول إليها ورؤيتها. سيتم فوراً حظر وإخفاء أي تبويب غير محدد من حساب المستخدم.
            </p>
          </div>
          <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg self-start sm:self-center text-[10px] font-bold text-indigo-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>لوحة تحكم المدير المسؤول (Ali)</span>
          </div>
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
          <table className="w-full text-right border-collapse text-[11px] sm:text-xs">
            <thead>
              <tr className="bg-slate-900/60 text-slate-300 font-bold border-b border-slate-800">
                <th className="p-2.5 text-center w-24 border-l border-slate-800">حساب الموظف</th>
                <th className="p-2.5 text-center">١. البيانات (ID)</th>
                <th className="p-2.5 text-center">٢. قوالب العقود</th>
                <th className="p-2.5 text-center">٣. حسابات الموظفين</th>
                <th className="p-2.5 text-center">٤. التقارير والتصدير</th>
                <th className="p-2.5 text-center w-36">التحكم السريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {standardUsers.map((user) => {
                const userKey = user.toLowerCase();
                const userPerms = permissions[userKey] || { form: true, template: true, users: true, reports: true };
                
                return (
                  <tr key={user} className="hover:bg-slate-900/20 transition-colors">
                    {/* User Label */}
                    <td className="p-2.5 text-center font-bold border-l border-slate-800">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-md font-mono">
                        {user}
                      </span>
                    </td>

                    {/* Form Permission */}
                    <td className="p-2.5 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer gap-1 select-none">
                        <input
                          type="checkbox"
                          checked={userPerms.form}
                          onChange={() => handleTogglePermission(user, "form")}
                          className="w-3.5 h-3.5 rounded-sm border-slate-850 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                        <span className={`text-[9px] ${userPerms.form ? "text-indigo-400 font-semibold" : "text-slate-500"}`}>
                          رؤية
                        </span>
                      </label>
                    </td>

                    {/* Template Permission */}
                    <td className="p-2.5 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer gap-1 select-none">
                        <input
                          type="checkbox"
                          checked={userPerms.template}
                          onChange={() => handleTogglePermission(user, "template")}
                          className="w-3.5 h-3.5 rounded-sm border-slate-850 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                        <span className={`text-[9px] ${userPerms.template ? "text-indigo-400 font-semibold" : "text-slate-500"}`}>
                          رؤية
                        </span>
                      </label>
                    </td>

                    {/* Users Permission */}
                    <td className="p-2.5 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer gap-1 select-none">
                        <input
                          type="checkbox"
                          checked={userPerms.users}
                          onChange={() => handleTogglePermission(user, "users")}
                          className="w-3.5 h-3.5 rounded-sm border-slate-850 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                        <span className={`text-[9px] ${userPerms.users ? "text-indigo-400 font-semibold" : "text-slate-500"}`}>
                          رؤية
                        </span>
                      </label>
                    </td>

                    {/* Reports Permission */}
                    <td className="p-2.5 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer gap-1 select-none">
                        <input
                          type="checkbox"
                          checked={userPerms.reports}
                          onChange={() => handleTogglePermission(user, "reports")}
                          className="w-3.5 h-3.5 rounded-sm border-slate-850 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                        <span className={`text-[9px] ${userPerms.reports ? "text-indigo-400 font-semibold" : "text-slate-500"}`}>
                          رؤية
                        </span>
                      </label>
                    </td>

                    {/* Quick Controls */}
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSetAll(user, true)}
                          className="px-1.5 py-0.5 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-850 hover:border-indigo-800 text-indigo-300 rounded text-[9px] font-bold transition-all cursor-pointer"
                        >
                          السماح بالكل
                        </button>
                        <button
                          onClick={() => handleSetAll(user, false)}
                          className="px-1.5 py-0.5 bg-rose-950/20 hover:bg-rose-900/20 border border-rose-900/30 hover:border-rose-900/40 text-rose-300 rounded text-[9px] font-bold transition-all cursor-pointer"
                        >
                          إلغاء الكل
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Grid: Icon Preview & Quick Sharing */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        
        {/* Left Side (Column 1-5): Visual App Icon */}
        <div className="md:col-span-5 flex flex-col items-center text-center p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2.5 py-1 rounded-full mb-3">
            أيقونة التطبيق الرسمية الجديدة 🎨
          </span>
          
          <div className="relative group mb-4">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src={appIcon} 
              alt="App Icon" 
              className="relative w-32 h-32 rounded-2xl object-cover border border-slate-700 shadow-2xl transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          <h3 className="text-sm font-bold text-slate-200">برنامج Yuanda HR</h3>
          <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
            شعار مصمم خصيصاً للبرنامج يجمع بين المستندات والقلم الفولاذي مع عناصر الأمان والذكاء الاصطناعي
          </p>

          <a 
            href={appIcon} 
            download="برنامج_Yuanda_HR_أيقونة.jpg"
            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            تنزيل الأيقونة (صورة عالية الدقة)
          </a>
        </div>

        {/* Right Side (Column 6-12): Share / Desktop Shortcut Controls */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-xs font-bold text-slate-300">طرق التشغيل السريع لفرق العمل:</h3>
          
          <div className="grid grid-cols-1 gap-2.5">
            
            {/* 1. Desktop Shortcut */}
            <div className="bg-slate-950/40 border border-slate-800/50 p-3 rounded-lg flex flex-row-reverse justify-between items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-200 flex items-center justify-end gap-1">
                  اختصار بنقرة واحدة لسطح المكتب
                  <Laptop className="w-4 h-4 text-indigo-400" />
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  ملف تقوم بإرساله للفرق ليقوموا بوضعه على شاشة الكمبيوتر، وبمجرد الضغط عليه مرتين يفتح البرنامج فوراً!
                </p>
              </div>
              <button 
                onClick={handleDownloadShortcut}
                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                تحميل الاختصار (.url)
              </button>
            </div>

            {/* 2. Direct WhatsApp Broadcast */}
            <div className="bg-slate-950/40 border border-slate-800/50 p-3 rounded-lg flex flex-row-reverse justify-between items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-200 flex items-center justify-end gap-1">
                  إرسال الرابط والتعليمات لواتساب
                  <Send className="w-4 h-4 text-emerald-400" />
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  تجهيز رسالة نصية جاهزة تحتوي على رابط البرنامج والمميزات وإرسالها لكل المجموعات بلمسة واحدة.
                </p>
              </div>
              <button 
                onClick={handleShareWhatsApp}
                className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                مشاركة واتساب
              </button>
            </div>

            {/* 3. Direct Link Copy */}
            <div className="bg-slate-950/40 border border-slate-800/50 p-3 rounded-lg space-y-2">
              <span className="text-xs font-bold text-slate-200 flex items-center justify-end gap-1">
                نسخ الرابط المباشر
                <Copy className="w-4 h-4 text-slate-400" />
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    copied 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      تم النسخ!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      نسخ الرابط
                    </>
                  )}
                </button>
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-400 font-mono text-left select-all"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* QR Code and Install Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        
        {/* Mobile App PWA & QR Code */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4">
          <div className="text-right space-y-2 flex-1">
            <span className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
              مسح رمز الاستجابة السريعة (QR)
              <QrCode className="w-4 h-4 text-indigo-400" />
            </span>
            <p className="text-[10px] text-slate-400 leading-normal">
              اجعل أعضاء الفريق يفتحون كاميرا الهاتف ويمسحون هذا الرمز السريع لفتح البرنامج على هواتفهم على الفور والبدء في تصوير البطاقات واليومية!
            </p>
            <div className="flex justify-end pt-1">
              <span className="text-[8px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md font-bold">
                سهل الفتح والمسح 📱
              </span>
            </div>
          </div>
          <div className="shrink-0 bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-md">
            <img 
              src={qrCodeUrl} 
              alt="Scan QR" 
              className="w-24 h-24 rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <span className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
            طريقة حفظ البرنامج كـ "أيقونة تطبيق" على الموبايل
            <Smartphone className="w-4 h-4 text-indigo-400" />
          </span>
          
          <ul className="text-[10px] text-slate-400 space-y-2 list-none pr-0">
            <li className="flex items-start gap-1.5 justify-end">
              <span>افتح الرابط في متصفح <strong>Google Chrome</strong> على هاتفك</span>
              <span className="text-indigo-400 font-bold shrink-0">١.</span>
            </li>
            <li className="flex items-start gap-1.5 justify-end">
              <span>اضغط على زر الخيارات (النقاط الثلاثة في أعلى يسار المتصفح)</span>
              <span className="text-indigo-400 font-bold shrink-0">٢.</span>
            </li>
            <li className="flex items-start gap-1.5 justify-end">
              <span>اختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong></span>
              <span className="text-indigo-400 font-bold shrink-0">٣.</span>
            </li>
            <li className="flex items-start gap-1.5 justify-end">
              <span>اضغط على إضافة. سيظهر لك التطبيق على شاشة هاتفك بأيقونة ذكية مميزة!</span>
              <span className="text-indigo-400 font-bold shrink-0">٤.</span>
            </li>
          </ul>

          <div className="bg-slate-900/60 p-2 rounded-lg text-[9px] text-slate-500 flex justify-end gap-1">
            <span>لمستخدمي الآيفون (Safari): اضغط على زر "مشاركة" بالأسفل ثم اختر "إضافة إلى الشاشة الرئيسية".</span>
            <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          </div>
        </div>

      </div>

      {/* Footer warning/notes */}
      <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-800/60 text-[9px] text-slate-500 leading-normal flex gap-1.5 items-start">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-right">
          💡 <strong>جاهزية العمل الفوري:</strong> جميع البيانات المرفوعة أو العقود المعدلة يتم حفظها محلياً على المتصفح للخصوصية والأمان، ويمكنك تصديرها دائماً لمشاركتها مع بقية المدراء أو الأجهزة بضغطة زر.
        </p>
      </div>

    </div>
  );
}
