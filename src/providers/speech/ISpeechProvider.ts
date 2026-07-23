export interface ISpeechProvider {
  generateSpeech(text: string, options?: SpeechOptions): Promise<SpeechResult>;
}

export interface SpeechOptions {
  voice?: string;
  speed?: number;
  language?: string;
}

export interface SpeechResult {
  audioUrl: string; // ou path local
  duration: number;
  success: boolean;
}