import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Initialize state as a class property for modern syntax. This resolves potential build issues where this.state might not be correctly inferred.
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleTryAgain = () => {
    // Navigate to the root to ensure a clean state, then reset the error boundary.
    // A full page navigation is a safe recovery mechanism.
    window.location.href = '/'; 
  }

  public render(): ReactNode {
    // FIX: Access state via this.state in class components.
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          color: '#b91c1c'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong.</h1>
          <p style={{ marginBottom: '1.5rem' }}>We're sorry for the inconvenience. An error occurred that prevented the application from rendering correctly.</p>
          <button
            onClick={this.handleTryAgain}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    // FIX: Access props via this.props in class components.
    return this.props.children;
  }
}

export default ErrorBoundary;
