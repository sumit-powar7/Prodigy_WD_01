import React, { useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { Sidebar } from './components/Sidebar';
import { ChatRoom } from './components/ChatRoom';
import { RightPanel } from './components/RightPanel';
import { AuthModal } from './components/AuthModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { ToastContainer } from './components/ToastContainer';
import { ImageModal } from './components/ImageModal';

const ChatAppContent: React.FC = () => {
  const { currentUser, theme } = useChat();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className={`relative flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Auth Modal overlay if guest or unauthenticated */}
      {!currentUser && <AuthModal />}

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        ></div>
      )}

      {/* Left Sidebar (Desktop & Mobile Drawer) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onOpenCreateRoom={() => setIsCreateRoomOpen(true)} />
      </div>

      {/* Main Real-Time Chat Canvas */}
      <ChatRoom onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* Right Drawer Panel (Thread / Members / Media / Pinned) */}
      <RightPanel />

      {/* Modal Dialogs & Toast Notifications */}
      <CreateRoomModal isOpen={isCreateRoomOpen} onClose={() => setIsCreateRoomOpen(false)} />
      <ToastContainer />
      <ImageModal />
    </div>
  );
};

export default function App() {
  return (
    <ChatProvider>
      <ChatAppContent />
    </ChatProvider>
  );
}
