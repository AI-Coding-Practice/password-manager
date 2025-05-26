import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateRepositoryPage from './pages/CreateRepositoryPage';
import OpenRepositoryPage from './pages/OpenRepositoryPage';
import RepositoryPage from './pages/RepositoryPage';
import SettingsPage from './pages/SettingsPage';
import { Repository } from '../lib/repository-manager';
import ToastContainer from './components/ToastContainer';
import { ToastProvider } from './hooks/useToastContext';
import useToastContext from './hooks/useToastContext';

// 导航菜单组件
const NavigationMenu: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="app-nav">
      <Link to="/" className={`nav-item ${isActive('/')}`}>
        <span className="nav-icon">🏠</span>
        首页
      </Link>
      <Link to="/create-repository" className={`nav-item ${isActive('/create-repository')}`}>
        <span className="nav-icon">📁</span>
        创建仓库
      </Link>
      <Link to="/open-repository" className={`nav-item ${isActive('/open-repository')}`}>
        <span className="nav-icon">🔓</span>
        打开仓库
      </Link>
      <Link to="/settings" className={`nav-item ${isActive('/settings')}`}>
        <span className="nav-icon">⚙️</span>
        设置
      </Link>
    </nav>
  );
};

const AppContent: React.FC = () => {
  const [repository, setRepository] = useState<Repository | null>(null);
  const { toasts, removeToast } = useToastContext();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <Link to="/" className="logo-link">
              <span className="logo-icon">🔐</span>
              <h1>个人密码管理器</h1>
            </Link>
          </div>
          <NavigationMenu />
        </div>
      </header>
      
      <main className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/create-repository" 
            element={<CreateRepositoryPage setRepository={setRepository} />} 
          />
          <Route 
            path="/open-repository" 
            element={<OpenRepositoryPage setRepository={setRepository} />} 
          />
          <Route 
            path="/repository" 
            element={
              repository ? 
              <RepositoryPage repository={repository} setRepository={setRepository} /> : 
              <HomePage />
            } 
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <p>个人密码管理器 &copy; {new Date().getFullYear()} | 安全 · 可靠 · 简便</p>
        </div>
      </footer>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  );
};

export default App; 