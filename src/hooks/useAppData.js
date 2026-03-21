import { useState, useEffect } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'

const API_URL = import.meta.env.VITE_API_URL

async function authHeaders() {
  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()
  if (!token) throw new Error('No auth token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

export function useAppData(userID) {
  const [movies, setMovies] = useState([])
  const [rankings, setRankings] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const headers = await authHeaders()

        const [moviesRes, rankingsRes] = await Promise.all([
          fetch(`${API_URL}/movies`),
          fetch(`${API_URL}/rankings`, { headers }),
        ])

        const moviesData = await moviesRes.json()
        const rankingsData = await rankingsRes.json()

        setMovies(moviesData)

        const myRankings = rankingsData.find(r => r.userID === userID)
        setRankings(myRankings?.rankings || {})
      } catch (err) {
        console.error(err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userID])

  return { movies, rankings, setRankings, loading, error }
}

export { authHeaders }