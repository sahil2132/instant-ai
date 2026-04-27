import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { Components } from 'react-markdown'
import { Message as MessageType } from '../hooks/useChat'

interface MessageProps {
  message: MessageType
}

const markdownComponents: Components = {
  table: ({ children }) => (
    <div className="overflow-x-auto w-full">
      <table>{children}</table>
    </div>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto">{children}</pre>
  ),
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`animate-fade-in flex w-full mb-5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isUser ? (
        <div className="bg-transparent dark:bg-[#2f2f2f] rounded-2xl px-4 py-3 max-w-md min-w-0">
          <p className="text-[14px] text-[#0D0D0D] dark:text-[#ececec] leading-[1.6] break-words">
            {message.content}
          </p>
        </div>
      ) : (
        <div className="bg-[#f8f9fb] dark:bg-transparent rounded-lg px-4 py-3 max-w-[85%] min-w-0 w-full overflow-hidden">
          <div className="text-[13.5px] text-[#0D0D0D] dark:text-[#d1d1d1] leading-[1.65] prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden
            prose-p:my-1
            prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1
            prose-h1:text-base prose-h2:text-[0.9rem] prose-h3:text-[0.85rem]
            prose-ul:my-1 prose-ol:my-1
            prose-li:my-0
            prose-code:bg-black/10 dark:prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.8em] prose-code:font-mono
            prose-pre:bg-black/10 dark:prose-pre:bg-white/10 prose-pre:rounded-lg prose-pre:p-3 prose-pre:overflow-x-auto prose-pre:max-w-full
            prose-strong:text-[#0D0D0D] dark:prose-strong:text-[#ececec]
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline prose-a:break-all
            prose-hr:my-2 prose-blockquote:border-l-2 prose-blockquote:pl-3 prose-blockquote:italic
            prose-img:max-w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
