

# Splash Screen Upgrade: Particle Explosion Animation

## Overview
Replace the current basic bounce/fade splash screen with a premium **particle explosion** animation where hundreds of tiny particles scatter across the screen and then converge to form the ClauseWise logo, followed by a smooth text reveal and elegant exit transition. This mirrors the style seen in apps like Spotify, Revolut, and modern fintech platforms.

## Animation Sequence (3 seconds total)

1. **Phase 1 (0-1s):** Screen opens with a deep indigo-to-purple gradient. ~80 glowing particles (small circles) are randomly scattered across the viewport, gently floating.
2. **Phase 2 (1-2s):** Particles rapidly converge toward the center with spring physics, shrinking and fading as the ClauseWise logo scales up from 0 to full size with a subtle glow/shadow burst effect.
3. **Phase 3 (2-2.5s):** Logo settles with a gentle bounce. "ClauseWise" text fades up from below, followed by the tagline "Your AI Financial Buddy" with a staggered delay.
4. **Phase 4 (2.5-3s):** Everything scales up slightly while fading out, transitioning to the main app.

## Technical Approach

### Using Framer Motion (already installed)
Leverage `framer-motion` (already a dependency) for all animations -- no new libraries needed:
- `motion.div` for each particle with randomized initial positions
- `useAnimate` or `variants` for orchestrating the multi-phase sequence
- Spring physics (`type: "spring"`) for natural particle convergence
- `AnimatePresence` for smooth exit transition

### File Changes

**1. `src/components/SplashScreen.tsx`** -- Complete rewrite
- Generate ~80 particle objects with random positions, sizes (2-6px), and opacity values
- Phase 1: Particles rendered as `motion.div` circles with subtle floating animation
- Phase 2: All particles animate to center `(x: 0, y: 0)` using staggered spring transitions
- Phase 3: Logo `motion.img` scales from 0 to 1 with a spring bounce; text elements stagger in with `fadeInUp`
- Phase 4: Entire container fades out with `scale: 1.1` and `opacity: 0`
- Use `useEffect` with timeline delays for phase orchestration
- Add a subtle radial glow behind the logo using a blurred div

**2. `tailwind.config.ts`** -- Add supporting keyframes
- Add `glow-pulse` keyframe for the radial glow effect behind the logo

### Particle Configuration
- Count: 80 particles
- Colors: Mix of white, indigo-200, purple-300 (matching brand palette)
- Sizes: Random between 2px and 6px
- Initial positions: Random across full viewport using `Math.random() * 100vw/vh`
- Convergence: Spring with `stiffness: 120, damping: 14` for natural feel
- Stagger: 0.005s between each particle for a wave-like convergence

### Background Enhancement
- Animated gradient that subtly shifts during the sequence (using CSS `background-position` animation)
- Radial glow emanating from center when logo appears

### Performance Considerations
- Use `will-change: transform` on particles
- Particles unmounted after convergence to free DOM nodes
- Total animation under 3s to keep UX snappy
- `useReducedMotion` hook from framer-motion to respect accessibility preferences (skip to static logo if user prefers reduced motion)

