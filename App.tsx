
import React, { useState, useEffect, useMemo } from 'react';
import { View, Question, Flashcard, Language, UserStats } from './types';
import { TRANSLATIONS, AD_CONFIG } from './constants';
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
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if ((window as any).Telegram?.WebApp) {
        return (window as any).Telegram.WebApp.colorScheme === 'dark';
    }
    return localStorage.getItem('darkMode') === 'true';
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const [dynamicAd, setDynamicAd] = useState({
    title: AD_CONFIG.dashboard.title,
    desc: AD_CONFIG.dashboard.description,
    btn: AD_CONFIG.dashboard.buttonText,
    url: "#"
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if ((window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        tg.ready();
        tg.expand();
        tg.setHeaderColor(darkMode ? '#0f172a' : '#ffffff');
        if (view !== 'dashboard') {
            tg.BackButton.show();
            tg.BackButton.onClick(() => setView('dashboard'));
        } else {
            tg.BackButton.hide();
        }
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    localStorage.setItem('questions', JSON.stringify(questions));
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    localStorage.setItem('userStats', JSON.stringify(userStats));
    localStorage.setItem('language', lang);
    localStorage.setItem('isPremium', String(isPremium));
    localStorage.setItem('darkMode', String(darkMode));
    
    document.documentElement.dir = (lang === 'en') ? 'ltr' : 'rtl';
    document.documentElement.lang = lang;
    
    if (darkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [questions, flashcards, userStats, lang, isPremium, darkMode, view]);

  const t = (key: string) => TRANSLATIONS[lang][key] || TRANSLATIONS['fa'][key] || key;
  
  const dueCardsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return flashcards.filter(c => !c.dueDate || c.dueDate <= today).length;
  }, [flashcards]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const addXp = (quality: number) => {
    setUserStats(prev => {
      const xpEarned = (quality * 5 + 5) * (isPremium ? 1.5 : 1); 
      const newXp = prev.xp + Math.round(xpEarned);
      return { ...prev, xp: newXp, level: Math.floor(newXp / 1000) + 1, totalReviews: prev.totalReviews + 1 };
    });
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard questions={questions} flashcards={flashcards} setView={setView} dueCards={dueCardsCount} userStats={userStats} t={t} isPremium={isPremium} lang={lang} dynamicAd={dynamicAd} isInstallable={isInstallable} onInstall={handleInstallClick} />;
      case 'exam': return <Exam questions={questions} setView={setView} lang={lang} t={t} isPremium={isPremium} dynamicAd={dynamicAd} />;
      case 'flashcards': return <FlashcardSystem flashcards={flashcards} setFlashcards={setFlashcards} questions={questions} setView={setView} lang={lang} t={t} onReviewComplete={addXp} isPremium={isPremium} dynamicAd={dynamicAd} />;
      case 'bank': return <QuestionBank questions={questions} setQuestions={setQuestions} setFlashcards={setFlashcards} lang={lang} t={t} isPremium={isPremium} setView={setView} />;
      case 'ai': return <AIAssistant setQuestions={setQuestions} lang={lang} t={t} isPremium={isPremium} setView={setView} />;
      case 'stats': return <Stats flashcards={flashcards} userStats={userStats} t={t} lang={lang} setView={setView} />;
      case 'settings': return <Settings questions={questions} setQuestions={setQuestions} flashcards={flashcards} setFlashcards={setFlashcards} lang={lang} setLang={setLang} t={t} isPremium={isPremium} setIsPremium={setIsPremium} userStats={userStats} setUserStats={setUserStats} darkMode={darkMode} setDarkMode={setDarkMode} setView={setView} isInstallable={isInstallable} onInstall={handleInstallClick} />;
      default: return <Dashboard questions={questions} flashcards={flashcards} setView={setView} dueCards={dueCardsCount} userStats={userStats} t={t} isPremium={isPremium} lang={lang} dynamicAd={dynamicAd} isInstallable={isInstallable} onInstall={handleInstallClick} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      <nav className={`sticky top-0 z-50 border-b-[6px] ${darkMode ? 'bg-slate-800 border-white' : 'bg-white border-slate-900'}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-[3px] border-black ${isPremium ? 'bg-amber-400' : 'bg-indigo-600'}`}>
                <i className={`fa-solid ${isPremium ? 'fa-crown' : 'fa-graduation-cap'} text-white text-xl`}></i>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black dark:text-white leading-tight">آزمون‌یار</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Smart AI Assistant</span>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`w-12 h-12 rounded-xl flex items-center justify-center border-[3px] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] ${darkMode ? 'bg-slate-700 border-white text-white' : 'bg-slate-100 border-slate-900 text-slate-600'}`}>
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t-[6px] border-slate-900 dark:border-white py-4 px-4 space-y-2 dark:bg-slate-800 animate-slide-down">
            {['dashboard', 'flashcards', 'exam', 'bank', 'ai', 'stats', 'settings'].map(v => (
              <button key={v} onClick={() => { setView(v as View); setMobileMenuOpen(false); }} className={`w-full text-right px-6 py-4 rounded-xl font-black text-sm flex items-center gap-4 border-[3px] ${view === v ? 'bg-indigo-600 text-white border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                <i className={`fa-solid ${v === 'dashboard' ? 'fa-house' : v === 'flashcards' ? 'fa-brain' : v === 'exam' ? 'fa-stopwatch' : v === 'bank' ? 'fa-book-bookmark' : v === 'ai' ? 'fa-wand-magic-sparkles' : v === 'stats' ? 'fa-chart-pie' : 'fa-gear'} w-6`}></i>
                {t(`nav.${v}`)}
              </button>
            ))}
          </div>
        )}
      </nav>
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">{renderContent()}</main>
    </div>
  );
};

export default App;
