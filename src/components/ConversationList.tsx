interface Conversation {
  id: string
  title: string
  createdAt: string
}

interface ConversationListProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onCreateConversation: () => void
  onDeleteConversation: (id: string) => void
  onLogout: () => void
  user: string
}

export default function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onLogout,
  user,
}: ConversationListProps) {
  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col border-r border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={onCreateConversation}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversations.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 rounded-lg cursor-pointer transition group ${
                currentConversationId === conv.id
                  ? 'bg-slate-700'
                  : 'bg-slate-700/40 hover:bg-slate-700/60'
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm truncate flex-1">{conv.title}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(conv.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition ml-2"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(conv.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="mb-3 text-sm text-slate-400">Logged in as: <span className="font-semibold text-white">{user}</span></div>
        <button
          onClick={onLogout}
          className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
