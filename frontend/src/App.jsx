import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Settings from './components/Settings';
import CustomModels from './components/CustomModels';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'settings', or 'customModels'
  const [customModelForChat, setCustomModelForChat] = useState(null);

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

  const handleOpenCustomModels = () => {
    setCurrentView('customModels');
  };

  const handleCloseCustomModels = () => {
    setCurrentView('chat');
  };

  const handleCreateCustomModelChat = (chatId, customModel) => {
    // This will be called when a custom model is created
    // The chat will be handled by the backend
    console.log('Custom model chat created:', chatId, customModel);
  };

  return (
    <div className="flex h-screen bg-[#202123]">
      <div className={`${isSidebarOpen ? 'w-[260px]' : 'w-0'} transition-all duration-300 overflow-hidden bg-[#202123]`}>
        <Sidebar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onOpenSettings={handleOpenSettings}
          onOpenCustomModels={handleOpenCustomModels}
          currentChatId={currentChatId}
        />
      </div>
      <div className="flex-1 flex flex-col h-full relative">
        {currentView === 'settings' ? (
          <Settings onClose={handleCloseSettings} />
        ) : currentView === 'customModels' ? (
          <CustomModels
            onClose={handleCloseCustomModels}
            onCreateChat={handleCreateCustomModelChat}
          />
        ) : (
          <ChatArea
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            currentChatId={currentChatId}
            onChatCreated={setCurrentChatId}
            customModel={customModelForChat}
          />
        )}
      </div>
    </div>
  );
}

export default App;
