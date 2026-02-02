import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingFallback from './components/LoadingFallback'

console.log('Starting App Render...');
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
                <App />
            </Suspense>
        </ErrorBoundary>
    </React.StrictMode>,
)
