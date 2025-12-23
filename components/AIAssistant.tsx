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

const AIAssistant: React.FC<Props> = ({ setQuestions, t, isPremium, setView, lang }) => {
  const [method, setMethod] = useState<'direct' | 'manual'>('manual');
  const [selectedEngine, setSelectedEngine] = useState('DeepSeek');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('متوسط');
  const [loading, setLoading] = useState(false);
  const [manualJson, setManualJson] = useState('');
  const [preview, setPreview] = useState<Question[]>([]);
  const [editablePrompt, setEditablePrompt] = useState('');

  const ENGINES = [
    { name: 'DeepSeek', url: 'https://chat.deepseek.com/', color: 'bg-blue-600', icon: 'fa-solid fa-brain' },
    { name: 'ChatGPT', url: 'https://chat.openai.com/', color: 'bg-emerald-600', icon: 'fa-solid fa-bolt' },
    { name: 'Gemini', url: 'https://gemini.google.com/', color: 'bg-indigo-600', icon: 'fa-solid fa-sparkles' }
  ];

  useEffect(() => {
    const promptTemplate = `Create ${count} MCQ questions about "${topic || '...'}" in ${lang === 'fa' ? 'Persian' : lang} with ${difficulty} level. 
Output as JSON array ONLY: [{"q":"...","o":["...","...","...","..."],"a":0,"c":"...","difficulty":"..."}]
Engine Logic: ${selectedEngine}`;
    setEditablePrompt(promptTemplate);
  }, [topic, count, difficulty, lang, selectedEngine]);

  const handleDirectGenerate = async () => {
    if (!topic) return alert('لطفاً موضوع را وارد کنید');
    setLoading(true);
    try {
      const res = await generateQuestions(topic, count, difficulty, lang, selectedEngine);
      setPreview(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualProcess = () => {
    try {
      const start = manualJson.indexOf('[');
      const end = manualJson.lastIndexOf(']');
      const jsonStr = start !== -1 && end !== -1 ? manualJson.substring(start, end + 1) : manualJson;
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
          setPreview(parsed);
          alert('سوالات با موفقیت تحلیل شدند. پیش‌نمایش را در پایین صفحه ببینید.');
      }
    } catch (e) {
      alert('خطا در تحلیل متن. مطمئن شوید تمام کد JSON را کپی کرده‌اید.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-fade-in text-right">
      <div className="flex justify-between items-center flex-row-reverse">
          <button onClick={() => setView('dashboard')} className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-black shadow-sm border dark:border-slate-700">
             بازگشت <i className="fa-solid fa-arrow-left mr-2 text-[10px]"></i>
          </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border-2 dark:border-slate-700">
        <label className="text-[10px] font-black text-slate-400 block mb-4 uppercase tracking-widest text-center">انتخاب موتور طراحی (AI Engine Logic)</label>
        <div className="grid grid-cols-3 gap-3">
          {ENGINES.map(e => (
            <button 
              key={e.name}
              onClick={() => setSelectedEngine(e.name)}
              className={`flex flex-col items-center p-4 rounded-2xl border-[3px] transition-all ${selectedEngine === e.name ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-50 dark:border-slate-700'}`}
            >
              <div className={`w-10 h-10 ${e.color} text-white rounded-full flex items-center justify-center mb-2 text-sm shadow-lg`}><i className={e.icon}></i></div>
              <span className="text-[11px] font-black dark:text-white">{e.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500 ${isPremium ? 'bg-slate-900 border border-amber-500/30' : 'bg-indigo-600'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-right">
            <h2 className="text-2xl font-black mb-1">طراح هوشمند {selectedEngine} {isPremium && '✨'}</h2>
            <p className="text-xs opacity-70">طراحی سوال با شبیه‌ساز منطق عصبی {selectedEngine}</p>
          </div>
          <div className="flex bg-black/20 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 w-full md:w-auto">
            <button onClick={() => setMethod('manual')} className={`flex-1 md:px-6 py-2.5 rounded-xl font-bold text-xs ${method === 'manual' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white'}`}>روش دستی</button>
            <button onClick={() => setMethod('direct')} className={`flex-1 md:px-6 py-2.5 rounded-xl font-bold text-xs ${method === 'direct' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white'}`}>تولید مستقیم</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="dark:bg-slate-800 bg-white p-6 rounded-[2rem] border-2 dark:border-slate-700 shadow-sm space-y-6">
            <h3 className="font-black text-sm dark:text-white border-b-2 dark:border-slate-700 pb-3 uppercase tracking-tighter">Blueprint</h3>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-2">موضوع آزمون</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="مثلاً: فیزیک، زبان..." className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-indigo-500" />
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-400 block mb-2">تعداد سوالات</label>
                <select value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-slate-900 dark:text-white outline-none">
                  <option value={5}>۵ سوال</option>
                  <option value={10}>۱۰ سوال</option>
                  <option value={20}>۲۰ سوال</option>
                  <option value={50} disabled={!isPremium} className={!isPremium ? 'text-slate-300' : 'text-amber-500 font-black'}>
                    {isPremium ? '👑 ۵۰ سوال (طلایی)' : '🔒 ۵۰ سوال (VIP)'}
                  </option>
                  <option value={100} disabled={!isPremium} className={!isPremium ? 'text-slate-300' : 'text-amber-500 font-black'}>
                    {isPremium ? '👑 ۱۰۰ سوال (طلایی)' : '🔒 ۱۰۰ سوال (VIP)'}
                  </option>
                </select>
                {!isPremium && <p className="text-[9px] text-amber-600 mt-2 font-black text-center">ارتقا به طلایی برای تولید ۱۰۰ سوال</p>}
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-400 block mb-2">دشواری</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-slate-900 dark:text-white outline-none">
                  <option value="آسان">آسان</option>
                  <option value="متوسط">متوسط</option>
                  <option value="سخت">سخت</option>
                </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {method === 'direct' ? (
            <div className="dark:bg-slate-800 bg-white p-8 rounded-[2rem] border-2 dark:border-slate-700 shadow-sm h-full flex flex-col justify-center text-center">
              <div className="mb-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl mb-4 shadow-xl bg-slate-50 dark:bg-slate-900 text-indigo-500 ${loading ? 'animate-pulse' : ''}`}>
                  {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt-lightning"></i>}
                </div>
                <h3 className="text-xl font-black dark:text-white">تولید هوشمند با {selectedEngine}</h3>
                <p className="text-slate-500 text-xs mt-3 px-6 leading-relaxed">جمی‌نای با شبیه‌سازی منطق استنتاجی موتور {selectedEngine}، دقیق‌ترین سوالات را برای شما طراحی می‌کند.</p>
              </div>
              <button onClick={handleDirectGenerate} disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg disabled:opacity-50 shadow-xl transition-all active:scale-95">
                {loading ? 'در حال پردازش عصبی...' : 'شروع طراحی خودکار'}
              </button>
            </div>
          ) : (
            <div className="dark:bg-slate-800 bg-white p-6 rounded-[2rem] border-2 dark:border-slate-700 shadow-sm space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-3 uppercase tracking-tighter">۱. کپی پرامپت حرفه‌ای برای {selectedEngine}:</label>
                <div className="relative group">
                  <textarea readOnly value={editablePrompt} className="w-full h-28 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 text-[10px] font-mono text-slate-400 resize-none outline-none" />
                  <button onClick={() => { navigator.clipboard.writeText(editablePrompt); alert('پرامپت کپی شد!'); }} className="absolute bottom-4 left-4 p-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold shadow-lg">کپی متن</button>
                </div>
              </div>
              <div className="pt-4 border-t-2 dark:border-slate-700">
                <label className="text-[10px] font-black text-slate-400 block mb-3 uppercase tracking-tighter">۲. پاسخ موتور هوشمند را اینجا بچسبانید:</label>
                <textarea value={manualJson} onChange={(e) => setManualJson(e.target.value)} placeholder="Paste response JSON here..." className="w-full h-28 p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none text-xs font-mono text-slate-900 dark:text-white" />
                <button onClick={handleManualProcess} className="w-full mt-4 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all">تحلیل و وارد کردن سوالات</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {preview.length > 0 && (
        <div className="animate-slide-up space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-800 gap-4">
            <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{preview.length} سوال با موفقیت طراحی شد</span>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => setPreview([])} className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-bold">لغو</button>
              <button onClick={() => {
                const formatted = preview.map(q => ({ ...q, id: Date.now() + Math.random(), dateAdded: new Date().toISOString() }));
                setQuestions(prev => [...prev, ...formatted as any]);
                setPreview([]);
                alert('سوالات به بانک اضافه شدند.');
                setView('bank');
              }} className="flex-[2] px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg">تایید و ذخیره در بانک سوالات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;