export interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
}

export interface ConversationSummary {
  id: string
  title: string
  createdAt: string
  messageCount: number
  lastMessage: string | null
}

export interface SendMessageResult {
  userMessage: Message
  aiMessage: Message
  title: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const getConversations = () =>
  request<ConversationSummary[]>('/conversations')

export const createConversation = (title?: string) =>
  request<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })

export const getConversation = (id: string) =>
  request<Conversation>(`/conversations/${id}`)

export const renameConversation = (id: string, title: string) =>
  request<Conversation>(`/conversations/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title }),
  })

export const deleteConversation = (id: string) =>
  request<void>(`/conversations/${id}`, { method: 'DELETE' })

export const getMessages = (id: string) =>
  request<Message[]>(`/conversations/${id}/messages`)

export const sendMessage = (conversationId: string, content: string) =>
  request<SendMessageResult>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })

export interface SystemStatus {
  api: { status: 'online' | 'offline' }
  database: { status: 'online' | 'offline'; responseMs: number }
  pythonApi: { status: 'online' | 'offline'; responseMs: number }
  metrics: {
    uptimeSeconds: number
    requestCount: number
    avgResponseMs: number
  }
}

export const getStatus = () => request<SystemStatus>('/status')
