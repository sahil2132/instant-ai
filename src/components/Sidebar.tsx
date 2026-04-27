import { useState, useRef, useEffect } from 'react'
import { Conversation } from '../hooks/useChat'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string | null) => void
  onNew: () => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

interface ConvItemProps {
  conv: Conversation
  isActive: boolean
  onSelect: () => void
  onRename: (title: string) => void
  onDelete: () => void
}

function ConvItem({ conv, isActive, onSelect, onRename, onDelete }: ConvItemProps) {
  const [editing, setEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [draft, setDraft] = useState(conv.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Sync draft when title changes externally
  useEffect(() => {
    setDraft(conv.title)
  }, [conv.title])

  const startRename = () => {
    setMenuOpen(false)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== conv.title) onRename(trimmed)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(conv.title)
    setEditing(false)
  }

  const baseRow = [
    'flex items-center w-full transition-colors duration-100 group',
    isActive
      ? 'bg-[#f3f4f6] dark:bg-[#2a2a2a]'
      : 'hover:bg-[#fafafa] dark:hover:bg-[#212121]',
  ].join(' ')

  if (editing) {
    return (
      <div className={baseRow}>
        <div className="flex-1 px-3 py-1.5">
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); commit() }
              if (e.key === 'Escape') cancel()
            }}
            onBlur={commit}
            autoFocus
            className={[
              'w-full px-2 py-1.5 text-[13.5px] rounded-md',
              'bg-white dark:bg-[#2f2f2f]',
              'border border-[#00E0E0] ring-1 ring-[#00E0E0]',
              'text-[#0D0D0D] dark:text-[#ececec]',
              'focus:outline-none',
            ].join(' ')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`${baseRow} relative`}>
      {/* Title button */}
      <button
        onClick={onSelect}
        className={[
          'flex-1 text-left pl-5 pr-2 py-[11px] text-[13.5px] truncate',
          isActive
            ? 'text-[#0D0D0D] dark:text-[#ececec] font-medium'
            : 'text-[#555] dark:text-[#8e8ea0] group-hover:text-[#0D0D0D] dark:group-hover:text-[#ececec]',
        ].join(' ')}
      >
        {conv.title}
      </button>

      {/* ⋯ menu trigger */}
      <button
        onClick={e => { e.stopPropagation(); setMenuOpen(prev => !prev) }}
        className={[
          'flex-shrink-0 mr-2 w-6 h-6 flex items-center justify-center rounded-md',
          'text-[#999] dark:text-[#555]',
          'hover:text-[#0D0D0D] dark:hover:text-[#ececec]',
          'hover:bg-[#e8e8e8] dark:hover:bg-[#383838]',
          'transition-all duration-100',
          menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        ].join(' ')}
        aria-label="Conversation options"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
          <circle cx="2" cy="6.5" r="1.2" />
          <circle cx="6.5" cy="6.5" r="1.2" />
          <circle cx="11" cy="6.5" r="1.2" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className={[
            'absolute right-2 top-[calc(100%-4px)] z-50 w-36',
            'bg-white dark:bg-[#2f2f2f]',
            'border border-[#E5E5E5] dark:border-[#383838]',
            'rounded-lg shadow-lg dark:shadow-black/40',
            'py-1 overflow-hidden',
            'animate-fade-in',
          ].join(' ')}
        >
          <button
            onClick={startRename}
            className="w-full text-left px-3 py-2 text-[12.5px] text-[#0D0D0D] dark:text-[#ececec] hover:bg-[#f5f5f5] dark:hover:bg-[#383838] transition-colors flex items-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M8.5 1.5a1.414 1.414 0 0 1 2 2L3.5 10.5l-2.5.5.5-2.5L8.5 1.5z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Rename
          </button>
          <div className="my-1 border-t border-[#F0F0F0] dark:border-[#383838]" />
          <button
            onClick={() => { setMenuOpen(false); onDelete() }}
            className="w-full text-left px-3 py-2 text-[12.5px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1.5 3h9M4.5 3V2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M5 5.5v3M7 5.5v3M2.5 3l.5 6.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5L9.5 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ conversations, activeId, onSelect, onNew, onRename, onDelete, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed md:static inset-y-0 left-0 z-30 md:z-auto',
          'w-[260px] border-r border-[#D9D9D9] dark:border-[#383838] bg-white dark:bg-[#171717] flex flex-col flex-shrink-0',
          'transition-transform duration-200 ease-out md:transition-none',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="h-14 flex items-center justify-between px-5 border-b border-[#D9D9D9] dark:border-[#383838]">
          <span className="text-[11px] font-semibold text-[#bbb] dark:text-[#555] uppercase tracking-[0.12em]">
            Conversations
          </span>
          <button
            onClick={onNew}
            title="New conversation"
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#bbb] dark:text-[#555] hover:text-[#0D0D0D] dark:hover:text-[#ececec] hover:bg-[#f3f4f6] dark:hover:bg-[#2f2f2f] transition-colors duration-150"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 2.5v10M2.5 7.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {conversations.map(conv => (
            <ConvItem
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeId}
              onSelect={() => { onSelect(conv.id); onClose() }}
              onRename={title => onRename(conv.id, title)}
              onDelete={() => onDelete(conv.id)}
            />
          ))}
        </nav>

        <div className="border-t border-[#D9D9D9] dark:border-[#383838] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0D0D0D] dark:bg-[#ececec] flex items-center justify-center flex-shrink-0">
              <span className="text-[12px] font-semibold text-white dark:text-[#171717] leading-none">S</span>
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[13px] font-medium text-[#0D0D0D] dark:text-[#ececec] leading-tight truncate">
                Sahil Sachdeva
              </span>
              <span className="text-[11px] text-[#aaa] dark:text-[#8e8ea0] leading-tight truncate mt-[2px]">
                sahilsachdeva1993@gmail.com
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
