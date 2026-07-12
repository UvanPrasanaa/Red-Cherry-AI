import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import '../styles/chat.css';



const SUGGESTIONS = [
  'Explain how async/await works in JavaScript',
  'Write a Python function to reverse a linked list',
  'What are the SOLID principles?',
  'Help me debug a React useEffect loop',
];

function initials(name) {
  if (!name) return 'G';
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function Avatar({ user, isGuest }) {
  if (isGuest || !user?.photoURL) {
    return <div className="chat-header__avatar-fallback">{isGuest ? 'G' : initials(user?.displayName)}</div>;
  }
  return <img className="chat-header__avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />;
}

function Message({ role, content, isError }) {
  return (
    <div className={`message message--${role}`}>
      <div className="message__avatar">{role === 'assistant' ? '{ }' : 'U'}</div>
      <div className={`message__bubble ${isError ? 'message__error' : ''}`}>
        {role === 'assistant' ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  );
}

export default function ChatApp() {
  const { user, isGuest, signOut } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      setError('');
      const nextMessages = [...messages, { role: 'user', content: trimmed }];
      setMessages(nextMessages);
      setInput('');
      requestAnimationFrame(autoResize);
      setIsSending(true);

      try {
        const res = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || 'Something went wrong. Please try again.');
        }

        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } catch (err) {
        console.error('Chat request failed:', err);
        setError(err.message || 'Could not reach the server. Is the backend running?');
      } finally {
        setIsSending(false);
      }
    },
    [messages, isSending, autoResize]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div className="chat-header__brand">
          <div className="chat-header__mark">{'{ }'}</div>
          <div>
            <div className="chat-header__name">Red Cherry AI</div>
            <div className="chat-header__model">
              <span className="chat-header__model-dot"></span>
              llama-3.3-70b-versatile
            </div>
          </div>
        </div>
        <div className="chat-header__user">
          <span className="chat-header__label">{isGuest ? 'Guest' : user?.displayName}</span>
          <Avatar user={user} isGuest={isGuest} />
          <button type="button" className="chat-header__signout" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-thread">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty__mark">{'{ }'}</div>
              <h2 className="chat-empty__title">What are you working on?</h2>
              <p className="chat-empty__subtitle">
                Ask anything — code, concepts, debugging, or just a second opinion.
              </p>
              <div className="chat-empty__suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chat-empty__suggestion"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)
          )}

          {isSending && (
            <div className="message message--assistant">
              <div className="message__avatar">{'{ }'}</div>
              <div className="message__bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-composer">
        {error && <div className="chat-composer__error">{error}</div>}
        <form className="chat-composer__inner" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="chat-composer__textarea"
            placeholder="Message Red Cherry AI…"
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <button
            type="submit"
            className="chat-composer__send"
            disabled={!input.trim() || isSending}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2 8h11.5M9 3.5 13.5 8 9 12.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
        <div className="chat-composer__hint">Enter to send · Shift + Enter for a new line</div>
      </div>
    </div>
  );
}
