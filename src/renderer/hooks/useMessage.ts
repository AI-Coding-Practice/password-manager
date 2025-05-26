import { useState, useCallback } from 'react';

// 自定义Hook：消息管理（错误和成功）
export function useMessage(autoHideTime: number = 3000) {
  const [error, setErrorInternal] = useState<string>('');
  const [success, setSuccessInternal] = useState<string>('');

  // 设置错误消息并自动清除
  const setError = useCallback((message: string) => {
    setErrorInternal(message);
    if (message) {
      const timer = setTimeout(() => {
        setErrorInternal('');
      }, autoHideTime);
      
      // 清除之前的定时器以避免内存泄漏
      return () => clearTimeout(timer);
    }
  }, [autoHideTime]);

  // 设置成功消息并自动清除
  const setSuccess = useCallback((message: string) => {
    setSuccessInternal(message);
    if (message) {
      const timer = setTimeout(() => {
        setSuccessInternal('');
      }, autoHideTime);
      
      // 清除之前的定时器以避免内存泄漏
      return () => clearTimeout(timer);
    }
  }, [autoHideTime]);

  // 清除所有消息
  const clearMessages = useCallback(() => {
    setErrorInternal('');
    setSuccessInternal('');
  }, []);

  return {
    error,
    success,
    setError,
    setSuccess,
    clearMessages
  };
} 