
import React, { useState, useMemo } from 'react';
import { Question, Flashcard, Language, View } from '../types';

interface Props {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  lang: Language;
  t: (k: string) => string;
  isPremium: boolean;
  setView: (v: View) => void;
}

const QuestionBank: React.FC<Props> = ({ questions, setQuestions, setFlashcards, t, isPremium, setView }) => {
  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [randomCount, setRandomCount] = useState(10);

  const categories = useMemo(() => Array.from(new Set(questions.map(q => q.c))), [questions]);

  const filteredQuestions = useMemo(() => {
    return filter === 'all' ? questions : questions.filter(q => q.c === filter);
  }, [questions, filter]);

  const toggleSelect = (globalIdx: number) => {
    setSelectedIds(prev => 
      prev.includes(globalIdx) ? prev.filter(id => id !== globalIdx) : [...prev, globalIdx]
    );
  };

  const selectAll = () => {
    const currentFilteredIds = filteredQuestions.map(q => questions.indexOf(q));
    const allSelected = currentFilteredIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !currentFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  const selectRandom = () => {
    const currentFilteredIndices = filteredQuestions.map(q => questions.indexOf(q));
    const shuffled = [...currentFilteredIndices].sort(() => 0.5 - Math.random());
    setSelectedIds(shuffled.slice(0, Math.min(randomCount, shuffled.length)));
  };

  const handlePrint = () => {
    if (!isPremium) {
        if (window.confirm('قابلیت "چاپ حرفه‌ای آزمون" مخصوص کاربران طلایی است. آیا مایل به ارتقای حساب خود هستید؟')) {
            setView('settings');
        }
        return;
    }
    
    if (selectedIds.length === 0) {
        alert('لطفاً حداقل یک سوال را برای چاپ انتخاب کنید.');
        return;
    }
    window.print();
  };

  const deleteSelected = () => {
    if (window.confirm(`آیا از حذف ${selectedIds.length} سوال انتخابی مطمئن هستید؟`)) {
      const newList = questions.filter((_, i) => !selectedIds.includes(i));
      setQuestions(newList);
      setSelectedIds([]);
    }
  };

  const convertToFlashcard = (q: Question) => {
    const newCard: Flashcard = {
      id: Date.now(),
      front: q.q,
      back: q.o[q.a],
      example: `گزینه‌ها: ${q.o.join(' | ')}`,
      category: q.c,
      difficulty: q.difficulty,
      createdAt: Date.now(),
      dueDate: new Date().toISOString().split('T')[0],
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      type: 'standard',
      tags: [],
      errorCount: 0
    };
    setFlashcards(prev => [...prev, newCard]);
    alert('سوال به لیست یادگیری هوشمند اضافه شد.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Professional Exam Print Header (Visible only when printing) */}
      <div className="hidden print:block text-black">
        <div className="border-[3px] border-black p-6 mb-8 relative">
            <div className="flex justify-between items-start flex-row-reverse mb-6">
                <div className="text-right space-y-1">
                    <p className="font-black text-sm">تاریخ آزمون: ...................</p>
                    <p className="font-black text-sm">ساعت شروع: ...................</p>
                    <p className="font-black text-sm">مدت آزمون: ...................</p>
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-black border-b-2 border-black pb-1 mb-2">برگه رسمی سوالات آزمون</h1>
                    <p className="text-sm font-bold">موضوع: {filter === 'all' ? 'آزمون جامع' : filter}</p>
                </div>
                <div className="text-left">
                    <div className="w-20 h-20 border-2 border-dashed border-black flex items-center justify-center text-[10px] text-slate-400">محل مهر آموزشگاه</div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 border-t-2 border-black pt-4 mb-2">
                <div className="text-right font-bold text-sm">نام و نام خانوادگی دانشجو: ...........................................</div>
                <div className="text-right font-bold text-sm">شماره دانشجویی: ...........................................</div>
            </div>
            <div className="text-right font-bold text-sm border-b-2 border-black pb-4 mb-4">نام استاد: ...........................................</div>
            
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 font-black text-xs border-2 border-black">تعداد سوالات: {selectedIds.length}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="text-right flex flex-col gap-2">
          <button 
            onClick={() => setView('dashboard')}
            className="w-fit flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-200 rounded-lg text-[10px] font-black shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex-row-reverse border border-slate-100 dark:border-slate-700 appearance-none"
          >
            <i className="fa-solid fa-arrow-right"></i>
            بازگشت
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">بانک سوالات 📚</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">مدیریت و تولید آزمون کلاسی</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end flex-row-reverse">
            <div className="flex items-center bg-white dark:bg-slate-800 border-2 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <input 
                    type="number" 
                    value={randomCount} 
                    onChange={(e) => setRandomCount(Number(e.target.value))}
                    className="w-12 text-center font-black text-xs bg-transparent outline-none dark:text-white"
                />
                <button 
                    onClick={selectRandom}
                    className="px-3 py-2 bg-indigo-600 text-white font-black text-[10px] border-r-2 border-black active:bg-indigo-700 transition-colors"
                >
                    انتخاب تصادفی
                </button>
            </div>

            <button 
              onClick={selectAll} 
              className="px-4 py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-black rounded-xl text-[10px] font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
                {filteredQuestions.every(q => selectedIds.includes(questions.indexOf(q))) ? 'لغو همه' : 'انتخاب همه'}
            </button>

            <div className="relative">
              <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-[38px] px-4 pr-10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-black rounded-xl outline-none text-[10px] font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] appearance-none text-right cursor-pointer"
              >
                  <option value="all">همه دسته‌ها</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <i className="fa-solid fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none"></i>
            </div>
        </div>
      </div>

      {/* Action Bar for Selected Items */}
      {selectedIds.length > 0 && (
          <div className="action-bar bg-slate-900 border-[3px] border-black p-4 rounded-2xl shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] flex flex-col sm:flex-row-reverse justify-between items-center text-white animate-slide-up print:hidden gap-4 sticky top-20 z-30">
              <div className="flex items-center gap-3 flex-row-reverse">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">
                    <span className="text-xs font-black">{selectedIds.length}</span>
                </div>
                <span className="text-sm font-black italic">سوال آماده چاپ آزمون</span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handlePrint} 
                    className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${isPremium ? 'bg-emerald-500 text-black' : 'bg-amber-400 text-black'}`}
                  >
                    <i className={`fa-solid ${isPremium ? 'fa-print' : 'fa-lock'}`}></i>
                    {isPremium ? 'تولید برگه آزمون (Print)' : 'ارتقا برای چاپ'}
                  </button>
                  <button onClick={deleteSelected} className="px-4 py-3 bg-rose-500 text-white rounded-xl text-xs font-black border-2 border-black hover:bg-rose-600 transition-colors">
                    <i className="fa-solid fa-trash"></i>
                  </button>
              </div>
          </div>
      )}

      <div className="grid gap-6 print:block pb-10">
          {filteredQuestions.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border-[3px] border-black border-dashed">
                <i className="fa-solid fa-folder-open text-4xl text-slate-300 mb-4"></i>
                <p className="text-slate-400 font-black">بانک سوالات خالی است یا فیلتر شده است.</p>
            </div>
          ) : filteredQuestions.map((q, idx) => {
              const globalIdx = questions.indexOf(q);
              const isSelected = selectedIds.includes(globalIdx);
              
              if (selectedIds.length > 0 && !isSelected && window.matchMedia('print').matches) return null;

              return (
                  <div 
                    key={idx} 
                    className={`question-card bg-white dark:bg-slate-800 p-8 rounded-[2rem] border-[3px] transition-all print:border-none print:shadow-none print:p-0 print:mb-10 ${isSelected ? 'border-indigo-600 shadow-[6px_6px_0px_0px_rgba(79,70,229,1)]' : 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]'} print:block break-inside-avoid`}
                  >
                      <div className="flex gap-6 flex-row-reverse">
                          <div className="print:hidden mt-1">
                            <button 
                                onClick={() => toggleSelect(globalIdx)}
                                className={`w-8 h-8 rounded-xl border-[3px] border-black flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                            >
                                {isSelected && <i className="fa-solid fa-check text-xs"></i>}
                            </button>
                          </div>
                          <div className="flex-1 text-right">
                              <div className="flex justify-between items-start mb-4 flex-row-reverse">
                                  <div className="flex gap-2 print:hidden">
                                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-black rounded-lg border border-indigo-200">{q.c}</span>
                                      <span className="px-3 py-1 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-lg border border-slate-200">{q.difficulty}</span>
                                  </div>
                                  <button onClick={() => convertToFlashcard(q)} className="w-10 h-10 flex items-center justify-center text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl print:hidden transition-colors border-2 border-transparent hover:border-indigo-100" title="افزودن به یادگیری">
                                      <i className="fa-solid fa-brain"></i>
                                  </button>
                              </div>
                              <h4 className="text-xl font-black text-slate-800 dark:text-white mb-8 leading-relaxed">
                                {idx + 1}. {q.q}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-x-12 print:gap-y-4">
                                  {q.o.map((opt, oi) => (
                                      <div key={oi} className={`p-5 rounded-2xl border-[2px] text-sm font-bold flex items-center gap-4 flex-row-reverse transition-colors ${oi === q.a && !window.matchMedia('print').matches ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-black dark:border-slate-700'}`}>
                                          <span className="w-8 h-8 flex items-center justify-center bg-black text-white text-[11px] font-black rounded-xl border-2 border-black">{String.fromCharCode(65 + oi)}</span>
                                          <span className="flex-1 dark:text-slate-200 print:text-black">{opt}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              );
          })}
      </div>

      <div className="hidden print:block break-before-page mt-20">
        <div className="border-[4px] border-black p-10 rounded-[2rem]">
            <h3 className="text-2xl font-black mb-10 text-center text-black border-b-4 border-black pb-4 italic">پاسخ‌نامه اختصاصی استاد (Answer Key)</h3>
            <div className="grid grid-cols-4 gap-6">
                {filteredQuestions.map((q, i) => {
                    const globalIdx = questions.indexOf(q);
                    if (selectedIds.length > 0 && !selectedIds.includes(globalIdx)) return null;
                    return (
                        <div key={i} className="text-sm border-2 border-black p-4 flex justify-between flex-row-reverse font-black text-black rounded-xl bg-slate-50">
                            <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center ml-2">{i + 1}</span>
                            <span>گزینه {q.a + 1} ({String.fromCharCode(65 + q.a)})</span>
                        </div>
                    )
                })}
            </div>
            <div className="mt-20 flex justify-between items-end flex-row-reverse">
                <div className="text-center">
                    <p className="font-black text-sm mb-12">امضا و تایید استاد</p>
                    <div className="w-48 border-b-2 border-black"></div>
                </div>
                <div className="text-xs font-bold italic text-slate-400">تولید شده توسط سیستم آزمون‌یار هوشمند</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
