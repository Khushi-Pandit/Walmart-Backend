import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full bg-red-50 rounded-xl flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-red-100 rounded-full p-4 mb-4 inline-block">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
            <p className="text-red-700 text-sm mb-4">
              An error occurred while rendering the map component.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}