import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  pathname: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches failed lazy-route imports / render crashes so /ai and /3d never
 * leave the visitor on a blank ambient background with only a console error.
 */
class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[route ${this.props.pathname}]`, error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.pathname !== this.props.pathname && this.state.error) {
      this.setState({ error: null });
    }
  }

  private retry = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const isChunk =
      /Failed to fetch dynamically imported module|Loading chunk|ChunkLoadError/i.test(
        this.state.error.message
      );

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">
          HARI.AI · recovery
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
          {isChunk ? 'This page needs a fresh load' : 'Something broke on this route'}
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-400">
          {isChunk
            ? 'A newer deploy replaced this page’s script. Reload once to pick up the latest build.'
            : 'The experience hit an unexpected error. Reloading usually clears it.'}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.retry}
            className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-white"
          >
            Reload page
          </button>
          <Link
            to="/"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to portfolio
          </Link>
        </div>
      </div>
    );
  }
}

export default RouteErrorBoundary;
