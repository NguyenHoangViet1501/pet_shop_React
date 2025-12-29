import { apiFetch } from '../utils/api';

// Chatbot API functions
export const chatbotAPI = {
  // Gửi tin nhắn với lịch sử chat
  askWithHistory: async (sessionId, question, history = []) => {
    return await apiFetch('/v1/chat/ask-with-history', {
      method: 'POST',
      body: { sessionId, question, history }
    });
  },

  // Gửi tin nhắn đơn giản (không cần history)
  ask: async (question) => {
    return await apiFetch('/v1/chat/ask', {
      method: 'POST',
      body: { question }
    });
  }
};
