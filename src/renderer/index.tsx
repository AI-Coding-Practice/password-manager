import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// 确保在浏览器环境中不会报错
const electron = window.electron || {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => {
      console.warn(`IPC called before electron was ready: ${channel}`, args);
      return Promise.resolve({ success: false, error: 'Electron not initialized' });
    }
  }
};

// 导出一个辅助函数，供其他组件使用
export const ipcRenderer = electron.ipcRenderer;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 