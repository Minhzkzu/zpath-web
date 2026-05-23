"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Award, 
  Briefcase, 
  ChevronRight, 
  Compass, 
  Loader2, 
  RotateCcw, 
  Save, 
  Sparkles, 
  Trophy 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { RiasecQuestionnaire } from "@/components/zpath/RiasecQuestionnaire";
import { buildRiasecVector } from "@/lib/riasec";
import { 
  getHollandCode, 
  getCareerMatches, 
  RIASEC_DETAILS 
} from "@/lib/riasec_engine";
import { useUserProfile } from "@/hooks/useUserProfile";
import { fetchProfile, upsertProfile } from "@/lib/profile-db";
import { saveProfile as cacheLocal, loadProfile } from "@/types/profile";
import type { RiasecAnswers, RiasecVector, RiasecDimension } from "@/types/zpath";

type PageState = "intro" | "test" | "result";

export default function RiasecPage() {
  const [state, setState] = useState<PageState>("intro");
  const [answers, setAnswers] = useState<RiasecAnswers>({});
  const [vector, setVector] = useState<RiasecVector | null>(null);
  const [saving, setSaving] = useState(false);
  const [hoveredDimension, setHoveredDimension] = useState<RiasecDimension | null>(null);

  const { googleUser: user } = useUserProfile({ requireAuth: false });

  // Kiểm tra xem người dùng đã từng làm test chưa (trong LocalStorage hoặc Profile)
  useEffect(() => {
    const local = loadProfile();
    if (local && local.riasecVector && Object.values(local.riasecVector).some(v => v > 0)) {
      const savedVector = local.riasecVector;
      const savedAnswers = local.riasecAnswers;
      setTimeout(() => {
        setVector(savedVector);
        if (savedAnswers) {
          setAnswers(savedAnswers);
        }
        setState("result");
      }, 0);
    }
  }, []);

  const handleTestComplete = (completedAnswers: RiasecAnswers) => {
    setAnswers(completedAnswers);
    const computedVector = buildRiasecVector(completedAnswers);
    setVector(computedVector);
    setState("result");
    
    // Tự động lưu cache LocalStorage
    const local = loadProfile();
    if (local) {
      cacheLocal({
        ...local,
        riasecAnswers: completedAnswers,
        riasecVector: computedVector
      });
    }
  };

  const handleSyncToProfile = async () => {
    if (!vector) return;
    if (!user) {
      alert("Vui lòng đăng nhập để đồng bộ kết quả này vào hồ sơ cá nhân của bạn.");
      return;
    }

    setSaving(true);
    try {
      // Tải profile hiện tại để tránh đè các trường khác
      const currentProfile = await fetchProfile(user.id);
      const updatedProfile = {
        ...currentProfile,
        riasecAnswers: answers,
        riasecVector: vector
      };

      await upsertProfile(user.id, updatedProfile);
      cacheLocal(updatedProfile);
      alert("Đồng bộ kết quả trắc nghiệm RIASEC vào hồ sơ cá nhân thành công!");
    } catch (error) {
      console.error("Lỗi đồng bộ hồ sơ:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Bạn có muốn hủy kết quả hiện tại và làm lại bài trắc nghiệm không?")) {
      setAnswers({});
      setVector(null);
      setState("test");
    }
  };

  // Tính toán kết quả đối sánh khi có Vector tính cách
  const hollandCode = vector ? getHollandCode(vector) : "";
  const careerMatches = vector ? getCareerMatches(vector) : [];
  
  // Xác định các nhóm tính cách nổi bật nhất (điểm số cao nhất)
  const sortedDimensions = vector
    ? (Object.keys(vector) as RiasecDimension[]).sort((a, b) => vector[b] - vector[a])
    : [];
  const primaryDimension = sortedDimensions[0];

  // Vẽ biểu đồ mạng nhện (Radar Chart) bằng SVG
  const renderRadarChart = () => {
    if (!vector) return null;

    const size = 300;
    const center = size / 2;
    const maxRadius = 100;
    const dimensions = ["R", "I", "A", "S", "E", "C"] as RiasecDimension[];

    // Tọa độ đỉnh 6 trục
    const getCoordinates = (index: number, val: number) => {
      const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2; // Bắt đầu từ trục hướng lên trên (Realistic)
      const r = val * maxRadius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    };

    // Vẽ các vòng đa giác đồng tâm (Grid levels)
    const gridLevels = [0.25, 0.5, 0.75, 1.0];
    const gridPolygons = gridLevels.map((level, levelIdx) => {
      const points = dimensions.map((_, idx) => {
        const coords = getCoordinates(idx, level);
        return `${coords.x},${coords.y}`;
      }).join(" ");
      return (
        <polygon
          key={levelIdx}
          points={points}
          fill="none"
          stroke="hsl(var(--border) / 0.7)"
          strokeWidth="1"
          strokeDasharray={levelIdx === 3 ? "0" : "3,3"}
        />
      );
    });

    // Vẽ 6 đường trục từ tâm
    const axisLines = dimensions.map((d, idx) => {
      const outerCoords = getCoordinates(idx, 1.05);
      const textCoords = getCoordinates(idx, 1.25);
      const isHovered = hoveredDimension === d;

      return (
        <g key={d}>
          <line
            x1={center}
            y1={center}
            x2={outerCoords.x}
            y2={outerCoords.y}
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
          />
          {/* Label ký tự đại diện (R, I, A, S, E, C) */}
          <text
            x={textCoords.x}
            y={textCoords.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-xs font-bold font-display transition-colors duration-200 cursor-pointer ${
              isHovered ? "fill-primary font-extrabold scale-110" : "fill-muted-foreground hover:fill-foreground"
            }`}
            onClick={() => setHoveredDimension(d)}
            onMouseEnter={() => setHoveredDimension(d)}
            onMouseLeave={() => setHoveredDimension(null)}
          >
            {d} ({Math.round(vector[d] * 100)}%)
          </text>
        </g>
      );
    });

    // Đa giác biểu thị kết quả của người dùng (User Polygon)
    const userPoints = dimensions.map((d, idx) => {
      // Chuẩn hóa điểm RIASEC vector (giả lập giá trị tối đa dựa trên điểm cao nhất)
      const maxScore = Math.max(...Object.values(vector));
      const normalizedValue = maxScore > 0 ? vector[d] / maxScore : 0;
      const coords = getCoordinates(idx, Math.max(0.1, normalizedValue));
      return `${coords.x},${coords.y}`;
    }).join(" ");

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="mx-auto max-w-[280px]">
        {/* Background Grids */}
        {gridPolygons}
        
        {/* Axes */}
        {axisLines}

        {/* User Polygon Area */}
        <polygon
          points={userPoints}
          fill="hsla(268, 92%, 60%, 0.25)"
          stroke="hsl(268, 92%, 60%)"
          strokeWidth="3"
          className="transition-all duration-300"
        />

        {/* Cột mốc điểm tròn tương tác trên đa giác kết quả */}
        {dimensions.map((d, idx) => {
          const maxScore = Math.max(...Object.values(vector));
          const normalizedValue = maxScore > 0 ? vector[d] / maxScore : 0;
          const coords = getCoordinates(idx, Math.max(0.1, normalizedValue));
          const detail = RIASEC_DETAILS[d];
          const isHovered = hoveredDimension === d;

          return (
            <circle
              key={d}
              cx={coords.x}
              cy={coords.y}
              r={isHovered ? 7 : 4.5}
              fill={detail.color}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredDimension(d)}
              onMouseLeave={() => setHoveredDimension(null)}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* 1. MÀN HÌNH GIỚI THIỆU (INTRO) */}
      {state === "intro" && (
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="absolute inset-0 bg-mesh opacity-80" />
          <div className="absolute inset-0 grid-dots opacity-40" />
          
          <div className="container-page relative mx-auto text-center max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" /> Trắc nghiệm Holland chuẩn quốc tế
              </div>
              <h1 className="font-display text-4xl font-extrabold leading-[1.1] sm:text-6xl md:text-7xl">
                Khám phá bản thân<br />
                qua trắc nghiệm <span className="text-gradient-hero">RIASEC</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Dựa trên học thuyết chọn nghề của John Holland, RIASEC giúp bạn tìm ra nét tính cách nổi bật nhất 
                và đối sánh chính xác các nhóm ngành đào tạo, môi trường đại học thích hợp nhất với sở thích tự nhiên.
              </p>

              {/* 6 Nhóm Tính Cách Grid */}
              <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-left">
                {Object.entries(RIASEC_DETAILS).map(([key, detail]) => (
                  <div 
                    key={key} 
                    className="rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{ borderColor: detail.borderColor }}
                  >
                    <span 
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white"
                      style={{ backgroundColor: detail.color }}
                    >
                      {key}
                    </span>
                    <h3 className="font-display font-bold text-sm mt-3 text-foreground">{detail.name.split(" ")[0]}</h3>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{detail.description}</p>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-10">
                <Button 
                  onClick={() => setState("test")}
                  size="xl" 
                  variant="hero"
                  className="w-full sm:w-auto animate-pulse-glow"
                >
                  Bắt đầu làm trắc nghiệm (10 câu) <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-xs text-muted-foreground mt-3">Làm bài chỉ mất khoảng 2 phút • Hoàn toàn miễn phí</p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* 2. MÀN HÌNH LÀM TEST (QUESTIONNAIRE) */}
      {state === "test" && (
        <section className="py-16 sm:py-24 bg-muted/20">
          <div className="container-page mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <RiasecQuestionnaire onComplete={handleTestComplete} />
            </motion.div>
          </div>
        </section>
      )}

      {/* 3. MÀN HÌNH KẾT QUẢ (RESULT) */}
      {state === "result" && vector && (
        <section className="py-12 sm:py-20 bg-muted/10">
          <div className="container-page mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-10"
            >
              {/* Header Kết Quả */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card border border-border p-6 sm:p-8 rounded-[2rem] shadow-sm">
                <div className="space-y-3 text-center md:text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Trophy className="h-3.5 w-3.5" /> Kết quả trắc nghiệm
                  </div>
                  <h2 className="font-display text-2xl sm:text-4xl font-extrabold">
                    Mã Holland của bạn: <span className="text-gradient-hero">{hollandCode}</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Đặc tính nổi trội nhất của bạn thuộc về nhóm:{" "}
                    <strong className="text-foreground" style={{ color: RIASEC_DETAILS[primaryDimension]?.color }}>
                      {RIASEC_DETAILS[primaryDimension]?.name}
                    </strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  {user ? (
                    <Button 
                      onClick={handleSyncToProfile} 
                      disabled={saving}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1.5" />}
                      Đồng bộ vào Hồ sơ
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <Link href="/login?redirect=/riasec">Đăng nhập lưu kết quả</Link>
                    </Button>
                  )}
                  
                  <Button asChild variant="hero" className="w-full sm:w-auto">
                    <Link href="/landing">Đi tính tỉ lệ đỗ</Link>
                  </Button>
                </div>
              </div>

              {/* Grid 2 Cột: Biểu đồ & Giải mã Holland */}
              <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
                {/* Cột trái: Biểu đồ SVG Radar */}
                <div className="flex flex-col items-center justify-center bg-card border border-border p-6 rounded-[2rem] text-center shadow-sm">
                  <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" /> Mạng nhện RIASEC 6 chiều
                  </h3>
                  <div className="w-full aspect-square flex items-center justify-center">
                    {renderRadarChart()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 max-w-[240px]">
                    Rà chuột vào các đỉnh biểu đồ hoặc nhãn ký hiệu để hiển thị chi tiết đặc điểm tính cách.
                  </p>
                </div>

                {/* Cột phải: Giải thích nhóm nổi trội */}
                <div className="space-y-4">
                  <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
                    <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" /> Nhóm tính cách nổi trội: {RIASEC_DETAILS[primaryDimension]?.name}
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Description */}
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {RIASEC_DETAILS[primaryDimension]?.description}
                      </p>

                      {/* Traits list */}
                      <div className="bg-muted/40 rounded-2xl p-4">
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-2.5">Đặc trưng tính cách tiêu biểu</h4>
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {RIASEC_DETAILS[primaryDimension]?.traits.map((trait, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: RIASEC_DETAILS[primaryDimension]?.color }} />
                              {trait}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Chế độ xem chi tiết các nhóm tính cách khác */}
                  <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Tất cả 6 nhóm sở thích và điểm số</h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {sortedDimensions.map((d) => {
                        const detail = RIASEC_DETAILS[d];
                        const isHovered = hoveredDimension === d;
                        const score = Math.round(vector[d] * 100);

                        return (
                          <div 
                            key={d}
                            onMouseEnter={() => setHoveredDimension(d)}
                            onMouseLeave={() => setHoveredDimension(null)}
                            onClick={() => setHoveredDimension(d)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                              isHovered 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-border bg-muted/20 hover:border-border/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span 
                                className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-black text-white"
                                style={{ backgroundColor: detail.color }}
                              >
                                {d}
                              </span>
                              <span className="text-xs font-bold text-foreground">{detail.name.split(" ")[0]}</span>
                            </div>
                            <span className="text-xs font-extrabold text-muted-foreground">{score}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Đối sánh nghề nghiệp gợi ý */}
              <div className="bg-card border border-border p-6 sm:p-8 rounded-[2rem] shadow-sm">
                <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                  <Briefcase className="h-5.5 w-5.5 text-primary" /> Nghề nghiệp định hướng tương thích hàng đầu
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {careerMatches.map((career) => (
                    <div 
                      key={career.careerId}
                      className="border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="font-display font-bold text-base text-foreground">{career.title}</h4>
                          <span className="inline-flex px-2 py-1 rounded bg-secondary/15 text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                            Match {career.matchScore}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Holland Code:</span>
                          <span className="inline-flex gap-1">
                            {career.hollandCode.split("").map((char, idx) => (
                              <span 
                                key={idx} 
                                className="text-[9px] font-black text-white px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: RIASEC_DETAILS[char as RiasecDimension]?.color }}
                              >
                                {char}
                              </span>
                            ))}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                          {career.description}
                        </p>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Được đào tạo ở các trường Top</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 text-sm font-bold text-muted-foreground transition-all"
                >
                  <RotateCcw className="h-4 w-4" /> Làm lại trắc nghiệm
                </button>
                
                <Button asChild variant="hero" size="lg">
                  <Link href="/landing">Import và tính tỉ lệ đỗ ngay <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </main>
  );
}
