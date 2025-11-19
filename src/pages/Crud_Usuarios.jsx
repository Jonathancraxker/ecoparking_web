import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAxiosPrivate from '../hooks/useAxiosPrivate.js'; 
import { useAuth } from '../context/AuthContext.jsx'; 
import { Modal, Button, Form, Table } from "react-bootstrap";
import Swal from "sweetalert2";

const initialFormData = {
    nombre: "",
    correo: "",
    contrasena: "",
    codigo: "",
    tipo_usuario: "Administrativo", // Valor por defecto
    telefono: "",
    division: "",
    intentos: "0"
};

function Crud_Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const { logout } = useAuth(); // Para desloguear si no es admin

    // --- Cargar todos los usuarios (Ruta de Admin) ---
    const fetchUsuarios = async (controller) => {
        setLoading(true);
        try {
            const response = await axiosPrivate.get('/usuarios', {
                signal: controller.signal
            });
            setUsuarios(response.data);
            setError(null);
        } catch (err) {
            if (err.name === 'CanceledError') return;
            console.error("Error al obtener usuarios:", err);
            setError("Error al cargar los usuarios.");
            if (err.response?.status === 403) {
                setError("Acceso denegado. No tienes permisos de administrador.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchUsuarios(controller);
        return () => controller.abort();
    }, [axiosPrivate]);

    // --- MANEJO DE MODAL CREAR/EDITAR ---
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    const handleShowModal = (user = null) => {
        setCurrentUser(user);
        if (user) {
            setFormData({
                nombre: user.nombre || "",
                correo: user.correo || "",
                contrasena: "", 
                codigo: user.codigo || "",
                tipo_usuario: user.tipo_usuario || "Profesor",
                telefono: user.telefono || "",
                division: user.division || "",
                intentos: user.intentos || "0"
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
        
        if (!currentUser && (!formData.contrasena || formData.contrasena.length < 6)) {
            Swal.fire("Error", "La contraseña es requerida (mín. 6 caracteres) al crear un usuario.", "error");
            return;
        }

        try {
            if (currentUser) {
                const { contrasena, ...dataToUpdate } = formData;
                await axiosPrivate.patch(`/usuarios/${currentUser.id}`, dataToUpdate);
                Swal.fire("¡Éxito!", "Usuario actualizado correctamente.", "success");
            } else {
                await axiosPrivate.post('/usuarios', formData); 
                Swal.fire("¡Éxito!", "Usuario registrado correctamente.", "success");
            }
            setShowModal(false);
            fetchUsuarios(new AbortController()); 
        } catch (err) {
            Swal.fire("Error", `Hubo un error al guardar el usuario: ${err.response?.data?.message || err.message}`, "error");
        }
    };

    // --- MANEJO DE MODAL BORRAR ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleShowDeleteModal = (user) => {
        setCurrentUser(user);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await axiosPrivate.delete(`/usuarios/${currentUser.id}`);
            Swal.fire("¡Eliminado!", "El usuario ha sido eliminado.", "success");
            setShowDeleteModal(false);
            fetchUsuarios(new AbortController()); 
        } catch (err) {
            Swal.fire("Error", `Hubo un error al eliminar el usuario.`, "error");
        }
    };

    // --- MANEJO DE MODAL CAMBIAR CONTRASEÑA ---
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleShowPasswordModal = (user) => {
        setCurrentUser(user);
        setShowPasswordModal(true);
        setNewPassword("");
        setConfirmPassword("");
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            Swal.fire("Error", "Las contraseñas no coinciden.", "error");
            return;
        }
        if (newPassword.length < 6) {
            Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres.", "error");
            return;
        }

        try {
            await axiosPrivate.put(`/usuarios/update/${currentUser.id}`, { 
                contrasena: newPassword 
            });
            Swal.fire("¡Éxito!", "Contraseña actualizada.", "success");
            setShowPasswordModal(false);
        } catch (err) {
            Swal.fire("Error", "No se pudo actualizar la contraseña.", "error");
        }
    };

    if (loading) {
        return <div className="container p-4">Cargando usuarios...</div>;
    }

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Usuarios</h2>
                <Button variant="primary" onClick={() => handleShowModal(null)} className="d-flex align-items-center gap-2">
                    <i className="bi bi-plus-circle"></i>Agregar usuario
                </Button>
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            <div className="table-responsive">
                <table className="table table-striped table-hover shadow-sm">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-center" scope="col">ID</th>
                            <th className="text-center" scope="col">Nombre</th>
                            <th scope="col">Correo</th>
                            <th className="text-center" scope="col">Código</th>
                            <th className="text-center" scope="col">Tipo</th>
                            <th className="text-center" scope="col">Intentos</th>
                            <th className="text-center" scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id}>
                                <th className="text-center">{usuario.id}</th>
                                <td className="text-center">{usuario.nombre}</td>
                                <td>{usuario.correo}</td>
                                <td className="text-center">{usuario.codigo}</td>
                                <td className="text-center">{usuario.tipo_usuario}</td>
                                <td className={`text-center ${usuario.intentos >= 5 ? 'text-danger fw-bold' : ''}`}>
                                    {usuario.intentos}
                                </td>
                                <td className="text-center">
                                    <Button onClick={() => handleShowModal(usuario)} className="btn btn-warning btn-sm me-2" title="Editar">
                                        <i className="bi bi-pencil-fill m-1"></i> 
                                    </Button>
                                    <Button onClick={() => handleShowDeleteModal(usuario)} className="btn btn-danger btn-sm align-items-center gap-1" title="Eliminar">
                                        <i className="bi bi-trash-fill m-1"></i>
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => handleShowPasswordModal(usuario)} className="ms-2 btn btn-secondary btn-sm align-items-center gap-1" title="Cambiar Contraseña">
                                        <i className="bi bi-key-fill m-1"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Link to="/profile" className="btn btn-secondary mt-3">
                Volver al Perfil
            </Link>

            {/* --- MODAL PARA AGREGAR/ACTUALIZAR USUARIO --- */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{currentUser ? "Editar Usuario" : "Agregar Usuario"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Correo</Form.Label>
                                    <Form.Control type="email" name="correo" value={formData.correo} onChange={handleFormChange} required />
                                </Form.Group>
                            </div>
                            
                            {!currentUser && (
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label>Contraseña</Form.Label>
                                        <Form.Control type="password" name="contrasena" value={formData.contrasena} onChange={handleFormChange} minLength="6" pattern=".*[^A-Za-z0-9].*"
                                        title="La contraseña debe tener al menos 6 caracteres y un carácter especial (ej. !@#$%)." required placeholder="Mínimo 6 caracteres" />
                                    </Form.Group>
                                </div>
                            )}
                            
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Código</Form.Label>
                                    <Form.Control type="text" name="codigo" value={formData.codigo} onChange={handleFormChange} required placeholder="Ej. ADM123" />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group>
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleFormChange} minLength="10" maxLength="10" />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group>
                                    <Form.Label>División</Form.Label>
                                    <Form.Control type="text" name="division" value={formData.division} onChange={handleFormChange} maxLength="60" />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group>
                                    <Form.Label>Tipo de Usuario</Form.Label>
                                    <Form.Select name="tipo_usuario" value={formData.tipo_usuario} onChange={handleFormChange}>
                                        <option value="Administrativo">Administrativo</option>
                                        <option value="Profesor">Profesor</option>
                                        <option value="Juca">Juca</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group>
                                    <Form.Label>Intentos - Incio de sesión</Form.Label>
                                    <Form.Select name="intentos" value={formData.intentos} onChange={handleFormChange}>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">{currentUser ? "Actualizar" : "Guardar"}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás seguro que deseas eliminar al usuario <strong>{currentUser?.nombre}</strong>?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
                </Modal.Footer>
            </Modal>
            
            {/* --- MODAL PARA CAMBIAR CONTRASEÑA --- */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cambiar contraseña (Usuario: {currentUser?.correo})</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handlePasswordSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nueva contraseña</Form.Label>
                            <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength="6" pattern=".*[^A-Za-z0-9].*"
                                        title="La contraseña debe tener al menos 6 caracteres y un carácter especial (ej. !@#$%)." required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirmar contraseña</Form.Label>
                            <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Mínimo 6 caracteres" pattern=".*[^A-Za-z0-9].*"
                                        title="La contraseña debe tener al menos 6 caracteres y un carácter especial (ej. !@#$%)." required />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">Guardar Contraseña</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </div>
    );
}

export default Crud_Usuarios;