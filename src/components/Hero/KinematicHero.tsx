import { Component, lazy, Suspense, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HeroFallback } from './HeroFallback';
import { useShouldRenderWebGL } from './useShouldRenderWebGL';

const KinematicScene = lazy(() => import('./KinematicScene'));

// If the scene chunk fails to load (stale hash after a redeploy, flaky network) or the scene throws,
// drop the 3D layer instead of letting the error unmount the whole page; the fallback stays visible.
class SceneErrorBoundary extends Component<{ children: ReactNode; onError?: () => void }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default function KinematicHero() {
  const shouldRenderWebGL = useShouldRenderWebGL();
  // True only once the Canvas has created a real WebGL renderer (R3F's onCreated), so a failed
  // context creation or chunk load never hides the fallback and leaves the hero blank.
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <motion.div
        data-testid="hero-fallback-layer"
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: shouldRenderWebGL && sceneReady ? 0 : 1 }}
        transition={{ duration: 0.6 }}
      >
        <HeroFallback />
      </motion.div>

      {shouldRenderWebGL && (
        <SceneErrorBoundary onError={() => setSceneReady(false)}>
          <Suspense fallback={null}>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <KinematicScene onReady={() => setSceneReady(true)} />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </SceneErrorBoundary>
      )}
    </div>
  );
}
