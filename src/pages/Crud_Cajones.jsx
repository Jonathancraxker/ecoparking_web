import React, { useState, useEffect } from "react";
import useAxiosPrivate from '../hooks/useAxiosPrivate.js'; 
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";

const initialFormData = {
    numero_cajon: "",
    estado: "Disponible",
    zona: "", // 🟢 Lo dejamos vacío para obligar a seleccionar una zona de la BD
    id_usuario: "" 
};

function Crud_Cajones() {
    const [cajones, setCajones] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [zonasOptions, setZonasOptions] = useState([]); // 🟢 Estado para las zonas de la BD
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosPrivate = useAxiosPrivate();

    // --- Cargar todos los cajones y profesores ---
    const fetchData = async (controller) => {
        setLoading(true);
        try {
            const [cajonesRes, usuariosRes] = await Promise.all([
                axiosPrivate.get('/api/cajones', { signal: controller.signal }),
                axiosPrivate.get('/usuarios', { signal: controller.signal })
            ]);
            
            setCajones(cajonesRes.data);
            
            // 🟢 Extraer zonas únicas de los cajones de la BD automáticamente
            const uniqueZonas = [...new Set(cajonesRes.data.map(c => c.zona))].filter(Boolean);
            setZonasOptions(uniqueZonas);
            
            const listaProfesores = usuariosRes.data.filter(u => u.tipo_usuario === 'Profesor');
            setProfesores(listaProfesores);
            
            setError(null);
        } catch (err) {
            if (err.name === 'CanceledError') return;
            console.error("Error al obtener datos:", err);
            setError("Error al cargar los datos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller);
        return () => controller.abort();
    }, [axiosPrivate]);

    const [showModal, setShowModal] = useState(false);
    const [currentCajon, setCurrentCajon] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    const handleShowModal = (cajon = null) => {
        setCurrentCajon(cajon);
        if (cajon) {
            setFormData({
                numero_cajon: cajon.numero_cajon || "",
                estado: cajon.estado || "Disponible",
                zona: cajon.zona || "",
                id_usuario: cajon.id_usuario || ""
            });
        } else {
            setFormData(initialFormData);
        }
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        // 🟢 Ya no borramos el id_usuario al cambiar de zona
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            ...formData,
            id_usuario: formData.id_usuario === "" ? null : formData.id_usuario
        };

        try {
            if (currentCajon) {
                await axiosPrivate.put(`/api/cajones/${currentCajon.id}`, payload);
                Swal.fire("¡Éxito!", "Cajón actualizado correctamente.", "success");
            } else {
                await axiosPrivate.post('/api/cajones', payload); 
                Swal.fire("¡Éxito!", "Cajón registrado correctamente.", "success");
            }
            setShowModal(false);
            fetchData(new AbortController()); 
        } catch (err) {
            Swal.fire("Error", `Hubo un error al guardar el cajón: ${err.response?.data?.message || err.message}`, "error");
        }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleShowDeleteModal = (cajon) => {
        setCurrentCajon(cajon);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await axiosPrivate.delete(`/api/cajones/${currentCajon.id}`);
            Swal.fire("¡Eliminado!", "El cajón ha sido eliminado.", "success");
            setShowDeleteModal(false);
            fetchData(new AbortController()); 
        } catch (err) {
            Swal.fire("Error", `Hubo un error al eliminar el cajón.`, "error");
        }
    };

    if (loading) {
        return <div className="container p-4">Cargando cajones...</div>;
    }

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Cajones</h2>
                <Button variant="primary" onClick={() => handleShowModal(null)} className="d-flex align-items-center gap-2">
                    <i className="bi bi-plus-circle"></i>Nuevo Cajón
                </Button>
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            <div className="table-responsive">
                <table className="table table-striped table-hover shadow-sm text-nowrap">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-center" scope="col">ID</th>
                            <th className="text-center" scope="col">Número de Cajón</th>
                            <th className="text-center" scope="col">Zona</th>
                            <th className="text-center" scope="col">Asignado a</th>
                            <th className="text-center" scope="col">Estado</th>
                            <th className="text-center" scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cajones.map((cajon) => (
                            <tr key={cajon.id}>
                                <th className="text-center">{cajon.id}</th>
                                <td className="text-center">{cajon.numero_cajon}</td>
                                <td className="text-center">{cajon.zona}</td>
                                <td className="text-center text-muted">
                                    {cajon.correo_profesor ? cajon.correo_profesor : "N/A"}
                                </td>
                                <td className="text-center">
                                    <span className={`badge ${
                                        cajon.estado === 'Disponible' ? 'bg-success' : 
                                        cajon.estado === 'Ocupado' ? 'bg-danger' : 'bg-warning'
                                    }`}>
                                        {cajon.estado}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <Button onClick={() => handleShowModal(cajon)} className="btn btn-warning btn-sm me-2" title="Editar">
                                        <i className="bi bi-pencil-fill m-1"></i>
                                    </Button>
                                    <Button onClick={() => handleShowDeleteModal(cajon)} className="btn btn-danger btn-sm" title="Eliminar">
                                        <i className="bi bi-trash-fill m-1"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentCajon ? "Editar Cajón" : "Agregar Cajón"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Número de Cajón</Form.Label>
                                    <Form.Control type="text" name="numero_cajon" value={formData.numero_cajon} onChange={handleFormChange} required placeholder="Ej. A-01" />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select name="estado" value={formData.estado} onChange={handleFormChange}>
                                        <option value="Disponible">Disponible</option>
                                        <option value="Ocupado">Ocupado</option>
                                        <option value="Mantenimiento">Mantenimiento</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Zona</Form.Label>
                            {/* 🟢 Las zonas ahora se cargan dinámicamente de la base de datos */}
                            <Form.Select name="zona" value={formData.zona} onChange={handleFormChange} required>
                                <option value="">-- Seleccione una Zona --</option>
                                {zonasOptions.map((z, index) => (
                                    <option key={index} value={z}>{z}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* 🟢 El selector de usuario ahora se muestra SIEMPRE, sin importar la zona */}
                        <Form.Group className="mb-3">
                            <Form.Label>Asignar a (Opcional)</Form.Label>
                            <Form.Select 
                                name="id_usuario" 
                                value={formData.id_usuario} 
                                onChange={handleFormChange}
                                // Ya no es requerido, porque no todos los cajones tendrán dueño
                            >
                                <option value="">-- Sin Asignar --</option>
                                {profesores.map(profe => (
                                    <option key={profe.id} value={profe.id}>
                                        {profe.nombre} ({profe.correo})
                                    </option>
                                ))}
                            </Form.Select>
                            {profesores.length === 0 && (
                                <Form.Text className="text-danger">
                                    No hay profesores registrados en el sistema.
                                </Form.Text>
                            )}
                        </Form.Group>
                        
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">{currentCajon ? "Actualizar" : "Guardar"}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás seguro que deseas eliminar el cajón <strong>{currentCajon?.numero_cajon}</strong>?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Crud_Cajones;