export type SupportedLanguage = 
  | 'English' 
  | 'Hindi' 
  | 'Telugu' 
  | 'Tamil' 
  | 'Kannada' 
  | 'Marathi' 
  | 'Bengali' 
  | 'Malayalam' 
  | 'Punjabi' 
  | 'Gujarati' 
  | 'Odia' 
  | 'Assamese';

export interface CropInputs {
  city: string;
  temperature: string;
  humidity: string;
  rainfall: string;
  ph: string;
  language: SupportedLanguage;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface PredictionResult {
  recommendedCrop: string;
  reason: string;
  productivityBenefit: string;
  sources?: GroundingSource[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ApiResponse {
  success: boolean;
  data?: PredictionResult;
  error?: string;
}