import React, { useState, useEffect } from 'react';
import { Question, View, ExamState, Language } from '../types';
import { AD_CONFIG } from '../constants';

interface Props {
  questions: Question[];
  setView: (v: View) => void;
  lang: Language;
  t: (k: string) => string;
  isPremium: boolean;
}

const Exam: React.FC<Props> = ({ questions, setView, t, isPremium }) => {
  const [exam, setExam] = useState<ExamState | null>(null);
  const [config, setConfig] = useState({
    count: Math.min(20, questions.length),
    difficulty: 'all',
    randomize: true,
    showAnswers: true,
    hasTimer: true
  });
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer: any;
    if (exam?.active && config.hasTimer && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && exam?.active && config.hasTimer) {
      setShowResult(true);
    }
    return () => clearInterval(timer);
  }, [exam?.active, timeLeft, config.hasTimer]);

  if (questions.length === 0) {
      return (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] shadow-sm">
              <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-triangle-exclamation text-4xl text-amber-500"></i>
              </div>
              <h2 className="text-2xl font-black mb-4 dark:text-white">بانک سوالات شما خالی است</h2>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">قبل از شروع آزمون، باید تعدادی سوال به بانک خود اضافه کنید.</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setView('ai')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95">برو به طراح هوشمند</button>
                <button onClick={() => setView('dashboard')} className="px-8 py-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl font-black">بازگشت</button>
              </div>
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (showResult && exam) {
    const correctCount = exam.answers.reduce((acc, ans, idx) => ans === exam.questions[idx].a ? acc + 1 : acc, 0);
    const score = Math.round((correctCount / exam.questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border dark:border-slate-700 text-center animate-slide-up print:p-0 print:border-none print:shadow-none">
            <div className="hidden print:block mb-10 border-b-2 border-slate-200 pb-4">
                <h1 className="text-xl font-black">کارنامه آزمون شبیه‌ساز - آزمون‌یار</h1>
                <p className="text-xs mt-2">تاریخ: {new Date().toLocaleDateString('fa-IR')}</p>
            </div>

            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl font-black mb-8 border-8 transition-colors print:border-black ${score >= 50 ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-rose-500 text-rose-600 bg-rose-50'}`}>
            {score}%
            </div>
            <h2 className="text-3xl font-black mb-2 dark:text-white">نتیجه نهایی آزمون</h2>
            <p className="text-slate-500 font-medium mb-10">عملکرد شما با موفقیت در سیستم ثبت شد.</p>

            <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] print:border print:bg-white">
                    <div className="text-2xl font-black dark:text-white">{exam.questions.length}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">کل سوالات</div>
                </div>
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] text-emerald-600 print:border print:bg-white">
                    <div className="text-2xl font-black">{correctCount}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest mt-2">صحیح</div>
                </div>
                <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-[2rem] text-rose-600 print:border print:bg-white">
                    <div className="text-2xl font-black">{exam.questions.length - correctCount}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest mt-2">نادرست</div>
                </div>
            </div>

            {/* Central Advertisement Slot - EXAM RESULT */}
            {AD_CONFIG.enabled && AD_CONFIG.examResult.show && !isPremium && (
              <div className="mb-10 p-6 bg-indigo-50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-3xl text-right flex flex-col md:flex-row-reverse items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-2 flex-row-reverse">
                    <i className={`fa-solid ${AD_CONFIG.examResult.icon}`}></i>
                    {AD_CONFIG.examResult.title}
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-500 mt-1 font-bold">{AD_CONFIG.examResult.description}</p>
                </div>
                <a 
                  href={AD_CONFIG.examResult.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg"
                >
                  {AD_CONFIG.examResult.buttonText}
                </a>
              </div>
            )}

            <div className="flex flex-col gap-4 print:hidden">
                <button onClick={() => window.print()} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 flex items-center justify-center gap-3">
                    <i className="fa-solid fa-print"></i> چاپ کارنامه آزمون
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => setView('dashboard')} className="py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">داشبورد</button>
                    <button onClick={() => { setExam(null); setShowResult(false); }} className="py-4 dark:bg-slate-700 bg-slate-100 dark:text-white text-slate-600 rounded-2xl font-black transition-all">آزمون جدید</button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (exam?.active) {
    const q = exam.questions[exam.currentQuestion];
    const progress = ((exam.currentQuestion + 1) / exam.questions.length) * 100;
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-[2rem] border dark:border-slate-700 shadow-sm flex items-center justify-between sticky top-20 z-40 backdrop-blur-md">
            <div className="flex items-center gap-4 flex-row-reverse">
                <span className="text-sm font-black dark:text-white">سوال {exam.currentQuestion + 1} از {exam.questions.length}</span>
                <div className="w-32 hidden md:block h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            {config.hasTimer && <div className={`px-4 py-2 rounded-xl font-black flex items-center gap-3 flex-row-reverse ${timeLeft < 60 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-50 dark:bg-slate-900 dark:text-white text-slate-600'}`}><i className="fa-solid fa-clock"></i>{formatTime(timeLeft)}</div>}
            <button onClick={() => { if(window.confirm('آیا قصد اتمام آزمون را دارید؟')) setShowResult(true); }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest">End Exam</button>
        </div>
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border dark:border-slate-700 shadow-xl min-h-[400px] flex flex-col justify-center text-right">
          <h2 className="text-2xl font-black dark:text-white mb-12 leading-relaxed">{q.q}</h2>
          <div className="grid gap-4">
            {q.o.map((opt, idx) => (
              <button key={idx} onClick={() => selectAnswer(idx)} className={`w-full p-6 text-right border-2 rounded-[1.5rem] font-bold transition-all flex items-center justify-between flex-row-reverse appearance-none ${exam.answers[exam.currentQuestion] === idx ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-xl' : 'dark:border-slate-700 border-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                <span>{opt}</span>
                <span className={`w-10 h-10 flex items-center justify-center border-2 rounded-xl text-xs ${exam.answers[exam.currentQuestion] === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300'}`}>{idx + 1}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center gap-4 flex-row-reverse">
          <button onClick={() => exam.currentQuestion < exam.questions.length - 1 ? setExam({ ...exam, currentQuestion: exam.currentQuestion + 1 }) : setShowResult(true)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl appearance-none">
            {exam.currentQuestion === exam.questions.length - 1 ? 'مشاهده نتیجه' : 'سوال بعدی'}
          </button>
          <button onClick={() => exam.currentQuestion > 0 && setExam({ ...exam, currentQuestion: exam.currentQuestion - 1 })} disabled={exam.currentQuestion === 0} className="px-8 py-4 bg-white dark:bg-slate-800 dark:text-white border dark:border-slate-700 rounded-2xl font-black disabled:opacity-30 appearance-none">قبلی</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center flex-row-reverse mb-4">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all appearance-none"
          >
            <i className="fa-solid fa-arrow-right"></i>
            بازگشت به داشبورد
          </button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-xl border dark:border-slate-700 relative overflow-hidden text-right">
        <h2 className="text-3xl font-black mb-10 text-center dark:text-white">شبیه‌ساز آزمون ⏱️</h2>
        <div className="space-y-8">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl space-y-6">
                <div><label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">تعداد سوالات: {config.count}</label><input type="range" min="1" max={questions.length} value={config.count} onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) })} className="w-full h-2 bg-indigo-100 dark:bg-slate-800 rounded-lg appearance-none accent-indigo-600" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value })} className="w-full p-4 dark:bg-slate-800 bg-white border dark:border-slate-700 rounded-2xl outline-none font-bold text-sm text-right appearance-none"><option value="all">همه سطوح</option><option value="آسان">آسان</option><option value="متوسط">متوسط</option><option value="سخت">سخت</option></select>
                    <label className="flex items-center justify-between gap-3 cursor-pointer p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl"><input type="checkbox" checked={config.hasTimer} onChange={(e) => setConfig({...config, hasTimer: e.target.checked})} className="w-5 h-5 rounded-lg border-2 border-slate-200 text-indigo-600" /><span className="text-xs font-black">فعال‌سازی تایمر</span></label>
                </div>
            </div>
            <button onClick={startExam} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-2xl hover:bg-indigo-700 transition-all appearance-none">شروع آزمون نهایی</button>
        </div>
      </div>
    </div>
  );
};

export default Exam;