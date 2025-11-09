import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>; // O un spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />; // Redirige al login
    }

    return <Outlet />; // Muestra el componente hijo (ej. Profile)
};

export default ProtectedRoute;