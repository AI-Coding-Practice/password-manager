import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useToastContext from '../hooks/useToastContext';
import { ipcRenderer } from '../index';
import { Settings } from '../../lib/settings-service';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  
  const [settings, setSettings] = useState<Settings>({
    defaultRepositoryPath: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await ipcRenderer.invoke('get-settings');
        
        if (response.success) {
          setSettings(response.data);
        } else {
          showError(`加载设置失败: ${response.error}`);
        }
      } catch (error) {
        showError(`加载设置出错: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [showError]);

  // 选择目录
  const handleSelectDirectory = async () => {
    try {
      const response = await ipcRenderer.invoke('select-directory');
      
      if (!response.canceled && response.filePaths.length > 0) {
        setSettings({
          ...settings,
          defaultRepositoryPath: response.filePaths[0]
        });
      }
    } catch (error) {
      showError(`选择目录失败: ${(error as Error).message}`);
    }
  };

  // 保存设置
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await ipcRenderer.invoke('update-settings', settings);
      
      if (response.success) {
        showSuccess('设置已保存');
      } else {
        showError(`保存设置失败: ${response.error}`);
      }
    } catch (error) {
      showError(`保存设置出错: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 返回首页
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>
          <span className="settings-icon">⚙️</span>
          软件设置
        </h2>
        <p className="page-description">
          配置密码管理器的全局设置选项
        </p>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner loading-spinner-large"></div>
          <p>正在加载设置...</p>
        </div>
      ) : (
        <div className="settings-container">
          <div className="settings-card">
            <div className="card-header">
              <div className="card-header-icon">
                <span>📁</span>
              </div>
              <h3>仓库设置</h3>
            </div>
            
            <div className="card-content">
              <div className="form-group">
                <label className="form-label" htmlFor="defaultRepositoryPath">
                  默认仓库保存目录
                </label>
                <div className="directory-selector">
                  <input
                    id="defaultRepositoryPath"
                    type="text"
                    className="form-input"
                    value={settings.defaultRepositoryPath}
                    readOnly
                    placeholder="点击浏览选择默认保存目录"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-with-icon"
                    onClick={handleSelectDirectory}
                    disabled={isSaving}
                  >
                    <span className="btn-icon">📂</span>
                    浏览
                  </button>
                </div>
                <div className="setting-description">
                  <div className="info-icon">ℹ️</div>
                  <p>所有新创建的密码仓库将默认保存在此目录</p>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions settings-actions">
            <button
              type="button"
              className="btn btn-secondary btn-with-icon"
              onClick={handleGoBack}
              disabled={isSaving}
            >
              <span className="btn-icon">⬅️</span>
              返回
            </button>
            <button
              type="button"
              className="btn btn-primary btn-with-icon"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="loading-spinner"></span>
                  保存中...
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  保存设置
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage; 