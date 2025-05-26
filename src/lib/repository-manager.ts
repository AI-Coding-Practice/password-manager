import fs from 'fs/promises';
import path from 'path';
import { EncryptionService } from './encryption-service';

export interface PasswordItem {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  id: string;
  name: string;
  items: PasswordItem[];
  createdAt: string;
  updatedAt: string;
  filePath: string;
}

export class RepositoryManager {
  private encryptionService: EncryptionService;
  private activeRepository: Repository | null = null;
  private currentPassword: string | null = null;

  constructor() {
    this.encryptionService = new EncryptionService();
  }

  // 创建新的密码仓库
  async createRepository(name: string, password: string): Promise<Repository> {
    const repository: Repository = {
      id: this.generateId(),
      name,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      filePath: '',
    };

    this.activeRepository = repository;
    this.currentPassword = password; // 存储当前仓库的密码
    return repository;
  }

  // 打开密码仓库
  async openRepository(filePath: string, password: string): Promise<Repository> {
    try {
      const encryptedData = await fs.readFile(filePath, 'utf-8');
      const decryptedData = this.encryptionService.decrypt(encryptedData, password);
      const repository = JSON.parse(decryptedData) as Repository;
      repository.filePath = filePath;
      this.activeRepository = repository;
      this.currentPassword = password; // 存储当前仓库的密码
      return repository;
    } catch (error) {
      throw new Error('无法打开仓库，密码可能不正确或文件已损坏');
    }
  }

  // 保存密码仓库
  async saveRepository(repository: Repository, password: string): Promise<void> {
    if (!repository.filePath) {
      throw new Error('未指定仓库保存路径');
    }

    // 验证密码是否正确（与当前打开仓库的密码相同）
    if (this.currentPassword !== password) {
      throw new Error('密码不正确，无法保存仓库');
    }

    repository.updatedAt = new Date().toISOString();
    const jsonData = JSON.stringify(repository);
    const encryptedData = this.encryptionService.encrypt(jsonData, password);
    
    await fs.writeFile(repository.filePath, encryptedData, 'utf-8');
    this.activeRepository = repository;
  }

  // 获取当前活跃的仓库
  getActiveRepository(): Repository | null {
    return this.activeRepository;
  }

  // 添加密码项
  addPasswordItem(repository: Repository, item: Omit<PasswordItem, 'id' | 'createdAt' | 'updatedAt'>): Repository {
    const now = new Date().toISOString();
    const newItem: PasswordItem = {
      ...item,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    return {
      ...repository,
      items: [...repository.items, newItem],
      updatedAt: now,
    };
  }

  // 更新密码项
  updatePasswordItem(repository: Repository, itemId: string, updatedItem: Partial<PasswordItem>): Repository {
    const now = new Date().toISOString();
    const updatedItems = repository.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          ...updatedItem,
          updatedAt: now,
        };
      }
      return item;
    });

    return {
      ...repository,
      items: updatedItems,
      updatedAt: now,
    };
  }

  // 删除密码项
  deletePasswordItem(repository: Repository, itemId: string): Repository {
    return {
      ...repository,
      items: repository.items.filter(item => item.id !== itemId),
      updatedAt: new Date().toISOString(),
    };
  }

  // 生成唯一ID
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
} 