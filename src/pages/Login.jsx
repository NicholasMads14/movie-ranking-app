import { useState } from 'react'
import { signIn } from 'aws-amplify/auth'

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

  return (
    <div className="bg-gray-950 px-4 flex flex-col" style={{ minHeight: '100dvh' }}>
      <div className="w-full max-w-sm mx-auto pt-20 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white text-center mb-4">
          Movie Club
        </h1>
        <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            returnKeyType="next"
            onKeyDown={e => e.key === 'Enter' && document.getElementById('password-input').focus()}
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            id="password-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-3 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </div>

      <div className="mt-auto pb-8 flex flex-col items-center gap-2">
        <a
          href="https://nicholasmadson.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 text-xs hover:text-gray-500 transition-colors"
        >
          nicholasmadson.dev
        </a>
        <br></br>
        <p className="text-gray-800 text-xs tracking-widest uppercase">
          React · AWS Lambda · DynamoDB · Cognito · CloudFront
        </p>
      </div>
    </div>
  )
}