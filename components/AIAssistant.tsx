import React, { useState, useEffect } from 'react';
import { generateQuestions } from '../services/geminiService';
import { Question, Language, View } from '../types';

interface Props {
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  lang: Language;
  t: (k: string) => string;
  isPremium: boolean;
  setView: (v: View) => void;
}

const AIAssistant: React.FC<Props> = ({ setQuestions, t, isPremium, setView }) => {
  const [method, setMethod] = useState<'direct' | 'manual'>('manual');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('متوسط');
  const [loading, setLoading] = useState(false);
  const [manualJson, setManualJson] = useState('');
  const [preview, setPreview] = useState<Question[]>([]);
  const [editablePrompt, setEditablePrompt] = useState('');

  const AI_ENGINES = [
    { name: 'DeepSeek', url: 'https://chat.deepseek.com/', color: 'bg-[#4d6bfe]', icon: 'fa-solid fa-brain' },
    { name: 'ChatGPT', url: 'https://chatgpt.com/', color: 'bg-[#10a37f]', icon: 'fa-solid fa-bolt' },
    { name: 'Gemini', url: 'https://gemini.google.com/', color: 'bg-[#4285f4]', icon: 'fa-solid fa-wand-magic-sparkles' },
    { name: 'Claude', url: 'https://claude.ai/', color: 'bg-[#d97757]', icon: 'fa-solid fa-microchip' },
  ];

  useEffect(() => {
    const questionsPerSection = Math.floor(count / 5);
    const partsNeeded = count > 50 ? Math.ceil(count / 50) : 1;
    
    const promptTemplate = `تو یک متخصص آموزش و طراح سوالات آزمون‌های حرفه‌ای هستی. وظیفه داری بر اساس موضوعی که من اعلام می‌کنم، دقیقا ${count} سوال چهارگزینه‌ای استاندارد و با کیفیت بالا با سطح دشواری "${difficulty}" طراحی کنی.

الزامات فنی و محتوایی:
۱. تنوع موضوعی: سوالات را به ۵ بخش (هر بخش ${questionsPerSection} سوال) تقسیم کن تا تمام جنبه‌های موضوع را پوشش دهد.
۲. فرمت خروجی: خروجی نهایی باید فقط و فقط در قالب JSON فشرده باشد تا در برنامه‌نویسی قابل استفاده باشد.
۳. ساختار هر سوال: هر آبجکت در آرایه باید دارای فیلدهای زیر باشد:
   id: شماره سوال از ۱ تا ${count}
   q: متن سوال (کوتاه و دقیق)
   o: آرایه‌ای شامل ۴ گزینه
   a: ایندکس گزینه صحیح (از ۰ تا ۳)
   c: نام دسته‌بندی یا بخش مربوطه
۴. زبان: تمام محتوا باید به زبان فارسی باشد.
۵. نحوه ارائه: به دلیل محدودیت کاراکتر، سوالات را در پارت‌های ۵۰ تایی ${partsNeeded > 1 ? `(مثلا پارت اول ۱ تا ۵۰ و پارت دوم ۵۱ تا ${count})` : ''} برای من ارسال کن. ${partsNeeded > 1 ? 'هر وقت پارت اول را فرستادی، منتظر تایید من بمان و بعد پارت بعدی را بفرست.' : ''}

موضوع مورد نظر من این است: [${topic || 'نام موضوع خود را اینجا بنویسید، مثلا: حقوق مدنی'}]`;
    
    setEditablePrompt(promptTemplate);
  }, [topic, count, difficulty]);

  const handleDirectGenerate = async () => {
    if (!topic) return alert('لطفا موضوع را وارد کنید');
    setLoading(true);
    try {
      const res = await generateQuestions(topic, count, difficulty);
      setPreview(res);
    } catch (err) {
      alert('خطا در تولید سوالات. لطفا دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualProcess = () => {
    try {
      const cleanJson = manualJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed)) {
        setPreview(parsed);
        setManualJson('');
      } else {
        alert('فرمت جیسون باید یک آرایه باشد');
      }
    } catch (e) {
      alert('خطا در پردازش جیسون. لطفا از معتبر بودن متن اطمینان حاصل کنید.');
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(editablePrompt);
    alert('پرامپت طلایی کپی شد. حالا می‌توانید آن را در هوش مصنوعی مورد نظر چسبانده و سوالات را دریافت کنید.');
  };

  const openEngine = (url: string) => {
    copyPrompt();
    window.open(url, '_blank');
  };

  const saveAll = () => {
    const formattedPreview = preview.map(q => ({
        ...q,
        difficulty: q.difficulty || difficulty as any,
        c: q.c || 'عمومی',
        dateAdded: new Date().toISOString()
    }));
    setQuestions(prev => [...prev, ...formattedPreview]);
    setPreview([]);
    setTopic('');
    alert('تمامی سوالات با موفقیت در بانک ذخیره شدند.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center flex-row-reverse mb-4">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all"
          >
            <i className="fa-solid fa-arrow-right"></i>
            بازگشت
          </button>
      </div>
      <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500 ${isPremium ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-black mb-2 tracking-tight">طراح هوشمند آزمون 🤖</h2>
            <p className="opacity-80 font-medium">تولید سوالات استاندارد با استفاده از هوش مصنوعی</p>
          </div>
          <div className="flex bg-black/20 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setMethod('manual')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${method === 'manual' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white hover:bg-white/10'}`}
            >
              {t('ai.manualMethod')}
            </button>
            <button 
              onClick={() => setMethod('direct')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${method === 'direct' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white hover:bg-white/10'}`}
            >
              {t('ai.directMethod')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 dark:bg-slate-800 bg-white p-8 rounded-[2rem] border dark:border-slate-700 border-slate-100 shadow-sm space-y-6">
          <h3 className="font-black dark:text-white text-slate-800 border-b dark:border-slate-700 border-slate-50 pb-4 flex items-center gap-2">
            <i className="fa-solid fa-sliders text-indigo-500"></i>
            تنظیمات محتوا
          </h3>
          <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black mb-2 text-slate-400 uppercase tracking-widest">موضوع اصلی</label>
                <input 
                  type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثلا: ریاضیات کنکور"
                  className="w-full p-4 dark:bg-slate-900 bg-slate-50 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 rounded-2xl outline-none transition-all font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black mb-2 text-slate-400 uppercase tracking-widest">تعداد</label>
                  <select value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="w-full p-4 dark:bg-slate-900 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold">
                    <option value={5}>۵ سوال</option>
                    <option value={10}>۱۰ سوال</option>
                    <option value={20}>۲۰ سوال</option>
                    {!isPremium && <option disabled value={50}>۵۰ سوال (پریمیوم)</option>}
                    {isPremium && <option value={50}>۵۰ سوال</option>}
                    {!isPremium && <option disabled value={100}>۱۰۰ سوال (پریمیوم)</option>}
                    {isPremium && <option value={100}>۱۰۰ سوال</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black mb-2 text-slate-400 uppercase tracking-widest">سطح</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-4 dark:bg-slate-900 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold">
                    <option value="آسان">آسان</option>
                    <option value="متوسط">متوسط</option>
                    <option value="سخت">سخت</option>
                  </select>
                </div>
              </div>
              {!isPremium && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed text-center">برای تولید بیش از ۲۰ سوال به صورت همزمان، حساب خود را ارتقا دهید.</p>
                </div>
              )}
          </div>
        </div>

        <div className="md:col-span-2 dark:bg-slate-800 bg-white p-8 rounded-[2rem] border dark:border-slate-700 border-slate-100 shadow-sm relative overflow-hidden">
          {method === 'direct' ? (
            <div className="h-full flex flex-col justify-center space-y-8 text-center">
              <div className="space-y-3">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-900 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                    <i className="fa-solid fa-bolt-lightning"></i>
                </div>
                <h3 className="text-2xl font-black dark:text-white text-slate-800">تولید مستقیم با Gemini AI</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">سوالات مستقیماً در همین صفحه تولید و نمایش داده می‌شوند.</p>
              </div>
              <button 
                onClick={handleDirectGenerate}
                disabled={loading}
                className={`w-full py-5 text-white rounded-2xl font-black text-lg disabled:opacity-50 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 ${isPremium ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                {loading ? 'در حال پردازش هوشمند...' : t('ai.generateDirect')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">۱. کپی پرامپت و انتخاب موتور هوش مصنوعی</label>
                <div className="relative group">
                    <textarea 
                      readOnly
                      value={editablePrompt}
                      className="w-full dark:bg-slate-900 bg-slate-50 p-5 rounded-2xl border-2 border-transparent text-[10px] md:text-xs font-mono text-slate-500 h-32 overflow-y-auto leading-relaxed outline-none transition-all"
                    />
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={copyPrompt} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                            <i className="fa-solid fa-copy"></i> کپی پرامپت
                        </button>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AI_ENGINES.map(engine => (
                    <button 
                        key={engine.name}
                        onClick={() => openEngine(engine.url)}
                        className={`${engine.color} text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-[1.03] active:scale-95 transition-all shadow-lg shadow-black/5`}
                    >
                        <i className={`${engine.icon} text-xl`}></i>
                        <span className="text-[10px] font-black uppercase tracking-wider">{engine.name}</span>
                    </button>
                ))}
              </div>

              <div className="pt-4 border-t dark:border-slate-700 border-slate-50">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">۲. چسباندن خروجی JSON هوش مصنوعی</label>
                <textarea 
                  value={manualJson}
                  onChange={(e) => setManualJson(e.target.value)}
                  placeholder="Paste JSON output here..."
                  className="w-full h-24 p-4 dark:bg-slate-900 bg-slate-50 border-2 border-transparent focus:border-purple-100 rounded-2xl outline-none text-xs font-mono transition-all"
                />
                <button 
                    onClick={handleManualProcess}
                    className="w-full mt-4 py-4 bg-purple-600 text-white rounded-2xl font-black text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-50"
                >
                    بررسی و استخراج سوالات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {preview.length > 0 && (
        <div className="space-y-6 animate-slide-up pb-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/50 shadow-xl shadow-emerald-50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-200">
                <i className="fa-solid fa-check"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400">{preview.length} سوال جدید آماده شد</h3>
                <p className="text-xs text-emerald-700/70 font-bold">لطفاً پیش‌نمایش را بررسی کنید و سپس ذخیره نهایی را بزنید.</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => setPreview([])} className="flex-1 md:flex-none px-8 py-3 bg-white dark:bg-slate-800 text-slate-500 rounded-xl font-black text-sm border border-emerald-100">انصراف</button>
              <button onClick={saveAll} className="flex-1 md:flex-none px-10 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-200">ذخیره در بانک</button>
            </div>
          </div>

          <div className="grid gap-6">
            {preview.map((q, i) => (
              <div key={i} className="dark:bg-slate-800 bg-white p-8 rounded-[2rem] border dark:border-slate-700 border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                      <div className="flex gap-2 mb-3">
                        <span className="text-[10px] px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-black uppercase tracking-widest">{q.c || 'عمومی'}</span>
                      </div>
                      <h4 className="text-lg font-black dark:text-white text-slate-800 leading-relaxed">{i + 1}. {q.q}</h4>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.o.map((opt, oi) => (
                    <div key={oi} className={`p-4 rounded-2xl text-sm border-2 flex items-center gap-4 transition-all ${oi === q.a ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400 font-bold shadow-sm' : 'bg-slate-50/50 dark:bg-slate-900/50 border-transparent text-slate-500'}`}>
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-sm ${oi === q.a ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-400'}`}>{oi + 1}</span>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;