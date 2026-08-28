import React from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import MobileNav from './MobileNav.jsx';
import ToastContainer from '../ui/ToastContainer.jsx';
import FloatingChatbot from '../chat/FloatingChatbot.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function AppLayout({ children, pageTitle }) {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" id="main-content" tabIndex={-1}>
        <Header title={pageTitle} />
        <div className="page-content">
          {children}
        </div>
      </main>
      <MobileNav />
      <FloatingChatbot />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
