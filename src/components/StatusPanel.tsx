import { useEffect, useState } from 'react'
import { getStatus, SystemStatus } from '../utils/api'

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

interface StatusRowProps {
  label: string
  status: 'online' | 'offline' | 'loading'
  detail?: string
}

function StatusRow({ label, status, detail }: StatusRowProps) {
  const dotClass =
    status === 'online'
      ? 'bg-green-500'
      : status === 'offline'
      ? 'bg-red-400'
      : 'bg-yellow-400 animate-pulse'
  const statusText =
    status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : '…'

  return (
    <div className="flex items-center justify-between py-[10px]">
      <span className="text-[13px] text-[#666] dark:text-[#8e8ea0]">{label}</span>
      <div className="flex items-center gap-[7px]">
        <div className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${dotClass}`} />
        <span className="text-[12.5px] font-medium text-[#0D0D0D] dark:text-[#ececec]">
          {statusText}
          {detail && (
            <span className="ml-1 text-[11px] font-normal text-[#999] dark:text-[#666]">
              {detail}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

interface MetricRowProps {
  label: string
  value: string
}

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-[10px]">
      <span className="text-[13px] text-[#666] dark:text-[#8e8ea0]">{label}</span>
      <span className="text-[12.5px] font-medium text-[#0D0D0D] dark:text-[#ececec] tabular-nums">
        {value}
      </span>
    </div>
  )
}

export function StatusPanel() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const data = await getStatus()
        if (!cancelled) { setStatus(data); setLoading(false) }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    poll()
    const interval = setInterval(poll, 10_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const s = (key: 'api' | 'database' | 'pythonApi') => {
    if (loading) return 'loading' as const
    return status?.[key]?.status ?? 'offline'
  }

  return (
    <aside className="hidden lg:flex w-[232px] border-l border-[#D9D9D9] dark:border-[#383838] bg-white dark:bg-[#171717] flex-col flex-shrink-0">
      <div className="h-14 flex items-center px-5 border-b border-[#D9D9D9] dark:border-[#383838]">
        <span className="text-[11px] font-semibold text-[#bbb] dark:text-[#555] uppercase tracking-[0.12em]">
          System Status
        </span>
      </div>

      <div className="px-5 pt-1">
        <div className="divide-y divide-[#f2f2f2] dark:divide-[#2a2a2a]">
          <StatusRow label="API" status={s('api')} />
          <StatusRow
            label="Python API"
            status={s('pythonApi')}
            detail={status?.pythonApi?.responseMs != null ? `${status.pythonApi.responseMs}ms` : undefined}
          />
          <StatusRow
            label="Database"
            status={s('database')}
            detail={status?.database?.responseMs != null ? `${status.database.responseMs}ms` : undefined}
          />
        </div>

        <div className="mt-5">
          <span className="text-[10.5px] font-semibold text-[#bbb] dark:text-[#555] uppercase tracking-[0.12em]">
            Metrics
          </span>
          <div className="divide-y divide-[#f2f2f2] dark:divide-[#2a2a2a]">
            <MetricRow
              label="Uptime"
              value={status ? formatUptime(status.metrics.uptimeSeconds) : '—'}
            />
            <MetricRow
              label="Requests"
              value={status ? String(status.metrics.requestCount) : '—'}
            />
            <MetricRow
              label="Avg Response"
              value={status ? `${status.metrics.avgResponseMs}ms` : '—'}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
