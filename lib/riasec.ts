import { RiasecAnswers, RIASEC_DIMENSIONS, RiasecDimension, RiasecVector, RiasecQuestionId } from "@/types/zpath";

export interface RiasecQuestion {
    id: RiasecQuestionId;
    question: string;
    weights: Record<RiasecDimension, number>;
}

export const riasecQuestions: RiasecQuestion[] = [
    {
      id: "q1",
      question: "Tôi thích làm việc thực tế với các công cụ vật lý, tự tay lắp ráp phần cứng hoặc sửa chữa các thiết bị.",
      weights: { R: 1.0, I: 0.4, A: 0.0, S: 0.0, E: 0.1, C: 0.3 }
    },
    {
      id: "q2",
      question: "Tôi thường dành hàng giờ để đào sâu phân tích logic, tối ưu hóa thuật toán hoặc giải quyết các bài toán hóc búa.",
      weights: { R: 0.3, I: 1.0, A: 0.1, S: 0.0, E: 0.1, C: 0.4 }
    },
    {
      id: "q3",
      question: "Tôi thích sự tự do trong việc lên ý tưởng cho các thiết kế sáng tạo, sản phẩm mới hoặc các dự án mang tính nghệ thuật và phá cách.",
      weights: { R: 0.0, I: 0.3, A: 1.0, S: 0.2, E: 0.4, C: 0.0 }
    },
    {
      id: "q4",
      question: "Tôi cảm thấy tràn đầy năng lượng khi được đứng lớp giảng dạy, truyền đạt kiến thức hoặc kèm cặp người khác tiến bộ.",
      weights: { R: 0.0, I: 0.2, A: 0.3, S: 1.0, E: 0.5, C: 0.2 }
    },
    {
      id: "q5",
      question: "Tôi hoàn toàn tự tin khi đảm nhận vai trò quản lý dự án, lãnh đạo nhóm và thuyết phục người khác làm theo định hướng của mình.",
      weights: { R: 0.0, I: 0.2, A: 0.2, S: 0.6, E: 1.0, C: 0.3 }
    },
    {
      id: "q6",
      question: "Tôi thích tổ chức dữ liệu một cách có cấu trúc chặt chẽ, lên kế hoạch chi tiết và đảm bảo mọi thứ tuân thủ đúng quy trình.",
      weights: { R: 0.2, I: 0.5, A: 0.0, S: 0.1, E: 0.3, C: 1.0 }
    },
    {
      id: "q7",
      question: "Tôi hứng thú với việc nghiên cứu công nghệ mới, sau đó tự tay thử nghiệm và triển khai các hệ thống đó vào môi trường thực tế.",
      weights: { R: 0.8, I: 0.9, A: 0.1, S: 0.0, E: 0.3, C: 0.4 }
    },
    {
      id: "q8",
      question: "Tôi thích việc tư vấn, định hướng lộ trình cho người khác và giúp họ tìm ra giải pháp tối ưu cho các vấn đề học tập hoặc cá nhân.",
      weights: { R: 0.0, I: 0.2, A: 0.1, S: 0.9, E: 0.7, C: 0.2 }
    },
    {
      id: "q9",
      question: "Tôi thích làm việc trong môi trường yêu cầu sự tỉ mỉ, đánh giá chất lượng sản phẩm dựa trên các bộ testcase, tiêu chuẩn hoặc cơ sở dữ liệu có sẵn.",
      weights: { R: 0.3, I: 0.7, A: 0.0, S: 0.0, E: 0.1, C: 0.9 }
    },
    {
      id: "q10",
      question: "Tôi hứng thú với việc khởi xướng một giải pháp/dự án mới từ con số không, trình bày về tiềm năng của nó và kêu gọi sự tham gia của mọi người.",
      weights: { R: 0.1, I: 0.4, A: 0.7, S: 0.5, E: 0.9, C: 0.1 }
    }
  ] as const;

export function buildRiasecVector(answers: RiasecAnswers): RiasecVector {
    const result: RiasecVector = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    for (const question of riasecQuestions) {
        const userAnswer = answers[question.id] || 0;
        for (const d of RIASEC_DIMENSIONS) {
            result[d] += userAnswer * question.weights[d];
        }
    }
    return normalizeRiasecVector(result);
}
export function normalizeRiasecVector(vector: RiasecVector): RiasecVector {
    const sum = RIASEC_DIMENSIONS.reduce((sum, d) => sum + vector[d], 0);
    const result: RiasecVector = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    if (sum == 0) return result;
    for (const d of RIASEC_DIMENSIONS)
    {
        result[d] = vector[d] / sum;
    }
    return result;
}
