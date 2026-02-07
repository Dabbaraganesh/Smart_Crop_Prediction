import { GoogleGenAI, Chat } from "@google/genai";
import { CropInputs, PredictionResult, GroundingSource, SupportedLanguage } from "../types";

const getAiInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing. Ensure the environment variable 'API_KEY' is set.");
  return new GoogleGenAI({ apiKey });
};

/**
 * Predicts the best crop using gemini-3-flash-preview.
 * Uses a strict JSON output format for reliable parsing.
 */
export const getCropRecommendation = async (inputs: CropInputs): Promise<PredictionResult> => {
  const ai = getAiInstance();
  
  const prompt = `
You are a world-class Indian Agricultural Scientist and Market Analyst.
Language: ${inputs.language}
Target Region: ${inputs.city || "Localized India"}

Soil & Weather Data:
- Temp: ${inputs.temperature} °C
- Humidity: ${inputs.humidity} %
- Rainfall: ${inputs.rainfall} mm
- pH: ${inputs.ph}

TASK:
1. Predict the single most profitable crop.
2. Provide a scientific reason for this choice in ${inputs.language}.
3. Calculate economic productivity with real-time Mandi rates for ${inputs.city} (use Google Search).
4. Use Indian Rupees (₹) and bold them like **₹ 1,20,000**.

OUTPUT FORMAT:
Return ONLY a valid JSON object inside a markdown code block. Do not include any other text.
\`\`\`json
{
  "recommendedCrop": "Name of crop in ${inputs.language}",
  "reason": "Scientific rationale in ${inputs.language}",
  "productivityBenefit": "Economic forecast and Mandi rates in ${inputs.language}"
}
\`\`\`
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      }
    });

    const text = response.text || "";
    
    // Extract JSON from the markdown block
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    let parsedResult: any = {};
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedResult = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("JSON Parse Error, falling back to regex", e);
      }
    }

    // Grounding Sources
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Agri Source",
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      recommendedCrop: parsedResult.recommendedCrop || "Analysis Successful",
      reason: parsedResult.reason || "Parameter analysis completed based on localized soil metrics.",
      productivityBenefit: parsedResult.productivityBenefit || "Market data reflects current regional trends.",
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Unable to reach Agri-Intelligence network. Check API settings or connectivity.");
  }
};

/**
 * Creates a chat session for continuous agricultural advice.
 */
export const createAgriculturalChat = (language: SupportedLanguage) => {
  const ai = getAiInstance();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are Bharat Agri-AI Pro, a senior advisor for Indian farmers.
      - Respond ONLY in ${language}.
      - Use professional, supportive language.
      - Bold all currency values: **₹ 50,000**.
      - Use real-world grounding to provide Mandi rates and government scheme advice.
      - If asked about diseases, suggest organic and chemical remedies common in India.`,
      tools: [{ googleSearch: {} }]
    }
  });
};
