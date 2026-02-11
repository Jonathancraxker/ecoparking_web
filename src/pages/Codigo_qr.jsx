import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Codigo_qr() {
    const [searchParams] = useSearchParams();
    const [status] = useState(() => searchParams.get('status') || 'checking');
    const [reason] = useState(() => searchParams.get('reason') || '');

    const renderContent = () => {
        const getReasonMessage = (reasonCode) => {
            switch(reasonCode) {
                case 'no_encontrada': return 'El código QR no existe o es inválido.';
                case 'no_tiene_cita': return 'La cita asociada fue eliminada.';
                case 'cancelada': return 'La cita fue cancelada por un administrador.';
                case 'not_yet': return 'La cita aún no ha comenzado.';
                case 'expired': return 'La cita ya ha finalizado.';
                case 'server_error': return 'Error del servidor. Intente de nuevo.';
                default: return 'Acceso no autorizado o código inválido.';
            }
        };

        const configs = {
            valido: {
                color: 'success',
                icon: 'bi-check-circle-fill',
                title: 'ACCESO CONCEDIDO',
                desc: '¡Bienvenido a EcoParking!',
                btn: 'btn-success'
            },
            denegado: {
                color: 'danger',
                icon: 'bi-x-circle-fill',
                title: 'ACCESO DENEGADO',
                desc: getReasonMessage(reason),
                btn: 'btn-danger'
            },
            checking: {
                color: 'primary',
                icon: 'spinner-border',
                title: 'VALIDANDO...',
                desc: 'Verificando credenciales en el sistema.',
                btn: 'btn-primary'
            }
        };

        const config = configs[status] || configs.denegado;

        return (
            <div className={`card border-0 shadow-lg text-center overflow-hidden animate__animated animate__fadeIn`}>
                {/* Franja de color superior */}
                <div className={`bg-${config.color} py-2`}></div>
                
                <div className="card-body p-5">
                    <div className="mb-4">
                        {status === 'checking' ? (
                            <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status"></div>
                        ) : (
                            <i className={`bi ${config.icon} display-1 text-${config.color}`}></i>
                        )}
                    </div>

                    <h1 className={`h2 fw-bold text-${config.color} mb-3`}>
                        {config.title}
                    </h1>
                    
                    <p className="text-muted fs-5 mb-4 px-3">
                        {config.desc}
                    </p>
                </div>

                {/* Pie de página decorativo */}
                <div className="card-footer bg-light border-0 py-3">
                    <small className="text-muted font-monospace">© EcoParking</small>
                </div>
            </div>
        );
    };

    return (
        <div 
            className="d-flex justify-content-center align-items-center bg-dark" 
            style={{ 
                minHeight: "100vh",
                background: "linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)"
            }}
        >
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}