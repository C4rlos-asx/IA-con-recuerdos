import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#202123]">
      <div className={`${isSidebarOpen ? 'w-[260px]' : 'w-0'} transition-all duration-300 overflow-hidden bg-[#202123]`}>
        <Sidebar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>
      <div className="flex-1 flex flex-col h-full relative">
        <ChatArea isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>
    </div>
  );
}

export default App;
