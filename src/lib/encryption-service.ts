import CryptoJS from 'crypto-js';

export class EncryptionService {
  // 加密数据，使用AES-256算法
  encrypt(data: string, password: string): string {
    // 使用PBKDF2派生密钥
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 1000
    });
    
    // 生成随机IV
    const iv = CryptoJS.lib.WordArray.random(128 / 8);
    
    // 加密数据
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    
    // 将salt、iv和加密后的数据拼接成一个字符串
    const result = salt.toString() + iv.toString() + encrypted.toString();
    return result;
  }
  
  // 解密数据
  decrypt(encryptedData: string, password: string): string {
    try {
      // 从加密字符串中提取salt、iv和加密后的数据
      const salt = CryptoJS.enc.Hex.parse(encryptedData.substr(0, 32));
      const iv = CryptoJS.enc.Hex.parse(encryptedData.substr(32, 32));
      const encrypted = encryptedData.substring(64);
      
      // 使用PBKDF2派生密钥
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 1000
      });
      
      // 解密数据
      const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('解密失败，密码可能不正确');
    }
  }
} 