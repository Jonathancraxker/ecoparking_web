import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Correcto si es .jsx
import useAxiosPrivate from '../hooks/useAxiosPrivate.js'; // Correcto si es .js
import { Link } from 'react-router-dom';

function Profile() {
    const { logout } = useAuth(); 
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        // 1. Nombre de función simplificado
        const getProfile = async () => {
            try {
                // 2. Hacemos UNA SOLA petición para el perfil
                const response = await axiosPrivate.get('/usuarios/perfil', {
                    signal: controller.signal
                });
                
                if (isMounted) {
                    setProfileData(response.data);
                    setLoading(false);
                }
            } catch (err) {
                 if (err.name !== 'CanceledError') {
                    console.error("Error al obtener perfil:", err);
                    setError("No se pudieron cargar los datos del perfil.");
                    setLoading(false);
                }
            }
        };

        getProfile(); // 3. Llamamos a la función simplificada

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [axiosPrivate]);

    if (loading) {
        return <div className="container p-4">Cargando perfil...</div>;
    }

    return (
        <div className="container p-4">
            <h2>Perfil de Usuario</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}

            {profileData ? (
                <ul className="list-group">
                    <li className="list-group-item"><strong>Nombre:</strong> {profileData.nombre}</li>
                    <li className="list-group-item"><strong>Correo:</strong> {profileData.correo}</li>
                    <li className="list-group-item"><strong>Tipo:</strong> {profileData.tipo_usuario}</li>
                    <li className="list-group-item"><strong>Código:</strong> {profileData.codigo}</li>
                </ul>
            ) : (
                !loading && !error && <p>No se pudieron cargar los datos del perfil.</p>
            )}
            
            <div className="mt-4">
                <button onClick={logout} className="btn btn-danger">
                    Cerrar Sesión
                </button>
                
                <Link to="/codigo" className="btn btn-primary ms-2">
                    Validador (Vigilante)
                </Link>
                
                <Link to="/crud_usuarios" className="btn btn-success ms-2">
                    Gestionar Usuarios
                </Link>
                
                <Link to="/crud_citas" className="btn btn-success ms-2">
                    Gestionar Citas (Juca)
                </Link>

                <Link to="/mis_citas" className="btn btn-warning ms-2">
                    Gestionar Mis Citas
                </Link>
            </div>
        </div>
    );
}

export default Profile;