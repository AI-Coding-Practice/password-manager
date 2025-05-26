import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>
          <span className="hero-icon">🔐</span>
          个人密码管理器
        </h1>
        <p className="hero-tagline">安全地管理您的密码和敏感信息</p>
        
        <div className="hero-actions">
          <button 
            className="btn btn-hero-primary btn-with-icon"
            onClick={() => navigate('/create-repository')}
          >
            <span className="btn-icon">🚀</span>
            开始使用
          </button>
        </div>
      </div>
      
      <div className="home-cards">
        <div 
          className="home-card" 
          onClick={() => navigate('/create-repository')}
        >
          <div className="card-icon create-icon">
            <span>📁</span>
          </div>
          <div className="card-content">
            <h3>创建密码仓库</h3>
            <p>创建一个新的加密密码仓库来存储您的密码</p>
          </div>
        </div>
        
        <div 
          className="home-card" 
          onClick={() => navigate('/open-repository')}
        >
          <div className="card-icon open-icon">
            <span>🔓</span>
          </div>
          <div className="card-content">
            <h3>打开密码仓库</h3>
            <p>打开现有的密码仓库并管理您的密码</p>
          </div>
        </div>
        
        <div 
          className="home-card" 
          onClick={() => navigate('/settings')}
        >
          <div className="card-icon settings-icon">
            <span>⚙️</span>
          </div>
          <div className="card-content">
            <h3>软件设置</h3>
            <p>自定义您的密码管理器设置和配置</p>
          </div>
        </div>
      </div>
      
      <div className="home-features-section">
        <h2>
          <span className="section-icon">✨</span>
          安全可靠的密码管理解决方案
        </h2>
        
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h3>高级加密</h3>
            <p>使用AES-256加密算法保障您的密码安全</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">📂</div>
            <h3>多仓库支持</h3>
            <p>创建和管理多个独立的密码仓库</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">💻</div>
            <h3>本地存储</h3>
            <p>所有数据本地存储，无需担心云端泄露</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>简单易用</h3>
            <p>直观的用户界面，让密码管理变得简单</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 