import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import '../assets/css/Sidebar.css';

const Sidebar = () => {
    const { logout } = useAuth(); 

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-dark text-light h-100" style={{ width: '250px' }}>
            <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-light text-decoration-none">
                <span className="fs-4">EcoParking</span>
            </div>
            <hr />
            
            <div className="flex-grow-1 overflow-y-auto hide-scrollbar">
                <div className="mb-2">
                    <span className="text-light text-uppercase small fw-bold px-3">Mi información</span>
                </div>
                
                <Nav variant="pills" className="flex-column mb-auto">

                    <Nav.Item>
                        <Link to="/mis_citas" className={`nav-link link-warning text-white`}>
                            <i className="bi bi-calendar-event me-2"></i>
                            Mis Citas
                        </Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Link to="/codigo" className={`nav-link link-secondary text-white`}>
                            <i className="bi bi-qr-code-scan me-2"></i>
                            Código QR
                        </Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Link to="/autos" className={`nav-link link-secondary text-white`}>
                            <i className="bi bi-car-front me-2"></i>
                            Cajones disponibles
                        </Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Link to="/estado_cajones" className={`nav-link link-secondary text-white`}>
                            <i className="bi bi-geo-alt me-2"></i>
                            Estado de Cajones
                        </Link>
                    </Nav.Item>

                    {/* --- Enlaces de Administrador --- */}
                    <>
                        <hr />
                        <li className="nav-item">
                            <span className="text-light text-uppercase small fw-bold px-3">Administración</span>
                        </li>
                        <Nav.Item>
                            <Link to="/crud_citas" className={`nav-link link-primary text-white`}>
                                <i className="bi bi-journal-text me-2"></i>
                                Gestión de Citas
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/crud_usuarios" className={`nav-link link-success text-white`}>
                                <i className="bi bi-people me-2"></i>
                                Gestión de Usuarios
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/crud_cajones" className={`nav-link link-secondary text-white`}>
                                <i className="bi bi-car-front me-2"></i>
                                Gestión de Cajones
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/estadisticas" className={`nav-link link-primary text-white`}>
                                <i className="bi bi-bar-chart-line me-2"></i>
                                Estadisticas
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/reportes" className={`nav-link link-primary text-white`}>
                                <i className="bi bi-file-earmark-bar-graph me-2"></i>
                                Reportes
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/terminos" className={`nav-link link-primary text-white`}>
                                <i className="bi bi-file-text me-2"></i>
                                Términos
                            </Link>
                        </Nav.Item>
                    </>
                </Nav>
            </div>

            <hr className="mt-auto" />
            <Nav.Item>
                <Link to="/" onClick={logout} className={`nav-link link-danger text-light`}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar sesión
                </Link>
            </Nav.Item>
        </div>
    );
};

export default Sidebar;