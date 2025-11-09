import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // Asegúrate que la extensión sea .jsx

const Admin_Route = () => {
  // 1. Usar los nombres correctos del AuthContext
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Verificando permisos...</div>;
  }

  // 2. Si no está logueado, fuera
  if (!loading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3. Si está logueado pero no es Admin (o Juca, si lo necesitas)
  //    Verificamos que 'user' exista antes de leerlo
  if (user && user.tipo_usuario !== "Juca") {
    // Si no es admin, lo mandamos a su perfil, no al login
    return <Navigate to="/profile" replace />;
  }

  // 4. Si es Admin, le mostramos las rutas anidadas
  return <Outlet />;
};

export default Admin_Route;