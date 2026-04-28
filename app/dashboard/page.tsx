'use client';

import Link from 'next/link';
import { Briefcase, Sparkles, LogOut } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { CareerCard } from '../../components/CareerCard';

// Mock data tạm thời (Sau này sẽ tách ra Hook Matching)
const mockMatchingCareers = [
  { id: 1, title: "Kỹ sư Trí tuệ Nhân tạo", matchScore: 92, reason: "Tư duy logic nhạy bén...", universities: ["ĐH Bách Khoa HN"] },
  { id: 2, title: "Phân tích Dữ liệu", matchScore: 85, reason: "Điểm Toán cao...", universities: ["ĐH Kinh tế Quốc dân"] }
];

export default function DashboardPage() {
  // 1. GỌI LOGIC TỪ HOOK
  const { googleUser, userData, isLoading, handleLogout } = useDashboard();

  // 2. XỬ LÝ CÁC TRẠNG THÁI CHỜ/LỖI
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold mb-4">Chào bạn, bạn chưa có hồ sơ ZPATH</h2>
        <Link href="/discover" className="bg-zpath-gradient text-white px-6 py-3 rounded-full">Khám phá ngay</Link>
      </div>
    );
  }

  // 3. LẮP RÁP GIAO DIỆN CHÍNH
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <img src={googleUser?.user_metadata?.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full" />
            <div>
              <h1 className="text-2xl font-bold">Chào mừng trở lại, {googleUser?.user_metadata?.full_name} 👋</h1>
              <p className="text-gray-600">Nhóm: <span className="font-bold">{userData.personality}</span></p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex gap-2 text-gray-500 hover:text-red-500 transition"><LogOut/> Đăng xuất</button>
        </header>

        {/* DANH SÁCH NGÀNH NGHỀ - Sử dụng Component tái sử dụng */}
        <section>
          <h2 className="text-xl font-bold flex gap-2 mb-6"><Briefcase /> Top Ngành Phù Hợp Nhất</h2>
          <div className="grid gap-6">
            {mockMatchingCareers.map((career, index) => (
              <CareerCard key={career.id} career={career} index={index} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}