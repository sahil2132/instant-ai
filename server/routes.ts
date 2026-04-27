import { Router, Request, Response } from 'express'
import { store } from './store.ts'
import { simulateAIResponse } from './simulateAI.ts'
import { getMetrics } from './metrics.ts'

export const router = Router()

const PYTHON_API_URL = process.env.PYTHON_API_URL ?? 'http://localhost:8000'

async function fetchPythonStatus(): Promise<{
  pythonOnline: boolean
  database: { status: string; responseMs: number } | null
}> {
  try {
    const res = await fetch(`${PYTHON_API_URL}/api/status`, {
      signal: AbortSignal.timeout(1500),
    })
    if (!res.ok) return { pythonOnline: false, database: null }
    const data = await res.json() as { database?: { status: string; responseMs: number } }
    return { pythonOnline: true, database: data.database ?? null }
  } catch {
    return { pythonOnline: false, database: null }
  }
}

// GET /api/status
router.get('/status', async (_req: Request, res: Response) => {
  const [pyResult, metrics] = await Promise.all([
    fetchPythonStatus(),
    Promise.resolve(getMetrics()),
  ])
  res.json({
    api: { status: 'online' },
    pythonApi: {
      status: pyResult.pythonOnline ? 'online' : 'offline',
    },
    database: pyResult.database ?? { status: 'offline', responseMs: 0 },
    metrics: {
      uptimeSeconds: metrics.uptimeSeconds,
      requestCount: metrics.requestCount,
      avgResponseMs: metrics.avgResponseMs,
    },
  })
})

function deriveTitle(text: string): string {
  const words = text.trim().split(/\s+/).slice(0, 5).join(' ')
  return words.length < text.trim().length ? `${words}…` : words
}

// GET /api/conversations
router.get('/conversations', (_req: Request, res: Response) => {
  const conversations = store.getAll().map(c => ({
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
    messageCount: c.messages.length,
    lastMessage: c.messages.at(-1)?.content.slice(0, 80) ?? null,
  }))
  res.json(conversations)
})

// POST /api/conversations
router.post('/conversations', (req: Request, res: Response) => {
  const { title } = req.body as { title?: string }
  const conv = store.create(title)
  res.status(201).json(conv)
})

// GET /api/conversations/:id
router.get('/conversations/:id', (req: Request, res: Response) => {
  const conv = store.get(req.params.id)
  if (!conv) { res.status(404).json({ error: 'Conversation not found' }); return }
  res.json(conv)
})

// PUT /api/conversations/:id
router.put('/conversations/:id', (req: Request, res: Response) => {
  const conv = store.get(req.params.id)
  if (!conv) { res.status(404).json({ error: 'Conversation not found' }); return }

  const { title } = req.body as { title?: string }
  if (!title?.trim()) { res.status(400).json({ error: 'title is required' }); return }

  store.updateTitle(conv.id, title.trim())
  res.json({ ...conv, title: title.trim() })
})

// DELETE /api/conversations/:id
router.delete('/conversations/:id', (req: Request, res: Response) => {
  const deleted = store.delete(req.params.id)
  if (!deleted) { res.status(404).json({ error: 'Conversation not found' }); return }
  res.status(204).send()
})

// GET /api/conversations/:id/messages
router.get('/conversations/:id/messages', (req: Request, res: Response) => {
  const conv = store.get(req.params.id)
  if (!conv) { res.status(404).json({ error: 'Conversation not found' }); return }
  res.json(conv.messages)
})

// POST /api/conversations/:id/messages
router.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  const conv = store.get(req.params.id)
  if (!conv) { res.status(404).json({ error: 'Conversation not found' }); return }

  const { content } = req.body as { content: string }
  if (!content?.trim()) { res.status(400).json({ error: 'content is required' }); return }

  const isFirst = conv.messages.length === 0

  const userMessage = {
    id: `msg-${Date.now()}`,
    role: 'user' as const,
    content: content.trim(),
    timestamp: new Date().toISOString(),
  }
  store.addMessage(conv.id, userMessage)

  if (isFirst) {
    store.updateTitle(conv.id, deriveTitle(content))
  }

  const aiContent = await simulateAIResponse(content)
  const aiMessage = {
    id: `msg-${Date.now() + 1}`,
    role: 'ai' as const,
    content: aiContent,
    timestamp: new Date().toISOString(),
  }
  store.addMessage(conv.id, aiMessage)

  const updatedConv = store.get(conv.id)!
  res.status(201).json({
    userMessage,
    aiMessage,
    title: updatedConv.title,
  })
})
