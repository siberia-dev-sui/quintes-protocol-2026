'use client';

import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Global Error Boundary Component
 * 
 * Prevents the "White Screen of Death" when a React component throws an error.
 * Shows a user-friendly recovery UI instead of a blank page.
 * 
 * Usage: Wrap children in app/layout.tsx
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // TODO: Send to Sentry/Datadog in production
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught:', error, errorInfo);
        }
    }

    handleReload = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-black">
                    <div className="text-center p-8 max-w-md">
                        {/* Quintes Logo/Icon placeholder */}
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                            <span className="text-2xl font-bold text-black">Q</span>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-400 mb-6">
                            We encountered an unexpected error. Please try reloading the page.
                        </p>

                        <button
                            onClick={this.handleReload}
                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg font-medium hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-lg shadow-amber-500/25"
                        >
                            Reload Page
                        </button>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-8 text-left">
                                <summary className="text-gray-500 cursor-pointer hover:text-gray-400">
                                    Technical Details
                                </summary>
                                <pre className="mt-2 p-4 bg-gray-900 rounded-lg text-red-400 text-xs overflow-auto">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
