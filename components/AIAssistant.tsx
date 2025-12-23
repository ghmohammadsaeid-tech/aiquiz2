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
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('متوسط');
  const [loading, setLoading] = useState(false);
  const [manualJson, setManualJson] = useState('');
  const [preview, setPreview] = useState<Question[]>([]);
  const [editablePrompt, setEditablePrompt] = useState('');

  const LANG_CONFIG: Record<Language, { name: string, instruction: string }> = {
    fa: { name: 'فارسی', instruction: 'دقیقا ${count} سوال چهارگزینه‌ای با سطح دشواری "${difficulty}" طراحی کن. خروجی باید فقط JSON باشد.' },
    en: { name: 'English', instruction: 'Generate exactly ${count} multiple-choice questions with "${difficulty}" difficulty. Output must be ONLY JSON.' },
    ku: { name: 'کوردی (سۆرانی)', instruction: 'دروستکردنی ${count} پرسیاری چواربژاردەیی بە ئاستی "${difficulty}". تەنها JSON بنێرە.' },
    ar: { name: 'العربية', instruction: 'صمم ${count} سؤالاً من نوع الاختيار من متعدد بمستوى "${difficulty}". يجب أن يكون المخرج بتنسيق JSON فقط.' }
  };

  useEffect(() => {
    const config = LANG_CONFIG[lang];
    const promptTemplate = `System: You are an expert exam designer.
Task: ${config.instruction.replace('${count}', count.toString()).replace('${difficulty}', difficulty)}
Language: ${config.name}
Topic: ${topic || '[Topic Name]'}

Format:
[{ "q": "Question", "o": ["Option 1", "Option 2", "Option 3", "Option 4"], "a": 0, "c": "Category" }]`;
    
    setEditablePrompt(promptTemplate);
  }, [topic, count, difficulty, lang]);

  const handleDirectGenerate = async () => {
    if (!topic) return alert('Please enter a topic');
    setLoading(true);
    try {
      const res = await generateQuestions(topic, count, difficulty, lang);
      setPreview(res);
    } catch (err) {
      console.error(err);
      alert('Error generating questions. Check your API key and connection.');
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
        alert('Format must be a JSON array');
      }
    } catch (e) {
      alert('Invalid JSON content.');
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(editablePrompt);
    alert('Prompt copied!');
  };

  const saveAll = () => {
    const formattedPreview = preview.map(q => ({
        ...q,
        id: Date.now() + Math.random(),
        difficulty: q.difficulty || difficulty as any,
        c: q.c || 'General',
        dateAdded: new Date().toISOString()
    }));
    setQuestions(prev => [...prev, ...formattedPreview]);
    setPreview([]);
    setTopic('');
    alert('Saved to question bank!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center flex-row-reverse mb-4">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black shadow-sm transition-all"><i className="fa-solid fa-arrow-right"></i> {t('common.back')}</button>
      </div>

      <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500 ${isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-2xl font-black">AI Designer 🤖</h2>
          <div className="flex bg-black/20 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10">
            <button onClick={() => setMethod('manual')} className={`px-6 py-2 rounded-xl font-bold transition-all ${method === 'manual' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white'}`}>Manual</button>
            <button onClick={() => setMethod('direct')} className={`px-6 py-2 rounded-xl font-bold transition-all ${method === 'direct' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white'}`}>Direct AI</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 dark:bg-slate-800 bg-white p-8 rounded-[2rem] border dark:border-slate-700 border-slate-100 shadow-sm space-y-6">
          <h3 className="font-black dark:text-white text-slate-800 pb-4 border-b dark:border-slate-700">Content Config</h3>
          <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black mb-2 text-slate-400 uppercase tracking-widest">{t('ai.topic')}</label>
                <input 
                  type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black mb-2 text-slate-400 uppercase">{t('ai.count')}</label>
                  <select value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    {isPremium && <option value={50}>50</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black mb-2 text-slate-400 uppercase">{t('ai.difficulty')}</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
          </div>
        </div>

        <div className="md:col-span-2 dark:bg-slate-800 bg-white p-8 rounded-[2rem] border dark:border-slate-700 border-slate-100 shadow-sm">
          {method === 'direct' ? (
            <div className="h-full flex flex-col justify-center space-y-8 text-center">
              <div className="space-y-3">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-900 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl"><i className="fa-solid fa-bolt-lightning"></i></div>
                <h3 className="text-xl font-black dark:text-white text-slate-800">Direct AI Generation</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Gemini will design questions in {LANG_CONFIG[lang].name}.</p>
              </div>
              <button 
                onClick={handleDirectGenerate}
                disabled={loading}
                className={`w-full py-5 text-white rounded-2xl font-black text-lg disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-3 ${isPremium ? 'bg-amber-600' : 'bg-indigo-600'}`}
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                {loading ? 'Generating...' : 'Generate Questions'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 text-right">1. Copy Prompt:</label>
                <textarea 
                  readOnly value={editablePrompt}
                  className="w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 text-xs font-mono text-slate-500 dark:text-slate-400 h-24 outline-none"
                />
                <button onClick={copyPrompt} className="w-full mt-2 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs">Copy Prompt</button>
              </div>

              <div className="pt-4 border-t dark:border-slate-700 border-slate-50 text-right">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">2. Paste JSON Output:</label>
                <textarea 
                  value={manualJson} onChange={(e) => setManualJson(e.target.value)}
                  placeholder="Paste JSON here..."
                  className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none text-xs font-mono text-slate-900 dark:text-white transition-all"
                />
                <button onClick={handleManualProcess} className="w-full mt-4 py-4 bg-purple-600 text-white rounded-2xl font-black text-sm">Process Questions</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {preview.length > 0 && (
        <div className="space-y-6 animate-slide-up pb-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-800">
            <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400">{preview.length} Questions Ready</h3>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => setPreview([])} className="flex-1 px-6 py-3 bg-white dark:bg-slate-800 text-slate-500 rounded-xl font-black text-sm">Clear</button>
              <button onClick={saveAll} className="flex-1 px-10 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xl">Save to Bank</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;