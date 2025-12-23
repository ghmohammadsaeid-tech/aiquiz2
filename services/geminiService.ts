import { GoogleGenAI } from "@google/genai";
import { Question, Language } from "../types";

const LANG_NAMES: Record<Language, string> = {
  fa: "Persian (Farsi)",
  en: "English",
  ku: "Kurdish (Sorani)",
  ar: "Arabic"
};

export const generateQuestions = async (topic: string, count: number, difficulty: string, lang: Language, engineLogic: string): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = 'gemini-3-flash-preview';

  // تزریق شخصیت و منطق موتور انتخابی به سیستم
  const systemInstruction = `You are an elite exam designer using the unique analytical logic of ${engineLogic}. 
  Create highly accurate and educational questions. Your output must be ONLY a valid JSON array.`;

  const prompt = `Topic: ${topic}
  Count: ${count}
  Difficulty: ${difficulty}
  Language: ${LANG_NAMES[lang]}
  
  JSON Structure:
  [
    {
      "q": "Question text",
      "o": ["Opt1", "Opt2", "Opt3", "Opt4"],
      "a": 0,
      "c": "${topic}",
      "difficulty": "${difficulty}"
    }
  ]
  
  IMPORTANT: Start your response with '[' and end with ']'. Do not include any other text or markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.75, // تعادل بین خلاقیت و دقت
        topP: 0.9,
      }
    });

    const text = response.text || "";
    
    // استخراج فوق ایمن برای اندروید: پیدا کردن اولین [ و آخرین ]
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start === -1 || end === -1) {
      throw new Error("پاسخ هوش مصنوعی حاوی داده‌های معتبر نبود.");
    }
    
    const jsonStr = text.substring(start, end + 1);
    const parsed = JSON.parse(jsonStr);
    
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("AI Assistant Error:", error);
    throw new Error("تولید سوال با خطا مواجه شد. لطفاً موضوع را کوتاه‌تر کنید یا دوباره تلاش کنید.");
  }
};