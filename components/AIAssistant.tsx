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
      if (Array.isArray(parsed)) setPreview(parsed);
    } catch (e) {
      alert('خطا در خواندن JSON.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-fade-in text-right">
      <div className="flex justify-between items-center flex-row-reverse">
          <button onClick={() => setView('dashboard')} className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-black shadow-sm">
             بازگشت <i className="fa-solid fa-arrow-left mr-2"></i>
          </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border-2 dark:border-slate-700">
        <label className="text-[10px] font-black text-slate-400 block mb-4 uppercase tracking-widest text-center">انتخاب موتور طراحی (AI Engine)</label>
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

      <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden ${isPremium ? 'bg-slate-900' : 'bg-indigo-600'}`}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-right">
            <h2 className="text-2xl font-black mb-1">طراح هوشمند {selectedEngine} 🤖</h2>
            <p className="text-xs opacity-70">طراحی با شبیه‌ساز منطق {selectedEngine}</p>
          </div>
          <div className="flex bg-black/20 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 w-full md:w-auto">
            <button onClick={() => setMethod('manual')} className={`flex-1 md:px-6 py-2.5 rounded-xl font-bold text-xs ${method === 'manual' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white'}`}>روش دستی</button>
            <button onClick={() => setMethod('direct')} className={`flex-1 md:px-6 py-2.5 rounded-xl font-bold text-xs ${method === 'direct' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white'}`}>تولید مستقیم</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="dark:bg-slate-800 bg-white p-6 rounded-[2rem] border-2 dark:border-slate-700 shadow-sm space-y-5">
            <h3 className="font-black text-sm dark:text-white border-b-2 dark:border-slate-700 pb-3">تنظیمات طراحی</h3>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-2">موضوع آزمون</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="مثلاً: زبان، ریاضی..." className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-2">تعداد سوالات</label>
                <select value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-slate-900 dark:text-white">
                  <option value={5}>۵ سوال</option>
                  <option value={10}>۱۰ سوال</option>
                  <option value={20}>۲۰ سوال</option>
                  <option value={50} disabled={!isPremium} className={!isPremium ? 'text-slate-300' : 'text-amber-500 font-black'}>۵۰ سوال {!isPremium ? '(طلایی)' : '✨'}</option>
                  <option value={100} disabled={!isPremium} className={!isPremium ? 'text-slate-300' : 'text-amber-500 font-black'}>۱۰۰ سوال {!isPremium ? '(طلایی)' : '✨'}</option>
                </select>
              </div>
            </div>
            {!isPremium && <button onClick={() => setView('settings')} className="w-full py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black">فعال‌سازی ۱۰۰ سوال (VIP)</button>}
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
                <p className="text-slate-500 text-xs mt-3">با کلیک روی دکمه زیر، سوالات مستقیماً در بانک ذخیره می‌شوند.</p>
              </div>
              <button onClick={handleDirectGenerate} disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg disabled:opacity-50">
                {loading ? 'در حال طراحی سوالات...' : 'شروع طراحی خودکار'}
              </button>
            </div>
          ) : (
            <div className="dark:bg-slate-800 bg-white p-6 rounded-[2rem] border-2 dark:border-slate-700 shadow-sm space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-3">کپی پرامپت برای {selectedEngine}:</label>
                <div className="relative group">
                  <textarea readOnly value={editablePrompt} className="w-full h-28 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 text-[10px] font-mono text-slate-400 resize-none outline-none" />
                  <button onClick={() => { navigator.clipboard.writeText(editablePrompt); alert('کپی شد!'); }} className="absolute bottom-4 left-4 p-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold">کپی متن</button>
                </div>
              </div>
              <div className="pt-4 border-t-2 dark:border-slate-700">
                <label className="text-[10px] font-black text-slate-400 block mb-3 uppercase">چسباندن پاسخ AI:</label>
                <textarea value={manualJson} onChange={(e) => setManualJson(e.target.value)} placeholder="Paste response here..." className="w-full h-28 p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none text-xs font-mono text-slate-900 dark:text-white" />
                <button onClick={handleManualProcess} className="w-full mt-4 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all">تحلیل و افزودن سوالات</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {preview.length > 0 && (
        <div className="animate-slide-up space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-800 gap-4">
            <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{preview.length} سوال آماده اضافه شدن است</span>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => setPreview([])} className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-bold">لغو</button>
              <button onClick={() => {
                const formatted = preview.map(q => ({ ...q, id: Date.now() + Math.random(), dateAdded: new Date().toISOString() }));
                setQuestions(prev => [...prev, ...formatted as any]);
                setPreview([]);
                alert('با موفقیت به بانک سوالات اضافه شد.');
              }} className="flex-[2] px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg">تایید و ذخیره نهایی</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;