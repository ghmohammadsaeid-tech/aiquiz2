import { GoogleGenAI } from "@google/genai";
import { Question, Language } from "../types";

const LANG_NAMES: Record<Language, string> = {
  fa: "Persian (Farsi)",
  en: "English",
  ku: "Kurdish (Sorani)",
  ar: "Arabic"
};

export const generateQuestions = async (topic: string, count: number, difficulty: string, lang: Language, engineLogic: string): Promise<Question[]> => {
  // ایجاد نمونه جدید برای اطمینان از صحت کلید در هر درخواست
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `You are an elite exam board member using the unique analytical logic of the ${engineLogic} AI model. 
  Your task is to generate highly educational and accurate questions.`;

  const prompt = `Topic: ${topic}
  Count: ${count}
  Difficulty: ${difficulty}
  Language: ${LANG_NAMES[lang]}
  
  Instructions:
  1. Generate exactly ${count} multiple-choice questions.
  2. Each question must have exactly 4 options.
  3. Format the output as a valid JSON array.
  
  JSON Structure:
  [
    {
      "q": "Question text here",
      "o": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "a": 0,
      "c": "${topic}",
      "difficulty": "${difficulty}"
    }
  ]
  
  IMPORTANT: Return ONLY the raw JSON array. No markdown, no backticks (\`\`\`), no explanations. Start directly with [ and end with ].`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        topP: 0.95,
        topK: 40
      }
    });

    const text = response.text || "";
    
    // متد پیشرفته استخراج JSON برای اندروید (هندل کردن هر نوع متن اضافی)
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    
    if (startIndex === -1 || endIndex === -1) {
      console.error("Raw Response:", text);
      throw new Error("ساختار پاسخ هوش مصنوعی نامعتبر بود. لطفاً دوباره تلاش کنید.");
    }
    
    const jsonStr = text.substring(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonStr);
    
    if (!Array.isArray(parsed)) throw new Error("Output is not an array");
    return parsed;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("خطا در ارتباط با موتور هوش مصنوعی. اگر اندروید شما قدیمی است، از روش دستی استفاده کنید.");
  }
};