import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo_ecoparking from "../assets/images/ecoparking.jpg";
import Logo_uteq from "../assets/images/Logo_uteq.png";

const Header = () => {
    const {logout} = useAuth();

  return (
    // navbar-dark y bg-dark ya están bien
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom sticky-top">
      <div className="container-fluid px-4">
        <Link to="/" className="navbar-brand">
          <img
            src={Logo_ecoparking}
            alt="Logo"
            height="40"
            className="d-inline-block align-text-top "
          />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">

          {/* Perfil (Derecha) */}
          <div className="ms-auto d-flex align-items-center">
            <div className="dropdown">
              <a
                href="#"
                // Aquí quitamos text-dark y ponemos text-light para que el icono de flecha del dropdown sea blanco
                className="d-flex align-items-center text-decoration-none dropdown-toggle text-light"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span className="me-3 d-none d-md-block fw-medium">
                  Usuario
                </span>
                <div className="avatar-container">
                    <img
                      src={Logo_uteq}
                      alt="Perfil"
                      className="rounded-circle border"
                      style={{ width: "45px", height: "45px", objectFit: "cover" }}
                    />
                </div>
              </a>

              {/* El menú desplegable (dropdown-menu) es blanco por defecto, por lo que los iconos negros se verán bien */}
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="userDropdown">
                <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person me-2"></i>Perfil</Link></li>
                <li><Link className="dropdown-item" to="/settings"><i className="bi bi-gear me-2"></i>Configuración</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button onClick={logout} className="dropdown-item text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
