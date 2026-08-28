import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Globe, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { dataService } from '../../services/dataService.js';
import { generateAIResponse } from '../../services/aiService.js';

export default function FloatingChatbot() {
  const { user } = useAuth();
  const { streak, roadmap } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('assistant'); // 'assistant' | 'web_search'
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      text: `👋 **Welcome to PathWise AI Copilot!**\n\nI can assist you with your personalized skill development:\n- 🎯 What to study today for your FutureForge stage\n- 📝 Highest priority assignments\n- 🧠 Skill quiz diagnostics & recommendations\n- 🌐 **Web Search Mode:** Switch to real-time search for tech trends & global hiring info!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({});

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    async function loadContext() {
      const [profile, goal, assigns, targets, latestQuiz, aiConf] = await Promise.all([
        dataService.getStudentProfile(user.userId),
        dataService.getCareerGoal(user.userId),
        dataService.getAssignments(user.userId),
        dataService.getTargets(user.userId, { date: new Date().toISOString().split('T')[0] }),
        dataService.getLatestQuizScore(user.userId),
        dataService.getAISettings(user.userId),
      ]);
      setContext({
        profile,
        careerGoal: goal,
        assignments: assigns,
        todayTargets: targets,
        latestQuiz,
        streak,
        roadmap,
        aiSettings: aiConf,
      });
    }
    if (isOpen) {
      loadContext();
    }
  }, [user, isOpen, streak, roadmap]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  async function handleSendMessage(customPrompt) {
    const q = (customPrompt || input).trim();
    if (!q || loading) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await generateAIResponse(q, context, mode, context.aiSettings);
      const aiMsg = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        text: res.text,
        sources: res.sources,
        isWebSearch: res.isWebSearch,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          text: 'Unable to complete response. Please check your network connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999 }}>
      {/* Floating Launch Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), #0f766e)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 30px rgba(13, 148, 136, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 200ms ease',
          }}
          aria-label="Open PathWise AI Chatbot"
          id="floating-chatbot-btn"
        >
          <MessageSquare size={26} />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          style={{
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 540,
            maxHeight: 'calc(100vh - 100px)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 200ms ease',
          }}
          role="dialog"
          aria-label="PathWise AI Assistant"
        >
          {/* Header */}
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08), rgba(212, 175, 122, 0.06))',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>PathWise AI</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Forge Your Skills. Build Your Future.</div>
                </div>
              </div>

              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 2, border: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setMode('assistant')}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'assistant' ? 'var(--color-primary)' : 'transparent',
                  color: mode === 'assistant' ? 'white' : 'var(--color-text-secondary)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <Bot size={13} /> AI Assistant
              </button>
              <button
                onClick={() => setMode('web_search')}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'web_search' ? 'var(--color-accent)' : 'transparent',
                  color: mode === 'web_search' ? 'white' : 'var(--color-text-secondary)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <Globe size={13} /> 🌐 Web Search
              </button>
            </div>
          </div>

          {/* Web Search Mode Indicator */}
          {mode === 'web_search' && (
            <div style={{ background: 'rgba(194, 105, 42, 0.1)', color: 'var(--color-accent)', padding: '4px 12px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(194, 105, 42, 0.2)' }}>
              <Globe size={12} /> 🌐 Web Search Mode (Powered by Grok / xAI)
            </div>
          )}

          {/* Messages Container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {messages.map(m => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} style={{ display: 'flex', gap: 'var(--space-2)', alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                  {!isUser && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, marginTop: 2 }}>
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    style={{
                      background: isUser ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                      color: isUser ? 'white' : 'var(--color-text-primary)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-3)',
                      fontSize: 'var(--font-size-xs)',
                      lineHeight: 1.5,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: m.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\n/g, '<br/>'),
                      }}
                    />
                    {m.sources?.length > 0 && (
                      <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px solid rgba(120, 120, 120, 0.2)', fontSize: 9, opacity: 0.7 }}>
                        {m.sources.map((s, si) => (
                          <div key={si}>• {s}</div>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                      {m.time}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignSelf: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  <Bot size={14} />
                </div>
                <div style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-lg)', padding: '8px 12px', fontSize: 'var(--font-size-xs)' }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-2)' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, fontSize: 'var(--font-size-xs)', padding: '6px 10px' }}
              placeholder={mode === 'web_search' ? 'Search current tech trends & jobs...' : 'Ask PathWise AI anything...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
              id="chatbot-input"
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              id="chatbot-send-btn"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
