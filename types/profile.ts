import type { Subject, RiasecAnswers, RiasecVector } from "./zpath";

export interface UserProfile {
  name: string;
  avatar: string; // dataURL or empty
  school: string;
  grade: string; // "12", "11", ...
  targetUniversity: string; // code or text
  riasecAnswers?: RiasecAnswers;
  riasecVector?: RiasecVector;
  scoreMath: number;
  scoreLiterature: number;
  electiveSubject1: Subject | "";
  electiveScore1: number;
  electiveSubject2: Subject | "";
  electiveScore2: number;
  ielts: number;
  sat?: number;
  hsgProvince?: "none" | "encouragement" | "third" | "second" | "first";
  hsgNational?: "none" | "encouragement" | "third" | "second" | "first";
  stemAward?: "none" | "encouragement" | "third" | "second" | "first";
  culturalAward: "none" | "encouragement" | "third" | "second" | "first";
  financialLevel?: number;
  region: string;
  bio: string;
}

export const EMPTY_PROFILE: UserProfile = {
  name: "",
  avatar: "",
  school: "",
  grade: "",
  targetUniversity: "",
  riasecAnswers: {},
  riasecVector: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
  scoreMath: 0,
  scoreLiterature: 0,
  electiveSubject1: "",
  electiveScore1: 0,
  electiveSubject2: "",
  electiveScore2: 0,
  ielts: 0,
  sat: 0,
  hsgProvince: "none",
  hsgNational: "none",
  stemAward: "none",
  culturalAward: "none",
  financialLevel: 0,
  region: "",
  bio: "",
};

const KEY = "zpath:profile";

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return { ...EMPTY_PROFILE, ...JSON.parse(raw) } as UserProfile;
  } catch {
    return null;
  }
}

export function saveProfile(p: UserProfile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function clearProfile() {
  localStorage.removeItem(KEY);
}
