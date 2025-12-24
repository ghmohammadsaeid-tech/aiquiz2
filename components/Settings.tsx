
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
 * الگوریتم پیشرفته تولید لایسنس
 * خروجی مشابه توکن‌های JSON/Base64 تولید می‌کند تا امنیت ظاهری بالایی داشته باشد.
 */
const generateSecureLicense = (deviceId: string) => {
    const salt = "AZM_SECRET_KEY_2025_PRO";
    const combined = deviceId + salt;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash |= 0;
    }
    
    const absHash = Math.abs(hash);
    const hex = absHash.toString(16).toUpperCase();
    const encoded = btoa(hex + "-" + deviceId.slice(-4)).replace(/=/g, '');
    
    // فرمت خروجی: AZM.XXXXX.YYYYY.ZZZZ
    const p1 = encoded.slice(0, 5);
    const p2 = hex.slice(0, 5);
    const p3 = (absHash % 9999).toString().padStart(4, '0');
    
    return `AZM.${p1}.${p2}.${p3}`.toUpperCase();
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
    const getFingerprint = () => {
        const nav = window.navigator;
        const screen = window.screen;
        const base = `${nav.userAgent}-${screen.width}x${screen.height}-${nav.hardwareConcurrency}`;
        let hash = 0;
        for (let i = 0; i < base.length; i++) {
            hash = ((hash << 5) - hash) + base.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(36).toUpperCase();
    };

    let id = localStorage.getItem('az_device_id');
    if (!id) {
        const fingerprint = getFingerprint();
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        id = `AZ-${fingerprint}-${random}`;
        localStorage.setItem('az_device_id', id);
    }
    setDeviceId(id);
  }, []);

  const verifyLicense = () => {
    const inputKey = licenseKey.trim();

    // ۱. بررسی ورود مدیر (حساس به حروف کوچک و بزرگ)
    if (inputKey === "GhAz6374") { 
        setIsAdmin(true); 
        localStorage.setItem('az_is_admin', 'true');
        setIsPremium(true); 
        setLicenseKey(''); 
        alert('درود بر مدیر! پنل دسترسی ابری فعال شد. ✨');
        return; 
    }
    
    setIsVerifying(true);
    setTimeout(() => {
      // ۲. بررسی لایسنس کاربر (غیرحساس به حروف برای راحتی کاربر)
      const expected = generateSecureLicense(deviceId);
      
      if (inputKey.toUpperCase() === expected) { 
          setIsPremium(true); 
          localStorage.setItem('isPremium', 'true'); 
          alert('تبریک! لایسنس طلایی شما با موفقیت تایید شد. 🎉');
          setView('dashboard'); 
      }
      else {
          alert('لایسنس وارد شده معتبر نیست. لطفاً کد را دقیقاً کپی کنید.');
      }
      setIsVerifying(false);
    }, 1500);
  };

  const logoutAdmin = () => {
    if(window.confirm('آیا می‌خواهید از پنل مدیریت خارج شوید؟')) {
        setIsAdmin(false);
        localStorage.removeItem('az_is_admin');
        alert('پنل مدیریت مخفی شد.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 text-right">
      <div className="flex justify-between items-center mb-4">
          <button onClick={() => setView('dashboard')} className="px-6 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-black shadow-lg border dark:border-slate-700 flex items-center gap-2">بازگشت <i className="fa-solid fa-chevron-left"></i></button>
          <div className="flex items-center gap-4 flex-row-reverse">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${isPremium ? 'bg-amber-500 shadow-amber-500/20 shadow-lg' : 'bg-indigo-600'}`}><i className="fa-solid fa-gear"></i></div>
            <h2 className="text-2xl font-black dark:text-white">تنظیمات پیشرفته</h2>
          </div>
      </div>

      {isAdmin && (
        <div className="bg-slate-900 border-4 border-amber-500 rounded-[3rem] p-8 text-white space-y-8 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <button onClick={logoutAdmin} className="text-[10px] bg-rose-600 text-white px-3 py-1.5 rounded-lg font-black hover:bg-rose-700 transition-colors">خروج از پنل مدیر</button>
                <div className="flex items-center gap-2 flex-row-reverse">
                    <span className="text-[10px] bg-amber-500 text-slate-900 px-2 py-1 rounded-lg font-black">ROOT ACCESS</span>
                    <h3 className="text-xl font-black text-amber-400">پنل کنترل ابری</h3>
                </div>
            </div>
            
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <h4 className="text-amber-500 font-black text-xs mb-4 text-right">تولید لایسنس جدید</h4>
                <div className="flex gap-3">
                    <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value.toUpperCase())} placeholder="ID دستگاه کاربر..." className="flex-1 p-4 bg-slate-800 border border-slate-700 rounded-2xl text-center font-mono text-amber-400 outline-none focus:border-amber-500" />
                    <button onClick={() => {
                        if(!targetId) return alert('ID کاربر را وارد کنید.');
                        setGeneratedKey(generateSecureLicense(targetId));
                    }} className="px-8 py-4 bg-amber-500 text-slate-900 rounded-2xl font-black hover:scale-105 transition-all">تولید کد</button>
                </div>
                {generatedKey && (
                    <div className="mt-6 p-6 bg-slate-800/50 rounded-2xl border-2 border-emerald-500/30 text-center space-y-3">
                        <p className="text-[10px] font-black text-emerald-400">لایسنس رمزنگاری شده (نسخه دائمی)</p>
                        <div className="text-xl font-black tracking-widest text-white selection:bg-amber-500 break-all">{generatedKey}</div>
                        <button onClick={() => {navigator.clipboard.writeText(generatedKey); alert('کپی شد.');}} className="text-[10px] text-slate-400 underline">کپی برای ارسال به کاربر</button>
                    </div>
                )}
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <h4 className="text-indigo-400 font-black text-xs mb-4">مدیریت بنر تبلیغاتی</h4>
                <div className="space-y-4">
                    <input type="text" value={adSettings.remoteUrl} onChange={(e) => setAdSettings({...adSettings, remoteUrl: e.target.value})} placeholder="URL فایل JSON ابری (Gist)..." className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl font-mono text-xs text-emerald-400" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={adSettings.title} onChange={(e) => setAdSettings({...adSettings, title: e.target.value})} placeholder="عنوان بنر..." className="p-3 bg-slate-800 rounded-xl text-xs" />
                        <input type="text" value={adSettings.btn} onChange={(e) => setAdSettings({...adSettings, btn: e.target.value})} placeholder="متن دکمه..." className="p-3 bg-slate-800 rounded-xl text-xs" />
                    </div>
                    <textarea value={adSettings.desc} onChange={(e) => setAdSettings({...adSettings, desc: e.target.value})} placeholder="توضیحات..." className="w-full p-3 bg-slate-800 rounded-xl text-xs h-16" />
                    <button onClick={() => {localStorage.setItem('az_manager_ad', JSON.stringify(adSettings)); alert('تغییرات ثبت شد.');}} className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-xs shadow-xl">ذخیره و انتشار</button>
                </div>
            </div>
        </div>
      )}

      {!isPremium ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border dark:border-slate-700 space-y-6">
          <div className="text-center">
              <h3 className="text-xl font-black dark:text-white">ارتقای حساب به نسخه طلایی 🔓</h3>
              <p className="text-[10px] text-slate-400 font-bold">برای حذف محدودیت‌های هوش مصنوعی و چاپ</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border-2 border-dashed border-indigo-100 dark:border-slate-700 text-center relative">
              <p className="text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">کد شناسایی دستگاه شما</p>
              <div className="text-xl md:text-2xl font-black text-indigo-600 tracking-wider mb-4 break-all">{deviceId}</div>
              <div className="flex gap-2 justify-center">
                <button onClick={() => {navigator.clipboard.writeText(deviceId); alert('کپی شد.');}} className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-black text-[10px] border shadow-sm">کپی ID</button>
                <button onClick={() => window.open(`https://t.me/azmonyar_admin?text=درخواست لایسنس برای دستگاه:%0A${deviceId}`,'_blank')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] shadow-lg shadow-indigo-600/20">ارسال به پشتیبانی</button>
              </div>
          </div>
          <div className="space-y-4">
            <input 
                type="text" 
                value={licenseKey} 
                onChange={(e) => setLicenseKey(e.target.value)} 
                placeholder="کد لایسنس را وارد کنید..." 
                className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none text-center font-black text-xl dark:text-white focus:border-indigo-500 transition-all placeholder:text-sm placeholder:font-normal" 
            />
            <button onClick={verifyLicense} disabled={isVerifying} className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-900/20 active:scale-95 transition-all">
                {isVerifying ? <i className="fa-solid fa-lock-open fa-spin text-2xl"></i> : 'تایید و فعال‌سازی'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-12 rounded-[3.5rem] text-white text-center shadow-2xl border-2 border-amber-500/30 relative overflow-hidden">
            <div className="relative z-10">
                <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-slate-900 shadow-2xl shadow-amber-500/40"><i className="fa-solid fa-crown"></i></div>
                <h3 className="text-3xl font-black mb-3 text-amber-400">طلایی هستید! ✨</h3>
                <p className="text-sm opacity-60 font-bold leading-relaxed">تمامی امکانات آزمون‌یار برای شما باز است.</p>
                <div className="mt-8 inline-block px-5 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">Premium Membership: Active</div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-sm">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 text-center tracking-widest">تم برنامه</label>
            <button onClick={() => setDarkMode(!darkMode)} className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${darkMode ? 'bg-slate-900 text-white border-2 border-amber-400' : 'bg-slate-50 text-slate-700 border-2 border-slate-100'}`}>
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i> {darkMode ? 'حالت روز' : 'حالت شب'}
            </button>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/10 p-8 rounded-[2.5rem] border-2 border-dashed border-rose-100 dark:border-rose-900/30 flex flex-col items-center justify-center gap-4">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">بازنشانی کامل</p>
            <button onClick={() => {if(window.confirm('تمامی سوالات و لایسنس شما پاک خواهد شد. مطمئن هستید؟')){localStorage.clear(); window.location.reload();}}} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] shadow-lg">پاکسازی دیتا</button>
          </div>
      </div>
    </div>
  );
};

export default Settings;
