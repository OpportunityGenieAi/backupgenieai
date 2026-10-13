import { api } from './client';

export interface ChatReply {
  text: string;
  conversation_id?: string | null;
  title?: string | null;
}

export interface ConversationSummary {
  id: string;
  title: string;
  preview?: string | null;
  updated_at: string;
}

export interface StoredMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ConversationDetail {
  id: string;
  title: string;
  messages: StoredMessage[];
}

export const AdvisorChatApi = {
  /**
   * Sends one new message. Pass the conversation id to continue a saved chat; leave it out to start a
   * new one. The server keeps the history, saves the exchange and returns the id of the chat.
   */
  async send(message: string, conversationId?: string): Promise<ChatReply> {
    return api.post(
      '/advisor/chat',
      { message, conversation_id: conversationId ?? null },
      { auth: true },
    );
  },

  async list(): Promise<ConversationSummary[]> {
    return api.get('/advisor/conversations', { auth: true });
  },

  async get(id: string): Promise<ConversationDetail> {
    return api.get(`/advisor/conversations/${id}`, { auth: true });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/advisor/conversations/${id}`, { auth: true });
  },
};
