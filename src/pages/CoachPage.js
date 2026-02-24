/**
 * Coach Page — AI Nutrition Coach
 * Chat with a personalized nutrition coach that knows your profile, foods, and progress.
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, Sparkles } from "lucide-react";
import { M3Card, M3CardContent, M3Button, M3TextField, Main } from "../components/common";
import { buildUserContext, sendCoachMessage } from "../services/aiCoachService";
import "./CoachPage.css";

const SUGGESTED_PROMPTS = [
  "How am I doing today?",
  "Suggest a healthy dinner within my calories",
  "What can I improve in my eating habits?",
  "Give me tips to hit my protein goal",
];

const STORAGE_KEY = "nutrinoteplus_coach_messages";
const MAX_STORED_MESSAGES = 20;

function loadStoredMessages() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(-MAX_STORED_MESSAGES) : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveMessages(messages) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
  } catch {
    // ignore
  }
}

function CoachPage() {
  const [messages, setMessages] = useState(loadStoredMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    setInput("");
    setError(null);

    const userMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await sendCoachMessage(trimmed, buildUserContext());
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleSuggestedClick = (prompt) => {
    handleSend(prompt);
  };

  const hasMessages = messages.length > 0;

  return (
    <Main className="coach-page">
      <header className="coach-header">
        <div className="coach-header__icon" aria-hidden>
          <MessageCircle size={24} strokeWidth={2} />
        </div>
        <div>
          <h1 className="coach-header__title">AI Nutrition Coach</h1>
          <p className="coach-header__subtitle">
            Personalized advice based on your logs and goals
          </p>
        </div>
      </header>

      <div className="coach-content">
        <M3Card variant="filled" size="large" className="coach-card">
          <M3CardContent>
            <div className="coach-messages-wrap" ref={listRef}>
              {!hasMessages && !loading && (
                <div className="coach-welcome">
                  <Sparkles
                    size={40}
                    className="coach-welcome__icon"
                    aria-hidden
                  />
                  <p className="coach-welcome__text">
                    Ask me anything about your nutrition. I know your profile,
                    today&apos;s foods, calorie progress, and goals.
                  </p>
                  <p className="coach-welcome__hint">
                    Try one of these to get started:
                  </p>
                  <div className="coach-suggestions">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="coach-suggestion"
                        onClick={() => handleSuggestedClick(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="coach-messages">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`coach-message coach-message--${msg.role}`}
                    >
                      <div className="coach-message__content">{msg.content}</div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="coach-message coach-message--assistant coach-message--loading"
                    >
                      <Loader2
                        size={20}
                        className="coach-message__loader"
                        aria-hidden
                      />
                      <span>Thinking...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {error && (
              <div className="coach-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="coach-input-wrap">
              <M3TextField
                variant="outlined"
                placeholder="Ask your nutrition coach..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                fullWidth
                className="coach-input"
                multiline
                rows={1}
                maxLength={2000}
              />
              <M3Button
                type="submit"
                variant="filled"
                color="primary"
                iconButton
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="coach-send-btn"
              >
                {loading ? (
                  <Loader2 size={20} className="coach-send-spinner" />
                ) : (
                  <Send size={20} />
                )}
              </M3Button>
            </form>
          </M3CardContent>
        </M3Card>
      </div>
    </Main>
  );
}

export default CoachPage;
