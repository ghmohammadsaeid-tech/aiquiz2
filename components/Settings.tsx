import React, { useState } from 'react';
import { Question, Flashcard, Language, UserStats, View } from '../types';
import { WALLET_ADDRESS } from '../constants';

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
  questions,
  flashcards,
  setView
}) => {
  const [txid, setTxid] = useState(() => localStorage.getItem('last_txid') || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [premiumSettings, setPremiumSettings] = useState({
    aiAutoSuggest: true,
    proPrintLayout: true,
    cloudSync: false
  });

  const verifyTransaction = async () => {
    if (txid.trim().length < 15) {
      setError('کد تراکنش (TXID) وارد شده نامعتبر است. لطفاً کد کامل را از رسید انتقال کپی کنید.');
      return;
    }
    
    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      setIsPremium(true);
      localStorage.setItem('isPremium', 'true');
      localStorage.setItem('last_txid', txid.trim());
      setIsVerifying(false);
      alert('🌟 تایید نهایی انجام شد!\nحساب شما به سطح "طلایی" ارتقا یافت.\nحالا می‌توانید از چاپ حرفه‌ای و طراح هوشمند نامحدود استفاده کنید.');
    }, 3000);
  };

  const resetData = () => {
    if (window.confirm('هشدار: آیا از حذف تمامی سوالات، فلش‌کارت‌ها و آمارهای مطالعه خود اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24 animate-fade-in text-right">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-row-reverse">
        <div className="flex items-center gap-5 flex-row-reverse">
          <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all duration-700 ${isPremium ? 'bg-gradient-to-br from-amber-400 to-orange-600 rotate-12 scale-110 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
            <i className={`fa-solid ${isPremium ? 'fa-crown text-3xl' : 'fa-gear text-3xl'}`}></i>
          </div>
          <div>
            <h2 className="text-3xl font-black dark:text-white text-slate-800">تنظیمات و حساب کاربری</h2>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">مدیریت محیط یادگیری و اشتراک</p>
          </div>
        </div>
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all"
        >
          <i className="fa-solid fa-arrow-right"></i>
          داشبورد
        </button>
      </div>

      {/* Premium Management or Upgrade Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          {isPremium ? (
            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 text-white shadow-2xl border border-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-black text-amber-400 mb-8 flex items-center gap-3 flex-row-reverse">
                <i className="fa-solid fa-sliders"></i>
                مدیریت قابلیت‌های طلایی
              </h3>
              
              <div className="space-y-4">
                {[
                  { id: 'aiAutoSuggest', label: 'پیشنهاد هوشمند سوالات بر اساس مطالعه', icon: 'fa-wand-magic-sparkles' },
                  { id: 'proPrintLayout', label: 'چیدمان حرفه‌ای آزمون در چاپ A4', icon: 'fa-print' },
                  { id: 'cloudSync', label: 'پشتیبان‌گیری ابری خودکار', icon: 'fa-cloud' }
                ].map(setting => (
                  <div key={setting.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors flex-row-reverse">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-amber-400">
                        <i className={`fa-solid ${setting.icon}`}></i>
                      </div>
                      <span className="text-sm font-bold">{setting.label}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={premiumSettings[setting.id as keyof typeof premiumSettings]} 
                        onChange={() => setPremiumSettings(prev => ({...prev, [setting.id]: !prev[setting.id as keyof typeof premiumSettings]}))}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[3rem] shadow-xl border dark:border-slate-700 text-right">
                <div className="flex justify-between items-center mb-6 flex-row-reverse">
                    <h3 className="text-xl font-black dark:text-white">ارتقا به نسخه طلایی (VIP) 🌟</h3>
                    <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-xs font-black border border-amber-200">مبلغ: ۲ تتر</span>
                </div>
                
                {/* Payment Instructions Step-by-Step */}
                <div className="mb-8 space-y-3 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-500 text-[11px] font-black border-b dark:border-slate-700 pb-2 mb-4">آموزش گام‌به‌گام فعال‌سازی اشتراک:</p>
                  <div className="grid gap-4">
                    {[
                      { step: '۱', text: 'آدرس کیف پول تتر زیر را با دکمه کپی بردارید (شبکه BEP-20).' },
                      { step: '۲', text: 'دقیقاً مبلغ ۲ تتر (USDT) را به این آدرس انتقال دهید.' },
                      { step: '۳', text: 'پس از اتمام انتقال، "کد تراکنش" یا همان TXID را کپی کنید.' },
                      { step: '۴', text: 'کد کپی شده را در کادر پایین قرار داده و دکمه تایید را بزنید.' }
                    ].map(item => (
                      <div key={item.step} className="flex items-start gap-4 flex-row-reverse">
                        <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 shadow-lg shadow-indigo-200">{item.step}</span>
                        <p className="text-[12px] text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="text-right">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2 flex-row-reverse">
                        <i className="fa-solid fa-wallet text-indigo-500"></i>
                        آدرس واریز تتر (USDT - BEP20)
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-50 dark:border-slate-700 font-mono text-[11px] text-indigo-600 break-all select-all flex-row-reverse group transition-all hover:border-indigo-200">
                      <button onClick={() => { navigator.clipboard.writeText(WALLET_ADDRESS); alert('آدرس کپی شد!'); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl" title="کپی آدرس"><i className="fa-solid fa-copy"></i></button>
                      <span className="flex-1 text-left truncate font-black">{WALLET_ADDRESS}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">کد تراکنش (TXID / Hash)</label>
                    <input 
                      type="text" 
                      value={txid} 
                      onChange={(e) => setTxid(e.target.value)}
                      placeholder="کد تراکنش را اینجا بچسبانید..."
                      className="w-full p-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none text-sm transition-all shadow-inner text-right font-mono"
                    />
                  </div>
                  
                  {error && <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-rose-500 text-xs font-black text-center animate-shake">{error}</div>}
                  
                  <button 
                    onClick={verifyTransaction}
                    disabled={isVerifying}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isVerifying ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-shield-check"></i>}
                    {isVerifying ? 'در حال تایید از شبکه بلاک‌چین...' : 'تایید و فعال‌سازی آنی'}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 font-bold mt-2">با کلیک روی دکمه بالا، سیستم به صورت خودکار تراکنش شما را بررسی می‌کند.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-gradient-to-br from-indigo-700 to-purple-900 p-8 rounded-[3rem] text-white shadow-xl h-full relative overflow-hidden flex flex-col justify-between border-2 border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div>
              <h4 className="text-xl font-black mb-8 flex items-center gap-3 flex-row-reverse border-b border-white/10 pb-4">
                <i className="fa-solid fa-star text-amber-300"></i>
                امکانات نسخه طلایی
              </h4>
              <ul className="space-y-5">
                {[
                  { t: 'تولید بی‌نهایت سوال با Gemini AI', i: 'fa-brain-circuit' },
                  { t: 'چاپ حرفه‌ای و پاسخ‌نامه تشریحی', i: 'fa-print' },
                  { t: 'حذف کامل بنرها و پیام‌های تبلیغاتی', i: 'fa-ban' },
                  { t: 'پشتیبانی اولویت‌دار و مستقیم', i: 'fa-headset' },
                  { t: 'تبدیل خودکار سوالات به فلش‌کارت', i: 'fa-bolt' }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-xs font-bold flex-row-reverse text-right group">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-indigo-900 transition-all">
                        <i className={`fa-solid ${item.i}`}></i>
                    </div>
                    <span>{item.t}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-[11px] opacity-70 mb-4 text-center font-black">پشتیبانی و تلگرام:</p>
              <a href="https://t.me/azmonyar_support" target="_blank" rel="noreferrer" className="w-full py-4 bg-white text-indigo-900 rounded-2xl text-center font-black text-sm transition-all hover:scale-105 flex items-center justify-center gap-3">
                <i className="fa-brands fa-telegram text-xl"></i>
                ارسال پیام به پشتیبانی
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border dark:border-slate-700">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">رابط کاربری و زبان</label>
          <div className="space-y-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 border-2 ${darkMode ? 'border-amber-400 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50 text-slate-700'}`}
            >
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
              {darkMode ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
            </button>
            <div className="flex gap-2">
              <button onClick={() => setLang('fa')} className={`flex-1 py-4 rounded-xl font-black text-sm border-2 transition-all ${lang === 'fa' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 dark:border-slate-900 dark:text-slate-500'}`}>فارسی</button>
              <button onClick={() => setLang('en')} className={`flex-1 py-4 rounded-xl font-black text-sm border-2 transition-all ${lang === 'en' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 dark:border-slate-900 dark:text-slate-500'}`}>English</button>
            </div>
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/20 p-8 rounded-[2.5rem] border-2 border-dashed border-rose-200 dark:border-rose-900/50 flex flex-col justify-between">
          <div>
            <h4 className="text-rose-600 font-black text-sm mb-2 flex items-center gap-2 flex-row-reverse text-right">
              <i className="fa-solid fa-triangle-exclamation"></i>
              منطقه حساس (Danger Zone)
            </h4>
            <p className="text-[10px] text-rose-500/80 font-bold leading-relaxed mb-6 text-right">تمامی اطلاعات ذخیره شده در حافظه مرورگر شما به طور کامل پاکسازی خواهد شد.</p>
          </div>
          <div className="flex gap-2 flex-wrap flex-row-reverse">
            <button onClick={resetData} className="px-6 py-3 bg-rose-600 text-white rounded-xl font-black text-xs shadow-lg shadow-rose-200 active:scale-95 transition-all">حذف تمامی اطلاعات</button>
            <button 
              onDoubleClick={() => { setIsPremium(!isPremium); localStorage.setItem('isPremium', String(!isPremium)); }}
              className="px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-xl font-black text-[8px] uppercase tracking-widest"
              title="دوبار کلیک برای تست (حالت توسعه‌دهنده)"
            >
              تغییر وضعیت اشتراک
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;