
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Language } from "../types";

const LANG_NAMES: Record<Language, string> = {
  fa: "Persian (Farsi)",
  en: "English",
  ku: "Kurdish (Sorani)",
  ar: "Arabic"
};

const cleanJsonResponse = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
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

  const context = sourceText ? `Provided Context Text: "${sourceText.substring(0, 15000)}"` : `Topic: ${topic}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Design ${count} exam questions about ${topic} in ${LANG_NAMES[lang]}. 
      Difficulty: ${difficulty}. 
      Context: ${context}.
      Return exactly ${count} items in a flat JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              q: { type: Type.STRING },
              o: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
              a: { type: Type.INTEGER, minimum: 0, maximum: 3 },
              c: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["q", "o", "a", "c", "difficulty"]
          }
        }
      }
    });

    if (!response.text) throw new Error("Empty response");
    return JSON.parse(cleanJsonResponse(response.text));
  } catch (error: any) {
    console.error("AI Error:", error);
    throw new Error(error.message || "Failed to generate questions.");
  }
};

export const getDeepExplanation = async (question: string, answer: string, lang: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain in ${LANG_NAMES[lang]} why "${answer}" is the correct answer for the question: "${question}".`,
  });
  return response.text || "No explanation.";
};
