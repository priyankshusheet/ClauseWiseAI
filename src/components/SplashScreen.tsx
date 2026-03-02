import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import clausewiseLogo from '@/assets/clausewise-logo.png';
import { successFeedback } from '@/utils/haptics';

interface SplashScreenProps {
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

const PARTICLE_COUNT = 80;
const COLORS = ['#ffffff', '#c7d2fe', '#d8b4fe', '#a5b4fc', '#e9d5ff'];

const generateParticles = (): Particle[] =>
  Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 100, // vw offset from center
    y: (Math.random() - 0.5) * 100, // vh offset from center
    size: Math.random() * 4 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: i * 0.005,
  }));

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [showParticles, setShowParticles] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const particles = useMemo(() => generateParticles(), []);

  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip animation entirely
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }

    const timers = [
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => {
        setPhase(3);
        setShowParticles(false); // unmount particles to free DOM
        successFeedback();
      }, 2000),
      setTimeout(() => setPhase(4), 2500),
      setTimeout(onComplete, 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 flex items-center justify-center z-50">
        <div className="text-center">
          <img src={clausewiseLogo} alt="ClauseWise" className="w-24 h-24 mx-auto rounded-2xl" />
          <h1 className="text-4xl font-bold text-white mt-6">ClauseWise</h1>
          <p className="text-indigo-200 text-lg mt-2">Your AI Financial Buddy</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {phase !== 4 ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #1e1b4b 100%)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: phase >= 2 ? '100% 100%' : '0% 0%',
          }}
          exit={{
            opacity: 0,
            scale: 1.1,
            transition: { duration: 0.5, ease: 'easeInOut' },
          }}
          transition={{ duration: 3, ease: 'easeInOut' }}
        >
          {/* Particles */}
          {showParticles &&
            particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  willChange: 'transform',
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                }}
                initial={{
                  x: `${p.x}vw`,
                  y: `${p.y}vh`,
                  opacity: 0.6,
                  scale: 1,
                }}
                animate={
                  phase >= 2
                    ? {
                        x: 0,
                        y: 0,
                        opacity: 0,
                        scale: 0,
                      }
                    : {
                        x: [`${p.x}vw`, `${p.x + (Math.random() - 0.5) * 4}vw`],
                        y: [`${p.y}vh`, `${p.y + (Math.random() - 0.5) * 4}vh`],
                        opacity: [0.4, 0.8, 0.4],
                      }
                }
                transition={
                  phase >= 2
                    ? {
                        type: 'spring',
                        stiffness: 120,
                        damping: 14,
                        delay: p.delay,
                      }
                    : {
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse' as const,
                        ease: 'easeInOut',
                      }
                }
              />
            ))}

          {/* Radial glow behind logo */}
          <motion.div
            className={`absolute rounded-full ${phase >= 2 ? 'animate-glow-pulse' : ''}`}
            style={{
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              phase >= 2
                ? { opacity: 1, scale: 1.5 }
                : { opacity: 0, scale: 0 }
            }
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Logo Content */}
          <motion.div className="relative z-10 flex flex-col items-center">
            <motion.div
              className="rounded-3xl shadow-2xl overflow-hidden border border-white/10"
              style={{ width: 100, height: 100 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                phase >= 2
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0, opacity: 0 }
              }
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 12,
                delay: 0.2,
              }}
            >
              <img
                src={clausewiseLogo}
                alt="ClauseWise"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-white mt-8 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={
                phase >= 3
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              ClauseWise
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-indigo-200/80 text-lg md:text-xl font-medium mt-3"
              initial={{ opacity: 0, y: 15 }}
              animate={
                phase >= 3
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 15 }
              }
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              Your AI Financial Buddy
            </motion.p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
