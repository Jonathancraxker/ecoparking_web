import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAxiosPrivate from '../hooks/useAxiosPrivate.js'; 
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import { QRCodeCanvas } from 'qrcode.react'; // <-- 1. IMPORTAR LIBRERÍA DE QR

// Estado inicial para el formulario de Cita (Crear/Editar)
const initialCitaForm = {
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: "",
    motivo: "",
    estado_cita: "Confirmada",
    numero_invitados: 0,
    invitados: [] // <-- Se enviará vacío al crear
};

// Estado inicial para el formulario de Invitado
const initialInvitadoForm = {
    nombre: "",
    correo: "",
    empresa: "",
    tipo_visitante: "",
    id_cita: null
};

function Crud_Citas() {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosPrivate = useAxiosPrivate();
    
    // --- Estados para los Modales ---
    const [showCitaModal, setShowCitaModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showInvitadoModal, setShowInvitadoModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false); // <-- 2. AÑADIR ESTADO PARA MODAL DE QR

    // --- Estados para los datos seleccionados ---
    const [currentCita, setCurrentCita] = useState(null); 
    const [formDataCita, setFormDataCita] = useState(initialCitaForm);
    const [invitadosList, setInvitadosList] = useState([]); 
    const [formDataInvitado, setFormDataInvitado] = useState(initialInvitadoForm);
    const [selectedQrUrl, setSelectedQrUrl] = useState(''); // <-- 3. AÑADIR ESTADO PARA LA URL DEL QR

    // --- Cargar todas las citas (ruta de Admin) ---
    const fetchCitas = async () => {
        setLoading(true);
        try {
            const response = await axiosPrivate.get('/citas'); 
            setCitas(response.data);
            setError(null);
        } catch (err) {
            console.error("Error al obtener citas:", err);
            setError("Error al cargar las citas.");
            if (err.response?.status === 403) {
                 setError("Acceso denegado. No tienes permisos de administrador.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCitas();
    }, [axiosPrivate]);

    // --- MANEJO DE MODAL DE CITA (CREAR/EDITAR) ---
    const handleShowCitaModal = (cita = null) => {
        setCurrentCita(cita); 
        if (cita) {
            // --- MODO EDICIÓN ---
            setFormDataCita({
                fecha_inicio: cita.fecha_inicio || "",
                fecha_fin: cita.fecha_fin || "",
                hora_inicio: cita.hora_inicio || "",
                hora_fin: cita.hora_fin || "",
                motivo: cita.motivo || "",
                estado_cita: cita.estado_cita || "",
                numero_invitados: cita.numero_invitados || 0
            });
        } else {
            // --- MODO CREACIÓN ---
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
                // --- LÓGICA DE ACTUALIZACIÓN (PATCH) ---
                const { invitados, ...dataToUpdate } = formDataCita;
                await axiosPrivate.patch(`/citas/${currentCita.id}`, dataToUpdate);
                Swal.fire("¡Éxito!", "Cita actualizada.", "success");
            } else {
                // --- LÓGICA DE CREACIÓN (POST) ---
                await axiosPrivate.post(`/citas`, formDataCita);
                Swal.fire("¡Éxito!", "Cita registrada.", "success");
            }
            setShowCitaModal(false);
            fetchCitas(); // Recargar la tabla
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
            fetchCitas(); // Recargar la tabla
        } catch (err) {
            Swal.fire("Error", `Hubo un error al eliminar la cita.`, "error");
        }
    };

    // --- MANEJO DE MODAL DE INVITADOS ---
    const handleShowInvitadoModal = async (cita) => {
        setCurrentCita(cita);
        setShowInvitadoModal(true);
        setFormDataInvitado({ ...initialInvitadoForm, id_cita: cita.id }); 
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

    const handleInvitadoSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosPrivate.post('/invitados', formDataInvitado);
            Swal.fire("¡Éxito!", "Invitado agregado.", "success");
            setFormDataInvitado({ ...initialInvitadoForm, id_cita: currentCita.id }); // Limpiar form
            fetchInvitados(currentCita.id); // Recargar lista en el modal
            fetchCitas(); // Recargar tabla principal (para 'numero_invitados')
        } catch (err) {
            Swal.fire("Error", `No se pudo agregar al invitado.`, "error");
        }
    };

    const handleDeleteInvitado = async (invitadoId) => {
        if (!window.confirm("¿Seguro que quieres eliminar este invitado?")) return;
        try {
            await axiosPrivate.delete(`/invitados/${invitadoId}`);
            Swal.fire("¡Eliminado!", "Invitado eliminado.", "success");
            fetchInvitados(currentCita.id); // Recargar lista en el modal
            fetchCitas(); // Recargar tabla principal (para 'numero_invitados')
        } catch (err) {
            Swal.fire("Error", `No se pudo eliminar al invitado.`, "error");
        }
    };
    
    // --- 4. AÑADIR FUNCIÓN PARA MOSTRAR MODAL DE QR ---
    const handleShowQrModal = (cita) => {
        if (cita.url_validacion) {
            setSelectedQrUrl(cita.url_validacion);
            setShowQrModal(true);
        } else {
            Swal.fire("Error", "Esta cita no tiene un código QR asociado (url_validacion no encontrada).", "error");
        }
    };

    if (loading) return <div className="container p-4">Cargando citas...</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Citas (Juca)</h2>
                <Button variant="primary" onClick={() => handleShowCitaModal(null)}>
                    + Registrar Nueva Cita
                </Button> 
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            <div className="table-responsive">
                <table className="table table-striped table-hover shadow-sm">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Motivo</th>
                            <th>Creado_por</th>
                            <th>Fechas</th>
                            <th>Horas</th>
                            <th>Invitados</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas.map((cita) => (
                            <tr key={cita.id}>
                                <th>{cita.id}</th>
                                <td>{cita.motivo}</td>
                                <td className="text-center">{cita.id_usuario}</td>
                                <td>{cita.fecha_inicio} al {cita.fecha_fin}</td>
                                <td>{cita.hora_inicio} a {cita.hora_fin}</td>
                                <td className="text-center">{cita.numero_invitados}</td>
                                <td className="text-center">
                                    <span className={`badge ${
                                        cita.estado_cita === 'Confirmada' ? 'bg-success' :'bg-danger'
                                    }`}>
                                        {cita.estado_cita}
                                    </span>
                                </td>
                                <td>
                                    {/* --- 5. AÑADIR NUEVO BOTÓN "QR" --- */}
                                    <button 
                                        onClick={() => handleShowQrModal(cita)} 
                                        className="btn btn-secondary btn-sm me-2" 
                                        title="Ver Código QR"
                                        disabled={!cita.url_validacion}
                                    >
                                        QR
                                    </button>
                                    <button onClick={() => handleShowCitaModal(cita)} className="btn btn-warning btn-sm me-2" title="Editar Cita">
                                        Editar
                                    </button>
                                    <button onClick={() => handleShowInvitadoModal(cita)} className="btn btn-info btn-sm me-2" title="Gestionar Invitados">
                                        Invitados
                                    </button>
                                    <button onClick={() => handleShowDeleteModal(cita)} className="btn btn-danger btn-sm" title="Eliminar Cita">
                                        Eliminar
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
                         <Form.Group className="mb-3 mt-3">
                            <Form.Label>Estado</Form.Label>
                            <Form.Select name="estado_cita" value={formDataCita.estado_cita} onChange={handleCitaFormChange}>
                                <option value="Confirmada">Confirmada</option>
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
                <Modal.Body>¿Estás seguro que deseas eliminar la cita: <strong>{currentCita?.motivo}</strong>? Se borrarán todos sus invitados y el QR asociado.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleDeleteCita}>Eliminar Cita</Button>
                </Modal.Footer>
            </Modal>

            {/* --- MODAL PARA GESTIONAR INVITADOS --- */}
            <Modal show={showInvitadoModal} onHide={() => setShowInvitadoModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Invitados de la Cita: {currentCita?.motivo}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Agregar Nuevo Invitado</h5>
                    <Form onSubmit={handleInvitadoSubmit} className="mb-4 p-3 bg-light rounded">
                        <div className="row g-2">
                            <div className="col-md-6"><Form.Control name="nombre" placeholder="Nombre" onChange={handleInvitadoFormChange} value={formDataInvitado.nombre} required /></div>
                            <div className="col-md-6"><Form.Control type="email" name="correo" placeholder="Correo" onChange={handleInvitadoFormChange} value={formDataInvitado.correo} required /></div>
                            <div className="col-md-6"><Form.Control name="empresa" placeholder="Empresa" onChange={handleInvitadoFormChange} value={formDataInvitado.empresa} required /></div>
                            <div className="col-md-6"><Form.Control name="tipo_visitante" placeholder="Tipo (ej. Proveedor)" onChange={handleInvitadoFormChange} value={formDataInvitado.tipo_visitante} required /></div>
                        </div>
                        <Button type="submit" variant="primary" className="mt-2">Agregar Invitado</Button>
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
                                    <td>{inv.tipo_visitante}</td>
                                    <td>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteInvitado(inv.id)}>X</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>

            {/* --- 6. AÑADIR NUEVO MODAL PARA EL QR --- */}
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

export default Crud_Citas;