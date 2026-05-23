export type Tier = "LOW" | "MID" | "HIGH";

export type RiasecQuestionId = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8" | "q9" | "q10";


export const SUBJECTS = ["Lý", "Hóa", "Sinh", "Sử", "Địa", "Anh", "GDKT-PL", "Tin"] as const;
export type Subject = (typeof SUBJECTS)[number];

export interface TrialFormData {
  scoreMath: number;
  scoreLiterature: number;
  electiveSubject1: Subject | "";
  electiveScore1: number;
  electiveSubject2: Subject | "";
  electiveScore2: number;
  ielts: number;
  sat: number;
  hsgProvince: "none" | "encouragement" | "third" | "second" | "first";
  hsgNational: "none" | "encouragement" | "third" | "second" | "first";
  stemAward: "none" | "encouragement" | "third" | "second" | "first";
  financialLevel: number; // number / per 1000k VND - one section
  region: string;
}

export interface TrialResult {
  tier: Tier;
  totalScore: number;
  bonus: number;
  message: string;
}

export const REGIONS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Nghệ An",
  "Thanh Hóa",
  "Nam Định",
  "Quảng Ninh",
  "Khác",
];

export const RIASEC_DIMENSIONS = ["R", "I", "A", "S", "E", "C"] as const;
export type RiasecDimension = (typeof RIASEC_DIMENSIONS)[number];

export type RiasecAnswers = Partial<Record<RiasecQuestionId, number>>; // 1–5
export type RiasecVector = Record<RiasecDimension, number>; // sau normalize


