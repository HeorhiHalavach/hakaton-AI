import React from 'react'

const TrendChart = ({ values = [], isDark }) => {
  const points = values.length
    ? values.map((value, index) => {
        const x = values.length === 1 ? 50 : (index * 100) / (values.length - 1)
        const y = Math.max(10, 90 - Math.round(Number(value) * 15))
        return { x, y }
      })
    : []

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ')

  return (
    <div className="h-48 w-full">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <linearGradient id="stats-trend-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? '#8b5cf6' : '#7b5e45'} />
            <stop offset="100%" stopColor={isDark ? '#fbbf24' : '#d78b3c'} />
          </linearGradient>
        </defs>
        <path
          d={path}
          fill="none"
          stroke="url(#stats-trend-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="2.5"
            fill={isDark ? '#fbbf24' : '#a66f3a'}
          />
        ))}
      </svg>
      {!points.length && (
        <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-[#7b6755]'}`}>
          Brak danych do wyświetlenia.
        </p>
      )}
    </div>
  )
}

export const StatisticsPanel = ({ stats, isDark }) => {
  return (
    <div className={`rounded-2xl border p-5 shadow-lg ${isDark ? 'border-purple-500/20 bg-[#1e1a38]/60' : 'border-[#dbc3a2] bg-[#f8eee0]'}`}>
      <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>Statystyki</h3>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className={`rounded-2xl border p-4 ${isDark ? 'border-purple-500/20 bg-[#15142b]' : 'border-[#d9c6ac] bg-[#f5e8da]'}`}>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-[#7b6755]'}`}>Dni z rzędu</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>{stats.streakDays}</p>
        </div>

        <div className={`rounded-2xl border p-4 ${isDark ? 'border-purple-500/20 bg-[#15142b]' : 'border-[#d9c6ac] bg-[#f5e8da]'}`}>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-[#7b6755]'}`}>Średni nastrój</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-[#fbbf24]' : 'text-[#a66f3a]'}`}>{stats.moodLabel}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#7b6755]'}`}>{stats.weeklyMood}</p>
        </div>

        <div className={`rounded-2xl border p-4 ${isDark ? 'border-purple-500/20 bg-[#15142b]' : 'border-[#d9c6ac] bg-[#f5e8da]'}`}>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-[#7b6755]'}`}>Liczba wpisów</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>{stats.moodTrend.length}</p>
        </div>
      </div>

      <div className={`rounded-2xl border p-4 ${isDark ? 'border-purple-500/10 bg-[#15142b]' : 'border-[#d9c6ac] bg-[#f5e8da]'}`}>
        <div className="flex items-center justify-between mb-3">
          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#5f4b3a]'}`}>Trend nastroju</p>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-[#7b6755]'}`}>ostatnie 7 wpisów</span>
        </div>
        <TrendChart values={stats.moodTrend} isDark={isDark} />
      </div>
    </div>
  )
}
