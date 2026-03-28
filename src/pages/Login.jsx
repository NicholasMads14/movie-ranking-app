import { useState } from 'react'
import { signIn } from 'aws-amplify/auth'
import ThemeToggle from '../components/ThemeToggle'

const isDemo = import.meta.env.VITE_ENV === 'demo'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signIn({ username, password })
      onLogin()
    } catch (err) {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      await signIn({ username: 'guest', password: 'password' })
      onLogin()
    } catch (err) {
      setError('Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-950 px-4 flex flex-col" style={{ minHeight: '100dvh' }}>
      <div className="flex justify-end pt-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm mx-auto pt-16 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 mb-4">
          {isDemo ? (
            <span style={{ fontSize: '64px', lineHeight: 1 }}>🎬</span>
          ) : (
            <img src="/pony.png" alt="" className="w-24 h-24 object-contain" />
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            {isDemo ? 'Movie Ranking App (Demo)' : 'Movie Club Rankings'}
          </h1>
          {isDemo && (
            <p className="text-gray-500 text-sm text-center">
              <br></br>
              Rank 30 films across 7 tiers.
              Fine-tune the order.
              See how your tastes compare to others.
            </p>
          )}
        </div>

        {isDemo ? (
          <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-6 flex flex-col gap-4">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-3 transition-colors"
            >
              {loading ? 'Loading...' : 'Try the demo →'}
            </button>
            {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-6 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('password-input').focus()}
              className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <input
              id="password-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-3 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-auto pb-8 flex flex-col items-center gap-2">
        <a
          href="https://nicholasmadson.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 dark:text-gray-700 text-xs hover:text-gray-600 dark:hover:text-gray-500 transition-colors"
        >
          nicholasmadson.dev
        </a>
        <p className="text-gray-300 dark:text-gray-800 text-xs tracking-widest uppercase">
          React · AWS Lambda · DynamoDB · Cognito · CloudFront
        </p>
      </div>
    </div>
  )
}
