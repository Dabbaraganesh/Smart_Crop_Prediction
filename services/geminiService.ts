import { CropInputs, PredictionResult, SupportedLanguage } from "../types";

/**
 * Calls the Python Flask Backend for crop prediction.
 */
export const getCropRecommendation = async (inputs: CropInputs): Promise<PredictionResult> => {
  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch recommendation");
  }

  return await response.json();
};

/**
 * Chat logic calling the Flask API.
 */
export const sendChatMessage = async (message: string, language: SupportedLanguage) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language })
  });

  if (!response.ok) throw new Error("Chat service unavailable");
  return await response.json();
};

/**
 * Placeholder for compatibility with existing ChatBot component.
 */
export const createAgriculturalChat = (language: SupportedLanguage) => {
  return {
    sendMessage: async ({ message }: { message: string }) => {
      return await sendChatMessage(message, language);
    }
  };
};
