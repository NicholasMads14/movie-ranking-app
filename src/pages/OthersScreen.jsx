import { useState, useEffect } from 'react'
import { authHeaders } from '../hooks/useAppData'

const API_URL = import.meta.env.VITE_API_URL

const TIER_ORDER = ['loved', 'liked', 'fine', 'badfun', 'disliked', 'hated', 'unseen']
const TIER_LABELS = {
  loved: { label: 'Loved', accent: '#10b981' },
  liked: { label: 'Liked', accent: '#3b82f6' },
  fine: { label: 'Fine', accent: '#a855f7' },
  badfun: { label: 'Bad, but fun', accent: '#ec4899' },
  disliked: { label: 'Disliked', accent: '#ef4444' },
  hated: { label: "Fuckin' hated", accent: '#f97316' },
  unseen: { label: 'Unseen', accent: '#6b7280' },
  unranked: { label: '—', accent: '#374151' },
}

const ALL_USERS = ['nick', 'malena', 'astraea', 'alex', 'brandon', 'bowling']

function getAbsoluteRank(userRankings, movieID) {
  if (!userRankings[movieID]) return null
  const { tier, rank } = userRankings[movieID]
  const tierIdx = TIER_ORDER.indexOf(tier)
  if (tierIdx === -1) return null
  let offset = 0
  for (let i = 0; i < tierIdx; i++) {
    offset += Object.values(userRankings).filter(r => r.tier === TIER_ORDER[i]).length
  }
  return offset + rank
}

export default function OthersScreen({ movies, userID }) {
  const [allRankings, setAllRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('title')

  const USERS = [userID, ...ALL_USERS.filter(u => u !== userID)]

  useEffect(() => {
    async function fetchAll() {
      try {
        const headers = await authHeaders()
        const res = await fetch(`${API_URL}/rankings`, { headers })
        const data = await res.json()
        setAllRankings(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 text-sm">Loading everyone's rankings...</p>
      </div>
    )
  }

  const rankingsByUser = {}
  USERS.forEach(u => {
    const found = allRankings.find(r => r.userID === u)
    rankingsByUser[u] = found?.rankings || {}
  })

  const filtered = movies
    .filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      const aRank = getAbsoluteRank(rankingsByUser[sortBy], a.movieID)
      const bRank = getAbsoluteRank(rankingsByUser[sortBy], b.movieID)
      if (!aRank && !bRank) return 0
      if (!aRank) return 1
      if (!bRank) return -1
      return aRank - bRank
    })

  return (
    <div className="flex flex-col gap-4 py-4 px-2">
      <div className="flex items-center">
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-gray-600 transition-colors flex-1 mx-4"
        />
        <div className="flex-1 flex justify-end">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-400 rounded-xl px-3 py-2 text-sm outline-none"
          >
            <option value="title">Sort by title</option>
            {USERS.map(u => (
              <option key={u} value={u}>
                Sort by {u.charAt(0).toUpperCase() + u.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th
                className="text-left py-2 pr-4 font-normal min-w-40 cursor-pointer select-none"
                onClick={() => setSortBy('title')}
              >
                <span
                  className="text-xs uppercase tracking-widest transition-colors"
                  style={{ color: sortBy === 'title' ? '#3b82f6' : '#4b5563' }}
                >
                  Movie
                </span>
              </th>
              {USERS.map(u => (
                <th
                  key={u}
                  className="py-2 px-2 font-normal text-center min-w-24 cursor-pointer select-none"
                  onClick={() => setSortBy(u)}
                >
                  <span
                    className="text-xs uppercase tracking-widest transition-colors"
                    style={{
                      color: sortBy === u ? '#3b82f6' : '#4b5563',
                      borderBottom: sortBy === u ? '1px solid #3b82f6' : '1px solid transparent',
                      paddingBottom: '2px',
                    }}
                  >
                    {u.charAt(0).toUpperCase() + u.slice(1)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((movie, idx) => (
              <tr
                key={movie.movieID}
                className={idx % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900/30'}
              >
                <td className="py-2 pr-4 text-white text-xs">{movie.title}</td>
                {USERS.map(u => {
                  const r = rankingsByUser[u][movie.movieID]
                  const tier = r?.tier || 'unranked'
                  const { label, accent } = TIER_LABELS[tier]
                  const absRank = getAbsoluteRank(rankingsByUser[u], movie.movieID)
                  return (
                    <td key={u} className="py-2 px-2 text-center">
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: accent + '20',
                          color: accent,
                          border: `0.5px solid ${accent}40`,
                        }}
                      >
                        {absRank && <span style={{ opacity: 0.6 }}>#{absRank}</span>}
                        {label}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}