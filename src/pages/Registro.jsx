import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoRegistro from "../assets/images/Logo_uteq.png";
import { api } from "../api/axios.js"; 

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

      // --- CAMBIOS AQUÍ ---
      // 1. Mensaje de éxito actualizado
      setSuccess("¡Registro exitoso! Ya puedes iniciar sesión.");
      
      // 2. Limpiamos el formulario
      setFormData({ 
        nombre: "", correo: "", contrasena: "", 
        codigo: "", telefono: "", division: "" 
      });

      // 3. Bloque setTimeout ELIMINADO
      // --- FIN DE CAMBIOS ---

    } catch (err) {
      if (err.response && err.response.data) {
          setError(err.response.data.message || "Error al registrarse.");
      } else {
          setError("Error de conexión. Intente más tarde.");
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh", padding: "1rem" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8 col-xl-7">
            <div className="card shadow-lg border-0 rounded-3">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <img src={logoRegistro} alt="Logo de ecoparking" className="mx-auto d-block mb-4 img-fluid" style={{ height: "50px", width: "auto" }} />
                  <h4 className="fw-bold text-dark mb-0">Crea tu cuenta</h4>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {error && <div className="alert alert-danger" role="alert">{error}</div>}
                  {success && <div className="alert alert-success" role="alert">{success}</div>}

                  <div className="mb-3">
                    <label className="form-label text-secondary small" htmlFor="nombre">Nombre Completo:</label>
                    <input type="text" className="form-control form-control-sm shadow-sm" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre(s) y Apellidos" required />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-secondary small" htmlFor="correo">Correo:</label>
                    <input type="email" className="form-control form-control-sm shadow-sm" id="correo" name="correo" value={formData.correo} onChange={handleChange} placeholder="Ingresa tu correo" required />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-secondary small" htmlFor="contrasena">Contraseña:</label>
                      <input type="password" className="form-control form-control-sm shadow-sm" id="contrasena" name="contrasena" value={formData.contrasena} onChange={handleChange} placeholder="Mínimo 6 caracteres" minLength="6" required 
                      pattern=".*[^A-Za-z0-9].*"
                      title="La contraseña debe tener al menos 6 caracteres y un carácter especial (ej. !@#$%)."/>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-secondary small" htmlFor="codigo">Código:</label>
                      <input type="text" className="form-control form-control-sm shadow-sm" id="codigo" name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej. ADM123" required />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-secondary small" htmlFor="telefono">Teléfono:</label>
                      <input type="tel" className="form-control form-control-sm shadow-sm" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Número de contacto" minLength="10" maxLength="10" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-secondary small" htmlFor="division">División:</label>
                      <input type="text" className="form-control form-control-sm shadow-sm" id="division" name="division" value={formData.division} onChange={handleChange} placeholder="Ingresa tu división" maxLength="60" required />
                    </div>
                  </div>
                  
                  <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary btn-sm fw-medium text-uppercase py-2">
                      Registrarse
                    </button>
                  </div>
                  
                  <div className="text-center pt-3">
                    <span>¿Ya tienes una cuenta?</span>
                    <Link to="/" className="text-primary text-decoration-underline ms-2">Inicia sesión aquí</Link>
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

export default Registro;