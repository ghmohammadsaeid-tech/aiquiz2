
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Language } from "../types";

const LANG_NAMES: Record<Language, string> = {
  fa: "Persian (Farsi)",
  en: "English",
  ku: "Kurdish (Sorani)",
  ar: "Arabic"
};

/**
 * پاکسازی خروجی برای استخراج آرایه JSON خالص
 */
const cleanJsonResponse = (text: string): string => {
  try {
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1) {
      return text.substring(startIndex, endIndex + 1);
    }
    return text.trim();
  } catch (e) {
    return text;
  }
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
  const model = 'gemini-3-flash-preview';

  // محدود کردن متن ورودی برای جلوگیری از خطای حجم زیاد
  const safeSourceText = sourceText ? sourceText.substring(0, 15000) : "";
  const contextInfo = sourceText 
    ? `Analyze this text and create questions: "${safeSourceText}"` 
    : `Topic: "${topic}"`;

  const prompt = `Task: Create exactly ${count} professional multiple-choice questions in ${LANG_NAMES[lang]}.
Difficulty: ${difficulty}.
Context: ${contextInfo}.

JSON Structure (MANDATORY):
[
  {
    "q": "question text",
    "o": ["option1", "option2", "option3", "option4"],
    "a": 0,
    "c": "category name",
    "difficulty": "${difficulty}"
  }
]
Only return the JSON array. No conversational text.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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

    const cleanedText = cleanJsonResponse(response.text || "");
    const parsed = JSON.parse(cleanedText);

    if (!Array.isArray(parsed)) throw new Error("Invalid format");
    return parsed as Question[];
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error("متأسفانه تولید سوال با خطا مواجه شد. لطفاً حجم متن را کمتر کرده یا تعداد سوالات را کاهش دهید.");
  }
};

export const getDeepExplanation = async (question: string, answer: string, lang: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain why "${answer}" is correct for: "${question}" in ${LANG_NAMES[lang]}. Keep it short and academic.`,
    });
    return response.text || "توضیحی یافت نشد.";
  } catch (error) {
    return "خطا در دریافت تحلیل هوشمند.";
  }
};
