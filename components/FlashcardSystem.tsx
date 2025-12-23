import React, { useState, useMemo } from 'react';
import { Flashcard, Question, View, Language, CardType } from '../types';
import { AD_CONFIG } from '../constants';

interface Props {
  flashcards: Flashcard[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  questions: Question[];
  setView: (v: View) => void;
  lang: Language;
  t: (k: string) => string;
  onReviewComplete: (quality: number) => void;
  isPremium: boolean;
}

const FlashcardSystem: React.FC<Props> = ({ flashcards, setFlashcards, questions, setView, t, onReviewComplete, isPremium }) => {
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showFinishedAd, setShowFinishedAd] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  
  const [newCard, setNewCard] = useState<Partial<Flashcard>>({
    type: 'standard',
    category: 'عمومی',
    tags: []
  });

  const dueCards = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return flashcards.filter(c => !c.dueDate || c.dueDate <= today);
  }, [flashcards]);

  const startSession = () => {
    if (dueCards.length === 0) return;
    setSessionCards([...dueCards].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setLearningMode(true);
    setFlipped(false);
    setShowFinishedAd(false);
  };

  const handleSM2Rating = (quality: number) => {
    const card = sessionCards[currentIdx];
    let { interval, easeFactor, repetitions, errorCount } = { 
      interval: card.interval || 0, 
      easeFactor: card.easeFactor || 2.5, 
      repetitions: card.repetitions || 0, 
      errorCount: card.errorCount || 0 
    };

    if (quality < 3) {
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      repetitions = 0;
      errorCount++;
    } else {
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 3;
      else interval = Math.round(interval * easeFactor);
      easeFactor += (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      easeFactor = Math.max(1.3, Math.min(easeFactor, 2.5));
      repetitions++;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    const updatedCard: Flashcard = { 
      ...card, 
      interval, 
      easeFactor, 
      repetitions, 
      errorCount, 
      dueDate: nextDate.toISOString().split('T')[0], 
      lastReviewed: Date.now() 
    };

    setFlashcards(prev => prev.map(c => c.id === card.id ? updatedCard : c));
    onReviewComplete(quality);

    if (currentIdx < sessionCards.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setFlipped(false);
    } else {
      setLearningMode(false);
      setShowFinishedAd(true);
    }
  };

  const saveCard = () => {
      if (!newCard.front || (!newCard.back && newCard.type !== 'cloze')) return alert('لطفاً فیلدها را پر کنید.');
      const card: Flashcard = { 
        id: Date.now(), 
        front: newCard.front || '', 
        back: newCard.back || '', 
        category: newCard.category || 'عمومی', 
        type: (newCard.type as CardType) || 'standard', 
        tags: newCard.tags || [], 
        createdAt: Date.now(), 
        dueDate: new Date().toISOString().split('T')[0], 
        interval: 0, 
        easeFactor: 2.5, 
        repetitions: 0, 
        errorCount: 0, 
        difficulty: 'متوسط' 
      };
      setFlashcards(prev => [...prev, card]);
      setIsCreating(false);
      setNewCard({ type: 'standard', category: 'عمومی', tags: [] });
  };

  const importSelectedQuestions = () => {
    if (selectedQuestionIds.length === 0) return;
    
    const newCards: Flashcard[] = questions
      .filter(q => selectedQuestionIds.includes(q.id))
      .map(q => ({
        id: Date.now() + Math.random(),
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
        tags: ['وارد_شده_از_بانک'],
        errorCount: 0
      }));

    setFlashcards(prev => [...prev, ...newCards]);
    setIsImporting(false);
    setSelectedQuestionIds([]);
    alert(`${newCards.length} کارت جدید به سیستم یادگیری هوشمند اضافه شد.`);
  };

  const toggleQuestionSelection = (id: number) => {
    setSelectedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  if (showFinishedAd) {
      return (
          <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
              <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 text-4xl"><i className="fa-solid fa-check-double"></i></div>
                  <h2 className="text-3xl font-black mb-4 dark:text-white">آفرین! خسته نباشی 🎉</h2>
                  <p className="text-slate-500 mb-8">تمامی کارت‌های در نوبت مرور امروز با موفقیت بررسی شدند.</p>

                  {/* Advertisement Slot - FLASHCARD END */}
                  {AD_CONFIG.enabled && AD_CONFIG.flashcardEnd.show && !isPremium && (
                    <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/30 rounded-3xl text-right flex flex-col items-center justify-between gap-4">
                      <div className="text-center">
                        <h4 className="text-sm font-black text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2 flex-row-reverse">
                          <i className={`fa-solid ${AD_CONFIG.flashcardEnd.icon}`}></i>
                          {AD_CONFIG.flashcardEnd.title}
                        </h4>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-bold">{AD_CONFIG.flashcardEnd.description}</p>
                      </div>
                      <a 
                        href={AD_CONFIG.flashcardEnd.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg"
                      >
                        {AD_CONFIG.flashcardEnd.buttonText}
                      </a>
                    </div>
                  )}

                  <button onClick={() => setView('dashboard')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">بازگشت به داشبورد</button>
              </div>
          </div>
      );
  }

  if (learningMode && sessionCards.length > 0) {
    const card = sessionCards[currentIdx];
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-black dark:text-white uppercase">Session {currentIdx + 1}/{sessionCards.length}</span>
            <button onClick={() => setLearningMode(false)} className="text-rose-500 font-black text-[10px] uppercase">Abort</button>
        </div>
        <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
            <div className="flashcard-inner">
                <div className="flashcard-front border-4 border-indigo-50 dark:border-indigo-900/30 shadow-2xl">
                    <div className="text-2xl font-black text-center leading-relaxed px-8">{card.type === 'cloze' ? card.front.replace(/\[(.*?)\]/g, '[...]') : card.front}</div>
                </div>
                <div className="flashcard-back border-4 border-white dark:border-slate-700 shadow-2xl">
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <div className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center px-8 leading-relaxed">
                        {card.type === 'cloze' ? <div dangerouslySetInnerHTML={{ __html: card.front.replace(/\[(.*?)\]/g, '<span class="bg-indigo-100 text-indigo-700 px-1 rounded font-black">$1</span>') }} /> : card.back}
                      </div>
                      {card.example && <p className="text-xs text-slate-400 mt-4 px-6 text-center italic">{card.example}</p>}
                    </div>
                </div>
            </div>
        </div>
        {flipped && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl animate-slide-up space-y-4">
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">سطح دشواری یادآوری را انتخاب کنید</p>
                <div className="grid grid-cols-6 gap-2">
                    {[0, 1, 2, 3, 4, 5].map(q => (
                        <button key={q} onClick={(e) => { e.stopPropagation(); handleSM2Rating(q); }} className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg flex flex-col items-center">
                          {q}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between text-[8px] font-black text-slate-400 px-2 uppercase">
                  <span>فراموشی مطلق</span>
                  <span>یادآوری کامل</span>
                </div>
            </div>
        )}
      </div>
    );
  }

  if (isCreating) {
      return (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl space-y-8 animate-slide-up">
              <h2 className="text-2xl font-black dark:text-white">ایجاد کارت یادگیری دستی</h2>
              <div className="space-y-4">
                <textarea value={newCard.front} onChange={(e) => setNewCard({...newCard, front: e.target.value})} className="w-full p-5 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-700 rounded-3xl outline-none min-h-[120px] text-lg font-bold" placeholder="سوال یا عبارتی که باید یادآوری شود..." />
                <textarea value={newCard.back} onChange={(e) => setNewCard({...newCard, back: e.target.value})} className="w-full p-5 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-700 rounded-3xl outline-none min-h-[120px]" placeholder="پاسخ یا توضیح..." />
              </div>
              <div className="flex gap-4 pt-6"><button onClick={saveCard} className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100">ذخیره کارت</button><button onClick={() => setIsCreating(false)} className="px-10 py-5 bg-slate-50 dark:bg-slate-900 text-slate-500 rounded-[1.5rem] font-black">لغو</button></div>
          </div>
      );
  }

  if (isImporting) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl border dark:border-slate-700">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black dark:text-white">وارد کردن از بانک سوالات</h2>
              <p className="text-slate-400 text-sm">سوالاتی که مایل هستید به فلش‌کارت تبدیل شوند را انتخاب کنید.</p>
            </div>
            <button onClick={() => setView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-full text-slate-400">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-10 opacity-50 font-bold">بانک سوالات خالی است.</div>
            ) : (
              questions.map(q => (
                <div 
                  key={q.id} 
                  onClick={() => toggleQuestionSelection(q.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedQuestionIds.includes(q.id) ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-50 dark:border-slate-700 hover:border-slate-200'}`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedQuestionIds.includes(q.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200'}`}>
                    {selectedQuestionIds.includes(q.id) && <i className="fa-solid fa-check text-[10px]"></i>}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-sm dark:text-slate-200">{q.q}</p>
                    <span className="text-[10px] text-indigo-500 font-black uppercase mt-2 inline-block">{q.c}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 flex gap-4">
            <button 
              onClick={importSelectedQuestions}
              disabled={selectedQuestionIds.length === 0}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black disabled:opacity-30 shadow-xl shadow-indigo-100"
            >
              افزودن {selectedQuestionIds.length} مورد به یادگیری
            </button>
            <button onClick={() => setSelectedQuestionIds(questions.map(q => q.id))} className="px-6 py-4 bg-slate-50 dark:bg-slate-900 text-slate-500 rounded-2xl font-black text-xs">انتخاب همه</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setView('dashboard')}
              className="w-fit flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-black shadow-sm hover:bg-slate-50 transition-all flex-row-reverse"
            >
              <i className="fa-solid fa-arrow-right"></i>
              داشبورد
            </button>
            <div>
              <h2 className="text-3xl font-black dark:text-white text-slate-800">یادگیری مادام‌العمر 🧠</h2>
              <p className="text-slate-400 text-sm">الگوریتم تکرار با فاصله (SM-2)</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => setIsImporting(true)} className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2"><i className="fa-solid fa-file-import"></i> وارد کردن از بانک</button>
            <button onClick={() => setIsCreating(true)} className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2"><i className="fa-solid fa-plus"></i> کارت جدید</button>
          </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm text-center space-y-6 border dark:border-slate-700">
              <div className="text-5xl font-black dark:text-white text-indigo-600">{dueCards.length}</div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">کارت آماده مرور برای امروز</p>
              <button onClick={startSession} disabled={dueCards.length === 0} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg disabled:opacity-50 shadow-xl shadow-indigo-100 active:scale-95 transition-all">شروع جلسه یادگیری</button>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border dark:border-slate-700">
              <h3 className="font-black dark:text-white mb-6 flex items-center gap-2">دسته های فعال (Decks)</h3>
              <div className="flex flex-wrap gap-2">
                  {flashcards.length === 0 ? (
                    <p className="text-xs text-slate-400 font-bold">هنوز کارتی اضافه نکرده‌اید.</p>
                  ) : (
                    Array.from(new Set(flashcards.map(c => c.category))).map(cat => (
                      <div key={cat} className="px-5 py-3 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-black border dark:border-slate-700">{cat}</div>
                    ))
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default FlashcardSystem;