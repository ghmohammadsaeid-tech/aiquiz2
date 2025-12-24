
import React, { useState, useEffect } from 'react';
import { Question, View, ExamState, Language } from '../types';
import { getDeepExplanation } from '../services/geminiService';

interface Props {
  questions: Question[];
  setView: (v: View) => void;
  lang: Language;
  t: (k: string) => string;
  isPremium: boolean;
  dynamicAd: { title: string, desc: string, btn: string, url: string };
}

const Exam: React.FC<Props> = ({ questions, setView, t, isPremium, dynamicAd, lang }) => {
  const [exam, setExam] = useState<ExamState | null>(null);
  const [config, setConfig] = useState({ count: Math.min(20, questions.length), difficulty: 'all', randomize: true, showAnswers: true, hasTimer: true });
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [deepStudyContent, setDeepStudyContent] = useState<string | null>(null);
  const [isStudying, setIsStudying] = useState(false);

  useEffect(() => {
    let timer: any;
    if (exam?.active && config.hasTimer && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && exam?.active && config.hasTimer) {
      setShowResult(true);
    }
    return () => clearInterval(timer);
  }, [exam?.active, timeLeft, config.hasTimer]);

  const handleDeepStudy = async (q: Question) => {
    setIsStudying(true);
    try {
        const res = await getDeepExplanation(q.q, q.o[q.a], lang);
        setDeepStudyContent(res);
    } catch (e) {
        alert('خطا در دریافت تحلیل.');
    } finally {
        setIsStudying(false);
    }
  };

  if (questions.length === 0) {
      return (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <i className="fa-solid fa-triangle-exclamation text-6xl text-amber-500 mb-6"></i>
              <h2 className="text-3xl font-black mb-6 dark:text-white">بانک سوالات شما خالی است</h2>
              <button onClick={() => setView('ai')} className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">طراحی سوال با هوش مصنوعی</button>
          </div>
      );
  }

  const startExam = () => {
    let filtered = [...questions];
    if (config.difficulty !== 'all') filtered = filtered.filter(q => q.difficulty === config.difficulty);
    if (config.randomize) filtered.sort(() => Math.random() - 0.5);
    const selected = filtered.slice(0, config.count);
    setExam({ active: true, currentQuestion: 0, answers: new Array(selected.length).fill(null), questions: selected, config: config });
    setTimeLeft(selected.length * 60);
  };

  const selectAnswer = (idx: number) => {
    if (!exam) return;
    const newAnswers = [...exam.answers];
    newAnswers[exam.currentQuestion] = idx;
    setExam({ ...exam, answers: newAnswers });
  };

  if (showResult && exam) {
    const correctCount = exam.answers.reduce((acc, ans, idx) => ans === exam.questions[idx].a ? acc + 1 : acc, 0);
    const score = Math.round((correctCount / exam.questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-10 pb-24">
        <div className="bg-white dark:bg-slate-800 p-10 md:p-14 rounded-[3rem] border-[6px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] dark:shadow-[15px_15px_0px_0px_rgba(255,255,255,1)] text-center">
            <div className={`w-36 h-36 mx-auto rounded-full flex items-center justify-center text-4xl font-black mb-10 border-[10px] border-black ${score >= 50 ? 'bg-emerald-400' : 'bg-rose-400'}`}>{score}%</div>
            <h2 className="text-4xl font-black mb-4 dark:text-white uppercase tracking-tighter">نتیجه ماراتن آزمون</h2>
            
            <div className="grid grid-cols-3 gap-4 my-10">
                <div className="p-6 bg-slate-100 dark:bg-slate-900 border-[3px] border-black rounded-2xl">
                    <div className="text-3xl font-black dark:text-white">{exam.questions.length}</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase">Total</div>
                </div>
                <div className="p-6 bg-emerald-100 dark:bg-emerald-900/30 border-[3px] border-black rounded-2xl">
                    <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{correctCount}</div>
                    <div className="text-[10px] font-black text-emerald-600 uppercase">Correct</div>
                </div>
                <div className="p-6 bg-rose-100 dark:bg-rose-900/30 border-[3px] border-black rounded-2xl">
                    <div className="text-3xl font-black text-rose-700 dark:text-rose-400">{exam.questions.length - correctCount}</div>
                    <div className="text-[10px] font-black text-rose-600 uppercase">Wrong</div>
                </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setView('dashboard')} className="flex-1 py-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-[3px] border-black rounded-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">داشبورد</button>
              <button onClick={() => { setExam(null); setShowResult(false); }} className="flex-[2] py-5 bg-indigo-600 text-white border-[3px] border-black rounded-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">شروع دوباره</button>
            </div>
        </div>

        <div className="space-y-6">
            <h3 className="text-2xl font-black dark:text-white text-right pr-4 uppercase italic">تحلیل عملکرد</h3>
            {exam.questions.map((q, i) => (
                <div key={i} className={`bg-white dark:bg-slate-800 p-8 rounded-[2rem] border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-right space-y-6 ${exam.answers[i] === q.a ? 'border-emerald-500' : 'border-rose-500'}`}>
                    <p className="text-xl font-black dark:text-white leading-relaxed">{i+1}. {q.q}</p>
                    <div className="flex justify-between items-center flex-row-reverse gap-4">
                        <div className={`px-6 py-3 rounded-xl border-[2px] border-black font-black text-sm ${exam.answers[i] === q.a ? 'bg-emerald-400 text-black' : 'bg-rose-400 text-black'}`}>
                            {exam.answers[i] === q.a ? '✓ صحیح بود' : `✗ پاسخ درست: ${q.o[q.a]}`}
                        </div>
                        <button onClick={() => handleDeepStudy(q)} className="px-6 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-[2px] border-black rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all">
                             تحلیل هوشمند AI 🧠
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  if (exam?.active) {
    const q = exam.questions[exam.currentQuestion];
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between sticky top-4 z-40">
            <span className="text-sm font-black dark:text-white uppercase tracking-tighter">QUESTION {exam.currentQuestion + 1} OF {exam.questions.length}</span>
            <div className="flex items-center gap-6">
                 {config.hasTimer && <span className={`text-sm font-black ${timeLeft < 30 ? 'text-rose-600 animate-pulse' : 'text-slate-900 dark:text-white'}`}><i className="fa-solid fa-clock mr-2"></i> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>}
                 <button onClick={() => setView('dashboard')} className="text-xs font-black text-rose-600 border-b-2 border-rose-600 uppercase">انصراف</button>
            </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-10 md:p-16 rounded-[3.5rem] border-[6px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] text-right">
          <h2 className="text-2xl md:text-3xl font-black dark:text-white mb-16 leading-tight">{q.q}</h2>
          <div className="grid gap-6">
            {q.o.map((opt, idx) => (
              <button 
                key={idx} 
                onClick={() => selectAnswer(idx)} 
                className={`w-full p-6 text-right border-[4px] border-black rounded-[2rem] font-black transition-all flex items-center justify-between flex-row-reverse ${exam.answers[exam.currentQuestion] === idx ? 'bg-indigo-600 text-white shadow-none translate-x-1 translate-y-1' : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
              >
                <span className="text-base md:text-xl flex-1 mr-6">{opt}</span>
                <span className={`w-12 h-12 flex items-center justify-center border-[3px] border-black rounded-2xl text-lg font-black ${exam.answers[exam.currentQuestion] === idx ? 'bg-white text-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>{String.fromCharCode(65 + idx)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center gap-6 flex-row-reverse">
          <button 
            onClick={() => exam.currentQuestion < exam.questions.length - 1 ? setExam({ ...exam, currentQuestion: exam.currentQuestion + 1 }) : setShowResult(true)} 
            className="flex-1 py-7 bg-emerald-500 text-white border-[4px] border-black rounded-[2rem] font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-2xl active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            {exam.currentQuestion === exam.questions.length - 1 ? 'مشاهده نتایج 🏁' : 'سوال بعدی'}
          </button>
          <button 
            onClick={() => exam.currentQuestion > 0 && setExam({ ...exam, currentQuestion: exam.currentQuestion - 1 })} 
            disabled={exam.currentQuestion === 0} 
            className="px-10 py-7 bg-white dark:bg-slate-800 dark:text-white border-[4px] border-black rounded-[2rem] font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-20"
          >
            قبلی
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="bg-white dark:bg-slate-800 p-12 rounded-[3.5rem] border-[6px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] text-right">
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => setView('dashboard')} className="px-6 py-3 bg-slate-100 dark:bg-slate-900 border-[3px] border-black rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">بازگشت</button>
          <h2 className="text-4xl font-black dark:text-white uppercase tracking-tighter">آماده‌سازی آزمون</h2>
        </div>
        
        <div className="space-y-12">
            <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border-[4px] border-black shadow-inner space-y-12">
                <div>
                  <div className="flex justify-between items-center mb-6 flex-row-reverse">
                    <label className="text-sm font-black text-slate-500 uppercase italic">تعداد سوالات هوشمند</label>
                    <span className="text-3xl font-black text-indigo-600">{config.count}</span>
                  </div>
                  <input type="range" min="1" max={questions.length} value={config.count} onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) })} className="w-full h-4 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none accent-indigo-600 cursor-pointer border-2 border-black" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 pr-2 uppercase">Difficulty Level</label>
                        <select value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value })} className="w-full p-6 dark:bg-slate-800 bg-white border-[3px] border-black rounded-2xl outline-none font-black text-sm text-right focus:bg-indigo-50 transition-colors">
                            <option value="all">همه سطوح</option>
                            <option value="آسان">آسان</option>
                            <option value="متوسط">متوسط</option>
                            <option value="سخت">سخت</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 pr-2 uppercase">Exam Mode</label>
                        <label className="flex items-center justify-between gap-4 cursor-pointer p-6 bg-white dark:bg-slate-800 border-[3px] border-black rounded-2xl transition-colors hover:bg-indigo-50">
                          <div className="relative">
                            <input type="checkbox" checked={config.hasTimer} onChange={(e) => setConfig({...config, hasTimer: e.target.checked})} className="sr-only peer" />
                            <div className="w-14 h-8 bg-slate-300 dark:bg-slate-700 rounded-full border-[3px] border-black peer-checked:bg-emerald-400 after:absolute after:top-1 after:left-1 after:bg-white after:border-[2px] after:border-black after:rounded-full after:h-5 after:w-5 peer-checked:after:translate-x-6 transition-all"></div>
                          </div>
                          <span className="text-sm font-black">تایمر هوشمند</span>
                        </label>
                    </div>
                </div>
            </div>
            <button onClick={startExam} className="w-full py-8 bg-indigo-600 text-white border-[4px] border-black rounded-[2.5rem] font-black text-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase tracking-tighter">
                شروع آزمون سرنوشت‌ساز 🚀
            </button>
        </div>
      </div>
    </div>
  );
};

export default Exam;
