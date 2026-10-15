import { Component, type ReactNode } from 'react';

interface MapErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface MapErrorBoundaryState {
  failed: boolean;
}

/** Prinde erorile SDK-ului nativ de hărți și arată fallback-ul în loc să crape ecranul. */
export class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { failed: true };
  }

  render(): ReactNode {
    if (this.state.failed) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
