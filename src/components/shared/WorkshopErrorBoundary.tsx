import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Desk name for message */
  desk?: string;
}

interface State {
  error: Error | null;
}

/**
 * Keeps the shell visible if a desk island throws (deep-link / math edge cases).
 */
export class WorkshopErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[WorkshopErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="workshop" role="alert">
          <header className="workshop__head">
            <h1>{this.props.desk ?? 'Desk'} · recovery</h1>
            <p className="workshop__lede">
              Something broke while rendering this room (often a bad deep link or
              an unexpected matrix shape). The rest of the site still works.
            </p>
          </header>
          <div className="panel">
            <p className="panel__meta mono">{this.state.error.message}</p>
            <div className="btn-row" style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                className="tab-btn is-on"
                onClick={() => this.setState({ error: null })}
              >
                Try again
              </button>
              <a className="tab-btn" href="/">
                Home
              </a>
              <a className="tab-btn" href="/map">
                Map
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
