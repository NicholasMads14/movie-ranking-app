import { useState } from 'react'
import { signOut } from 'aws-amplify/auth'
import { useAppData } from '../hooks/useAppData'
import ThemeToggle from '../components/ThemeToggle'
import TierScreen from './TierScreen'
import FineTuneScreen from './FineTuneScreen'
import OthersScreen from './OthersScreen'
import AdminAddMovie from './AdminAddMovie'

export default function MainApp({ user }) {
  const [screen, setScreen] = useState('tier')
  const { movies, setMovies, rankings, setRankings, loading, error } = useAppData(user.username)

  const handleSignOut = async () => {
    await signOut()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading your rankings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 bg-white dark:bg-gray-950">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Hey, {user.username.charAt(0).toUpperCase() + user.username.slice(1)}!
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setScreen('tier')}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${screen === 'tier' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Rank
          </button>
          <button
            onClick={() => setScreen('finetune')}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${screen === 'finetune' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Reorder
          </button>
          <button
            onClick={() => setScreen('others')}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${screen === 'others' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Everyone
          </button>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="p-4">
        {screen === 'tier' && (
          <>
            <TierScreen
              movies={movies}
              rankings={rankings}
              setRankings={setRankings}
              userID={user.username}
            />
            <AdminAddMovie
              movies={movies}
              setMovies={setMovies}
              setRankings={setRankings}
              userID={user.username}
            />
          </>
        )}
        {screen === 'finetune' && (
          <FineTuneScreen
            movies={movies}
            rankings={rankings}
            setRankings={setRankings}
            userID={user.username}
          />
        )}
        {screen === 'others' && (
          <OthersScreen
            movies={movies}
            userID={user.username}
          />
        )}
      </main>
    </div>
  )
}
