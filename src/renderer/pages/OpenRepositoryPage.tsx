import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repository } from '../../lib/repository-manager';
import useToastContext from '../hooks/useToastContext';
import { ipcRenderer } from '../index';

interface RepositoryListItem {
  name: string;
  filePath: string;
  lastModified: string;
  size: number;
}

interface OpenRepositoryPageProps {
  setRepository: (repository: Repository | null) => void;
}

const OpenRepositoryPage: React.FC<OpenRepositoryPageProps> = ({ setRepository }) => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToastContext();
  
  const [repositories, setRepositories] = useState<RepositoryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryListItem | null>(null);
  const [password, setPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  // 加载仓库列表
  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setIsLoading(true);
        const result = await ipcRenderer.invoke('get-repository-list');
        
        if (result.success) {
          setRepositories(result.data || []);
        } else {
          showError(`无法加载仓库列表: ${result.error}`);
        }
      } catch (error) {
        showError(`加载仓库列表失败: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRepositories();
  }, [showError]);
  
  // 格式化文件大小
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // 选择仓库
  const handleSelectRepository = (repo: RepositoryListItem) => {
    setSelectedRepo(repo);
    setShowPasswordDialog(true);
  };
  
  // 打开仓库
  const handleOpenRepository = async () => {
    if (!selectedRepo) return;
    
    if (!password) {
      showError('请输入仓库密码');
      return;
    }
    
    setIsOpening(true);
    
    try {
      const result = await ipcRenderer.invoke('open-repository', selectedRepo.filePath, password);
      
      if (!result.success) {
        throw new Error(result.error || '打开仓库失败');
      }
      
      setRepository(result.data);
      showSuccess('仓库打开成功');
      navigate('/repository');
    } catch (error) {
      showError((error as Error).message);
    } finally {
      setIsOpening(false);
    }
  };
  
  // 取消打开
  const handleCancelOpen = () => {
    setShowPasswordDialog(false);
    setSelectedRepo(null);
    setPassword('');
  };
  
  // 按Enter键打开仓库
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password && !isOpening) {
      handleOpenRepository();
    }
  };
  
  return (
    <div className="open-repository-page">
      <div className="page-header">
        <h2>
          <span className="repository-icon">🔓</span>
          打开密码仓库
        </h2>
        <p className="page-description">
          选择并访问您已保存的密码仓库
        </p>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner loading-spinner-large"></div>
          <p>正在加载仓库列表...</p>
        </div>
      ) : repositories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>没有找到密码仓库</h3>
          <p>当前没有可用的密码仓库，您可以创建一个新的仓库开始使用</p>
          <div className="empty-state-actions">
            <button 
              className="btn btn-primary btn-with-icon" 
              onClick={() => navigate('/create-repository')}
            >
              <span className="btn-icon">✨</span>
              创建新仓库
            </button>
            <button 
              className="btn btn-secondary btn-with-icon" 
              onClick={() => navigate('/')}
            >
              <span className="btn-icon">⬅️</span>
              返回
            </button>
          </div>
        </div>
      ) : (
        <div className="card vault-list-card">
          <div className="card-header">
            <div className="card-header-icon">
              <span>🗂️</span>
            </div>
            <h3>您的密码仓库</h3>
          </div>
          
          <div className="vault-list">
            {repositories.map((repo) => (
              <div key={repo.filePath} className="vault-item" onClick={() => handleSelectRepository(repo)}>
                <div className="vault-item-icon">
                  <span>📁</span>
                </div>
                <div className="vault-item-details">
                  <div className="vault-item-name">{repo.name}</div>
                  <div className="vault-item-meta">
                    <span className="vault-meta-date">
                      <span className="meta-icon">🕒</span>
                      {formatDate(repo.lastModified)}
                    </span>
                    <span className="vault-meta-size">
                      <span className="meta-icon">📊</span>
                      {formatFileSize(repo.size)}
                    </span>
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-sm btn-with-icon vault-open-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRepository(repo);
                  }}
                >
                  <span className="btn-icon">🔑</span>
                  打开
                </button>
              </div>
            ))}
          </div>
          
          <div className="card-footer">
            <button
              type="button"
              className="btn btn-secondary btn-with-icon"
              onClick={() => navigate('/')}
            >
              <span className="btn-icon">⬅️</span>
              返回
            </button>
            <button
              type="button"
              className="btn btn-primary btn-with-icon"
              onClick={() => navigate('/create-repository')}
            >
              <span className="btn-icon">✨</span>
              创建仓库
            </button>
          </div>
        </div>
      )}
      
      {/* 密码输入对话框 */}
      {showPasswordDialog && selectedRepo && (
        <div className="modal-overlay">
          <div className="modal-content password-dialog">
            <div className="modal-header">
              <div className="modal-icon">🔐</div>
              <h3>输入仓库密码</h3>
            </div>
            
            <p className="modal-description">
              请输入 <span className="highlight-text">"{selectedRepo.name}"</span> 的仓库密码以解锁您的数据
            </p>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">密码</label>
              <div className="password-input-container">
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isOpening}
                  autoFocus
                  placeholder="输入您的仓库密码"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary btn-with-icon"
                onClick={handleCancelOpen}
                disabled={isOpening}
              >
                <span className="btn-icon">❌</span>
                取消
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-with-icon"
                onClick={handleOpenRepository}
                disabled={isOpening || !password}
              >
                {isOpening ? (
                  <>
                    <span className="loading-spinner"></span>
                    打开中...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔓</span>
                    解锁仓库
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenRepositoryPage; 