import { useState } from "react";
import { Link } from "react-router-dom";
import logoRegistro from "../assets/images/Logo_uteq.png";
import { api } from "../api/axios.js"; 
import "../assets/css/Login.css";

function Registro() {
  const [formData, setFormData] = useState({ 
    nombre: "", 
    correo: "",
    contrasena: "", 
    codigo: "", 
    telefono: "",
    division: "",
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    setSuccess(null);

    if (formData.division === "") {
        setError("Por favor, selecciona una división.");
        return;
    }

    try {
      const response = await api.post('/usuarios/registro', formData);

      setSuccess("¡Registro exitoso! Ya puedes iniciar sesión.");
      
      setFormData({ 
        nombre: "", correo: "", contrasena: "", 
        codigo: "", telefono: "", division: "" 
      });

    } catch (err) {
      if (err.response && err.response.data) {
          setError(err.response.data.message || "Error al registrarse.");
      } else {
          setError("Error de conexión. Intente más tarde.");
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="row g-0 h-100">
          <div className="col-lg-5 d-none d-lg-flex flex-column justify-content-center align-items-center side-panel">
            <h1 className="fw-bold mb-4 fst-italic text-center" style={{ fontSize: '2.5rem' }}>¡Bienvenido!</h1>
            <p className="mb-5 px-4 text-center" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              ¿Ya eres parte de nuestra<br/> 
              comunidad? Inicia sesión y<br/>
              gestiona tu estacionamiento.
            </p>
            <p className="mb-3 small opacity-75 text-uppercase">Acceder a mi cuenta</p>
            <Link to="/" className="btn-outline-white text-uppercase">
              Iniciar Sesión
            </Link>
          </div>

          <div className="col-lg-7 d-flex flex-column justify-content-center form-panel">
            <div className="text-center mb-4">
              <img 
                src={logoRegistro} 
                alt="Logo UTEQ" 
                className="mb-3 img-fluid" 
                style={{ height: "60px", width: "auto" }} 
              />
              <h2 className="fw-bold text-dark fst-italic">Crea tu cuenta</h2>
              <p className="text-muted small">Completa tus datos para unirte a EcoParking</p>
            </div>

            {error && (
              <div className="alert alert-danger text-center small py-2 rounded-3" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success text-center small py-2 rounded-3" role="alert">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column">
              
              <label htmlFor="nombre" className="visually-hidden">Nombre Completo</label>
              <input 
                type="text" id="nombre" name="nombre" required 
                value={formData.nombre} onChange={handleChange} 
                className="form-control custom-input" 
                placeholder="Nombre(s) y Apellidos" 
              />

              <label htmlFor="correo" className="visually-hidden">Correo Institucional</label>
              <input 
                type="email" id="correo" name="correo" required 
                value={formData.correo} onChange={handleChange} 
                className="form-control custom-input" 
                placeholder="Correo institucional" 
              />

              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="contrasena" className="visually-hidden">Contraseña</label>
                  <input 
                    type="password" id="contrasena" name="contrasena" required minLength="6"
                    pattern=".*[^A-Za-z0-9].*" title="La contraseña debe tener al menos 6 caracteres y un carácter especial (ej. !@#$%)."
                    value={formData.contrasena} onChange={handleChange} 
                    className="form-control custom-input" 
                    placeholder="Contraseña (Mín. 6 y especial)" 
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="codigo" className="visually-hidden">Código</label>
                  <input 
                    type="text" id="codigo" name="codigo" required 
                    value={formData.codigo} onChange={handleChange} 
                    className="form-control custom-input" 
                    placeholder="Código (Ej. PRO162)" 
                    minLength="6" maxLength="6"
                  />
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="telefono" className="visually-hidden">Teléfono</label>
                  <input 
                    type="tel" id="telefono" name="telefono" required minLength="10" maxLength="10"
                    value={formData.telefono} onChange={handleChange} 
                    className="form-control custom-input mb-0" 
                    placeholder="Teléfono a 10 dígitos" 
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="division" className="visually-hidden">División</label>
                  <input 
                    type="text" id="division" name="division" required maxLength="60"
                    value={formData.division} onChange={handleChange} 
                    className="form-control custom-input mb-0" 
                    placeholder="División (Ej. DSM)" 
                  />
                </div>
              </div>

              <div className="d-grid mt-4 pt-2">
                <button type="submit" className="btn-solid-primary text-uppercase">
                  Registrarse
                </button>
              </div>

              <div className="text-center mt-4 d-block d-lg-none">
                <span className="text-muted small">¿Ya tienes una cuenta?</span>
                <Link to="/" className="text-primary text-decoration-none fw-bold ms-1 small">
                  Inicia Sesión
                </Link>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Registro;