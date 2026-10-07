'use client';

import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; onError?: () => void };

/**
 * Wraps every WebGL or 3D centrepiece. A render error or a failed chunk load renders nothing, so
 * the server-rendered poster or fallback underneath shows instead (spec 4.4: fail silently).
 */
export class FieldBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[field] centrepiece failed, showing the fallback:', error instanceof Error ? error.message : error);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
