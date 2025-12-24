
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
  const [selectedEngine, setSelectedEngine] = useState('DeepSeek');
  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [manualJson, setManualJson] = useState('');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('متوسط');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Question[]>([]);
  const [qTypes, setQTypes] = useState<string[]>(['mcq']);

  const ENGINES = [
    { name: 'DeepSeek', color: 'bg-blue-600', icon: 'fa-solid fa-brain' },
    { name: 'ChatGPT', color: 'bg-emerald-600', icon: 'fa-solid fa-bolt' },
    { name: 'Gemini', color: 'bg-indigo-600', icon: 'fa-solid fa-sparkles' }
  ];

  const handleGenerate = async () => {
    if (method === 'topic' && !topic) return alert('لطفاً موضوع را وارد کنید');
    if (method === 'text' && !sourceText) return alert('لطفاً متن را کپی کنید');
    
    if ((count === 50 || count === 100) && !isPremium) {
        alert('این تعداد سوال مخصوص اکانت طلایی است.');
        return;
    }

    setLoading(true);
    setPreview([]); // پاکسازی پیش‌نمایش قبلی
    
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
        alert("سوالی طراحی نشد. لطفاً موضوع یا متن را تغییر دهید.");
      }
    } catch (err: any) {
      alert(err.message || "خطای ناشناخته در طراحی سوال.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualImport = () => {
    try {
      const start = manualJson.indexOf('[');
      const end = manualJson.lastIndexOf(']');
      if (start === -1 || end === -1) throw new Error("فرمت JSON نامعتبر است.");
      const parsed = JSON.parse(manualJson.substring(start, end + 1));
      if (Array.isArray(parsed)) {
        setPreview(parsed);
        alert(`${parsed.length} سوال با موفقیت شناسایی شد.`);
      }
    } catch (e: any) {
      alert("خطا در پردازش کد: " + e.message);
    }
  };

  const handleTypeToggle = (type: string) => {
    setQTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value);
    if ((val === 50 || val === 100) && !isPremium) {
        if (window.confirm('طراحی ۵۰ یا ۱۰۰ سوال همزمان، مخصوص کاربران طلایی است. مایل به ارتقای حساب هستید؟')) {
            setView('settings');
        }
        return;
    }
    setCount(val);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 text-right animate-fade-in px-2">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-sm border dark:border-slate-700 flex flex-col md:flex-row-reverse items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-row-reverse w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 whitespace-nowrap">منطق طراحی:</span>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1">
                  {ENGINES.map(e => (
                      <button key={e.name} onClick={() => setSelectedEngine(e.name)} className={`px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${selectedEngine === e.name ? e.color + ' text-white shadow-lg' : 'text-slate-500'}`}>
                          <i className={e.icon}></i> {e.name}
                      </button>
                  ))}
              </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 w-full md:w-auto">
              <button onClick={() => setMethod('text')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black transition-all ${method === 'text' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>تبدیل متن</button>
              <button onClick={() => setMethod('topic')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black transition-all ${method === 'topic' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>موضوعی</button>
              <button onClick={() => setMethod('manual')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black transition-all ${method === 'manual' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>دستی</button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-[2rem] border-2 dark:border-slate-700 shadow-sm space-y-6">
            <h3 className="font-black text-[11px] md:text-xs border-b dark:border-slate-700 pb-3 flex items-center gap-2 flex-row-reverse"><i className="fa-solid fa-sliders text-indigo-500"></i> تنظیمات آزمون</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 block mb-3 text-right">نوع سوالات:</label>
                    <div className="grid grid-cols-1 gap-2">
                        {[{id:'mcq', label:'تستی'}, {id:'cloze', label:'جای خالی'}, {id:'tf', label:'صحیح/غلط'}].map(t => (
                            <button key={t.id} onClick={() => handleTypeToggle(t.id)} className={`p-2.5 rounded-xl border text-[10px] font-black flex items-center justify-between flex-row-reverse transition-all ${qTypes.includes(t.id) ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'text-slate-400 border-slate-50 dark:border-slate-900'}`}>
                                <span>{t.label}</span> {qTypes.includes(t.id) && <i className="fa-solid fa-check"></i>}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 block mb-2 text-right">سطح:</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl font-black text-[10px] outline-none">
                            <option>آسان</option><option>متوسط</option><option>سخت</option>
                        </select>
                    </div>
                    <div className="w-24">
                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 block mb-2 text-right">تعداد:</label>
                        <select value={count} onChange={handleCountChange} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl font-black text-[10px] outline-none">
                            <option value={5}>۵ سوال</option>
                            <option value={10}>۱۰ سوال</option>
                            <option value={20}>۲۰ سوال</option>
                            <option value={50}>۵۰ سوال {isPremium ? '' : '🔒'}</option>
                            <option value={100}>۱۰۰ سوال {isPremium ? '' : '🔒'}</option>
                        </select>
                    </div>
                </div>
            </div>
            <button onClick={() => setView('dashboard')} className="w-full py-3 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-xl text-[10px] font-black border border-slate-100 dark:border-slate-700">بازگشت</button>
          </div>
        </div>

        <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border-2 dark:border-slate-700 shadow-sm h-full flex flex-col gap-6">
                {method === 'manual' ? (
                    <div className="space-y-6 animate-slide-up">
                        <textarea 
                            value={manualJson} 
                            onChange={(e) => setManualJson(e.target.value)} 
                            placeholder="کد JSON را اینجا قرار دهید..." 
                            className="w-full h-48 p-5 bg-slate-50 dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl md:rounded-3xl outline-none text-[11px] font-mono text-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
                        />
                        <button onClick={handleManualImport} className="w-full py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all">
                            <i className="fa-solid fa-bolt-lightning ml-2"></i> استخراج سوالات
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-6 animate-fade-in">
                        <h3 className="text-lg md:text-xl font-black dark:text-white flex items-center gap-3">
                            <i className={`fa-solid ${method === 'text' ? 'fa-file-lines' : 'fa-lightbulb'} text-indigo-500`}></i>
                            {method === 'text' ? 'تحلیل و استخراج از متن' : 'طراحی هوشمند موضوعی'}
                        </h3>
                        {method === 'text' ? (
                            <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="متن جزوه یا کتاب را اینجا کپی کنید..." className="flex-1 w-full p-6 bg-slate-50 dark:bg-slate-900 border-2 dark:border-slate-700 rounded-[2rem] outline-none text-[13px] font-bold leading-relaxed focus:border-indigo-500 transition-all resize-none shadow-inner" />
                        ) : (
                            <div className="flex-1 flex flex-col justify-center gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 pr-4">موضوع آزمون را وارد کنید:</label>
                                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="مثلاً: فیزیک یا تاریخ" className="w-full p-5 bg-slate-50 dark:bg-slate-900 border-2 dark:border-slate-700 rounded-2xl outline-none font-black text-lg focus:border-indigo-500 shadow-sm" />
                                </div>
                            </div>
                        )}
                        <button onClick={handleGenerate} disabled={loading} className="w-full py-5 md:py-6 bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-xl md:text-2xl disabled:opacity-50 shadow-2xl active:scale-95 transition-all">
                            {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>}
                            {loading ? 'در حال طراحی هوشمند...' : 'شروع عملیات طراحی'}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-emerald-100 dark:border-emerald-900/30 animate-slide-up">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h4 className="text-lg md:text-xl font-black text-emerald-800 dark:text-emerald-300">سوالات استخراج شده ({preview.length})</h4>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => setPreview([])} className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-slate-800 text-slate-400 rounded-xl font-black text-[10px]">پاکسازی</button>
                <button onClick={() => {
                    setQuestions(prev => [...prev, ...preview.map(q => ({ ...q, id: Date.now() + Math.random(), dateAdded: new Date().toISOString() })) as any]);
                    setPreview([]);
                    setView('bank');
                }} className="flex-2 md:flex-none px-8 py-2 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-lg">ذخیره در بانک</button>
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
              {preview.map((pq, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 text-right shadow-sm">
                      <p className="text-[13px] font-black dark:text-white mb-4">{idx + 1}. {pq.q}</p>
                      <div className="space-y-2">
                          {pq.o.map((o, i) => (
                              <div key={i} className={`p-2 rounded-xl text-[10px] border flex items-center justify-between flex-row-reverse ${i === pq.a ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-700'}`}>
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
