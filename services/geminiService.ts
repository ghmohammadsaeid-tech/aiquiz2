import { GoogleGenAI, Type } from "@google/genai";
import { Question, Language } from "../types";

const LANG_NAMES: Record<Language, string> = {
  fa: "Persian (Farsi)",
  en: "English",
  ku: "Kurdish (Sorani dialect)",
  ar: "Arabic"
};

export const generateQuestions = async (topic: string, count: number, difficulty: string, lang: Language, engineLogic: string): Promise<Question[]> => {
  // ایجاد نمونه جدید در هر بار فراخوانی برای اطمینان از تازگی کلید (مطابق قوانین)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const modelName = 'gemini-3-flash-preview';

  const prompt = `Act as an expert exam designer using the logic and precision of "${engineLogic}".
  Generate exactly ${count} multiple-choice questions in ${LANG_NAMES[lang]} about "${topic}" with "${difficulty}" difficulty level.
  
  Output MUST be a raw JSON array of objects with these keys:
  - q: The question string
  - o: Array of 4 options
  - a: Index of correct answer (0-3)
  - c: Category name
  - difficulty: "${difficulty}"
  
  IMPORTANT: Return ONLY the JSON array. Do not use any markdown tags, commentary, or backticks. Start with [ and end with ].`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });

    const text = response.text || "";
    
    // استخراج امن JSON با ریجکس برای جلوگیری از خطای متون اضافی در موبایل
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text.trim();
    
    const parsed = JSON.parse(cleanJson);
    if (!Array.isArray(parsed)) throw new Error("Format is not an array");
    
    return parsed;
  } catch (error) {
    console.error("API Call failed:", error);
    throw new Error("خطا در دریافت پاسخ. لطفاً مجدداً تلاش کنید یا از روش دستی استفاده کنید.");
  }
};