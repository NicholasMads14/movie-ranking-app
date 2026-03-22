import { useState } from 'react'
import { authHeaders } from '../hooks/useAppData'

const API_URL = import.meta.env.VITE_API_URL

const TIERS = [
  { value: 'loved', label: 'Loved it', accent: '#10b981' },
  { value: 'liked', label: 'Liked it', accent: '#3b82f6' },
  { value: 'fine', label: "It's fine", accent: '#a855f7' },
  { value: 'badfun', label: 'Bad, but fun', accent: '#ec4899' },
  { value: 'disliked', label: "Didn't like it", accent: '#ef4444' },
  { value: 'hated', label: "Fuckin' hated it", accent: '#f97316' },
  { value: 'unseen', label: "Haven't seen it", accent: '#6b7280' },
]

const TIER_ORDER = ['loved', 'liked', 'fine', 'badfun', 'disliked', 'hated', 'unseen']

export default function TierScreen({ movies, rankings, setRankings, userID }) {
  const [saving, setSaving] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [reRankSearch, setReRankSearch] = useState('')
  const [reRankMovie, setReRankMovie] = useState(null)

  const unranked = movies.filter(m => !rankings[m.movieID])
  const current = reRankMovie || unranked[0]
  const progress = movies.length - unranked.length
  const pct = Math.round((progress / movies.length) * 100)

  const handleTier = async (tier) => {
    if (!current || saving) return
    setAnimating(true)
    setSaving(true)

    const newRankings = { ...rankings }
    newRankings[current.movieID] = { tier, rank: 999 }

    TIER_ORDER.forEach(t => {
      const moviesInTier = Object.entries(newRankings)
        .filter(([, r]) => r.tier === t)
        .sort((a, b) => a[1].rank - b[1].rank)
        .map(([id]) => id)
      moviesInTier.forEach((id, i) => {
        newRankings[id] = { ...newRankings[id], rank: i + 1 }
      })
    })

    setTimeout(() => setAnimating(false), 150)
    setRankings(newRankings)
    setReRankMovie(null)
    setReRankSearch('')

    try {
      const headers = await authHeaders()
      await fetch(`${API_URL}/rankings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userID, rankings: newRankings }),
      })
    } catch (err) {
      console.error('Failed to save', err)
    } finally {
      setSaving(false)
    }
  }

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(reRankSearch.toLowerCase())
  ).slice(0, 6)

  if (!unranked.length && !reRankMovie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-4">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">All caught up.</p>
            <p className="text-gray-500 text-sm mt-2">Want to re-rank a movie?</p>
          </div>
          <input
            type="text"
            placeholder="Search for a movie..."
            value={reRankSearch}
            onChange={e => setReRankSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-600 transition-colors"
          />
          {reRankSearch && (
            <div className="flex flex-col gap-2">
              {filteredMovies.map(m => {
                const cur = rankings[m.movieID]
                const tierInfo = TIERS.find(t => t.value === cur?.tier)
                return (
                  <button
                    key={m.movieID}
                    onClick={() => setReRankMovie(m)}
                    className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 transition-colors text-left"
                  >
                    <span className="text-white text-sm">{m.title}</span>
                    {tierInfo && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full ml-3 flex-shrink-0"
                        style={{
                          background: tierInfo.accent + '20',
                          color: tierInfo.accent,
                          border: `0.5px solid ${tierInfo.accent}40`,
                        }}
                      >
                        {tierInfo.label}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">

        {!reRankMovie && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 uppercase tracking-widest">Your ranking</span>
              <span className="text-xs text-gray-600">{progress} / {movies.length}</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-px">
              <div
                className="bg-gray-400 h-px rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {reRankMovie && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setReRankMovie(null); setReRankSearch('') }}
              className="text-gray-600 hover:text-white transition-colors text-sm"
            >
              ← back
            </button>
            <span className="text-xs text-gray-600 uppercase tracking-widest">Re-ranking</span>
          </div>
        )}

        <div className={`text-center transition-opacity duration-150 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
            {current.title}
          </h2>
          {reRankMovie && rankings[current.movieID] && (
            <p className="text-gray-600 text-sm mt-2">
              Currently: {TIERS.find(t => t.value === rankings[current.movieID].tier)?.label}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {TIERS.map(tier => (
            <button
              key={tier.value}
              onClick={() => handleTier(tier.value)}
              disabled={saving}
              className="group relative w-full text-left px-5 py-4 rounded-2xl bg-gray-900 border border-gray-800 disabled:opacity-40 transition-all duration-150 overflow-hidden"
              onMouseEnter={e => e.currentTarget.style.borderColor = tier.accent + '80'}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-150 rounded-2xl"
                style={{ background: tier.accent }}
              />
              <div className="flex items-center gap-3 relative px-4">
                <div className="w-2 h-2 rounded-full flex-shrink-0 border border-gray-700" style={{ background: tier.accent }} />
                <span className="text-white font-medium text-sm">{tier.label}</span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}