// Photo Session Types
export interface PhotoSession {
  id: string;
  timestamp: number;
  footSide: 'left' | 'right';
  imagePath: string;
  notes?: string;
  hasWound?: boolean;
}

// Sensation Check Types
export type SensationResponse = 'felt' | 'faint' | 'not-felt';

export interface SensationSite {
  toe: 1 | 3 | 5;
  foot: 'left' | 'right';
  response: SensationResponse | null;
}

export interface SensationSession {
  id: string;
  date: number;
  results: SensationSite[];
  totalScore: number;
  classification: 'normal' | 'borderline' | 'at-risk';
}

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  TakePhoto: undefined;
  ComparePhotos: { beforePhoto?: PhotoSession; afterPhoto?: PhotoSession };
  SensationTest: undefined;
  SensationResults: { session: SensationSession };
};

export type TabParamList = {
  Home: undefined;
  Photos: undefined;
  Check: undefined;
  AI: undefined;
};
