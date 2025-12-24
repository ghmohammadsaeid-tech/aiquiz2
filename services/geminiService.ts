
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = 'gemini-3-pro-preview';

  const systemInstruction = `You are an elite exam designer using the unique analytical logic of ${engineLogic}. 
  Your goal is to extract deep educational value from the provided context.
  Supported types: ${types.join(', ')}. 
  - 'mcq': Multiple choice with 4 options.
  - 'cloze': A sentence with '___' and 4 options for the missing word.
  - 'tf': True/False questions (2 options in the target language).
  Output: ONLY a valid JSON array. No markdown, no triple backticks.`;

  const context = sourceText ? `Reference Text: "${sourceText}"` : `Topic: ${topic}`;
  
  const prompt = `${context}
  Count: ${count}
  Difficulty: ${difficulty}
  Language: ${LANG_NAMES[lang]}
  Desired Types: ${types.join(', ')}
  
  Format:
  [
    {
      "q": "Question text",
      "o": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "a": 0,
      "c": "${topic || 'General'}",
      "difficulty": "${difficulty}"
    }
  ]`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    const text = response.text || "";
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error("AI returned invalid JSON.");
    
    return JSON.parse(text.substring(start, end + 1));
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("خطا در طراحی سوال. شاید متن خیلی طولانی باشد.");
  }
};

export const getDeepExplanation = async (question: string, answer: string, lang: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = 'gemini-3-flash-preview';

  const prompt = `Deep educational analysis for:
  Q: "${question}"
  A: "${answer}"
  Lang: ${LANG_NAMES[lang]}
  Explain why this answer is correct and give a study tip. Use Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text || "تحلیلی یافت نشد.";
  } catch (error) {
    return "خطا در برقراری ارتباط با بخش تحلیل.";
  }
};
