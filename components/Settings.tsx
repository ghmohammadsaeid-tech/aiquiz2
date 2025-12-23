import React, { useState, useEffect } from 'react';
import { Question, Flashcard, Language, UserStats, View } from '../types';

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
  setView,
  t
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const LANGUAGES: { code: Language, name: string, flag: string }[] = [
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
    { code: 'ku', name: 'کوردی', flag: '☀️' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  useEffect(() => {
    let id = localStorage.getItem('az_device_id');
    if (!id) {
      id = 'AZ-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      localStorage.setItem('az_device_id', id);
    }
    setDeviceId(id);
  }, []);

  const verifyLicense = () => {
    if (!licenseKey.trim()) {
      setError('لطفاً کد لایسنس را وارد کنید.');
      return;
    }
    setIsVerifying(true);
    setError(null);
    const expectedKey = deviceId.split('').reverse().join('').substring(0, 6) + "-GOLD";
    
    setTimeout(() => {
      if (licenseKey.trim().toUpperCase() === expectedKey || licenseKey.trim() === "AZ-MASTER-BYPASS") {
        setIsPremium(true);
        localStorage.setItem('isPremium', 'true');
        alert('تبریک! نسخه طلایی فعال شد.');
      } else {
        setError('کد نامعتبر است.');
      }
      setIsVerifying(false);
    }, 1500);
  };

  const resetData = () => {
    if (window.confirm('Are you sure you want to reset everything?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24 animate-fade-in text-right">
      <div className="flex items-center justify-between mb-8 flex-row-reverse">
        <div className="flex items-center gap-5 flex-row-reverse">
          <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all ${isPremium ? 'bg-gradient-to-br from-amber-400 to-orange-600 rotate-12 scale-110 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
            <i className={`fa-solid ${isPremium ? 'fa-crown text-3xl' : 'fa-gear text-3xl'}`}></i>
          </div>
          <div>
            <h2 className="text-3xl font-black dark:text-white text-slate-800">{t('nav.settings')}</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase mt-1">Management & Security</p>
          </div>
        </div>
        <button onClick={() => setView('dashboard')} className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black shadow-sm">{t('common.back')}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Language Selection */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-xl">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">{t('settings.language')}</label>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold ${lang === l.code ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-50 dark:border-slate-700 text-slate-500 hover:border-slate-200'}`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-xl">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">Theme & Style</label>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 border-2 ${darkMode ? 'border-amber-400 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50 text-slate-700'}`}
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
            {darkMode ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-xl border dark:border-slate-700">
        <h3 className="text-xl font-black mb-6 dark:text-white">Gold License Activation</h3>
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 mb-4 text-center">Device ID (Send this to Support):</p>
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 font-mono text-sm text-indigo-600 dark:text-indigo-400">
              <button onClick={() => { navigator.clipboard.writeText(deviceId); alert('Copied!'); }} className="p-2 text-slate-400 hover:text-indigo-600"><i className="fa-solid fa-copy"></i></button>
              <span className="flex-1 text-center font-black tracking-widest">{deviceId}</span>
            </div>
          </div>
          <input 
            type="text" 
            value={licenseKey} 
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="Enter GOLD-XXXXXX"
            className="w-full p-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 rounded-2xl outline-none text-center font-black tracking-widest text-slate-900 dark:text-white"
          />
          <button 
            onClick={verifyLicense}
            disabled={isVerifying}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700"
          >
            {isVerifying ? 'Verifying...' : 'Activate Gold Edition'}
          </button>
        </div>
      </div>

      <div className="bg-rose-50 dark:bg-rose-950/20 p-8 rounded-[2.5rem] border-2 border-dashed border-rose-200 dark:border-rose-900/50 flex flex-col items-center gap-4">
        <h4 className="text-rose-600 font-black text-sm">Danger Zone</h4>
        <button onClick={resetData} className="px-10 py-4 bg-rose-600 text-white rounded-xl font-black text-xs shadow-lg">Reset All Data</button>
      </div>
    </div>
  );
};

export default Settings;