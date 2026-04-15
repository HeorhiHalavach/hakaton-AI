import React, { useState, useRef, useEffect } from 'react'
import { useAppData } from '../context/AppDataContext'
import { speakText } from '../api/appApi'

export const Journal = () => {
  const { quickNote, setQuickNote, saveNote, isSavingNote, recentEntries, error, theme } = useAppData()
  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(null)
  const isDark = theme === 'dark'

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        if (audioRef.current._objectUrl) {
          window.URL.revokeObjectURL(audioRef.current._objectUrl)
        }
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <section className={`rounded-2xl border p-5 shadow-lg ${isDark ? 'border-purple-500/20 bg-[#1e1a38]/60' : 'border-[#dbc3a2] bg-[#f8eee0]'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>Dziennik</h3>
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-[#7b6755]'}`}>Wpisz swoje myśli lub uczucia i zapisz je do historii.</p>
        <textarea
          rows={8}
          className={`w-full rounded-2xl border p-4 focus:outline-none ${isDark ? 'border-purple-500/40 bg-[#0d0a15] text-gray-100 placeholder:text-gray-500 focus:border-purple-300' : 'border-[#d3b89a] bg-[#f9efe0] text-[#5f4b3a] placeholder:text-[#a78c72] focus:border-[#b57a4b]'}`}
          placeholder="Napisz tutaj, co się dziś wydarzyło..."
          value={quickNote}
          onChange={(event) => setQuickNote(event.target.value)}
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={saveNote}
            disabled={isSavingNote || !quickNote.trim()}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${isDark ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-[#b57a4b] text-white hover:bg-[#a36f44]'}`}
          >
            {isSavingNote ? 'Zapisuję...' : 'Zapisz notatkę'}
          </button>
          <span className={`${isDark ? 'text-gray-400' : 'text-[#7b6755]'}`}>Możesz zapisać krótką refleksję na dziś.</span>
        </div>
        {isSavingNote && (
          <div className={`mt-4 flex items-center gap-3 rounded-2xl p-4 text-sm ${isDark ? 'bg-[#272146]/80 text-gray-200' : 'bg-[#f4e5d1] text-[#6e5644]'}`}>
            <span className={`inline-block h-4 w-4 rounded-full border-2 ${isDark ? 'border-slate-200 border-t-transparent' : 'border-[#6e5644] border-t-transparent'} animate-spin`} />
            <span>Oczekiwanie na odpowiedź serwera</span>
          </div>
        )}
        {error && (
          <div className={`mt-4 rounded-xl p-3 text-sm ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-200' : 'bg-red-100 border border-red-200 text-red-800'}`}>
            Błąd zapisu: {error.message}
          </div>
        )}
      </section>

      <section className={`rounded-2xl border p-5 shadow-lg ${isDark ? 'border-purple-500/20 bg-[#1e1a38]/60' : 'border-[#dbc3a2] bg-[#f8eee0]'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>Ostatnie wpisy</h3>
        <div className="space-y-3">
          {recentEntries.length === 0 ? (
            <div className={`rounded-xl p-4 text-sm ${isDark ? 'bg-[#0d0a15]/50 text-gray-300' : 'bg-[#f6ece0] text-[#6e5644]'}`}>Brak zapisanych wpisów.</div>
          ) : (
            recentEntries.map((entry) => (
              <div key={entry.id} className={`rounded-xl p-4 ${isDark ? 'bg-[#0d0a15]/50' : 'bg-[#f6ece0]'}`}>
                <p className={`text-xs mb-1 ${isDark ? 'text-[#fbbf24]' : 'text-[#ae865f]'}`}>{entry.date}</p>
                <p className={`text-sm whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-[#6e5644]'}`}>{entry.text}</p>
                {entry.response && (
                  <div className={`mt-4 rounded-2xl p-4 ${isDark ? 'bg-[#2d2544]/80 border border-purple-500/20' : 'bg-[#f1e2d0] border border-[#d3b89a]'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className={`text-xs uppercase tracking-widest ${isDark ? 'text-[#9f7aea]' : 'text-[#a66f3a]'}`}>Odpowiedź</p>
                      <button
                        type="button"
                        onClick={async () => {
                          if (playingId === entry.id) return
                          setPlayingId(entry.id)

                          if (audioRef.current) {
                            audioRef.current.pause()
                            if (audioRef.current._objectUrl) {
                              window.URL.revokeObjectURL(audioRef.current._objectUrl)
                            }
                          }

                          try {
                            const blob = await speakText(entry.response)
                            const audioUrl = window.URL.createObjectURL(blob)
                            const audio = new Audio(audioUrl)
                            audioRef.current = audio
                            audioRef.current._objectUrl = audioUrl

                            audio.onended = () => {
                              window.URL.revokeObjectURL(audioUrl)
                              setPlayingId(null)
                            }

                            await audio.play()
                          } catch (err) {
                            console.error('Błąd odtwarzania:', err)
                            setPlayingId(null)
                          }
                        }}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${isDark ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-[#b57a4b] text-white hover:bg-[#a36f44]'}`}
                      >
                        {playingId === entry.id ? 'Odtwarzanie...' : 'Odtwórz'}
                      </button>
                    </div>
                    <p className={`mt-3 text-sm whitespace-pre-line ${isDark ? 'text-gray-200' : 'text-[#5f4b3a]'}`}>{entry.response}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
