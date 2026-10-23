import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { axiosPrivate } from '../api/axios.js'; 
import { useAuth } from '../context/AuthContext'; 
import Swal from "sweetalert2"; // 🟢 Importación de SweetAlert2

export default function Codigo_qr() {
    const [searchParams] = useSearchParams();
    const [status] = useState(() => searchParams.get('status') || 'checking');
    const [reason] = useState(() => searchParams.get('reason') || '');
    const [invitados, setInvitados] = useState([]);
    
    const { token } = useAuth(); 
    
    useEffect(() => {
        const invParam = searchParams.get('invitados');
        if (invParam) {
            try {
                const parsed = JSON.parse(decodeURIComponent(invParam));
                setInvitados(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
                console.error("Error al parsear invitados", e);
            }
        }
    }, [searchParams]);

    const citaData = {
        motivo: searchParams.get('motivo') || '',
        fecha: searchParams.get('fecha') || '',
        fecha_fin: searchParams.get('fecha_fin') || '',
        horario: searchParams.get('horario') || '',
        cajon: searchParams.get('cajon') || ''
    };

    // 🟢 Función para registrar la ENTRADA
    const handleEntrada = async (idInvitado, numeroCajon) => {
        if (!idInvitado) {
            Swal.fire({
                icon: 'error',
                title: 'ID no detectado',
                text: 'Por favor vuelve a ESCANEAR el QR para refrescar los datos.',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Acceso denegado',
                text: 'Debes iniciar sesión como Guardia o Administrador para realizar esta acción.',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }

        try {
            await axiosPrivate.patch(`/invitados/${idInvitado}/entrada`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setInvitados(prev => prev.map(inv => {
                if (inv.id === idInvitado || (numeroCajon && inv.numero_cajon === numeroCajon)) {
                    return { ...inv, estado_visita: 'Dentro' };
                }
                return inv;
            }));

            // Alerta de éxito pequeña que se cierra sola
            Swal.fire({
                icon: 'success',
                title: '¡Entrada registrada!',
                showConfirmButton: false,
                timer: 1500
            });

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al registrar la entrada del invitado.',
                confirmButtonColor: '#0d6efd'
            });
        }
    };

    // 🟢 Función para registrar la SALIDA
    const handleSalida = async (idInvitado, numeroCajon) => {
        if (!idInvitado) {
            Swal.fire({
                icon: 'error',
                title: 'ID no detectado',
                text: 'Por favor vuelve a ESCANEAR el QR.',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Acceso denegado',
                text: 'Debes iniciar sesión como Guardia o Administrador para realizar esta acción.',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }

        // Reemplazo del window.confirm por Swal
        const confirmacion = await Swal.fire({
            title: '¿Registrar Salida?',
            text: "Se liberará el cajón asociado a este vehículo.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545', // Rojo para la salida
            cancelButtonColor: '#6c757d', // Gris para cancelar
            confirmButtonText: 'Sí, dar salida',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) return;

        try {
            await axiosPrivate.patch(`/invitados/${idInvitado}/salida`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setInvitados(prev => prev.map(inv => {
                if (inv.id === idInvitado || (numeroCajon && inv.numero_cajon === numeroCajon)) {
                    return { ...inv, estado_visita: 'Finalizado' };
                }
                return inv;
            }));

            // Alerta de éxito pequeña que se cierra sola
            Swal.fire({
                icon: 'success',
                title: '¡Salida registrada!',
                text: 'El cajón ha sido liberado.',
                showConfirmButton: false,
                timer: 1500
            });

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al registrar la salida del invitado.',
                confirmButtonColor: '#0d6efd'
            });
        }
    };

    const renderContent = () => {
        const getReasonMessage = (reasonCode) => {
            switch(reasonCode) {
                case 'no_encontrada': return 'El código QR no existe o es inválido.';
                case 'no_tiene_cita': return 'La cita asociada fue eliminada.';
                case 'cancelada': return 'La cita fue cancelada por un administrador.';
                case 'cita_finalizada': return 'Esta cita ya concluyó y todos los visitantes se han retirado.';
                case 'no_iniciada': return 'La cita aún no ha comenzado.';
                case 'expired': return 'La cita ya ha finalizado por límite de tiempo.';
                case 'server_error': return 'Error del servidor. Intente de nuevo.';
                default: return 'Acceso no autorizado o código inválido.';
            }
        };

        const configs = {
            valido: { color: 'success', icon: 'bi-check-circle-fill', title: 'ACCESO CONCEDIDO', desc: '¡Bienvenido!', btn: 'btn-success' },
            denegado: { color: 'danger', icon: 'bi-x-circle-fill', title: 'ACCESO DENEGADO', desc: getReasonMessage(reason), btn: 'btn-danger' },
            checking: { color: 'primary', icon: 'spinner-border', title: 'VALIDANDO...', desc: 'Verificando...', btn: 'btn-primary' }
        };

        const config = configs[status] || configs.denegado;

        return (
            <div className={`card border-0 shadow-lg text-center overflow-hidden animate__animated animate__fadeIn`}>
                <div className={`bg-${config.color} py-1`}></div>
                
                <div className="card-body p-4 p-md-5">
                    <div className="mb-1">
                        {status === 'checking' ? (
                            <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status"></div>
                        ) : (
                            <i className={`bi ${config.icon} display-1 text-${config.color}`}></i>
                        )}
                    </div>

                    <h1 className={`h3 fw-bold text-${config.color} mb-2`}>
                        {config.title}
                    </h1>
                    
                    <p className="text-muted fs-5 mb-4 px-3">
                        {config.desc}
                    </p>

                    {citaData.motivo && (
                        <div className="mt-4 p-3 bg-light rounded border border-secondary text-start">
                            <h6 className="text-uppercase text-secondary fw-bold small mb-2 border-bottom pb-1">Información de la Cita</h6>
                            <div className="mb-1">
                                <span className="fw-bold text-dark">Motivo: </span> 
                                <span className="text-muted">{citaData.motivo}</span>
                            </div>
                            <p className="mb-1"><strong>Fecha:</strong></p>
                            <p className="text-muted">{citaData.fecha} a {citaData.fecha_fin}</p>

                            <div className="mb-1">
                                <span className="fw-bold text-dark">Horario: </span> 
                                <span className="text-muted">{citaData.horario}</span>
                            </div>

                            {/* Invitados */}
                            <h6 className="text-uppercase text-secondary fw-bold small mb-2 border-bottom pb-1 mt-4">Invitados</h6>
                            {invitados.length > 0 && (
                                <div className="mt-2 border rounded p-2 bg-primary bg-opacity-10">
                                    <ul className="list-unstyled mt-1 mb-0">
                                        {invitados.map((inv, index) => (
                                            <li key={inv.id || index} className="small border-bottom py-3">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <span className="fw-bold text-dark d-block fs-6">{inv.nombre}</span>
                                                        <span className="text-muted d-block">{inv.empresa}</span>
                                                    </div>
                                                    <span className={`badge bg-${inv.tipo_acompanante === 'Conductor' ? 'dark' : 'secondary'}`}>
                                                        {inv.tipo_acompanante || 'Invitado'}
                                                    </span>
                                                </div>

                                                <div className="mb-2">
                                                    <span className="fw-bold">Matrícula: </span>
                                                    <span className="fw-bold text-primary">{inv.matricula || 'N/A'}</span>
                                                    <br />
                                                    <span className="fw-bold">Cajón: </span>
                                                    <span className="text-muted">{inv.numero_cajon || 'Sin asignar'}</span>
                                                </div>

                                                {/* BOTONES DE ACCIÓN PARA EL GUARDIA */}
                                                <div className="mt-3">
                                                    {(!inv.estado_visita || inv.estado_visita === 'Pendiente') && (
                                                        <button 
                                                            className="btn btn-sm btn-success w-100 fw-bold shadow-sm" 
                                                            onClick={() => handleEntrada(inv.id, inv.numero_cajon)}
                                                        >
                                                            <i className="bi bi-box-arrow-in-right me-2"></i>Registrar Entrada
                                                        </button>
                                                    )}
                                                    
                                                    {inv.estado_visita === 'Dentro' && (
                                                        <button 
                                                            className="btn btn-sm btn-danger w-100 fw-bold shadow-sm" 
                                                            onClick={() => handleSalida(inv.id, inv.numero_cajon)}
                                                        >
                                                            <i className="bi bi-box-arrow-right me-2"></i>
                                                            {inv.tipo_acompanante === 'Conductor' ? 'Registrar Salida y Liberar Cajón' : 'Registrar Salida'}
                                                        </button>
                                                    )}

                                                    {inv.estado_visita === 'Finalizado' && (
                                                        <span className="badge bg-secondary w-100 py-2 fs-6">
                                                            <i className="bi bi-check2-all me-2"></i>Visita Finalizada
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="card-footer bg-light border-0 py-3">
                    <small className="text-muted font-monospace">© EcoParking</small>
                </div>
            </div>
        );
    };

    return (
        <div 
            className="d-flex justify-content-center align-items-center bg-dark py-4" 
            style={{ 
                minHeight: "100vh",
                background: "linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)"
            }}
        >
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}