import { useState, useEffect } from 'react'
import ConversationList from './ConversationList'
import ChatWindow from './ChatWindow'

interface Conversation {
  id: string
  title: string
  createdAt: string
}

interface ChatPageProps {
  user: string
  onLogout: () => void
}

export default function ChatPage({ user, onLogout }: ChatPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const API_BASE = 'http://localhost:3001/api'

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/conversations`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch conversations')
      const data = await res.json()
      setConversations(data.conversations || [])
      if (data.conversations?.length > 0) {
        setCurrentConversationId(data.conversations[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConversation = async () => {
    try {
      setError('')
      const res = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to create conversation')
      const data = await res.json()
      const newConv = data.conversation
      setConversations([...conversations, newConv])
      setCurrentConversationId(newConv.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation')
    }
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      setError('')
      const res = await fetch(`${API_BASE}/conversations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to delete conversation')
      const updated = conversations.filter((c) => c.id !== id)
      setConversations(updated)
      if (currentConversationId === id) {
        setCurrentConversationId(updated[0]?.id || null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ConversationList
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onCreateConversation={handleCreateConversation}
        onDeleteConversation={handleDeleteConversation}
        onLogout={onLogout}
        user={user}
      />

      <div className="flex-1 flex flex-col">
        {currentConversationId ? (
          <ChatWindow conversationId={currentConversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-4">No conversation selected</p>
              <button
                onClick={handleCreateConversation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Create New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg max-w-sm">
          {error}
        </div>
      )}
    </div>
  )
}
