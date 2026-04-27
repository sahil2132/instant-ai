const startTime = Date.now()
let requestCount = 0
let totalResponseMs = 0

export function recordRequest(ms: number) {
  requestCount++
  totalResponseMs += ms
}

export function getMetrics() {
  return {
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    requestCount,
    avgResponseMs: requestCount > 0 ? Math.round(totalResponseMs / requestCount) : 0,
  }
}
