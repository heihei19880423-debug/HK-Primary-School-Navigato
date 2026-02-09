
import { GoogleGenAI } from "@google/genai";

// Initialize AI with the key from process environment directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function askGeminiAboutAdmissions(prompt: string, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${context}\n\nUser Question: ${prompt}`,
      config: {
        systemInstruction: "You are an expert Hong Kong primary school admission consultant. You have access to real-time information via Google Search. If the user asks for dates, fees, or news about specific schools for the current year (2024/2025), use your search tool to provide the most accurate and up-to-date details. Reply in a professional yet empathetic tone, using both Chinese and English as appropriate.",
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // Lower temperature for more factual responses
      },
    });
    
    // .text is a property, not a method
    let text = response.text || "I'm sorry, I couldn't process that.";
    
    // Extract grounding URLs if available and append them to the response
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const links = chunks
        .map(chunk => chunk.web?.uri)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index); // Unique links
        
      if (links.length > 0) {
        text += "\n\n**参考来源:**\n" + links.map(link => `- [官方/参考链接](${link})`).join("\n");
      }
    }
    
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，由于网络或 API 限制，目前无法为您提供回复。请检查您的网络连接或稍后再试。";
  }
}
