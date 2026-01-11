import { GoogleGenAI } from "@google/genai";

const FALLBACK_MESSAGES = [
  "THE EAGLE HAS LANDED AT MIDNIGHT.",
  "PACKAGE SECURE. RENDEZVOUS POINT ALPHA.",
  "BLUE JAY FLIES SOUTH FOR WINTER.",
  "INTERCEPTED: OPERATION BLACKOUT IMMINENT.",
  "USE CODEPHRASE: RED HORIZON.",
  "ASSET COMPROMISED. ABORT MISSION.",
  "THE CHAIR IS AGAINST THE WALL.",
  "JOHN HAS A LONG MUSTACHE.",
  "WAIT FOR THE SIGNAL AT THE DOCKS."
];

export const generateSpyMessage = async (): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API Key found. Using fallback messages.");
    return getRandomFallback();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a short, cryptic Cold War era spy radio message. It should be mysterious, urgent, and in all caps. No more than 10 words. Do not include quotes.",
      config: {
        maxOutputTokens: 30,
        // When maxOutputTokens is set, we must set thinkingBudget to a smaller value (or 0) to reserve tokens for output.
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 1.2,
      }
    });

    const text = response.text?.trim().toUpperCase();
    if (!text) throw new Error("Empty response");
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getRandomFallback();
  }
};

const getRandomFallback = () => {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
};