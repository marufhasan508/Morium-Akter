
export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  points: number;
}

export interface Mistake {
  id: string;
  timestamp: number;
  originalText: string;
  correctedText: string;
  feedback: string;
  pointsDeducted: number;
  type: 'grammar' | 'language';
}

export interface AnalysisResult {
  isEnglish: boolean;
  hasBengali: boolean;
  isCorrect: boolean;
  correction: string;
  feedback: string;
  response: string;
}

export enum AppRoute {
  LOGIN = 'login',
  HOME = 'home',
  MISTAKES = 'mistakes',
  SETTINGS = 'settings'
}
