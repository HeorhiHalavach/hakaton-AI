import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Journal } from './Journal';
import { StatisticsPanel } from './StatisticsPanel';

const getEntryBackground = (score, isDark) => {
  const normalized = Math.min(5, Math.max(1, Number(score) || 1))
  const hue = ((normalized - 1) / 4) * 120
  const saturation = isDark ? 65 : 90
  const lightness = isDark ? 20 : 92
  const alpha = isDark ? 0.2 : 0.35
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
}

export const Dashboard = () => {
  const { menuItems, activeMenu, setActiveMenu, stats, recentEntries, error, theme, setTheme } = useAppData();
  const isDark = theme === 'dark'

  return (
    <div className={`flex min-h-screen w-full flex-col md:flex-row ${isDark ? 'bg-[#0d0a15] text-gray-200' : 'bg-[#f5eee3] text-[#5f4b3a]'} font-sans overflow-hidden`}>
      <aside className={`w-full md:w-20 lg:w-64 ${isDark ? 'bg-[#151123] border-purple-900/30 text-gray-200' : 'bg-[#f7e8d0] border-[#dbc3a2] text-[#5f4b3a]'} border-b md:border-b-0 md:border-r flex flex-col items-center md:items-start py-4 md:py-8 z-20`}>
        <div className="w-full px-4 md:px-8 mb-4 md:mb-12">
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div>
              <h1 className={`text-lg font-black tracking-widest ${isDark ? 'text-[#fbbf24]' : 'text-[#7b5e45]'}`}>Nawigator Umysłu</h1>
              <p className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-[#a68462]'}`}>Nawigator Umysłu</p>
            </div>
          </div>
        </div>

        <nav className="w-full px-2 md:px-0 flex flex-row md:flex-col flex-wrap gap-2 md:gap-3 justify-between md:justify-start">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex justify-center md:justify-start items-center gap-4 p-3 lg:px-4 rounded-xl transition-all duration-300 w-full md:w-auto ${
                activeMenu === item.id
                  ? isDark
                    ? 'bg-purple-600/20 text-[#fbbf24] border border-purple-500/30'
                    : 'bg-[#e5d0b1] text-[#5f4b3a] border border-[#b57a4b]'
                  : isDark
                  ? 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-[#f0ddc7] text-[#5f4b3a] hover:text-[#5f4b3a]'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>Cześć, Użytkowniku!</h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-[#7b6755]'} mt-2`}>Oto proste podsumowanie Twojego dobrostanu na dziś.</p>
            </div>
            <p className={`font-medium ${isDark ? 'text-[#fbbf24]' : 'text-[#a66f3a]'}`}>{new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </header>

          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
              Problem z ładowaniem danych {error.message}
            </div>
          )}

          {activeMenu === 'dashboard' ? (
            <>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <div className={`rounded-2xl border p-5 shadow-lg ${isDark ? 'border-purple-500/20 bg-[#1e1a38]/60' : 'border-[#dbc3a2] bg-[#f8eee0]'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#7b6755]'} mb-2`}>Dni z rzędu</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>{stats.streakDays}</p>
                </div>

                <div className={`rounded-2xl border p-5 shadow-lg ${isDark ? 'border-purple-500/20 bg-[#1e1a38]/60' : 'border-[#dbc3a2] bg-[#f8eee0]'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#7b6755]'} mb-2`}>Średni nastrój</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-[#fbbf24]' : 'text-[#a66f3a]'}`}>{stats.moodLabel}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#7b6755]'}`}>{stats.weeklyMood}</p>
                </div>

                <div className={`rounded-2xl border p-5 shadow-lg ${isDark ? 'border-purple-500/20 bg-[#1e1a38]/60' : 'border-[#dbc3a2] bg-[#f8eee0]'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#7b6755]'} mb-2`}>Notatki</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>{recentEntries.length}</p>
                </div>
              </div>

              <section className={`rounded-2xl border p-5 shadow-lg ${isDark ? 'border-purple-500/20 bg-[#1e1a38]/60' : 'border-[#dbc3a2] bg-[#f8eee0]'}`}>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#5f4b3a]'} mb-4`}>Ostatnie notatki</h3>
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl p-4"
                      style={{ backgroundColor: getEntryBackground(entry.score, isDark) }}
                    >
                      <p className={`text-xs ${isDark ? 'text-[#fbbf24]' : 'text-[#ae865f]'} mb-1`}>{entry.date}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-[#6e5644]'}`}>{entry.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : activeMenu === 'journal' ? (
            <Journal />
          ) : activeMenu === 'analytics' ? (
            <div className={`rounded-2xl border p-5 shadow-lg ${isDark ? 'border-purple-500/20 bg-[#1e1a38]/60' : 'border-[#dbc3a2] bg-[#f8eee0]'}`}>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>Analiza AI</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-[#7b6755]'} mt-2 mb-6`}>Tu zobaczysz aktualny trend nastroju na podstawie ostatnich notatek.</p>

              <StatisticsPanel stats={stats} isDark={isDark} />
            </div>
          ) : activeMenu === 'settings' ? (
            <div className={`rounded-2xl border p-5 shadow-lg ${isDark ? 'border-purple-500/20 bg-[#1e1a38]/60' : 'border-[#dbc3a2] bg-[#f8eee0]'}`}>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>Ustawienia</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-[#7b6755]'} mt-2 mb-6`}>Wybierz motyw aplikacji.</p>

              <div className="space-y-3">
                {['dark', 'light'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTheme(option)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      theme === option
                        ? 'border-[#b57a4b] bg-[#f5e5d4] text-[#7b5e45]'
                        : isDark
                        ? 'border-purple-500/10 bg-[#0d0a15] text-gray-200 hover:bg-[#2d2647]'
                        : 'border-[#d3b89a] bg-[#f7e8d0] text-[#5f4b3a] hover:bg-[#f0ddc7]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold capitalize">{option} motyw</p>
                        <p className="text-sm mt-1 text-gray-400">{option === 'dark' ? 'Ciemny wygląd' : 'Jasny wygląd'}</p>
                      </div>
                      <span className="text-sm font-medium">{theme === option ? 'Wybrano' : 'Wybierz'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl border p-5 shadow-lg ${isDark ? 'border-purple-500/20 bg-[#1e1a38]/60' : 'border-[#dbc3a2] bg-[#f8eee0]'}`}>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>Nie znaleziono strony</h3>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
