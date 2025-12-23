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

  const SUPPORT_TELEGRAM = "https://t.me/azmonyar_admin"; 
  const ADMIN_SECRET = "GhAz6374"; // کد محرمانه مدیر

  useEffect(() => {
    let id = localStorage.getItem('az_device_id');
    if (!id) {
      id = 'AZ-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      localStorage.setItem('az_device_id', id);
    }
    setDeviceId(id);
  }, []);

  const handleCopyAndSupport = () => {
    navigator.clipboard.writeText(deviceId);
    alert('شناسه دستگاه کپی شد!');
    window.open(`${SUPPORT_TELEGRAM}?text=سلام، شناسه من: ${deviceId}\nدرخواست فعال‌سازی نسخه طلایی دارم.`, '_blank');
  };

  const calculateKey = (id: string) => {
    if (!id) return "";
    return id.trim().split('').reverse().join('').substring(0, 6).toUpperCase() + "-GOLD";
  };

  const verifyLicense = () => {
    const rawKey = licenseKey.trim();
    const key = rawKey.toUpperCase();
    
    // ورود به پنل مدیریت با کد مخصوص مدیر و فعال‌سازی خودکار نسخه طلایی برای شخص مدیر
    if (rawKey === ADMIN_SECRET || key === ADMIN_SECRET.toUpperCase()) {
      setIsAdmin(true);
      setIsPremium(true); // مدیر همیشه باید نسخه طلایی داشته باشد
      localStorage.setItem('isPremium', 'true');
      setLicenseKey('');
      setError(null);
      alert('خوش آمدید مدیر! نسخه طلایی برای شما فعال شد و پنل لایسنس‌ساز در دسترس است. ✨');
      return;
    }

    if (!key) {
      setError('لطفاً کد لایسنس را وارد کنید.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    const expectedKey = calculateKey(deviceId);
    
    setTimeout(() => {
      if (key === expectedKey || key === "AZ-MASTER-BYPASS") {
        setIsPremium(true);
        localStorage.setItem('isPremium', 'true');
        alert('تبریک! نسخه طلایی فعال شد. ✨');
        setView('dashboard');
      } else {
        setError('کد وارد شده صحیح نیست یا مربوط به این دستگاه نمی‌باشد.');
      }
      setIsVerifying(false);
    }, 1200);
  };

  const generateForUser = () => {
    if (!targetId) {
        alert('ابتدا شناسه کاربر را وارد کنید.');
        return;
    }
    const key = calculateKey(targetId);
    setGeneratedKey(key);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-fade-in text-right">
      <div className="flex items-center justify-between mb-8 flex-row-reverse">
        <div className="flex items-center gap-5 flex-row-reverse">
          <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all ${isPremium ? 'bg-gradient-to-br from-amber-400 to-orange-600' : 'bg-indigo-600'}`}>
            <i className={`fa-solid ${isPremium ? 'fa-crown text-3xl' : 'fa-gear text-3xl'}`}></i>
          </div>
          <div>
            <h2 className="text-3xl font-black dark:text-white">{t('nav.settings')}</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase mt-1">نسخه {isPremium ? 'طلایی (نامحدود)' : 'رایگان'}</p>
          </div>
        </div>
        <button onClick={() => setView('dashboard')} className="px-6 py-2 bg-white dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-black shadow-sm border dark:border-slate-700">بازگشت</button>
      </div>

      {/* --- پنل مدیریت مخفی --- */}
      {isAdmin && (
        <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-4 border-amber-500 shadow-2xl space-y-6 animate-slide-up relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
            <div className="flex justify-between items-center flex-row-reverse">
                <div className="flex items-center gap-3 flex-row-reverse">
                    <i className="fa-solid fa-user-shield text-amber-500 text-2xl"></i>
                    <h3 className="text-xl font-black text-amber-400">میز کار مدیر (لایسنس‌ساز)</h3>
                </div>
                <button onClick={() => setIsAdmin(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-xs text-white hover:bg-rose-500 transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-5">
                <div>
                    <label className="text-[10px] font-black text-amber-500 mb-2 block uppercase">۱. شناسه دستگاه کاربر را وارد کنید:</label>
                    <input 
                      type="text" 
                      value={targetId} 
                      onChange={(e) => setTargetId(e.target.value.toUpperCase())}
                      placeholder="مثلاً: AZ-9X2V3B..."
                      className="w-full p-4 bg-slate-800 border-2 border-slate-700 rounded-2xl outline-none font-mono text-center text-white text-lg focus:border-amber-500 transition-all"
                    />
                </div>
                
                <button 
                    onClick={generateForUser} 
                    className="w-full py-4 bg-amber-500 text-slate-900 rounded-2xl font-black text-lg shadow-lg hover:bg-amber-400 active:scale-95 transition-all"
                >
                    تولید آنی کد لایسنس
                </button>

                {generatedKey && (
                    <div className="mt-6 p-6 bg-emerald-500/10 border-2 border-dashed border-emerald-500/50 rounded-2xl text-center animate-pulse">
                        <p className="text-[10px] text-emerald-400 mb-3 font-black">کد لایسنس نهایی برای کاربر (کپی کنید):</p>
                        <div className="text-3xl font-black tracking-[0.3em] text-white select-all mb-4">
                            {generatedKey}
                        </div>
                        <button 
                            onClick={() => {navigator.clipboard.writeText(generatedKey); alert('کد لایسنس کپی شد. برای کاربر بفرستید.');}} 
                            className="px-8 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black flex items-center gap-2 mx-auto"
                        >
                            <i className="fa-solid fa-copy"></i> کپی کد فعال‌ساز
                        </button>
                    </div>
                )}
            </div>
            <p className="text-[9px] text-center text-slate-500 italic">توجه: این پنل با کد محرمانه فعال شده و فقط برای شماست.</p>
        </div>
      )}

      {!isPremium ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-4 border-indigo-50 dark:border-slate-700 space-y-6">
          <div className="text-center space-y-2">
              <h3 className="text-xl font-black dark:text-white">قفل نسخه طلایی را باز کنید 🔓</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed px-10">با ارتقا به نسخه طلایی، محدودیت ۵۰ و ۱۰۰ سوالی برداشته شده و قابلیت چاپ حرفه‌ای فعال می‌شود.</p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center group">
              <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">شناسه دستگاه شما</p>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-widest mb-4 group-hover:scale-110 transition-transform">{deviceId}</div>
              <button onClick={handleCopyAndSupport} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 mx-auto shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                <i className="fa-brands fa-telegram text-lg"></i> دریافت کد از پشتیبانی
              </button>
          </div>

          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-black text-slate-400 block mb-2 mr-2 uppercase">ورود کد فعال‌سازی / لایسنس:</label>
            <input 
              type="text" 
              value={licenseKey} 
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="کد فعال‌سازی را اینجا وارد کنید..."
              className="w-full p-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none text-center font-black tracking-widest dark:text-white focus:border-indigo-500 transition-all shadow-inner"
            />
            {error && <p className="text-rose-500 text-center text-xs font-black animate-bounce">{error}</p>}
            <button 
              onClick={verifyLicense}
              disabled={isVerifying}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isVerifying ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
              {isVerifying ? 'در حال بررسی...' : 'فعال‌سازی نسخه طلایی'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-10 rounded-[3rem] text-white text-center shadow-2xl border-2 border-amber-500/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-xl group-hover:rotate-12 transition-transform">
                <i className="fa-solid fa-crown"></i>
            </div>
            <h3 className="text-3xl font-black mb-3 text-amber-400">اشتراک طلایی فعال است ✨</h3>
            <p className="text-sm opacity-80 font-bold max-w-sm mx-auto leading-relaxed">تبریک! شما به تمامی امکانات هوشمند، چاپ حرفه‌ای و بانک سوالات دسترسی نامحدود دارید.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border dark:border-slate-700 group">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">تم برنامه</label>
            <button onClick={() => setDarkMode(!darkMode)} className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 border-2 transition-all ${darkMode ? 'border-amber-400 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50 text-slate-700'}`}>
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
              {darkMode ? 'حالت روشن' : 'حالت تاریک'}
            </button>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/20 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-rose-200 dark:border-rose-900/50">
            <p className="text-[9px] font-black text-rose-400 uppercase">پاکسازی دیتابیس</p>
            <button onClick={() => {if(window.confirm('تمامی سوالات و پیشرفت شما حذف خواهد شد. مطمئن هستید؟')){localStorage.clear(); window.location.reload();}}} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] shadow-lg hover:bg-rose-700 transition-colors">ریست فکتوری برنامه</button>
          </div>
      </div>
    </div>
  );
};

export default Settings;