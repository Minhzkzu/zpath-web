-- Bổ sung các cột lưu trữ RIASEC và thành tích học thuật mới vào bảng profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS riasec_answers jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS riasec_vector jsonb DEFAULT '{"R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0}'::jsonb,
  ADD COLUMN IF NOT EXISTS sat double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hsg_province text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS hsg_national text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS stem_award text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS financial_level double precision DEFAULT 0;

-- Nhận xét và tài liệu hóa các cột mới
COMMENT ON COLUMN public.profiles.riasec_answers IS 'Lịch sử câu trả lời trắc nghiệm tính cách RIASEC dạng JSON';
COMMENT ON COLUMN public.profiles.riasec_vector IS 'Tỷ lệ vector tính cách RIASEC 6 chiều đã được chuẩn hóa';
COMMENT ON COLUMN public.profiles.sat IS 'Điểm thi chứng chỉ SAT của học sinh';
COMMENT ON COLUMN public.profiles.hsg_province IS 'Giải học sinh giỏi cấp tỉnh/thành phố';
COMMENT ON COLUMN public.profiles.hsg_national IS 'Giải học sinh giỏi cấp quốc gia';
COMMENT ON COLUMN public.profiles.stem_award IS 'Giải khoa học kỹ thuật (STEM) các cấp';
COMMENT ON COLUMN public.profiles.financial_level IS 'Mức ngân sách tài chính tối đa của học sinh cho mỗi kỳ học';
