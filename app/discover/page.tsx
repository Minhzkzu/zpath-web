'use client';

import { motion } from 'framer-motion';
import { Brain, Target, Send } from 'lucide-react';
import { useDiscoverForm } from '../../hooks/useDiscoverForm';
import { ScoreInput } from '../../components/ScoreInput';

export default function DiscoverPage() {
  // GỌI BỘ NÃO (Logic)
  const { formData, handleChange, handleSubmit, isSubmitting } = useDiscoverForm();

  // LẮP RÁP GIAO DIỆN (UI)
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-zpath-dark mb-4">Khám phá bản thân</h1>
          <p className="text-gray-600">Nhập dữ liệu để AI phân tích lộ trình phù hợp nhất với bạn.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Phần 1: Tính cách */}
            <section>
              <h2 className="text-xl font-bold text-zpath-dark mb-4 flex items-center gap-2"><Brain className="text-zpath-primary"/> 1. Tính cách của bạn</h2>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Nhóm tính cách (Theo Holland/MBTI)</label>
                <select 
                  name="personality" 
                  value={formData.personality} 
                  onChange={handleChange} 
                  required
                  className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zpath-primary outline-none bg-white"
                >
                  <option value="">-- Chọn nhóm tính cách --</option>
                  <option value="Kỹ thuật - Logic">Kỹ thuật - Logic (INTJ, ISTP...)</option>
                  <option value="Nghệ thuật - Sáng tạo">Nghệ thuật - Sáng tạo (ENFP, ISFP...)</option>
                  <option value="Nghiên cứu - Phân tích">Nghiên cứu - Phân tích (INTP, INFJ...)</option>
                  <option value="Lãnh đạo - Giao tiếp">Lãnh đạo - Giao tiếp (ENTJ, ENFJ...)</option>
                </select>
              </div>
            </section>

            {/* Phần 2: Điểm số - Sử dụng Component tái sử dụng */}
            <section>
              <h2 className="text-xl font-bold text-zpath-dark mb-4 flex items-center gap-2"><Target className="text-zpath-secondary"/> 2. Năng lực học tập</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <ScoreInput label="Điểm Toán" name="mathScore" value={formData.mathScore} onChange={handleChange} placeholder="VD: 8.5" />
                <ScoreInput label="Điểm Vật Lý" name="physicsScore" value={formData.physicsScore} onChange={handleChange} placeholder="VD: 9.0" />
                <ScoreInput label="Điểm Môn 3" name="thirdScore" value={formData.thirdScore} onChange={handleChange} placeholder="VD: 8.0" />
              </div>
            </section>

            {/* Nút Submit */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-zpath-gradient text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất & Phân tích'} <Send size={18} />
            </button>

          </form>
        </motion.div>
      </div>
    </div>
  );
}