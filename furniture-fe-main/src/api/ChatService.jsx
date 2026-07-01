import axios from 'axios';

const API_URL = 'http://localhost:8080/api/chatbot';

class ChatService {
  /**
   * Gửi tin nhắn chat
   */
  async sendMessage(message, sessionId, userId = null) {
    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message,
        sessionId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử chat
   */
  async getChatHistory(sessionId) {
    try {
      const response = await axios.get(`${API_URL}/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  /**
   * Xóa lịch sử chat
   */
  async clearChatHistory(sessionId) {
    try {
      const response = await axios.delete(`${API_URL}/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }

  /**
   * Tạo session ID mới
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new ChatService();