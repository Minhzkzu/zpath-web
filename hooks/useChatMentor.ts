'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type ChatMentorRole = 'user' | 'ai';

export type ChatMentorMessage = {
  role: ChatMentorRole;
  content: string;
};

export type ChatMentorCitation = {
  title: string;
  url?: string | null;
};

export const useChatMentor = (args?: { initialMessages?: ChatMentorMessage[] }) => {
  const [messages, setMessages] = useState<ChatMentorMessage[]>(args?.initialMessages ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [citations, setCitations] = useState<ChatMentorCitation[]>([]);
  const messagesRef = useRef<ChatMentorMessage[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const canSend = useMemo(() => !isLoading, [isLoading]);

  const sendMessage = useCallback(async (payload: { message: string; userProfile?: unknown }) => {
    const text = payload.message.trim();
    if (!text) return;

    const history = [...messagesRef.current, { role: 'user' as const, content: text }].slice(-12);
    setMessages(history);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, userProfile: payload.userProfile }),
      });

      const data = (await res.json()) as { reply?: string; citations?: ChatMentorCitation[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error || `AI Mentor lỗi (${res.status}).`);
      }

      setMessages((prev) => [...prev, { role: 'ai', content: data.reply ?? '' }]);
      setCitations(data.citations ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xin lỗi, hệ thống đang bận. Bạn thử lại sau nhé!';
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: msg },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setMessages(args?.initialMessages ?? []);
    setCitations([]);
    setIsLoading(false);
  }, [args?.initialMessages]);

  return { messages, isLoading, canSend, citations, sendMessage, reset, setMessages };
};

