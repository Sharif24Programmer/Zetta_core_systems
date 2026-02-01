import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './core/auth/AuthContext';
import { LocationProvider } from './core/context/LocationContext';
import AppRoutes from './routes/AppRoutes';
import './styles/index.css';

import { Toaster } from 'react-hot-toast';

function App() {
    console.log('App Component Rendering');
    return (
        <BrowserRouter>
            <AuthProvider>
                <LocationProvider>
                    <div className="min-h-screen bg-slate-50">
                        <Toaster position="top-right" />
                        <AppRoutes />
                    </div>
                </LocationProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
