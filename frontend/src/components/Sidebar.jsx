import React, { useState, useEffect, useRef } from 'react';

const Sidebar = ({ toggleSidebar, onNewChat, onSelectChat, currentChatId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [chats, setChats] = useState([]);
  const menuRef = useRef(null);
  const userId = 'test-user'; // Hardcoded for now

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat?userId=${userId}`);
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
                onClick={() => onSelectChat(chat.id)}
                className={`p-3 rounded-md cursor-pointer text-sm flex items-center gap-3 group ${currentChatId === chat.id ? 'bg-[#343541] text-white' : 'hover:bg-[#2A2B32] text-gray-100'}`}
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="truncate flex-1">{chat.title || 'New Chat'}</span>
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
              <button className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#343541] w-full text-left">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Configuración
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
