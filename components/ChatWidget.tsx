'use client';

import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ExternalLink, Send, X } from 'lucide-react';

import { useUserProfile } from '@/hooks/useUserProfile';
import { useChatMentor } from '@/hooks/useChatMentor';

export const ChatWidget = () => {
  const { userProfile } = useUserProfile({ requireAuth: false });
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  const initial = useMemo(
    () => [
      {
        role: 'ai' as const,
        content:
          'Mình là ZPATH AI. Bạn có thể hỏi về thông tin tuyển sinh, phương thức xét tuyển, hoặc điểm chuẩn của các trường (theo dữ liệu nội bộ).',
      },
    ],
    []
  );

  const { messages, isLoading, citations, sendMessage, setMessages } = useChatMentor({
    initialMessages: initial,
  });

  const handleToggle = () => setIsOpen((v) => !v);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isLoading) return;

    setDraft('');
    await sendMessage({ message: text, userProfile });

    queueMicrotask(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  const handleClear = () => setMessages(initial);

  return (
    <div className="fixed bottom-4 right-4 z-[60] pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-3"
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-zpath-gradient text-white flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-bold text-zpath-dark">Hỏi tuyển sinh</div>
                  <div className="text-xs text-gray-500">Dựa trên dữ liệu nội bộ</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  Xóa
                </button>
                <button
                  type="button"
                  onClick={handleToggle}
                  className="p-2 rounded-lg hover:bg-gray-50 text-gray-600"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="h-[calc(520px-56px-64px)] p-4 overflow-y-auto space-y-3" ref={listRef}>
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      m.role === 'user'
                        ? 'bg-blue-50 text-zpath-dark rounded-tr-none'
                        : 'bg-gray-50 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-600 flex gap-2 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}

              {citations.length > 0 && (
                <div className="pt-1">
                  <div className="text-[11px] font-semibold text-gray-500 mb-2">Nguồn tham khảo</div>
                  <div className="space-y-1">
                    {citations.slice(0, 3).map((c, i) => (
                      <div key={`${c.title}-${i}`} className="text-[12px] text-gray-700 flex items-center gap-2">
                        <span className="truncate">{c.title}</span>
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 inline-flex items-center gap-1 text-zpath-primary hover:underline"
                          >
                            <ExternalLink size={14} />
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-16 px-3 py-3 border-t border-gray-100 bg-white flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="VD: Điểm chuẩn CNTT trường X năm 2024?"
                className="flex-1 bg-gray-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-zpath-primary text-sm"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim() || isLoading}
                className="bg-zpath-primary text-white h-11 w-11 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"
                aria-label="Gửi"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={handleToggle}
        className="w-14 h-14 rounded-2xl bg-zpath-gradient text-white shadow-lg flex items-center justify-center hover:opacity-95 active:scale-[0.98] transition"
        aria-label="Mở chat tuyển sinh"
      >
        <Bot size={22} />
      </button>
    </div>
  );
};

