import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatWindowProps {
  conversationId: string
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const API_BASE = 'http://localhost:3001/api'

  useEffect(() => {
    fetchMessages()
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch messages')
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    const userMessage = input.trim()
    setInput('')
    setSending(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to send message')
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mb-3"></div>
          <p className="text-slate-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && !sending ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-slate-500 text-lg">Start a conversation by sending a message</p>
              <p className="text-slate-400 text-sm mt-2">The AI assistant will respond instantly</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex message-animation ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-700 text-white'
                      : 'bg-white text-slate-900 border border-slate-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start message-animation">
                <div className="bg-white text-slate-900 px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex gap-1">
                    <span className="typing-indicator">
                      <span className="inline-block w-2 h-2 bg-slate-400 rounded-full"></span>
                      <span className="inline-block w-2 h-2 bg-slate-400 rounded-full ml-1"></span>
                      <span className="inline-block w-2 h-2 bg-slate-400 rounded-full ml-1"></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="p-6 border-t border-slate-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            {sending ? '⏳ Waiting...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
