
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
      text: 'سلام! من از اپلیکیشن آزمون‌یار برای یادگیری سریع استفاده می‌کنم. پیشنهاد می‌کنم تو هم امتحانش کنی! 🚀',
      url: window.location.href
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert('لینک کپی شد!');
      }
    } catch (err) {}
  };

  const quickActions = [
    { id: 'exam', label: 'شروع آزمون', icon: 'fa-stopwatch', color: 'bg-rose-500', text: 'ارزیابی سطح' },
    { id: 'flashcards', label: 'یادگیری هوشمند', icon: 'fa-brain', color: 'bg-indigo-600', text: 'مرور SM-2' },
    { id: 'bank', label: 'بانک سوالات', icon: 'fa-book-bookmark', color: 'bg-emerald-500', text: 'مدیریت و چاپ' },
    { id: 'ai', label: 'طراح هوشمند', icon: 'fa-wand-magic-sparkles', color: 'bg-amber-500', text: 'طراحی با AI' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {isInstallable && (
        <div className="relative group overflow-hidden bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-[5px] border-black shadow-[12px_12px_0px_0px_rgba(16,185,129,1)] dark:shadow-[12px_12px_0px_0px_rgba(16,185,129,0.4)] flex flex-col md:flex-row-reverse items-center justify-between gap-8 animate-fade-in">
            <div className="flex items-center gap-6 flex-row-reverse text-right flex-1">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center text-4xl border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-float">
                    <i className="fa-solid fa-cloud-arrow-down"></i>
                </div>
                <div>
                    <h4 className="text-2xl font-black dark:text-white text-slate-900 uppercase tracking-tighter">نصب نسخه اپلیکیشن (PWA)</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-2 leading-relaxed">برای دسترسی سریع‌تر، آفلاین و بدون نیاز به مرورگر، آزمون‌یار را روی دسکتاپ یا موبایل خود نصب کنید.</p>
                </div>
            </div>
            <button onClick={onInstall} className="w-full md:w-auto px-12 py-5 bg-emerald-500 text-black rounded-2xl font-black text-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3">
                <i className="fa-solid fa-download"></i> نصب فوری
            </button>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 rounded-[2.5rem] p-8 md:p-12 border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.1)] relative overflow-hidden group ${isPremium ? 'bg-slate-900' : 'bg-indigo-600'}`}>
          <div className="relative z-10 flex flex-col h-full text-white text-right">
            <div className="flex justify-between items-start mb-12 flex-row-reverse">
              <div>
                <h1 className="text-3xl md:text-5xl font-black mb-4 leading-none">{isPremium ? 'سلام VIP! 🌟' : 'سلام نابغه! 🚀'}</h1>
                <p className="opacity-90 text-sm md:text-base font-bold leading-relaxed max-w-lg">{randomQuote}</p>
              </div>
              <div className="text-left">
                <div className="text-5xl font-black text-amber-400">{userStats.xp}</div>
                <div className="text-[10px] font-black opacity-50 uppercase tracking-widest">XP SCORE</div>
              </div>
            </div>
            <div className="mt-auto space-y-4">
              <div className="flex justify-between items-end text-xs font-black flex-row-reverse">
                <span className="text-xl uppercase">LEVEL {userStats.level}</span>
                <span className="opacity-80">{userStats.xp % 1000} / 1000 XP</span>
              </div>
              <div className="h-6 bg-black/30 rounded-full overflow-hidden p-1.5 border-2 border-white/20">
                <div className="h-full rounded-full bg-amber-400 transition-all duration-1000" style={{ width: `${(userStats.xp % 1000) / 10}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'توالی (Streak)', val: userStats.streak, icon: 'fa-fire', color: 'bg-amber-100 text-amber-600' },
            { label: 'تسلط حافظه', val: `${masteryScore}%`, icon: 'fa-bullseye', color: 'bg-indigo-100 text-indigo-600' },
            { label: 'کل کارت‌ها', val: flashcards.length, icon: 'fa-layer-group', color: 'bg-purple-100 text-purple-600' },
            { label: 'مرور مانده', val: dueCards, icon: 'fa-hourglass-half', color: 'bg-rose-100 text-rose-600' }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col justify-between text-right transition-transform hover:-translate-y-1">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-lg border-2 border-black`}><i className={`fa-solid ${stat.icon}`}></i></div>
              <div>
                <div className="text-2xl font-black dark:text-white text-slate-800">{stat.val}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickActions.map(action => (
              <button 
                key={action.id} 
                onClick={() => setView(action.id as View)}
                className="group bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-right flex flex-col gap-4"
              >
                  <div className={`w-14 h-14 ${action.color} text-white rounded-2xl flex items-center justify-center text-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                      <i className={`fa-solid ${action.icon}`}></i>
                  </div>
                  <div>
                      <div className="text-sm font-black dark:text-white text-slate-800">{action.label}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">{action.text}</div>
                  </div>
              </button>
          ))}
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-[4px] border-black dark:border-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] flex flex-col md:flex-row-reverse items-center justify-between gap-8">
          <div className="flex items-center gap-6 flex-row-reverse text-right">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl border-[3px] border-black">
                  <i className="fa-solid fa-share-nodes"></i>
              </div>
              <div>
                  <h4 className="text-xl font-black dark:text-white text-slate-800 uppercase tracking-tighter">معرفی به دوستان</h4>
                  <p className="text-xs text-slate-400 font-bold mt-1">با اشتراک‌گذاری برنامه، امتیاز XP جایزه بگیرید!</p>
              </div>
          </div>
          <button onClick={handleShareApp} className="w-full md:w-auto px-10 py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-sm border-[3px] border-black dark:border-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] active:scale-95 transition-all">
              ارسال دعوت‌نامه 🚀
          </button>
      </div>

      {!isPremium && (
        <div className="p-10 rounded-[3rem] bg-amber-400 border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-slate-900 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between gap-8">
                <div className="text-right flex-1">
                    <h3 className="text-3xl font-black mb-4 flex items-center gap-3 flex-row-reverse">
                        <i className="fa-solid fa-crown text-black"></i>
                        {dynamicAd.title}
                    </h3>
                    <div className="text-lg font-bold leading-relaxed opacity-90">{dynamicAd.desc}</div>
                </div>
                <button onClick={() => dynamicAd.url !== "#" ? window.open(dynamicAd.url, '_blank') : setView('settings')} className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
                    {dynamicAd.btn}
                </button>
            </div>
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <i className="fa-solid fa-bolt absolute top-4 left-10 text-6xl rotate-12"></i>
                <i className="fa-solid fa-graduation-cap absolute bottom-4 right-20 text-7xl -rotate-12"></i>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
