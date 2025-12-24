
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Language } from "../types";

const LANG_NAMES: Record<Language, string> = {
  fa: "Persian (Farsi)",
  en: "English",
  ku: "Kurdish (Sorani)",
  ar: "Arabic"
};

/**
 * استخراج دقیق آرایه JSON از متن خروجی هوش مصنوعی
 * این تابع تمام متون اضافی قبل و بعد از اولین [ و آخرین ] را حذف می‌کند.
 */
const extractJsonArray = (text: string): string => {
  const startIndex = text.indexOf('[');
  const endIndex = text.lastIndexOf(']');
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return text.substring(startIndex, endIndex + 1);
  }
  return text.trim();
};

export const generateQuestions = async (
  topic: string, 
  count: number, 
  difficulty: string, 
  lang: Language, 
  engineLogic: string,
  sourceText?: string
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // استفاده از مدل فلش ۳ برای سرعت و دقت بالا در وظایف متنی
  const model = 'gemini-3-flash-preview';

  const contextInfo = sourceText 
    ? `Based ONLY on this text: "${sourceText.substring(0, 12000)}"` 
    : `On the topic of: "${topic}"`;

  const prompt = `Task: Create ${count} multiple-choice questions in ${LANG_NAMES[lang]}.
Difficulty: ${difficulty}.
Context: ${contextInfo}.

Rules:
1. Output MUST be a valid JSON array of objects.
2. Each object must have: 
   - "q": string (the question)
   - "o": array of 4 strings (options)
   - "a": integer (index of correct option, 0-3)
   - "c": string (category name)
   - "difficulty": string ("${difficulty}")
3. No introduction or explanation text. Just the JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // استفاده از اسکیما برای تضمین ساختار خروجی
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              q: { type: Type.STRING },
              o: { type: Type.ARRAY, items: { type: Type.STRING } },
              a: { type: Type.INTEGER },
              c: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["q", "o", "a", "c", "difficulty"]
          }
        }
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("مدل پاسخی ارسال نکرد.");

    const jsonString = extractJsonArray(rawText);
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed)) {
      throw new Error("فرمت پاسخ دریافتی نامعتبر است.");
    }

    return parsed as Question[];
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    // ارسال پیام خطای دقیق‌تر به کاربر
    if (error.message?.includes("Unexpected token")) {
      throw new Error("خطا در پردازش داده‌های هوش مصنوعی. لطفاً تعداد سوالات را کمتر کرده و دوباره تلاش کنید.");
    }
    throw new Error(error.message || "خطای ناشناخته در طراحی سوال.");
  }
};

export const getDeepExplanation = async (question: string, answer: string, lang: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain simply in ${LANG_NAMES[lang]} why "${answer}" is correct for: "${question}".`,
    });
    return response.text || "توضیحی یافت نشد.";
  } catch (error) {
    return "خطا در دریافت تحلیل هوشمند.";
  }
};
