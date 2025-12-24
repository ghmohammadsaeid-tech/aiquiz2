
import { GoogleGenAI } from "@google/genai";
import { Question, Language } from "../types";

const LANG_NAMES: Record<Language, string> = {
  fa: "Persian (Farsi)",
  en: "English",
  ku: "Kurdish (Sorani)",
  ar: "Arabic"
};

export const generateQuestions = async (
  topic: string, 
  count: number, 
  difficulty: string, 
  lang: Language, 
  engineLogic: string,
  sourceText?: string,
  types: string[] = ['mcq']
): Promise<Question[]> => {
  // ایجاد نمونه جدید در هر بار فراخوانی برای اطمینان از تازگی تنظیمات
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  // استفاده از مدل Flash که بسیار سریع‌تر است و در شبکه‌های موبایل کمتر دچار تایم‌اوت می‌شود
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `You are an elite exam designer using the analytical logic of ${engineLogic}. 
  Your goal is to extract deep educational value.
  Supported types: ${types.join(', ')}. 
  Output: ONLY a valid JSON array. No markdown, no backticks.
  Language: ${LANG_NAMES[lang]}.`;

  // محدود کردن طول متن ورودی برای جلوگیری از خطای حافظه در گوشی
  const truncatedSource = sourceText ? sourceText.substring(0, 15000) : "";
  const context = truncatedSource ? `Reference Text: "${truncatedSource}"` : `Topic: ${topic}`;
  
  const prompt = `${context}
  Create ${count} ${difficulty} questions.
  Types: ${types.join(', ')}
  Format: [{"q": "...", "o": ["...", "...", "...", "..."], "a": 0, "c": "${topic || 'General'}", "difficulty": "${difficulty}"}]`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7, // کاهش اندک دما برای پایداری بیشتر خروجی JSON
      }
    });

    const text = response.text || "";
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start === -1 || end === -1) {
      throw new Error("پاسخ هوش مصنوعی ساختار استانداردی نداشت. دوباره تلاش کنید.");
    }
    
    return JSON.parse(text.substring(start, end + 1));
  } catch (error: any) {
    console.error("AI Error:", error);
    if (error.message?.includes("API_KEY")) {
      throw new Error("کلید دسترسی معتبر نیست. لطفاً تنظیمات را بررسی کنید.");
    }
    throw new Error("خطا در ارتباط با هوش مصنوعی. لطفاً اتصال اینترنت خود را چک کرده و دوباره امتحان کنید.");
  }
};

export const getDeepExplanation = async (question: string, answer: string, lang: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = 'gemini-3-flash-preview';

  const prompt = `Explain briefly why this is correct:
  Q: "${question}"
  A: "${answer}"
  Lang: ${LANG_NAMES[lang]}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text || "تحلیلی یافت نشد.";
  } catch (error) {
    return "خطا در دریافت تحلیل. دوباره امتحان کنید.";
  }
};
