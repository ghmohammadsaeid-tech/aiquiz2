
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
  const [darkMode, setDarkMode] = useState<boolean>(() => 
    localStorage.getItem('darkMode') === 'true'
  );
  
  // PWA Install Logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // سیستم تبلیغات داینامیک سراسری
  const [dynamicAd, setDynamicAd] = useState({
    title: AD_CONFIG.dashboard.title,
    desc: AD_CONFIG.dashboard.description,
    btn: AD_CONFIG.dashboard.buttonText,
    url: "#"
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    localStorage.setItem('questions', JSON.stringify(questions));
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    localStorage.setItem('userStats', JSON.stringify(userStats));
    localStorage.setItem('language', lang);
    localStorage.setItem('isPremium', String(isPremium));
    localStorage.setItem('darkMode', String(darkMode));
    
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    if (darkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');

    const syncAds = async () => {
      const savedSettings = localStorage.getItem('az_manager_ad');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.remoteUrl) {
          try {
            const res = await fetch(settings.remoteUrl + '?cache=' + Date.now());
            const data = await res.json();
            if (data.title) setDynamicAd({
              title: data.title,
              desc: data.desc || data.description,
              btn: data.btn || data.buttonText,
              url: data.url || "#"
            });
          } catch (e) {
            setDynamicAd({ title: settings.title, desc: settings.desc, btn: settings.btn, url: "#" });
          }
        } else {
          setDynamicAd({ title: settings.title, desc: settings.desc, btn: settings.btn, url: "#" });
        }
      }
    };
    syncAds();
  }, [questions, flashcards, userStats, lang, isPremium, darkMode]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
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
      case 'settings': return <Settings questions={questions} setQuestions={setQuestions} flashcards={flashcards} setFlashcards={setFlashcards} lang={lang} setLang={setLang} t={t} isPremium={isPremium} setIsPremium={setIsPremium} userStats={userStats} setUserStats={setUserStats} darkMode={darkMode} setDarkMode={setDarkMode} setView={setView} />;
      default: return <Dashboard questions={questions} flashcards={flashcards} setView={setView} dueCards={dueCardsCount} userStats={userStats} t={t} isPremium={isPremium} lang={lang} dynamicAd={dynamicAd} isInstallable={isInstallable} onInstall={handleInstallClick} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <nav className={`shadow-sm sticky top-0 z-50 border-b backdrop-blur-md ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-100'}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isPremium ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                <i className={`fa-solid ${isPremium ? 'fa-crown' : 'fa-graduation-cap'} text-white text-xl`}></i>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-lg font-black dark:text-white leading-tight">آزمون‌یار</span>
                <span className="text-[9px] font-black text-slate-400 uppercase">Smart Assistant</span>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-white text-slate-600'}`}>
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t py-6 px-4 space-y-2 dark:bg-slate-800 animate-slide-down">
            {['dashboard', 'flashcards', 'exam', 'bank', 'ai', 'stats', 'settings'].map(v => (
              <button key={v} onClick={() => { setView(v as View); setMobileMenuOpen(false); }} className={`w-full text-right px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-3 flex-row-reverse ${view === v ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
                <i className={`fa-solid ${v === 'dashboard' ? 'fa-house' : v === 'flashcards' ? 'fa-layer-group' : v === 'exam' ? 'fa-stopwatch' : v === 'bank' ? 'fa-book-bookmark' : v === 'ai' ? 'fa-wand-magic-sparkles' : v === 'stats' ? 'fa-chart-pie' : 'fa-gear'}`}></i>
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
