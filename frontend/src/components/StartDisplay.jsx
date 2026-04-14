import { useState, useEffect } from 'react';
import '../index.css';

export const StartDisplay = () => {
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
      }}
    >
      <div className="bg-glow" />

      <div className="content-box">
        <h1 className="title">Nawigator Umysłu</h1>
        <div className="line" />
        <p className="subtitle">Ładowanie danych</p>
      </div>
    </div>
  );
}
