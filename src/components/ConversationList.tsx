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
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onCreateConversation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversations.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 rounded-lg cursor-pointer transition group ${
                currentConversationId === conv.id
                  ? 'bg-blue-600'
                  : 'bg-gray-800 hover:bg-gray-700'
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
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition ml-2"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(conv.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-3 text-sm text-gray-400">Logged in as: <span className="font-semibold text-white">{user}</span></div>
        <button
          onClick={onLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
