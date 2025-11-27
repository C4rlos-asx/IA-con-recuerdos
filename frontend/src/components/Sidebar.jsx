import React, { useState, useEffect, useRef } from 'react';

const Sidebar = ({ toggleSidebar, onNewChat, onSelectChat, onOpenSettings, onOpenCustomModels, currentChatId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingChat, setEditingChat] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const menuRef = useRef(null);
  const userId = 'test-user'; // Hardcoded for now

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
        const response = await fetch(`${apiUrl}/api/chat?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();
    // Poll for updates or use a more sophisticated state management in future
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRename = async (chatId) => {
    if (!editTitle.trim()) {
      setEditingChat(null);
      return;
    }

    try {
      const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/chat/manage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, title: editTitle })
      });

      if (response.ok) {
        setChats(chats.map(c => c.id === chatId ? { ...c, title: editTitle } : c));
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
    } finally {
      setEditingChat(null);
      setEditTitle('');
    }
  };

  const handleDelete = async (chatId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este chat?')) return;

    try {
      const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/chat/manage?chatId=${chatId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setChats(chats.filter(c => c.id !== chatId));
        setActiveMenu(null);
        if (currentChatId === chatId) {
          onNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return (
    <div className="bg-[#202123] w-[260px] h-screen flex flex-col p-2 text-white hidden md:flex relative">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onNewChat}
          className="flex-1 flex items-center gap-3 p-3 border border-white/20 rounded-md hover:bg-white/10 transition-colors duration-200 cursor-pointer text-sm"
        >
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New chat
        </button>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white ml-2"
        >
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-md text-sm flex items-center gap-2 group relative ${currentChatId === chat.id ? 'bg-[#343541] text-white' : 'hover:bg-[#2A2B32] text-gray-100'
                  }`}
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-400 flex-shrink-0" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>

                {editingChat === chat.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRename(chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(chat.id);
                      if (e.key === 'Escape') {
                        setEditingChat(null);
                        setEditTitle('');
                      }
                    }}
                    className="flex-1 bg-[#40414F] text-white px-2 py-1 rounded text-sm outline-none"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => onSelectChat(chat.id)}
                    className="truncate flex-1 cursor-pointer"
                  >
                    {chat.title || 'Nuevo Chat'}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === chat.id ? null : chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#40414F] rounded transition-opacity"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {activeMenu === chat.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActiveMenu(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-[#2A2B32] border border-gray-700 rounded-md shadow-xl z-20 min-w-[160px]">
                      <button
                        onClick={() => {
                          setEditingChat(chat.id);
                          setEditTitle(chat.title);
                          setActiveMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[#343541] flex items-center gap-2 text-white"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Renombrar
                      </button>
                      <button
                        onClick={() => handleDelete(chat.id)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[#343541] flex items-center gap-2 text-red-400"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-gray-500 text-center">No chats yet</div>
          )}
        </div>
      </div>

      <div className="border-t border-white/20 pt-2 relative" ref={menuRef}>
        {showMenu && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-[#202123] border border-white/10 rounded-md shadow-lg overflow-hidden z-20">
            <div className="py-1">
              <button className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#343541] w-full text-left">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                Personalización
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenSettings();
                }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#343541] w-full text-left"
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Configuración
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenCustomModels();
                }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#343541] w-full text-left"
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Modelos Personalizados
              </button>
              <div className="h-px bg-white/20 my-1"></div>
              <button className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#343541] w-full text-left">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Ayuda
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 ml-auto" xmlns="http://www.w3.org/2000/svg"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#343541] w-full text-left">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
        <div
          className="flex items-center gap-3 p-3 hover:bg-[#2A2B32] rounded-md cursor-pointer text-sm"
          onClick={() => setShowMenu(!showMenu)}
        >
          <div className="w-5 h-5 bg-green-500 rounded-sm flex items-center justify-center text-xs font-bold">U</div>
          <div className="font-bold">User</div>
          <div className="ml-auto text-gray-400">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
