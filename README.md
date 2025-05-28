```
又一个完全用AI开发的项目，本项目采用cursor开发，所有代码，包括架构设计，都是由AI自动完成的。

部分prompts见docs目录。

欢迎对本应用软件提出更多优化建议

也可以针对prompts过程提出您的宝贵意见

```


# 密码管理器

一款安全的本地密码管理应用程序，使用Electron和React构建。

![应用图标](assets/icons/png/128x128.png)

## 功能特点

- 创建和管理多个密码库
- AES-256强加密保护您的密码数据
- 本地存储，无需互联网连接
- 支持Windows、macOS和Linux系统
- 简洁直观的用户界面
- 自动生成强密码

## 技术栈

- Electron
- React
- TypeScript
- webpack
- crypto-js (AES加密)

## 安装

### 从发布版安装

1. 前往[发布页面](https://github.com/AI-Coding-Practice/password-manager/releases)
2. 下载适合您系统的安装包：
   - Windows: `Password-Manager-Setup-1.0.0.exe`
   - macOS: `Password-Manager-Setup-1.0.0.dmg` （暂未提供，可自行用下面的build命令进行打包）
   - Linux: `Password-Manager-Setup-1.0.0.AppImage` 或 `.deb` （暂未提供，可自行用下面的build命令进行打包）
3. 运行安装程序，按照提示完成安装

### 从源码构建

1. 克隆仓库
   ```
   git clone https://github.com/AI-Coding-Practice/password-manager.git
   cd password-manager
   ```

2. 安装依赖
   ```
   npm install
   ```

3. 开发模式运行
   ```
   npm run dev
   ```

4. 构建生产版本
   ```
   # 所有平台
   npm run build:prod
   
   # 仅Windows
   npm run build:win
   
   # 仅macOS
   npm run build:mac
   
   # 仅Linux
   npm run build:linux
   ```

## 使用说明

### 创建密码库

1. 启动应用后，点击"创建新仓库"
2. 输入仓库名称和主密码
3. 选择仓库保存位置
4. 点击"创建"完成

### 打开密码库

1. 启动应用，点击"打开仓库"
2. 选择已有密码库文件(.vault)
3. 输入主密码
4. 点击"打开"

### 管理密码

- 点击"添加"按钮创建新密码条目
- 点击条目查看详情或编辑
- 使用搜索框快速查找密码

## 安全说明

- 所有密码数据使用AES-256算法加密
- 密钥通过PBKDF2函数从主密码派生
- 密码库文件完全加密，不存储明文数据
- 密码仅在内存中临时解密，应用关闭后自动清除

## 开发计划

- [ ] 增强密码生成器
- [ ] 密码健康检查
- [ ] 数据导入/导出功能
- [ ] 自动锁定功能
- [ ] 双因素认证支持

## 许可证

ISC License 
