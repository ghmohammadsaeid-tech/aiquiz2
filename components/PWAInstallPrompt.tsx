
import React, { useState, useEffect } from 'react';

interface Props {
  isInstallable: boolean;
  onInstall: () => void;
}

const PWAInstallPrompt: React.FC<Props> = ({ isInstallable, onInstall }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      const dismissedAt = localStorage.getItem('pwa_prompt_dismissed_at');
      const now = Date.now();
      
      // اگر قبلاً بسته شده، چک کن که آیا ۲۴ ساعت گذشته یا نه
      if (!dismissedAt || (now - parseInt(dismissedAt)) > 24 * 60 * 60 * 1000) {
        // یک تاخیر کوچک برای تجربه کاربری بهتر بعد از لود شدن صفحه
        const timer = setTimeout(() => setIsVisible(true), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isInstallable]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:max-w-md animate-slide-up">
      <div className="bg-white dark:bg-slate-800 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] p-6 rounded-[2rem] relative overflow-hidden group">
        {/* دکمه بستن */}
        <button 
          onClick={handleDismiss}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full border-2 border-black text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors z-10"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>

        <div className="flex gap-5 items-start flex-row-reverse text-right">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 animate-bounce-subtle">
            <i className="fa-solid fa-mobile-screen-button"></i>
          </div>
          <div className="flex-1 pt-1">
            <h4 className="text-lg font-black dark:text-white leading-tight mb-1">نصب نسخه اپلیکیشن</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
              برای تجربه سریع‌تر، دسترسی آفلاین و حذف نوار مرورگر، آزمون‌یار را روی صفحه اصلی نصب کنید. 🚀
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button 
            onClick={onInstall}
            className="flex-1 py-4 bg-emerald-400 text-black border-[3px] border-black rounded-xl font-black text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-cloud-arrow-down"></i>
            نصب فوری اپ
          </button>
        </div>
        
        {/* دکوراسیون پشت‌زمینه */}
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
