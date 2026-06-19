import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Here you can send error logs to an error reporting service
        // e.g., Sentry, LogRocket, etc.
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h1>
                            <p className="text-slate-600">
                                We're sorry for the inconvenience. An unexpected error has occurred.
                            </p>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-sm font-semibold text-slate-700 mb-2">Error Details:</p>
                                <p className="text-xs text-red-600 font-mono mb-2">{this.state.error.toString()}</p>
                                {this.state.errorInfo && (
                                    <details className="text-xs text-slate-600">
                                        <summary className="cursor-pointer font-medium mb-1">Stack Trace</summary>
                                        <pre className="mt-2 p-2 bg-white rounded border border-slate-200 overflow-auto text-xs">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg"
                            >
                                Go to Dashboard
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800 text-center">
                                If this problem persists, please try clearing your browser cache or contact support.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
