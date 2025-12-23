
import React, { useMemo, useEffect, useState } from 'react';
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
}

const MOTIVATIONAL_QUOTES = [
  "موفقیت مجموع تلاش‌های کوچکی است که هر روز تکرار می‌شوند. ✨",
  "یادگیری تنها چیزی است که ذهن هرگز از آن خسته نمی‌شود. 🧠",
  "امروز یک قدم کوچک بردار، فردا نتیجه بزرگش رو می‌بینی. 🚀",
  "تکنیک فاینمن: اگر نمی‌تونی ساده توضیحش بدی، یعنی یادش نگرفتی. 💡",
  "سخت‌کوشی پلی است بین اهداف و دستاوردها. 🌉",
  "دانش قدرت است، اما عمل به آن قدرت واقعی است. ⚡"
];

const Dashboard: React.FC<Props> = ({ questions, flashcards, setView, dueCards, userStats, t, isPremium, lang }) => {
  const [activeAd, setActiveAd] = useState({
    title: "🚀 پیشنهاد ویژه: اشتراک طلایی",
    desc: "دسترسی نامحدود به هوش مصنوعی و چاپ حرفه‌ای سوالات!",
    btn: "ارتقا به VIP"
  });

  const masteryScore = useMemo(() => {
    if (flashcards.length === 0) return 0;
    const masters = flashcards.filter(c => c.repetitions > 6 && c.easeFactor > 2).length;
    return Math.round((masters / flashcards.length) * 100);
  }, [flashcards]);

  const randomQuote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }, []);

  // سیستم همگام‌سازی ابری تبلیغات
  useEffect(() => {
    const syncRemoteAd = async () => {
        const saved = localStorage.getItem('az_manager_ad');
        if (!saved) return;
        const settings = JSON.parse(saved);

        // اگر لینک آنلاین تنظیم شده باشد، اولویت با آن است
        if (settings.remoteUrl) {
            try {
                const response = await fetch(settings.remoteUrl + '?t=' + Date.now()); // جلوگیری از کش شدن
                const remoteData = await response.json();
                if (remoteData.title) setActiveAd(remoteData);
            } catch (e) {
                console.log("Remote Ad Sync failed, using local fallback.");
                setActiveAd(settings);
            }
        } else {
            setActiveAd(settings);
        }
    };
    syncRemoteAd();
  }, []);

  const quickNavItems = [
    { view: 'flashcards' as View, label: 'یادگیری', icon: 'fa-layer-group', color: 'from-purple-500 to-indigo-600' },
    { view: 'exam' as View, label: 'آزمون', icon: 'fa-stopwatch', color: 'from-rose-400 to-rose-600' },
    { view: 'bank' as View, label: 'بانک سوال', icon: 'fa-book-bookmark', color: 'from-emerald-400 to-teal-600' },
    { view: 'ai' as View, label: 'طراح AI', icon: 'fa-wand-magic-sparkles', color: 'from-amber-400 to-orange-600' },
    { view: 'stats' as View, label: 'آمار', icon: 'fa-chart-pie', color: 'from-blue-400 to-blue-600' },
    { view: 'settings' as View, label: 'تنظیمات', icon: 'fa-gear', color: 'from-slate-400 to-slate-600' }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group transition-all duration-500 ${isPremium ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-2 border-amber-500/20' : 'bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800'}`}>
          <div className="relative z-10 flex flex-col h-full text-white text-right">
            <div className="flex justify-between items-start mb-10 flex-row-reverse">
              <div>
                <h1 className="text-3xl font-black mb-2">{isPremium ? 'سلام مشترک طلایی! 🌟' : 'سلام نابغه! 🚀'}</h1>
                <p className="opacity-80 text-sm font-bold leading-relaxed max-w-md">{randomQuote}</p>
              </div>
              <div className="text-left">
                <div className="text-4xl font-black text-amber-400 drop-shadow-md">{userStats.xp}</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-50">XP SCORE</div>
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
            { label: 'توالی', val: userStats.streak, icon: 'fa-fire', color: 'text-amber-500' },
            { label: 'تسلط', val: `${masteryScore}%`, icon: 'fa-bullseye', color: 'text-indigo-500' },
            { label: 'کارت‌ها', val: flashcards.length, icon: 'fa-layer-group', color: 'text-purple-500' },
            { label: 'مانده', val: dueCards, icon: 'fa-hourglass-half', color: 'text-rose-500' }
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

      {/* بنر تبلیغاتی هوشمند (Online Sync) */}
      {!isPremium && (
        <div className="ad-glow p-8 rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-2xl relative overflow-hidden animate-pulse-slow">
            <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between gap-6">
                <div className="text-right flex-1">
                    <h3 className="text-xl font-black mb-2 flex items-center gap-2 flex-row-reverse">
                        <i className="fa-solid fa-crown text-amber-400"></i>
                        {activeAd.title}
                    </h3>
                    <p className="text-sm opacity-90 font-bold leading-relaxed">{activeAd.desc}</p>
                </div>
                <button 
                  onClick={() => setView('settings')}
                  className="px-10 py-4 bg-white text-indigo-900 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all whitespace-nowrap"
                >
                    {activeAd.btn}
                </button>
            </div>
        </div>
      )}

      <div className="space-y-4 px-2">
        <h3 className="font-black dark:text-white text-slate-800 text-lg flex items-center gap-2 flex-row-reverse">
            <i className="fa-solid fa-rocket text-indigo-500"></i>
            دسترسی سریع
        </h3>
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar flex-row-reverse">
          {quickNavItems.map((item, i) => (
            <button key={i} onClick={() => setView(item.view)} className="flex flex-col items-center group gap-2 min-w-[80px]">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-xl shadow-lg transition-all group-hover:scale-110`}>
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <span className="text-[10px] font-black dark:text-slate-300 text-slate-600 whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
          <div className={`p-10 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center relative overflow-hidden group transition-all duration-500 shadow-xl ${isPremium ? 'bg-slate-900 border border-amber-500/20 shadow-amber-500/5' : 'bg-indigo-600 border border-indigo-500 shadow-indigo-500/10'}`}>
              <div className="relative z-10 text-right md:flex-1">
                <h3 className={`font-black text-3xl mb-4 ${isPremium ? 'text-amber-400' : 'text-white'}`}>یادگیری هوشمند را شروع کن 🎯</h3>
                <p className={`text-base leading-relaxed font-medium max-w-2xl ml-auto ${isPremium ? 'text-slate-400' : 'text-indigo-100/90'}`}>
                    {dueCards > 0 ? ` امروز ${dueCards} کارت منتظر مرور شماست. همین حالا حافظه‌ات را تقویت کن!` : ' تمام کارت‌ها مرور شده‌اند. شما عالی هستید!'}
                </p>
              </div>
              <div className="relative z-10 mt-8 md:mt-0 md:mr-8 w-full md:w-auto">
                <button onClick={() => setView('flashcards')} className={`w-full md:px-12 py-5 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-all ${isPremium ? 'bg-amber-500 text-white' : 'bg-white text-indigo-600'}`}>بزن بریم!</button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
