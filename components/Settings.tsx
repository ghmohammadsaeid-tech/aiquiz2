
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

const Settings: React.FC<Props> = ({ isPremium, setIsPremium, darkMode, setDarkMode, setView }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [adSettings, setAdSettings] = useState(() => {
    const saved = localStorage.getItem('az_manager_ad');
    return saved ? JSON.parse(saved) : { title: "🚀 پیشنهاد ویژه: اشتراک طلایی", desc: "دسترسی نامحدود به هوشمندترین ابزار یادگیری!", btn: "ارتقا به VIP", remoteUrl: "" };
  });

  useEffect(() => {
    let id = localStorage.getItem('az_device_id') || 'AZ-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    localStorage.setItem('az_device_id', id);
    setDeviceId(id);
  }, []);

  const verifyLicense = () => {
    if (licenseKey === "GhAz6374") { setIsAdmin(true); setIsPremium(true); setLicenseKey(''); return; }
    setIsVerifying(true);
    setTimeout(() => {
      const expected = deviceId.split('').reverse().join('').substring(0, 6).toUpperCase() + "-GOLD";
      if (licenseKey.toUpperCase() === expected) { setIsPremium(true); localStorage.setItem('isPremium', 'true'); setView('dashboard'); }
      else alert('کد نامعتبر!');
      setIsVerifying(false);
    }, 800);
  };

  const copyAndGoToGist = () => {
    const template = JSON.stringify({ title: adSettings.title, desc: adSettings.desc, btn: adSettings.btn, url: adSettings.remoteUrl }, null, 2);
    navigator.clipboard.writeText(template);
    alert('JSON تبلیغ کپی شد. اکنون به صفحه مدیریت گیت‌هاب هدایت می‌شوید.');
    window.open('https://gist.github.com/', '_blank');
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
                <span className="text-[10px] bg-amber-500 text-slate-900 px-2 py-1 rounded-lg font-black">ADMIN ACCESS</span>
                <h3 className="text-xl font-black text-amber-400">مرکز کنترل ابری مدیر</h3>
            </div>
            <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <h4 className="text-indigo-400 font-black text-xs mb-4">مدیریت سراسری تبلیغات (Global Ads)</h4>
                    <div className="space-y-4">
                        <input type="text" value={adSettings.remoteUrl} onChange={(e) => setAdSettings({...adSettings, remoteUrl: e.target.value})} placeholder="لینک Raw JSON..." className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl font-mono text-xs text-emerald-400" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" value={adSettings.title} onChange={(e) => setAdSettings({...adSettings, title: e.target.value})} placeholder="عنوان بنر..." className="p-3 bg-slate-800 rounded-xl text-xs" />
                            <input type="text" value={adSettings.btn} onChange={(e) => setAdSettings({...adSettings, btn: e.target.value})} placeholder="متن دکمه..." className="p-3 bg-slate-800 rounded-xl text-xs" />
                        </div>
                        <textarea value={adSettings.desc} onChange={(e) => setAdSettings({...adSettings, desc: e.target.value})} placeholder="توضیحات تبلیغ..." className="w-full p-3 bg-slate-800 rounded-xl text-xs h-16" />
                        <div className="flex gap-3">
                            <button onClick={() => {localStorage.setItem('az_manager_ad', JSON.stringify(adSettings)); alert('ذخیره شد!');}} className="flex-1 py-4 bg-indigo-600 rounded-2xl font-black text-xs">۱. ذخیره در برنامه</button>
                            <button onClick={copyAndGoToGist} className="flex-1 py-4 bg-white/10 rounded-2xl font-black text-xs flex items-center justify-center gap-2">۲. کپی و ساخت در Gist</button>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <h4 className="text-amber-500 font-black text-xs mb-4 text-right">صدور لایسنس کاربر</h4>
                    <div className="flex gap-3">
                        <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value.toUpperCase())} placeholder="ID کاربر..." className="flex-1 p-4 bg-slate-800 rounded-2xl text-center font-mono text-amber-400" />
                        <button onClick={() => setGeneratedKey(targetId.split('').reverse().join('').substring(0, 6).toUpperCase() + "-GOLD")} className="px-8 py-4 bg-amber-500 text-slate-900 rounded-2xl font-black">تولید</button>
                    </div>
                    {generatedKey && <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-center text-2xl font-black tracking-widest">{generatedKey}</div>}
                </div>
            </div>
        </div>
      )}

      {!isPremium ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border dark:border-slate-700 space-y-6">
          <div className="text-center">
              <h3 className="text-xl font-black dark:text-white">ارتقا به نسخه طلایی آزمون‌یار 🔓</h3>
              <p className="text-xs text-slate-400">دسترسی به هوش مصنوعی و چاپ حرفه‌ای</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border-2 border-dashed text-center">
              <p className="text-[10px] font-black text-slate-400 mb-1 uppercase">ID شناسایی شما</p>
              <div className="text-2xl font-black text-indigo-600 tracking-widest mb-4">{deviceId}</div>
              <button onClick={() => window.open(`https://t.me/azmonyar_admin?text=ID:${deviceId}`,'_blank')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px]">ارسال به پشتیبانی</button>
          </div>
          <div className="space-y-4">
            <input type="text" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} placeholder="کد لایسنس..." className="w-full p-5 bg-slate-50 dark:bg-slate-900 border rounded-2xl outline-none text-center font-black tracking-widest dark:text-white" />
            <button onClick={verifyLicense} disabled={isVerifying} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-lg">{isVerifying ? 'در حال بررسی...' : 'فعال‌سازی'}</button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-10 rounded-[3.5rem] text-white text-center shadow-2xl border-2 border-amber-500/30">
            <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-slate-900"><i className="fa-solid fa-crown"></i></div>
            <h3 className="text-2xl font-black mb-2 text-amber-400">حساب شما طلایی است ✨</h3>
            <p className="text-xs opacity-60">تمامی امکانات برای شما فعال می‌باشد.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 flex flex-col justify-between">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 text-center">تم برنامه</label>
            <button onClick={() => setDarkMode(!darkMode)} className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 ${darkMode ? 'bg-slate-900 text-white border-2 border-amber-400' : 'bg-slate-50 text-slate-700 border-2'}`}>
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i> {darkMode ? 'حالت روشن' : 'حالت تاریک'}
            </button>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/20 p-8 rounded-[2.5rem] border-2 border-dashed border-rose-200 flex flex-col items-center justify-center gap-4">
            <p className="text-[10px] font-black text-rose-500 uppercase">پاکسازی کامل</p>
            <button onClick={() => {if(window.confirm('اطلاعات پاک شود؟')){localStorage.clear(); window.location.reload();}}} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px]">Reset Factory</button>
          </div>
      </div>
    </div>
  );
};

export default Settings;
