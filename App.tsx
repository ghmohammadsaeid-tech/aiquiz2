
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
  }
];

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

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
    } else {
      document.body.classList.remove('dark', 'bg-slate-900', 'text-slate-100');
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('install_banner_dismissed');
      if (!dismissed) setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [questions, flashcards, userStats, lang, isPremium, darkMode]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const t = (key: string) => TRANSLATIONS[lang][key] || key;

  const dueCardsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return flashcards.filter(c => !c.dueDate || c.dueDate <= today).length;
  }, [flashcards]);

  const addXp = (quality: number) => {
    setUserStats(prev => {
      const xpEarned = (quality * 5 + 5) * (isPremium ? 1.5 : 1); 
      const newXp = prev.xp + Math.round(xpEarned);
      return {
        ...prev,
        xp: newXp,
        level: Math.floor(newXp / 1000) + 1,
        totalReviews: prev.totalReviews + 1
      };
    });
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

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {showInstallBanner && (
        <div className="fixed bottom-24 left-4 right-4 z-[100] bg-indigo-600 text-white p-6 rounded-[2rem] shadow-2xl animate-slide-up flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-white/20">
          <div className="flex items-center gap-4 flex-row-reverse text-right">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl"><i className="fa-solid fa-mobile-screen-button"></i></div>
            <div>
              <h4 className="font-black text-sm">نصب نسخه اپلیکیشن 📱</h4>
              <p className="text-[10px] opacity-80">برای دسترسی سریع‌تر و آفلاین، آزمون‌یار را نصب کنید.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={handleInstallClick} className="flex-1 md:px-8 py-3 bg-white text-indigo-600 rounded-xl font-black text-xs">نصب برنامه</button>
            <button onClick={() => { setShowInstallBanner(false); localStorage.setItem('install_banner_dismissed', 'true'); }} className="px-4 py-3 bg-white/10 text-white rounded-xl text-xs"><i className="fa-solid fa-xmark"></i></button>
          </div>
        </div>
      )}

      <nav className={`shadow-sm sticky top-0 z-50 border-b backdrop-blur-md ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-100'}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:rotate-6 ${isPremium ? 'bg-gradient-to-br from-amber-400 to-orange-600' : 'bg-gradient-to-br from-indigo-500 to-purple-700'}`}>
                <i className={`fa-solid ${isPremium ? 'fa-crown' : 'fa-graduation-cap'} text-white text-xl`}></i>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-lg font-black dark:text-white leading-tight">آزمون‌یار</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Smart Assistant</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl border dark:bg-slate-700 dark:border-slate-600 text-amber-500 shadow-sm">
                    <i className="fa-solid fa-fire text-lg"></i>
                    <span className="text-sm font-black">{userStats.streak}</span>
                </div>
                {/* Burger Menu Button with Enhanced Contrast */}
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-90 border-2 ${
                    mobileMenuOpen 
                    ? 'bg-rose-500 border-rose-400 text-white' 
                    : darkMode 
                      ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-amber-900/40' 
                      : 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-200'
                  }`}
                >
                  <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
                </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t py-6 px-4 space-y-2 dark:bg-slate-800 dark:border-slate-700 animate-slide-down shadow-2xl">
            {['dashboard', 'flashcards', 'exam', 'bank', 'ai', 'stats', 'settings'].map(v => (
              <button 
                key={v} 
                onClick={() => { setView(v as View); setMobileMenuOpen(false); }} 
                className={`w-full text-right px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-between flex-row-reverse transition-all ${
                  view === v 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 flex-row-reverse">
                    <i className={`fa-solid ${
                      v === 'dashboard' ? 'fa-house' : 
                      v === 'flashcards' ? 'fa-layer-group' : 
                      v === 'exam' ? 'fa-stopwatch' : 
                      v === 'bank' ? 'fa-book-bookmark' : 
                      v === 'ai' ? 'fa-wand-magic-sparkles' : 
                      v === 'stats' ? 'fa-chart-pie' : 'fa-gear'
                    }`}></i>
                    {t(`nav.${v}`)}
                </div>
                {view === v && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
