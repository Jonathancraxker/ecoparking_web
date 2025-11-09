import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div 
      className="d-flex justify-content-center align-items-center text-center" 
      style={{ minHeight: "100vh" }}
    >
      <div className="container">
        <h1 className="display-1 fw-bold">404</h1>
        <h2 className="display-4">Página No Encontrada</h2>
        <p className="lead text-secondary">
          Lo sentimos, la página que estás buscando no existe.
        </p>
        <Link to="/profile" className="btn btn-primary mt-3">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

export default NotFound;