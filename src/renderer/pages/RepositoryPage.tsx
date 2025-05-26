import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repository, PasswordItem } from '../../lib/repository-manager';
import useToastContext from '../hooks/useToastContext';
import { ipcRenderer } from '../index';

// 修改PasswordItem接口以支持notes字段
interface ExtendedPasswordItem extends Omit<PasswordItem, 'description'> {
  notes: string;
}

// 密码确认对话框组件
const PasswordDialog: React.FC<{
  isOpen: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
  title: string;
}> = ({ isOpen, onConfirm, onCancel, title }) => {
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { showError } = useToastContext();

  // 当对话框打开或关闭时重置状态
  React.useEffect(() => {
    if (isOpen) {
      setPassword('');
      setValidationError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!password.trim()) {
      setValidationError('请输入仓库密码');
      showError('请输入仓库密码');
      return;
    }
    onConfirm(password);
  };
  
  // 按Enter键确认
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password.trim()) {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content password-dialog">
        <div className="modal-header">
          <div className="modal-icon">🔐</div>
          <h3>{title || '请输入仓库密码'}</h3>
        </div>
        <p className="modal-description">请输入您的仓库密码来确认此操作</p>
        <div className="form-group">
          <label className="form-label" htmlFor="repositoryPassword">仓库密码</label>
          <div className="password-input-container">
            <input
              id="repositoryPassword"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="输入您的仓库密码"
            />
          </div>
          {validationError && (
            <div className="input-error-message">{validationError}</div>
          )}
        </div>
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary btn-with-icon" 
            onClick={onCancel}
          >
            <span className="btn-icon">❌</span>
            取消
          </button>
          <button 
            type="button" 
            className="btn btn-primary btn-with-icon" 
            onClick={handleConfirm}
          >
            <span className="btn-icon">✓</span>
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

// 确认对话框组件
const ConfirmDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}> = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content password-dialog">
        <div className="modal-header">
          <div className="modal-icon">⚠️</div>
          <h3>确认操作</h3>
        </div>
        <p className="modal-description">{message}</p>
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary btn-with-icon" 
            onClick={onCancel}
          >
            <span className="btn-icon">❌</span>
            取消
          </button>
          <button 
            type="button" 
            className="btn btn-danger btn-with-icon" 
            onClick={onConfirm}
          >
            <span className="btn-icon">🗑️</span>
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};

// 编辑密码对话框组件
const EditPasswordDialog: React.FC<{
  isOpen: boolean;
  isAdding: boolean;
  passwordItem: Partial<PasswordItem>;
  onSave: () => void;
  onCancel: () => void;
  onChange: (updatedItem: Partial<PasswordItem>) => void;
  isSaving: boolean;
}> = ({ isOpen, isAdding, passwordItem, onSave, onCancel, onChange, isSaving }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content password-form-dialog">
        <div className="modal-header">
          <div className="modal-icon">{isAdding ? '🆕' : '✏️'}</div>
          <h3>{isAdding ? '添加新密码' : '编辑密码'}</h3>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="title">标题</label>
          <input
            id="title"
            type="text"
            className="form-input"
            value={passwordItem.title || ''}
            onChange={(e) => onChange({ ...passwordItem, title: e.target.value })}
            disabled={isSaving}
            placeholder="例如：GitHub账号"
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="username">用户名</label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={passwordItem.username || ''}
              onChange={(e) => onChange({ ...passwordItem, username: e.target.value })}
              disabled={isSaving}
              placeholder="登录用户名/邮箱"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={passwordItem.password || ''}
              onChange={(e) => onChange({ ...passwordItem, password: e.target.value })}
              disabled={isSaving}
              placeholder="登录密码"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="url">网址</label>
          <input
            id="url"
            type="text"
            className="form-input"
            value={passwordItem.url || ''}
            onChange={(e) => onChange({ ...passwordItem, url: e.target.value })}
            disabled={isSaving}
            placeholder="https://example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="notes">备注</label>
          <textarea
            id="notes"
            className="form-textarea"
            value={passwordItem.description || ''}
            onChange={(e) => onChange({ ...passwordItem, description: e.target.value })}
            disabled={isSaving}
            placeholder="添加其他相关信息或提示..."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary btn-with-icon"
            onClick={onCancel}
            disabled={isSaving}
          >
            <span className="btn-icon">❌</span>
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary btn-with-icon"
            onClick={onSave}
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
                保存
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface RepositoryPageProps {
  repository: Repository;
  setRepository: (repository: Repository | null) => void;
}

// 初始新密码项状态
const initialNewItem: Partial<PasswordItem> = {
  title: '',
  username: '',
  password: '',
  url: '',
  description: ''
};

// 密码列表组件
const RepositoryPage: React.FC<RepositoryPageProps> = ({ repository, setRepository }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();

  // 状态
  const [items, setItems] = useState<PasswordItem[]>(repository.items);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<PasswordItem>>(initialNewItem);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<{
    type: 'save' | 'delete';
    item?: PasswordItem;
  } | null>(null);
  
  // 关闭仓库
  const handleCloseRepository = () => {
    setRepository(null);
    navigate('/');
  };

  // 开始添加新密码
  const handleAddItem = () => {
    setIsAddingItem(true);
    setEditingItemId(null);
    setNewItem(initialNewItem);
  };

  // 取消添加/编辑
  const handleCancelEdit = () => {
    setIsAddingItem(false);
    setEditingItemId(null);
    setNewItem(initialNewItem);
  };

  // 开始编辑密码
  const handleEditItem = (item: PasswordItem) => {
    setIsAddingItem(false);
    setEditingItemId(item.id);
    setNewItem({ ...item });
  };

  // 删除密码
  const handleDeleteItem = (item: PasswordItem) => {
    setPendingAction({
      type: 'delete',
      item
    });
    setShowConfirmDialog(true);
  };

  // 保存密码
  const handleSaveItem = async () => {
    // 验证输入
    if (!newItem.title?.trim()) {
      showError('请输入标题');
      return;
    }

    if (!newItem.password?.trim()) {
      showError('请输入密码');
      return;
    }

    // 准备要保存的密码项
    const itemToSave: PasswordItem = {
      id: editingItemId || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newItem.title.trim(),
      username: newItem.username || '',
      password: newItem.password.trim(),
      url: newItem.url || '',
      description: newItem.description || '',
      createdAt: editingItemId ? 
        (items.find(item => item.id === editingItemId)?.createdAt || new Date().toISOString()) : 
        new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 设置待处理操作
    setPendingAction({
      type: 'save',
      item: itemToSave
    });

    // 打开密码确认对话框
    setShowPasswordDialog(true);
  };

  // 实际保存/删除操作，在密码确认后执行
  const handlePasswordConfirm = async (password: string) => {
    if (!pendingAction) return;
    
    setIsSaving(true);
    setShowPasswordDialog(false);
    
    try {
      if (pendingAction.type === 'save' && pendingAction.item) {
        // 保存操作
        const updatedItems = editingItemId 
          ? items.map(item => item.id === editingItemId ? pendingAction.item! : item)
          : [...items, pendingAction.item];
        
        // 保存到仓库文件
        const result = await ipcRenderer.invoke(
          'save-repository', 
          {
            ...repository,
            items: updatedItems
          },
          password
        );
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        // 密码验证成功后再更新本地状态
        setItems(updatedItems);
        
        // 更新仓库状态
        setRepository({
          ...repository,
          items: updatedItems
        });
        
        // 重置表单
        setIsAddingItem(false);
        setEditingItemId(null);
        setNewItem(initialNewItem);
        
        // 显示成功消息
        showSuccess(editingItemId ? '密码已更新' : '新密码已添加');
        
      } else if (pendingAction.type === 'delete' && pendingAction.item) {
        // 删除操作
        const updatedItems = items.filter(item => item.id !== pendingAction.item!.id);
        
        // 保存到仓库文件
        const result = await ipcRenderer.invoke(
          'save-repository', 
          {
            ...repository,
            items: updatedItems
          },
          password
        );
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        // 密码验证成功后再更新本地状态
        setItems(updatedItems);
        
        // 更新仓库状态
        setRepository({
          ...repository,
          items: updatedItems
        });
        
        // 显示成功消息
        showSuccess('密码已删除');
      }
    } catch (err) {
      let errorMessage = (err as Error).message;
      
      // 根据错误类型提供更具体的错误信息
      if (errorMessage.includes('密码不正确')) {
        errorMessage = '仓库密码验证失败，无法完成操作';
      } else if (pendingAction.type === 'save') {
        errorMessage = `保存密码失败：${errorMessage}`;
      } else if (pendingAction.type === 'delete') {
        errorMessage = `删除密码失败：${errorMessage}`;
      }
      
      showError(errorMessage);
    } finally {
      setIsSaving(false);
      setPendingAction(null);
    }
  };

  // 处理确认对话框
  const handleConfirmDialogConfirm = () => {
    setShowConfirmDialog(false);
    if (pendingAction?.type === 'delete') {
      setShowPasswordDialog(true);
    }
  };

  // 处理取消对话框
  const handleDialogCancel = () => {
    setShowPasswordDialog(false);
    setShowConfirmDialog(false);
    
    // 根据当前操作类型提供更具体的取消信息
    if (pendingAction) {
      const actionType = pendingAction.type === 'save' ? 
        (isAddingItem ? '添加' : '编辑') : 
        '删除';
      showError(`已取消${actionType}密码操作`);
    } else {
      showError('操作已取消');
    }
    
    setPendingAction(null);
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(`已复制${field}到剪贴板`);
  };

  // 切换密码可见性
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswordIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  return (
    <div className="repository-page">
      <div className="repository-header">
        <h2>
          <span className="repository-icon">🔐</span>
          {repository.name}
        </h2>
        <div className="repository-actions">
          <button className="btn btn-secondary btn-with-icon" onClick={handleCloseRepository}>
            <span className="btn-icon">🔒</span>
            关闭仓库
          </button>
        </div>
      </div>

      {/* 新增或编辑表单 */}
      {(isAddingItem || editingItemId) && (
        <EditPasswordDialog
          isOpen={isAddingItem || editingItemId !== null}
          isAdding={isAddingItem}
          passwordItem={newItem}
          onSave={handleSaveItem}
          onCancel={handleCancelEdit}
          onChange={(updatedItem) => setNewItem(updatedItem)}
          isSaving={isSaving}
        />
      )}

      {/* 密码列表 */}
      <div className="password-list-container">
        <div className="password-list-header">
          <h3>
            <span className="list-header-icon">🔑</span>
            密码列表
          </h3>
          <button
            type="button"
            className="btn btn-primary btn-with-icon btn-add-password"
            onClick={handleAddItem}
            disabled={isAddingItem || editingItemId !== null || isSaving}
          >
            <span className="btn-icon">✨</span>
            添加密码
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-message">
            <div className="empty-icon">📝</div>
            <p>暂无密码，点击添加密码按钮开始创建</p>
          </div>
        ) : (
          <ul className="password-list">
            {items.map((item) => (
              <li key={item.id} className="password-item">
                <div className="password-item-details">
                  <h3>
                    <span className="item-icon">🔐</span>
                    {item.title}
                  </h3>
                  {item.username && (
                    <p>
                      <strong>用户名：</strong>
                      <span>{item.username}</span>
                      <button 
                        className="btn-icon btn-copy" 
                        onClick={() => copyToClipboard(item.username, '用户名')}
                        title="复制用户名"
                      >
                        📋
                      </button>
                    </p>
                  )}
                  <p>
                    <strong>密码：</strong>
                    <span>{visiblePasswordIds.includes(item.id) ? item.password : '••••••••'}</span>
                    <div className="password-controls">
                      <button 
                        className="btn-icon btn-eye" 
                        onClick={() => togglePasswordVisibility(item.id)}
                        title={visiblePasswordIds.includes(item.id) ? "隐藏密码" : "显示密码"}
                      >
                        {visiblePasswordIds.includes(item.id) ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <button 
                        className="btn-icon btn-copy" 
                        onClick={() => copyToClipboard(item.password, '密码')}
                        title="复制密码"
                      >
                        📋
                      </button>
                    </div>
                  </p>
                  {item.url && (
                    <p>
                      <strong>网址：</strong>
                      <span>{item.url}</span>
                      <button 
                        className="btn-icon btn-copy" 
                        onClick={() => copyToClipboard(item.url, '网址')}
                        title="复制网址"
                      >
                        📋
                      </button>
                    </p>
                  )}
                  {item.description && (
                    <p className="item-notes">
                      <strong>备注：</strong>
                      <span>{item.description}</span>
                    </p>
                  )}
                </div>
                <div className="password-item-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm btn-with-icon"
                    onClick={() => handleEditItem(item)}
                    disabled={isSaving}
                  >
                    <span className="btn-icon">✏️</span>
                    编辑
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm btn-with-icon"
                    onClick={() => handleDeleteItem(item)}
                    disabled={isSaving}
                  >
                    <span className="btn-icon">🗑️</span>
                    删除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 密码确认对话框 */}
      <PasswordDialog
        isOpen={showPasswordDialog}
        onConfirm={handlePasswordConfirm}
        onCancel={handleDialogCancel}
        title={
          pendingAction?.type === 'save' 
            ? (editingItemId ? '确认编辑密码' : '确认添加密码') 
            : '确认删除密码'
        }
      />

      {/* 确认删除对话框 */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmDialogConfirm}
        onCancel={handleDialogCancel}
        message={`确定要删除密码"${pendingAction?.item?.title || ''}"吗？此操作无法撤销。`}
      />
    </div>
  );
};

export default RepositoryPage; 