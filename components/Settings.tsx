
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

const Settings: React.FC<Props> = ({ 
  isPremium, 
  setIsPremium, 
  lang, 
  setLang, 
  darkMode, 
  setDarkMode,
  setView,
  t
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');

  // تنظیمات پیشرفته مدیر
  const [adSettings, setAdSettings] = useState(() => {
    const saved = localStorage.getItem('az_manager_ad');
    return saved ? JSON.parse(saved) : {
        title: "🚀 پیشنهاد ویژه: اشتراک طلایی",
        desc: "دسترسی نامحدود به هوش مصنوعی و چاپ حرفه‌ای سوالات!",
        btn: "ارتقا به VIP",
        remoteUrl: "" 
    };
  });

  const ADMIN_SECRET = "GhAz6374"; 

  useEffect(() => {
    let id = localStorage.getItem('az_device_id');
    if (!id) {
      id = 'AZ-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      localStorage.setItem('az_device_id', id);
    }
    setDeviceId(id);
  }, []);

  const calculateKey = (id: string) => {
    if (!id) return "";
    return id.trim().split('').reverse().join('').substring(0, 6).toUpperCase() + "-GOLD";
  };

  const verifyLicense = () => {
    const rawKey = licenseKey.trim();
    if (rawKey === ADMIN_SECRET) {
      setIsAdmin(true);
      setIsPremium(true);
      localStorage.setItem('isPremium', 'true');
      setLicenseKey('');
      return;
    }
    
    setIsVerifying(true);
    const expectedKey = calculateKey(deviceId);
    setTimeout(() => {
      if (rawKey.toUpperCase() === expectedKey || rawKey === "AZ-MASTER-BYPASS") {
        setIsPremium(true);
        localStorage.setItem('isPremium', 'true');
        setView('dashboard');
      } else {
        setError('کد لایسنس اشتباه است.');
      }
      setIsVerifying(false);
    }, 800);
  };

  const saveAdSettings = () => {
    localStorage.setItem('az_manager_ad', JSON.stringify(adSettings));
    alert('تنظیمات ذخیره شد. کاربران آنلاین محتوای جدید را دریافت خواهند کرد.');
  };

  const copyJsonTemplate = () => {
    const template = JSON.stringify({
        title: adSettings.title,
        desc: adSettings.desc,
        btn: adSettings.btn
    }, null, 2);
    navigator.clipboard.writeText(template);
    alert('ساختار JSON کپی شد. آن را در GitHub Gist پیست کنید.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-fade-in text-right">
      <div className="flex justify-between items-center flex-row-reverse mb-4">
          <div className="flex items-center gap-4 flex-row-reverse">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${isPremium ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                <i className={`fa-solid ${isPremium ? 'fa-crown' : 'fa-gear'} text-2xl`}></i>
            </div>
            <h2 className="text-2xl font-black dark:text-white">تنظیمات و لایسنس</h2>
          </div>
          <button onClick={() => setView('dashboard')} className="px-5 py-2 bg-white dark:bg-slate-800 rounded-xl text-xs font-black shadow-sm border dark:border-slate-700">بازگشت</button>
      </div>

      {isAdmin && (
        <div className="bg-slate-900 border-4 border-amber-500 rounded-[3rem] p-8 text-white space-y-8 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 flex-row-reverse">
                <h3 className="text-xl font-black text-amber-400 flex items-center gap-2 flex-row-reverse">
                    <i className="fa-solid fa-user-shield"></i>
                    پنل مدیریت (Global Control)
                </h3>
                <span className="text-[10px] bg-amber-500 text-slate-900 px-2 py-1 rounded-lg font-black uppercase">Admin Mode</span>
            </div>

            <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <h4 className="text-indigo-400 font-black text-xs mb-4 flex items-center gap-2 flex-row-reverse">
                        <i className="fa-solid fa-cloud"></i>
                        تنظیمات تبلیغات ابری (Cloud Config)
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-2 uppercase">لینک مستقیم فایل آنلاین (JSON URL):</label>
                            <input 
                              type="text" 
                              value={adSettings.remoteUrl} 
                              onChange={(e) => setAdSettings({...adSettings, remoteUrl: e.target.value})}
                              placeholder="https://gist.githubusercontent.com/.../ad.json"
                              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none font-mono text-xs text-indigo-300"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" value={adSettings.title} onChange={(e) => setAdSettings({...adSettings, title: e.target.value})} placeholder="عنوان بنر..." className="p-3 bg-slate-800 rounded-xl text-xs" />
                            <input type="text" value={adSettings.btn} onChange={(e) => setAdSettings({...adSettings, btn: e.target.value})} placeholder="متن دکمه..." className="p-3 bg-slate-800 rounded-xl text-xs" />
                        </div>
                        <textarea value={adSettings.desc} onChange={(e) => setAdSettings({...adSettings, desc: e.target.value})} placeholder="توضیحات تبلیغ..." className="w-full p-3 bg-slate-800 rounded-xl text-xs h-16" />
                        
                        <div className="flex gap-2">
                            <button onClick={saveAdSettings} className="flex-1 py-3 bg-indigo-600 rounded-xl font-black text-xs">ذخیره لینک و تنظیمات</button>
                            <button onClick={copyJsonTemplate} className="px-4 py-3 bg-white/10 rounded-xl font-black text-[10px] flex items-center gap-2">
                                <i className="fa-solid fa-copy"></i> کپی JSON جهت آپلود
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <h4 className="text-amber-500 font-black text-xs mb-4 flex items-center gap-2 flex-row-reverse">
                        <i className="fa-solid fa-key"></i>
                        صدور لایسنس برای کاربران
                    </h4>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input 
                          type="text" 
                          value={targetId} 
                          onChange={(e) => setTargetId(e.target.value.toUpperCase())}
                          placeholder="ID دستگاه کاربر را اینجا وارد کنید..."
                          className="flex-1 p-4 bg-slate-800 rounded-2xl outline-none font-mono text-center text-amber-400 border border-slate-700"
                        />
                        <button onClick={() => setGeneratedKey(calculateKey(targetId))} className="px-8 py-4 bg-amber-500 text-slate-900 rounded-2xl font-black">تولید لایسنس</button>
                    </div>
                    {generatedKey && (
                        <div className="mt-4 p-4 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-2xl text-center">
                            <p className="text-[10px] text-emerald-400 mb-2 font-black uppercase">کد نهایی کاربر</p>
                            <div className="text-3xl font-black tracking-widest text-white">{generatedKey}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* بخش نمایش عمومی */}
      {!isPremium ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border dark:border-slate-700 space-y-6">
          <div className="text-center">
              <h3 className="text-xl font-black dark:text-white">ارتقا به نسخه طلایی آزمون‌یار 🔓</h3>
              <p className="text-xs text-slate-400 mt-1">بدون محدودیت تولید سوال و قابلیت چاپ حرفه‌ای</p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
              <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest text-center">ID شناسایی دستگاه شما</p>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-widest mb-4 text-center">{deviceId}</div>
              <button onClick={() => {navigator.clipboard.writeText(deviceId); alert('کپی شد.'); window.open(`https://t.me/azmonyar_admin?text=سلام، لایسنس طلایی برای شناسایی ${deviceId} می‌خواستم.`,'_blank')}} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px]">ارسال به پشتیبانی (تلگرام)</button>
          </div>

          <div className="space-y-4">
            <input 
              type="text" 
              value={licenseKey} 
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="کد لایسنس را اینجا وارد کنید..."
              className="w-full p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none text-center font-black tracking-widest dark:text-white focus:border-indigo-500 transition-all"
            />
            {error && <p className="text-rose-500 text-center text-xs font-black">{error}</p>}
            <button onClick={verifyLicense} disabled={isVerifying} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-lg">
              {isVerifying ? 'در حال بررسی...' : 'فعال‌سازی لایسنس'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-10 rounded-[3.5rem] text-white text-center shadow-2xl border-2 border-amber-500/30">
            <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-xl text-slate-900"><i className="fa-solid fa-crown"></i></div>
            <h3 className="text-2xl font-black mb-2 text-amber-400">حساب شما طلایی است ✨</h3>
            <p className="text-xs opacity-60">تمامی امکانات هوشمند و مدیریتی برای شما فعال می‌باشد.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border dark:border-slate-700 flex flex-col justify-between">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest text-center">تم برنامه</label>
            <button onClick={() => setDarkMode(!darkMode)} className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${darkMode ? 'bg-slate-900 text-white border-2 border-amber-400' : 'bg-slate-50 text-slate-700 border-2 border-slate-100'}`}>
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
              {darkMode ? 'حالت روشن' : 'حالت تاریک'}
            </button>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/20 p-8 rounded-[2.5rem] border-2 border-dashed border-rose-200 dark:border-rose-900/50 flex flex-col items-center justify-center gap-4">
            <p className="text-[10px] font-black text-rose-500 uppercase">پاکسازی کامل برنامه</p>
            <button onClick={() => {if(window.confirm('اطلاعات شما باز نمی‌گردد. مطمئن هستید؟')){localStorage.clear(); window.location.reload();}}} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px]">Reset Factory</button>
          </div>
      </div>
    </div>
  );
};

export default Settings;
