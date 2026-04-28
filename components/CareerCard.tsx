import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import type { CareerMatch } from '@/lib/types';

// Định nghĩa kiểu dữ liệu cho dễ quản lý
interface CareerCardProps {
  career: CareerMatch;
  index: number;
}

export function CareerCard({ career, index }: CareerCardProps) {
  return (
    <motion.div 
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
  );
}