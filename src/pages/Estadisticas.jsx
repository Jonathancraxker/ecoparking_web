import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from 'recharts';

export default function Estadisticas() {
    const [stats, setStats] = useState({
        kpis: { total_citas: 0, total_invitados: 0, total_usuarios: 0, citas_hoy: 0 },
        estadosCitas: [],
        citasPorMes: [],
        estadoCajones: [],
        citasPorTipo: [],
        citasPorDivision: []
    });
    const [loading, setLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();

    // Paletas de colores dinámicas
    const COLORES_ESTADOS = ['#27AE60', '#F1C40F', '#E74C3C', '#95A5A6'];
    const COLORES_CAJONES = ['#3498DB', '#E67E22', '#8E44AD'];
    const COLORES_TIPOS = ['#9b59b6', '#34495e', '#16a085'];
    const COLORES_DIVISION = ['#e67e22', '#d35400', '#f39c12', '#f1c40f', '#e74c3c'];

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axiosPrivate.get('/estadisticas/dashboard');
                setStats(res.data);
            } catch (error) {
                console.error("Error cargando el dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [axiosPrivate]);

    if (loading) return <div className="p-4 text-center mt-5"><h4>Cargando panel de control...</h4></div>;

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 text-dark"><i className="bi bi-graph-up me-2"></i>Estadísticas</h2>

            {/* --- SECCIÓN 1: TARJETAS DE KPIs (4 columnas) --- */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card text-white bg-primary shadow-sm mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Citas de Hoy</h5>
                            <h2 className="display-5 fw-bold">{stats.kpis.citas_hoy}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-success shadow-sm mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Total de Citas</h5>
                            <h2 className="display-5 fw-bold">{stats.kpis.total_citas}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-info shadow-sm mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Invitados Globales</h5>
                            <h2 className="display-5 fw-bold text-white">{stats.kpis.total_invitados}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-secondary shadow-sm mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Usuarios Activos</h5>
                            <h2 className="display-5 fw-bold">{stats.kpis.total_usuarios}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN 2: GRÁFICAS PRINCIPALES --- */}
            <div className="row">
                
                {/* Gráfica 1: Estados de las Citas (Pastel) */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm p-3 h-100">
                        <h5 className="text-center text-muted mb-3">Estados de Citas</h5>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={stats.estadosCitas} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value" label>
                                        {stats.estadosCitas.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORES_ESTADOS[index % COLORES_ESTADOS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Gráfica 2: Tendencia por Mes (Líneas) */}
                <div className="col-md-8 mb-4">
                    <div className="card shadow-sm p-3 h-100">
                        <h5 className="text-center text-muted mb-3">Histórico de Citas (Meses)</h5>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <LineChart data={stats.citasPorMes} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" stroke="#3498DB" strokeWidth={3} activeDot={{ r: 8 }} name="Citas" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Gráfica 3: Estado de Cajones (Barras) */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm p-3 h-100">
                        <h5 className="text-center text-muted mb-3">Uso de Cajones</h5>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <BarChart data={stats.estadoCajones} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Cajones">
                                        {stats.estadoCajones.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORES_CAJONES[index % COLORES_CAJONES.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Gráfica 4: Citas por Tipo de Usuario (Donas) */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm p-3 h-100">
                        <h5 className="text-center text-muted mb-3">Reservas por Tipo de Rol</h5>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={stats.citasPorTipo} cx="50%" cy="50%" outerRadius={90} fill="#8884d8" dataKey="value" label>
                                        {stats.citasPorTipo.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORES_TIPOS[index % COLORES_TIPOS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Gráfica 5: Top Divisiones (Barras Horizontales) */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm p-3 h-100">
                        <h5 className="text-center text-muted mb-3">Top Divisiones Activas</h5>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <BarChart layout="vertical" data={stats.citasPorDivision} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Citas">
                                        {stats.citasPorDivision.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORES_DIVISION[index % COLORES_DIVISION.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}