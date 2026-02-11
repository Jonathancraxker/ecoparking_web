import { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';
import { Modal, Button, Form, Card, Row, Col, Table, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';

function Profile() {
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
        if (passwordData.contrasena.length < 8) {
            Swal.fire("Error", "La contraseña debe tener al menos 8 caracteres.", "error");
            return;
        }

        try {
            await axiosPrivate.put(`/usuarios/update/${profileData.id}`, {
                contrasena: passwordData.contrasena
            });
            Swal.fire("¡Éxito!", "Contraseña actualizada correctamente.", "success");
            setShowPasswordModal(false);
        } catch (err) {
            Swal.fire("Error", "No se pudo actualizar la contraseña.", "error");
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 mt-3">
            <header className="mb-4">
                <h2 className="fw-bold text-dark">Configuración de Perfil</h2>
                <p className="text-muted">Gestiona tu información personal y seguridad de la cuenta.</p>
            </header>

            {error && <div className="alert alert-danger shadow-sm">{error}</div>}

            {profileData && (
                <Row className="g-4">
                    {/* Tarjeta de Usuario Principal */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm text-center p-4 h-100">
                            <Card.Body>
                                <div className="mb-4">
                                    <div className="bg-primary bg-gradient d-inline-flex align-items-center justify-content-center rounded-circle text-white shadow" 
                                         style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                                        {profileData.nombre?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <h4 className="fw-bold">{profileData.nombre}</h4>
                                
                                <h6 className="fw-bold border-bottom mb-3 px-3 py-2">{profileData.tipo_usuario}</h6>
                                
                                <div className="d-grid gap-2 mt-2">
                                    <Button variant="primary" onClick={handleShowEdit}>
                                        <i className="bi bi-pencil-square me-2"></i>Editar Perfil
                                    </Button>
                                    <Button variant="outline-secondary" onClick={handleShowPassword}>
                                        <i className="bi bi-shield-lock me-2"></i>Seguridad
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Información Detallada */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 py-3">
                                <h5 className="mb-0 fw-bold text-primary">Información General</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table responsive hover className="mb-0">
                                    <tbody>
                                        <tr>
                                            <td className="ps-4 py-3 text-muted w-25">Nombre</td>
                                            <td className="py-3 fw-semibold">{profileData.nombre}</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4 py-3 text-muted w-25">Correo</td>
                                            <td className="py-3 fw-semibold">{profileData.correo}</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4 py-3 text-muted">Teléfono</td>
                                            <td className="py-3 text-primary">{profileData.telefono || 'No asignado'}</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4 py-3 text-muted">División</td>
                                            <td className="py-3">{profileData.division}</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4 py-3 text-muted">Código</td>
                                            <td className="py-3 font-monospace">{profileData.codigo}</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4 py-3 text-muted">Rol</td>
                                            <td className="py-3 font-monospace">{profileData.tipo_usuario}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                            <Card.Footer className="bg-light border-0 py-3">
                                <small className="text-muted italic">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Tu cuenta está vinculada a los servicios de EcoParking.
                                </small>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* --- MODALES --- */}
            
            {/* Modal Editar Perfil */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Actualizar Información</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Body className="py-0">
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Nombre Completo</Form.Label>
                            <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleEditChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Correo Electrónico</Form.Label>
                            <Form.Control type="email" name="correo" value={formData.correo} onChange={handleEditChange} required />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Teléfono</Form.Label>
                                    <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleEditChange} maxLength="10" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">División</Form.Label>
                                    <Form.Control type="text" name="division" value={formData.division} onChange={handleEditChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="light" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit">Guardar Cambios</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Cambiar Contraseña */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold text-danger">Seguridad de la Cuenta</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handlePasswordSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Nueva contraseña</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="contrasena" 
                                value={passwordData.contrasena} 
                                onChange={handlePasswordChange} 
                                required 
                                minLength="8"
                                pattern=".*[^A-Za-z0-9].*"
                                placeholder="Al menos 8 caracteres"
                                title="La contraseña debe tener al menos 8 caracteres y un carácter especial (ej. !@#$%)."
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Confirmar contraseña</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="confirmarContrasena" 
                                value={passwordData.confirmarContrasena} 
                                onChange={handlePasswordChange} 
                                required
                                placeholder='Al menos 8 caracteres'
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="light" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
                        <Button variant="danger" type="submit">Actualizar Contraseña</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}

export default Profile;