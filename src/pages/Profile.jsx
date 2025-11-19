import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';
import { Link } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

function Profile() {
    const { logout } = useAuth(); 
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosPrivate = useAxiosPrivate();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        division: ''
    });
    
    const [passwordData, setPasswordData] = useState({
        contrasena: '',
        confirmarContrasena: ''
    });

    const getProfile = async () => {
        const controller = new AbortController();
        try {
            const response = await axiosPrivate.get('/usuarios/perfil', {
                signal: controller.signal
            });
            setProfileData(response.data);
            setLoading(false);
        } catch (err) {
             if (err.name !== 'CanceledError') {
                console.error("Error al obtener perfil:", err);
                setError("No se pudieron cargar los datos del perfil.");
                setLoading(false);
            }
        }
        return controller;
    };

    useEffect(() => {
        let controller;
        getProfile().then(c => controller = c);
        return () => controller?.abort();
    }, [axiosPrivate]);


    //Editar pefil
    const handleShowEdit = () => {
        if (profileData) {
            setFormData({
                nombre: profileData.nombre || '',
                correo: profileData.correo || '',
                telefono: profileData.telefono || '',
                division: profileData.division || ''
            });
            setShowEditModal(true);
        }
    };

    const handleEditChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosPrivate.patch(`/usuarios/update/${profileData.id}`, formData);
            Swal.fire("¡Éxito!", "Perfil actualizado correctamente.", "success");
            setShowEditModal(false);
            getProfile();
        } catch (err) {
            Swal.fire("Error", "No se pudo actualizar el perfil.", "error");
        }
    };

    // Cambiar contraseña
    const handleShowPassword = () => {
        setPasswordData({ contrasena: '', confirmarContrasena: '' });
        setShowEditModal(false);
        setShowPasswordModal(true);
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.contrasena !== passwordData.confirmarContrasena) {
            Swal.fire("Error", "Las contraseñas no coinciden.", "error");
            return;
        }
        if (passwordData.contrasena.length < 6) {
            Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres.", "error");
            return;
        }

        try {
            await axiosPrivate.put(`/usuarios/update/${profileData.id}`, {
                contrasena: passwordData.contrasena
            });

            Swal.fire("¡Éxito!", "Contraseña actualizada.", "success");
            setShowPasswordModal(false);
        } catch (err) {
            Swal.fire("Error", "No se pudo actualizar la contraseña.", "error");
        }
    };


    if (loading) {
        return <div className="container p-4">Cargando perfil...</div>;
    }

    return (
        <div className="container p-4">
            <h2>Perfil de Usuario</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}

            {profileData ? (
                <div className="card p-4 shadow-sm mb-4">
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item"><strong>Nombre:</strong> {profileData.nombre}</li>
                        <li className="list-group-item"><strong>Correo:</strong> {profileData.correo}</li>
                        <li className="list-group-item"><strong>Teléfono:</strong> {profileData.telefono}</li>
                        <li className="list-group-item"><strong>División:</strong> {profileData.division}</li>
                        <li className="list-group-item"><strong>Tipo:</strong> {profileData.tipo_usuario}</li>
                        <li className="list-group-item"><strong>Código:</strong> {profileData.codigo}</li>
                    </ul>
                    <div className="mt-3">
                        <Button variant="primary" onClick={handleShowEdit} className="btn btn-primary btn-sm me-2">
                            <i className="bi bi-pencil-fill m-1"></i> 
                            Editar Perfil
                        </Button>
                    </div>
                </div>
            ) : (
                !loading && !error && <p>No se pudieron cargar los datos del perfil.</p>
            )}
            
            <div className="mt-2 d-flex flex-wrap gap-2">
                <button onClick={logout} className="btn btn-danger">
                    <i className="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
                </button>

                <Link to="/codigo" className="btn btn-secondary">
                    <i className="bi bi-qr-code-scan me-1"></i>Validador QR
                </Link>

                <Link to="/crud_usuarios" className="btn btn-success">
                    <i className="bi bi-people-fill me-1"></i>Gestionar Usuarios
                </Link>

                <Link to="/crud_citas" className="btn btn-success">
                    <i className="bi bi-calendar-range-fill me-1"></i>Gestionar Citas (Juca)
                </Link>

                <Link to="/mis_citas" className="btn btn-warning">
                    <i className="bi bi-calendar-event-fill me-1"></i>Gestionar Mis Citas
                </Link>

                <Link to="/Reportes" className="btn btn-primary">
                    <i className="bi bi-clipboard-data me-1"></i>Reportes
                </Link>
            </div>

            {/* --- MODAL EDITAR PERFIL --- */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Perfil</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleEditChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Correo</Form.Label>
                            <Form.Control type="email" name="correo" value={formData.correo} onChange={handleEditChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleEditChange} minLength="10" maxLength="10" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>División</Form.Label>
                            <Form.Control type="text" name="division" value={formData.division} onChange={handleEditChange} />
                        </Form.Group>
                        
                        <div className="mt-3">
                            <Button variant="link" onClick={handleShowPassword}>
                                ¿Deseas cambiar tu contraseña?
                            </Button>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">Guardar Cambios</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* --- MODAL CAMBIAR CONTRASEÑA --- */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cambiar Contraseña</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handlePasswordSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nueva Contraseña</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="contrasena" 
                                value={passwordData.contrasena} 
                                onChange={handlePasswordChange} 
                                required 
                                placeholder="Mínimo 6 caracteres"
                                minLength="6"
                                pattern=".*[^A-Za-z0-9].*"
                                title="La contraseña debe tener al menos 6 caracteres y un carácter especial (ej. !@#$%)."
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirmar Contraseña</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="confirmarContrasena" 
                                value={passwordData.confirmarContrasena} 
                                onChange={handlePasswordChange} 
                                required
                                placeholder="Mínimo 6 caracteres"
                                minLength="6"
                                pattern=".*[^A-Za-z0-9].*"
                                title="La contraseña debe tener al menos 6 caracteres y un carácter especial (ej. !@#$%)."
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">Actualizar Contraseña</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </div>
    );
}

export default Profile;