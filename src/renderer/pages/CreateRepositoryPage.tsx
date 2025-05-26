import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repository } from '../../lib/repository-manager';
import useToastContext from '../hooks/useToastContext';
import { ipcRenderer } from '../index';

interface CreateRepositoryPageProps {
  setRepository: (repository: Repository | null) => void;
}

const CreateRepositoryPage: React.FC<CreateRepositoryPageProps> = ({ setRepository }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showSuccess } = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单验证
    if (!name.trim()) {
      showError('请输入仓库名称');
      return;
    }
    
    if (!password) {
      showError('请输入仓库密码');
      return;
    }
    
    if (password.length < 8) {
      showError('密码长度至少为8个字符');
      return;
    }
    
    if (password !== confirmPassword) {
      showError('两次输入的密码不一致');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 创建仓库
      const result = await ipcRenderer.invoke('create-repository', name, password);
      
      if (!result.success) {
        throw new Error(result.error || '创建仓库失败');
      }
      
      // 保存仓库文件到默认目录
      // 不再弹出文件选择对话框，直接使用默认目录
      const saveResult = await ipcRenderer.invoke('save-repository-file', {
        ...result.data,
        name: name // 传递名称，让后端根据设置的目录和名称生成完整路径
      }, password);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || '保存仓库文件失败');
      }
      
      setRepository(saveResult.data);
      showSuccess('仓库创建成功并保存在默认目录');
      navigate('/repository');
    } catch (error) {
      showError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="create-repository-page">
      <div className="page-header">
        <h2>
          <span className="repository-icon">📁</span>
          创建新的密码仓库
        </h2>
        <p className="page-description">
          创建一个加密仓库来安全地存储您的密码和敏感信息
        </p>
      </div>
      
      <div className="card-container">
        <div className="card repository-form-card">
          <div className="card-content">
            <div className="form-icon-container">
              <div className="form-icon">🔐</div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">仓库名称</label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  placeholder="输入一个有意义的名称"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="password">仓库密码</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="设置一个强密码"
                />
                <div className="form-hint">
                  <span className="hint-icon">ℹ️</span>
                  <span>密码长度至少8个字符，请务必牢记此密码，一旦丢失将无法恢复数据</span>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">确认密码</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="再次输入密码"
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-with-icon"
                  onClick={() => navigate('/')}
                  disabled={isLoading}
                >
                  <span className="btn-icon">⬅️</span>
                  返回
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-with-icon"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      创建中...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✨</span>
                      创建仓库
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="info-panel">
          <div className="info-panel-item">
            <div className="info-icon">🔒</div>
            <div className="info-content">
              <h3>安全加密</h3>
              <p>使用AES-256加密算法，确保您的数据安全</p>
            </div>
          </div>
          
          <div className="info-panel-item">
            <div className="info-icon">💾</div>
            <div className="info-content">
              <h3>本地存储</h3>
              <p>仓库将保存在您设置的默认目录中</p>
            </div>
          </div>
          
          <div className="info-panel-item">
            <div className="info-icon">⚠️</div>
            <div className="info-content">
              <h3>密码重要性</h3>
              <p>请务必牢记您的仓库密码，没有密码将无法恢复数据</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRepositoryPage; 