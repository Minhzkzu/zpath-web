import { supabase } from "@/app/lib/supabase";
import type { UserProfile } from "@/types/profile";
import { EMPTY_PROFILE } from "@/types/profile";
import {
  RIASEC_DIMENSIONS,
  type RiasecAnswers,
  type RiasecQuestionId,
  type RiasecVector,
} from "@/types/zpath";

type AwardLevel = UserProfile["culturalAward"];

const AWARD_LEVELS: AwardLevel[] = [
  "none",
  "encouragement",
  "third",
  "second",
  "first",
];

function parseAwardLevel(value: unknown, fallback: AwardLevel = "none"): AwardLevel {
  return AWARD_LEVELS.includes(value as AwardLevel) ? (value as AwardLevel) : fallback;
}

function parseRiasecVector(raw: unknown): RiasecVector {
  const vector: RiasecVector = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  if (!raw || typeof raw !== "object") return vector;

  const record = raw as Record<string, unknown>;
  for (const dimension of RIASEC_DIMENSIONS) {
    const value = Number(record[dimension]);
    vector[dimension] = Number.isFinite(value) ? value : 0;
  }
  return vector;
}

function parseRiasecAnswers(raw: unknown): RiasecAnswers {
  if (!raw || typeof raw !== "object") return {};

  const answers: RiasecAnswers = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const score = Number(value);
    if (Number.isFinite(score) && score >= 1 && score <= 5) {
      answers[key as RiasecQuestionId] = score;
    }
  }
  return answers;
}

function hasRiasecResult(vector: RiasecVector): boolean {
  return RIASEC_DIMENSIONS.some((d) => vector[d] > 0);
}

// DB row → UI profile
function rowToProfile(r: Record<string, unknown>): UserProfile {
  const get = <T,>(k: string, def: T): T => (r[k] as T) ?? def;
  const riasecVector = parseRiasecVector(r.riasec_vector);
  const riasecAnswers = parseRiasecAnswers(r.riasec_answers);

  return {
    ...EMPTY_PROFILE,
    name: get("name", ""),
    avatar: get("avatar", ""),
    school: get("school", ""),
    grade: get("grade", ""),
    targetUniversity: get("target_university", ""),
    riasecAnswers: Object.keys(riasecAnswers).length > 0 ? riasecAnswers : EMPTY_PROFILE.riasecAnswers,
    riasecVector: hasRiasecResult(riasecVector) ? riasecVector : EMPTY_PROFILE.riasecVector,
    scoreMath: Number(r.score_math ?? 0),
    scoreLiterature: Number(r.score_literature ?? 0),
    electiveSubject1: get("elective_subject_1", "") as UserProfile["electiveSubject1"],
    electiveScore1: Number(r.elective_score_1 ?? 0),
    electiveSubject2: get("elective_subject_2", "") as UserProfile["electiveSubject2"],
    electiveScore2: Number(r.elective_score_2 ?? 0),
    ielts: Number(r.ielts ?? 0),
    sat: Number(r.sat ?? 0),
    hsgProvince: parseAwardLevel(r.hsg_province, "none"),
    hsgNational: parseAwardLevel(r.hsg_national, "none"),
    stemAward: parseAwardLevel(r.stem_award, "none"),
    culturalAward: parseAwardLevel(r.cultural_award, "none"),
    financialLevel: Number(r.financial_level ?? 0),
    region: get("region", ""),
    bio: get("bio", ""),
  };
}

function profileToRow(p: UserProfile) {
  return {
    name: p.name,
    avatar: p.avatar,
    school: p.school,
    grade: p.grade,
    target_university: p.targetUniversity,
    riasec_answers: p.riasecAnswers ?? {},
    riasec_vector: p.riasecVector ?? EMPTY_PROFILE.riasecVector,
    score_math: p.scoreMath,
    score_literature: p.scoreLiterature,
    elective_subject_1: p.electiveSubject1,
    elective_score_1: p.electiveScore1,
    elective_subject_2: p.electiveSubject2,
    elective_score_2: p.electiveScore2,
    ielts: p.ielts,
    sat: p.sat ?? 0,
    hsg_province: p.hsgProvince ?? "none",
    hsg_national: p.hsgNational ?? "none",
    stem_award: p.stemAward ?? "none",
    cultural_award: p.culturalAward,
    financial_level: p.financialLevel ?? 0,
    region: p.region,
    bio: p.bio,
  };
}

export async function fetchProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { ...EMPTY_PROFILE };
  return rowToProfile(data as Record<string, unknown>);
}

export async function upsertProfile(userId: string, p: UserProfile) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...profileToRow(p) });

  if (error) throw error;
}
