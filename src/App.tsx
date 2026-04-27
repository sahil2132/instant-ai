import { useState } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ChatWindow } from './components/ChatWindow'
import { StatusPanel } from './components/StatusPanel'
import { useChat } from './hooks/useChat'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const {
    conversations, activeConversation, activeId,
    selectConversation, isTyping, loading, messagesLoading, sendMessage, newConversation, renameConversation, deleteConversation,
  } = useChat()
  const { isDark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-[#212121]">
      <Header isDark={isDark} onToggleTheme={toggle} />
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[13px] text-[#ccc] dark:text-[#444]">Connecting…</span>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            conversations={conversations}
            activeId={activeId ?? ''}
            onSelect={id => selectConversation(id!)}
            onNew={newConversation}
            onRename={renameConversation}
            onDelete={deleteConversation}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              isTyping={isTyping}
              messagesLoading={messagesLoading}
              onSend={sendMessage}
              onMenuOpen={() => setSidebarOpen(true)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[13px] text-[#ccc] dark:text-[#444]">Select or create a conversation</p>
            </div>
          )}
          <StatusPanel />
        </div>
      )}
    </div>
  )
}
