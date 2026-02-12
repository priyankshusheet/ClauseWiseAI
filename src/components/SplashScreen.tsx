import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import clausewiseLogo from '@/assets/clausewise-logo.png';

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
      }, 2000),
      setTimeout(() => setPhase(4), 2500),
      setTimeout(onComplete, 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 flex items-center justify-center z-50">
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
            background: 'linear-gradient(135deg, #312e81 0%, #6d28d9 50%, #312e81 100%)',
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
          transition={{ duration: 2, ease: 'easeInOut' }}
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
                        x: [`${p.x}vw`, `${p.x + (Math.random() - 0.5) * 6}vw`],
                        y: [`${p.y}vh`, `${p.y + (Math.random() - 0.5) * 6}vh`],
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
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              phase >= 2
                ? { opacity: 1, scale: 1.5 }
                : { opacity: 0, scale: 0 }
            }
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Logo */}
          <motion.div className="relative z-10 flex flex-col items-center">
            <motion.div
              className="rounded-2xl shadow-2xl overflow-hidden"
              style={{ width: 96, height: 96 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                phase >= 2
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0, opacity: 0 }
              }
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: phase >= 2 ? 0.3 : 0,
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
              className="text-4xl md:text-5xl font-bold text-white mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={
                phase >= 3
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              ClauseWise
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-indigo-200 text-lg mt-2"
              initial={{ opacity: 0, y: 15 }}
              animate={
                phase >= 3
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 15 }
              }
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
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
