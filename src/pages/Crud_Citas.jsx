import React, { useState, useEffect } from "react";
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
    matricula: "",
    id_cajon: "",
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
    const [showQrModal, setShowQrModal] = useState(false); 

    // --- Estados para los datos seleccionados ---
    const [currentCita, setCurrentCita] = useState(null); 
    const [formDataCita, setFormDataCita] = useState(initialCitaForm);
    const [invitadosList, setInvitadosList] = useState([]); 
    const [formDataInvitado, setFormDataInvitado] = useState(initialInvitadoForm);
    const [selectedQrUrl, setSelectedQrUrl] = useState(''); 
    
    // --- Estado para saber qué invitado estamos editando ---
    const [currentInvitado, setCurrentInvitado] = useState(null);

    // --- Estado local (NO se manda al backend): controla si el formulario está en modo "acompañante" ---
    const [esAcompanante, setEsAcompanante] = useState(false);
    const [selectedConductorId, setSelectedConductorId] = useState("");
    const [cajonConductorLabel, setCajonConductorLabel] = useState("");

    // --- Estados para los cajones disponibles ---
    const [cajonesDisponibles, setCajonesDisponibles] = useState([]);
    const [buscandoCajones, setBuscandoCajones] = useState(false);

    // --- Cargar todas las citas ---
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

    // --- Buscar cajones disponibles para la cita al abrir el modal de invitados ---
    const fetchCajonesParaCita = async (cita) => {
        setBuscandoCajones(true);
        try {
            const payload = {
                fecha_inicio: cita.fecha_inicio,
                fecha_fin: cita.fecha_fin,
                hora_inicio: cita.hora_inicio,
                hora_fin: cita.hora_fin,
                id_cita: cita.id
            };
            const response = await axiosPrivate.post('/api/cajones/filtrar-disponibles', payload);
            setCajonesDisponibles(response.data);
        } catch (error) {
            console.error("Error al buscar cajones disponibles:", error);
        } finally {
            setBuscandoCajones(false);
        }
    };

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

    // La universidad no cuenta con estacionamiento 24/7: la cita es de un solo día,
    // así que fecha_inicio y fecha_fin siempre deben coincidir.
    const handleFechaUnicaChange = (e) => {
        const { value } = e.target;
        setFormDataCita({ ...formDataCita, fecha_inicio: value, fecha_fin: value });
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
            fetchCitas(); 
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
            fetchCitas(); 
        } catch (err) {
            Swal.fire("Error", `Hubo un error al eliminar la cita.`, "error");
        }
    };

    // --- MANEJO DE MODAL DE INVITADOS ---
    const handleShowInvitadoModal = async (cita) => {
        setCurrentCita(cita);
        setShowInvitadoModal(true);
        // Reseteamos el formulario y el modo edición
        setFormDataInvitado({ ...initialInvitadoForm, id_cita: cita.id }); 
        setCurrentInvitado(null);
        setSelectedConductorId("");
        setCajonConductorLabel("");
        setEsAcompanante(false);
        await fetchInvitados(cita.id); 
        await fetchCajonesParaCita(cita);
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

    // --- Preparar formulario para editar invitado ---
    const handleEditInvitado = (invitado) => {
        setCurrentInvitado(invitado); // Marcamos que estamos editando
        setSelectedConductorId("");
        setCajonConductorLabel("");
        setEsAcompanante(false); // al editar, siempre inicia en modo manual; el usuario puede volver a marcar "acompañante" si quiere
        setFormDataInvitado({
            nombre: invitado.nombre,
            correo: invitado.correo,
            empresa: invitado.empresa || "",
            tipo_visitante: invitado.tipo_visitante || "",
            matricula: invitado.matricula || "",
            id_cajon: invitado.id_cajon || "",
            id_cita: currentCita.id
        });
    };

    // --- Cancelar edición de invitado ---
    const handleCancelEditInvitado = () => {
        setCurrentInvitado(null);
        setSelectedConductorId("");
        setCajonConductorLabel("");
        setEsAcompanante(false);
        setFormDataInvitado({ ...initialInvitadoForm, id_cita: currentCita.id });
    };

    // --- Marcar/desmarcar "Es acompañante": limpia matrícula/cajón para que no arrastren datos incorrectos ---
    const handleToggleAcompanante = (e) => {
        const checked = e.target.checked;
        setEsAcompanante(checked);
        setSelectedConductorId("");
        setCajonConductorLabel("");
        setFormDataInvitado({
            ...formDataInvitado,
            matricula: "",
            id_cajon: ""
        });
    };

    // --- Cuando un acompañante elige a su conductor, copiamos matrícula y cajón ---
    const handleSeleccionarConductor = (e) => {
        const conductorId = e.target.value;
        setSelectedConductorId(conductorId);
        const conductor = invitadosList.find(inv => String(inv.id) === conductorId);
        setFormDataInvitado({
            ...formDataInvitado,
            matricula: conductor ? (conductor.matricula || "") : "",
            id_cajon: conductor ? (conductor.id_cajon || "") : ""
        });
        setCajonConductorLabel(
            conductor
                ? (conductor.numero_cajon || (conductor.id_cajon ? `Cajón #${conductor.id_cajon}` : "Sin cajón asignado"))
                : ""
        );
    };

    const handleInvitadoSubmit = async (e) => {
        e.preventDefault();
        const payloadInvitado = {
            ...formDataInvitado,
            id_cajon: formDataInvitado.id_cajon ? Number(formDataInvitado.id_cajon) : null
        };
        try {
            if (currentInvitado) {
                // --- MODO EDICIÓN (PATCH) ---
                await axiosPrivate.patch(`/invitados/${currentInvitado.id}`, payloadInvitado);
                Swal.fire("¡Éxito!", "Invitado actualizado.", "success");
            } else {
                // --- MODO CREACIÓN (POST) ---
                const res = await axiosPrivate.post('/invitados', payloadInvitado);

                // ⚠️ El endpoint POST /invitados en el backend actual NO guarda id_cajon
                // ni marca el cajón como "Ocupado" (solo lo hace el PATCH).
                // Truco sin tocar el backend: si el invitado trae cajón, justo después
                // de crearlo mandamos un PATCH con los mismos datos, para que el
                // backend sí ejecute la lógica de ocupar el cajón.
                const nuevoId = res.data?.id_invitado;
                if (payloadInvitado.id_cajon && nuevoId) {
                    await axiosPrivate.patch(`/invitados/${nuevoId}`, payloadInvitado);
                }

                Swal.fire("¡Éxito!", "Invitado agregado.", "success");
            }

            // Resetear formulario y recargar lista
            setFormDataInvitado({ ...initialInvitadoForm, id_cita: currentCita.id });
            setCurrentInvitado(null); // Volver a modo "Agregar"
            setSelectedConductorId("");
            setEsAcompanante(false);
            fetchInvitados(currentCita.id); 
            fetchCitas(); // Recargar tabla principal
            fetchCajonesParaCita(currentCita); // Refrescar disponibilidad de cajones
        } catch (err) {
            Swal.fire("Error", `Hubo un error al guardar el invitado.`, "error");
        }
    };

    const handleDeleteInvitado = async (invitadoId) => {
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
            fetchCitas(); 
            fetchCajonesParaCita(currentCita); // Refrescar disponibilidad de cajones

        } catch (err) {
            Swal.fire("Error", `No se pudo eliminar al invitado.`, "error");
        }
    };
    
    // --- MANEJO DE QR ---
    const handleShowQrModal = (cita) => {
        if (cita.url_validacion) {
            setSelectedQrUrl(cita.url_validacion);
            setShowQrModal(true);
        } else {
            Swal.fire("Error", "Esta cita no tiene un código QR asociado (url_validacion no encontrada).", "error");
        }
    };

    // Cajones disponibles sin contar los que ya usan otros invitados de ESTA misma cita
    const cajonesFiltrados = cajonesDisponibles.filter(c =>
        !invitadosList.some(inv => inv.id_cajon === c.id && inv.id !== currentInvitado?.id)
    );

    if (loading) return <div className="container p-4">Cargando citas...</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Citas (Todas)</h2>
                <Button variant="primary" onClick={() => handleShowCitaModal(null)} className="d-flex align-items-center gap-2">
                    <i className="bi bi-plus-circle"></i>
                    Registrar cita
                </Button> 
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            <div className="table-responsive">
                <table className="table table-striped table-hover shadow-sm">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Motivo</th>
                            <th className="text-center">User_ID</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Invitados</th>
                            <th className="text-center">Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas.map((cita) => (
                            <tr key={cita.id}>
                                <th>{cita.id}</th>
                                <td>{cita.motivo}</td>
                                <td className="text-center">{cita.id_usuario}</td>
                                <td>{cita.fecha_inicio}</td>
                                <td>{cita.hora_inicio} a {cita.hora_fin}</td>
                                <td className="text-center">{cita.numero_invitados}</td>
                                <td className="text-center ">
                                    <span className={`badge ${
                                        cita.estado_cita === 'Confirmada' ? 'bg-success' :
                                        'bg-danger'
                                    }`}>
                                        {cita.estado_cita}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <div className="d-flex flex-wrap justify-content-center gap-2">
                                        <button 
                                            onClick={() => handleShowQrModal(cita)} 
                                            className="btn btn-secondary btn-sm" 
                                            title="Ver Código QR"
                                            disabled={!cita.url_validacion}
                                        >
                                            <i className="bi bi-qr-code m-1"></i>
                                            QR
                                        </button>
                                        <button onClick={() => handleShowCitaModal(cita)} className="btn btn-warning btn-sm" title="Editar Cita">
                                            <i className="bi bi-pencil-fill"></i> Edit
                                        </button>
                                        <button onClick={() => handleShowInvitadoModal(cita)} className="btn btn-info btn-sm" title="Gestionar Invitados">
                                            <i className="bi bi-people-fill m-1"></i> Invitados
                                        </button>
                                        <button onClick={() => handleShowDeleteModal(cita)} className="btn btn-danger btn-sm" title="Eliminar Cita">
                                            <i className="bi bi-trash-fill"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control type="date" name="fecha" value={formDataCita.fecha_inicio} onChange={handleFechaUnicaChange} required />
                        </Form.Group>
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
                    {/* Título dinámico del formulario */}
                    <h5>{currentInvitado ? "Editar Invitado" : "Agregar Nuevo Invitado"}</h5>
                    
                    <Form onSubmit={handleInvitadoSubmit} className="mb-4 p-3 bg-light rounded">
                        <div className="row g-2">
                            <div className="col-md-6"><Form.Control name="nombre" placeholder="Nombre" onChange={handleInvitadoFormChange} value={formDataInvitado.nombre} required /></div>
                            <div className="col-md-6"><Form.Control name="correo" placeholder="Correo" onChange={handleInvitadoFormChange} value={formDataInvitado.correo} required /></div>
                            <div className="col-md-6"><Form.Control name="empresa" placeholder="Empresa" onChange={handleInvitadoFormChange} value={formDataInvitado.empresa} /></div>
                            <div className="col-md-6"><Form.Control name="tipo_visitante" placeholder="Tipo (ej. Proveedor)" onChange={handleInvitadoFormChange} value={formDataInvitado.tipo_visitante} required /></div>

                            {/* --- Checkbox: ¿Es acompañante? --- */}
                            <div className="col-12">
                                <Form.Check
                                    type="checkbox"
                                    id="es_acompanante"
                                    label="Es acompañante (comparte vehículo y cajón con otro invitado)"
                                    checked={esAcompanante}
                                    onChange={handleToggleAcompanante}
                                />
                            </div>

                            {/* --- CASO NORMAL / CONDUCTOR: escribe su matrícula y elige un cajón disponible --- */}
                            {!esAcompanante && (
                                <>
                                    <div className="col-md-6">
                                        <Form.Control
                                            name="matricula"
                                            placeholder="Matrícula del Vehículo"
                                            minLength={7}
                                            maxLength={9}
                                            onChange={handleInvitadoFormChange}
                                            value={formDataInvitado.matricula}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Select
                                            name="id_cajon"
                                            value={formDataInvitado.id_cajon}
                                            onChange={handleInvitadoFormChange}
                                            disabled={buscandoCajones}
                                        >
                                            <option value="">
                                                {buscandoCajones ? "Buscando cajones..." : "Sin cajón (llegó a pie)"}
                                            </option>
                                            {cajonesFiltrados.map(cajon => (
                                                <option key={cajon.id} value={cajon.id}>
                                                    {cajon.numero_cajon}
                                                </option>
                                            ))}
                                            {currentInvitado?.id_cajon && !cajonesFiltrados.some(c => c.id === currentInvitado.id_cajon) && (
                                                <option value={currentInvitado.id_cajon}>
                                                    {currentInvitado.numero_cajon || `Cajón #${currentInvitado.id_cajon}`} (actual)
                                                </option>
                                            )}
                                        </Form.Select>
                                    </div>
                                </>
                            )}

                            {/* --- CASO ACOMPAÑANTE: elige de la lista de invitados con vehículo ya registrado en esta cita --- */}
                            {esAcompanante && (
                                <>
                                    <div className="col-md-12">
                                        <Form.Select
                                            value={selectedConductorId}
                                            onChange={handleSeleccionarConductor}
                                            required
                                        >
                                            <option value="">Selecciona al conductor que acompaña...</option>
                                            {invitadosList
                                                .filter(inv => inv.matricula && inv.id !== currentInvitado?.id)
                                                .map(conductor => (
                                                    <option key={conductor.id} value={conductor.id}>
                                                        {conductor.nombre} — {conductor.matricula}
                                                    </option>
                                                ))}
                                        </Form.Select>
                                        {invitadosList.filter(inv => inv.matricula).length === 0 && (
                                            <Form.Text className="text-danger">
                                                Todavía no hay ningún invitado con vehículo registrado en esta cita. Agrega primero al conductor.
                                            </Form.Text>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Label className="small text-muted mb-1">Matrícula (copiada del conductor)</Form.Label>
                                        <Form.Control value={formDataInvitado.matricula} disabled readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Label className="small text-muted mb-1">Cajón (copiado del conductor)</Form.Label>
                                        <Form.Control
                                            value={
                                                cajonesDisponibles.find(c => c.id === formDataInvitado.id_cajon)?.numero_cajon
                                                || (formDataInvitado.id_cajon ? `Cajón #${formDataInvitado.id_cajon}` : "Sin cajón")
                                            }
                                            disabled
                                            readOnly
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="mt-2 d-flex gap-2">
                            <Button type="submit" variant={currentInvitado ? "warning" : "primary"}>
                                {currentInvitado ? "Actualizar Invitado" : "Agregar Invitado"}
                            </Button>
                            
                            {/* Botón Cancelar solo si estamos editando */}
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
                        <thead><tr><th>Nombre</th><th>Correo</th><th>Empresa</th><th>Visitante</th><th>Matrícula</th><th>Cajón</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {invitadosList.map(inv => (
                                <tr key={inv.id}>
                                    <td>{inv.nombre}</td>
                                    <td>{inv.correo}</td>
                                    <td>{inv.empresa}</td>
                                    <td>{inv.tipo_visitante}</td>
                                    <td>{inv.matricula || "No especificada"}</td>
                                    <td className="text-center">{inv.numero_cajon || (inv.id_cajon ? `#${inv.id_cajon}` : "—")}</td>
                                    <td className="text-center">
                                        {/* Botón EDITAR */}
                                        <Button 
                                            variant="warning" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => handleEditInvitado(inv)}
                                        >
                                            <i className="bi bi-pencil-fill"></i>
                                        </Button>
                                        {/* Botón ELIMINAR */}
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
    
export default Crud_Citas;
