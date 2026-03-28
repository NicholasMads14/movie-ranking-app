import { useState } from 'react'
import { authHeaders } from '../hooks/useAppData'

const API_URL = import.meta.env.VITE_API_URL

export default function AdminAddMovie({ movies, setMovies, setRankings, userID }) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showRemove, setShowRemove] = useState(false)

  if (userID !== 'nick') return null

  const handleAdd = async () => {
    if (!title.trim()) return
    setLoading(true)
    setSuccess('')
    setError('')

    try {
      const headers = await authHeaders()
      const res = await fetch(`${API_URL}/movies`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: title.trim(), userID }),
      })
      const data = await res.json()

      if (res.ok) {
        setMovies(prev => [...prev, { movieID: data.movieID, title: title.trim() }])
        setTitle('')
        setSuccess(`"${title.trim()}" added!`)
      } else {
        setError(data.error || 'Failed to add movie')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (movieID, movieTitle) => {
    setRemoving(movieID)
    setSuccess('')
    setError('')
    try {
      const headers = await authHeaders()
      const res = await fetch(`${API_URL}/movies`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ movieID, userID }),
      })

      if (res.ok) {
        setMovies(prev => prev.filter(m => m.movieID !== movieID))
        setRankings(prev => {
          const updated = { ...prev }
          delete updated[movieID]
          return updated
        })
        setSuccess(`"${movieTitle}" removed!`)
      } else {
        setError('Failed to remove movie')
      }
    } catch (err) {
      setError('Failed to remove movie')
    } finally {
      setRemoving(null)
    }
  }

  const filteredMovies = movies
    .filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div className="max-w-sm mx-auto mt-8 flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="text-xs text-gray-500 uppercase tracking-widest">Add a movie</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Movie title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 rounded-xl px-4 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={loading || !title.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          {loading ? '...' : 'Add'}
        </button>
      </div>

      <button
        onClick={() => setShowRemove(!showRemove)}
        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 text-left px-1 transition-colors"
      >
        {showRemove ? '▲ Hide remove' : '▼ Remove a movie'}
      </button>

      {showRemove && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Search to remove..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 rounded-xl px-4 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
          />
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {filteredMovies.map(m => (
              <div
                key={m.movieID}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2"
              >
                <span className="text-gray-900 dark:text-white text-xs flex-1">{m.title}</span>
                <button
                  onClick={() => handleRemove(m.movieID, m.title)}
                  disabled={removing === m.movieID}
                  className="text-red-500 hover:text-red-400 disabled:opacity-40 text-xs ml-3 transition-colors"
                >
                  {removing === m.movieID ? '...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {success && <p className="text-emerald-400 text-xs px-1">{success}</p>}
      {error && <p className="text-red-400 text-xs px-1">{error}</p>}
    </div>
  )
}