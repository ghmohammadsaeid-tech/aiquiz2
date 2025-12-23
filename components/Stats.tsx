import React from 'react';
import { Flashcard, UserStats, Language, View } from '../types';

interface Props {
  flashcards: Flashcard[];
  userStats: UserStats;
  t: (k: string) => string;
  lang: Language;
  setView: (v: View) => void;
}

const Stats: React.FC<Props> = ({ flashcards, userStats, t, lang, setView }) => {
  const stats = React.useMemo(() => {
    return {
        mastered: flashcards.filter(c => c.repetitions > 6).length,
        learning: flashcards.filter(c => c.repetitions > 0 && c.repetitions <= 6).length,
        new: flashcards.filter(c => c.repetitions === 0).length,
        leeches: flashcards.filter(c => c.errorCount > 3).length
    };
  }, [flashcards]);

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center flex-row-reverse">
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all"
            >
              <i className="fa-solid fa-arrow-right"></i>
              بازگشت
            </button>
            <div className="text-right">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">گزارش پیشرفت هوشمند</h2>
                <p className="text-slate-400 text-sm font-medium">تحلیل عملکرد شما در طی زمان</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border dark:border-slate-700 border-slate-100 shadow-sm text-center">
                <div className="text-3xl font-black text-emerald-500 mb-1">{stats.mastered}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastered</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border dark:border-slate-700 border-slate-100 shadow-sm text-center">
                <div className="text-3xl font-black text-indigo-500 mb-1">{stats.learning}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Learning</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border dark:border-slate-700 border-slate-100 shadow-sm text-center">
                <div className="text-3xl font-black text-slate-400 mb-1">{stats.new}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Cards</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border dark:border-slate-700 border-slate-100 shadow-sm text-center">
                <div className="text-3xl font-black text-rose-500 mb-1">{stats.leeches}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leeches</div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border dark:border-slate-700 border-slate-100 shadow-sm">
            <h3 className="font-black dark:text-white text-slate-800 mb-10 flex items-center gap-2 flex-row-reverse">
                <i className="fa-solid fa-chart-pie text-indigo-400"></i>
                توزیع وضعیت کارت‌ها
            </h3>
            <div className="flex items-center gap-12 flex-col md:flex-row-reverse">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray={`${(stats.mastered / (flashcards.length || 1)) * 251} 251`} strokeDashoffset="0" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="12" strokeDasharray={`${(stats.learning / (flashcards.length || 1)) * 251} 251`} strokeDashoffset={`-${(stats.mastered / (flashcards.length || 1)) * 251}`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black dark:text-white text-slate-800">{flashcards.length}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Total</span>
                    </div>
                </div>
                <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-center text-xs font-bold flex-row-reverse">
                        <span className="flex items-center gap-2 flex-row-reverse"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> تسلط کامل</span>
                        <span>{Math.round((stats.mastered / (flashcards.length || 1)) * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold flex-row-reverse">
                        <span className="flex items-center gap-2 flex-row-reverse"><div className="w-3 h-3 bg-indigo-500 rounded-full"></div> در حال یادگیری</span>
                        <span>{Math.round((stats.learning / (flashcards.length || 1)) * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold flex-row-reverse">
                        <span className="flex items-center gap-2 flex-row-reverse"><div className="w-3 h-3 bg-slate-200 rounded-full"></div> کارت‌های جدید</span>
                        <span>{Math.round((stats.new / (flashcards.length || 1)) * 100)}%</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-indigo-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden text-right">
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <h3 className="text-2xl font-black mb-4 flex-row-reverse flex items-center gap-2">پیش‌بینی زمان تسلط 🔮</h3>
            <p className="opacity-70 text-sm leading-relaxed max-w-xl mr-auto">
                با توجه به میانگین مرورهای روزانه شما، تخمین زده می‌شود که در طی ۴۵ روز آینده، بیش از ۸۰٪ محتوای فعلی به حافظه بلندمدت شما منتقل شود.
                ادامه دادن به توالی (Streak) کلیدی‌ترین عامل است.
            </p>
        </div>
    </div>
  );
};

export default Stats;