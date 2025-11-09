import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axios.js';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); 
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); 

    const login = (userData, accessToken) => {
        setUser(userData);
        setToken(accessToken);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

    // Checar el refresh token al cargar la app
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                // Pedimos un nuevo access token usando la cookie refreshToken
                const res = await api.post('/usuarios/refresh');
                const newAccessToken = res.data.token;

                // --- 2. DECODIFICAR EL TOKEN ---
                // Leemos los datos (id, tipo_usuario) desde el nuevo token
                const decodedUser = jwtDecode(newAccessToken);

                // --- 3. GUARDAR TODO ---
                setToken(newAccessToken);
                setUser(decodedUser);
                setIsAuthenticated(true);

            } catch (error) {
                // No hay refresh token válido
                setIsAuthenticated(false);
                setUser(null); // Asegurarse de limpiar todo
                setToken(null);
            }
            setLoading(false);
        };
        checkLoginStatus();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            loading,
            login,
            logout
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};