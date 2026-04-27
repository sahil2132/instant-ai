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

function msg(id: string, role: Message['role'], content: string, minsAgo: number): Message {
  return { id, role, content, timestamp: new Date(Date.now() - minsAgo * 60_000).toISOString() }
}

const initialData: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Startup ideas',
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    messages: [
      msg('msg-1', 'user', 'Give me 3 startup ideas for 2025', 28),
      msg('msg-2', 'ai', `Here are 3 high-signal startup ideas for 2025:

**1. AI Pipeline Observability**
As teams ship more AI-powered products, debugging latency and token cost across inference calls is still unsolved. There's a clear gap in developer tooling.

**2. Async-First Collaboration**
Most collaboration tools are optimized for synchronous work. An async-native platform built for distributed teams — with AI threading and smart summaries — has strong product-market fit.

**3. Compliance Automation for SaaS**
SOC 2, HIPAA, ISO 27001 — most startups spend 6–12 months on compliance. Automating evidence collection and continuous monitoring is a $2B+ opportunity.

Which direction interests you most?`, 27),
    ],
  },
  {
    id: 'conv-2',
    title: 'Summarize article',
    createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    messages: [
      msg('msg-3', 'user', 'Summarize this article about AI infrastructure trends', 8),
      msg('msg-4', 'ai', `Here's a structured summary:

**Overview**
The article covers how enterprises are shifting from single-model setups to multi-model AI orchestration, driven by cost and latency pressures.

**Key Arguments**
- Speed of deployment is now a competitive advantage
- Infrastructure teams need AI-native observability tooling
- Cost control and predictability are the top operational priorities

**Takeaway**
Organizations that invest in AI infrastructure now will have a 12–18 month head start over those who delay adoption.`, 7),
    ],
  },
]

class Store {
  private conversations = new Map<string, Conversation>(
    initialData.map(c => [c.id, c])
  )

  getAll(): Conversation[] {
    return Array.from(this.conversations.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  get(id: string): Conversation | undefined {
    return this.conversations.get(id)
  }

  create(title = 'New conversation'): Conversation {
    const id = `conv-${Date.now()}`
    const conv: Conversation = { id, title, messages: [], createdAt: new Date().toISOString() }
    this.conversations.set(id, conv)
    return conv
  }

  delete(id: string): boolean {
    return this.conversations.delete(id)
  }

  addMessage(conversationId: string, message: Message): Conversation | undefined {
    const conv = this.conversations.get(conversationId)
    if (!conv) return undefined
    conv.messages.push(message)
    return conv
  }

  updateTitle(conversationId: string, title: string): void {
    const conv = this.conversations.get(conversationId)
    if (conv) conv.title = title
  }
}

export const store = new Store()
