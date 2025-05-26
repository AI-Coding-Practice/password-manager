// 使用CommonJS语法避免类型错误
const { contextBridge, ipcRenderer } = require('electron');

// 通过contextBridge暴露electron变量到渲染进程
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => {
      // 白名单频道
      const validChannels = [
        'create-repository',
        'open-repository',
        'save-repository',
        'select-repository-path',
        'select-save-file',
        'save-repository-file',
        // 设置相关频道
        'get-settings',
        'update-settings',
        'select-directory',
        // 仓库列表相关
        'get-repository-list'
      ];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`));
    }
  }
}); 