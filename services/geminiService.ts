import { GoogleGenAI, Type } from "@google/genai";
import { Question, Language } from "../types";

const LANG_NAMES: Record<Language, string> = {
  fa: "Persian (Farsi)",
  en: "English",
  ku: "Kurdish (Sorani dialect)",
  ar: "Arabic"
};

export const generateQuestions = async (topic: string, count: number, difficulty: string, lang: Language): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const prompt = `Generate exactly ${count} multiple-choice questions in ${LANG_NAMES[lang]} about "${topic}" with "${difficulty}" difficulty level.
  Each question must be a JSON object with:
  - q: Question text
  - o: Array of 4 options
  - a: Correct answer index (0-3)
  - c: Category
  - difficulty: "${difficulty}"
  
  IMPORTANT: The content must be entirely in ${LANG_NAMES[lang]}. Return ONLY a valid JSON array.`;

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

    let text = response.text || "";
    if (!text) {
        text = response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    }
    
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};