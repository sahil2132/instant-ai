import { useState, KeyboardEvent, useRef, FormEvent } from 'react'

interface InputBarProps {
  onSend: (message: string) => void
  disabled: boolean
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const reset = () => {
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'
    }
  }

  const submit = () => {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    reset()
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = '44px'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div className="border-t border-[#D9D9D9] dark:border-[#383838] px-5 py-4 bg-white dark:bg-[#212121] flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={disabled}
          rows={1}
          className={[
            'flex-1 resize-none rounded-xl border border-[#D9D9D9] dark:border-[#383838] px-4 py-[11px]',
            'bg-white dark:bg-[#2f2f2f]',
            'text-[13.5px] text-[#0D0D0D] dark:text-[#ececec] placeholder-[#bbb] dark:placeholder-[#555] leading-[1.5]',
            'focus:outline-none focus:border-[#00E0E0] dark:focus:border-[#00E0E0] focus:ring-1 focus:ring-[#00E0E0]',
            'transition-colors duration-150',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
          style={{ minHeight: '44px', maxHeight: '128px' }}
        />

        <button
          type="submit"
          disabled={!canSend}
          className={[
            'h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0',
            'transition-all duration-150',
            canSend
              ? 'bg-[#0D0D0D] dark:bg-[#ececec] text-white dark:text-[#212121] hover:bg-[#2a2a2a] dark:hover:bg-[#d1d1d1] active:scale-95'
              : 'bg-[#f3f4f6] dark:bg-[#2f2f2f] text-[#ccc] dark:text-[#555] cursor-not-allowed',
          ].join(' ')}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M1 7.5h13M8.5 2l5.5 5.5L8.5 13"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  )
}
