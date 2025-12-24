
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

// الگوریتم امنیتی تولید لایسنس (مخفی برای کاربر)
const generateSecureLicense = (deviceId: string) => {
    const salt = "AZM_SECURE_SALT_9974"; // رشته مخفی مدیر
    const combined = deviceId + salt;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    
    const absHash = Math.abs(hash);
    const part1 = absHash.toString(16).toUpperCase().padStart(4, '0').slice(-4);
    const part2 = (absHash ^ 0x55AA).toString(16).toUpperCase().padStart(4, '0').slice(-4);
    const part3 = (absHash * 7).toString(36).toUpperCase().padStart(4, '0').slice(-4);
    
    return `AZM-${part1}-${part2}-${part3}`;
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
    // کد ورود به مدیریت (بدون تغییر)
    if (licenseKey === "GhAz6374") { 
        setIsAdmin(true); 
        localStorage.setItem('az_is_admin', 'true');
        setIsPremium(true); 
        setLicenseKey(''); 
        alert('حالت مدیریت فعال شد.');
        return; 
    }
    
    setIsVerifying(true);
    setTimeout(() => {
      // استفاده از الگوریتم جدید برای تایید
      const expected = generateSecureLicense(deviceId);
      
      if (licenseKey.toUpperCase().trim() === expected) { 
          setIsPremium(true); 
          localStorage.setItem('isPremium', 'true'); 
          alert('تبریک! حساب شما به نسخه طلایی ارتقا یافت. 🎉');
          setView('dashboard'); 
      }
      else alert('کد لایسنس اشتباه است. لطفاً با پشتیبانی تماس بگیرید.');
      setIsVerifying(false);
    }, 1200); // تاخیر کمی بیشتر برای حس امنیت
  };

  const logoutAdmin = () => {
    if(window.confirm('آیا می‌خواهید از حالت مدیریت خارج شوید؟')) {
        setIsAdmin(false);
        localStorage.removeItem('az_is_admin');
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(deviceId);
    alert('ID دستگاه کپی شد.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 text-right">
      <div className="flex justify-between items-center mb-4">
          <button onClick={() => setView('dashboard')} className="px-6 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-black shadow-lg border dark:border-slate-700 flex items-center gap-2">بازگشت به داشبورد <i className="fa-solid fa-chevron-left"></i></button>
          <div className="flex items-center gap-4 flex-row-reverse">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${isPremium ? 'bg-amber-500' : 'bg-indigo-600'}`}><i className="fa-solid fa-gear"></i></div>
            <h2 className="text-2xl font-black dark:text-white">تنظیمات</h2>
          </div>
      </div>

      {isAdmin && (
        <div className="bg-slate-900 border-4 border-amber-500 rounded-[3rem] p-8 text-white space-y-8 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <button onClick={logoutAdmin} className="text-[10px] bg-rose-600 text-white px-3 py-1.5 rounded-lg font-black hover:bg-rose-700 transition-colors">خروج از پنل مدیر</button>
                <div className="flex items-center gap-2 flex-row-reverse">
                    <span className="text-[10px] bg-amber-500 text-slate-900 px-2 py-1 rounded-lg font-black">SECURITY MODULE</span>
                    <h3 className="text-xl font-black text-amber-400">پنل فوق امنیتی مدیر</h3>
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <h4 className="text-amber-500 font-black text-xs mb-4 text-right">تولید لایسنس اختصاصی دستگاه</h4>
                    <div className="flex gap-3">
                        <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value.toUpperCase())} placeholder="ID کاربر را اینجا وارد کنید..." className="flex-1 p-4 bg-slate-800 border border-slate-700 rounded-2xl text-center font-mono text-amber-400 outline-none focus:border-amber-500" />
                        <button onClick={() => {
                            if(!targetId) return alert('ID کاربر را وارد کنید.');
                            setGeneratedKey(generateSecureLicense(targetId));
                        }} className="px-8 py-4 bg-amber-500 text-slate-900 rounded-2xl font-black hover:scale-105 transition-all">تولید کد</button>
                    </div>
                    {generatedKey && (
                        <div className="mt-6 p-6 bg-slate-800/50 rounded-2xl border-2 border-emerald-500/30 text-center space-y-3">
                            <p className="text-[10px] font-black text-emerald-400">کد نهایی صادر شد</p>
                            <div className="text-2xl font-black tracking-[0.3em] text-white selection:bg-amber-500">{generatedKey}</div>
                            <button onClick={() => {navigator.clipboard.writeText(generatedKey); alert('کد لایسنس کپی شد.');}} className="text-[10px] text-slate-400 underline">کپی لایسنس</button>
                        </div>
                    )}
                </div>
                
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <h4 className="text-indigo-400 font-black text-xs mb-4">مدیریت تبلیغات ابری</h4>
                    <div className="space-y-4">
                        <input type="text" value={adSettings.remoteUrl} onChange={(e) => setAdSettings({...adSettings, remoteUrl: e.target.value})} placeholder="URL فایل Gist یا JSON..." className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl font-mono text-xs text-emerald-400" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" value={adSettings.title} onChange={(e) => setAdSettings({...adSettings, title: e.target.value})} placeholder="عنوان تبلیغ..." className="p-3 bg-slate-800 rounded-xl text-xs" />
                            <input type="text" value={adSettings.btn} onChange={(e) => setAdSettings({...adSettings, btn: e.target.value})} placeholder="متن دکمه..." className="p-3 bg-slate-800 rounded-xl text-xs" />
                        </div>
                        <textarea value={adSettings.desc} onChange={(e) => setAdSettings({...adSettings, desc: e.target.value})} placeholder="متن توضیحات تبلیغ..." className="w-full p-3 bg-slate-800 rounded-xl text-xs h-16" />
                        <button onClick={() => {localStorage.setItem('az_manager_ad', JSON.stringify(adSettings)); alert('تبلیغات ذخیره شد.');}} className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-xs shadow-xl">ذخیره و انتشار تغییرات</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {!isPremium ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border dark:border-slate-700 space-y-6">
          <div className="text-center">
              <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Gold License Activation</h3>
              <p className="text-[10px] text-slate-400 font-bold">برای فعال‌سازی نسخه دائمی و بدون محدودیت</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border-2 border-dashed border-indigo-100 dark:border-slate-700 text-center relative">
              <p className="text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">Device Identity Code</p>
              <div className="text-xl md:text-2xl font-black text-indigo-600 tracking-wider mb-4 break-all selection:bg-indigo-100">{deviceId}</div>
              <div className="flex gap-2 justify-center">
                <button onClick={copyId} className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-black text-[10px] border shadow-sm">کپی ID دستگاه</button>
                <button onClick={() => window.open(`https://t.me/azmonyar_admin?text=درخواست لایسنس:%0A${deviceId}`,'_blank')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] shadow-lg shadow-indigo-600/20">تماس با پشتیبانی</button>
              </div>
          </div>
          <div className="space-y-4">
            <input type="text" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value.toUpperCase())} placeholder="XXXX-XXXX-XXXX-XXXX" className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none text-center font-black tracking-[0.2em] text-xl dark:text-white focus:border-indigo-500 transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-sm" />
            <button onClick={verifyLicense} disabled={isVerifying} className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-900/20 active:scale-95 transition-all">
                {isVerifying ? <i className="fa-solid fa-shield-halved fa-spin text-2xl"></i> : 'تایید و ارتقای حساب'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-12 rounded-[3.5rem] text-white text-center shadow-2xl border-2 border-amber-500/30 relative overflow-hidden group">
            <div className="relative z-10">
                <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-slate-900 shadow-2xl shadow-amber-500/40 group-hover:rotate-12 transition-transform duration-500"><i className="fa-solid fa-crown"></i></div>
                <h3 className="text-3xl font-black mb-3 text-amber-400">شما کاربر طلایی هستید</h3>
                <p className="text-sm opacity-60 font-bold">تمامی محدودیت‌ها برای دستگاه شما برداشته شده است.</p>
                <div className="mt-8 inline-block px-5 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">Lifetime License Active</div>
            </div>
            {/* دکوراسیون */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-sm">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 text-center tracking-widest">App Appearance</label>
            <button onClick={() => setDarkMode(!darkMode)} className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${darkMode ? 'bg-slate-900 text-white border-2 border-amber-400' : 'bg-slate-50 text-slate-700 border-2 border-slate-100'}`}>
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i> {darkMode ? 'حالت روشن' : 'حالت تاریک'}
            </button>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/10 p-8 rounded-[2.5rem] border-2 border-dashed border-rose-100 dark:border-rose-900/30 flex flex-col items-center justify-center gap-4">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Factory Reset</p>
            <button onClick={() => {if(window.confirm('هشدار: تمامی داده‌ها پاک خواهند شد. ادامه می‌دهید؟')){localStorage.clear(); window.location.reload();}}} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] shadow-lg shadow-rose-900/20">پاکسازی کل حافظه</button>
          </div>
      </div>
    </div>
  );
};

export default Settings;
