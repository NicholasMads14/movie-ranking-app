import { useState, useEffect } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import Login from './pages/Login'
import MainApp from './pages/MainApp'

export default function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={() => getCurrentUser().then(u => setUser(u))} />
  }

  return <MainApp user={user} />
}