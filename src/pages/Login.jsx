import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo_login from "../assets/images/Logo_uteq.png";
import { useAuth } from "../context/AuthContext"; 
import { api } from "../api/axios.js";

function Login() {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [codigo, setCodigo] = useState("");
    const [error, setError] = useState(null); 
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleSubmit = async (event) => { 
        event.preventDefault();
        setError(null); 

        try {
            const response = await api.post('/usuarios/login', {
                correo,
                contrasena,
                codigo
            });

            const { user, token } = response.data;
            
            login(user, token);

            navigate('/profile'); // Redirigir al perfil

        } catch (err) {
            if (err.response && err.response.data) {
                const errorMessage = Array.isArray(err.response.data) 
                    ? err.response.data[0] 
                    : err.response.data.message;
                setError(errorMessage);
            } else {
                setError("Error de conexión. Intente más tarde.");
            }
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh", padding: "1rem" }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-lg border-0 rounded-3">
                            <div className="card-body p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <img src={logo_login} alt="Logo de Ecoparking" className="mx-auto d-block mb-4 img-fluid" style={{ height: "50px", width: "auto" }} />
                                    <h3 className="fw-bold text-dark">Iniciar Sesión</h3>
                                </div>
                                
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="correo" className="form-label text-secondary">Correo:</label>
                                        <input
                                            id="correo" name="correo" type="email" autoComplete="email" required
                                            value={correo}
                                            onChange={(e) => setCorreo(e.target.value)}
                                            className="form-control form-control shadow-sm"
                                            placeholder="correo@gmail.com"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="contrasena" className="form-label text-secondary">Contraseña:</label>
                                        <input
                                            id="contrasena" name="contrasena" type="password" autoComplete="current-password" required
                                            value={contrasena}
                                            onChange={(e) => setContrasena(e.target.value)}
                                            className="form-control form-control shadow-sm"
                                            placeholder="Ingresa tu contraseña"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="codigo" className="form-label text-secondary">Código:</label>
                                        <input
                                            id="codigo" name="codigo" type="text" required
                                            value={codigo}
                                            onChange={(e) => setCodigo(e.target.value)}
                                            className="form-control form-control shadow-sm" placeholder="Ej. ADM123"/>
                                    </div>

                                    <div className="d-grid mt-4">
                                        <button type="submit" className="btn btn-primary btn fw-medium text-uppercase py-2">
                                            Ingresar
                                        </button>
                                    </div>
                                    <div className="text-center pt-3">
                                        <span>¿No tienes una cuenta?</span>
                                        <Link to="/registro" className="text-primary text-decoration-underline ms-2">Registrate</Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;