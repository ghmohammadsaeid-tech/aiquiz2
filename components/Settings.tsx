
import React, { useState, useEffect } from 'react';
import { Question, Flashcard, Language, UserStats, View } from '../types';

interface Props {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  flashcards: Flashcard[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  lang: Language;
  setLang: (l: Language) => void;
  t: (k: string) => string;
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
  userStats: UserStats;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  setView: (v: View) => void;
}

/**
 * الگوریتم تولید لایسنس سخت‌افزاری (Hardware-Bound)
 * این تابع فقط یک خروجی صحیح برای هر Device ID دارد.
 */
const generateSecureLicense = (deviceId: string) => {
    const secretSalt = "AZM_ULTRA_SECURE_2025_V2";
    let hash = 0;
    const combined = deviceId + secretSalt;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash |= 0;
    }
    
    const absHash = Math.abs(hash);
    const hex = absHash.toString(16).toUpperCase().padStart(8, '0');
    
    // فرمت لایسنس: AZM-XXXX-YYYY-ZZ (کاملا منحصر به فرد)
    const p1 = hex.slice(0, 4);
    const p2 = hex.slice(4, 8);
    const p3 = (absHash % 99).toString().padStart(2, '0');
    
    return `AZM-${p1}-${p2}-${p3}`;
};

const Settings: React.FC<Props> = ({ isPremium, setIsPremium, darkMode, setDarkMode, setView }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('az_is_admin') === 'true';
  });

  const [targetId, setTargetId] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [adSettings, setAdSettings] = useState(() => {
    const saved = localStorage.getItem('az_manager_ad');
    return saved ? JSON.parse(saved) : { title: "🚀 پیشنهاد ویژه: اشتراک طلایی", desc: "دسترسی نامحدود به هوشمندترین ابزار یادگیری!", btn: "ارتقا به VIP", remoteUrl: "" };
  });

  useEffect(() => {
    const getDeepFingerprint = () => {
        try {
            // ۱. اثر انگشت گرافیکی (Canvas)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let canvasHash = "0";
            if (ctx) {
                canvas.width = 100; canvas.height = 30;
                ctx.font = "12px Arial";
                ctx.fillText("AZM-HARDWARE-LOCK", 2, 15);
                const b64 = canvas.toDataURL();
                for (let i = 0; i < b64.length; i++) {
                    canvasHash = (parseInt(canvasHash) + b64.charCodeAt(i)).toString();
                }
            }

            // ۲. شناسایی کارت گرافیک (WebGL Renderer) - بسیار دقیق برای تفکیک دستگاه‌ها
            const gl = canvas.getContext('webgl');
            let gpu = "unknown-gpu";
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }

            // ۳. مشخصات سیستمی
            const nav = window.navigator;
            const screen = window.screen;
            const coreData = `${gpu}-${nav.hardwareConcurrency}-${screen.width}x${screen.height}-${screen.colorDepth}`;
            
            // تولید هش نهایی
            let finalHash = 0;
            const rawId = coreData + canvasHash;
            for (let i = 0; i < rawId.length; i++) {
                finalHash = ((finalHash << 5) - finalHash) + rawId.charCodeAt(i);
                finalHash |= 0;
            }

            return `HW-${Math.abs(finalHash).toString(36).toUpperCase()}`;
        } catch (e) {
            return "ID-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
    };

    const id = getDeepFingerprint();
    setDeviceId(id);
    localStorage.setItem('az_device_id', id);
    
    if (localStorage.getItem('isPremium') === 'true') setIsPremium(true);
  }, [setIsPremium]);

  const verifyLicense = () => {
    const inputKey = licenseKey.trim();

    // ورود مدیر
    if (inputKey === "GhAz6374") { 
        setIsAdmin(true); 
        localStorage.setItem('az_is_admin', 'true');
        setIsPremium(true); 
        setLicenseKey(''); 
        alert('مدیریت فعال شد.');
        return; 
    }
    
    setIsVerifying(true);
    setTimeout(() => {
      const expected = generateSecureLicense(deviceId);
      // مقایسه لایسنس ورودی با لایسنس اختصاصی این دستگاه
      if (inputKey.toUpperCase() === expected.toUpperCase()) { 
          setIsPremium(true); 
          localStorage.setItem('isPremium', 'true'); 
          alert('لایسنس اختصاصی این دستگاه تایید شد. ✨');
          setView('dashboard'); 
      }
      else {
          alert('خطا: این لایسنس برای دستگاه شما معتبر نیست. لایسنس‌ها به سخت‌افزار دستگاه حساس هستند.');
      }
      setIsVerifying(false);
    }, 1500);
  };

  const logoutAdmin = () => {
    if(window.confirm('خروج از مدیریت؟')) {
        setIsAdmin(false);
        localStorage.removeItem('az_is_admin');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 text-right">
      <div className="flex justify-between items-center mb-4">
          <button onClick={() => setView('dashboard')} className="px-6 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-black shadow-lg border dark:border-slate-700 flex items-center gap-2">بازگشت</button>
          <div className="flex items-center gap-4 flex-row-reverse">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-indigo-600 shadow-lg`}><i className="fa-solid fa-microchip"></i></div>
            <h2 className="text-2xl font-black dark:text-white">قفل سخت‌افزاری</h2>
          </div>
      </div>

      {isAdmin && (
        <div className="bg-slate-900 border-4 border-amber-500 rounded-[2.5rem] p-6 text-white space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
                <button onClick={logoutAdmin} className="text-[10px] bg-rose-600 px-3 py-1 rounded-lg">خروج مدیر</button>
                <h3 className="text-lg font-black text-amber-400">پنل صدور لایسنس تک‌کاربره</h3>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex gap-2">
                    <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value.toUpperCase())} placeholder="HW-ID کاربر..." className="flex-1 p-3 bg-slate-800 rounded-xl text-center font-mono text-amber-400 outline-none" />
                    <button onClick={() => setGeneratedKey(generateSecureLicense(targetId))} className="px-6 bg-amber-500 text-slate-900 rounded-xl font-black">تولید</button>
                </div>
                {generatedKey && (
                    <div className="mt-4 p-4 bg-slate-800 rounded-xl border border-emerald-500/30 text-center">
                        <div className="text-xl font-black text-white tracking-widest">{generatedKey}</div>
                        <p className="text-[9px] text-slate-400 mt-1">این کد فقط روی دستگاه با ID وارد شده کار می‌کند.</p>
                        <button onClick={() => {navigator.clipboard.writeText(generatedKey); alert('کپی شد.');}} className="text-[9px] underline mt-2">کپی لایسنس</button>
                    </div>
                )}
            </div>
        </div>
      )}

      {!isPremium ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border dark:border-slate-700 space-y-8">
          <div className="text-center space-y-2">
              <h3 className="text-xl font-black dark:text-white">ارتقای دائمی حساب 🔒</h3>
              <p className="text-[10px] text-slate-400 font-bold">لایسنس صادر شده منحصر به سخت‌افزار همین دستگاه است.</p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border-2 border-dashed border-indigo-100 dark:border-slate-700 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hardware Identity (Static)</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider mb-4 font-mono">{deviceId}</div>
              <button onClick={() => {navigator.clipboard.writeText(deviceId); alert('شناسه کپی شد.');}} className="px-6 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-black text-[10px] border shadow-sm">کپی شناسه دستگاه</button>
          </div>

          <div className="space-y-4">
            <input 
                type="text" 
                value={licenseKey} 
                onChange={(e) => setLicenseKey(e.target.value)} 
                placeholder="کد لایسنس اختصاصی..." 
                className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none text-center font-black text-xl dark:text-white focus:border-indigo-500" 
            />
            <button onClick={verifyLicense} disabled={isVerifying} className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3">
                {isVerifying ? <i className="fa-solid fa-spinner fa-spin"></i> : 'فعال‌سازی لایسنس تک‌کاربره'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white text-center shadow-2xl border-4 border-amber-500/20 relative overflow-hidden">
            <h3 className="text-3xl font-black mb-3 text-amber-400">وضعیت: کاربر طلایی ✨</h3>
            <p className="text-sm opacity-60 font-bold">لایسنس سخت‌افزاری شما با موفقیت روی این دستگاه فعال شده است.</p>
            <div className="mt-6 inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-emerald-400 tracking-widest">HARDWARE-BOUND LICENSE ACTIVE</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 font-black text-xs">
            <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'} mr-2`}></i> تغییر تم
          </button>
          <button onClick={() => {if(window.confirm('همه داده‌ها پاک شوند؟')){localStorage.clear(); window.location.reload();}}} className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/20 font-black text-xs text-rose-500">
            بازنشانی کامل
          </button>
      </div>
    </div>
  );
};

export default Settings;
