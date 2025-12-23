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
              <div className="flex justify-center gap-4">
                <button onClick={() => setView('ai')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">برو به طراح هوشمند</button>
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
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border-4 border-slate-100 dark:border-slate-700 text-center animate-slide-up">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl font-black mb-8 border-[10px] ${score >= 50 ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-rose-500 text-rose-600 bg-rose-50'}`}>
            {score}%
            </div>
            <h2 className="text-3xl font-black mb-2 dark:text-white">نتیجه آزمون</h2>
            <div className="grid grid-cols-3 gap-4 my-10">
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                    <div className="text-xl font-black dark:text-white">{exam.questions.length}</div>
                    <div className="text-[9px] font-black text-slate-500 uppercase">کل</div>
                </div>
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-700 dark:text-emerald-400">
                    <div className="text-xl font-black">{correctCount}</div>
                    <div className="text-[9px] font-black uppercase">صحیح</div>
                </div>
                <div className="p-4 bg-rose-100 dark:bg-rose-900/30 rounded-2xl text-rose-700 dark:text-rose-400">
                    <div className="text-xl font-black">{exam.questions.length - correctCount}</div>
                    <div className="text-[9px] font-black uppercase">غلط</div>
                </div>
            </div>
            <button onClick={() => { setExam(null); setShowResult(false); }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl">بازگشت و آزمون مجدد</button>
        </div>
      </div>
    );
  }

  if (exam?.active) {
    const q = exam.questions[exam.currentQuestion];
    const progress = ((exam.currentQuestion + 1) / exam.questions.length) * 100;
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-between sticky top-4 z-40 backdrop-blur-md">
            <span className="text-sm font-black dark:text-white">سوال {exam.currentQuestion + 1} از {exam.questions.length}</span>
            {config.hasTimer && <div className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black flex items-center gap-2 flex-row-reverse text-xs"><i className="fa-solid fa-clock text-amber-400"></i>{formatTime(timeLeft)}</div>}
            <button onClick={() => setView('dashboard')} className="text-[10px] font-black text-rose-500 uppercase">انصراف</button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[3rem] border-4 border-slate-100 dark:border-slate-700 shadow-2xl text-right">
          <h2 className="text-xl md:text-2xl font-black dark:text-white mb-10 leading-relaxed">{q.q}</h2>
          <div className="grid gap-4">
            {q.o.map((opt, idx) => (
              <button 
                key={idx} 
                onClick={() => selectAnswer(idx)} 
                className={`w-full p-5 md:p-6 text-right border-[3px] rounded-2xl font-black transition-all flex items-center justify-between flex-row-reverse ${
                  exam.answers[exam.currentQuestion] === idx 
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl scale-[1.02]' 
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-indigo-300'
                }`}
              >
                <span className="text-sm md:text-base">{opt}</span>
                <span className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border-2 rounded-xl text-xs ${exam.answers[exam.currentQuestion] === idx ? 'bg-white text-indigo-600 border-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-400'}`}>{idx + 1}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 flex-row-reverse">
          <button 
            onClick={() => exam.currentQuestion < exam.questions.length - 1 ? setExam({ ...exam, currentQuestion: exam.currentQuestion + 1 }) : setShowResult(true)} 
            className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl text-lg active:scale-95 transition-all"
          >
            {exam.currentQuestion === exam.questions.length - 1 ? 'مشاهده نتیجه نهایی' : 'سوال بعدی'}
          </button>
          <button 
            onClick={() => exam.currentQuestion > 0 && setExam({ ...exam, currentQuestion: exam.currentQuestion - 1 })} 
            disabled={exam.currentQuestion === 0} 
            className="px-8 py-5 bg-white dark:bg-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black disabled:opacity-20"
          >قبلی</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-xl border-4 border-indigo-100 dark:border-slate-700 text-right">
        <h2 className="text-3xl font-black mb-10 text-center dark:text-white">تنظیمات آزمون ⏱️</h2>
        <div className="space-y-8">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl space-y-6">
                <div>
                  <label className="text-xs font-black text-slate-500 block mb-4">تعداد سوالات: <span className="text-indigo-600">{config.count}</span></label>
                  <input type="range" min="1" max={questions.length} value={config.count} onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) })} className="w-full h-3 bg-indigo-100 dark:bg-slate-800 rounded-lg appearance-none accent-indigo-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value })} className="w-full p-4 dark:bg-slate-800 bg-white border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-black text-sm text-right">
                        <option value="all">همه سطوح</option>
                        <option value="آسان">آسان</option>
                        <option value="متوسط">متوسط</option>
                        <option value="سخت">سخت</option>
                    </select>
                    <label className="flex items-center justify-between gap-3 cursor-pointer p-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
                      <input type="checkbox" checked={config.hasTimer} onChange={(e) => setConfig({...config, hasTimer: e.target.checked})} className="w-6 h-6 rounded-lg text-indigo-600" />
                      <span className="text-xs font-black">تایمر هوشمند</span>
                    </label>
                </div>
            </div>
            <button onClick={startExam} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-2xl active:scale-95 transition-all">شروع ماراتن آزمون</button>
        </div>
      </div>
    </div>
  );
};

export default Exam;