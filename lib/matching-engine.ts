import type { CareerMatch, UserProfile } from "@/lib/types";

interface CareerRule {
  id: string;
  title: string;
  universities: string[];
  preferredPersonalities: string[];
  subjectWeights: {
    math: number;
    physics: number;
    third: number;
  };
  highlight: string;
}

const CAREER_RULES: CareerRule[] = [
  {
    id: "ai-engineer",
    title: "Ky su Tri tue Nhan tao",
    universities: ["DH Bach Khoa Ha Noi", "DH Cong nghe - DHQGHN"],
    preferredPersonalities: ["Ky thuat - Logic", "Nghien cuu - Phan tich"],
    subjectWeights: { math: 0.5, physics: 0.35, third: 0.15 },
    highlight: "phu hop voi cac nganh can tu duy he thong va giai quyet van de phuc tap",
  },
  {
    id: "data-analyst",
    title: "Phan tich Du lieu",
    universities: ["DH Kinh te Quoc dan", "DH Khoa hoc Tu nhien"],
    preferredPersonalities: ["Nghien cuu - Phan tich", "Ky thuat - Logic"],
    subjectWeights: { math: 0.45, physics: 0.2, third: 0.35 },
    highlight: "co the manh o viec doc du lieu, rut ra insight va dua ra quyet dinh",
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    universities: ["Hoc vien Bao chi va Tuyen truyen", "DH Thuong mai"],
    preferredPersonalities: ["Nghe thuat - Sang tao", "Lanh dao - Giao tiep"],
    subjectWeights: { math: 0.15, physics: 0.1, third: 0.75 },
    highlight: "can kha nang sang tao, ke chuyen va hieu hanh vi nguoi dung",
  },
  {
    id: "product-manager",
    title: "Product Manager",
    universities: ["DH FPT", "RMIT Viet Nam"],
    preferredPersonalities: ["Lanh dao - Giao tiep", "Ky thuat - Logic"],
    subjectWeights: { math: 0.35, physics: 0.15, third: 0.5 },
    highlight: "yeu cau ket hop tu duy san pham, giao tiep va dieu phoi nhieu ben",
  },
  {
    id: "ui-ux-designer",
    title: "UI UX Designer",
    universities: ["DH My thuat Cong nghiep", "Arena Multimedia"],
    preferredPersonalities: ["Nghe thuat - Sang tao", "Nghien cuu - Phan tich"],
    subjectWeights: { math: 0.15, physics: 0.1, third: 0.75 },
    highlight: "phu hop voi nguoi co su nhay cam trai nghiem va tu duy thiet ke",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getStrongestSubject = (profile: UserProfile) => {
  const subjectEntries = [
    { key: "Toan", value: profile.scores.math },
    { key: "Vat ly", value: profile.scores.physics },
    { key: "Mon 3", value: profile.scores.third },
  ];

  return subjectEntries.sort((left, right) => right.value - left.value)[0];
};

export const buildCareerMatches = (profile: UserProfile): CareerMatch[] => {
  const strongestSubject = getStrongestSubject(profile);

  return CAREER_RULES.map((career) => {
    const weightedScore =
      profile.scores.math * 10 * career.subjectWeights.math +
      profile.scores.physics * 10 * career.subjectWeights.physics +
      profile.scores.third * 10 * career.subjectWeights.third;

    const personalityBonus = career.preferredPersonalities.includes(profile.personality) ? 18 : 4;
    const totalBonus = clamp((profile.scores.total / 30) * 12, 0, 12);
    const matchScore = Math.round(clamp(weightedScore + personalityBonus + totalBonus, 45, 98));

    const reason = `${profile.personality} cua ban ${career.preferredPersonalities.includes(profile.personality) ? "rat" : "kha"} hop voi huong nay, dac biet khi ${strongestSubject.key.toLowerCase()} dang la diem manh. Lo trinh nay ${career.highlight}.`;

    return {
      id: career.id,
      title: career.title,
      matchScore,
      reason,
      universities: career.universities,
    };
  }).sort((left, right) => right.matchScore - left.matchScore);
};
