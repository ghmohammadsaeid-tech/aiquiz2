
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

  // لیستی از سوالاتی که باید چاپ شوند (با حفظ ترتیب انتخاب یا فیلتر)
  const questionsToPrint = useMemo(() => {
    if (selectedIds.length === 0) return filteredQuestions;
    // برگرداندن سوالات بر اساس ایدی‌های انتخاب شده
    return questions.filter((_, idx) => selectedIds.includes(idx));
  }, [questions, selectedIds, filteredQuestions]);

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
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm 12mm; }
          body { background: white !important; font-size: 10pt !important; color: black !important; }
          .no-print { display: none !important; }
          .question-card { 
            border: none !important; 
            box-shadow: none !important; 
            margin-bottom: 12pt !important; 
            padding: 0 !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .option-box { 
            padding: 2.5pt 6pt !important; 
            border: 1px solid #000 !important; 
            font-size: 9pt !important;
            background: none !important;
            margin-top: 1.5pt !important;
          }
          .exam-header {
            border: 2px solid #000 !important;
            padding: 6pt !important;
            margin-bottom: 12pt !important;
            border-radius: 2px;
          }
          .q-text { font-size: 10.5pt !important; font-weight: bold !important; margin-bottom: 4pt !important; line-height: 1.3; }
          .answer-key-section { break-before: page; margin-top: 20pt; }
          .print-label { font-weight: 900; }
        }
      `}</style>

      {/* Professional Exam Print Header */}
      <div className="hidden print:block text-black">
        <div className="exam-header relative text-right">
            <div className="flex justify-between items-start flex-row-reverse mb-2">
                <div className="space-y-0.5 text-[8pt]">
                    <p><span className="print-label">تاریخ آزمون:</span> ...................</p>
                    <p><span className="print-label">مدت زمان:</span> ...................</p>
                </div>
                <div className="text-center">
                    <h1 className="text-[10pt] font-black mb-0.5">باسمه تعالی</h1>
                    <h2 className="text-[12pt] font-black italic">برگه رسمی سوالات آزمون</h2>
                </div>
                <div className="text-left text-[8pt] min-w-[60px]">
                    <p>نمره: .........</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-black pt-1.5 mb-1.5">
                <div className="text-[9pt]"><span className="print-label">نام و نام خانوادگی:</span> ...........................................</div>
                <div className="text-[9pt]"><span className="print-label">موضوع/درس:</span> {filter === 'all' ? 'آزمون جامع' : filter}</div>
            </div>
            <div className="text-[9pt] border-b border-black pb-1.5">
                <span className="print-label">نام استاد:</span> ...........................................
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="text-right flex flex-col gap-2">
          <button 
            onClick={() => setView('dashboard')}
            className="w-fit flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-200 rounded-lg text-[10px] font-black shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex-row-reverse border border-slate-100 dark:border-slate-700"
          >
            <i className="fa-solid fa-arrow-right"></i>
            بازگشت
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">بانک سوالات 📚</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">مدیریت و تولید آزمون (شماره‌گذاری هوشمند)</p>
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
              className="px-4 py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-black rounded-xl text-[10px] font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
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
                <span className="text-sm font-black italic">سوال در لیست چاپ (ترتیب متوالی)</span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handlePrint} 
                    className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:translate-x-0.5 active:translate-y-0.5 transition-all ${isPremium ? 'bg-emerald-500 text-black' : 'bg-amber-400 text-black'}`}
                  >
                    <i className={`fa-solid ${isPremium ? 'fa-print' : 'fa-lock'}`}></i>
                    {isPremium ? 'تولید برگه آزمون (A4)' : 'ارتقا برای چاپ'}
                  </button>
                  <button onClick={deleteSelected} className="px-4 py-3 bg-rose-500 text-white rounded-xl text-xs font-black border-2 border-black hover:bg-rose-600 transition-colors">
                    <i className="fa-solid fa-trash"></i>
                  </button>
              </div>
          </div>
      )}

      {/* لیست اصلی نمایش سوالات */}
      <div className="grid gap-6 print:block pb-10">
          {(selectedIds.length > 0 ? questionsToPrint : filteredQuestions).length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border-[3px] border-black border-dashed no-print">
                <i className="fa-solid fa-folder-open text-4xl text-slate-300 mb-4"></i>
                <p className="text-slate-400 font-black">بانک سوالات خالی است یا موردی انتخاب نشده است.</p>
            </div>
          ) : (selectedIds.length > 0 ? questionsToPrint : filteredQuestions).map((q, idx) => {
              const globalIdx = questions.indexOf(q);
              const isSelected = selectedIds.includes(globalIdx);

              return (
                  <div 
                    key={idx} 
                    className={`question-card bg-white dark:bg-slate-800 p-8 rounded-[2rem] border-[3px] transition-all ${isSelected ? 'border-indigo-600 shadow-[6px_6px_0px_0px_rgba(79,70,229,1)]' : 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]'} print:text-black`}
                  >
                      <div className="flex gap-4 flex-row-reverse">
                          <div className="print:hidden mt-1">
                            <button 
                                onClick={() => toggleSelect(globalIdx)}
                                className={`w-8 h-8 rounded-xl border-[3px] border-black flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                            >
                                {isSelected && <i className="fa-solid fa-check text-xs"></i>}
                            </button>
                          </div>
                          <div className="flex-1 text-right">
                              <div className="flex justify-between items-start mb-2 flex-row-reverse print:hidden">
                                  <div className="flex gap-2">
                                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[8px] font-black rounded-lg border border-indigo-200">{q.c}</span>
                                      <span className="px-3 py-1 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[8px] font-black rounded-lg border border-slate-200">{q.difficulty}</span>
                                  </div>
                                  <button onClick={() => convertToFlashcard(q)} className="w-8 h-8 flex items-center justify-center text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border-2 border-transparent" title="افزودن به یادگیری">
                                      <i className="fa-solid fa-brain"></i>
                                  </button>
                              </div>
                              <h4 className="q-text text-xl font-black text-slate-800 dark:text-white mb-6 leading-tight">
                                {idx + 1}- {q.q}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-x-4 print:gap-y-2">
                                  {q.o.map((opt, oi) => (
                                      <div key={oi} className={`option-box p-4 rounded-xl border-[2px] text-sm font-bold flex items-center gap-3 flex-row-reverse transition-colors ${oi === q.a && !window.matchMedia('print').matches ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-black dark:border-slate-700'}`}>
                                          <span className="w-6 h-6 flex items-center justify-center bg-black text-white text-[9px] font-black rounded-lg border border-black">{String.fromCharCode(65 + oi)}</span>
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

      <div className="hidden print:block answer-key-section">
        <div className="border-[2px] border-black p-6 rounded-xl">
            <h3 className="text-lg font-black mb-4 text-center text-black border-b border-black pb-2 italic">کلید آزمون (پاسخ‌نامه مدرس)</h3>
            <div className="grid grid-cols-5 gap-3">
                {questionsToPrint.map((q, i) => (
                    <div key={i} className="text-[9pt] border border-black p-2 flex justify-between flex-row-reverse font-bold text-black rounded bg-slate-50">
                        <span className="bg-black text-white w-5 h-5 rounded flex items-center justify-center ml-1">{i + 1}</span>
                        <span>{String.fromCharCode(65 + q.a)}</span>
                    </div>
                ))}
            </div>
            <div className="mt-10 flex justify-between items-end flex-row-reverse">
                <div className="text-center">
                    <p className="font-bold text-[9pt] mb-8">مهر و امضا</p>
                    <div className="w-32 border-b border-black"></div>
                </div>
                <div className="text-[7pt] text-slate-400">Smart Exam Assistant Pro - Sequential Numbering Active</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
