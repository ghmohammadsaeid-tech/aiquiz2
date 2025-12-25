
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
  isInstallable: boolean;
  onInstall: () => void;
}

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
    const p1 = hex.slice(0, 4);
    const p2 = hex.slice(4, 8);
    const p3 = (absHash % 99).toString().padStart(2, '0');
    return `AZM-${p1}-${p2}-${p3}`;
};

const Settings: React.FC<Props> = ({ isPremium, setIsPremium, darkMode, setDarkMode, setView, lang, setLang, t, isInstallable, onInstall }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('az_is_admin') === 'true';
  });

  const [targetId, setTargetId] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  
  const [adForm, setAdForm] = useState(() => {
    const saved = localStorage.getItem('az_manager_ad');
    return saved ? JSON.parse(saved) : { 
      title: "🚀 پیشنهاد ویژه: اشتراک طلایی", 
      desc: "دسترسی نامحدود به هوشمندترین ابزار یادگیری!", 
      btn: "ارتقا به VIP", 
      url: "#",
      remoteUrl: "" 
    };
  });

  useEffect(() => {
    const getDeepFingerprint = () => {
        try {
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
            const gl = canvas.getContext('webgl');
            let gpu = "unknown-gpu";
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
            const nav = window.navigator;
            const screen = window.screen;
            const coreData = `${gpu}-${nav.hardwareConcurrency}-${screen.width}x${screen.height}-${screen.colorDepth}`;
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
    if (localStorage.getItem('isPremium') === 'true') setIsPremium(true);
  }, [setIsPremium]);

  const saveAdSettings = () => {
    localStorage.setItem('az_manager_ad', JSON.stringify(adForm));
    alert('✅ تبلیغ جدید با موفقیت ذخیره شد.');
  };

  const handleCopyAndSupport = () => {
    navigator.clipboard.writeText(deviceId);
    const supportUrl = "https://t.me/azmonyar_admin"; 
    alert('✅ شناسه دستگاه کپی شد. اکنون به پشتیبانی هدایت می‌شوید تا کد را ارسال کنید.');
    window.open(supportUrl, '_blank');
  };

  const verifyLicense = () => {
    const inputKey = licenseKey.trim();
    if (inputKey === "GhAz6374") { 
        setIsAdmin(true); 
        localStorage.setItem('az_is_admin', 'true');
        setIsPremium(true); 
        alert('حالت مدیریت فعال شد.');
        return; 
    }
    setIsVerifying(true);
    setTimeout(() => {
      const expected = generateSecureLicense(deviceId);
      if (inputKey.toUpperCase() === expected.toUpperCase()) { 
          setIsPremium(true); 
          localStorage.setItem('isPremium', 'true'); 
          alert('لایسنس با موفقیت فعال شد! ✨');
          setView('dashboard'); 
      } else {
          alert('لایسنس اشتباه است.');
      }
      setIsVerifying(false);
    }, 1200);
  };

  const logoutAdmin = () => {
    if(window.confirm('خروج از پنل مدیریت؟')) {
        setIsAdmin(false);
        localStorage.removeItem('az_is_admin');
    }
  };

  const languages = [
    { id: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'ku', label: 'کوردی', flag: '☀️' },
    { id: 'ar', label: 'العربية', flag: '🇸🇦' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-4 animate-fade-in text-right">
      <div className="flex justify-between items-center flex-row-reverse">
          <h2 className="text-xl md:text-2xl font-black dark:text-white flex items-center gap-3 flex-row-reverse">
            <i className="fa-solid fa-gear text-indigo-500"></i> {t('nav.settings')}
          </h2>
          <button onClick={() => setView('dashboard')} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-black shadow-md border dark:border-slate-700">{t('common.back')}</button>
      </div>

      {/* App Installation Section */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-xl border-4 border-black space-y-6">
          <div className="flex items-center justify-between flex-row-reverse">
            <h3 className="text-sm font-black dark:text-white flex items-center gap-2 flex-row-reverse">
                <i className="fa-solid fa-mobile-screen text-emerald-500 text-lg"></i> سیستم و نصب
            </h3>
          </div>
          <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
              <div className="text-right flex-1">
                  <p className="text-sm font-black dark:text-white mb-1">نسخه اپلیکیشن آزمون‌یار</p>
                  <p className="text-[10px] text-slate-500 font-bold">برای تجربه کاربری بهتر و دسترسی سریع، اپلیکیشن را نصب کنید.</p>
              </div>
              <button 
                onClick={onInstall}
                disabled={!isInstallable}
                className={`w-full md:w-auto px-8 py-3 rounded-2xl font-black text-xs border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 ${isInstallable ? 'bg-emerald-400 text-black active:translate-x-0.5 active:translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'}`}
              >
                  <i className="fa-solid fa-download"></i>
                  {isInstallable ? 'نصب اپلیکیشن' : 'نصب شده یا غیرفعال'}
              </button>
          </div>
      </div>

      {/* Language Selector */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-xl border-4 border-black space-y-6">
          <div className="flex items-center justify-between flex-row-reverse">
            <h3 className="text-sm font-black dark:text-white flex items-center gap-2 flex-row-reverse">
                <i className="fa-solid fa-language text-indigo-500 text-lg"></i> {t('settings.language')}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {languages.map((l) => (
                  <button 
                    key={l.id} 
                    onClick={() => setLang(l.id as Language)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${lang === l.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-700 text-slate-400'}`}
                  >
                      <span className="text-2xl">{l.flag}</span>
                      <span className="text-[11px] font-black">{l.label}</span>
                  </button>
              ))}
          </div>
      </div>

      {isAdmin && (
        <div className="space-y-8 animate-slide-up">
            <div className="bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-[2.5rem] p-6 md:p-8 space-y-8 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center flex-row-reverse relative z-10">
                    <h3 className="text-sm md:text-lg font-black text-indigo-600 flex items-center gap-3 flex-row-reverse">
                        <i className="fa-solid fa-rectangle-ad"></i> مدیریت تبلیغات سراسری
                    </h3>
                    <button onClick={logoutAdmin} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black shadow-lg">خروج از ادمین</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 pr-2">عنوان تبلیغ:</label>
                        <input type="text" value={adForm.title} onChange={(e) => setAdForm({...adForm, title: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 font-black text-xs outline-none focus:border-indigo-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 pr-2">متن دکمه:</label>
                        <input type="text" value={adForm.btn} onChange={(e) => setAdForm({...adForm, btn: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 font-black text-xs outline-none focus:border-indigo-500" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 pr-2">توضیحات کوتاه:</label>
                        <textarea value={adForm.desc} onChange={(e) => setAdForm({...adForm, desc: e.target.value})} className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 font-black text-xs outline-none focus:border-indigo-500 resize-none" />
                    </div>
                </div>
                <button onClick={saveAdSettings} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all relative z-10">
                    انتشار فوری تبلیغ
                </button>
            </div>

            <div className="bg-slate-900 border-4 border-amber-500 rounded-[2.5rem] p-6 md:p-8 text-white space-y-8 shadow-2xl">
                <h3 className="text-lg font-black text-amber-400 flex items-center gap-3 flex-row-reverse">
                    <i className="fa-solid fa-key"></i> صدور لایسنس جدید
                </h3>
                <div className="flex flex-col md:flex-row gap-3">
                    <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value.toUpperCase())} placeholder="HW-ID را وارد کنید..." className="flex-1 p-4 bg-slate-800 rounded-2xl text-center font-mono text-amber-400 outline-none border border-white/5" />
                    <button onClick={() => setGeneratedKey(generateSecureLicense(targetId))} className="py-4 md:px-8 bg-amber-500 text-slate-900 rounded-2xl font-black">تولید</button>
                </div>
                {generatedKey && (
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center animate-bounce-subtle">
                        <div className="text-xl md:text-2xl font-black text-emerald-400 tracking-widest uppercase">{generatedKey}</div>
                        <button onClick={() => {navigator.clipboard.writeText(generatedKey); alert('کپی شد.');}} className="text-[10px] text-slate-400 mt-2 underline">کپی لایسنس</button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* User Area */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-xl border-4 border-black space-y-8">
        {!isPremium ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-black dark:text-white">ارتقای دائمی حساب 🔒</h3>
                <p className="text-[10px] text-slate-400 font-bold">این لایسنس مادام‌العمر و مخصوص همین دستگاه است.</p>
            </div>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[2.5rem] border-2 border-indigo-100 dark:border-slate-700 text-center space-y-4">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Hardware Device Identity</span>
                <div className="text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider font-mono bg-white dark:bg-slate-800 py-3 rounded-2xl border border-indigo-200">{deviceId}</div>
                
                <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleCopyAndSupport} 
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                        کپی شناسه و ارسال به پشتیبانی
                    </button>
                    <p className="text-[9px] text-slate-400 font-bold leading-relaxed px-4">
                        پس از کلیک، شناسه کپی شده و تلگرام پشتیبانی باز می‌شود. کد را برای دریافت لایسنس ارسال کنید.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
              <input type="text" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} placeholder="لایسنس را وارد کنید..." className="w-full p-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-3xl outline-none text-center font-black text-lg dark:text-white focus:border-indigo-500" />
              <button onClick={verifyLicense} disabled={isVerifying} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                  {isVerifying ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-shield-check"></i> فعال‌سازی لایسنس</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white text-center shadow-2xl border-4 border-amber-500/20 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-subtle"><i className="fa-solid fa-crown text-2xl text-white"></i></div>
                <h3 className="text-2xl font-black text-amber-400">اشتراک طلایی فعال است</h3>
                <p className="text-[11px] opacity-60 font-bold max-w-sm mx-auto">تمامی قابلیت‌های هوشمند برای این دستگاه آزاد شد.</p>
              </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-black font-black text-xs shadow-sm flex flex-col items-center gap-3 transition-colors active:scale-95">
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'} text-2xl`}></i>
              {darkMode ? 'حالت روز' : 'حالت شب'}
            </button>
            <button onClick={() => {if(window.confirm('آیا از بازنشانی داده‌ها مطمئن هستید؟')){localStorage.clear(); window.location.reload();}}} className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] border-2 border-black font-black text-xs text-rose-500 flex flex-col items-center gap-3 transition-colors active:scale-95">
              <i className="fa-solid fa-trash-can text-2xl"></i>
              پاکسازی
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
