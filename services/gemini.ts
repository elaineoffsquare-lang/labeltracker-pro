
import { GoogleGenAI } from "@google/genai";

// This interface should match the one in services/db.ts
interface DatabaseSchema {
  products: any[];
  orders: any[];
  shipments: any[];
  users: any[];
}

export const getInventoryInsights = async (state: DatabaseSchema): Promise<string> => {
  if (!process.env.API_KEY || process.env.API_KEY === '') {
    return "AI Insights disabled: An API key has not been provided in the application's environment configuration.";
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As an AI business consultant for LabelTracker, analyze this inventory and sales data:
    Products: ${JSON.stringify(state.products)}
    Orders: ${JSON.stringify(state.orders)}
    
    Provide a concise (2-3 sentences) strategic insight about low stock, revenue trends, or restocking priorities.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Insights unavailable: Could not connect to the API. Please check your key and network connection.";
  }
};
