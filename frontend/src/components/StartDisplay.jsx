import { useState, useEffect } from 'react';
import '../index.css';
import { useAppData } from '../context/AppDataContext';

export const StartDisplay = () => {
  const { theme } = useAppData();
  const isDark = theme === 'dark';
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="start-screen"
      style={{
        opacity: isLeaving ? 0 : 1,
        pointerEvents: isLeaving ? 'none' : 'all',
        transition: 'opacity 1s ease-in-out',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        backgroundColor: isDark ? '#0f172a' : '#f5eee3',
      }}
    >
      <div
        className="bg-glow"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(15, 23, 42, 0) 70%)'
            : 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(245, 238, 227, 0) 70%)',
        }}
      />

      <div className="content-box">
        <h1 className="title">Nawigator Umysłu</h1>
        <div className="line" style={{ background: isDark ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' : 'linear-gradient(to right, #34d399, #60a5fa)' }} />
        <p className="subtitle" style={{ color: isDark ? 'rgba(191, 219, 254, 0.5)' : 'rgba(55, 65, 81, 0.7)' }}>Ładowanie danych</p>
      </div>
    </div>
  );
}
