import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
        <motion.div 
            initial={{ opacity: 1 }}
            animate={{ 
                opacity: isLeaving ? 0 : 1,
                pointerEvents: isLeaving ? 'none' : 'all'
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="start-screen"
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                zIndex: 9999 
            }}
        >
            <motion.div 
                className="bg-glow"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 5, repeat: Infinity }}
            />

            <div className="content-box">
                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="title"
                >
                    Nawigator Umysłu
                </motion.h1>
                <div className="line" />
                <p className="subtitle">Ładowanie danych</p>
            </div>
        </motion.div>
    );
}