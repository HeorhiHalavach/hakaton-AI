import { useEffect, useState } from 'react'
import './App.css'
import { StartDisplay } from './components/StartDisplay'
import { Dashboard } from './components/Dashboard'
import { AppDataProvider } from './context/AppDataContext'

import './index.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AppDataProvider>
      {isLoading && <StartDisplay />}
      <Dashboard />
    </AppDataProvider>
  )
}

export default App
