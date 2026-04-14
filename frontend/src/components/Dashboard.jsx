import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Journal } from './Journal';

export const Dashboard = () => {
  const { menuItems, activeMenu, setActiveMenu, stats, recentEntries, error, theme, setTheme } = useAppData();
  const isDark = theme === 'dark'

  return (
    <div className={`flex h-screen w-full ${isDark ? 'bg-[#0d0a15] text-gray-200' : 'bg-[#f5eee3] text-[#5f4b3a]'} font-sans overflow-hidden`}>
      <aside className={`w-20 lg:w-64 ${isDark ? 'bg-[#151123] border-purple-900/30 text-gray-200' : 'bg-[#f7e8d0] border-[#dbc3a2] text-[#5f4b3a]'} border-r flex flex-col items-center lg:items-start py-8 z-20`}>
        <div className="hidden lg:block px-8 mb-12">
          <h1 className={`text-1xl font-black tracking-widest ${isDark ? 'text-[#fbbf24]' : 'text-[#7b5e45]'}`}>Nawigator Umysłu</h1>
          <p className={`text-xs mt-1 uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-[#a68462]'}`}>Nawigator Umysłu</p>
        </div>

        <nav className="w-full px-2 lg:px-4 flex flex-col gap-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex justify-center lg:justify-start items-center gap-4 p-3 lg:px-4 rounded-xl transition-all duration-300 w-full ${
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
              <span className="hidden lg:block font-medium">{item.label}</span>
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-purple-500/20 bg-[#1e1a38]/60 p-5 shadow-lg">
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
                    <div key={entry.id} className={`rounded-xl p-4 ${isDark ? 'bg-[#0d0a15]/50' : 'bg-[#f6ece0]'}`}>
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
              <p className={`${isDark ? 'text-gray-400' : 'text-[#7b6755]'} mt-2`}>Analiza.</p>
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
