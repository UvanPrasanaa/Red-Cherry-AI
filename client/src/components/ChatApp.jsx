import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import SettingsModal from './SettingsModal';
import ProfileModal from './ProfileModal';
import LegalPage from './LegalPage';
import SupportCentre from './SupportCentre';
import { isMemoryEnabled, getMemories, extractMemories, addMemory } from '../utils/memory';
import '../styles/chat.css';
import '../styles/sidebar.css';
import '../styles/modal.css';

// With the API running as a Cloudflare Pages Function (functions/api/chat.js),
// it's served from the same origin as the frontend, so no base URL is needed.
// VITE_API_URL is still supported as an override (e.g. for local dev against
// `wrangler pages dev`, or if you point this at a separately hosted backend).
// Strip any trailing slash so we never end up with a double slash like
// "https://site.pages.dev//api/chat" when VITE_API_URL is set with one.
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const MODEL_NAME = 'Nemo - 1';

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

  // Navigation / overlay state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState(null); // 'privacy' | 'terms' | 'community' | null
  const [supportOpen, setSupportOpen] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [chats, setChats] = useState([{ id: 'current', title: 'New chat' }]);
  const [activeChatId, setActiveChatId] = useState('current');

  const photoInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

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

      // "Remember this", "my name is...", etc. get captured and stored
      // in Firestore under the user's account, then sent along with every
      // future request — so it follows them across devices, not just this
      // browser.
      const uid = user?.uid;
      const memoryOn = uid ? await isMemoryEnabled(uid) : false;
      if (memoryOn) {
        for (const fact of extractMemories(trimmed)) {
          await addMemory(uid, fact);
        }
      }
      const memoryFacts = memoryOn ? await getMemories(uid) : [];

      try {
        const res = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages, memory: memoryFacts }),
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
    [messages, isSending, autoResize, user]
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

  const handleNewChat = () => {
    const id = `chat-${Date.now()}`;
    setChats((prev) => [{ id, title: 'New chat' }, ...prev]);
    setActiveChatId(id);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setSidebarOpen(false);
    // Chat history isn't persisted to a backend yet — each entry is a
    // placeholder thread. Wire this up to real per-chat storage to make
    // switching actually restore prior messages.
  };

  // Attachments are read client-side only for now; there's no upload
  // endpoint yet, so this just gives the user a preview + filename note
  // appended to their message. Wire up real storage (e.g. Firebase
  // Storage) when you're ready to send files to the model.
  const handleAttachment = (e, label) => {
    const file = e.target.files?.[0];
    setAttachMenuOpen(false);
    if (!file) return;
    setInput((prev) => (prev ? `${prev}\n[Attached ${label}: ${file.name}]` : `[Attached ${label}: ${file.name}]`));
    requestAnimationFrame(autoResize);
    e.target.value = '';
  };

  return (
    <div className="chat-app">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onOpenProfile={() => {
          setSidebarOpen(false);
          setProfileOpen(true);
        }}
        onOpenSettings={() => {
          setSidebarOpen(false);
          setSettingsOpen(true);
        }}
      />

      <header className="chat-header">
        <div className="chat-header__brand">
          <button type="button" className="chat-header__menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <div className="chat-header__mark">{'{ }'}</div>
          <div>
            <div className="chat-header__name">Red Cherry AI</div>
            <div className="chat-header__model">
              <span className="chat-header__model-dot"></span>
              {MODEL_NAME}
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

        <div className="chat-composer__toolbar">
          <div className="chat-composer__attach-wrap">
            <button
              type="button"
              className="chat-composer__attach-btn"
              onClick={() => setAttachMenuOpen((v) => !v)}
              aria-label="Add attachment"
              aria-expanded={attachMenuOpen}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            {attachMenuOpen && (
              <div className="chat-composer__attach-menu">
                <button type="button" onClick={() => cameraInputRef.current?.click()}>
                  Camera
                </button>
                <button type="button" onClick={() => photoInputRef.current?.click()}>
                  Photos
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()}>
                  Files
                </button>
              </div>
            )}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => handleAttachment(e, 'photo')}
            />
            <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={(e) => handleAttachment(e, 'photo')} />
            <input ref={fileInputRef} type="file" hidden onChange={(e) => handleAttachment(e, 'file')} />
          </div>
          <span className="chat-composer__model">{MODEL_NAME}</span>
        </div>

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

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          onOpenLegal={(key) => {
            setSettingsOpen(false);
            setLegalDoc(key);
          }}
          onOpenSupport={() => {
            setSettingsOpen(false);
            setSupportOpen(true);
          }}
        />
      )}

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}

      {legalDoc && <LegalPage docKey={legalDoc} onClose={() => setLegalDoc(null)} />}

      {supportOpen && <SupportCentre onClose={() => setSupportOpen(false)} />}
    </div>
  );
}
