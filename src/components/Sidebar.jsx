import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import '../assets/css/Sidebar.css';

const Sidebar = ({ closeSidebar }) => {
    const { user, logout } = useAuth(); 

    const isJuca = user?.tipo_usuario === 'Juca';
    const isMenuUser = ['Juca', 'Administrativo', 'Profesor'].includes(user?.tipo_usuario);

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-dark text-light h-100" style={{ width: '250px' }}>
            {/* Encabezado con botón de cerrar solo en móvil */}
            <div className="d-flex justify-content-between align-items-center mb-3 mb-md-0">
                <span className="fs-4">EcoParking</span>
                <button
                    type="button"
                    className="btn btn-outline-light btn-sm d-md-none"
                    onClick={closeSidebar}
                    aria-label="Cerrar menú"
                >
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>
            <hr />
            
            <div className="flex-grow-1 overflow-y-auto hide-scrollbar">
                <Nav variant="pills" className="flex-column mb-auto">

                    {/* --- PARTE MENÚ: SÓLO JUCA, ADMINISTRATIVO O PROFESOR --- */}
                    {isMenuUser && (
                        <>
                            <div className="mb-2 mt-2">
                                <span className="text-light text-uppercase small fw-bold px-3">Menú</span>
                            </div>
                            <Nav.Item>
                                <Link to="/home" onClick={closeSidebar} className="nav-link link-primary text-white">
                                    <i className="bi bi-house-door me-2"></i> Home
                                </Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Link to="/mis_citas" onClick={closeSidebar} className="nav-link link-warning text-white">
                                    <i className="bi bi-calendar-event me-2"></i> Mis Citas
                                </Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Link to="/codigo" onClick={closeSidebar} className="nav-link link-secondary text-white">
                                    <i className="bi bi-qr-code-scan me-2"></i> Código QR
                                </Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Link to="/autos" onClick={closeSidebar} className="nav-link link-secondary text-white">
                                    <i className="bi bi-car-front me-2"></i> Cajones disponibles
                                </Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Link to="/estado_cajones" onClick={closeSidebar} className="nav-link link-secondary text-white">
                                    <i className="bi bi-geo-alt me-2"></i> Estado de Cajones
                                </Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Link to="/estadisticas" onClick={closeSidebar} className="nav-link link-primary text-white">
                                    <i className="bi bi-bar-chart-line me-2"></i> Estadísticas
                                </Link>
                            </Nav.Item>
                        </>
                    )}

                    {/* --- PARTE ADMINISTRACIÓN: SÓLO ROL JUCA --- */}
                    {isJuca && (
                        <>
                            <hr />
                            <li className="nav-item mb-2 mt-2">
                                <span className="text-light text-uppercase small fw-bold px-3">Administración</span>
                            </li>
                            <Nav.Item>
                                <Link to="/crud_citas" onClick={closeSidebar} className="nav-link link-primary text-white">
                                    <i className="bi bi-journal-text me-2"></i> Gestión de Citas
                                </Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Link to="/crud_usuarios" onClick={closeSidebar} className="nav-link link-success text-white">
                                    <i className="bi bi-people me-2"></i> Gestión de Usuarios
                                </Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Link to="/crud_cajones" onClick={closeSidebar} className="nav-link link-secondary text-white">
                                    <i className="bi bi-car-front me-2"></i> Gestión de Cajones
                                </Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Link to="/reportes" onClick={closeSidebar} className="nav-link link-primary text-white">
                                    <i className="bi bi-file-earmark-bar-graph me-2"></i> Reportes
                                </Link>
                            </Nav.Item>
                        </>
                    )}
                </Nav>
            </div>

            <hr className="mt-auto" />
            <Nav.Item>
                <Link to="/" onClick={() => { closeSidebar(); logout(); }} className="nav-link link-danger text-light">
                    <i className="bi bi-box-arrow-right me-2"></i> Cerrar sesión
                </Link>
            </Nav.Item>
        </div>
    );
};

export default Sidebar;