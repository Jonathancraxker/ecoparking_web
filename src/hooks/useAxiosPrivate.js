import { useEffect } from 'react';
import { api, axiosPrivate } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const useAxiosPrivate = () => {
    const { token, logout } = useAuth(); // Asumimos que el contexto también puede actualizar el token

    useEffect(() => {
        // --- Interceptor de Petición (Request) ---
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                if (token && !config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // --- Interceptor de Respuesta (Response) ---
        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        // 1. Pedir un nuevo Access Token al endpoint /refresh
                        const refreshRes = await api.post('/usuarios/refresh');
                        const newAccessToken = refreshRes.data.token;
                        
                        // 2. Idealmente, el AuthContext debería tener una función para
                        // actualizar el token en el estado global.
                        // Por ahora, actualizamos el header de la petición original.
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        
                        // 3. Reintentar la petición original
                        return axiosPrivate(originalRequest);
                        
                    } catch (refreshError) {
                        logout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        // Limpieza
        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };

    }, [token, logout]);

    return axiosPrivate; // Devuelve la instancia de Axios con la "magia"
};

export default useAxiosPrivate;