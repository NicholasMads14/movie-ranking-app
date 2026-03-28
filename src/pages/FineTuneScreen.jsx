import { useState } from 'react'
import { authHeaders } from '../hooks/useAppData'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const API_URL = import.meta.env.VITE_API_URL
const isDemo = import.meta.env.VITE_ENV === 'demo'

const TIER_ORDER = ['loved', 'liked', 'fine', 'badfun', 'disliked', 'hated', 'unseen']
const TIER_LABELS = {
  loved: { label: 'Loved it', accent: '#10b981' },
  liked: { label: 'Liked it', accent: '#3b82f6' },
  fine: { label: "It's fine", accent: '#a855f7' },
  badfun: { label: 'Bad, but fun', accent: '#ec4899' },
  disliked: { label: "Didn't like it", accent: '#ef4444' },
  hated: { label: isDemo ? 'Hated it' : "Fuckin' hated it", accent: '#f97316' },
  unseen: { label: "Haven't seen it", accent: '#6b7280' },
}

function SortableMovie({ movie, saving, accent }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: movie.movieID })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: accent + '40' }}
      className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 border rounded-lg px-3 py-2 md:px-2 md:py-1"
    >
      <span className="text-gray-400 dark:text-gray-600 text-xs w-5 text-right flex-shrink-0">{movie.rank}</span>
      <span className="text-gray-900 dark:text-white text-sm md:text-xs flex-1 truncate">{movie.title}</span>
      <div
        {...attributes}
        {...listeners}
        className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none ml-2 -mr-1 flex flex-col gap-1 p-2"
      >
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-current" />
          <div className="w-1 h-1 rounded-full bg-current" />
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-current" />
          <div className="w-1 h-1 rounded-full bg-current" />
        </div>
      </div>
    </div>
  )
}

export default function FineTuneScreen({ movies, rankings, setRankings, userID }) {
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 10 } }),
  )

  const movieMap = {}
  movies.forEach(m => { movieMap[m.movieID] = m.title })

  const getTierMovies = (tier) => {
    return Object.entries(rankings)
      .filter(([, r]) => r.tier === tier)
      .sort((a, b) => a[1].rank - b[1].rank)
      .map(([movieID, r]) => ({ movieID, title: movieMap[movieID] || movieID, rank: r.rank }))
      .filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
  }

  const saveRankings = async (newRankings) => {
    setSaving(true)
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

  const handleDragEnd = (event, tier) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const tierMovieIDs = Object.entries(rankings)
      .filter(([, r]) => r.tier === tier)
      .sort((a, b) => a[1].rank - b[1].rank)
      .map(([id]) => id)

    const oldIdx = tierMovieIDs.indexOf(active.id)
    const newIdx = tierMovieIDs.indexOf(over.id)
    const reordered = arrayMove(tierMovieIDs, oldIdx, newIdx)

    const newRankings = { ...rankings }
    reordered.forEach((id, i) => {
      newRankings[id] = { ...newRankings[id], rank: i + 1 }
    })

    setRankings(newRankings)
    saveRankings(newRankings)
  }

  if (Object.keys(rankings).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <p className="text-xl font-bold text-gray-900 dark:text-white">Nothing to reorder yet.</p>
        <p className="text-gray-500 text-sm">Head to Rank to start tiering your movies.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 py-2">

      {saving && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '11px',
            padding: '6px 14px',
            borderRadius: '999px',
            pointerEvents: 'none',
            zIndex: 50,
          }}
          className="bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700"
        >
          Saving...
        </div>
      )}

      <div className="flex justify-center">
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-xs bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors placeholder-gray-400 dark:placeholder-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {TIER_ORDER.map(tier => {
          const tierMovies = getTierMovies(tier)
          const { label, accent } = TIER_LABELS[tier]

          return (
            <div key={tier} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 px-1 mb-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
                <span className="text-xs text-gray-500 uppercase tracking-widest truncate">{label}</span>
                <span className="text-xs text-gray-400 dark:text-gray-700 ml-auto flex-shrink-0">{tierMovies.length}</span>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, tier)}
              >
                <SortableContext
                  items={tierMovies.map(m => m.movieID)}
                  strategy={verticalListSortingStrategy}
                >
                  {tierMovies.map((movie) => (
                    <SortableMovie
                      key={movie.movieID}
                      movie={movie}
                      saving={saving}
                      accent={accent}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )
        })}
      </div>
    </div>
  )
}
