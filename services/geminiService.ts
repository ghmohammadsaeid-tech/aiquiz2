
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

export const generateQuestions = async (topic: string, count: number, difficulty: string): Promise<Question[]> => {
  // Always use the mandated initialization syntax for GoogleGenAI
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const prompt = `Generate exactly ${count} multiple-choice questions in Persian (Farsi) about "${topic}" with "${difficulty}" difficulty level.
  Each question must be a JSON object with:
  - q: Question text
  - o: Array of 4 options
  - a: Correct answer index (0-3)
  - c: Category
  - difficulty: "${difficulty}"`;

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

    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
