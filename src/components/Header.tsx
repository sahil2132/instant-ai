interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="h-14 border-b border-[#D9D9D9] dark:border-[#383838] flex items-center justify-between px-6 bg-white dark:bg-[#171717] flex-shrink-0">
      <div className="flex flex-col justify-center">
        <span className="text-[13.5px] font-semibold tracking-tight text-[#0D0D0D] dark:text-[#ececec] leading-none">
          Instant AI Workspace
        </span>
        <span className="text-[11px] text-[#999] dark:text-[#8e8ea0] mt-[5px] tracking-wide leading-none">
          Web · API · AI · Database connected
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#999] dark:text-[#8e8ea0] hover:text-[#0D0D0D] dark:hover:text-[#ececec] hover:bg-[#f3f4f6] dark:hover:bg-[#2f2f2f] transition-colors duration-150"
        >
          {isDark ? (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.05 3.05l1.06 1.06M10.89 10.89l1.06 1.06M3.05 11.95l1.06-1.06M10.89 4.11l1.06-1.06"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M12.5 8.5A5.5 5.5 0 0 1 5.5 1.5a5.5 5.5 0 1 0 7 7z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-4 h-4">
            <div className="absolute w-2.5 h-2.5 rounded-full bg-green-400 opacity-60 animate-ping" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <span className="text-[12px] font-medium text-[#0D0D0D] dark:text-[#ececec] tracking-wide">Live</span>
        </div>
      </div>
    </header>
  )
}
