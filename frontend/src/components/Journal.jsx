import React from 'react'
import { useAppData } from '../context/AppDataContext'

export const Journal = () => {
  const { quickNote, setQuickNote, saveNote, isSavingNote, recentEntries, error } = useAppData()

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-purple-500/20 bg-[#1e1a38]/60 p-5 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4">Dziennik</h3>
        <p className="text-sm text-gray-400 mb-4">Wpisz swoje myśli lub uczucia i zapisz je do historii.</p>
        <textarea
          rows={8}
          className="w-full rounded-2xl border border-purple-500/40 bg-[#0d0a15] p-4 text-gray-100 placeholder:text-gray-500 focus:border-purple-300 focus:outline-none"
          placeholder="Napisz tutaj, co się dziś wydarzyło..."
          value={quickNote}
          onChange={(event) => setQuickNote(event.target.value)}
        />
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={saveNote}
            disabled={isSavingNote || !quickNote.trim()}
            className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingNote ? 'Zapisuję...' : 'Zapisz notatkę'}
          </button>
          <span className="text-sm text-gray-400">Możesz zapisać krótką refleksję na dziś.</span>
        </div>
        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200">
            Błąd zapisu: {error.message}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-purple-500/20 bg-[#1e1a38]/60 p-5 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4">Ostatnie wpisy</h3>
        <div className="space-y-3">
          {recentEntries.length === 0 ? (
            <div className="rounded-xl bg-[#0d0a15]/50 p-4 text-sm text-gray-300">Brak zapisanych wpisów.</div>
          ) : (
            recentEntries.map((entry) => (
              <div key={entry.id} className="rounded-xl bg-[#0d0a15]/50 p-4">
                <p className="text-xs text-[#fbbf24] mb-1">{entry.date}</p>
                <p className="text-sm text-gray-300 whitespace-pre-line">{entry.text}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
