import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    // 1. MÁY DÒ LỖI: Kiểm tra xem đã đọc được chìa khóa chưa
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("❌ LỖI: Chưa tìm thấy API Key. Hãy kiểm tra lại file .env.local");
      return NextResponse.json({ reply: "Hệ thống chưa được cấp quyền (Thiếu API Key)." });
    } else {
      console.log("✅ Đã nhận được API Key!");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await request.json();
    const { message, userProfile } = body;

    let totalScore = 0;
    if (userProfile?.scores) {
      totalScore = userProfile.scores.math + userProfile.scores.physics + userProfile.scores.third;
    }

    const systemPrompt = `
      Bạn là ZPATH AI Mentor, chuyên gia hướng nghiệp tại Việt Nam.
      Học sinh: Tính cách ${userProfile?.personality || 'Chưa rõ'}, Điểm: ${totalScore}.
      Câu hỏi: "${message}"
      Hãy trả lời ngắn gọn (dưới 150 chữ), tư vấn thân thiện, cá nhân hóa theo điểm và tính cách.
    `;

    // 2. SỬ DỤNG ĐÚNG TÊN MÔ HÌNH HIỆN HÀNH
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(systemPrompt);
    const aiReply = result.response.text();

    return NextResponse.json({ reply: aiReply });
    
  } catch (error) {
    console.error("❌ Lỗi AI Chi tiết:", error);
    return NextResponse.json({ error: 'AI Mentor đang bận, vui lòng thử lại sau!' }, { status: 500 });
  }
}