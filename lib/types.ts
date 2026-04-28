export interface UserScores {
  math: number;
  physics: number;
  third: number;
  total: number;
}

export interface UserProfile {
  email: string;
  personality: string;
  scores: UserScores;
  updatedAt?: string | null;
}

export interface UserProfileRow {
  user_email: string;
  personality: string;
  math: number;
  physics: number;
  third_subject: number;
  total_score: number | null;
  updated_at?: string | null;
}

export interface DiscoverFormData {
  personality: string;
  mathScore: string;
  physicsScore: string;
  thirdScore: string;
}

export interface CareerMatch {
  id: string;
  title: string;
  matchScore: number;
  reason: string;
  universities: string[];
}
