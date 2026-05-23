"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Brain, RotateCcw } from "lucide-react";
import { riasecQuestions } from "@/lib/riasec";
import type { RiasecAnswers } from "@/types/zpath";

interface RiasecQuestionnaireProps {
  onComplete: (answers: RiasecAnswers) => void;
}

const LIKERT_OPTIONS = [
  { value: 1, label: "Hoàn toàn phản đối", color: "hover:border-destructive/60 hover:bg-destructive/5 text-destructive border-border", activeColor: "border-destructive bg-destructive text-white shadow-md shadow-destructive/20" },
  { value: 2, label: "Không đồng ý", color: "hover:border-orange-400/60 hover:bg-orange-50 text-orange-600 border-border", activeColor: "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20" },
  { value: 3, label: "Phân vân", color: "hover:border-muted-foreground/40 hover:bg-muted text-muted-foreground border-border", activeColor: "border-muted-foreground bg-muted-foreground text-white shadow-md shadow-muted-foreground/20" },
  { value: 4, label: "Đồng ý", color: "hover:border-primary/60 hover:bg-primary/5 text-primary border-border", activeColor: "border-primary bg-primary text-white shadow-md shadow-primary/20" },
  { value: 5, label: "Hoàn toàn đồng ý", color: "hover:border-emerald-500/60 hover:bg-emerald-50 text-emerald-600 border-border", activeColor: "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20" },
];

export function RiasecQuestionnaire({ onComplete }: RiasecQuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<RiasecAnswers>({});
  const [direction, setDirection] = useState(1); // 1: next, -1: prev

  const currentQuestion = riasecQuestions[currentIndex];
  const progress = ((currentIndex + 1) / riasecQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (score: number) => {
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: score,
    };
    setAnswers(updatedAnswers);

    // Tự động chuyển câu sau 250ms để tạo cảm giác tự nhiên
    setTimeout(() => {
      if (currentIndex < riasecQuestions.length - 1) {
        setDirection(1);
        setCurrentIndex(currentIndex + 1);
      } else {
        // Đã trả lời xong toàn bộ 10 câu
        onComplete(updatedAnswers);
      }
    }, 200);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < riasecQuestions.length - 1 && answers[currentQuestion.id] !== undefined) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReset = () => {
    if (confirm("Bạn có muốn làm lại từ đầu không?")) {
      setAnswers({});
      setCurrentIndex(0);
      setDirection(1);
    }
  };

  // Định nghĩa hiệu ứng chuyển câu trượt ngang
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl border-2 border-border bg-card p-6 shadow-md sm:p-8">
      {/* HEADER: Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-primary mb-3">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
            <Brain className="h-3.5 w-3.5" /> Câu hỏi {currentIndex + 1} / {riasecQuestions.length}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% Hoàn thành</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-primary transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* QUESTION CONTENT WITH SLIDE ANIMATION */}
      <div className="relative min-h-[160px] flex flex-col justify-center py-4 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-1 block">
              Khảo sát sở thích nghề nghiệp
            </span>
            <h2 className="font-display text-xl md:text-2xl font-bold leading-snug text-foreground">
              {currentQuestion.question}
            </h2>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* LIKERT SELECTOR BUTTONS */}
      <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-5 sm:gap-3">
        {LIKERT_OPTIONS.map((option) => {
          const isSelected = answers[currentQuestion.id] === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`flex items-center justify-between sm:flex-col sm:justify-center rounded-2xl border-2 px-4 py-3.5 sm:py-5 text-left sm:text-center text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isSelected ? option.activeColor : option.color
              }`}
            >
              <span className="sm:mb-2 text-base font-bold sm:text-xl">{option.value}</span>
              <span className="text-xs sm:text-[11px] leading-tight font-medium sm:max-w-[100px] text-right sm:text-center">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* FOOTER NAVIGATION CONTROL */}
      <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>

        {answeredCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Làm lại
          </button>
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex === riasecQuestions.length - 1 || answers[currentQuestion.id] === undefined}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-primary hover:text-primary-glow disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          Tiếp theo <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
