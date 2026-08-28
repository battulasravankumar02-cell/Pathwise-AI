import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Lightbulb, Trash2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, DemoBanner, LoadingState } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { generateAIResponse } from '../services/aiService.js';

const QUICK_QUESTIONS = [
  'What should I study today?',
  'Which assignment is most urgent?',
  'How am I performing this week?',
  'What should I do after my current course?',
  'How much have I studied this week?',
  'Am I on track for my career goal?',
  'Show me my attendance status',
  'What\'s my current streak?',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className="message-bubble">
        <div
          className="message-text"
          dangerouslySetInnerHTML={{
            __html: msg.text
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/\n/g, '<br/>')
              .replace(/\|([^|\n]+)\|/g, '<code>$1</code>')
              .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
              .replace(/`(.*?)`/g, '<code>$1</code>')
          }}
        />
        {msg.sources?.length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 4 }}>Sources:</div>
            {msg.sources.map((s, i) => (
              <div key={i} style={{ fontSize: 10, opacity: 0.5, fontStyle: 'italic' }}>• {s}</div>
            ))}
          </div>
        )}
        <div className="message-time">{msg.time}</div>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const { user } = useAuth();
  const { roadmap, streak } = useApp();
  const [chatMode, setChatMode] = useState('assistant'); // 'assistant' | 'web_search'
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `👋 **Hello! I'm your PathWise AI Copilot.**\n\nI can help you with:\n- 📚 What to study today based on your roadmap\n- 📝 Which assignment to tackle first (priority scoring)\n- 📊 Analyzing your performance and study patterns\n- 🎯 Career progress and roadmap status\n- 🔥 Streak and habit insights\n- 🌐 Live Groq Web Search (switch to **Groq Web Search** tab above)\n\nAsk me anything about your academic and career transformation!`,
      sources: [],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    async function loadContext() {
      const [profile, assignments, analytics, attendance, targets] = await Promise.all([
        dataService.getStudentProfile(user.userId),
        dataService.getAssignments(user.userId),
        dataService.getAnalytics(user.userId),
        dataService.getAttendance(user.userId),
        dataService.getTargets(user.userId, { date: new Date().toISOString().split('T')[0] }),
      ]);
      setContext({ profile, assignments, analytics, attendance, roadmap, streak, todayTargets: targets, weeklyTargets: { completed: 3, total: 5 } });
    }
    loadContext();
  }, [user, roadmap, streak]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(query) {
    const q = (query || input).trim();
    if (!q || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const response = await generateAIResponse(q, context || {}, chatMode);

    const aiMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      text: response.text,
      sources: response.sources,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  }

  function clearChat() {
    setMessages(messages.slice(0, 1)); // keep welcome
  }

  return (
    <AppLayout pageTitle="AI Assistant">
      {user?.isDemo && <DemoBanner />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 'var(--space-6)', height: 'calc(100vh - 180px)', minHeight: 500 }}>
        {/* Chat panel */}
        <Card style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Header with Mode Selector */}
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {chatMode === 'web_search' ? '🌐' : '🤖'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                  PathWise AI {chatMode === 'web_search' ? 'Web Search' : 'Assistant'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-success)', fontWeight: 600 }}>
                  {chatMode === 'web_search' ? '● Groq Search Engine Active' : '● Personalized Copilot Active'}
                </div>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-alt)', padding: 3, borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                className={`btn ${chatMode === 'assistant' ? 'btn-primary' : 'btn-ghost'} btn-xs`}
                onClick={() => setChatMode('assistant')}
                style={{ fontSize: 11 }}
              >
                🤖 Copilot
              </button>
              <button
                type="button"
                className={`btn ${chatMode === 'web_search' ? 'btn-primary' : 'btn-ghost'} btn-xs`}
                onClick={() => setChatMode('web_search')}
                style={{ fontSize: 11 }}
              >
                🌐 Groq Web Search
              </button>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={clearChat} title="Clear chat">
              <Trash2 size={14} /> Clear
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)' }} aria-live="polite" aria-label="Chat messages">
            {messages.map(msg => <Message key={msg.id} msg={msg} />)}
            {loading && (
              <div className="message ai-message">
                <div className="message-avatar"><Bot size={14} /></div>
                <div className="message-bubble">
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-3)' }}>
            <input
              className="form-input"
              style={{ flex: 1 }}
              placeholder={chatMode === 'web_search' ? "Enter search query for Groq live web retrieval..." : "Ask me anything about your studies..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
              id="ai-chat-input"
              aria-label="Chat input"
              autoFocus
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              id="ai-send-btn"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </Card>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Quick Questions */}
          <Card>
            <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lightbulb size={16} style={{ color: 'var(--color-warning)' }} /> Quick Questions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  className="btn btn-ghost btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: 'var(--font-size-xs)', whiteSpace: 'normal', height: 'auto', padding: 'var(--space-2) var(--space-3)' }}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  id={`quick-q-${q.replace(/\s/g, '-').substring(0, 20)}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>

          {/* Disclaimer */}
          <Card>
            <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-2)', color: 'var(--color-warning)' }}>⚠️ Important Note</h3>
            <p style={{ fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              This assistant uses rule-based logic with your real student data. Career recommendations and performance insights are estimates, not guarantees.
              <br /><br />
              For LLM-powered responses, connect an API key via a secure backend.
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
