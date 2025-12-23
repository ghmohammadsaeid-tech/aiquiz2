
import React, { useState, useMemo } from 'react';
import { Flashcard, Question, View, Language, CardType } from '../types';

interface Props {
  flashcards: Flashcard[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  questions: Question[];
  setView: (v: View) => void;
  lang: Language;
  t: (k: string) => string;
  onReviewComplete: (quality: number) => void;
  isPremium: boolean;
  dynamicAd: { title: string, desc: string, btn: string, url: string };
}

const FlashcardSystem: React.FC<Props> = ({ flashcards, setFlashcards, questions, setView, t, onReviewComplete, isPremium, dynamicAd }) => {
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showFinishedAd, setShowFinishedAd] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [newCard, setNewCard] = useState<Partial<Flashcard>>({ type: 'standard', category: 'عمومی', tags: [] });

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
    let { interval, easeFactor, repetitions, errorCount } = { interval: card.interval || 0, easeFactor: card.easeFactor || 2.5, repetitions: card.repetitions || 0, errorCount: card.errorCount || 0 };
    if (quality < 3) { interval = 1; easeFactor = Math.max(1.3, easeFactor - 0.2); repetitions = 0; errorCount++; } 
    else { if (repetitions === 0) interval = 1; else if (repetitions === 1) interval = 3; else interval = Math.round(interval * easeFactor); easeFactor += (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)); easeFactor = Math.max(1.3, Math.min(easeFactor, 2.5)); repetitions++; }
    const nextDate = new Date(); nextDate.setDate(nextDate.getDate() + interval);
    const updatedCard: Flashcard = { ...card, interval, easeFactor, repetitions, errorCount, dueDate: nextDate.toISOString().split('T')[0], lastReviewed: Date.now() };
    setFlashcards(prev => prev.map(c => c.id === card.id ? updatedCard : c));
    onReviewComplete(quality);
    if (currentIdx < sessionCards.length - 1) { setCurrentIdx(currentIdx + 1); setFlipped(false); } else { setLearningMode(false); setShowFinishedAd(true); }
  };

  if (showFinishedAd) {
      return (
          <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
              <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 text-4xl"><i className="fa-solid fa-check-double"></i></div>
                  <h2 className="text-3xl font-black mb-4 dark:text-white">آفرین! خسته نباشی 🎉</h2>
                  <p className="text-slate-500 mb-8">تمامی کارت‌های امروز بررسی شدند.</p>

                  {!isPremium && (
                    <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/30 rounded-3xl text-right flex flex-col items-center gap-3">
                        <h4 className="text-sm font-black text-amber-700 dark:text-amber-400 flex items-center gap-2 flex-row-reverse">
                          <i className="fa-solid fa-graduation-cap"></i>
                          {dynamicAd.title}
                        </h4>
                        <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-1 font-bold text-center">{dynamicAd.desc}</p>
                        <button onClick={() => dynamicAd.url !== "#" ? window.open(dynamicAd.url, '_blank') : setView('settings')} className="w-full py-2 bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg">
                          {dynamicAd.btn}
                        </button>
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
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm">
            <span className="text-xs font-black dark:text-white">سوال {currentIdx + 1} از {sessionCards.length}</span>
            <button onClick={() => setLearningMode(false)} className="px-4 py-1.5 bg-rose-50 text-rose-500 rounded-lg font-black text-[10px]">توقف جلسه</button>
        </div>
        <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
            <div className="flashcard-inner">
                <div className="flashcard-front">
                    <div className="text-2xl font-black text-center leading-relaxed px-8">{card.type === 'cloze' ? card.front.replace(/\[(.*?)\]/g, '[...]') : card.front}</div>
                    <div className="mt-8 text-[10px] opacity-60 uppercase font-black">برای مشاهده پاسخ کلیک کنید</div>
                </div>
                <div className="flashcard-back">
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <div className="text-xl font-bold text-center px-8 leading-relaxed">
                        {card.type === 'cloze' ? <div dangerouslySetInnerHTML={{ __html: card.front.replace(/\[(.*?)\]/g, '<span class="bg-indigo-100 text-indigo-700 px-1 rounded font-black">$1</span>') }} /> : card.back}
                      </div>
                      {card.example && <p className="text-xs text-slate-400 mt-4 px-6 text-center italic leading-relaxed">{card.example}</p>}
                    </div>
                </div>
            </div>
        </div>
        {flipped && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl animate-slide-up space-y-4">
                <p className="text-center text-[10px] font-black text-slate-400 uppercase">چقدر خوب به یاد آوردید؟</p>
                <div className="grid grid-cols-6 gap-2">
                    {[0, 1, 2, 3, 4, 5].map(q => <button key={q} onClick={(e) => { e.stopPropagation(); handleSM2Rating(q); }} className="bg-indigo-600 text-white p-4 rounded-2xl font-black shadow-lg">{q}</button>)}
                </div>
                <div className="flex justify-between text-[8px] font-black text-slate-400 px-2 uppercase"><span>فراموشی</span><span>تسلط کامل</span></div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-2">
            <button onClick={() => setView('dashboard')} className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black shadow-md border dark:border-slate-700 flex items-center gap-2">
              <i className="fa-solid fa-arrow-right"></i> بازگشت به داشبورد
            </button>
            <div>
              <h2 className="text-3xl font-black dark:text-white">یادگیری هوشمند 🧠</h2>
              <p className="text-slate-400 text-sm">مرور با الگوریتم تکرار با فاصله (SM-2)</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => setIsImporting(true)} className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-2"><i className="fa-solid fa-file-import"></i> وارد کردن سوال</button>
            <button onClick={() => setIsCreating(true)} className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-2"><i className="fa-solid fa-plus"></i> کارت جدید</button>
          </div>
      </div>

      {isCreating ? (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl space-y-8 animate-slide-up">
              <h2 className="text-2xl font-black dark:text-white">ایجاد کارت جدید</h2>
              <textarea value={newCard.front} onChange={(e) => setNewCard({...newCard, front: e.target.value})} className="w-full p-5 dark:bg-slate-900 border-2 dark:border-slate-700 rounded-3xl outline-none min-h-[120px] text-lg font-bold" placeholder="سوال..." />
              <textarea value={newCard.back} onChange={(e) => setNewCard({...newCard, back: e.target.value})} className="w-full p-5 dark:bg-slate-900 border-2 dark:border-slate-700 rounded-3xl outline-none min-h-[120px]" placeholder="پاسخ..." />
              <div className="flex gap-4 pt-6"><button onClick={() => { if(!newCard.front) return; setFlashcards(prev => [...prev, { id: Date.now(), front: newCard.front!, back: newCard.back || '', category: 'عمومی', type: 'standard', tags: [], createdAt: Date.now(), dueDate: new Date().toISOString().split('T')[0], interval: 0, easeFactor: 2.5, repetitions: 0, errorCount: 0, difficulty: 'متوسط' }]); setIsCreating(false); }} className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl">ذخیره</button><button onClick={() => setIsCreating(false)} className="px-10 py-5 bg-slate-50 dark:bg-slate-900 text-slate-500 rounded-[1.5rem] font-black">لغو</button></div>
          </div>
      ) : isImporting ? (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black dark:text-white">انتخاب از بانک سوالات</h2>
              <button onClick={() => setIsImporting(false)} className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-400"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-4">
              {questions.map(q => (
                <div key={q.id} onClick={() => setSelectedQuestionIds(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])} className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 ${selectedQuestionIds.includes(q.id) ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedQuestionIds.includes(q.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200'}`}>{selectedQuestionIds.includes(q.id) && <i className="fa-solid fa-check text-[10px]"></i>}</div>
                  <p className="font-bold text-sm text-right flex-1">{q.q}</p>
                </div>
              ))}
            </div>
            <button onClick={() => { setFlashcards(prev => [...prev, ...questions.filter(q => selectedQuestionIds.includes(q.id)).map(q => ({ id: Date.now()+Math.random(), front: q.q, back: q.o[q.a], category: q.c, type: 'standard' as CardType, tags: [], createdAt: Date.now(), dueDate: new Date().toISOString().split('T')[0], interval: 0, easeFactor: 2.5, repetitions: 0, errorCount: 0, difficulty: q.difficulty }))]); setIsImporting(false); setSelectedQuestionIds([]); }} disabled={selectedQuestionIds.length === 0} className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-black disabled:opacity-30">تایید نهایی</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm text-center border dark:border-slate-700">
                <div className="text-5xl font-black text-indigo-600">{dueCards.length}</div>
                <p className="text-slate-400 text-[10px] font-black uppercase mt-2">کارت آماده مرور</p>
                <button onClick={startSession} disabled={dueCards.length === 0} className="w-full mt-6 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg disabled:opacity-50">شروع ماراتن یادگیری</button>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border dark:border-slate-700">
                <h3 className="font-black dark:text-white mb-6">موضوعات فعال</h3>
                <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(flashcards.map(c => c.category))).map(cat => <div key={cat} className="px-5 py-3 bg-slate-50 dark:bg-slate-900 text-slate-600 rounded-2xl text-xs font-black">{cat}</div>)}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardSystem;
