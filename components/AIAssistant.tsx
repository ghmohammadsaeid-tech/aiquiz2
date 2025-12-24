
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
  
  const [manualTopic, setManualTopic] = useState('');
  const [manualCount, setManualCount] = useState(20);
  const [manualDiff, setManualDiff] = useState('متوسط');

  const ENGINES = [
    { name: 'Gemini', color: 'bg-indigo-600', icon: 'fa-solid fa-sparkles' },
    { name: 'DeepSeek', color: 'bg-blue-600', icon: 'fa-solid fa-brain' },
    { name: 'ChatGPT', color: 'bg-emerald-600', icon: 'fa-solid fa-bolt' }
  ];

  const handleCountSelection = (val: number, isManual: boolean) => {
    if ((val === 50 || val === 100) && !isPremium) {
      if (window.confirm(t('ai.premium.lock'))) {
        setView('settings');
      }
      return;
    }
    if (isManual) setManualCount(val);
    else setCount(val);
  };

  const getGoldenPromptText = () => {
    return `تو یک متخصص آموزش و طراح سوالات آزمون‌های حرفه‌ای هستی. وظیفه داری بر اساس موضوع [${manualTopic || 'موضوع انتخابی من'}]، دقیقا ${manualCount} سوال چهارگزینه‌ای استاندارد و با کیفیت بالا طراحی کنی.

الزامات فنی و محتوایی:
۱. تنوع موضوعی: سوالات تمام جنبه‌های موضوع را پوشش دهد.
۲. فرمت خروجی: خروجی نهایی باید فقط و فقط در قالب JSON فشرده باشد.
۳. ساختار هر سوال در JSON:
- q: متن سوال
- o: آرایه‌ای شامل ۴ گزینه
- a: ایندکس گزینه صحیح (۰ تا ۳)
- c: نام دسته‌بندی
- difficulty: ${manualDiff}

۴. زبان: تمام محتوا باید به زبان فارسی باشد.
۵. نحوه ارائه: پاسخ فقط کد JSON باشد بدون هیچ متن اضافی.`;
  };

  const handleGenerate = async () => {
    if (method === 'topic' && !topic) return alert(t('ai.topic') + ' را وارد کنید');
    if (method === 'text' && !sourceText) return alert(t('ai.method.text') + ' را وارد کنید');
    
    setLoading(true);
    setPreview([]);
    
    try {
      const res = await generateQuestions(
        method === 'topic' ? topic : "Text Analysis Quiz", 
        count, 
        difficulty, 
        lang, 
        selectedEngine, 
        method === 'text' ? sourceText : undefined
      );
      
      if (res && res.length > 0) {
        setPreview(res);
      }
    } catch (err: any) {
      alert(err.message || "Error generating questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualImport = () => {
    try {
      const start = manualJson.indexOf('[');
      const end = manualJson.lastIndexOf(']');
      if (start === -1 || end === -1) throw new Error("Format Invalid");
      const parsed = JSON.parse(manualJson.substring(start, end + 1));
      if (Array.isArray(parsed)) {
        setPreview(parsed);
      }
    } catch (e: any) {
      alert("Error parsing: " + e.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 text-right animate-fade-in px-2">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] border-[3px] border-black dark:border-white flex flex-col md:flex-row-reverse items-center justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 w-full md:w-auto border-2 border-black/10">
              <button onClick={() => setMethod('text')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-black transition-all ${method === 'text' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400'}`}>{t('ai.method.text')}</button>
              <button onClick={() => setMethod('topic')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-black transition-all ${method === 'topic' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400'}`}>{t('ai.method.topic')}</button>
              <button onClick={() => setMethod('manual')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-black transition-all ${method === 'manual' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-400'}`}>{t('ai.method.manual')}</button>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-[3rem] border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          {method === 'manual' ? (
              <div className="space-y-10">
                  {/* Step-by-Step Guide Headers */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[1,2,3,4].map(step => (
                          <div key={step} className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-black rounded-2xl text-center space-y-1">
                              <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center mx-auto font-black text-sm">{step}</span>
                              <h4 className="text-[10px] font-black dark:text-white uppercase">{t(`ai.manual.step${step}`)}</h4>
                              <p className="text-[8px] text-slate-400 font-bold">{t(`ai.manual.step${step}.desc`)}</p>
                          </div>
                      ))}
                  </div>

                  <div className="border-t-4 border-slate-100 dark:border-slate-700 pt-8 space-y-8">
                    <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-6">
                        <div className="flex flex-wrap gap-3 justify-center md:justify-end w-full md:w-auto">
                            <input type="text" value={manualTopic} onChange={(e) => setManualTopic(e.target.value)} placeholder={t('ai.topic')} className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-black rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500" />
                            <select value={manualCount} onChange={(e) => handleCountSelection(Number(e.target.value), true)} className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-black rounded-xl text-xs font-black outline-none">
                                <option value={10}>۱۰ سوال</option>
                                <option value={20}>۲۰ سوال</option>
                                <option value={50}>۵۰ سوال {!isPremium && '🔒'}</option>
                                <option value={100}>۱۰۰ سوال {!isPremium && '🔒'}</option>
                            </select>
                        </div>
                        <h3 className="text-xl font-black dark:text-white italic">تنظیمات طراحی دستی 🛠️</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-[2.5rem] border-2 border-amber-400">
                                <button onClick={() => {navigator.clipboard.writeText(getGoldenPromptText()); alert('Copied!');}} className="w-full py-4 bg-slate-900 text-white border-2 border-black rounded-xl text-xs font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all mb-4">
                                    <i className="fa-solid fa-copy mr-2"></i> {t('ai.manual.copy')}
                                </button>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-black/10 text-[10px] font-bold h-40 overflow-y-auto custom-scrollbar text-right leading-relaxed">
                                    {getGoldenPromptText()}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <textarea value={manualJson} onChange={(e) => setManualJson(e.target.value)} placeholder={t('ai.manual.placeholder')} className="w-full h-40 p-5 bg-slate-50 dark:bg-slate-900 border-[3px] border-black rounded-[2rem] outline-none text-[11px] font-mono focus:bg-white transition-all" />
                            <button onClick={handleManualImport} className="w-full py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black text-xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                                {t('ai.manual.import')} 🚀
                            </button>
                        </div>
                    </div>
                  </div>
              </div>
          ) : (
              <div className="flex flex-col gap-8">
                  <div className="flex flex-col md:flex-row-reverse justify-between items-center gap-4">
                      <div className="text-right">
                          <h3 className="text-3xl font-black dark:text-white italic">{method === 'text' ? t('ai.method.text') : t('ai.method.topic')}</h3>
                      </div>
                      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 border-2 border-black/10">
                          {ENGINES.map(e => (
                              <button key={e.name} onClick={() => setSelectedEngine(e.name)} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${selectedEngine === e.name ? e.color + ' text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-500'}`}>{e.name}</button>
                          ))}
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      <div className="lg:col-span-3">
                          {method === 'text' ? (
                              <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="متن جزوه یا مقاله را اینجا قرار دهید..." className="w-full h-64 p-8 bg-slate-50 dark:bg-slate-900 border-[3px] border-black rounded-[2.5rem] outline-none font-bold text-lg focus:bg-white shadow-inner" />
                          ) : (
                              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t('ai.topic')} className="w-full p-8 bg-slate-50 dark:bg-slate-900 border-[3px] border-black rounded-[2.5rem] outline-none font-black text-2xl focus:bg-white" />
                          )}
                      </div>
                      <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border-[3px] border-black space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">{t('ai.count')}</label>
                            <select value={count} onChange={(e) => handleCountSelection(Number(e.target.value), false)} className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-black rounded-xl font-black text-sm outline-none">
                                <option value={5}>۵ سوال</option>
                                <option value={10}>۱۰ سوال</option>
                                <option value={20}>۲۰ سوال</option>
                                <option value={50}>۵۰ سوال {!isPremium && '🔒'}</option>
                                <option value={100}>۱۰۰ سوال {!isPremium && '🔒'}</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">{t('ai.difficulty')}</label>
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-black rounded-xl font-black text-sm outline-none">
                                <option>آسان</option><option>متوسط</option><option>سخت</option>
                            </select>
                          </div>
                      </div>
                  </div>

                  <button onClick={handleGenerate} disabled={loading} className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black text-2xl border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4">
                      {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                      {loading ? 'Processing Intelligence...' : t('ai.generate')}
                  </button>
              </div>
          )}
      </div>

      {preview.length > 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-8 rounded-[3rem] border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(16,185,129,1)] animate-slide-up">
              <div className="flex justify-between items-center mb-8 flex-row-reverse">
                  <h4 className="text-2xl font-black text-emerald-800 dark:text-emerald-300 italic">({preview.length}) {t('nav.bank')}</h4>
                  <div className="flex gap-4">
                      <button onClick={() => setPreview([])} className="px-8 py-3 bg-white dark:bg-slate-800 text-rose-500 rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{t('common.cancel')}</button>
                      <button onClick={() => {setQuestions(prev => [...prev, ...preview.map(q => ({...q, id: Date.now()+Math.random(), dateAdded: new Date().toISOString()})) as any]); setPreview([]); setView('bank');}} className="px-12 py-3 bg-emerald-500 text-white rounded-xl font-black border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all">{t('common.save')}</button>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                  {preview.map((pq, idx) => (
                      <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-black text-right shadow-sm">
                          <p className="text-sm font-black dark:text-white mb-2">{idx + 1}. {pq.q}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">✓ {pq.o[pq.a]}</p>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default AIAssistant;
