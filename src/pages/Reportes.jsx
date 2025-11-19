import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';
import { Table, Button, Form, Card, Row, Col, Alert, Badge, Container, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';

// --- Componente de Tarjeta de Estadística ---
const StatCard = ({ title, children, bg = "light" }) => {
    return (
        <Card className={`mb-3 shadow-sm bg-${bg} ${bg !== 'light' ? 'text-white' : ''}`}>
            <Card.Body>
                <Card.Title className="border-bottom pb-2 mb-3">{title}</Card.Title>
                {children}
            </Card.Body>
        </Card>
    );
};

const Reportes = () => {
    // ... (MISMOS ESTADOS QUE ANTES - NO CAMBIAN) ...
    const [reportes, setReportes] = useState([]);
    const [loadingReportes, setLoadingReportes] = useState(true);
    const [errorReportes, setErrorReportes] = useState(null);
    const [citas, setCitas] = useState([]);
    const [loadingCitas, setLoadingCitas] = useState(true);
    const [formData, setFormData] = useState({ id_cita: '' });
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);
    const [prediccion, setPrediccion] = useState(null);
    const [loadingPrediccion, setLoadingPrediccion] = useState(true);

    const axiosPrivate = useAxiosPrivate();

    // ... (MISMAS FUNCIONES FETCH QUE ANTES - NO CAMBIAN) ...
    const fetchReportes = async () => {
        try {
            setLoadingReportes(true);
            setErrorReportes(null);
            const response = await axiosPrivate.get('/optener-reportes');
            setReportes(response.data);
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al cargar reportes';
            setErrorReportes(msg);
            setReportes([]);
        } finally {
            setLoadingReportes(false);
        }
    };

    const fetchCitas = async () => {
        try {
            setLoadingCitas(true);
            const response = await axiosPrivate.get('/citas');
            setCitas(response.data);
            if (response.data.length > 0) {
                setFormData(prev => ({ ...prev, id_cita: response.data[0].id }));
            }
        } catch (err) {
            console.error("Error cargando citas:", err);
        } finally {
            setLoadingCitas(false);
        }
    };

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            setErrorStats(null);
            const response = await axiosPrivate.get('/reportes/estadisticas');
            setStats(response.data); 
        } catch (err) {
            console.error("Error cargando estadísticas:", err);
            setErrorStats(err.response?.data?.message || "Error al cargar datos");
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchPrediccion = async () => {
        try {
            setLoadingPrediccion(true);
            const response = await axiosPrivate.get('/reportes/prediccion-siguiente-mes');
            setPrediccion(response.data);
        } catch (err) {
            console.error("Error cargando predicción:", err);
        } finally {
            setLoadingPrediccion(false);
        }
    };

    useEffect(() => {
        fetchReportes();
        fetchCitas();
        fetchStats();
        fetchPrediccion();
    }, [axiosPrivate]);
    
    // ... (MISMOS MANEJADORES QUE ANTES - NO CAMBIAN) ...
    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.id_cita) {
            Swal.fire("Atención", "Debe seleccionar una cita", "warning");
            return;
        }
        try {
            const response = await axiosPrivate.post('/dar-reportes', { id_cita: formData.id_cita });
            Swal.fire("¡Reporte Creado!", `Reporte #${response.data.id} guardado exitosamente.`, "success");
            fetchReportes(); 
            fetchStats();
            fetchPrediccion();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al crear el reporte';
            Swal.fire("Error", msg, "error");
        }
    };
    
    const handleDownloadCSV = () => { 
        if (reportes.length === 0) {
            Swal.fire("Información", "No hay reportes para descargar", "info");
            return;
        }
        const headers = ["ID Reporte", "Fecha Acceso", "ID Cita", "Motivo Cita", "Nombre Usuario", "Correo Usuario", "Tipo Usuario"];
        const rows = reportes.map(r => [
            r.reporte_id, r.fecha_reporte, r.cita_id, `"${r.motivo_cita}"`,
            `"${r.nombre_usuario}"`, r.correo_usuario, r.tipo_usuario
        ].join(','));
        const csvContent = [ headers.join(','), ...rows ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "reportes_ecoparking.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleSaveAndDownloadPDF = async (reporte) => {
        const toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        toast.fire({ icon: 'info', title: `Generando PDF para reporte #${reporte.reporte_id}...` });

        try {
            const response = await axiosPrivate.get(
                `/reportes/generar-pdf/${reporte.reporte_id}`,
                { responseType: 'blob' }
            );
            
            const contentDisposition = response.headers['content-disposition'];
            let filename = `reporte_${reporte.reporte_id}.pdf`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, ''); 
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.fire({ icon: 'success', title: `PDF descargado!` });

        } catch (error) {
            console.error("Error al descargar el PDF:", error);
            Swal.fire("Error", "No se pudo descargar el PDF.", "error");
        }
    };

    // --- Función auxiliar para el color del Badge ---
    const getBadgeColor = (tipo) => {
        switch (tipo) {
            case 'Juca': return 'success'; // Verde
            case 'Administrativo': return 'primary'; // Azul
            case 'Profesor': return 'warning'; // Amarillo (Bootstrap usa warning para amarillo)
            default: return 'secondary'; // Gris
        }
    };

    return (
        // 1. CAMBIO: Usamos 'Container' (sin fluid) para que no se extienda tanto
        <Container className="p-4">
            <h1 className="mb-4">Dashboard de Reportes</h1>

            {/* --- SECCIÓN DE PREDICCIÓN --- */}
            <Row className="mb-4">
                <Col>
                    <Card className="text-white bg-primary shadow-lg" style={{ background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', border: 'none' }}>
                        <Card.Body className="text-center p-4">
                            <h3 className="fw-light mb-2">Predicción del Próximo Mes</h3>
                            {loadingPrediccion ? (
                                <Spinner animation="border" variant="light" />
                            ) : prediccion ? (
                                <>
                                    <h4 className="fw-normal opacity-75">{prediccion.mes_predicho}</h4>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', lineHeight: '1' }}>
                                        {prediccion.visitas_predichas}
                                    </div>
                                    <div className="opacity-75 mt-2">Citas estimadas</div>
                                </>
                            ) : (
                                <p>No disponible</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* --- SECCIÓN DE ESTADÍSTICAS --- */}
            <div className="mb-5">
                <h3 className="border-bottom pb-2 mb-3">Estadísticas Generales</h3>
                {loadingStats ? (
                    <div className="text-center"><Spinner animation="border" variant="primary" /></div>
                ) : errorStats ? (
                    <Alert variant="danger">{errorStats}</Alert>
                ) : stats ? (
                    <>
                        <h5 className="text-muted mb-3">Análisis de Afluencia</h5>
                        <Row className="g-3 mb-4">
                            <Col md={4}>
                                <StatCard title="Promedio de Citas">
                                    <div className="d-flex justify-content-between mb-2 border-bottom pb-1">
                                        <span>Por Día:</span> <strong>{stats.estadisticasVisitas.mediaPorDia}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2 border-bottom pb-1">
                                        <span>Por Semana:</span> <strong>{stats.estadisticasVisitas.mediaPorSemana}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Por Mes:</span> <strong>{stats.estadisticasVisitas.mediaPorMes}</strong>
                                    </div>
                                </StatCard>
                            </Col>
                            <Col md={4}>
                                <StatCard title="Picos de Afluencia (Moda)">
                                    <div className="d-flex justify-content-between mb-2 border-bottom pb-1">
                                        <span>Día Top:</span> <strong>{stats.estadisticasVisitas.modaDiaSemana}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Hora Top:</span> <strong>{stats.estadisticasVisitas.modaHora}</strong>
                                    </div>
                                </StatCard>
                            </Col>
                            <Col md={4}>
                                <StatCard title="Totales">
                                    <div className="d-flex justify-content-between mb-2 border-bottom pb-1">
                                        <span>Mediana/Día:</span> <strong>{stats.estadisticasVisitas.medianaVisitas}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Total Citas:</span> <strong>{stats.estadisticasVisitas.totalVisitas}</strong>
                                    </div>
                                </StatCard>
                            </Col>
                        </Row>

                        <h5 className="text-muted mb-3">Análisis de Visitantes (Top 5)</h5>
                        <Row className="g-3">
                            <Col md={4}>
                                <StatCard title="Empresas">
                                    {stats.topEmpresas?.map((item, idx) => (
                                        <div key={idx} className="d-flex justify-content-between mb-1 small border-bottom pb-1">
                                            <span>{idx + 1}. {item.empresa}</span> <strong>{item.cantidad}</strong>
                                        </div>
                                    ))}
                                </StatCard>
                            </Col>
                            <Col md={4}>
                                <StatCard title="Divisiones">
                                    {stats.topDivisiones?.map((item, idx) => (
                                        <div key={idx} className="d-flex justify-content-between mb-1 small border-bottom pb-1">
                                            <span>{idx + 1}. {item.division}</span> <strong>{item.cantidad}</strong>
                                        </div>
                                    ))}
                                </StatCard>
                            </Col>
                            <Col md={4}>
                                <StatCard title="Tipos de Visitante">
                                    {stats.topTipoVisitante?.map((item, idx) => (
                                        <div key={idx} className="d-flex justify-content-between mb-1 small border-bottom pb-1">
                                            <span>{idx + 1}. {item.tipo_visitante}</span> <strong>{item.cantidad}</strong>
                                        </div>
                                    ))}
                                </StatCard>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <Alert variant="info">No hay estadísticas disponibles.</Alert>
                )}
            </div>

            {/* --- SECCIÓN 3: CREAR REPORTE --- */}
            <Card className="mb-5 shadow-sm">
                <Card.Header className="bg-white">
                    <h4 className="mb-0">Generar Nuevo Reporte</h4>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Row className="align-items-end">
                            <Col md={9}>
                                <Form.Group>
                                    <Form.Label>Seleccionar Cita:</Form.Label>
                                    <Form.Select 
                                        name="id_cita" 
                                        value={formData.id_cita} 
                                        onChange={handleFormChange}
                                        disabled={loadingCitas}
                                    >
                                        <option value="">-- Seleccione una cita --</option>
                                        {citas.map(cita => (
                                            <option key={cita.id} value={cita.id}>
                                                (ID: {cita.id}) - {cita.motivo} - {cita.fecha_inicio}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {loadingCitas && <Form.Text muted>Cargando citas...</Form.Text>}
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Button variant="success" type="submit" className="w-100">
                                    Guardar Reporte
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {/* --- SECCIÓN 4: TABLA DE REPORTES --- */}
            <Card className="shadow-sm">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Historial de Reportes</h4>
                    <Button variant="outline-primary" size="sm" onClick={handleDownloadCSV} disabled={reportes.length === 0}>
                        <i className="bi bi-download me-2"></i> Descargar CSV
                    </Button>
                </Card.Header>
                <Card.Body className="p-0">
                    {loadingReportes ? (
                        <div className="text-center p-5"><Spinner animation="border" /></div>
                    ) : errorReportes ? (
                        <Alert variant="danger" className="m-3">{errorReportes}</Alert>
                    ) : reportes.length === 0 ? (
                        <div className="text-center p-5 text-muted">No hay reportes registrados.</div>
                    ) : (
                        <div className="table-responsive">
                            <Table striped hover className="mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha de creación</th>
                                        <th className="text-center">Motivo Cita</th>
                                        <th>Creador</th>
                                        <th className="text-center">Correo</th>
                                        <th className='text-center'>Tipo</th>
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportes.map((reporte) => (
                                        <tr key={reporte.reporte_id}>
                                            <th>{reporte.reporte_id}</th>
                                            <td>
                                                {new Date(reporte.fecha_reporte).toLocaleString('es-MX', { 
                                                    year: 'numeric', month: '2-digit', day: '2-digit', 
                                                    hour: '2-digit', minute: '2-digit' 
                                                })}
                                            </td>
                                            <td className='text-center'>{reporte.motivo_cita}</td>
                                            <td className='text-center'>{reporte.nombre_usuario}</td>
                                            <td className="text-center">{reporte.correo_usuario}</td>
                                            <td className='text-center'>
                                                {/* 2. CAMBIO: Badge con color dinámico */}
                                                <Badge bg={getBadgeColor(reporte.tipo_usuario)}>
                                                    {reporte.tipo_usuario}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <Button 
                                                    variant="danger" 
                                                    size="sm" 
                                                    onClick={() => handleSaveAndDownloadPDF(reporte)}
                                                    title="Descargar PDF"
                                                    className="d-flex align-items-center gap-2 mx-auto"
                                                >
                                                  <i className="bi bi-file-earmark-pdf-fill"></i>
                                                    PDF
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Reportes;