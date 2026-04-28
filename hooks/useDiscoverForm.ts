import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../app/lib/supabase';

export function useDiscoverForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mathScore: '',
    physicsScore: '',
    thirdScore: '',
    personality: ''
  });

  // Hàm cập nhật dữ liệu khi gõ vào ô input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi bấm nút Gửi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn trình duyệt tự tải lại trang
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;

      const math = parseFloat(formData.mathScore) || 0;
      const physics = parseFloat(formData.physicsScore) || 0;
      const third = parseFloat(formData.thirdScore) || 0;
      const total = math + physics + third;

      // Bắn lên Supabase
      const { error } = await supabase
        .from('user_profiles')
        .insert([
          { 
            user_email: userEmail,
            personality: formData.personality, 
            math: math, 
            physics: physics, 
            third_subject: third,
            total_score: total
          }
        ]);

      if (error) throw error;
      
      localStorage.removeItem('zpath_user_profile'); 
      router.push('/dashboard');
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
      alert("Không thể lưu hồ sơ, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, handleChange, handleSubmit, isSubmitting };
}