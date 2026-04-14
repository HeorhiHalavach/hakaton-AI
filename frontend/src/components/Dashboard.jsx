import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Journal } from './Journal';

export const Dashboard = () => {
  const { menuItems, activeMenu, setActiveMenu, stats, recentEntries, error } = useAppData();

  return (
    <div className="flex h-screen w-full bg-[#0d0a15] text-gray-200 font-sans overflow-hidden">
      <aside className="w-20 lg:w-64 bg-[#151123] border-r border-purple-900/30 flex flex-col items-center lg:items-start py-8 z-20">
        <div className="hidden lg:block px-8 mb-12">
          <h1 className="text-1xl font-black text-[#fbbf24] tracking-widest">Nawigator Umysłu</h1>
          <p className="text-xs text-purple-400 mt-1 uppercase tracking-widest">Nawigator Umysłu</p>
        </div>

        <nav className="w-full px-2 lg:px-4 flex flex-col gap-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex justify-center lg:justify-start items-center gap-4 p-3 lg:px-4 rounded-xl transition-all duration-300 w-full ${
                activeMenu === item.id
                  ? 'bg-purple-600/20 text-[#fbbf24] border border-purple-500/30'
                  : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
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
              <h2 className="text-3xl font-bold text-white">Cześć, Użytkowniku!</h2>
              <p className="text-gray-400 mt-2">Oto proste podsumowanie Twojego dobrostanu na dziś.</p>
            </div>
            <p className="text-[#fbbf24] font-medium">{new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
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
                  <p className="text-sm text-gray-400 mb-2">Dni z rzędu</p>
                  <p className="text-3xl font-bold text-white">{stats.streakDays}</p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-[#1e1a38]/60 p-5 shadow-lg">
                  <p className="text-sm text-gray-400 mb-2">Średni nastrój</p>
                  <p className="text-3xl font-bold text-[#fbbf24]">{stats.moodLabel}</p>
                  <p className="text-sm text-gray-400">{stats.weeklyMood}</p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-[#1e1a38]/60 p-5 shadow-lg">
                  <p className="text-sm text-gray-400 mb-2">Notatki</p>
                  <p className="text-3xl font-bold text-white">{recentEntries.length}</p>
                </div>
              </div>

              <section className="rounded-2xl border border-purple-500/20 bg-[#1e1a38]/60 p-5 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">Ostatnie notatki</h3>
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <div key={entry.id} className="rounded-xl bg-[#0d0a15]/50 p-4">
                      <p className="text-xs text-[#fbbf24] mb-1">{entry.date}</p>
                      <p className="text-sm text-gray-300">{entry.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : activeMenu === 'journal' ? (
            <Journal />
          ) : activeMenu === 'analytics' ? (
            <div className="rounded-2xl border border-purple-500/20 bg-[#1e1a38]/60 p-5 shadow-lg">
              <h3 className="text-lg font-bold text-white">Analiza AI</h3>
              <p className="text-gray-400 mt-2">Analiza.</p>
            </div>
          ) : activeMenu === 'settings' ? (
            <div className="rounded-2xl border border-purple-500/20 bg-[#1e1a38]/60 p-5 shadow-lg">
              <h3 className="text-lg font-bold text-white">Ustawienia</h3>
              <p className="text-gray-400 mt-2">Ustawnienia</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-purple-500/20 bg-[#1e1a38]/60 p-5 shadow-lg">
              <h3 className="text-lg font-bold text-white">Nie znaleziono strony</h3>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
