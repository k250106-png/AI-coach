'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { sendChatbotMessage } from '@/lib/api';
import { useInterviewContext } from '@/app/context/InterviewContext';

type ChatMessage = {
  role: 'user' | 'bot';
  text: string;
};

function buildSessionId(): string {
  return `site-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatbotWidget() {
  const pathname = usePathname();
  const { language } = useInterviewContext();
  const isInterviewPage = pathname.startsWith('/interview');
  const isUrdu = language === 'ur';
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: 'Hi! I am your interview assistant. Ask me about preparation, STAR answers, or role-specific tips.',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const strings = useMemo(
    () =>
      isUrdu
        ? {
            title: 'انٹرویو اسسٹنٹ',
            placeholder: 'اپنا سوال لکھیں',
            thinking: 'سوچ رہا ہے...',
            intro: 'السلام علیکم! میں آپ کا انٹرویو اسسٹنٹ ہوں۔ STAR جوابات، تیاری، اور رول اسپیسیفک ٹپس پوچھیں۔',
            fallback: 'اس وقت اسسٹنٹ دستیاب نہیں ہے۔ براہِ کرم دوبارہ کوشش کریں۔',
          }
        : {
            title: 'AI Assistant',
            placeholder: 'Ask a question',
            thinking: 'Typing...',
            intro: 'Hi! I am your interview assistant. Ask me about preparation, STAR answers, or role-specific tips.',
            fallback: 'The assistant is temporarily unavailable. Please try again in a moment.',
          },
    [isUrdu]
  );

  useEffect(() => {
    setMessages(prev => {
      if (prev.length !== 1 || prev[0].role !== 'bot' || prev[0].text === strings.intro) {
        return prev;
      }
      return [{ role: 'bot', text: strings.intro }];
    });
  }, [strings.intro]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const effectiveSessionId = useMemo(() => sessionId || buildSessionId(), [sessionId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (!sessionId) {
      setSessionId(effectiveSessionId);
    }

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatbotMessage({
        message: trimmed,
        sessionId: effectiveSessionId,
        languageCode: isUrdu ? 'ur' : 'en',
      });

      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      setMessages(prev => [...prev, { role: 'bot', text: response.reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: strings.fallback,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInterviewPage) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        type="button"
        aria-label="Open AI assistant"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-5 right-5 z-[1400] inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
      >
        {isOpen ? <CloseRoundedIcon /> : <ChatRoundedIcon />}
      </button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-24 right-5 z-[1400] w-[min(100vw-1.5rem,22rem)] max-h-[72vh] rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest font-semibold text-blue-600 dark:text-blue-400">
                  {strings.title}
                </p>
                <h2 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Here to help with FAQs and interview prep.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                aria-label="Close assistant"
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex h-[calc(72vh-164px)] flex-col gap-3 overflow-hidden px-4 py-4 sm:h-[420px]">
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2.5 text-sm leading-6 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white dark:bg-blue-600'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" style={{ animationDelay: '0.1s' }} />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" style={{ animationDelay: '0.2s' }} />
                    </span>
                    <span>{strings.thinking}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
              <label htmlFor="chat-input" className="sr-only">
                {strings.placeholder}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="chat-input"
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  placeholder={strings.placeholder}
                  className="min-h-[40px] flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-blue-900"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <SendRoundedIcon fontSize="small" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
