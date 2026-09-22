import { lazy, Suspense, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HeroFallback } from './HeroFallback';
import { useShouldRenderWebGL } from './useShouldRenderWebGL';

const KinematicScene = lazy(() => import('./KinematicScene'));

export default function KinematicHero() {
  const shouldRenderWebGL = useShouldRenderWebGL();
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0">
        <HeroFallback />
      </div>

      {shouldRenderWebGL && (
        <Suspense fallback={null}>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
              onAnimationStart={() => setSceneReady(true)}
            >
              <KinematicScene />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      )}
    </div>
  );
}
