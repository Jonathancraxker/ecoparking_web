import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo_login from "../assets/images/Logo_uteq.png";
import { useAuth } from "../context/AuthContext"; 
import { api } from "../api/axios.js";
import "../assets/css/Login.css";

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

            navigate('/home'); 

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
        <div className="login-wrapper">
            <div className="login-box">
                <div className="row g-0 h-100">
                    
                    <div className="col-lg-6 d-flex flex-column justify-content-center form-panel">
                        <div className="text-center mb-4">
                            <img 
                                src={logo_login} 
                                alt="Logo UTEQ" 
                                className="mb-3 img-fluid" 
                                style={{ height: "70px", width: "auto" }} 
                            />
                            <h2 className="fw-bold text-dark fst-italic">Iniciar Sesión</h2>
                            <p className="text-muted small">Ingresa tus credenciales de EcoParking</p>
                        </div>
                        
                        {error && (
                            <div className="alert alert-danger text-center small py-2 rounded-3" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="d-flex flex-column">
                            <label htmlFor="correo" className="visually-hidden">Correo</label>
                            <input
                                id="correo" name="correo" type="email" autoComplete="email" required
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                className="form-control custom-input"
                                placeholder="edward@gmail.com"
                            />
                            
                            <label htmlFor="contrasena" className="visually-hidden">Contraseña</label>
                            <input
                                id="contrasena" name="contrasena" type="password" autoComplete="current-password" required
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                className="form-control custom-input"
                                placeholder="••••••••••••"
                            />

                            <label htmlFor="codigo" className="visually-hidden">Código</label>
                            <input
                                id="codigo" name="codigo" type="text" required
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                className="form-control custom-input" 
                                placeholder="Código de acceso (Ej. PRO123)"
                            />

                            {/* <div className="text-center mt-2 mb-4">
                                <a href="#" className="text-primary text-decoration-none small">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div> */}

                            <button type="submit" className="btn-solid-primary w-100 text-uppercase">
                                Iniciar Sesión
                            </button>

                            <div className="text-center mt-4 d-block d-lg-none">
                                <span className="text-muted small">¿No tienes una cuenta?</span>
                                <Link to="/registro" className="text-primary text-decoration-none fw-bold ms-1 small">
                                    Regístrate
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* --- PANEL DERECHO: BIENVENIDA Y REGISTRO --- */}
                    <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center side-panel">
                        <h1 className="fw-bold mb-4 fst-italic" style={{ fontSize: '3rem' }}>¡Hola!!!</h1>
                        <p className="mb-5 px-4" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                            Ingresa tus datos personales y<br/> 
                            comienza tu viaje con nosotros en<br/>
                            EcoParking.
                        </p>
                        <p className="mb-3 small opacity-75 text-uppercase">Crear tu cuenta</p>
                        <Link to="/registro" className="btn-outline-white text-uppercase">
                            Registrar
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;