'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ChevronRight, GraduationCap, Sparkles, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

// Giữ nguyên mockMatchingCareers ở đây...
const mockMatchingCareers = [
  {
    id: 1,
    title: "Kỹ sư Trí tuệ Nhân tạo (AI Engineer)",
    matchScore: 92,
    reason: "Điểm Toán/Lý cao, tính cách rất phù hợp với việc nghiên cứu thuật toán và phát triển hệ thống.",
    universities: ["Đại học Bách Khoa Hà Nội", "Đại học Công Nghệ - ĐHQGHN"]
  },
  {
    id: 2,
    title: "Chuyên gia Phân tích Dữ liệu (Data Analyst)",
    matchScore: 85,
    reason: "Khả năng phân tích tốt, tư duy logic nhạy bén, rất có tiềm năng phát triển.",
    universities: ["Đại học Kinh tế Quốc dân", "Đại học Ngoại Thương"]
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setGoogleUser(session.user);

      // TRUY VẤN DỮ LIỆU TỪ SUPABASE (THAY CHO LOCALSTORAGE)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_email', session.user.email) // Lọc đúng email của người đang dùng
        .single(); // Chỉ lấy 1 bản ghi duy nhất

      if (data) {
        // Chuyển đổi dữ liệu từ DB sang định dạng mà giao diện đang dùng
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

    checkAuth();
  }, [router]);

  // Hàm Đăng xuất
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <img src={googleUser?.user_metadata?.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full mb-4 shadow-md" />
        <h2 className="text-2xl font-bold text-zpath-dark mb-4">Chào {googleUser?.user_metadata?.full_name}, bạn chưa có hồ sơ ZPATH</h2>
        <p className="text-gray-600 mb-6">Hãy hoàn thành bài khảo sát ngắn để AI phân tích lộ trình cho bạn nhé.</p>
        <Link href="/discover" className="bg-zpath-gradient text-white px-6 py-3 rounded-full font-medium shadow-md">
          Khám phá bản thân ngay
        </Link>
        <button onClick={handleLogout} className="mt-6 text-gray-500 underline text-sm">Đăng xuất</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-zpath-dark font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Phần Header - Lời chào lấy TÊN THẬT TỪ GOOGLE */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            {/* Hiển thị Avatar Google */}
            <img src={googleUser?.user_metadata?.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full shadow-sm" />
            <div>
              <h1 className="text-2xl font-bold">Chào mừng trở lại, {googleUser?.user_metadata?.full_name} 👋</h1>
              <p className="text-gray-600 mt-1">
                Nhóm tính cách: <span className="font-semibold text-zpath-secondary">{userData.personality}</span> | 
                Tổng điểm dự kiến: <span className="font-bold">{userData.scores.math + userData.scores.physics + userData.scores.third}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/chat" className="bg-zpath-gradient text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md">
              <Sparkles size={18} />
              Hỏi AI Mentor
            </Link>
            <button onClick={handleLogout} className="bg-gray-100 text-gray-600 px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Phần Danh sách Ngành nghề Phù hợp (Giữ nguyên giao diện cũ) */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-zpath-dark">
            <Briefcase className="text-zpath-primary" />
            Top Ngành Phù Hợp Nhất
          </h2>
          
          <div className="grid gap-6">
            {mockMatchingCareers.map((career, index) => (
              <motion.div 
                key={career.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-zpath-dark">{career.title}</h3>
                    <div className="mt-3 p-4 bg-[#E0F7FA] rounded-xl border-l-4 border-zpath-accent text-sm text-gray-700">
                      <span className="font-bold text-zpath-primary block mb-1">💡 ZPATH Insight:</span> 
                      {career.reason}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-4 text-sm text-gray-500 font-medium">
                      <GraduationCap size={18} className="text-zpath-secondary" />
                      <span>Trường tiêu biểu: {career.universities.join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center min-w-[120px] bg-gray-50 p-4 rounded-xl">
                    <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-zpath-gradient">{career.matchScore}%</div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Độ phù hợp</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
                      <div className="bg-zpath-gradient h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${career.matchScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}