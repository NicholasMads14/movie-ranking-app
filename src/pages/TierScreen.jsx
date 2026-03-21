import { useState } from 'react'
import { authHeaders } from '../hooks/useAppData'

const API_URL = import.meta.env.VITE_API_URL

const TIERS = [
  { value: 'loved', label: 'Loved it', accent: '#10b981' },
  { value: 'liked', label: 'Liked it', accent: '#3b82f6' },
  { value: 'fine', label: "It's fine", accent: '#a855f7' },
  { value: 'disliked', label: "Didn't like it", accent: '#ef4444' },
  { value: 'unseen', label: "Haven't seen it", accent: '#6b7280' },
]

export default function TierScreen({ movies, rankings, setRankings, userID }) {
  const [saving, setSaving] = useState(false)
  const [animating, setAnimating] = useState(false)

  const unranked = movies.filter(m => !rankings[m.movieID])
  const current = unranked[0]
  const progress = movies.length - unranked.length
  const pct = Math.round((progress / movies.length) * 100)

  const handleTier = async (tier) => {
    if (!current || saving) return
    setAnimating(true)
    setSaving(true)

    const newRankings = {
      ...rankings,
      [current.movieID]: {
        tier,
        rank: Object.values(rankings).filter(r => r.tier === tier).length + 1,
      },
    }

    setTimeout(() => setAnimating(false), 150)
    setRankings(newRankings)

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

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <p className="text-2xl font-bold text-white">All caught up.</p>
        <p className="text-gray-500 text-sm">Head to Reorder to fine-tune your rankings.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">

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

        <div className={`text-center transition-opacity duration-150 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
            {current.title}
          </h2>
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
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: tier.accent }}
                />
                <span className="text-white font-medium text-sm">{tier.label}</span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}