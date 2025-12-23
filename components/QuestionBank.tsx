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
      {/* Professional Print Header */}
      <div className="hidden print:block text-center border-b-4 border-black pb-6 mb-10">
        <div className="flex justify-between items-center mb-4 flex-row-reverse">
            <div className="text-right text-xs font-bold space-y-1 text-black">
                <p>تاریخ: {new Date().toLocaleDateString('fa-IR')}</p>
                <p>ساعت: {new Date().toLocaleTimeString('fa-IR', {hour: '2-digit', minute: '2-digit'})}</p>
            </div>
            <h1 className="text-2xl font-black text-black">دفترچه سوالات آزمون‌یار هوشمند</h1>
            <div className="w-20"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 border-2 border-black p-4 text-sm font-bold mt-4 flex-row-reverse text-black">
          <div className="text-right">نام و نام خانوادگی: .............................</div>
          <div className="text-center">موضوع: {filter === 'all' ? 'بانک جامع سوالات' : filter}</div>
          <div className="text-left">تعداد سوالات: {selectedIds.length}</div>
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
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">مدیریت و چاپ حرفه‌ای سوالات</p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 flex-row-reverse no-scrollbar">
            <button 
              onClick={selectAll} 
              className="px-4 py-2.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black whitespace-nowrap shadow-sm active:scale-95 transition-all flex items-center justify-center min-h-[44px] appearance-none"
            >
                {filteredQuestions.every(q => selectedIds.includes(questions.indexOf(q))) ? 'لغو انتخاب' : 'انتخاب همه'}
            </button>
            <div className="relative min-w-[150px]">
              <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full h-[44px] px-4 pr-10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-black shadow-sm appearance-none text-right cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                  <option value="all" className="bg-white dark:bg-slate-800">همه دسته‌ها</option>
                  {categories.map(c => <option key={c} value={c} className="bg-white dark:bg-slate-800">{c}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none"></i>
            </div>
        </div>
      </div>

      {/* Action Bar for Selected Items */}
      {selectedIds.length > 0 && (
          <div className="action-bar bg-indigo-600 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row-reverse justify-between items-center text-white animate-slide-up print:hidden gap-4 sticky top-20 z-30 border border-indigo-500">
              <span className="text-sm font-black">{selectedIds.length} سوال انتخاب شده</span>
              <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handlePrint} 
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all appearance-none ${isPremium ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-900/20'}`}
                  >
                    <i className={`fa-solid ${isPremium ? 'fa-print' : 'fa-lock'}`}></i>
                    {isPremium ? 'چاپ حرفه‌ای' : 'چاپ (طلایی)'}
                  </button>
                  <button onClick={deleteSelected} className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-500 hover:bg-rose-600 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg appearance-none">
                    <i className="fa-solid fa-trash"></i> حذف
                  </button>
              </div>
          </div>
      )}

      <div className="grid gap-4 print:block pb-10">
          {filteredQuestions.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 font-bold">هیچ سوالی در این بخش یافت نشد.</p>
            </div>
          ) : filteredQuestions.map((q, idx) => {
              const globalIdx = questions.indexOf(q);
              const isSelected = selectedIds.includes(globalIdx);
              
              return (
                  <div 
                    key={idx} 
                    className={`question-card bg-white dark:bg-slate-800 p-6 rounded-3xl border transition-all print:border-none print:shadow-none print:p-0 print:mb-12 ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-700 shadow-sm'} print:block`}
                  >
                      <div className="flex gap-4 flex-row-reverse">
                          <div className="print:hidden mt-1">
                            <label className="relative flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => toggleSelect(globalIdx)}
                                className="sr-only peer"
                              />
                              <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg peer-checked:bg-indigo-600 peer-checked:border-indigo-600 flex items-center justify-center transition-all">
                                <i className="fa-solid fa-check text-white text-[10px] opacity-0 peer-checked:opacity-100"></i>
                              </div>
                            </label>
                          </div>
                          <div className="flex-1 text-right">
                              <div className="flex justify-between items-start mb-4 flex-row-reverse">
                                  <div className="flex gap-2 print:hidden">
                                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-black rounded-lg">{q.c}</span>
                                      <span className="px-3 py-1 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-lg">{q.difficulty}</span>
                                  </div>
                                  <button onClick={() => convertToFlashcard(q)} className="p-2 text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg print:hidden transition-colors appearance-none" title="تبدیل به فلش‌کارت">
                                      <i className="fa-solid fa-layer-group"></i>
                                  </button>
                              </div>
                              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6 leading-relaxed">
                                {idx + 1}. {q.q}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-x-12 print:gap-y-4">
                                  {q.o.map((opt, oi) => (
                                      <div key={oi} className={`p-4 rounded-2xl border text-sm flex items-center gap-3 flex-row-reverse ${oi === q.a ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 print:border-none print:bg-transparent print:text-black font-bold' : 'border-slate-50 dark:border-slate-700 text-slate-500 dark:text-slate-400 print:border-none print:text-black'}`}>
                                          <span className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-black rounded-lg print:border-black print:text-black">{oi + 1}</span>
                                          <span className="flex-1">{opt}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              );
          })}
      </div>

      <div className="hidden print:block break-before-page mt-20 p-10 border-t-4 border-double border-black">
        <h3 className="text-xl font-black mb-10 text-center text-black">پاسخ‌نامه آزمون</h3>
        <div className="grid grid-cols-5 gap-4">
            {filteredQuestions.map((q, i) => {
                const globalIdx = questions.indexOf(q);
                if (selectedIds.length > 0 && !selectedIds.includes(globalIdx)) return null;
                return (
                    <div key={i} className="text-xs border border-black p-2 flex justify-between flex-row-reverse font-bold text-black">
                        <span>{i + 1}:</span>
                        <span>گزینه {q.a + 1}</span>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
