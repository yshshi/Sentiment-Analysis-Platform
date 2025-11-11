import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey:"" });

export async function analyzeLiveSentiment(text: string): Promise<string> {
  try {
    const systemPrompt = `You are a sentiment classifier.
Output one word only: positive, negative, or neutral.
Analyze this text: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });
     // ✅ Log the full object
    console.log("Full Gemini response:", response);

    // ✅ Log just the returned text
    console.log("Gemini text output:", response.text);

    const result = response.text?.trim().toLowerCase() || "neutral";
    
    if (result.includes("positive")) return "positive";
    if (result.includes("negative")) return "negative";
    return "neutral";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to analyze sentiment: ${error}`);
  }
}
