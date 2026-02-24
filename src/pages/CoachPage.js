/**
 * Coach Page — AI Nutrition Coach
 * Chat with a personalized nutrition coach that knows your profile, foods, and progress.
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  Droplet,
  Target,
  Flame,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { M3Card, M3CardContent, M3Button, M3TextField, Main } from "../components/common";
import { buildUserContext, sendCoachMessage } from "../services/aiCoachService";
import "./CoachPage.css";

const DEFAULT_PROMPTS = [
  "How am I doing today?",
  "Suggest a healthy dinner within my calories",
  "What can I improve in my eating habits?",
  "Give me tips to hit my protein goal",
];

function getSuggestedPrompts() {
  try {
    const ctx = buildUserContext();
    const prompts = [];
    const hour = new Date().getHours();
    const isEvening = hour >= 16;
    const hasNoFoods = !ctx.today?.foods?.length;
    const remaining = ctx.today?.remaining ?? 0;
    const macros = ctx.today?.macros ?? {};
    const goals = ctx.macroGoals ?? {};
    const proteinGoal = goals.protein ?? 0;
    const proteinNow = macros.protein ?? 0;
    const waterOz = ctx.waterOz ?? 0;
    const streak = ctx.streak ?? 0;
    const hasWeightTrend = ctx.weightTrend?.length >= 2;

    if (hasNoFoods) {
      prompts.push("What should I focus on when logging my first meals?");
    }
    if (proteinGoal > 0 && proteinNow < proteinGoal * 0.6) {
      prompts.push("How can I hit my protein goal today?");
    }
    if (isEvening && remaining > 200) {
      prompts.push("Suggest a dinner that fits my remaining calories");
    }
    if (waterOz < 32) {
      prompts.push("Tips for staying hydrated?");
    }
    if (hasWeightTrend && ctx.profile?.goal) {
      prompts.push("How does my progress look?");
    }
    if (streak >= 5) {
      prompts.push("How can I keep my streak going?");
    }

    if (prompts.length === 0) prompts.push(...DEFAULT_PROMPTS);
    return prompts.slice(0, 4);
  } catch {
    return DEFAULT_PROMPTS.slice(0, 4);
  }
}

function getPromptIcon(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("protein") || p.includes("goal")) return Target;
  if (p.includes("dinner") || p.includes("meal")) return UtensilsCrossed;
  if (p.includes("hydrat") || p.includes("water")) return Droplet;
  if (p.includes("progress") || p.includes("look")) return TrendingUp;
  if (p.includes("streak")) return Flame;
  if (p.includes("focus") || p.includes("first")) return HelpCircle;
  return MessageCircle;
}

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
      const context = buildUserContext();
      const reply = await sendCoachMessage(trimmed, context, messages);
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
                  <div className="coach-welcome__icon-container">
                    <span className="coach-welcome__decoration coach-welcome__decoration--1" aria-hidden />
                    <span className="coach-welcome__decoration coach-welcome__decoration--2" aria-hidden />
                    <span className="coach-welcome__decoration coach-welcome__decoration--3" aria-hidden />
                    <div className="coach-welcome__icon-bg">
                      <Sparkles size={36} className="coach-welcome__icon" aria-hidden />
                    </div>
                  </div>
                  <h2 className="coach-welcome__title">Your nutrition coach</h2>
                  <p className="coach-welcome__text">
                    Ask me anything about your nutrition. I know your profile,
                    today&apos;s foods, calorie progress, and goals.
                  </p>
                  <p className="coach-welcome__hint">
                    Try one of these to get started:
                  </p>
                  <div className="coach-suggestions">
                    {getSuggestedPrompts().map((prompt) => {
                      const Icon = getPromptIcon(prompt);
                      return (
                        <button
                          key={prompt}
                          type="button"
                          className="coach-suggestion"
                          onClick={() => handleSuggestedClick(prompt)}
                        >
                          <Icon size={16} className="coach-suggestion__icon" aria-hidden />
                          {prompt}
                        </button>
                      );
                    })}
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
                      {msg.role === "assistant" && (
                        <div className="coach-message__avatar" aria-hidden>
                          <MessageCircle size={16} strokeWidth={2} />
                        </div>
                      )}
                      <div className="coach-message__content">{msg.content}</div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="coach-message coach-message--assistant coach-message--loading"
                    >
                      <div className="coach-message__avatar" aria-hidden>
                        <MessageCircle size={16} strokeWidth={2} />
                      </div>
                      <div className="coach-typing-dots" aria-hidden>
                        <span className="coach-typing-dot" />
                        <span className="coach-typing-dot" />
                        <span className="coach-typing-dot" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {error && (
              <div className="coach-error" role="alert">
                <AlertCircle size={18} className="coach-error__icon" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            <div className="coach-input-bar">
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
            </div>
          </M3CardContent>
        </M3Card>
      </div>
    </Main>
  );
}

export default CoachPage;
