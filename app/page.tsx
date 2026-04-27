'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Brain, Target, Compass, Sparkles, Map } from 'lucide-react';

export default function LandingPage() {
  // Các hiệu ứng chuyển động cơ bản
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="bg-white">
      
      {/* 1. HERO SECTION (Khu vực đập vào mắt đầu tiên) */}
      <section className="relative pt-20 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        {/* Background trang trí */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50 to-white -z-10 blur-3xl"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-zpath-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-zpath-secondary/10 rounded-full blur-3xl"></div>

        <motion.div initial="initial" animate="animate" variants={staggerContainer} className="max-w-4xl mx-auto z-10">
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-zpath-primary font-medium text-sm mb-6 border border-blue-100">
            <Sparkles size={16} /> <span>Nền tảng Hướng nghiệp AI số 1 Việt Nam</span>
          </motion.div>
          
          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-black text-zpath-dark tracking-tight mb-6 leading-tight">
            Đừng để tương lai <br className="hidden md:block" /> là một <span className="text-transparent bg-clip-text bg-zpath-gradient">ẩn số.</span>
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Hành trình trọn vẹn giúp học sinh THPT: <strong>Hiểu mình - Hiểu ngành - Chọn đúng tương lai.</strong> Dữ liệu chuẩn xác, AI tư vấn 1-1 cá nhân hóa.
          </motion.p>
          
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/discover" className="bg-zpath-gradient text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all w-full sm:w-auto justify-center">
              Bắt đầu hành trình <ArrowRight size={20} />
            </Link>
            <Link href="/dashboard" className="px-8 py-4 rounded-full font-bold text-lg text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all w-full sm:w-auto justify-center">
              Xem Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. CÁC TÍNH NĂNG CỐT LÕI (Features) */}
      <section className="py-24 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zpath-dark mb-4">Vì sao chọn ZPATH?</h2>
            <p className="text-gray-600">Chúng tôi không chỉ cung cấp dữ liệu, chúng tôi thiết kế lộ trình cho bạn.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-zpath-primary">
                <Brain size={28} />
              </div>
              <h3 className="text-xl font-bold text-zpath-dark mb-3">Hiểu sâu bản thân</h3>
              <p className="text-gray-600 leading-relaxed">Hệ thống bài test chuẩn quốc tế giúp khám phá tính cách, sở thích và năng lực thực sự của bạn.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-zpath-secondary">
                <Target size={28} />
              </div>
              <h3 className="text-xl font-bold text-zpath-dark mb-3">Matching thông minh</h3>
              <p className="text-gray-600 leading-relaxed">Thuật toán đối chiếu hồ sơ của bạn với yêu cầu của hàng trăm ngành nghề và điểm chuẩn các trường ĐH.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center mb-6 text-zpath-accent">
                <Map size={28} />
              </div>
              <h3 className="text-xl font-bold text-zpath-dark mb-3">AI Mentor 24/7</h3>
              <p className="text-gray-600 leading-relaxed">Trợ lý ảo AI luôn sẵn sàng giải đáp mọi thắc mắc về ngành, trường và cơ hội việc làm dựa trên data thật.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CTA CUỐI TRANG */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto bg-zpath-dark rounded-[3rem] p-12 relative overflow-hidden">
          {/* Vệt sáng trang trí */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-zpath-primary/30 rounded-full blur-3xl"></div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Sẵn sàng để thiết kế tương lai?</h2>
          <p className="text-gray-300 mb-8 text-lg relative z-10">Tham gia cùng hàng ngàn học sinh đã tìm thấy lộ trình của mình trên ZPATH.</p>
          <Link href="/discover" className="inline-flex bg-zpath-gradient text-white px-8 py-4 rounded-full font-bold text-lg items-center gap-2 hover:scale-105 transition-transform shadow-xl relative z-10">
            Khám phá ngay <Compass size={20} />
          </Link>
        </div>
      </section>

    </div>
  );
}