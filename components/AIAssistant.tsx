
import React, { useState } from 'react';
import { generateQuestions } from '../services/geminiService';
import { Question, Language, View } from '../types';

interface Props {
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  lang: Language;
  t: (k: string) => string;
  isPremium: boolean;
  setView: (v: View) => void;
}

const AIAssistant: React.FC<Props> = ({ setQuestions, t, isPremium, setView, lang }) => {
  const [method, setMethod] = useState<'topic' | 'text' | 'manual'>('text');
  const [selectedEngine, setSelectedEngine] = useState('Gemini');
  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [manualJson, setManualJson] = useState('');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('متوسط');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Question[]>([]);
  const [qTypes, setQTypes] = useState<string[]>(['mcq']);

  // پارامترهای مخصوص پرامپت طلایی دستی
  const [manualTopic, setManualTopic] = useState('');
  const [manualCount, setManualCount] = useState(20);
  const [manualDiff, setManualDiff] = useState('متوسط');

  const ENGINES = [
    { name: 'Gemini', color: 'bg-indigo-600', icon: 'fa-solid fa-sparkles' },
    { name: 'DeepSeek', color: 'bg-blue-600', icon: 'fa-solid fa-brain' },
    { name: 'ChatGPT', color: 'bg-emerald-600', icon: 'fa-solid fa-bolt' }
  ];

  const getGoldenPromptText = () => {
    return `تو یک متخصص آموزش و طراح سوالات آزمون‌های حرفه‌ای هستی. وظیفه داری بر اساس موضوعی که من اعلام می‌کنم، دقیقا ${manualCount} سوال چهارگزینه‌ای استاندارد و با کیفیت بالا طراحی کنی.

الزامات فنی و محتوایی:
۱. تنوع موضوعی: سوالات را به ۵ بخش تقسیم کن تا تمام جنبه‌های موضوع را پوشش دهد.
۲. فرمت خروجی: خروجی نهایی باید فقط و فقط در قالب JSON فشرده باشد تا در برنامه‌نویسی قابل استفاده باشد.
۳. ساختار هر سوال در JSON:
- id: شماره سوال
- q: متن سوال (کوتاه و دقیق)
- o: آرایه‌ای شامل ۴ گزینه
- a: ایندکس گزینه صحیح (۰ تا ۳)
- c: نام دسته‌بندی یا بخش مربوطه

۴. زبان: تمام محتوا باید به زبان فارسی باشد.
۵. نحوه ارائه: به دلیل محدودیت کاراکتر، سوالات را در پارت‌های ۵۰ تایی برای من ارسال کن. هر وقت پارت اول را فرستادی، منتظر تایید من بمان و بعد پارت بعدی را بفرست.

موضوع مورد نظر من این است: [${manualTopic || 'نام موضوع خود را اینجا بنویسید'}]
سطح دشواری مورد نظر: [${manualDiff}]
تعداد کل سوالات مورد نیاز: [${manualCount}]`;
  };

  const handleManualCountChange = (val: number) => {
    if ((val === 50 || val === 100) && !isPremium) {
      if (window.confirm('طراحی ۵۰ یا ۱۰۰ سوال مخصوص کاربران طلایی است. مایل به ارتقای حساب خود هستید؟')) {
        setView('settings');
      }
      return;
    }
    setManualCount(val);
  };

  const handleGenerate = async () => {
    if (method === 'topic' && !topic) return alert('لطفاً موضوع را وارد کنید');
    if (method === 'text' && !sourceText) return alert('لطفاً متن را وارد کنید');
    
    setLoading(true);
    setPreview([]);
    
    try {
      const res = await generateQuestions(
        topic, 
        count, 
        difficulty, 
        lang, 
        selectedEngine, 
        method === 'text' ? sourceText : undefined, 
        qTypes
      );
      
      if (res && res.length > 0) {
        setPreview(res);
      } else {
        throw new Error("پاسخ دریافتی خالی بود.");
      }
    } catch (err: any) {
      alert(err.message || "خطا در طراحی سوال. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualImport = () => {
    try {
      const start = manualJson.indexOf('[');
      const end = manualJson.lastIndexOf(']');
      if (start === -1 || end === -1) throw new Error("فرمت JSON نامعتبر است. کد باید بین [ و ] باشد.");
      const parsed = JSON.parse(manualJson.substring(start, end + 1));
      if (Array.isArray(parsed)) {
        setPreview(parsed);
        alert(`${parsed.length} سوال شناسایی شد. اکنون می‌توانید آن‌ها را ذخیره کنید.`);
      }
    } catch (e: any) {
      alert("خطا در تحلیل کد: " + e.message);
    }
  };

  const copyPromptToClipboard = () => {
    if (!manualTopic) {
        alert("لطفاً ابتدا موضوع را وارد کنید.");
        return;
    }
    navigator.clipboard.writeText(getGoldenPromptText());
    alert("پرامپت طلایی کپی شد! اکنون آن را در ChatGPT یا DeepSeek بچسبانید.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 text-right animate-fade-in px-2">
      {/* Tab Selector */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] border-[3px] border-black dark:border-white flex flex-col md:flex-row-reverse items-center justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 w-full md:w-auto border-2 border-black/10">
              <button onClick={() => setMethod('text')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-black transition-all ${method === 'text' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400'}`}>تبدیل متن 📄</button>
              <button onClick={() => setMethod('topic')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-black transition-all ${method === 'topic' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400'}`}>طراحی با AI ✨</button>
              <button onClick={() => setMethod('manual')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-black transition-all ${method === 'manual' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400'}`}>تولید دستی 🛠️</button>
          </div>
          <div className="hidden md:flex items-center gap-2 flex-row-reverse">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generator Mode</span>
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-[3rem] border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] h-full">
            {method === 'manual' ? (
                <div className="space-y-10">
                    {/* Step 1: Configuration */}
                    <div className="flex flex-col md:flex-row-reverse justify-between items-start gap-6 border-b-4 border-slate-100 dark:border-slate-700 pb-8">
                        <div className="text-right">
                            <h3 className="text-2xl font-black dark:text-white mb-2 flex items-center gap-3 flex-row-reverse">
                                <span className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-sm">۱</span>
                                تنظیمات آزمون خارجی
                            </h3>
                            <p className="text-xs text-slate-500 font-bold">مشخصات آزمون را برای تولید پرامپت وارد کنید.</p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-end w-full md:w-auto">
                            <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                                <label className="text-[9px] font-black text-slate-400 px-2 uppercase">موضوع آزمون</label>
                                <input type="text" value={manualTopic} onChange={(e) => setManualTopic(e.target.value)} placeholder="مثلاً: حقوق جزا" className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-black rounded-xl text-xs font-black outline-none focus:bg-amber-50" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-slate-400 px-2 uppercase">تعداد</label>
                                <select value={manualCount} onChange={(e) => handleManualCountChange(Number(e.target.value))} className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-black rounded-xl text-xs font-black outline-none">
                                    <option value={10}>۱۰ سوال</option>
                                    <option value={20}>۲۰ سوال</option>
                                    <option value={50}>۵۰ سوال {!isPremium && '🔒'}</option>
                                    <option value={100}>۱۰۰ سوال {!isPremium && '🔒'}</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-slate-400 px-2 uppercase">سختی</label>
                                <select value={manualDiff} onChange={(e) => setManualDiff(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-black rounded-xl text-xs font-black outline-none">
                                    <option>آسان</option><option>متوسط</option><option>سخت</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Step 2: Golden Prompt */}
                        <div className="space-y-6">
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-[2.5rem] border-2 border-amber-400 space-y-4">
                                <div className="flex justify-between items-center flex-row-reverse">
                                    <h4 className="text-xs font-black text-amber-700 dark:text-amber-300 uppercase flex items-center gap-2">
                                        <span className="w-6 h-6 bg-amber-400 text-black rounded-md flex items-center justify-center text-[10px]">۲</span>
                                        پرامپت طلایی آماده کپی
                                    </h4>
                                    <button onClick={copyPromptToClipboard} className="px-4 py-2 bg-slate-900 text-white border-2 border-black rounded-lg text-[10px] font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all">
                                        <i className="fa-solid fa-copy mr-1"></i> کپی متن
                                    </button>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-black/10 text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed h-56 overflow-y-auto custom-scrollbar text-right">
                                    {getGoldenPromptText()}
                                </div>
                            </div>
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border-2 border-dashed border-indigo-200 text-center">
                                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                                    🚀 راهنما: پرامپت را کپی کرده و در چت‌بات‌هایی مثل <span className="font-black">ChatGPT</span> یا <span className="font-black">DeepSeek</span> بفرستید.
                                </p>
                            </div>
                        </div>

                        {/* Step 3: Result Import */}
                        <div className="space-y-6">
                            <div className="text-right">
                                <h3 className="text-2xl font-black dark:text-white mb-2 flex items-center gap-3 flex-row-reverse">
                                    <span className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-sm">۳</span>
                                    درون‌ریزی کد نهایی
                                </h3>
                                <p className="text-xs text-slate-500 font-bold">کد JSON دریافتی را در کادر زیر بچسبانید.</p>
                            </div>
                            <textarea 
                              value={manualJson} 
                              onChange={(e) => setManualJson(e.target.value)} 
                              placeholder="کد JSON را اینجا Paste کنید..." 
                              className="w-full h-56 p-5 bg-slate-50 dark:bg-slate-900 border-[3px] border-black rounded-[2rem] outline-none text-[11px] font-mono text-indigo-500 focus:bg-white transition-all shadow-inner" 
                            />
                            <button onClick={handleManualImport} className="w-full py-6 bg-emerald-500 text-white rounded-[1.5rem] font-black text-xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                                تایید و استخراج سوالات 🚀
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row-reverse justify-between items-center gap-4">
                        <div className="text-right">
                            <h3 className="text-3xl font-black dark:text-white italic">
                                {method === 'text' ? 'تحلیل و استخراج 📄' : 'طراحی موضوعی ✨'}
                            </h3>
                            <p className="text-sm text-slate-500 font-bold mt-1">طراحی با هوش مصنوعی {selectedEngine}</p>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 border-2 border-black/10">
                            {ENGINES.map(e => (
                                <button key={e.name} onClick={() => setSelectedEngine(e.name)} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5 ${selectedEngine === e.name ? e.color + ' text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-500'}`}>
                                    <i className={e.icon}></i> {e.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3">
                            {method === 'text' ? (
                                <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="متن جزوه یا کتاب خود را اینجا قرار دهید..." className="w-full h-80 p-8 bg-slate-50 dark:bg-slate-900 border-[3px] border-black rounded-[2.5rem] outline-none text-[14px] font-bold leading-relaxed focus:bg-white shadow-inner" />
                            ) : (
                                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="موضوع آزمون را بنویسید (مثلاً: زیست‌شناسی سلولی)" className="w-full p-8 bg-slate-50 dark:bg-slate-900 border-[3px] border-black rounded-[2rem] outline-none font-black text-xl focus:bg-white" />
                            )}
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[2rem] border-[3px] border-black space-y-4">
                                <label className="text-[10px] font-black text-slate-400 block uppercase">تعداد سوالات</label>
                                <select value={count} onChange={(e) => {
                                  const val = Number(e.target.value);
                                  if ((val === 50 || val === 100) && !isPremium) {
                                      if (window.confirm('طراحی ۵۰ یا ۱۰۰ سوال مخصوص کاربران طلایی است. مایل به ارتقای حساب خود هستید؟')) setView('settings');
                                      return;
                                  }
                                  setCount(val);
                                }} className="w-full p-3 bg-white dark:bg-slate-800 border-2 border-black rounded-xl font-black text-sm outline-none">
                                    <option value={5}>۵ سوال</option>
                                    <option value={10}>۱۰ سوال</option>
                                    <option value={20}>۲۰ سوال</option>
                                    <option value={50}>۵۰ سوال {!isPremium && '🔒'}</option>
                                    <option value={100}>۱۰۰ سوال {!isPremium && '🔒'}</option>
                                </select>
                                <label className="text-[10px] font-black text-slate-400 block uppercase mt-4">سطح دشواری</label>
                                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-3 bg-white dark:bg-slate-800 border-2 border-black rounded-xl font-black text-sm outline-none">
                                    <option>آسان</option><option>متوسط</option><option>سخت</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button onClick={handleGenerate} disabled={loading} className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black text-2xl border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4">
                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                        {loading ? 'در حال تفکر هوش مصنوعی...' : 'طراحی آنی سوالات'}
                    </button>
                </div>
            )}
        </div>
      </div>

      {preview.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-8 rounded-[3rem] border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(16,185,129,1)] animate-slide-up">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 flex-row-reverse">
              <h4 className="text-2xl font-black text-emerald-800 dark:text-emerald-300">آماده ذخیره ({preview.length} سوال)</h4>
              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => setPreview([])} className="flex-1 px-6 py-3 bg-white dark:bg-slate-800 text-rose-500 rounded-xl font-black text-xs border-2 border-black">انصراف</button>
                <button onClick={() => {
                    setQuestions(prev => [...prev, ...preview.map(q => ({ ...q, id: Date.now() + Math.random(), dateAdded: new Date().toISOString() })) as any]);
                    setPreview([]);
                    setView('bank');
                }} className="flex-[2] px-10 py-3 bg-emerald-500 text-white rounded-xl font-black text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">ذخیره در بانک سوالات 📥</button>
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {preview.map((pq, idx) => (
                  <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border-[3px] border-black text-right shadow-[5px_5px_0px_0px_rgba(0,0,0,0.1)]">
                      <p className="text-sm font-black dark:text-white mb-4 leading-relaxed">{idx + 1}. {pq.q}</p>
                      <div className="space-y-2">
                          {pq.o.map((o, i) => (
                              <div key={i} className={`p-3 rounded-xl text-[11px] border-2 flex items-center justify-between flex-row-reverse ${i === pq.a ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-black' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-black/5'}`}>
                                <span>{o}</span> {i === pq.a && <i className="fa-solid fa-check"></i>}
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
