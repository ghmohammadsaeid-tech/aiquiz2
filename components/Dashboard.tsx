import { useMemo } from 'react';
import { View, Question, Flashcard, UserStats, Language } from '../types';
import { AD_CONFIG } from '../constants';

interface Props {
  questions: Question[];
  flashcards: Flashcard[];
  setView: (v: View) => void;
  dueCards: number;
  userStats: UserStats;
  t: (k: string) => string;
  isPremium: boolean;
  lang: Language;
}

const MOTIVATIONAL_QUOTES = [
  "موفقیت مجموع تلاش‌های کوچکی است که هر روز تکرار می‌شوند. ✨",
  "یادگیری تنها چیزی است که ذهن هرگز از آن خسته نمی‌شود. 🧠",
  "امروز یک قدم کوچک بردار، فردا نتیجه بزرگش رو می‌بینی. 🚀",
  "تکنیک فاینمن: اگر نمی‌تونی ساده توضیحش بدی، یعنی یادش نگرفتی. 💡",
  "سخت‌کوشی پلی است بین اهداف و دستاوردها. 🌉",
  "دانش قدرت است، اما عمل به آن قدرت واقعی است. ⚡",
  "هر روز فرصتی تازه برای بهتر شدن از دیروز است. 🔥",
  "ثبات در مطالعه، کلید اصلی تبدیل حافظه کوتاه‌مدت به بلندمدت است. 📚",
  "مسیر هزار فرسنگی با اولین قدم آغاز می‌شود. 🏃‍♂️",
  "ذهن تو مثل ماهیچه است؛ با چالش‌های جدید قوی‌تر می‌شه. 💪"
];

const Dashboard: React.FC<Props> = ({ questions, flashcards, setView, dueCards, userStats, t, isPremium, lang }) => {
  const masteryScore = useMemo(() => {
    if (flashcards.length === 0) return 0;
    const masters = flashcards.filter(c => c.repetitions > 6 && c.easeFactor > 2).length;
    return Math.round((masters / flashcards.length) * 100);
  }, [flashcards]);

  const randomQuote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }, []);

  const quickNavItems = [
    { view: 'flashcards' as View, label: 'یادگیری', icon: 'fa-layer-group', color: 'from-purple-500 to-indigo-600', shadow: 'shadow-indigo-100' },
    { view: 'exam' as View, label: 'آزمون', icon: 'fa-stopwatch', color: 'from-rose-400 to-rose-600', shadow: 'shadow-rose-100' },
    { view: 'bank' as View, label: 'بانک سوال', icon: 'fa-book-bookmark', color: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-100' },
    { view: 'ai' as View, label: 'طراح AI', icon: 'fa-wand-magic-sparkles', color: 'from-amber-400 to-orange-600', shadow: 'shadow-amber-100' },
    { view: 'stats' as View, label: 'آمار', icon: 'fa-chart-pie', color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-100' },
    { view: 'settings' as View, label: 'تنظیمات', icon: 'fa-gear', color: 'from-slate-400 to-slate-600', shadow: 'shadow-slate-100' }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Top Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group transition-all duration-500 ${isPremium ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-2 border-amber-500/20' : 'bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800'}`}>
          <div className={`absolute top-0 right-0 w-80 h-80 rounded-full -mr-40 -mt-40 blur-[100px] transition-all duration-700 ${isPremium ? 'bg-amber-500/10' : 'bg-white/10'}`}></div>
          
          <div className="relative z-10 flex flex-col h-full text-white text-right">
            <div className="flex justify-between items-start mb-10 flex-row-reverse">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-row-reverse">
                    <h1 className="text-3xl font-black">{isPremium ? 'سلام مشترک طلایی! 🌟' : 'سلام نابغه! 🚀'}</h1>
                </div>
                <p className="opacity-80 text-sm font-bold leading-relaxed max-w-md">
                  {randomQuote}
                </p>
              </div>
              <div className="text-left">
                <div className={`text-4xl font-black drop-shadow-md ${isPremium ? 'text-amber-400' : 'text-amber-300'}`}>{userStats.xp}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">XP EARNED</div>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <div className="flex justify-between items-end text-xs font-black flex-row-reverse">
                <div className="flex flex-col text-right">
                    <span className="opacity-60 mb-1">سطح فعلی</span>
                    <span className="text-lg uppercase">LEVEL {userStats.level}</span>
                </div>
                <span className="opacity-60">{userStats.xp % 1000} / 1000 XP تا سطح بعد</span>
              </div>
              <div className="h-4 bg-white/15 rounded-full overflow-hidden p-1 border border-white/10">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 relative ${isPremium ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-amber-300 to-amber-500'}`} 
                    style={{ width: `${(userStats.xp % 1000) / 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Stats Card */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: t('dashboard.streak'), val: userStats.streak, icon: 'fa-fire', color: 'text-amber-500' },
            { label: 'تسلط', val: `${masteryScore}%`, icon: 'fa-bullseye', color: 'text-indigo-500' },
            { label: 'کارت‌ها', val: flashcards.length, icon: 'fa-layer-group', color: 'text-purple-500' },
            { label: 'مانده', val: dueCards, icon: 'fa-hourglass-half', color: 'text-rose-500' }
          ].map((stat, i) => (
            <div key={i} className="dark:bg-slate-800 bg-white p-6 rounded-[2rem] border dark:border-slate-700 border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all text-right">
              <i className={`fa-solid ${stat.icon} ${stat.color} text-2xl`}></i>
              <div>
                <div className="text-2xl font-black dark:text-white text-slate-800">{stat.val}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation - Circular Icons */}
      <div className="space-y-4 px-2">
        <h3 className="font-black dark:text-white text-slate-800 text-lg flex items-center gap-2 flex-row-reverse">
            <i className="fa-solid fa-rocket text-indigo-500"></i>
            دسترسی سریع
        </h3>
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar flex-row-reverse">
          {quickNavItems.map((item, i) => (
            <button
              key={i}
              onClick={() => setView(item.view)}
              className="nav-circle-btn flex flex-col items-center group gap-2 min-w-[80px]"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-xl shadow-lg transition-all group-hover:scale-110 group-active:scale-95 ${item.shadow}`}>
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <span className="text-[10px] font-black dark:text-slate-300 text-slate-600 whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Central Advertisement Slot - DASHBOARD */}
      {AD_CONFIG.enabled && AD_CONFIG.dashboard.show && !isPremium && (
        <div className={`p-8 rounded-[2.5rem] bg-gradient-to-r ${AD_CONFIG.dashboard.gradient} text-white shadow-xl relative overflow-hidden ad-glow group transition-all duration-500`}>
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between gap-6">
            <div className="text-right flex-1">
              <h3 className="text-xl font-black mb-2 flex items-center gap-2 flex-row-reverse">
                <i className={`fa-solid ${AD_CONFIG.dashboard.icon}`}></i>
                {AD_CONFIG.dashboard.title}
              </h3>
              <p className="text-sm opacity-90 font-bold">{AD_CONFIG.dashboard.description}</p>
            </div>
            <button 
              onClick={() => setView(AD_CONFIG.dashboard.action as View)}
              className="px-10 py-4 bg-white text-indigo-900 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              {AD_CONFIG.dashboard.buttonText}
            </button>
          </div>
        </div>
      )}

      {/* Main Action Card */}
      <div className="grid grid-cols-1 gap-6">
          <div className={`p-10 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center relative overflow-hidden group transition-all duration-500 shadow-xl ${isPremium ? 'bg-slate-900 border border-amber-500/20 shadow-amber-500/5' : 'bg-indigo-600 border border-indigo-500 shadow-indigo-500/10'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="relative z-10 text-right md:flex-1">
                <h3 className={`font-black text-3xl mb-4 ${isPremium ? 'text-amber-400' : 'text-white'}`}>وقت مروره! 🎯</h3>
                <p className={`text-base leading-relaxed font-medium max-w-2xl ml-auto ${isPremium ? 'text-slate-400' : 'text-indigo-100/90'}`}>
                    الگوریتم هوشمند SM-2 دقیقاً زمانی که احتمال فراموشی بالاست، کارت‌ها را به تو نشان می‌دهد.
                    {dueCards > 0 ? ` امروز ${dueCards} کارت آماده برای بررسی داری. با مرور منظم، حافظه خود را فولادین کن!` : ' تمام کارت‌های امروز مرور شده‌اند! فردا دوباره سر بزن.'}
                </p>
              </div>
              <div className="relative z-10 mt-8 md:mt-0 md:mr-8 w-full md:w-auto">
                <button 
                    onClick={() => setView('flashcards')}
                    className={`w-full md:px-12 py-5 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-all ${isPremium ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-900/40' : 'bg-white text-indigo-600 hover:bg-slate-50 shadow-black/10'}`}
                >
                    شروع یادگیری هوشمند
                </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;