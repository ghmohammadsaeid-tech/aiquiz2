import React, { useState, useEffect } from 'react';
import { Question, View, ExamState, Language } from '../types';

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
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-triangle-exclamation text-4xl text-amber-500"></i>
              </div>
              <h2 className="text-2xl font-black mb-4 dark:text-white">بانک سوالات شما خالی است</h2>
              <button onClick={() => setView('ai')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">برو به طراح هوشمند</button>
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border-4 border-slate-100 dark:border-slate-700 text-center animate-slide-up">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl font-black mb-8 border-[10px] ${score >= 50 ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600'}`}>
            {score}%
            </div>
            <h2 className="text-3xl font-black mb-2 dark:text-white">نتیجه آزمون</h2>
            <div className="grid grid-cols-3 gap-4 my-10">
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-800 dark:text-white font-black">{exam.questions.length}<br/><span className="text-[10px] opacity-50">کل</span></div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 font-black">{correctCount}<br/><span className="text-[10px] opacity-50">صحیح</span></div>
                <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-2xl text-rose-600 font-black">{exam.questions.length - correctCount}<br/><span className="text-[10px] opacity-50">غلط</span></div>
            </div>
            <button onClick={() => { setExam(null); setShowResult(false); }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg">بازگشت و آزمون مجدد</button>
        </div>
      </div>
    );
  }

  if (exam?.active) {
    const q = exam.questions[exam.currentQuestion];
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border-2 dark:border-slate-700 shadow-lg flex items-center justify-between sticky top-4 z-40">
            <span className="text-sm font-black dark:text-white">سوال {exam.currentQuestion + 1} از {exam.questions.length}</span>
            <button onClick={() => setView('dashboard')} className="text-xs font-black text-rose-500">انصراف</button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[3rem] border-4 border-slate-100 dark:border-slate-700 shadow-2xl text-right">
          <h2 className="text-xl md:text-2xl font-black dark:text-white mb-10 leading-relaxed">{q.q}</h2>
          <div className="grid gap-4">
            {q.o.map((opt, idx) => {
              const isSelected = exam.answers[exam.currentQuestion] === idx;
              return (
                <button 
                  key={idx} 
                  onClick={() => selectAnswer(idx)} 
                  className={`w-full p-5 md:p-6 text-right border-[4px] rounded-3xl font-black transition-all flex items-center justify-between flex-row-reverse group ${
                    isSelected 
                      ? 'bg-slate-950 text-white border-amber-400 shadow-2xl scale-[1.03]' 
                      : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span className="text-sm md:text-lg flex-1 mr-4">{opt}</span>
                  <span className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-[3px] rounded-2xl text-sm font-black transition-colors ${
                    isSelected ? 'bg-amber-400 text-slate-950 border-white' : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 flex-row-reverse">
          <button 
            onClick={() => exam.currentQuestion < exam.questions.length - 1 ? setExam({ ...exam, currentQuestion: exam.currentQuestion + 1 }) : setShowResult(true)} 
            className="flex-1 py-6 bg-emerald-600 text-white rounded-3xl font-black shadow-xl text-xl"
          >
            {exam.currentQuestion === exam.questions.length - 1 ? 'پایان و مشاهده نتیجه' : 'سوال بعدی'}
          </button>
          <button 
            onClick={() => exam.currentQuestion > 0 && setExam({ ...exam, currentQuestion: exam.currentQuestion - 1 })} 
            disabled={exam.currentQuestion === 0} 
            className="px-8 py-6 bg-white dark:bg-slate-800 dark:text-white border-4 border-slate-200 dark:border-slate-700 rounded-3xl font-black disabled:opacity-20"
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
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4 flex-row-reverse">
                    <label className="text-xs font-black text-slate-500 uppercase">تعداد سوالات</label>
                    <span className="text-indigo-600 font-black text-lg">{config.count} سوال</span>
                  </div>
                  <input type="range" min="1" max={questions.length} value={config.count} onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) })} className="w-full h-3 bg-indigo-100 rounded-lg appearance-none accent-indigo-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value })} className="w-full p-5 dark:bg-slate-800 bg-white border-2 border-slate-200 rounded-2xl outline-none font-black text-sm text-right">
                        <option value="all">همه سطوح</option>
                        <option value="آسان">آسان</option>
                        <option value="متوسط">متوسط</option>
                        <option value="سخت">سخت</option>
                    </select>
                    <label className="flex items-center justify-between gap-3 cursor-pointer p-5 bg-white dark:bg-slate-800 border-2 border-slate-200 rounded-2xl">
                      <div className="relative">
                        <input type="checkbox" checked={config.hasTimer} onChange={(e) => setConfig({...config, hasTimer: e.target.checked})} className="sr-only peer" />
                        <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-indigo-600 after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 peer-checked:after:translate-x-6 transition-all"></div>
                      </div>
                      <span className="text-xs font-black">تایمر هوشمند</span>
                    </label>
                </div>
            </div>
            <button onClick={startExam} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all">شروع ماراتن آزمون</button>
        </div>
      </div>
    </div>
  );
};

export default Exam;