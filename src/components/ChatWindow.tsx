import { useEffect, useRef } from 'react'
import { Conversation } from '../hooks/useChat'
import { Message } from './Message'
import { InputBar } from './InputBar'

interface ChatWindowProps {
  conversation: Conversation
  isTyping: boolean
  messagesLoading: boolean
  onSend: (message: string) => void
  onMenuOpen: () => void
}

function TypingIndicator() {
  return (
    <div className="animate-fade-in flex justify-start mb-5">
      <div className="bg-[#f8f9fb] dark:bg-transparent rounded-lg px-1 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#aaa] dark:text-[#8e8ea0] tracking-wide">AI is thinking</span>
          <div className="flex items-center gap-[3px] mt-[1px]">
            <div className="typing-dot w-[5px] h-[5px] rounded-full bg-[#c0c0c0] dark:bg-[#555]" />
            <div className="typing-dot w-[5px] h-[5px] rounded-full bg-[#c0c0c0] dark:bg-[#555]" />
            <div className="typing-dot w-[5px] h-[5px] rounded-full bg-[#c0c0c0] dark:bg-[#555]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChatWindow({ conversation, isTyping, messagesLoading, onSend, onMenuOpen }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages.length, isTyping])

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#212121] overflow-hidden">
      {/* Mobile top bar */}
      <div className="md:hidden h-12 border-b border-[#D9D9D9] dark:border-[#383838] flex items-center px-4 gap-3 flex-shrink-0">
        <button
          onClick={onMenuOpen}
          className="p-1.5 -ml-1.5 text-[#999] dark:text-[#8e8ea0] hover:text-[#0D0D0D] dark:hover:text-[#ececec] transition-colors"
          aria-label="Open sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M2 5h14M2 9h14M2 13h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <span className="text-[13px] font-medium text-[#0D0D0D] dark:text-[#ececec]">{conversation.title}</span>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-6 pb-2">
        {messagesLoading ? (
          <div className="h-full flex items-center justify-center pb-16">
            <div className="flex items-center gap-[5px]">
              <div className="typing-dot w-[6px] h-[6px] rounded-full bg-[#d0d0d0] dark:bg-[#444]" />
              <div className="typing-dot w-[6px] h-[6px] rounded-full bg-[#d0d0d0] dark:bg-[#444]" />
              <div className="typing-dot w-[6px] h-[6px] rounded-full bg-[#d0d0d0] dark:bg-[#444]" />
            </div>
          </div>
        ) : (
          <>
            {conversation.messages.length === 0 && !isTyping && (
              <div className="h-full flex flex-col items-center justify-center pb-16 select-none">
                <p className="text-[13px] text-[#ccc] dark:text-[#555] tracking-wide">Start a new conversation</p>
              </div>
            )}
            {conversation.messages.map(msg => (
              <Message key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} className="h-1" />
          </>
        )}
      </div>

      <InputBar onSend={onSend} disabled={isTyping} />
    </div>
  )
}
