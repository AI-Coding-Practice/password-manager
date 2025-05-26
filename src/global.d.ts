// 全局类型声明
interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  };
}

interface Window {
  electron: ElectronAPI;
} 