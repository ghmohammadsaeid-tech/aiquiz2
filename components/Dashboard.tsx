
import React, { useMemo } from 'react';
import { View, Question, Flashcard, UserStats, Language } from '../types';

interface Props {
  questions: Question[];
  flashcards: Flashcard[];
  setView: (v: View) => void;
  dueCards: number;
  userStats: UserStats;
  t: (k: string) => string;
  isPremium: boolean;
  lang: Language;
  dynamicAd: { title: string, desc: string, btn: string, url: string };
  isInstallable: boolean;
  onInstall: () => void;
}

const MOTIVATIONAL_QUOTES = [
  "موفقیت مجموع تلاش‌های کوچکی است که هر روز تکرار می‌شوند. ✨",
  "یادگیری تنها چیزی است که ذهن هرگز از آن خسته نمی‌شود. 🧠",
  "امروز یک قدم کوچک بردار، فردا نتیجه بزرگش رو می‌بینی. 🚀",
  "تکنیک فاینمن: اگر نمی‌تونی ساده توضیحش بدی، یعنی یادش نگرفتی. 💡"
];

const Dashboard: React.FC<Props> = ({ questions, flashcards, setView, dueCards, userStats, isPremium, dynamicAd, isInstallable, onInstall }) => {
  const masteryScore = useMemo(() => {
    if (flashcards.length === 0) return 0;
    const masters = flashcards.filter(c => c.repetitions > 6 && c.easeFactor > 2).length;
    return Math.round((masters / flashcards.length) * 100);
  }, [flashcards]);

  const randomQuote = useMemo(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)], []);

  const handleShareApp = async () => {
    const shareData = {
      title: 'آزمون‌یار هوشمند',
      text: 'سلام! من از اپلیکیشن آزمون‌یار برای یادگیری سریع و طراحی سوالات با هوش مصنوعی استفاده می‌کنم. پیشنهاد می‌کنم تو هم امتحانش کنی! 🚀',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('لینک برنامه کپی شد! می‌توانید آن را برای دوستانتان بفرستید. ✨');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const quickActions = [
    { id: 'exam', label: 'شروع آزمون', icon: 'fa-stopwatch', color: 'bg-rose-500', text: 'ارزیابی سطح' },
    { id: 'flashcards', label: 'یادگیری هوشمند', icon: 'fa-brain', color: 'bg-indigo-600', text: 'مرور SM-2' },
    { id: 'bank', label: 'بانک سوالات', icon: 'fa-book-bookmark', color: 'bg-emerald-500', text: 'مدیریت و چاپ' },
    { id: 'ai', label: 'طراح هوشمند', icon: 'fa-wand-magic-sparkles', color: 'bg-amber-500', text: 'طراحی با AI' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* بنر نصب اپلیکیشن */}
      {isInstallable && (
        <div className="bg-emerald-600 text-white p-4 rounded-3xl shadow-lg animate-bounce-subtle flex items-center justify-between gap-4 flex-row-reverse border-2 border-emerald-400">
            <div className="flex items-center gap-3 flex-row-reverse">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-mobile-screen-button"></i></div>
                <div className="text-right">
                    <div className="text-xs font-black">نصب اپلیکیشن آزمون‌یار</div>
                    <div className="text-[9px] opacity-80 font-bold leading-tight">برای پایداری لایسنس و دسترسی سریع‌تر، نسخه اپلیکیشن را نصب کنید.</div>
                </div>
            </div>
            <button onClick={onInstall} className="px-6 py-2 bg-white text-emerald-700 rounded-xl font-black text-[10px] shadow-md whitespace-nowrap active:scale-95 transition-all">همین الان نصب کن</button>
        </div>
      )}

      {/* هدر و امتیازات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group transition-all duration-500 ${isPremium ? 'bg-slate-900 border-2 border-amber-500/20' : 'bg-gradient-to-br from-indigo-700 to-purple-800'}`}>
          <div className="relative z-10 flex flex-col h-full text-white text-right">
            <div className="flex justify-between items-start mb-10 flex-row-reverse">
              <div>
                <h1 className="text-3xl font-black mb-2">{isPremium ? 'سلام مشترک طلایی! 🌟' : 'سلام نابغه! 🚀'}</h1>
                <p className="opacity-80 text-sm font-bold leading-relaxed max-w-md">{randomQuote}</p>
              </div>
              <div className="text-left">
                <div className="text-4xl font-black text-amber-400 drop-shadow-md">{userStats.xp}</div>
                <div className="text-[10px] font-black uppercase opacity-50">XP SCORE</div>
              </div>
            </div>
            <div className="mt-auto space-y-3">
              <div className="flex justify-between items-end text-xs font-black flex-row-reverse">
                <span className="text-lg uppercase">LEVEL {userStats.level}</span>
                <span className="opacity-60">{userStats.xp % 1000} / 1000 XP</span>
              </div>
              <div className="h-4 bg-white/15 rounded-full overflow-hidden p-1 border border-white/10">
                <div className="h-full rounded-full bg-amber-400 transition-all duration-1000" style={{ width: `${(userStats.xp % 1000) / 10}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'توالی (Streak)', val: userStats.streak, icon: 'fa-fire', color: 'text-amber-500' },
            { label: 'تسلط حافظه', val: `${masteryScore}%`, icon: 'fa-bullseye', color: 'text-indigo-500' },
            { label: 'کل کارت‌ها', val: flashcards.length, icon: 'fa-layer-group', color: 'text-purple-500' },
            { label: 'مرور مانده', val: dueCards, icon: 'fa-hourglass-half', color: 'text-rose-500' }
          ].map((stat, i) => (
            <div key={i} className="dark:bg-slate-800 bg-white p-6 rounded-[2rem] border dark:border-slate-700 shadow-sm flex flex-col justify-between text-right">
              <i className={`fa-solid ${stat.icon} ${stat.color} text-2xl`}></i>
              <div>
                <div className="text-2xl font-black dark:text-white text-slate-800">{stat.val}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* بخش دسترسی سریع (Quick Access) */}
      <div className="space-y-4">
          <h3 className="text-lg font-black dark:text-white text-slate-800 flex items-center gap-2 flex-row-reverse">
              <i className="fa-solid fa-bolt text-amber-400"></i>
              دسترسی سریع
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map(action => (
                  <button 
                    key={action.id} 
                    onClick={() => setView(action.id as View)}
                    className="group bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-right flex flex-col gap-3 overflow-hidden relative"
                  >
                      <div className={`w-10 h-10 ${action.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <i className={`fa-solid ${action.icon}`}></i>
                      </div>
                      <div>
                          <div className="text-xs font-black dark:text-white text-slate-800">{action.label}</div>
                          <div className="text-[9px] font-bold text-slate-400 mt-0.5">{action.text}</div>
                      </div>
                      <div className="absolute -bottom-2 -left-2 text-4xl opacity-[0.03] dark:opacity-[0.05] group-hover:rotate-12 transition-transform">
                          <i className={`fa-solid ${action.icon}`}></i>
                      </div>
                  </button>
              ))}
          </div>
      </div>

      {/* دعوت از دوستان */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row-reverse items-center justify-between gap-6 transition-all hover:shadow-md">
          <div className="flex items-center gap-4 flex-row-reverse text-right">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl shadow-inner">
                  <i className="fa-solid fa-share-nodes"></i>
              </div>
              <div>
                  <h4 className="font-black dark:text-white text-slate-800">معرفی به دوستان</h4>
                  <p className="text-[10px] text-slate-400 font-bold">لذت یادگیری هوشمند را با دیگران به اشتراک بگذارید.</p>
              </div>
          </div>
          <button 
            onClick={handleShareApp}
            className="w-full md:w-auto px-8 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
              <i className="fa-solid fa-paper-plane text-[10px]"></i>
              ارسال دعوت‌نامه
          </button>
      </div>

      {/* تبلیغ سراسری ابری */}
      {!isPremium && (
        <div className="ad-glow p-8 rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between gap-6">
                <div className="text-right flex-1">
                    <h3 className="text-xl font-black mb-2 flex items-center gap-2 flex-row-reverse">
                        <i className="fa-solid fa-crown text-amber-400"></i>
                        {dynamicAd.title}
                    </h3>
                    <div className="text-sm opacity-90 font-bold leading-relaxed">{dynamicAd.desc}</div>
                </div>
                <button onClick={() => dynamicAd.url !== "#" ? window.open(dynamicAd.url, '_blank') : setView('settings')} className="px-10 py-4 bg-white text-indigo-900 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all">
                    {dynamicAd.btn}
                </button>
            </div>
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                <i className="fa-solid fa-sparkles absolute top-4 left-10 text-4xl rotate-12"></i>
                <i className="fa-solid fa-star absolute bottom-4 right-20 text-2xl -rotate-12"></i>
            </div>
        </div>
      )}

      {/* بخش شروع یادگیری (Call to Action) */}
      <div className="grid grid-cols-1 gap-6">
          <div className={`p-10 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center relative overflow-hidden transition-all duration-500 shadow-xl border ${isPremium ? 'bg-slate-900 border-amber-500/20' : 'bg-indigo-600 border-indigo-500'}`}>
              <div className="relative z-10 text-right md:flex-1">
                <h3 className={`font-black text-3xl mb-4 ${isPremium ? 'text-amber-400' : 'text-white'}`}>ماراتن یادگیری امروز 🏁</h3>
                <p className={`text-base leading-relaxed font-medium max-w-2xl ml-auto ${isPremium ? 'text-slate-400' : 'text-indigo-100/90'}`}>
                    {dueCards > 0 ? ` شما ${dueCards} کارت برای مرور دارید. با استفاده از الگوریتم SM-2، مطالب را به حافظه بلندمدت بسپارید.` : ' تبریک! لیست مرور شما برای امروز خالی است. می‌توانید کارت جدید بسازید.'}
                </p>
              </div>
              <div className="relative z-10 mt-8 md:mt-0 md:mr-8 w-full md:w-auto">
                <button 
                  onClick={() => setView('flashcards')} 
                  className={`w-full md:px-12 py-5 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${isPremium ? 'bg-amber-500 text-white' : 'bg-white text-indigo-600'}`}
                >
                  بزن بریم!
                  <i className="fa-solid fa-rocket"></i>
                </button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
