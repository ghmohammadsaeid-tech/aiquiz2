import { Language } from './types';

export const WALLET_ADDRESS = "0x4ae94eafa539f70223fcbbd15b8e0d0a76991ad6";

/**
 * سیستم مدیریت مرکزی تبلیغات (Ad Management System)
 * مدیر سایت می‌تواند از اینجا تمام تبلیغات را کنترل کند.
 */
export const AD_CONFIG = {
  enabled: true, // غیرفعال کردن کل تبلیغات با این گزینه
  
  // ۱. تبلیغ بنری در داشبورد
  dashboard: {
    show: true,
    title: "🚀 پیشنهاد ویژه: اشتراک طلایی",
    description: "دسترسی نامحدود به هوش مصنوعی و چاپ حرفه‌ای سوالات!",
    buttonText: "ارتقا به VIP",
    action: "settings", // نام ویو (view) برای انتقال داخلی
    gradient: "from-indigo-600 to-purple-700",
    icon: "fa-crown"
  },

  // ۲. تبلیغ در پایان آزمون (Exam Result)
  examResult: {
    show: true,
    title: "📢 کانال اطلاع‌رسانی آزمون‌یار",
    description: "کدهای تخفیف و جزوات جدید را در تلگرام دنبال کنید.",
    buttonText: "عضویت در تلگرام",
    url: "https://t.me/azmonyar", // لینک خارجی
    icon: "fa-paper-plane"
  },

  // ۳. تبلیغ در پایان مرور فلش‌کارت‌ها
  flashcardEnd: {
    show: true,
    title: "🎓 آکادمی تخصصی آزمون‌یار",
    description: "دوره جامع یادگیری سریع با تکنیک فاینمن منتشر شد.",
    buttonText: "مشاهده دوره",
    url: "https://example.com/course",
    icon: "fa-graduation-cap"
  }
};

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  fa: {
    'nav.dashboard': 'داشبورد',
    'nav.exam': 'آزمون',
    'nav.flashcards': 'یادگیری هوشمند',
    'nav.bank': 'بانک سوالات',
    'nav.ai': 'طراح هوشمند (AI)',
    'nav.settings': 'تنظیمات',
    'nav.stats': 'گزارش پیشرفت',
    'dashboard.title': 'آزمون‌یار هوشمند',
    'dashboard.subtitle': 'یادگیری به روش فاینمن و الگوریتم SM-2',
    'dashboard.xp': 'امتیاز تجربه (XP)',
    'dashboard.level': 'سطح',
    'dashboard.streak': 'توالی مطالعه',
    'dashboard.dailyGoal': 'هدف روزانه',
    'flashcards.reviewNow': 'مرور کارت‌های امروز',
    'flashcards.cloze': 'جای خالی (Cloze)',
    'flashcards.standard': 'کارت استاندارد',
    'flashcards.formula': 'فرمول علمی (LaTeX)',
    'flashcards.media': 'چندرسانه‌ای',
    'flashcards.mastery': 'تسلط کلی',
    'flashcards.leech': 'کارت‌های مشکل‌دار',
    'stats.activity': 'فعالیت ۳۰ روز اخیر',
    'stats.distribution': 'توزیع وضعیت کارت‌ها',
    'ai.promptTitle': 'پرامپت طلایی (تولید ۱۰۰ سوال)',
    'ai.manualMethod': 'روش دستی (JSON)',
    'ai.directMethod': 'تولید مستقیم (Gemini)',
    'ai.generateDirect': 'تولید مستقیم با هوش مصنوعی',
    'common.save': 'ذخیره',
    'common.cancel': 'انصراف',
    'common.delete': 'حذف',
    'common.copy': 'کپی پرامپت',
    'settings.premium': 'حساب پرمیوم',
    'settings.data': 'مدیریت داده و پشتیبان‌گیری',
    'settings.support': 'ارتباط با پشتیبانی'
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.exam': 'Exam',
    'nav.flashcards': 'Smart Learning',
    'nav.bank': 'Question Bank',
    'nav.ai': 'AI Designer',
    'nav.settings': 'Settings',
    'nav.stats': 'Statistics',
    'dashboard.title': 'Smart Assistant',
    'dashboard.subtitle': 'Feynman Method & SM-2 Algorithm',
    'dashboard.xp': 'Experience (XP)',
    'dashboard.level': 'Level',
    'dashboard.streak': 'Study Streak',
    'dashboard.dailyGoal': 'Daily Goal',
    'flashcards.reviewNow': 'Due Today',
    'flashcards.cloze': 'Cloze Deletion',
    'flashcards.standard': 'Standard Card',
    'flashcards.formula': 'Formula (LaTeX)',
    'flashcards.media': 'Multimedia',
    'flashcards.mastery': 'Overall Mastery',
    'flashcards.leech': 'Difficult Cards',
    'stats.activity': 'Last 30 Days Activity',
    'stats.distribution': 'Card Status Distribution',
    'ai.promptTitle': 'Golden Prompt (100 JSON)',
    'ai.manualMethod': 'Manual Method (JSON)',
    'ai.directMethod': 'Direct (Gemini AI)',
    'ai.generateDirect': 'Generate Directly with AI',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.copy': 'Copy',
    'settings.premium': 'Premium Account',
    'settings.data': 'Data & Backup',
    'settings.support': 'Support & Feedback'
  }
};