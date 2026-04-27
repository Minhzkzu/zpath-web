'use client';

import { motion } from 'framer-motion';
import { Brain, Target, Send } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function DiscoverPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // State để lưu trữ dữ liệu người dùng nhập
  const [formData, setFormData] = useState({
    personality: '',
    mathScore: '',
    physicsScore: '',
    thirdScore: ''
  });

  // Hàm xử lý khi người dùng chọn/nhập dữ liệu
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Hàm xử lý khi bấm nút "Hoàn tất"
  const handleSubmit = async () => {
    // 1. Lấy thông tin người dùng đang đăng nhập từ Supabase Auth
    const { data: { session } } = await supabase.auth.getSession();
    const userEmail = session?.user?.email;

    const math = parseFloat(formData.mathScore) || 0;
    const physics = parseFloat(formData.physicsScore) || 0;
    const third = parseFloat(formData.thirdScore) || 0;
    const total = math + physics + third;

    // 2. Lưu lên Supabase kèm theo Email để định danh
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert([
          { 
            user_email: userEmail, // Gắn email người dùng vào đây
            personality: formData.personality, 
            math: math, 
            physics: physics, 
            third_subject: third,
            total_score: total
          }
        ]);

      if (error) throw error;
      
      // Xóa localStorage cũ để bắt đầu dùng dữ liệu từ Cloud
      localStorage.removeItem('zpath_user_profile'); 
      router.push('/dashboard');
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
      alert("Không thể lưu hồ sơ, vui lòng thử lại!");
    }
  };

  const personalityOptions = [
    { label: 'Mình thích làm việc với máy móc, logic, và các con số.', type: 'Kỹ thuật - Logic' },
    { label: 'Mình thích sáng tạo, viết lách, và thiết kế nghệ thuật.', type: 'Sáng tạo - Nghệ thuật' },
    { label: 'Mình thích giao tiếp, giúp đỡ và kết nối mọi người.', type: 'Xã hội - Giao tiếp' },
    { label: 'Mình thích phân tích, nghiên cứu và tìm ra sự thật.', type: 'Nghiên cứu - Phân tích' }
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 mt-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Hiểu rõ bản thân cùng ZPATH</h1>
        <p className="text-gray-600">Trả lời một vài câu hỏi để AI có thể gợi ý lộ trình chính xác nhất cho bạn.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100"
      >
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Brain className="text-zpath-secondary" />
              Bạn thuộc tuýp người nào?
            </h2>
            
            <div className="space-y-3">
              {personalityOptions.map((option, idx) => (
                <label key={idx} className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-zpath-primary hover:bg-blue-50 transition-all">
                  <input 
                    type="radio" 
                    name="personality" 
                    value={option.type}
                    onChange={(e) => handleInputChange('personality', e.target.value)}
                    className="w-5 h-5 text-zpath-primary" 
                  />
                  <span className="font-medium text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!formData.personality} // Khóa nút nếu chưa chọn
                className="bg-zpath-dark text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Tiếp theo <Target size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="text-zpath-primary" />
              Điểm thi dự kiến của bạn
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Toán</label>
                <input 
                  type="number" min="0" max="10" step="0.25" 
                  value={formData.mathScore}
                  onChange={(e) => handleInputChange('mathScore', e.target.value)}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-zpath-primary outline-none" placeholder="VD: 8.5" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Vật Lý</label>
                <input 
                  type="number" min="0" max="10" step="0.25" 
                  value={formData.physicsScore}
                  onChange={(e) => handleInputChange('physicsScore', e.target.value)}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-zpath-primary outline-none" placeholder="VD: 8.0" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Môn thứ 3</label>
                <input 
                  type="number" min="0" max="10" step="0.25" 
                  value={formData.thirdScore}
                  onChange={(e) => handleInputChange('thirdScore', e.target.value)}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-zpath-primary outline-none" placeholder="VD: 9.0" 
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button onClick={() => setStep(1)} className="text-gray-500 font-medium hover:text-gray-800">
                Quay lại
              </button>
              <button 
                onClick={handleSubmit}
                className="bg-zpath-gradient text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                Hoàn tất & Phân tích <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}