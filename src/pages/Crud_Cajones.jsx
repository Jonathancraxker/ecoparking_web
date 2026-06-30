import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAxiosPrivate from '../hooks/useAxiosPrivate.js'; 
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";

const initialFormData = {
    numero_cajon: "",
    estado: "Disponible" 
};

function Crud_Cajones() {
    const [cajones, setCajones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosPrivate = useAxiosPrivate();

    // --- Cargar todos los cajones ---
    const fetchCajones = async (controller) => {
        setLoading(true);
        try {
            const response = await axiosPrivate.get('/api/cajones', {
                signal: controller.signal
            });
            setCajones(response.data);
            setError(null);
        } catch (err) {
            if (err.name === 'CanceledError') return;
            console.error("Error al obtener cajones:", err);
            setError("Error al cargar los cajones.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchCajones(controller);
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
                estado: cajon.estado || "Disponible"
            });
        } else {
            setFormData(initialFormData);
        }
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCajon) {
                await axiosPrivate.put(`/api/cajones/${currentCajon.id}`, formData);
                Swal.fire("¡Éxito!", "Cajón actualizado correctamente.", "success");
            } else {
                await axiosPrivate.post('/api/cajones', formData); 
                Swal.fire("¡Éxito!", "Cajón registrado correctamente.", "success");
            }
            setShowModal(false);
            fetchCajones(new AbortController()); 
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
            fetchCajones(new AbortController()); 
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
                <table className="table table-striped table-hover shadow-sm">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-center" scope="col">ID</th>
                            <th className="text-center" scope="col">Número de Cajón</th>
                            <th className="text-center" scope="col">Estado</th>
                            <th className="text-center" scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cajones.map((cajon) => (
                            <tr key={cajon.id}>
                                <th className="text-center">{cajon.id}</th>
                                <td className="text-center">{cajon.numero_cajon}</td>
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
                        <Form.Group className="mb-3">
                            <Form.Label>Número de Cajón</Form.Label>
                            <Form.Control type="text" name="numero_cajon" value={formData.numero_cajon} onChange={handleFormChange} required placeholder="Ej. A-01" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Estado</Form.Label>
                            <Form.Select name="estado" value={formData.estado} onChange={handleFormChange}>
                                <option value="Disponible">Disponible</option>
                                <option value="Ocupado">Ocupado</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                            </Form.Select>
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