import { RiasecVector, RIASEC_DIMENSIONS, RiasecDimension } from "@/types/zpath";

export interface RiasecDetail {
  name: string;
  englishName: string;
  description: string;
  traits: string[];
  careers: string[];
  color: string; // HSL value or hex code
  bgColor: string; // Background tint color
  borderColor: string;
}

export const RIASEC_DETAILS: Record<RiasecDimension, RiasecDetail> = {
  R: {
    name: "Kỹ thuật (Realistic)",
    englishName: "The Doers",
    description: "Thích làm việc thực tế với máy móc, thiết bị, phần cứng công nghệ hoặc công cụ vật lý. Ưu tiên hành động, sửa chữa và tối ưu hóa quy trình kỹ thuật.",
    traits: [
      "Thực tế & Hành động trực tiếp",
      "Có tư duy kỹ thuật & Cơ học tốt",
      "Thích làm việc độc lập hoặc ngoài trời",
      "Thẳng thắn, thực tiễn và kiên trì"
    ],
    careers: ["Kỹ sư Phần cứng", "Kỹ sư AI/IoT", "Kỹ thuật viên Mạng", "Nhà nông nghiệp công nghệ cao"],
    color: "hsl(16, 100%, 60%)", // Cam san hô
    bgColor: "hsl(16, 100%, 97%)",
    borderColor: "hsl(16, 100%, 90%)"
  },
  I: {
    name: "Nghiên cứu (Investigative)",
    englishName: "The Thinkers",
    description: "Yêu thích sự tò mò, khám phá khoa học, giải quyết các vấn đề hóc búa thông qua phân tích dữ liệu và tư duy logic chiều sâu.",
    traits: [
      "Tư duy logic & Phân tích chuyên sâu",
      "Tò mò khoa học & Đam mê công nghệ mới",
      "Làm việc độc lập, kiên định",
      "Thích tối ưu hóa thuật toán và dữ liệu"
    ],
    careers: ["Nhà khoa học dữ liệu", "Kỹ sư thuật toán", "Chuyên gia bảo mật", "Nhà nghiên cứu AI"],
    color: "hsl(210, 100%, 55%)", // Xanh dương điện
    bgColor: "hsl(210, 100%, 97%)",
    borderColor: "hsl(210, 100%, 90%)"
  },
  A: {
    name: "Nghệ thuật (Artistic)",
    englishName: "The Creators",
    description: "Thích sự tự do, sáng tạo những ý tưởng đột phá, thiết kế giao diện sáng tạo hoặc phát triển sản phẩm mang đậm tính thẩm mỹ độc bản.",
    traits: [
      "Sáng tạo không giới hạn & Phóng khoáng",
      "Khả năng nhạy cảm thẩm mỹ & UI/UX rất cao",
      "Thích làm việc tự do, phi truyền thống",
      "Nhạy bén, giàu trực giác và cảm xúc"
    ],
    careers: ["UI/UX Designer", "Product Designer", "Content Creator", "Creative Director"],
    color: "hsl(295, 85%, 60%)", // Hồng/Tím cá tính
    bgColor: "hsl(295, 85%, 98%)",
    borderColor: "hsl(295, 85%, 92%)"
  },
  S: {
    name: "Xã hội (Social)",
    englishName: "The Helpers",
    description: "Tràn đầy năng lượng khi được đồng hành, tư vấn hướng nghiệp, giảng dạy hoặc hỗ trợ cộng đồng. Có chỉ số EQ vượt trội và khả năng lắng nghe.",
    traits: [
      "Thấu cảm tốt & Biết lắng nghe",
      "Kỹ năng sư phạm & Truyền đạt xuất sắc",
      "Thích làm việc đội nhóm & Cộng đồng",
      "Thân thiện, ấm áp và đáng tin cậy"
    ],
    careers: ["Chuyên viên hướng nghiệp", "Giảng viên công nghệ", "Quản lý quan hệ khách hàng", "Nhân sự"],
    color: "hsl(45, 100%, 48%)", // Vàng mật ong ấm áp
    bgColor: "hsl(45, 100%, 97%)",
    borderColor: "hsl(45, 100%, 90%)"
  },
  E: {
    name: "Khởi nghiệp (Enterprising)",
    englishName: "The Persuaders",
    description: "Có tố chất thủ lĩnh, đam mê dẫn dắt dự án từ con số không, thuyết phục mọi người theo định hướng và tự tin đưa ra quyết định quyết đoán.",
    traits: [
      "Tố chất lãnh đạo & Quản lý dự án",
      "Kỹ năng thuyết phục & Đàm phán vượt trội",
      "Sẵn sàng đón nhận thử thách và rủi ro",
      "Năng động, tham vọng và hướng ngoại"
    ],
    careers: ["Product Manager", "Startup Founder", "Chuyên viên BizDev", "Giám đốc dự án"],
    color: "hsl(145, 80%, 45%)", // Xanh lục lục bảo
    bgColor: "hsl(145, 80%, 97%)",
    borderColor: "hsl(145, 80%, 90%)"
  },
  C: {
    name: "Nghiệp vụ (Conventional)",
    englishName: "The Organizers",
    description: "Ưa thích làm việc ngăn nắp, có cấu trúc quy trình chặt chẽ, tối ưu tính chính xác của dữ liệu và hệ thống kiểm soát chất lượng.",
    traits: [
      "Ngăn nắp, tỉ mỉ & Cực kỳ chi tiết",
      "Tuân thủ quy trình & Thích sự ổn định",
      "Kỹ năng phân tích hệ thống & Kiểm thử tốt",
      "Thực tế, kỷ luật và có trách nhiệm cao"
    ],
    careers: ["Business Analyst (BA)", "Chuyên viên kiểm thử (QA)", "Kế toán / Phân tích tài chính", "Quản trị cơ sở dữ liệu"],
    color: "hsl(240, 20%, 50%)", // Xám Slate ngăn nắp
    bgColor: "hsl(240, 20%, 97%)",
    borderColor: "hsl(240, 20%, 90%)"
  }
};

export interface CareerProfile {
  id: string;
  title: string;
  vector: RiasecVector;
  description: string;
  hollandCode: string;
}

export const CAREER_PROFILES: CareerProfile[] = [
  {
    id: "ai-engineer",
    title: "Kỹ sư Trí tuệ Nhân tạo (AI Engineer)",
    vector: { R: 0.6, I: 1.0, A: 0.2, S: 0.1, E: 0.3, C: 0.5 },
    description: "Nghiên cứu thuật toán sâu (I), tối ưu cấu trúc dữ liệu (C) kết hợp thực thi kỹ thuật phần cứng/phần mềm (R).",
    hollandCode: "IRC"
  },
  {
    id: "data-analyst",
    title: "Chuyên viên Phân tích Dữ liệu (Data Analyst)",
    vector: { R: 0.2, I: 0.9, A: 0.1, S: 0.2, E: 0.4, C: 0.9 },
    description: "Đại diện tiêu biểu cho sự kết hợp giữa kỹ năng tư duy phân tích chiều sâu (I) và tổ chức dữ liệu cực kỳ quy củ, chuẩn xác (C).",
    hollandCode: "ICE"
  },
  {
    id: "ui-ux-designer",
    title: "Thiết kế Giao diện Trải nghiệm (UI/UX Designer)",
    vector: { R: 0.2, I: 0.4, A: 1.0, S: 0.6, E: 0.4, C: 0.3 },
    description: "Môi trường hoàn hảo để phát huy tư duy thẩm mỹ đột phá (A) và sự thấu cảm cao đối với hành vi và tâm lý của người dùng (S).",
    hollandCode: "ASE"
  },
  {
    id: "product-manager",
    title: "Quản trị viên Sản phẩm (Product Manager)",
    vector: { R: 0.1, I: 0.5, A: 0.4, S: 0.7, E: 1.0, C: 0.6 },
    description: "Yêu cầu cao nhất ở năng lực thủ lĩnh điều hành chiến lược (E), kết nối hợp tác (S) và kiểm soát tiến độ, quy trình (C).",
    hollandCode: "ESC"
  }
];

// Hàm tính Holland Code (Ví dụ: "ISA", "ASE") lấy ra tối đa 3 ký tự có điểm cao nhất
export function getHollandCode(vector: RiasecVector): string {
  // Sắp xếp các chiều tính cách giảm dần theo điểm số
  const sorted = RIASEC_DIMENSIONS
    .map(d => ({ dimension: d, value: vector[d] }))
    .sort((a, b) => b.value - a.value);
  
  // Lấy ra các chiều có điểm đáng kể (lấy top 3)
  return sorted.slice(0, 3).map(x => x.dimension).join("");
}

// Thuật toán Cosine Similarity để đo độ tương đồng
export function calculateCosineSimilarity(v1: RiasecVector, v2: RiasecVector): number {
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (const d of RIASEC_DIMENSIONS) {
    dotProduct += v1[d] * v2[d];
    magnitude1 += v1[d] * v1[d];
    magnitude2 += v2[d] * v2[d];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (magnitude1 * magnitude2);
}

export interface RiasecMatchResult {
  careerId: string;
  title: string;
  matchScore: number; // Điểm 0 - 100
  description: string;
  hollandCode: string;
}

// Hàm đối sánh vector tính cách học sinh với thư viện nghề nghiệp tiêu biểu
export function getCareerMatches(userVector: RiasecVector): RiasecMatchResult[] {
  return CAREER_PROFILES.map(career => {
    const similarity = calculateCosineSimilarity(userVector, career.vector);
    
    // Ánh xạ độ tương đồng về dạng phần trăm trực quan [45% - 99%] để trải nghiệm người dùng tích cực hơn
    const rawPercent = Math.round(((similarity + 1) / 2) * 100);
    const score = Math.max(45, Math.min(99, rawPercent));

    return {
      careerId: career.id,
      title: career.title,
      matchScore: score,
      description: career.description,
      hollandCode: career.hollandCode
    };
  }).sort((a, b) => b.matchScore - a.matchScore); // Xếp hạng giảm dần theo độ phù hợp
}
