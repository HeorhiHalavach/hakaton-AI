import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchDashboardStats, fetchRecentEntries, submitQuickNote } from '../api/appApi'

const AppDataContext = createContext(null)

const defaultMenuItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'journal', label: 'Dziennik' },
  { id: 'analytics', label: 'Analiza AI' },
  { id: 'settings', label: 'Ustawienia' },
]

export const AppDataProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [menuItems] = useState(defaultMenuItems)
  const [stats, setStats] = useState({
    streakDays: 0,
    weeklyMood: 0,
    moodLabel: 'Ładowanie',
    moodTrend: [80, 60, 70, 40, 30, 50, 20],
  })
  const [recentEntries, setRecentEntries] = useState([])
  const [quickNote, setQuickNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    const initialize = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [dashboardStats, entries] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentEntries(),
        ])

        if (!active) return
        setStats(dashboardStats)
        setRecentEntries(entries)
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

  const saveNote = async () => {
    if (!quickNote.trim()) return null

    setIsSavingNote(true)
    setError(null)

    try {
      const savedNote = await submitQuickNote(quickNote)
      setRecentEntries((prev) => [savedNote, ...prev])
      setQuickNote('')
      return savedNote
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsSavingNote(false)
    }
  }

  const value = useMemo(
    () => ({
      menuItems,
      activeMenu,
      setActiveMenu,
      stats,
      recentEntries,
      quickNote,
      setQuickNote,
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
