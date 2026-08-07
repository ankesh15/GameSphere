import apiClient from "./http";

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  editedAt?: string | null;
};

export async function getRoomMessages(roomId: string, limit = 50, before?: string): Promise<ChatMessage[]> {
  const response = await apiClient.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`, {
    params: { limit, before }
  });
  return response.data;
}
