import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Asumiendo que tienes un contexto de autenticación
import Logo_user from "../assets/images/Logo_uteq.png";

const Sidebar = () => {
    const { logout } = useAuth(); 
    const { user } = useAuth(); // Obtenemos el usuario para verificar el rol (opcional)

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-dark text-light" style={{ width: '250px', minHeight: '100vh' }}>
            <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-light text-decoration-none">
                <span className="fs-4">EcoParking</span>
            </div>
            <hr />
            <div>
                <span className="text-light text-uppercase small fw-bold px-3">Mi información</span>
            </div>
            <Nav variant="pills" className="flex-column mb-auto">
                {/* --- Enlaces Generales --- */}
                <Nav.Item>
                    <Link to="/profile" className={`nav-link link-primary text-white`}>
                        <i className="bi bi-person-circle me-2"></i>
                        Perfil
                    </Link>
                </Nav.Item>
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

                {/* --- Enlaces de Administrador (Solo si es Juca) --- */}
                {/* Puedes descomentar esto cuando quieras restringir visualmente */}
                {/* {user?.tipo_usuario === 'Juca' && ( */}
                    <>
                    <hr />
                        <li className="nav-item mt-">
                            <span className=" text-light text-uppercase small fw-bold px-3">Administración</span>
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
                            <Link to="/crud_autos" className={`nav-link link-secondary text-white`}>
                                <i className="bi bi-car-front me-2"></i>
                                Gestión de Automoviles
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/reportes" className={`nav-link link-primary text-white`}>
                                <i className="bi bi-bar-chart-line me-2"></i>
                                Reportes
                            </Link>
                        </Nav.Item>
                        <hr />
                        <Nav.Item>
                            <Link to="/reportes" onClick={logout} className={`nav-link link-danger text-light`}>
                                <i className="bi bi-box-arrow-right me-2"></i>
                                Cerrar sesión
                            </Link>
                        </Nav.Item>
                    </>
                {/* )} */}
            </Nav>
        </div>
    );
};

export default Sidebar;