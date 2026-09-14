import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import MobileNav from './MobileNav.jsx';
import MoreDrawer from './MoreDrawer.jsx';
import ToastContainer from '../ui/ToastContainer.jsx';
import FloatingChatbot from '../chat/FloatingChatbot.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function AppLayout({ children, pageTitle }) {
  const { toasts, dismissToast } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" id="main-content" tabIndex={-1}>
        <Header title={pageTitle} onOpenMenu={() => setMoreOpen(true)} />
        <div className="page-content">
          {children}
        </div>
      </main>
      <MobileNav onOpenMore={() => setMoreOpen(true)} />
      <MoreDrawer isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
      <FloatingChatbot />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
