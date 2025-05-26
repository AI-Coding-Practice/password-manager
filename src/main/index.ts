import { app, BrowserWindow, dialog, ipcMain, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import fs from 'fs';
import { RepositoryManager } from '../lib/repository-manager';
import { settingsService } from '../lib/settings-service';

let mainWindow: BrowserWindow | null = null;
const repositoryManager = new RepositoryManager();

async function createWindow() {
  // 初始化设置服务
  await settingsService.init();
  
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // 开发环境禁用webSecurity以避免CORS问题
    }
  });

  // 加载入口页面
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  if (isDev) {
    // 开发环境使用webpack-dev-server
    mainWindow.loadURL('http://localhost:3000');
    
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools();
    
    // 启用热重载
    mainWindow.webContents.on('did-fail-load', () => {
      console.log('页面加载失败，尝试重新加载');
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
      }, 1000);
    });
  } else {
    // 在当前目录中查找index.html
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC处理
// 创建仓库
ipcMain.handle('create-repository', async (event: IpcMainInvokeEvent, repoName: string, password: string) => {
  try {
    const repository = await repositoryManager.createRepository(repoName, password);
    return { success: true, data: repository };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// 打开仓库
ipcMain.handle('open-repository', async (event: IpcMainInvokeEvent, filePath: string, password: string) => {
  try {
    const repositoryData = await repositoryManager.openRepository(filePath, password);
    return { success: true, data: repositoryData };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// 保存仓库
ipcMain.handle('save-repository', async (event: IpcMainInvokeEvent, repositoryData: any, password: string) => {
  try {
    await repositoryManager.saveRepository(repositoryData, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// 选择文件路径
ipcMain.handle('select-repository-path', async (event: IpcMainInvokeEvent, isSave: boolean) => {
  if (!mainWindow) return { canceled: true };

  if (isSave) {
    // 获取默认的仓库保存路径
    const defaultPath = settingsService.getDefaultRepositoryPath();
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '保存密码仓库',
      defaultPath: path.join(defaultPath, '新密码仓库.vault'),
      filters: [{ name: '密码仓库文件', extensions: ['vault'] }],
    });
    return result;
  } else {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '打开密码仓库',
      filters: [{ name: '密码仓库文件', extensions: ['vault'] }],
      properties: ['openFile'],
    });
    return result;
  }
});

// 选择保存文件
ipcMain.handle('select-save-file', async (event: IpcMainInvokeEvent, options: any) => {
  if (!mainWindow) return { success: false, error: '窗口未初始化' };

  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: options.title || '保存文件',
      defaultPath: options.defaultPath,
      filters: options.filters || [{ name: '所有文件', extensions: ['*'] }],
    });
    
    return { 
      success: !result.canceled, 
      filePath: result.filePath,
      canceled: result.canceled 
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// 保存仓库文件
ipcMain.handle('save-repository-file', async (event: IpcMainInvokeEvent, repositoryData: any, password: string) => {
  try {
    // 如果没有指定文件路径，则使用默认路径
    if (!repositoryData.filePath) {
      const defaultPath = settingsService.getDefaultRepositoryPath();
      const fileName = `${repositoryData.name || '新密码仓库'}.vault`;
      repositoryData.filePath = path.join(defaultPath, fileName);
    }
    
    // 使用repositoryManager保存仓库数据到指定的文件路径
    await repositoryManager.saveRepository(repositoryData, password);
    return { success: true, data: repositoryData };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// 设置相关的IPC处理程序
// 获取设置
ipcMain.handle('get-settings', async () => {
  try {
    const settings = settingsService.getSettings();
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// 更新设置
ipcMain.handle('update-settings', async (event: IpcMainInvokeEvent, settings: any) => {
  try {
    await settingsService.updateSettings(settings);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// 选择文件夹路径
ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return { canceled: true };

  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择文件夹',
    properties: ['openDirectory']
  });
  
  return result;
});

// 扫描获取仓库列表
ipcMain.handle('get-repository-list', async () => {
  try {
    const defaultPath = settingsService.getDefaultRepositoryPath();
    
    // 确保目录存在
    try {
      await fs.promises.access(defaultPath);
    } catch (error) {
      return { success: false, error: '默认仓库目录不存在或无法访问' };
    }
    
    // 读取目录内容
    const files = await fs.promises.readdir(defaultPath);
    
    // 过滤出.vault文件并获取其详细信息
    const repositories = await Promise.all(
      files
        .filter(file => file.endsWith('.vault'))
        .map(async (file) => {
          const filePath = path.join(defaultPath, file);
          const stats = await fs.promises.stat(filePath);
          
          return {
            name: path.basename(file, '.vault'),
            filePath,
            lastModified: stats.mtime.toISOString(),
            size: stats.size
          };
        })
    );
    
    return { success: true, data: repositories };
  } catch (error) {
    console.error('获取仓库列表失败：', error);
    return { success: false, error: (error as Error).message };
  }
}); 