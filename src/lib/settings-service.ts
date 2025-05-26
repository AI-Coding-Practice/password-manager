import { app } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';

// 定义设置接口
export interface Settings {
  defaultRepositoryPath: string;
}

// 默认设置
const DEFAULT_SETTINGS: Settings = {
  defaultRepositoryPath: '',
};

class SettingsService {
  private settingsPath: string;
  private settings: Settings;

  constructor() {
    // 设置文件保存在用户数据目录
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
    this.settings = { ...DEFAULT_SETTINGS };
  }

  // 初始化设置服务
  async init(): Promise<void> {
    try {
      await this.loadSettings();
      
      // 如果没有设置默认仓库路径，则使用用户文档目录
      if (!this.settings.defaultRepositoryPath) {
        this.settings.defaultRepositoryPath = app.getPath('documents');
        await this.saveSettings();
      }
    } catch (error) {
      console.error('初始化设置失败:', error);
      // 如果加载失败，使用默认设置
      this.settings = { ...DEFAULT_SETTINGS };
      this.settings.defaultRepositoryPath = app.getPath('documents');
      await this.saveSettings();
    }
  }

  // 加载设置
  private async loadSettings(): Promise<void> {
    try {
      const data = await fs.readFile(this.settingsPath, 'utf-8');
      this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (error) {
      // 如果文件不存在或有错误，使用默认设置
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
        throw error;
      }
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  // 保存设置
  async saveSettings(): Promise<void> {
    try {
      await fs.writeFile(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (error) {
      console.error('保存设置失败:', error);
      throw error;
    }
  }

  // 获取设置
  getSettings(): Settings {
    return { ...this.settings };
  }

  // 更新设置
  async updateSettings(newSettings: Partial<Settings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  // 获取默认仓库路径
  getDefaultRepositoryPath(): string {
    return this.settings.defaultRepositoryPath;
  }

  // 设置默认仓库路径
  async setDefaultRepositoryPath(path: string): Promise<void> {
    this.settings.defaultRepositoryPath = path;
    await this.saveSettings();
  }
}

// 导出单例实例
export const settingsService = new SettingsService(); 