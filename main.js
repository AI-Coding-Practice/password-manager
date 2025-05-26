// Electron主进程入口文件
// 强制设置为生产模式
process.env.NODE_ENV = 'production';
// 引导TypeScript编译后的主进程代码
require('./dist/main'); 