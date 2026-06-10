import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import ChatPage from './components/ChatPage'

export default function App() {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  const handleLogin = (username: string) => {
    setUser(username)
    localStorage.setItem('user', username)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('currentConversation')
  }

  if (loading) return null

  return user ? (
    <ChatPage user={user} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  )
}
