
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

  const parseOptions = (exampleText?: string) => {
    if (!exampleText || !exampleText.startsWith('گزینه‌ها:')) return null;
    return exampleText.replace('گزینه‌ها: ', '').split(' | ');
  };

  if (showFinishedAd) {
      return (
          <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
              <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 text-4xl border-2 border-black"><i className="fa-solid fa-check-double"></i></div>
                  <h2 className="text-3xl font-black mb-4 dark:text-white">آفرین! خسته نباشی 🎉</h2>
                  <p className="text-slate-500 mb-8 font-bold">تمامی کارت‌های امروز بررسی شدند.</p>
                  <button onClick={() => setView('dashboard')} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">بازگشت به داشبورد</button>
              </div>
          </div>
      );
  }

  if (learningMode && sessionCards.length > 0) {
    const card = sessionCards[currentIdx];
    const options = parseOptions(card.example);

    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <style>{`
            .flashcard-wrapper {
                perspective: 1500px;
                width: 100%;
                height: 440px;
            }
            .flashcard-inner {
                position: relative;
                width: 100%;
                height: 100%;
                transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
                transform-style: preserve-3d;
            }
            .flashcard-wrapper.is-flipped .flashcard-inner {
                transform: rotateY(180deg);
            }
            .flashcard-front, .flashcard-back {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
                border-radius: 2.5rem;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 2.5rem;
                overflow: hidden;
            }
            .flashcard-back {
                transform: rotateY(180deg);
            }
        `}</style>
        
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-5 rounded-3xl border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black dark:text-white uppercase tracking-tighter">کارت {currentIdx + 1} از {sessionCards.length}</span>
            <button onClick={() => setLearningMode(false)} className="px-5 py-2 bg-rose-500 text-white rounded-xl font-black text-[10px] border-2 border-black">توقف</button>
        </div>

        <div className={`flashcard-wrapper ${flipped ? 'is-flipped' : ''}`} onClick={() => !flipped && setFlipped(true)}>
            <div className="flashcard-inner">
                {/* روی کارت (Front) */}
                <div className="flashcard-front bg-indigo-600 border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-xl md:text-2xl font-black text-center text-white leading-tight overflow-y-auto custom-scrollbar mb-6">
                      {card.front}
                    </div>
                    
                    {options && (
                      <div className="grid grid-cols-1 gap-2.5 w-full max-w-sm mx-auto">
                        {options.map((opt, i) => (
                          <div key={i} className="bg-white/10 border-2 border-white/20 p-3 rounded-xl text-white text-right flex items-center gap-3 flex-row-reverse">
                            <span className="w-6 h-6 flex items-center justify-center bg-white text-indigo-600 rounded-lg font-black text-[10px] flex-shrink-0">{String.fromCharCode(65 + i)}</span>
                            <span className="text-[11px] font-bold flex-1 truncate">{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-6 text-center">
                      <div className="inline-block text-[8px] bg-black/20 px-5 py-2 rounded-full text-white font-black uppercase tracking-widest border border-white/10">برای مشاهده پاسخ کلیک کنید</div>
                    </div>
                </div>

                {/* پشت کارت (Back) */}
                <div className="flashcard-back bg-white dark:bg-slate-800 border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center justify-center h-full space-y-8">
                      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <i className="fa-solid fa-circle-check"></i>
                      </div>
                      
                      <div className="text-center space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">پاسخ صحیح:</p>
                        <div className="text-2xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400 px-6 leading-tight">
                          {card.back}
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-[2rem] border-2 border-black w-full text-center">
                          <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-black mb-1 italic">دسته: {card.category}</p>
                          <p className="text-[10px] text-slate-500 font-black italic">نمره تسلط خود را در پایین انتخاب کنید.</p>
                      </div>
                    </div>
                    {/* دکمه کوچک برای برگشت دستی به جلو در صورت نیاز */}
                    <button onClick={() => setFlipped(false)} className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 border border-black/10"><i className="fa-solid fa-rotate-left text-[10px]"></i></button>
                </div>
            </div>
        </div>

        {flipped && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] animate-slide-up space-y-6">
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">میزان یادگیری این کارت را چطور ارزیابی می‌کنید؟</p>
                <div className="grid grid-cols-6 gap-2">
                    {[0, 1, 2, 3, 4, 5].map(q => (
                        <button key={q} onClick={(e) => { e.stopPropagation(); handleSM2Rating(q); }} 
                            className={`h-14 rounded-2xl font-black text-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all 
                            ${q <= 1 ? 'bg-rose-400' : q <= 3 ? 'bg-amber-400' : 'bg-emerald-400'}`}>
                            {q}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-500 px-2 uppercase italic"><span>اصلاً نمی‌دانستم</span><span>کاملاً مسلط هستم</span></div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-3">
            <button onClick={() => setView('dashboard')} className="w-fit px-5 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-[11px] font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <i className="fa-solid fa-arrow-right"></i> داشبورد
            </button>
            <div>
              <h2 className="text-4xl font-black dark:text-white tracking-tighter uppercase italic">یادگیری هوشمند 🧠</h2>
              <p className="text-slate-500 font-bold text-sm mt-1">تکنولوژی تکرار با فاصله (SM-2 Algorithm)</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => setIsImporting(true)} className="flex-1 px-8 py-4 bg-emerald-400 text-black rounded-2xl font-black text-sm border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"><i className="fa-solid fa-file-import"></i> وارد کردن</button>
            <button onClick={() => setIsCreating(true)} className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"><i className="fa-solid fa-plus"></i> کارت جدید</button>
          </div>
      </div>

      {isCreating ? (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] border-[6px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] space-y-8 animate-slide-up">
              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">ساخت کارت جدید</h2>
              <textarea value={newCard.front} onChange={(e) => setNewCard({...newCard, front: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-[3px] border-black rounded-[2rem] outline-none min-h-[140px] text-xl font-black focus:bg-indigo-50 transition-colors" placeholder="صورت سوال یا کلمه..." />
              <textarea value={newCard.back} onChange={(e) => setNewCard({...newCard, back: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-[3px] border-black rounded-[2rem] outline-none min-h-[140px] font-bold focus:bg-emerald-50 transition-colors" placeholder="پاسخ یا تعریف..." />
              <div className="flex gap-4 pt-4">
                  <button onClick={() => { if(!newCard.front) return; setFlashcards(prev => [...prev, { id: Date.now(), front: newCard.front!, back: newCard.back || '', category: 'عمومی', type: 'standard', tags: [], createdAt: Date.now(), dueDate: new Date().toISOString().split('T')[0], interval: 0, easeFactor: 2.5, repetitions: 0, errorCount: 0, difficulty: 'متوسط' }]); setIsCreating(false); }} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">ذخیره نهایی</button>
                  <button onClick={() => setIsCreating(false)} className="flex-1 py-5 bg-white dark:bg-slate-900 text-slate-500 rounded-2xl font-black border-[4px] border-black">لغو</button>
              </div>
          </div>
      ) : isImporting ? (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-[6px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] animate-slide-up">
            <div className="flex justify-between items-center mb-8 flex-row-reverse">
              <h2 className="text-2xl font-black dark:text-white">انتخاب از بانک سوالات</h2>
              <button onClick={() => setIsImporting(false)} className="w-12 h-12 bg-rose-500 text-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {questions.map(q => (
                <div key={q.id} onClick={() => setSelectedQuestionIds(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])} className={`p-5 rounded-2xl border-[3px] cursor-pointer flex items-center gap-4 transition-all ${selectedQuestionIds.includes(q.id) ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 translate-x-1' : 'border-black bg-white dark:bg-slate-900'}`}>
                  <div className={`w-8 h-8 rounded-xl border-[3px] border-black flex items-center justify-center text-lg ${selectedQuestionIds.includes(q.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>{selectedQuestionIds.includes(q.id) && <i className="fa-solid fa-check"></i>}</div>
                  <p className="font-black text-sm text-right flex-1 dark:text-white">{q.q}</p>
                </div>
              ))}
            </div>
            <button onClick={() => { setFlashcards(prev => [...prev, ...questions.filter(q => selectedQuestionIds.includes(q.id)).map(q => ({ id: Date.now()+Math.random(), front: q.q, back: q.o[q.a], category: q.c, type: 'standard' as CardType, tags: [], createdAt: Date.now(), dueDate: new Date().toISOString().split('T')[0], interval: 0, easeFactor: 2.5, repetitions: 0, errorCount: 0, difficulty: q.difficulty, example: `گزینه‌ها: ${q.o.join(' | ')}` }))]); setIsImporting(false); setSelectedQuestionIds([]); }} disabled={selectedQuestionIds.length === 0} className="w-full mt-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30">تایید و اضافه کردن</button>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 p-12 rounded-[3.5rem] border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center flex flex-col justify-center gap-4">
                    <div className="text-7xl font-black text-indigo-600 dark:text-indigo-400 italic">{dueCards.length}</div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">کارت‌های آماده مرور امروز</p>
                    <button onClick={startSession} disabled={dueCards.length === 0} className="w-full mt-6 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase italic">
                        شروع ماراتن ذهن 🚀
                    </button>
                </div>
                <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-xl font-black dark:text-white mb-8 border-b-4 border-black pb-4 uppercase italic">موضوعات داغ</h3>
                    <div className="flex flex-wrap gap-3">
                        {Array.from(new Set(flashcards.map(c => c.category))).length > 0 ? 
                            Array.from(new Set(flashcards.map(c => c.category))).map(cat => <div key={cat} className="px-6 py-3 bg-amber-400 text-black border-[3px] border-black rounded-2xl text-[11px] font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{cat}</div>)
                            : <p className="text-slate-400 font-bold italic">هنوز دسته‌بندی ندارید...</p>
                        }
                    </div>
                </div>
            </div>

            <div className="space-y-8 mt-16">
                <div className="flex items-center gap-4 flex-row-reverse">
                    <div className="h-1 flex-1 bg-black dark:bg-white rounded-full"></div>
                    <h3 className="text-2xl md:text-3xl font-black dark:text-white uppercase italic tracking-tighter">تکنیک‌های طلایی یادگیری سریع 🎓</h3>
                    <div className="h-1 flex-1 bg-black dark:bg-white rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] space-y-6 text-right">
                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><i className="fa-solid fa-bolt-lightning"></i></div>
                        <h4 className="text-xl font-black dark:text-white">۱. یادگیری علمی</h4>
                        <div className="space-y-4 text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-300">
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-2 border-black">
                                <span className="text-indigo-600 dark:text-indigo-400 block mb-1 font-black">بازیابی فعال (Active Recall):</span>
                                بعد از خواندن، کتاب را ببندید و هر چه یادتان هست را بازگو کنید.
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-2 border-black">
                                <span className="text-indigo-600 dark:text-indigo-400 block mb-1 font-black">تکنیک فاینمن:</span>
                                تصور کنید می‌خواهید مطلب را به یک کودک ۱۰ ساله درس بدهید.
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] space-y-6 text-right">
                        <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><i className="fa-solid fa-clock-rotate-left"></i></div>
                        <h4 className="text-xl font-black dark:text-white">۲. زمان و تمرکز</h4>
                        <div className="space-y-4 text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-300">
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-2 border-black">
                                <span className="text-rose-600 dark:text-rose-400 block mb-1 font-black">پومودورو (اصلاح شده):</span>
                                ۵۰ دقیقه تمرکز کامل و ۱۰ دقیقه استراحت.
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-2 border-black">
                                <span className="text-rose-600 dark:text-rose-400 block mb-1 font-black">قانون پارکینسون:</span>
                                زمان مشخص و کوتاهی برای مطالعه هر فصل تعیین کنید.
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] space-y-6 text-right">
                        <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><i className="fa-solid fa-eye"></i></div>
                        <h4 className="text-xl font-black dark:text-white">۳. قدرت تصاویر</h4>
                        <div className="space-y-4 text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-300">
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-2 border-black">
                                <span className="text-emerald-600 dark:text-emerald-400 block mb-1 font-black">نقشه ذهنی (Mind Map):</span>
                                از نمودارهای درختی برای پردازش بصری سریع‌تر استفاده کنید.
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-2 border-black">
                                <span className="text-emerald-600 dark:text-emerald-400 block mb-1 font-black">تکرار فاصله‌دار:</span>
                                از سیستم SM-2 همین اپلیکیشن برای انتقال به حافظه بلندمدت استفاده کنید.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default FlashcardSystem;
