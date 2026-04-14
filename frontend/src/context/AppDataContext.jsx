import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { fetchHistory, analyzeNote } from '../api/appApi'

const AppDataContext = createContext(null)

const defaultMenuItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'journal', label: 'Dziennik' },
  { id: 'analytics', label: 'Analiza AI' },
  { id: 'settings', label: 'Ustawienia' },
]

const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const normalizeEntry = (entry, fallbackText = '') => {
  const text = entry.og_text || entry.original_text || entry.text || fallbackText || ''
  const date = entry.date || entry.timestamp || new Date().toISOString()
  const score = typeof entry.score === 'number' ? entry.score : parseFloat(entry.score) || 0
  const response = entry.response || ''

  return {
    id: entry.id ?? `${Date.now()}`,
    date: formatDate(date),
    text,
    score,
    response,
  }
}

const normalizeHistory = (items) => {
  if (!Array.isArray(items)) return []
  return items.map((item) => normalizeEntry(item))
}

const computeStats = (entries) => {
  if (!entries.length) {
    return {
      streakDays: 0,
      weeklyMood: 'Brak danych',
      moodLabel: 'Brak danych',
      moodTrend: [],
    }
  }

  const scoreSum = entries.reduce((sum, entry) => sum + (Number(entry.score) || 0), 0)
  const average = scoreSum / entries.length
  const moodLabel = average >= 4 ? 'Dobrze' : average >= 2.5 ? 'Stabilnie' : 'Słabo'

  return {
    streakDays: entries.length,
    weeklyMood: `Średnia ocena ${average.toFixed(1)}/5`,
    moodLabel,
    moodTrend: entries.slice(0, 7).map((entry) => Math.round(Number(entry.score) || 0)).reverse(),
  }
}

export const AppDataProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [menuItems] = useState(defaultMenuItems)
  const [stats, setStats] = useState({
    streakDays: 0,
    weeklyMood: 'Ładowanie...',
    moodLabel: 'Ładowanie',
    moodTrend: [],
  })
  const [recentEntries, setRecentEntries] = useState([])
  const [quickNote, setQuickNote] = useState('')
  const [theme, setTheme] = useState('dark')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.body.style.backgroundColor = theme === 'dark' ? '#0d0a15' : '#f5eee3'
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    let active = true

    const initialize = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const history = await fetchHistory()
        if (!active) return
        const normalized = normalizeHistory(history)
        setRecentEntries(normalized)
        setStats(computeStats(normalized))
      } catch (err) {
        if (!active) return
        setError(err)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    initialize()
    return () => {
      active = false
    }
  }, [])

  const saveNote = useCallback(async () => {
    if (!quickNote.trim()) return null

    setIsSavingNote(true)
    setError(null)

    try {
      const saved = await analyzeNote(quickNote)
      const normalized = normalizeEntry(saved, quickNote)
      setRecentEntries((prev) => [normalized, ...prev])
      setStats(computeStats([normalized, ...recentEntries]))
      setQuickNote('')
      return normalized
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsSavingNote(false)
    }
  }, [quickNote, recentEntries])

  const value = useMemo(
    () => ({
      menuItems,
      activeMenu,
      setActiveMenu,
      stats,
      recentEntries,
      quickNote,
      setQuickNote,
      theme,
      setTheme,
      saveNote,
      isLoading,
      isSavingNote,
      error,
    }),
    [
      menuItems,
      activeMenu,
      stats,
      recentEntries,
      quickNote,
      theme,
      saveNote,
      isLoading,
      isSavingNote,
      error,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export const useAppData = () => {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider')
  }
  return context
}
