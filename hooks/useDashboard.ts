import { useRouter } from "next/navigation";

import { supabase } from "@/app/lib/supabase";
import { buildCareerMatches } from "@/lib/matching-engine";
import { useUserProfile } from "@/hooks/useUserProfile";

export function useDashboard() {
  const router = useRouter();
  const { googleUser, userProfile, isLoading, errorMessage } = useUserProfile();
  const matches = userProfile ? buildCareerMatches(userProfile) : [];

  // Hàm đăng xuất
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Trả về những dữ liệu mà giao diện cần
  return {
    googleUser,
    userProfile,
    matches,
    isLoading,
    errorMessage,
    handleLogout,
  };
}