import React, { useState, useEffect } from "react";
import useAxiosPrivate from '../hooks/useAxiosPrivate.js'; 
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import { QRCodeCanvas } from 'qrcode.react'; 

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

const initialInvitadoForm = {
    nombre: "",
    correo: "",
    empresa: "",
    tipo_visitante: "",
    tipo_acompanante: "Conductor",
    matricula: "",
    id_cajon: "",
    id_cita: null
};

function Crud_Citas() {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosPrivate = useAxiosPrivate();
    
    const [todosLosCajones, setTodosLosCajones] = useState([]);
    
    const [showCitaModal, setShowCitaModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showInvitadoModal, setShowInvitadoModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false); 

    const [currentCita, setCurrentCita] = useState(null); 
    const [formDataCita, setFormDataCita] = useState(initialCitaForm);
    const [invitadosList, setInvitadosList] = useState([]); 
    const [formDataInvitado, setFormDataInvitado] = useState(initialInvitadoForm);
    const [selectedQrUrl, setSelectedQrUrl] = useState(''); 
    
    const [currentInvitado, setCurrentInvitado] = useState(null);

    const [esAcompanante, setEsAcompanante] = useState(false);
    
    // 🟢 NUEVO ESTADO: Controla la zona seleccionada en el dropdown
    const [selectedZona, setSelectedZona] = useState("Invitados");

    const [selectedConductorId, setSelectedConductorId] = useState("");
    const [cajonConductorLabel, setCajonConductorLabel] = useState("");

    const [cajonesDisponibles, setCajonesDisponibles] = useState([]);
    const [buscandoCajones, setBuscandoCajones] = useState(false);

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

    const fetchTodosLosCajones = async () => {
        try {
            const response = await axiosPrivate.get('/api/cajones');
            setTodosLosCajones(response.data);
        } catch (error) {
            console.error("Error al obtener el catálogo de cajones:", error);
        }
    };

    useEffect(() => {
        fetchCitas();
        fetchTodosLosCajones();
    }, [axiosPrivate]);

    const getNombreCajon = (idCajon) => {
        if (!idCajon) return "—";
        const cajonEncontrado = todosLosCajones.find(c => c.id === Number(idCajon));
        return cajonEncontrado ? `${cajonEncontrado.numero_cajon} (${cajonEncontrado.zona || 'Invitados'})` : `Cajón #${idCajon}`;
    };

    const fetchCajonesParaCita = async (cita) => {
        setBuscandoCajones(true);
        try {
            const payload = {
                fecha_inicio: cita.fecha_inicio,
                fecha_fin: cita.fecha_fin || cita.fecha_inicio, 
                hora_inicio: cita.hora_inicio,
                hora_fin: cita.hora_fin,
                id_cita: cita.id
            };
            const response = await axiosPrivate.post('/api/cajones/filtrar-disponibles', payload);
            setCajonesDisponibles(response.data);
        } catch (error) {
            console.error("Error al buscar cajones disponibles:", error);
            Swal.fire("Aviso", "No se pudieron cargar los cajones disponibles.", "warning");
        } finally {
            setBuscandoCajones(false);
        }
    };

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

    const handleShowInvitadoModal = async (cita) => {
        setCurrentCita(cita);
        setShowInvitadoModal(true);
        setFormDataInvitado({ ...initialInvitadoForm, id_cita: cita.id }); 
        setCurrentInvitado(null);
        setSelectedConductorId("");
        setCajonConductorLabel("");
        setEsAcompanante(false);
        setSelectedZona("Invitados"); // Resetear zona
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

    const handleEditInvitado = (invitado) => {
        setCurrentInvitado(invitado); 
        
        const esAcomp = invitado.tipo_acompanante === 'Acompañante';
        setEsAcompanante(esAcomp); 

        // Recuperar la zona asignada para pre-seleccionar el dropdown
        if (invitado.id_cajon) {
            const cajonDelInvitado = todosLosCajones.find(c => c.id === Number(invitado.id_cajon));
            setSelectedZona(cajonDelInvitado?.zona || "Invitados");
        } else {
            setSelectedZona("Invitados");
        }

        if (esAcomp && invitado.id_cajon) {
            const conductor = invitadosList.find(inv => inv.id_cajon === invitado.id_cajon && inv.tipo_acompanante === 'Conductor' && inv.id !== invitado.id);
            if (conductor) {
                setSelectedConductorId(String(conductor.id));
                setCajonConductorLabel(getNombreCajon(conductor.id_cajon));
            }
        } else {
            setSelectedConductorId("");
            setCajonConductorLabel("");
        }

        setFormDataInvitado({
            nombre: invitado.nombre,
            correo: invitado.correo,
            empresa: invitado.empresa || "",
            tipo_visitante: invitado.tipo_visitante || "",
            tipo_acompanante: invitado.tipo_acompanante || "Conductor",
            matricula: invitado.matricula || "",
            id_cajon: invitado.id_cajon || "",
            id_cita: currentCita.id
        });
    };

    const handleCancelEditInvitado = () => {
        setCurrentInvitado(null);
        setSelectedConductorId("");
        setCajonConductorLabel("");
        setEsAcompanante(false);
        setSelectedZona("Invitados");
        setFormDataInvitado({ ...initialInvitadoForm, id_cita: currentCita.id });
    };

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
            conductor ? getNombreCajon(conductor.id_cajon) : ""
        );
    };

    const handleInvitadoSubmit = async (e) => {
        e.preventDefault();
        
        const payloadInvitado = {
            ...formDataInvitado,
            tipo_acompanante: esAcompanante ? 'Acompañante' : 'Conductor',
            id_cajon: formDataInvitado.id_cajon ? Number(formDataInvitado.id_cajon) : null
        };

        try {
            if (currentInvitado) {
                await axiosPrivate.patch(`/invitados/${currentInvitado.id}`, payloadInvitado);
                Swal.fire("¡Éxito!", "Invitado actualizado.", "success");
            } else {
                const res = await axiosPrivate.post('/invitados', payloadInvitado);
                const nuevoId = res.data?.id_invitado;
                
                if (payloadInvitado.id_cajon && nuevoId) {
                    await axiosPrivate.patch(`/invitados/${nuevoId}`, payloadInvitado);
                }
                Swal.fire("¡Éxito!", "Invitado agregado.", "success");
            }

            setFormDataInvitado({ ...initialInvitadoForm, id_cita: currentCita.id });
            setCurrentInvitado(null); 
            setSelectedConductorId("");
            setEsAcompanante(false);
            setSelectedZona("Invitados");
            fetchInvitados(currentCita.id); 
            fetchCitas(); 
            fetchCajonesParaCita(currentCita); 
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

        if (!result.isConfirmed) return;

        try {
            await axiosPrivate.delete(`/invitados/${invitadoId}`);
            
            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
            });
            Toast.fire({ icon: 'success', title: 'Invitado eliminado correctamente' });

            if (currentInvitado && currentInvitado.id === invitadoId) {
                handleCancelEditInvitado();
            }
            
            fetchInvitados(currentCita.id); 
            fetchCitas(); 
            fetchCajonesParaCita(currentCita); 

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

    // 🟢 LÓGICA DE FILTRADO DE CAJONES
    const cajonesParaMostrar = cajonesDisponibles.filter(c => {
        const zonaCajon = c.zona || 'Invitados';
        // 1. REGLA 1: NUNCA mostrar Profesores
        if (zonaCajon === 'Profesores') return false;
        // 2. REGLA 2: Que no esté ya asignado a otro invitado
        return !invitadosList.some(inv => inv.id_cajon === c.id && inv.id !== currentInvitado?.id);
    });

    // Extraer zonas únicas del catálogo, asignando 'Invitados' si viene vacío, y ocultando 'Profesores'
    const zonasUnicas = [...new Set(todosLosCajones.map(c => c.zona || 'Invitados'))]
        .filter(zona => zona !== 'Profesores');

    if (loading) return <div className="container p-4">Cargando citas...</div>;

    return (
        <div className="container-fluid p-8">
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
                                        cita.estado_cita === 'Finalizada' ? 'bg-secondary' :
                                        cita.estado_cita === 'Pendiente' ? 'bg-warning text-dark' :
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
                                            <i className="bi bi-qr-code m-1"></i> QR
                                        </button>
                                        <button onClick={() => handleShowCitaModal(cita)} className="btn btn-warning btn-sm" title="Editar Cita">
                                            <i className="bi bi-pencil-fill"></i> Edit
                                        </button>
                                        <button onClick={() => handleShowInvitadoModal(cita)} className="btn btn-info btn-sm" disabled={cita.estado_cita === 'Finalizada'} // 🟢 Inhabilita el botón si está finalizada
                                        title={cita.estado_cita === 'Finalizada' ? 'La cita ya finalizó' : 'Gestionar invitados'}>
                                            <i className="bi bi-people-fill m-1"></i> Inv
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
                                <option value="Finalizada">Finalizada</option>
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
                    <h5>{currentInvitado ? "Editar Invitado" : "Agregar Nuevo Invitado"}</h5>
                    
                    <Form onSubmit={handleInvitadoSubmit} className="mb-4 p-3 bg-light rounded">
                        <div className="row g-2">
                            <div className="col-md-6"><Form.Control name="nombre" placeholder="Nombre" onChange={handleInvitadoFormChange} value={formDataInvitado.nombre} required /></div>
                            <div className="col-md-6"><Form.Control name="correo" placeholder="Correo" onChange={handleInvitadoFormChange} value={formDataInvitado.correo} required /></div>
                            <div className="col-md-6"><Form.Control name="empresa" placeholder="Empresa" onChange={handleInvitadoFormChange} value={formDataInvitado.empresa} /></div>
                            <div className="col-md-6"><Form.Control name="tipo_visitante" placeholder="Tipo (ej. Proveedor)" onChange={handleInvitadoFormChange} value={formDataInvitado.tipo_visitante} required /></div>

                            <div className="col-12 mt-2 mb-2">
                                <Form.Check
                                    type="checkbox"
                                    id="es_acompanante"
                                    label="Es acompañante (comparte vehículo y cajón con otro invitado)"
                                    checked={esAcompanante}
                                    onChange={handleToggleAcompanante}
                                />
                            </div>

                            {/* --- CASO CONDUCTOR (No es acompañante) --- */}
                            {!esAcompanante && (
                                <>
                                    {/* 🟢 Dropdown para elegir la Zona Dinámica */}
                                    <div className="col-md-4">
                                        <Form.Label className="small text-muted mb-1">Zona de Estacionamiento</Form.Label>
                                        <Form.Select 
                                            value={selectedZona} 
                                            onChange={(e) => {
                                                setSelectedZona(e.target.value);
                                                // Limpiamos el cajón al cambiar de zona
                                                setFormDataInvitado(prev => ({ ...prev, id_cajon: "" }));
                                            }}
                                        >
                                            {zonasUnicas.map(zona => (
                                                <option key={zona} value={zona}>
                                                    {zona}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>

                                    {/* 🟢 Matrícula Obligatoria */}
                                    <div className="col-md-4">
                                        <Form.Label className="small text-muted mb-1">Matrícula (Requerido)</Form.Label>
                                        <Form.Control
                                            name="matricula"
                                            placeholder="Ej. ABC-1234"
                                            minLength={7}
                                            maxLength={9}   
                                            onChange={handleInvitadoFormChange}
                                            value={formDataInvitado.matricula}
                                            required 
                                        />
                                    </div>

                                    {/* 🟢 Cajón Obligatorio y Filtrado por Zona */}
                                    <div className="col-md-4">
                                        <Form.Label className="small text-muted mb-1">Asignar Cajón</Form.Label>
                                        <Form.Select
                                            name="id_cajon"
                                            value={formDataInvitado.id_cajon}
                                            onChange={handleInvitadoFormChange}
                                            disabled={buscandoCajones}
                                            required
                                        >
                                            <option value="">
                                                {buscandoCajones ? "Buscando cajones..." : "Seleccione un cajón..."}
                                            </option>

                                            {cajonesParaMostrar
                                                .filter(c => (c.zona || 'Invitados') === selectedZona)
                                                .map(cajon => (
                                                    <option key={cajon.id} value={cajon.id}>
                                                        Cajón {cajon.numero_cajon}
                                                    </option>
                                                ))
                                            }

                                            {currentInvitado?.id_cajon && !cajonesParaMostrar.some(c => c.id === currentInvitado.id_cajon) && (
                                                <option value={currentInvitado.id_cajon}>
                                                    {getNombreCajon(currentInvitado.id_cajon)} (actual)
                                                </option>
                                            )}
                                        </Form.Select>
                                    </div>
                                </>
                            )}

                            {/* --- CASO ACOMPAÑANTE --- */}
                            {esAcompanante && (
                                <>
                                    <div className="col-md-12">
                                        {/* 🟢 Filtra SOLO conductores */}
                                        <Form.Select
                                            value={selectedConductorId}
                                            onChange={handleSeleccionarConductor}
                                            required
                                        >
                                            <option value="">Selecciona al conductor principal...</option>
                                            {invitadosList
                                                .filter(inv => inv.tipo_acompanante === 'Conductor' && inv.id !== currentInvitado?.id)
                                                .map(conductor => (
                                                    <option key={conductor.id} value={conductor.id}>
                                                        {conductor.nombre} — Auto: {conductor.matricula}
                                                    </option>
                                                ))}
                                        </Form.Select>
                                        {invitadosList.filter(inv => inv.tipo_acompanante === 'Conductor').length === 0 && (
                                            <Form.Text className="text-danger">
                                                No hay conductores registrados. Registre al conductor primero.
                                            </Form.Text>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Label className="small text-muted mb-1">Matrícula (del conductor)</Form.Label>
                                        <Form.Control value={formDataInvitado.matricula} disabled readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Label className="small text-muted mb-1">Cajón (del conductor)</Form.Label>
                                        <Form.Control
                                            value={
                                                cajonesDisponibles.find(c => c.id === formDataInvitado.id_cajon)?.numero_cajon
                                                || (formDataInvitado.id_cajon ? getNombreCajon(formDataInvitado.id_cajon) : "Sin asignar")
                                            }
                                            disabled
                                            readOnly
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="mt-3 d-flex gap-2">
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
                    <div className="table-responsive">
                        <Table striped bordered hover size="sm" className="text-nowrap">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Empresa</th>
                                    <th>Visitante</th>
                                    <th>Rol</th>
                                    <th>Matrícula</th>
                                    <th>Cajón</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invitadosList.map(inv => (
                                    <tr key={inv.id}>
                                        <td>{inv.nombre}</td>
                                        <td>{inv.correo}</td>
                                        <td>{inv.empresa}</td>
                                        <td>{inv.tipo_visitante}</td>
                                        <td>
                                            <span className={`badge bg-${inv.tipo_acompanante === 'Conductor' ? 'primary' : 'secondary'}`}>
                                                {inv.tipo_acompanante || 'Conductor'}
                                            </span>
                                        </td>
                                        <td>{inv.matricula || "N/A"}</td>
                                        <td className="text-center">{inv.numero_cajon || getNombreCajon(inv.id_cajon).toString().substring(0, 25)}</td>
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
                    </div>
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
                    <h3 className="text-center w-100 text-bold">Escanéame</h3>
                    <Button variant="secondary" onClick={() => setShowQrModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
    
export default Crud_Citas;