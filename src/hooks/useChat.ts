import { useState, useEffect, useCallback, useRef } from 'react'
import * as api from '../utils/api'

export type { Message, Conversation } from '../utils/api'
import type { Message, Conversation } from '../utils/api'

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const loadedIds = useRef(new Set<string>())

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const summaries = await api.getConversations()
        if (cancelled) return

        const convs: Conversation[] = summaries.map(s => ({
          id: s.id,
          title: s.title,
          createdAt: s.createdAt,
          messages: [],
        }))
        setConversations(convs)
        setLoading(false)

        if (summaries.length === 0) return

        const first = summaries[0]
        setActiveId(first.id)
        setMessagesLoading(true)
        try {
          const messages = await api.getMessages(first.id)
          if (cancelled) return
          loadedIds.current.add(first.id)
          setConversations(prev =>
            prev.map(c => c.id === first.id ? { ...c, messages } : c)
          )
        } finally {
          if (!cancelled) setMessagesLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  const activeConversation = conversations.find(c => c.id === activeId) ?? conversations[0]

  const selectConversation = useCallback(async (id: string) => {
    setActiveId(id)
    if (loadedIds.current.has(id)) return

    setMessagesLoading(true)
    try {
      const messages = await api.getMessages(id)
      loadedIds.current.add(id)
      setConversations(prev =>
        prev.map(c => c.id === id ? { ...c, messages } : c)
      )
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  const renameConversation = useCallback(async (id: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: trimmed } : c))
    try {
      await api.renameConversation(id, trimmed)
    } catch {
      const conv = await api.getConversation(id)
      setConversations(prev => prev.map(c => c.id === id ? conv : c))
    }
  }, [])

  const deleteConversation = useCallback(async (id: string) => {
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id)
      if (id === activeId) setActiveId(next[0]?.id ?? null)
      return next
    })
    loadedIds.current.delete(id)
    await api.deleteConversation(id)
  }, [activeId])

  const newConversation = useCallback(async () => {
    const conv = await api.createConversation()
    loadedIds.current.add(conv.id)
    setConversations(prev => [conv, ...prev])
    setActiveId(conv.id)
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping || !activeId) return

    const tempId = `temp-${Date.now()}`
    const tempMsg: Message = {
      id: tempId,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }
    setConversations(prev =>
      prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, tempMsg] } : c)
    )
    setIsTyping(true)

    try {
      const { userMessage, aiMessage, title } = await api.sendMessage(activeId, content)
      setConversations(prev =>
        prev.map(c => {
          if (c.id !== activeId) return c
          const msgs = c.messages.filter(m => m.id !== tempId)
          return { ...c, title, messages: [...msgs, userMessage, aiMessage] }
        })
      )
    } catch {
      setConversations(prev =>
        prev.map(c =>
          c.id === activeId
            ? { ...c, messages: c.messages.filter(m => m.id !== tempId) }
            : c
        )
      )
    } finally {
      setIsTyping(false)
    }
  }, [activeId, isTyping])

  return {
    conversations,
    activeConversation,
    activeId,
    selectConversation,
    isTyping,
    loading,
    messagesLoading,
    sendMessage,
    newConversation,
    renameConversation,
    deleteConversation,
  }
}
