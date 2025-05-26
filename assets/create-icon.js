const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// 创建1024x1024的画布
const width = 1024;
const height = 1024;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// 绘制背景
ctx.fillStyle = '#4A86E8';
ctx.fillRect(0, 0, width, height);

// 绘制锁形状
ctx.fillStyle = 'white';
ctx.fillRect(312, 312, 400, 400);

// 绘制锁的内部
ctx.fillStyle = '#4A86E8';
ctx.fillRect(412, 412, 200, 200);

// 绘制锁的圆形部分
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(512, 512, 50, 0, Math.PI * 2);
ctx.fill();

// 绘制锁的钥匙孔
ctx.fillStyle = 'white';
ctx.fillRect(507, 462, 10, 100);

// 保存为PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'icon.png'), buffer);
console.log('Icon created successfully!'); 