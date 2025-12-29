import { useState, useCallback, useEffect } from 'react';
import { chatbotAPI } from '../api/chatbot';

const SESSION_KEY = 'chatbot_session_id';
const MESSAGES_KEY = 'chatbot_messages';

/**
 * Custom hook để quản lý trạng thái chatbot
 * - Lưu sessionId vào localStorage để duy trì session
 * - Lưu tin nhắn để khôi phục khi reload
 */
export const useChatbot = () => {
  const [messages, setMessages] = useState(() => {
    // Khôi phục tin nhắn từ localStorage
    const saved = localStorage.getItem(MESSAGES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [sessionId, setSessionId] = useState(() => {
    // Khôi phục sessionId từ localStorage
    return localStorage.getItem(SESSION_KEY) || null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist messages khi thay đổi
  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  // Persist sessionId khi thay đổi
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(SESSION_KEY, sessionId);
    }
  }, [sessionId]);

  // Chuyển đổi messages sang format cho API
  const getHistoryForAPI = useCallback(() => {
    return messages.map(msg => ({
      role: msg.role,
      text: msg.content
    }));
  }, [messages]);

  // Gửi tin nhắn mới
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    
    // Thêm tin nhắn user
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = getHistoryForAPI();
      const response = await chatbotAPI.askWithHistory(sessionId, text.trim(), history);
      
      // Cập nhật sessionId nếu là session mới
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
      }

      // Thêm tin nhắn từ assistant
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
        context: response.context,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      // Xóa tin nhắn user nếu có lỗi
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading, getHistoryForAPI]);

  // Xóa toàn bộ lịch sử chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(MESSAGES_KEY);
    setError(null);
  }, []);

  return {
    messages,
    sessionId,
    isLoading,
    error,
    sendMessage,
    clearChat
  };
};
