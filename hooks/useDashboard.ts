import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../app/lib/supabase';

export function useDashboard() {
  const router = useRouter();
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Kiểm tra đăng nhập
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setGoogleUser(session.user);

      // 2. Lấy dữ liệu điểm số
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_email', session.user.email)
        .single();

      if (data) {
        setUserData({
          personality: data.personality,
          scores: {
            math: data.math,
            physics: data.physics,
            third: data.third_subject
          }
        });
      }
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  // Hàm đăng xuất
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Trả về những dữ liệu mà giao diện cần
  return { googleUser, userData, isLoading, handleLogout };
}