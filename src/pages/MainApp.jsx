import { useState } from 'react'
import { signOut } from 'aws-amplify/auth'
import { useAppData } from '../hooks/useAppData'
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading your rankings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-800 sticky top-0 z-10 bg-gray-950">
        <span className="text-sm text-gray-400">
          Hey, {user.username.charAt(0).toUpperCase() + user.username.slice(1)}!
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setScreen('tier')}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${screen === 'tier' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Rank
          </button>
          <button
            onClick={() => setScreen('finetune')}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${screen === 'finetune' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Reorder
          </button>
          <button
            onClick={() => setScreen('others')}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${screen === 'others' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Everyone
          </button>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Sign out
        </button>
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