import { supabase } from "@/app/lib/supabase";
import type { DiscoverFormData, UserProfile, UserProfileRow } from "@/lib/types";

const toNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapProfileRow = (row: UserProfileRow): UserProfile => ({
  email: row.user_email,
  personality: row.personality,
  scores: {
    math: row.math,
    physics: row.physics,
    third: row.third_subject,
    total: row.total_score ?? row.math + row.physics + row.third_subject,
  },
  updatedAt: row.updated_at ?? null,
});

export const getCurrentSessionUser = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session?.user ?? null;
};

export const getCurrentUserProfile = async () => {
  const user = await getCurrentSessionUser();

  if (!user?.email) {
    return { user: null, profile: null };
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_email", user.email)
    .limit(1);

  if (error) {
    throw error;
  }

  const row = (data?.[0] ?? null) as UserProfileRow | null;

  return {
    user,
    profile: row ? mapProfileRow(row) : null,
  };
};

export const saveCurrentUserProfile = async (formData: DiscoverFormData) => {
  const user = await getCurrentSessionUser();

  if (!user?.email) {
    throw new Error("Bạn cần đăng nhập trước khi lưu hồ sơ.");
  }

  const math = toNumber(formData.mathScore);
  const physics = toNumber(formData.physicsScore);
  const third = toNumber(formData.thirdScore);
  const total = math + physics + third;

  const payload = {
    user_email: user.email,
    personality: formData.personality,
    math,
    physics,
    third_subject: third,
    total_score: total,
  };

  const { data: existingRows, error: lookupError } = await supabase
    .from("user_profiles")
    .select("user_email")
    .eq("user_email", user.email)
    .limit(1);

  if (lookupError) {
    throw lookupError;
  }

  if (existingRows && existingRows.length > 0) {
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update(payload)
      .eq("user_email", user.email);

    if (updateError) {
      throw updateError;
    }
  } else {
    const { error: insertError } = await supabase
      .from("user_profiles")
      .insert([payload]);

    if (insertError) {
      throw insertError;
    }
  }

  return {
    user,
    profile: {
      email: user.email,
      personality: formData.personality,
      scores: {
        math,
        physics,
        third,
        total,
      },
    } satisfies UserProfile,
  };
};
