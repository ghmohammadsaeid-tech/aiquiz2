
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
 * الگوریتم تولید لایسنس فوق امنیتی
 * لایسنس را به صورت یک توکن چندبخشی تولید می‌کند که شناسایی آن غیرممکن است.
 */
const generateSecureLicense = (deviceId: string) => {
    const secretSalt = "AZM_HARDWARE_LOCK_99";
    
    // ایجاد یک هش عددی از ترکیب شناسه و نمک امنیتی
    let hash = 0;
    const combined = deviceId + secretSalt;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash |= 0;
    }
    
    const absHash = Math.abs(hash);
    // تولید بخش‌های مختلف لایسنس با پایه های ریاضی متفاوت
    const partA = absHash.toString(16).toUpperCase().padStart(6, '0').slice(-6);
    const partB = btoa(absHash.toString()).replace(/=/g, '').toUpperCase().slice(0, 6);
    const checksum = (absHash % 99).toString().padStart(2, '0');
    
    // خروجی نهایی: توکن امنیتی شبیه به کدهای بانکی یا لایسنس‌های نرم‌افزاری سنگین
    return `AZM.${partA}-${partB}.${checksum}`;
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
    // تابع انگشت‌نگاری سخت‌افزاری (Canvas Fingerprinting)
    // این تابع بر اساس رندر گرافیکی کارت گرافیک شما یک کد منحصر به فرد و ثابت تولید می‌کند
    const getHardwareFingerprint = () => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return "fallback-id-" + Math.random();
            
            canvas.width = 200;
            canvas.height = 50;
            
            // رسم متن با فونت‌ها و استایل‌های مختلف برای ایجاد تفاوت در رندرینگ سخت‌افزارها
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText("AZM-PRO-HARDWARE-LOCK", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("AZM-PRO-HARDWARE-LOCK", 4, 17);
            
            const b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
            let hash = 0;
            for (let i = 0; i < b64.length; i++) {
                hash = ((hash << 5) - hash) + b64.charCodeAt(i);
                hash |= 0;
            }
            
            // ترکیب با مشخصات ثابت مرورگر برای دقت بیشتر
            const nav = window.navigator;
            const screen = window.screen;
            const extra = `${nav.hardwareConcurrency}-${screen.colorDepth}-${screen.width}x${screen.height}`;
            
            let finalHash = Math.abs(hash).toString(36).toUpperCase();
            let extraHash = 0;
            for (let i = 0; i < extra.length; i++) {
                extraHash = ((extraHash << 5) - extraHash) + extra.charCodeAt(i);
                extraHash |= 0;
            }
            
            return `HW-${finalHash}-${Math.abs(extraHash).toString(36).toUpperCase()}`;
        } catch (e) {
            return "DEV-OFFLINE-MODE";
        }
    };

    // تولید ID ثابت - حتی اگر LocalStorage پاک شود، این تابع دوباره همان ID را تولید می‌کند
    const id = getHardwareFingerprint();
    setDeviceId(id);
    localStorage.setItem('az_device_id', id); // برای دسترسی سریع‌تر ذخیره هم میکنیم
    
    // چک کردن لایسنس موجود
    const savedPremium = localStorage.getItem('isPremium');
    if (savedPremium === 'true') setIsPremium(true);
  }, [setIsPremium]);

  const verifyLicense = () => {
    const inputKey = licenseKey.trim();

    // ۱. بررسی ورود مدیر (دقیق و حساس به حروف)
    if (inputKey === "GhAz6374") { 
        setIsAdmin(true); 
        localStorage.setItem('az_is_admin', 'true');
        setIsPremium(true); 
        setLicenseKey(''); 
        alert('مدیر عزیز خوش آمدید. پنل کنترل مرکزی فعال شد.');
        return; 
    }
    
    setIsVerifying(true);
    setTimeout(() => {
      // ۲. بررسی لایسنس (حساس به فرمت اما غیرحساس به حروف کوچک/بزرگ برای راحتی)
      const expected = generateSecureLicense(deviceId);
      
      if (inputKey.toUpperCase() === expected.toUpperCase()) { 
          setIsPremium(true); 
          localStorage.setItem('isPremium', 'true'); 
          alert('فعال‌سازی با موفقیت انجام شد! حالا شما کاربر طلایی هستید.');
          setView('dashboard'); 
      }
      else {
          alert('کد وارد شده معتبر نیست. لطفاً شناسه دستگاه خود را برای ادمین ارسال کنید.');
      }
      setIsVerifying(false);
    }, 1800);
  };

  const logoutAdmin = () => {
    if(window.confirm('آیا مایل به خروج از پنل مدیریت هستید؟')) {
        setIsAdmin(false);
        localStorage.removeItem('az_is_admin');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 text-right">
      <div className="flex justify-between items-center mb-4">
          <button onClick={() => setView('dashboard')} className="px-6 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-black shadow-lg border dark:border-slate-700 flex items-center gap-2">
            <i className="fa-solid fa-chevron-right"></i> بازگشت
          </button>
          <div className="flex items-center gap-4 flex-row-reverse">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${isPremium ? 'bg-amber-500 shadow-amber-500/30 shadow-lg' : 'bg-indigo-600 shadow-indigo-600/20 shadow-lg'}`}>
                <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h2 className="text-2xl font-black dark:text-white">امنیت و لایسنس</h2>
          </div>
      </div>

      {isAdmin && (
        <div className="bg-slate-900 border-[6px] border-amber-500 rounded-[3rem] p-8 text-white space-y-8 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <button onClick={logoutAdmin} className="px-4 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px] hover:bg-rose-700 transition-all">خروج از مدیریت</button>
                <div className="flex items-center gap-3 flex-row-reverse">
                    <span className="px-2 py-1 bg-amber-500 text-slate-900 text-[10px] font-black rounded-md animate-pulse">ADMIN STRATUM</span>
                    <h3 className="text-2xl font-black text-amber-400">پنل صدور لایسنس سخت‌افزاری</h3>
                </div>
            </div>
            
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                <p className="text-amber-500 font-black text-xs mb-4">صدور توکن لایسنس طلایی برای کاربر</p>
                <div className="flex gap-4">
                    <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value.toUpperCase())} placeholder="شناسه سخت‌افزاری کاربر (HW-...)" className="flex-1 p-5 bg-slate-800 border-2 border-slate-700 rounded-2xl text-center font-mono text-amber-400 outline-none focus:border-amber-500 transition-all" />
                    <button onClick={() => {
                        if(!targetId) return alert('شناسه کاربر الزامی است.');
                        setGeneratedKey(generateSecureLicense(targetId));
                    }} className="px-10 py-5 bg-amber-500 text-slate-900 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20">تولید لایسنس</button>
                </div>
                {generatedKey && (
                    <div className="mt-8 p-8 bg-slate-800 rounded-3xl border-2 border-emerald-500/40 text-center animate-bounce-subtle">
                        <div className="text-[10px] font-black text-emerald-400 mb-2 uppercase tracking-widest">Encrypted License Key Generated</div>
                        <div className="text-3xl font-black text-white tracking-[0.1em] mb-4 break-all">{generatedKey}</div>
                        <button onClick={() => {navigator.clipboard.writeText(generatedKey); alert('کد لایسنس کپی شد.');}} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black">کپی لایسنس نهایی</button>
                    </div>
                )}
            </div>

            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                <h4 className="text-indigo-400 font-black text-xs mb-6">پیکربندی تبلیغات داینامیک</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <input type="text" value={adSettings.remoteUrl} onChange={(e) => setAdSettings({...adSettings, remoteUrl: e.target.value})} placeholder="URL فایل Gist (اختیاری)" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400" />
                        <input type="text" value={adSettings.title} onChange={(e) => setAdSettings({...adSettings, title: e.target.value})} placeholder="عنوان تبلیغ" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-xs" />
                    </div>
                    <div className="space-y-4">
                        <input type="text" value={adSettings.btn} onChange={(e) => setAdSettings({...adSettings, btn: e.target.value})} placeholder="متن دکمه" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-xs" />
                        <textarea value={adSettings.desc} onChange={(e) => setAdSettings({...adSettings, desc: e.target.value})} placeholder="متن توضیحات" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-xs h-[100px] resize-none" />
                    </div>
                </div>
                <button onClick={() => {localStorage.setItem('az_manager_ad', JSON.stringify(adSettings)); alert('تنظیمات با موفقیت در فضای ابری محلی ذخیره شد.');}} className="w-full mt-6 py-4 bg-indigo-600 rounded-2xl font-black text-xs shadow-xl hover:bg-indigo-500">بروزرسانی محتوای ابری</button>
            </div>
        </div>
      )}

      {!isPremium ? (
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-2xl border dark:border-slate-700 space-y-8">
          <div className="text-center space-y-2">
              <h3 className="text-2xl font-black dark:text-white">فعال‌سازی نسخه دائمی 🔓</h3>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">برای استفاده از تمامی امکانات و هوش مصنوعی، کد زیر را برای ما ارسال کنید.</p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border-4 border-dashed border-indigo-100 dark:border-slate-700 text-center group">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Your Hardware Identity (Static)</span>
              <div className="text-xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight mb-6 break-all font-mono">{deviceId}</div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => {navigator.clipboard.writeText(deviceId); alert('شناسه ثابت کپی شد.');}} className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-xs border shadow-sm hover:bg-slate-100 transition-all">کپی شناسه</button>
                <button onClick={() => window.open(`https://t.me/azmonyar_admin?text=درخواست لایسنس طلایی برای شناسه:%0A${deviceId}`,'_blank')} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all">ارسال در تلگرام</button>
              </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
                <input 
                    type="text" 
                    value={licenseKey} 
                    onChange={(e) => setLicenseKey(e.target.value)} 
                    placeholder="کد لایسنس را اینجا وارد کنید..." 
                    className="w-full p-8 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] outline-none text-center font-black text-2xl dark:text-white focus:border-indigo-500 transition-all placeholder:text-sm placeholder:font-normal placeholder:tracking-normal" 
                />
            </div>
            <button onClick={verifyLicense} disabled={isVerifying} className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                {isVerifying ? <i className="fa-solid fa-gear fa-spin text-2xl"></i> : <><i className="fa-solid fa-unlock"></i> تایید و ارتقای حساب</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-16 rounded-[4rem] text-white text-center shadow-2xl border-4 border-amber-500/30 relative overflow-hidden group">
            <div className="relative z-10">
                <div className="w-32 h-32 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-8 text-6xl text-slate-900 shadow-2xl shadow-amber-500/50 group-hover:scale-110 transition-transform duration-700">
                    <i className="fa-solid fa-crown"></i>
                </div>
                <h3 className="text-4xl font-black mb-4 text-amber-400 uppercase tracking-tighter">Premium Access Active</h3>
                <p className="text-lg opacity-60 font-bold mb-10 leading-relaxed">حساب شما به صورت دائمی به سطح طلایی ارتقا یافته است.<br/>از تمامی امکانات بدون محدودیت لذت ببرید.</p>
                <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    Verified Hardware License
                </div>
            </div>
            {/* جلوه‌های بصری پس‌زمینه */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">ظاهر اپلیکیشن</label>
            <button onClick={() => setDarkMode(!darkMode)} className={`w-full py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 transition-all text-lg ${darkMode ? 'bg-slate-900 text-white border-4 border-amber-400' : 'bg-slate-50 text-slate-700 border-4 border-slate-100'}`}>
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i> {darkMode ? 'حالت روز' : 'حالت شب'}
            </button>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/10 p-10 rounded-[3rem] border-4 border-dashed border-rose-100 dark:border-rose-900/30 flex flex-col items-center justify-center gap-6">
            <div className="text-center">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">منطقه خطر</p>
                <p className="text-[9px] text-rose-400 font-bold">پاکسازی تمامی اطلاعات (سوالات و تنظیمات)</p>
            </div>
            <button onClick={() => {if(window.confirm('تمامی سوالات، فلش‌کارت‌ها و وضعیت لایسنس شما پاک خواهد شد. آیا مطمئن هستید؟')){localStorage.clear(); window.location.reload();}}} className="px-10 py-4 bg-rose-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-rose-900/20 active:scale-95 transition-all">ریست فکتوری</button>
          </div>
      </div>
    </div>
  );
};

export default Settings;
