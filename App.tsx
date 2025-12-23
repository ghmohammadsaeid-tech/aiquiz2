import React, { useState, useEffect, useMemo } from 'react';
import { View, Question, Flashcard, Language, UserStats } from './types';
import { TRANSLATIONS } from './constants';
import Dashboard from './components/Dashboard';
import Exam from './components/Exam';
import FlashcardSystem from './components/FlashcardSystem';
import QuestionBank from './components/QuestionBank';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import Stats from './components/Stats';

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 123,
    q: "مشتق تابع f(x) = sin(x^2) نسبت به x کدام است؟",
    o: ["2x cos(x^2)", "cos(2x)", "2 sin(x) cos(x)", "x^2 cos(x)"],
    a: 0,
    c: "Calculus",
    difficulty: "سخت",
    dateAdded: new Date().toISOString()
  },
  {
    id: 1001,
    q: "کدام معماری شبکه عصبی برای پردازش داده‌های توالی‌دار مثل متن و صوت مناسب‌تر است؟",
    o: ["CNN (شبکه کانوولوشنال)", "RNN (شبکه بازگشتی)", "MLP (پرسپترون چندلایه)", "GAN (شبکه مولد رقابتی)"],
    a: 1,
    c: "هوش مصنوعی",
    difficulty: "متوسط",
    dateAdded: new Date().toISOString()
  },
  {
    id: 1002,
    q: "هدف اصلی از لایه Dropout در آموزش مدل‌های یادگیری عمیق چیست؟",
    o: ["افزایش سرعت آموزش", "کاهش مصرف حافظه", "جلوگیری از Overfitting", "افزایش تعداد پارامترها"],
    a: 2,
    c: "هوش مصنوعی",
    difficulty: "متوسط",
    dateAdded: new Date().toISOString()
  },
  {
    id: 1003,
    q: "تکنیک 'Self-Attention' پایه و اساس کدام یک از مدل‌های زیر است؟",
    o: ["Decision Trees", "SVM", "Transformers", "K-Means"],
    a: 2,
    c: "هوش مصنوعی",
    difficulty: "سخت",
    dateAdded: new Date().toISOString()
  }
];

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('questions');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((q: Question) => q.id === 123 ? { ...q, c: 'Calculus' } : q);
    }
    return INITIAL_QUESTIONS;
  });
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => 
    JSON.parse(localStorage.getItem('flashcards') || '[]')
  );
  const [userStats, setUserStats] = useState<UserStats>(() => 
    JSON.parse(localStorage.getItem('userStats') || '{"xp":0,"level":1,"streak":0,"totalReviews":0,"badges":[],"dailyGoal":20}')
  );
  const [view, setView] = useState<View>('dashboard');
  const [lang, setLang] = useState<Language>(() => 
    (localStorage.getItem('language') as Language) || 'fa'
  );
  const [isPremium, setIsPremium] = useState<boolean>(() => 
    localStorage.getItem('isPremium') === 'true'
  );
  const [darkMode, setDarkMode] = useState<boolean>(() => 
    localStorage.getItem('darkMode') === 'true'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('questions', JSON.stringify(questions));
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    localStorage.setItem('userStats', JSON.stringify(userStats));
    localStorage.setItem('language', lang);
    localStorage.setItem('isPremium', String(isPremium));
    localStorage.setItem('darkMode', String(darkMode));
    
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    if (darkMode) {
      document.body.classList.add('dark', 'bg-slate-900', 'text-slate-100');
      document.body.classList.remove('bg-slate-50', 'text-slate-900');
    } else {
      document.body.classList.remove('dark', 'bg-slate-900', 'text-slate-100');
      document.body.classList.add('bg-slate-50', 'text-slate-900');
    }
  }, [questions, flashcards, userStats, lang, isPremium, darkMode]);

  const t = (key: string) => TRANSLATIONS[lang][key] || key;

  const dueCardsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return flashcards.filter(c => !c.dueDate || c.dueDate <= today).length;
  }, [flashcards]);

  const addXp = (quality: number) => {
    setUserStats(prev => {
      const xpEarned = (quality * 5 + 5) * (isPremium ? 1.5 : 1); 
      const newXp = prev.xp + Math.round(xpEarned);
      const newLevel = Math.floor(newXp / 1000) + 1;
      
      const today = new Date().toISOString().split('T')[0];
      let newStreak = prev.streak;
      if (prev.lastActivityDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          newStreak = prev.lastActivityDate === yesterdayStr ? prev.streak + 1 : 1;
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        lastActivityDate: today,
        totalReviews: prev.totalReviews + 1
      };
    });
  };

  const navigate = (v: View) => {
    setView(v);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard questions={questions} flashcards={flashcards} setView={setView} dueCards={dueCardsCount} userStats={userStats} t={t} isPremium={isPremium} lang={lang} />;
      case 'exam': return <Exam questions={questions} setView={setView} lang={lang} t={t} isPremium={isPremium} />;
      case 'flashcards': return <FlashcardSystem flashcards={flashcards} setFlashcards={setFlashcards} questions={questions} setView={setView} lang={lang} t={t} onReviewComplete={addXp} isPremium={isPremium} />;
      case 'bank': return <QuestionBank questions={questions} setQuestions={setQuestions} setFlashcards={setFlashcards} lang={lang} t={t} isPremium={isPremium} setView={setView} />;
      case 'ai': return <AIAssistant setQuestions={setQuestions} lang={lang} t={t} isPremium={isPremium} setView={setView} />;
      case 'stats': return <Stats flashcards={flashcards} userStats={userStats} t={t} lang={lang} setView={setView} />;
      case 'settings': return <Settings questions={questions} setQuestions={setQuestions} flashcards={flashcards} setFlashcards={setFlashcards} lang={lang} setLang={setLang} t={t} isPremium={isPremium} setIsPremium={setIsPremium} userStats={userStats} setUserStats={setUserStats} darkMode={darkMode} setDarkMode={setDarkMode} setView={setView} />;
      default: return <Dashboard questions={questions} flashcards={flashcards} setView={setView} dueCards={dueCardsCount} userStats={userStats} t={t} isPremium={isPremium} lang={lang} />;
    }
  };

  const navItems: View[] = ['dashboard', 'flashcards', 'exam', 'bank', 'ai', 'stats'];

  return (
    <div className={`min-h-screen flex flex-col font-['Vazirmatn'] transition-colors duration-300 print:bg-white ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <nav className={`shadow-sm sticky top-0 z-50 border-b backdrop-blur-md transition-colors print:hidden ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-100'}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer transition-all ${isPremium ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-200'}`} 
                onClick={() => navigate('dashboard')}
              >
                <i className={`fa-solid ${isPremium ? 'fa-crown text-white' : 'fa-graduation-cap text-white'}`}></i>
              </div>
              <div className="flex flex-col leading-none">
                <span className={`text-lg font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>آزمون‌یار</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">LVL {userStats.level}</span>
                    {isPremium && <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase">PREMIUM</span>}
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((v) => (
                <button
                  key={v}
                  onClick={() => navigate(v)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all text-sm relative ${
                    view === v 
                      ? (darkMode ? 'bg-slate-700 text-white' : 'bg-indigo-50 text-indigo-700') 
                      : (darkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-50')
                  }`}
                >
                  {t(`nav.${v}`)}
                  {v === 'flashcards' && dueCardsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                      {dueCardsCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                    <i className="fa-solid fa-fire"></i>
                    <span className="text-xs font-black">{userStats.streak}</span>
                </div>
                <button 
                  onClick={() => navigate('settings')} 
                  className={`w-10 h-10 rounded-2xl transition-colors flex items-center justify-center ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
                >
                    <i className="fa-solid fa-cog"></i>
                </button>
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`lg:hidden w-10 h-10 rounded-2xl flex items-center justify-center ${darkMode ? 'text-white' : 'text-slate-800'}`}
                >
                  <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
                </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-t py-4 px-4 space-y-2 animate-slide-up ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
             {navItems.map((v) => (
                <button
                  key={v}
                  onClick={() => navigate(v)}
                  className={`w-full text-right px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-between ${
                    view === v 
                      ? (darkMode ? 'bg-slate-700 text-white' : 'bg-indigo-50 text-indigo-700') 
                      : (darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-50')
                  }`}
                >
                  <span>{t(`nav.${v}`)}</span>
                  <div className="flex items-center gap-2">
                    {v === 'flashcards' && dueCardsCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                        {dueCardsCount}
                      </span>
                    )}
                    <i className="fa-solid fa-chevron-left text-[10px] opacity-30"></i>
                  </div>
                </button>
              ))}
          </div>
        )}
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl animate-fade-in print:p-0">
        {renderContent()}
      </main>

      <footer className={`border-t py-8 transition-colors print:hidden ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400'}`}>
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold">
            <div className="flex gap-6">
                <span>سوالات: {questions.length}</span>
                <span>کارت‌ها: {flashcards.length}</span>
                <span>XP کل: {userStats.xp}</span>
            </div>
            <p>پشتیبانی: support@azmonyar.ir | نسخه ۳.۹ هوشمند</p>
        </div>
      </footer>
    </div>
  );
};

export default App;