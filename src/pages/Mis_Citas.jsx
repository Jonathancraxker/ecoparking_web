import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAxiosPrivate from '../hooks/useAxiosPrivate.js'; 
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import { QRCodeCanvas } from 'qrcode.react'; 

// Estado inicial para el formulario de Cita (Crear/Editar)
const initialCitaForm = {
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: "",
    motivo: "",
    estado_cita: "Confirmada",
    numero_invitados: 0,
    invitados: []
};

// Estado inicial para el formulario de Invitado
const initialInvitadoForm = {
    nombre: "",
    correo: "",
    empresa: "",
    tipo_visitante: "",
    id_cita: null
};

function Mis_Citas() {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosPrivate = useAxiosPrivate();
    
    // --- Estados para los Modales ---
    const [showCitaModal, setShowCitaModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showInvitadoModal, setShowInvitadoModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false); 

    // --- Estados para los datos seleccionados ---
    const [currentCita, setCurrentCita] = useState(null); 
    const [formDataCita, setFormDataCita] = useState(initialCitaForm);
    const [invitadosList, setInvitadosList] = useState([]); 
    const [formDataInvitado, setFormDataInvitado] = useState(initialInvitadoForm);
    const [selectedQrUrl, setSelectedQrUrl] = useState(''); 

    // --- NUEVO: Estado para saber qué invitado estamos editando ---
    const [currentInvitado, setCurrentInvitado] = useState(null);

    // --- Cargar SÓLO MIS citas ---
    const fetchMisCitas = async () => {
        setLoading(true);
        try {
            const response = await axiosPrivate.get('/citas/mis-citas'); 
            setCitas(response.data);
            setError(null);
        } catch (err) {
            console.error("Error al obtener mis citas:", err);
            setError("Error al cargar mis citas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMisCitas();
    }, [axiosPrivate]);


    // --- MANEJO DE MODAL DE CITA (CREAR/EDITAR) ---
    const handleShowCitaModal = (cita = null) => {
        setCurrentCita(cita); 
        if (cita) {
            setFormDataCita({
                fecha_inicio: cita.fecha_inicio || "",
                fecha_fin: cita.fecha_fin || "",
                hora_inicio: cita.hora_inicio || "",
                hora_fin: cita.hora_fin || "",
                motivo: cita.motivo || "",
                estado_cita: cita.estado_cita || "Confirmada",
                numero_invitados: cita.numero_invitados || 0
            });
        } else {
            setFormDataCita(initialCitaForm);
        }
        setShowCitaModal(true);
    };

    const handleCitaFormChange = (e) => {
        setFormDataCita({ ...formDataCita, [e.target.name]: e.target.value });
    };

    const handleCitaSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCita) {
                const { invitados, ...dataToUpdate } = formDataCita;
                await axiosPrivate.patch(`/citas/${currentCita.id}`, dataToUpdate);
                Swal.fire("¡Éxito!", "Cita actualizada.", "success");
            } else {
                await axiosPrivate.post(`/citas`, formDataCita);
                Swal.fire("¡Éxito!", "Cita registrada.", "success");
            }
            setShowCitaModal(false);
            fetchMisCitas(); 
        } catch (err) {
            Swal.fire("Error", `Hubo un error al guardar la cita.`, "error");
        }
    };

    // --- MANEJO DE MODAL DE BORRADO DE CITA ---
    const handleShowDeleteModal = (cita) => {
        setCurrentCita(cita);
        setShowDeleteModal(true);
    };

    const handleDeleteCita = async () => {
         try {
            await axiosPrivate.delete(`/citas/${currentCita.id}`);
            Swal.fire("¡Eliminada!", "La cita ha sido eliminada.", "success");
            setShowDeleteModal(false);
            fetchMisCitas(); 
        } catch (err) {
            Swal.fire("Error", `Hubo un error al eliminar la cita.`, "error");
        }
    };

    // --- MANEJO DE MODAL DE INVITADOS ---
    const handleShowInvitadoModal = async (cita) => {
        setCurrentCita(cita);
        setShowInvitadoModal(true);
        // Reseteamos form y modo edición
        setFormDataInvitado({ ...initialInvitadoForm, id_cita: cita.id }); 
        setCurrentInvitado(null);
        await fetchInvitados(cita.id); 
    };
    
    const fetchInvitados = async (idCita) => {
         try {
            const res = await axiosPrivate.get(`/citas/${idCita}/invitados`);
            setInvitadosList(res.data);
        } catch (err) {
            setError("No se pudieron cargar los invitados.");
        }
    };
    
    const handleInvitadoFormChange = (e) => {
        setFormDataInvitado({ ...formDataInvitado, [e.target.name]: e.target.value });
    };

    // --- NUEVO: Preparar formulario para editar invitado ---
    const handleEditInvitado = (invitado) => {
        setCurrentInvitado(invitado); 
        setFormDataInvitado({
            nombre: invitado.nombre,
            correo: invitado.correo,
            empresa: invitado.empresa || "",
            tipo_visitante: invitado.tipo_visitante || "",
            id_cita: currentCita.id
        });
    };

    // --- NUEVO: Cancelar edición ---
    const handleCancelEditInvitado = () => {
        setCurrentInvitado(null);
        setFormDataInvitado({ ...initialInvitadoForm, id_cita: currentCita.id });
    };

    const handleInvitadoSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentInvitado) {
                // --- MODO EDICIÓN (PATCH) ---
                await axiosPrivate.patch(`/invitados/${currentInvitado.id}`, formDataInvitado);
                Swal.fire("¡Éxito!", "Invitado actualizado.", "success");
            } else {
                // --- MODO CREACIÓN (POST) ---
                await axiosPrivate.post('/invitados', formDataInvitado);
                Swal.fire("¡Éxito!", "Invitado agregado.", "success");
            }
            
            // Resetear
            setFormDataInvitado({ ...initialInvitadoForm, id_cita: currentCita.id });
            setCurrentInvitado(null);
            fetchInvitados(currentCita.id); 
            fetchMisCitas(); 
        } catch (err) {
            Swal.fire("Error", `Hubo un error al guardar el invitado.`, "error");
        }
    };

    const handleDeleteInvitado = async (invitadoId) => {
        // --- CAMBIO AQUÍ: Usamos Swal en lugar de window.confirm ---
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará este invitado permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        // Si el usuario presiona "Cancelar", detenemos la función
        if (!result.isConfirmed) return;

        try {
            await axiosPrivate.delete(`/invitados/${invitadoId}`);
            
            // Mensaje de éxito (Toast pequeño en la esquina)
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            Toast.fire({
                icon: 'success',
                title: 'Invitado eliminado correctamente'
            });

            // Si estábamos editando el invitado que borramos, cancelar edición
            if (currentInvitado && currentInvitado.id === invitadoId) {
                handleCancelEditInvitado();
            }
            
            // Recargar datos
            fetchInvitados(currentCita.id); 
            fetchMisCitas(); 

        } catch (err) {
            Swal.fire("Error", `No se pudo eliminar al invitado.`, "error");
        }
    };
    
    const handleShowQrModal = (cita) => {
        if (cita.url_validacion) {
            setSelectedQrUrl(cita.url_validacion);
            setShowQrModal(true);
        } else {
            Swal.fire("Error", "Esta cita no tiene un código QR asociado (url_validacion no encontrada).", "error");
        }
    };

    if (loading) return <div className="container p-4">Cargando mis citas...</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Mis Citas (Usuario loggeado)</h2>
                <Button variant="primary" onClick={() => handleShowCitaModal(null)} className="d-flex align-items-center gap-2">
                    <i className="bi bi-plus-circle"></i>
                    Registrar Cita
                </Button> 
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            <div className="table-responsive">
                <table className="table table-striped table-hover shadow-sm">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-center">ID</th>
                            <th>Motivo</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th className="text-center">Invitados</th>
                            <th className="text-center">Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas.map((cita) => (
                            <tr key={cita.id}>
                                <th className="text-center">{cita.id}</th>
                                <td>{cita.motivo}</td>
                                <td>{cita.fecha_inicio} al {cita.fecha_fin}</td>
                                <td>{cita.hora_inicio} a {cita.hora_fin}</td>
                                <td className="text-center">{cita.numero_invitados}</td>
                                <td className="text-center">
                                    <span className={`badge ${
                                        cita.estado_cita === 'Confirmada' ? 'bg-success' :
                                        cita.estado_cita === 'Pendiente' ? 'bg-warning text-dark' :
                                        'bg-danger'
                                    }`}>
                                        {cita.estado_cita}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <button 
                                        onClick={() => handleShowQrModal(cita)} 
                                        className="btn btn-secondary btn-sm me-2 align-items-center gap-1" 
                                        title="Ver Código QR"
                                        disabled={!cita.url_validacion}
                                    >
                                        <i className="bi bi-qr-code m-1"></i>
                                        QR
                                    </button>
                                    <button onClick={() => handleShowCitaModal(cita)} className="btn btn-warning btn-sm me-2" title="Editar Cita">
                                        <i className="bi bi-pencil-fill"></i> Editar
                                    </button>
                                    <button onClick={() => handleShowInvitadoModal(cita)} className="btn btn-info btn-sm me-2" title="Gestionar Invitados">
                                        <i className="bi bi-people-fill"></i> Invitados
                                    </button>
                                    <button onClick={() => handleShowDeleteModal(cita)} className="btn btn-danger btn-sm align-items-center gap-1" title="Eliminar Cita">
                                        <i className="bi bi-trash-fill"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <Link to="/profile" className="btn btn-secondary mt-3">
                Volver al Perfil
            </Link>

            {/* --- MODAL PARA CREAR/EDITAR CITA --- */}
            <Modal show={showCitaModal} onHide={() => setShowCitaModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentCita ? `Editar Cita (ID: ${currentCita.id})` : "Registrar Nueva Cita"}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCitaSubmit}>
                    {/* ... (Contenido del formulario de cita idéntico) ... */}
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Motivo</Form.Label>
                            <Form.Control type="text" name="motivo" value={formDataCita.motivo} onChange={handleCitaFormChange} required />
                        </Form.Group>
                        <div className="row">
                            <div className="col-md-6"><Form.Group><Form.Label>Fecha Inicio</Form.Label><Form.Control type="date" name="fecha_inicio" value={formDataCita.fecha_inicio} onChange={handleCitaFormChange} /></Form.Group></div>
                            <div className="col-md-6"><Form.Group><Form.Label>Fecha Fin</Form.Label><Form.Control type="date" name="fecha_fin" value={formDataCita.fecha_fin} onChange={handleCitaFormChange} /></Form.Group></div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-6"><Form.Group><Form.Label>Hora Inicio</Form.Label><Form.Control type="time" name="hora_inicio" value={formDataCita.hora_inicio} onChange={handleCitaFormChange} /></Form.Group></div>
                            <div className="col-md-6"><Form.Group><Form.Label>Hora Fin</Form.Label><Form.Control type="time" name="hora_fin" value={formDataCita.hora_fin} onChange={handleCitaFormChange} /></Form.Group></div>
                        </div>
                        {/* El usuario normal puede ver el estado pero no siempre debería poder cambiarlo a 'Confirmada' el mismo, depende de tu lógica de negocio. Aquí lo dejo editable. */}
                         <Form.Group className="mb-3 mt-3">
                            <Form.Label>Estado</Form.Label>
                            <Form.Select name="estado_cita" value={formDataCita.estado_cita} onChange={handleCitaFormChange}>
                                <option value="Confirmada">Confirmada</option>
                                {/* <option value="Confirmada">Confirmada</option> (Tal vez ocultar para usuario normal?) */}
                                <option value="Cancelada">Cancelada</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCitaModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">
                            {currentCita ? "Actualizar Cita" : "Crear Cita"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* --- MODAL DE CONFIRMACIÓN DE BORRADO (CITA) --- */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás seguro que deseas eliminar la cita: <strong>{currentCita?.motivo}</strong>?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleDeleteCita}>Eliminar Cita</Button>
                </Modal.Footer>
            </Modal>

            {/* --- MODAL PARA GESTIONAR INVITADOS (CON EDICIÓN) --- */}
            <Modal show={showInvitadoModal} onHide={() => setShowInvitadoModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Invitados de la Cita: {currentCita?.motivo}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>{currentInvitado ? "Editar Invitado" : "Agregar Nuevo Invitado"}</h5>
                    
                    <Form onSubmit={handleInvitadoSubmit} className="mb-4 p-3 bg-light rounded">
                        <div className="row g-2">
                            <div className="col-md-6"><Form.Control name="nombre" placeholder="Nombre" onChange={handleInvitadoFormChange} value={formDataInvitado.nombre} required /></div>
                            <div className="col-md-6"><Form.Control name="correo" placeholder="Correo" onChange={handleInvitadoFormChange} value={formDataInvitado.correo} required /></div>
                            <div className="col-md-6"><Form.Control name="empresa" placeholder="Empresa" onChange={handleInvitadoFormChange} value={formDataInvitado.empresa} /></div>
                            <div className="col-md-6"><Form.Control name="tipo_visitante" placeholder="Tipo (ej. Proveedor)" onChange={handleInvitadoFormChange} value={formDataInvitado.tipo_visitante} required /></div>
                        </div>
                        <div className="mt-2 d-flex gap-2">
                            <Button type="submit" variant={currentInvitado ? "warning" : "primary"}>
                                {currentInvitado ? "Actualizar Invitado" : "Agregar Invitado"}
                            </Button>
                            {currentInvitado && (
                                <Button variant="secondary" onClick={handleCancelEditInvitado}>
                                    Cancelar Edición
                                </Button>
                            )}
                        </div>
                    </Form>
                    
                    <hr />
                    
                    <h5>Invitados Actuales ({invitadosList.length})</h5>
                    <Table striped bordered hover size="sm">
                        <thead><tr><th>Nombre</th><th>Correo</th><th>Empresa</th><th>Visitante</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {invitadosList.map(inv => (
                                <tr key={inv.id}>
                                    <td>{inv.nombre}</td>
                                    <td>{inv.correo}</td>
                                    <td>{inv.empresa}</td>
                                    <td className="text-center">{inv.tipo_visitante}</td>
                                    <td className="text-center">
                                        <Button 
                                            variant="warning" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => handleEditInvitado(inv)}
                                        >
                                            <i className="bi bi-pencil-fill"></i>
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => handleDeleteInvitado(inv.id)}
                                        >
                                            <i className="bi bi-trash-fill"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>

            {/* --- MODAL PARA EL QR --- */}
            <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Código QR de la Cita</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <QRCodeCanvas 
                        value={selectedQrUrl} 
                        size={256} 
                        includeMargin={true} 
                    />
                    <p className="mt-2 small text-muted">{selectedQrUrl}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowQrModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
}

export default Mis_Citas;