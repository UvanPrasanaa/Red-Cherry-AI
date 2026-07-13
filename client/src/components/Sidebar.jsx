import { useAuth } from '../context/AuthContext';

function initials(name) {
  if (!name) return 'G';
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function Sidebar({ open, onClose, chats, activeChatId, onNewChat, onSelectChat, onOpenProfile, onOpenSettings }) {
  const { user, isGuest } = useAuth();

  return (
    <>
      <div className={`sidebar-scrim ${open ? 'sidebar-scrim--visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`} aria-hidden={!open}>
        <div className="sidebar__top">
          <button type="button" className="sidebar__icon-btn" onClick={onClose} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="sidebar__icon-btn" onClick={onOpenSettings} aria-label="Settings">
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M16.2 12.4c-.2.4-.1.9.2 1.2l.1.1a1.5 1.5 0 1 1-2.1 2.1l-.1-.1a1 1 0 0 0-1.2-.2 1 1 0 0 0-.6.9v.2a1.5 1.5 0 0 1-3 0v-.1a1 1 0 0 0-.66-.92 1 1 0 0 0-1.2.2l-.1.1a1.5 1.5 0 1 1-2.1-2.1l.1-.1a1 1 0 0 0 .2-1.2 1 1 0 0 0-.9-.6h-.2a1.5 1.5 0 0 1 0-3h.1a1 1 0 0 0 .92-.66 1 1 0 0 0-.2-1.2l-.1-.1a1.5 1.5 0 1 1 2.1-2.1l.1.1a1 1 0 0 0 1.2.2h.06a1 1 0 0 0 .6-.9v-.2a1.5 1.5 0 0 1 3 0v.1a1 1 0 0 0 .6.92 1 1 0 0 0 1.2-.2l.1-.1a1.5 1.5 0 1 1 2.1 2.1l-.1.1a1 1 0 0 0-.2 1.2v.06a1 1 0 0 0 .9.6h.2a1.5 1.5 0 0 1 0 3h-.1a1 1 0 0 0-.92.6Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <button type="button" className="sidebar__new-chat" onClick={onNewChat}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          New chat
        </button>

        <div className="sidebar__chats">
          <div className="sidebar__chats-label">Chats</div>
          {chats.length === 0 ? (
            <div className="sidebar__chats-empty">No chats yet</div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                className={`sidebar__chat-item ${chat.id === activeChatId ? 'sidebar__chat-item--active' : ''}`}
                onClick={() => onSelectChat(chat.id)}
              >
                {chat.title}
              </button>
            ))
          )}
        </div>

        <button type="button" className="sidebar__profile" onClick={onOpenProfile}>
          {user?.photoURL ? (
            <img className="sidebar__profile-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="sidebar__profile-avatar sidebar__profile-avatar--fallback">
              {isGuest ? 'G' : initials(user?.displayName)}
            </span>
          )}
          <span className="sidebar__profile-name">{isGuest ? 'Guest' : user?.displayName || 'Your profile'}</span>
        </button>
      </aside>
    </>
  );
}
