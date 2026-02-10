
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function askGeminiAboutAdmissions(prompt: string, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${context}\n\nUser Question: ${prompt}`,
      config: {
        systemInstruction: "You are an expert Hong Kong primary school admission consultant. You have access to real-time information via Google Search. If the user asks for dates, fees, or news about specific schools for the current year (2024/2025), use your search tool to provide the most accurate and up-to-date details. Reply in a professional yet empathetic tone, using both Chinese and English as appropriate.",
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });
    
    let text = response.text || "I'm sorry, I couldn't process that.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const links = chunks
        .map(chunk => chunk.web?.uri)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index);
      if (links.length > 0) {
        text += "\n\n参考来源:\n" + links.map(link => `- [官方/参考链接](${link})`).join("\n");
      }
    }
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，由于网络或 API 限制，目前无法为您提供回复。";
  }
}

/**
 * 专门用于监控学校官网动态的服务
 */
export async function monitorSchoolAdmissions(schoolNames: string[]) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `请调查以下香港小学的最新招生动态（2025/26 学年）：${schoolNames.join(', ')}。请查阅官网并告诉我：1. 是否已开放申请？2. 截止日期是什么时候？3. 面试大概在几月？`,
      config: {
        systemInstruction: "你是一个招生简章监控代理。你的任务是核实这些学校官网的最新信息。请直接给出核心结论，如果有变动，请明确指出。输出应包含学校名称、最新状态和截止日期。",
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Monitor Service Error:", error);
    return null;
  }
}

/**
 * 智能检索学校详细信息并返回 JSON
 */
export async function lookupSchoolDetails(schoolName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Search for the detailed admission information of the Hong Kong primary school: "${schoolName}". Provide the data strictly in JSON format.`,
      config: {
        systemInstruction: `You are a data entry assistant for a Hong Kong primary school database. 
        Use Google Search to find current (2024/25 or 2025/26) details for the school.
        Return the information as a JSON object with these keys: 
        name, nameZh, location, district, tuitionFee, type, curriculum (array), language (array), applicationEnd (YYYY-MM-DD), interviewDate, website, description.
        Values for 'type' must be one of: 'International', 'DSS (Direct Subsidy)', 'Private', 'Aided/Government'.
        Values for 'curriculum' items must be from: 'DSE', 'IB', 'AP', 'British (A-Level)'.
        If a field is unknown, leave it empty.`,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Lookup Error:", error);
    return null;
  }
}
