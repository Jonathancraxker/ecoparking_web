import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Codigo_qr() {
    const [searchParams] = useSearchParams();
    // Si no hay 'status' en la URL, se pone en 'checking'
    const [status, setStatus] = useState(() => {
        return searchParams.get('status') || 'checking';
    });

    // (Opcional) Guardamos la razón de la falla
    const [reason, setReason] = useState(() => {
        return searchParams.get('reason') || '';
    });

    const renderContent = () => {
        //Función para mostrar las razones de error
        const getReasonMessage = (reasonCode) => {
            switch(reasonCode) {
                case 'no_encontrada': return 'El código QR no existe o es inválido.';
                case 'no_tiene_cita': return 'La cita asociada fue eliminada.';
                // case 'pendiente': return 'La cita esta en proceso'; //Agregar solo si se agrega status pendiente
                case 'cancelada': return 'La cita fue cancelada';
                case 'not_yet': return 'La cita aún no ha comenzado.';
                case 'expired': return 'La cita ya ha finalizado.';
                case 'server_error': return 'Error del servidor. Intente de nuevo.';
                default: return 'Acceso no autorizado o código inválido.';
            }
        }

        switch (status) {
            case 'valido':
                return (
                    <div className="alert alert-success p-5 text-center shadow-sm" role="alert">
                        <h1 className="display-4 fw-bold mb-3">✅ CÓDIGO VÁLIDO</h1>
                        <p className="fs-5">Acceso concedido. ¡Bienvenido!</p>
                    </div>
                );
            case 'denegado':
                return (
                    <div className="alert alert-danger p-5 text-center shadow-sm" role="alert">
                        <h1 className="display-4 fw-bold mb-3">❌ CÓDIGO DENEGADO</h1>
                        {/* Mostramos el mensaje de error específico */}
                        <p className="fs-5">{getReasonMessage(reason)}</p>
                    </div>
                );
            case 'checking':
            default:
                return (
                    <div className="alert alert-info p-5 text-center shadow-sm" role="alert">
                        <h1 className="display-4 fw-bold mb-3">⏳ VALIDANDO CÓDIGO...</h1>
                        <p className="fs-5">Redirigiendo, por favor espere...</p>
                        {/* <Link to="/profile" className="btn btn-primary mt-3 ms-2">
                            Perfil de usuario
                        </Link> */}
                    </div>
                );
        }
    };

    return (
        <div 
            className="d-flex justify-content-center align-items-center bg-light" 
            style={{ minHeight: "100vh" }}
        >
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-xl-6">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}