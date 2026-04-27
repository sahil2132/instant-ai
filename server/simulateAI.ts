const RESPONSES: Record<string, string> = {
  startup: `Here are 3 high-signal startup ideas for 2025:

**1. AI Pipeline Observability**
As teams ship more AI-powered products, debugging latency and token cost across inference calls is still unsolved. There's a clear gap in developer tooling.

**2. Async-First Collaboration**
Most collaboration tools are optimized for synchronous work. An async-native platform built for distributed teams — with AI threading and smart summaries — has strong product-market fit.

**3. Compliance Automation for SaaS**
SOC 2, HIPAA, ISO 27001 — most startups spend 6–12 months on compliance. Automating evidence collection and continuous monitoring is a $2B+ opportunity.

Which direction interests you most?`,

  summarize: `Here's a structured summary:

**Overview**
The article covers how enterprises are shifting from single-model setups to multi-model AI orchestration, driven by cost and latency pressures.

**Key Arguments**
- Speed of deployment is now a competitive advantage
- Infrastructure teams need AI-native observability tooling
- Cost control and predictability are the top operational priorities

**Takeaway**
Organizations that invest in AI infrastructure now will have a 12–18 month head start over those who delay adoption.`,

  infrastructure: `Your infrastructure stack looks healthy. Here's a quick diagnostic:

**Status**
- Web layer: 3 replicas active, p99 latency at 84ms
- API gateway: All routes responding, zero 5xx in last 15 minutes
- Database: Primary + 2 read replicas connected, 98.7% cache hit rate
- AI service: Inference endpoint active, average response 120ms

**Recommendation**
No immediate action needed. Consider enabling autoscaling on the web tier if you expect traffic spikes.`,

  default: `Here's what I found:

**Analysis**
Your query touches a few interesting dimensions. Based on the current system context, here's the breakdown:

**Key Points**
- All connected services are operating within normal parameters
- Response latency is well within the optimal threshold (< 150ms)
- No anomalies detected in the last 30 minutes of requests

**Next Steps**
You can proceed confidently. If you'd like a deeper dive into any specific layer — web, API, database, or AI — just ask.`,
}

function match(prompt: string): string {
  const p = prompt.toLowerCase()
  if (p.includes('startup') || p.includes('idea') || p.includes('business')) return RESPONSES.startup
  if (p.includes('summar') || p.includes('article') || p.includes('read')) return RESPONSES.summarize
  if (p.includes('infra') || p.includes('deploy') || p.includes('status') || p.includes('server')) return RESPONSES.infrastructure
  return RESPONSES.default
}

export async function simulateAIResponse(prompt: string): Promise<string> {
  const delay = 520 + Math.random() * 280
  await new Promise(resolve => setTimeout(resolve, delay))
  return match(prompt)
}
