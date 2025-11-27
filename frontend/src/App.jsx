import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Settings from './components/Settings';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'settings'

  const handleNewChat = () => {
    setCurrentChatId(null);
    setCurrentView('chat');
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    setCurrentView('chat');
  };

  const handleOpenSettings = () => {
    setCurrentView('settings');
  };

  const handleCloseSettings = () => {
    setCurrentView('chat');
  };

  return (
    <div className="flex h-screen bg-[#202123]">
      <div className={`${isSidebarOpen ? 'w-[260px]' : 'w-0'} transition-all duration-300 overflow-hidden bg-[#202123]`}>
        <Sidebar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onOpenSettings={handleOpenSettings}
          currentChatId={currentChatId}
        />
      </div>
      <div className="flex-1 flex flex-col h-full relative">
        {currentView === 'settings' ? (
          <Settings onClose={handleCloseSettings} />
        ) : (
          <ChatArea
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            currentChatId={currentChatId}
            onChatCreated={setCurrentChatId}
          />
        )}
      </div>
    </div>
  );
}

export default App;
