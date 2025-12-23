import { Language } from './types';

export const WALLET_ADDRESS = "0x4ae94eafa539f70223fcbbd15b8e0d0a76991ad6";

export const AD_CONFIG = {
  enabled: true,
  dashboard: {
    show: true,
    title: "🚀 پیشنهاد ویژه: اشتراک طلایی",
    description: "دسترسی نامحدود به هوش مصنوعی و چاپ حرفه‌ای سوالات!",
    buttonText: "ارتقا به VIP",
    action: "settings",
    gradient: "from-indigo-600 to-purple-700",
    icon: "fa-crown"
  },
  examResult: {
    show: true,
    title: "📢 کانال اطلاع‌رسانی آزمون‌یار",
    description: "کدهای تخفیف و جزوات جدید را در تلگرام دنبال کنید.",
    buttonText: "عضویت در تلگرام",
    url: "https://t.me/azmonyar",
    icon: "fa-paper-plane"
  },
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
    'settings.language': 'زبان برنامه',
    'ai.topic': 'موضوع',
    'ai.count': 'تعداد',
    'ai.difficulty': 'سطح',
    'common.back': 'بازگشت'
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.exam': 'Exam',
    'nav.flashcards': 'Flashcards',
    'nav.bank': 'Question Bank',
    'nav.ai': 'AI Designer',
    'nav.settings': 'Settings',
    'nav.stats': 'Statistics',
    'settings.language': 'Language',
    'ai.topic': 'Topic',
    'ai.count': 'Count',
    'ai.difficulty': 'Level',
    'common.back': 'Back'
  },
  ku: {
    'nav.dashboard': 'داشبۆرد',
    'nav.exam': 'تاقیکردنەوە',
    'nav.flashcards': 'فێربوونی زیرەک',
    'nav.bank': 'بانکی پرسیار',
    'nav.ai': 'داڕێژەری AI',
    'nav.settings': 'ڕێکخستنەکان',
    'nav.stats': 'ئامارەکان',
    'settings.language': 'زمانی بەرنامە',
    'ai.topic': 'بابەت',
    'ai.count': 'ژمارە',
    'ai.difficulty': 'ئاست',
    'common.back': 'گەڕانەوە'
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.exam': 'الاختبار',
    'nav.flashcards': 'التعلم الذكي',
    'nav.bank': 'بنك الأسئلة',
    'nav.ai': 'مصمم AI',
    'nav.settings': 'الإعدادات',
    'nav.stats': 'الإحصائيات',
    'settings.language': 'لغة التطبيق',
    'ai.topic': 'الموضوع',
    'ai.count': 'العدد',
    'ai.difficulty': 'المستوى',
    'common.back': 'رجوع'
  }
};