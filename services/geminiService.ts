
import { GoogleGenAI, Type } from "@google/genai";
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
  // Always create a new instance before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Use gemini-3-pro-preview for complex reasoning and STEM tasks like math exam generation
  const model = 'gemini-3-pro-preview';

  // محدودسازی متن برای سرعت بیشتر در موبایل (بهینه‌سازی شده برای جلوگیری از تایم‌اوت)
  const truncatedSource = sourceText ? sourceText.substring(0, 8000) : "";
  const context = truncatedSource ? `Content: "${truncatedSource}"` : `Topic: ${topic}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `You are an expert exam creator using ${engineLogic} logic.
      Based on the following ${context}, generate exactly ${count} educational questions in ${LANG_NAMES[lang]}.
      Difficulty: ${difficulty}. 
      Question types to include: ${types.join(', ')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              q: { type: Type.STRING, description: "The question text" },
              o: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Array of exactly 4 options" 
              },
              a: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
              c: { type: Type.STRING, description: "Category/Topic name" },
              difficulty: { type: Type.STRING, description: "Difficulty level" }
            },
            required: ["q", "o", "a", "c", "difficulty"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result;
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    
    if (error.message?.includes("fetch")) {
      throw new Error("خطای شبکه! اتصال اینترنت موبایل خود را بررسی کنید.");
    }
    if (error.message?.includes("safety")) {
      throw new Error("محتوای متن توسط فیلترهای ایمنی مسدود شد. لطفاً متن دیگری امتحان کنید.");
    }
    
    throw new Error("متأسفانه هوش مصنوعی در این لحظه پاسخگو نیست. شاید حجم متن زیاد است یا اینترنت ضعیف است.");
  }
};

export const getDeepExplanation = async (question: string, answer: string, lang: Language): Promise<string> => {
  // Always create a new instance before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Use gemini-3-pro-preview for deep educational explanations
  const model = 'gemini-3-pro-preview';

  const prompt = `Explain the educational reasoning behind this answer in ${LANG_NAMES[lang]}:
  Question: "${question}"
  Correct Answer: "${answer}"
  Provide a concise and deep explanation.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { 
        // Optional: Disable thinking budget for faster responses on simple explanations,
        // or set a budget for complex reasoning tasks.
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    return response.text || "تحلیلی تولید نشد.";
  } catch (error) {
    return "خطا در دریافت تحلیل آموزشی.";
  }
};
