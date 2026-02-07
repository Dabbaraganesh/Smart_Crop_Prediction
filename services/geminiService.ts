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