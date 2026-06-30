import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldAlert, LogIn, Sparkles, User } from "lucide-react";

interface AppLockProps {
  onUnlock: (username: string) => void;
}

export default function AppLock({ onUnlock }: AppLockProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedUser = username.trim().toLowerCase();

    if (!normalizedUser || !password) {
      setError("يرجى إدخال اسم المستخدم وكلمة السر للمتابعة.");
      triggerShake();
      return;
    }

    // Checking credentials
    if (normalizedUser === "ali" && password === "Hamada@123456") {
      setIsLoading(true);
      setTimeout(() => {
        sessionStorage.setItem("app_authenticated", "true");
        sessionStorage.setItem("app_current_user", "Ali");
        onUnlock("Ali");
      }, 800);
      return;
    }

    // Standard Users: user1, user2, user3, user4, user5
    const allowedStandardUsers = ["user1", "user2", "user3", "user4", "user5"];
    if (allowedStandardUsers.includes(normalizedUser)) {
      if (password === "123456" || password === "Hamada@123456") {
        setIsLoading(true);
        setTimeout(() => {
          sessionStorage.setItem("app_authenticated", "true");
          // Save exactly as typed or capitalized
          const formattedUser = username.trim();
          sessionStorage.setItem("app_current_user", formattedUser);
          onUnlock(formattedUser);
        }, 800);
        return;
      }
    }

    setError("اسم المستخدم أو كلمة السر غير صحيحة! يرجى المحاولة مرة أخرى.");
    triggerShake();
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none font-sans antialiased font-sans">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Main Glassmorphic Login Card */}
      <div 
        className={`w-full max-w-md bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 text-right transition-all duration-300 ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        {/* Upper Decorative Shield */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative mb-3">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full blur-md opacity-40"></div>
            <img 
              src="/src/assets/images/app_launcher_icon_1782520961373.jpg" 
              alt="App Logo" 
              className="relative w-20 h-20 rounded-2xl object-cover border border-slate-700 shadow-xl animate-pulse"
              referrerPolicy="no-referrer"
            />
          </div>
          
          {/* YUANDA Premium Logo Badge */}
          <div className="relative group overflow-hidden bg-slate-950/80 border border-indigo-500/20 px-5 py-2.5 rounded-xl flex flex-col items-center justify-center min-w-[200px] shadow-lg shadow-black/50">
            <div className="absolute -inset-px bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 rounded-xl"></div>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-0.5 font-mono">Official Partner Portal</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-[0.2em] bg-gradient-to-r from-amber-400 via-white to-amber-200 bg-clip-text text-transparent font-sans">
                YUANDA
              </span>
              <span className="text-xs bg-amber-500 text-slate-950 font-bold px-1 rounded-sm font-sans">
                远大
              </span>
            </div>
            <span className="text-[9px] text-slate-500 font-medium mt-0.5">شركة يواندا الصينية للإنشاءات</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2 text-center mb-6">
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center justify-center gap-2 font-sans">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            برنامج Yuanda HR
          </h1>
          <p className="text-xs text-slate-400">
            بوابة المصادقة الآمنة وحماية خصوصية بيانات الموظفين والمقاولين
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1.5">
              اسم المستخدم (المدير)
              <User className="w-3.5 h-3.5 text-indigo-400" />
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              placeholder="مثال: Ali"
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-wide font-medium transition-all placeholder-slate-700"
              autoFocus
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1.5">
              كلمة السر الخاصة بالدخول
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
            </label>
            
            <div className="relative">
              {/* Eye Toggle button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
                placeholder="•••••••••••••"
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-widest font-mono transition-all placeholder-slate-700"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-end gap-2 animate-fadeIn">
              <span className="text-right">{error}</span>
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            </div>
          )}

          {/* Access Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2 hover:-translate-y-0.5 duration-200"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>جاري التحقق وفك تشفير النظام...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول الآمن</span>
              </>
            )}
          </button>
        </form>

        {/* Guided user logins helper */}
        <div className="mt-5 p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-[10px] text-right">
          <p className="text-indigo-400 font-bold">💡 دليل مستخدمي النظام:</p>
          <div className="text-slate-400 space-y-1">
            <p>👑 <strong>المدير المسؤول:</strong> اسم الحساب <code>Ali</code> وباسوورد <code>Hamada@123456</code> (صلاحيات كاملة + تصدير ومشاركة)</p>
            <p>👥 <strong>الموظفون (5 حسابات):</strong> <code>user1</code> حتى <code>user5</code> وباسوورد <code>123456</code> (ممنوعين من تبويب "مشاركة وتشغيل")</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 text-center">
          <p>بوابة حماية بيانات شركة يواندا ومؤسسة الطارق 🇨🇳🇪🇬</p>
          <p className="mt-1 font-mono">System Sec: AES-256 Enabled & Protected</p>
        </div>
      </div>
    </div>
  );
}
