// Archivo: src/pages/Reportes.jsx
// (CORREGIDO: Rellenada la función handleSaveAndDownloadPDF)

import { useEffect, useState } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate'; // Tu hook de autenticación

// --- Componente de Tarjeta de Estadística (para limpiar el render) ---
const StatCard = ({ title, children }) => {
  const cardStyle = {
    background: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    flex: 1, // Para que crezcan igual
    minWidth: '280px', // Para que se acomoden en pantallas pequeñas
  };
  const cardTitleStyle = {
    borderBottom: '2px solid #eee',
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
    marginTop: 0,
    fontSize: '1.2rem'
  };
  return (
    <div style={cardStyle}>
      <h3 style={cardTitleStyle}>{title}</h3>
      {children}
    </div>
  );
};

// --- Componente Principal de Reportes ---
const Reportes = () => {
  // ... (Estados existentes) ...
  const [reportes, setReportes] = useState([]);
  const [loadingReportes, setLoadingReportes] = useState(true);
  const [errorReportes, setErrorReportes] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [formData, setFormData] = useState({ id_cita: '' });
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  
  // --- 1. NUEVOS ESTADOS PARA LA PREDICCIÓN ---
  const [prediccion, setPrediccion] = useState(null);
  const [loadingPrediccion, setLoadingPrediccion] = useState(true);

  const axiosPrivate = useAxiosPrivate();

  // --- Funciones de Carga de Datos ---
  
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
      setFormMessage({ type: 'error', text: 'No se pudieron cargar las citas' });
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

  // --- 2. NUEVA FUNCIÓN PARA BUSCAR LA PREDICCIÓN ---
  const fetchPrediccion = async () => {
    try {
      setLoadingPrediccion(true);
      const response = await axiosPrivate.get('/reportes/prediccion-siguiente-mes');
      setPrediccion(response.data); // Guarda { mes_predicho, visitas_predichas }
    } catch (err) {
      console.error("Error cargando predicción:", err);
      // No es un error crítico, así que no mostramos un error rojo
    } finally {
      setLoadingPrediccion(false);
    }
  };

  // 3. AÑADIMOS fetchPrediccion() al useEffect
  useEffect(() => {
    fetchReportes();
    fetchCitas();
    fetchStats();
    fetchPrediccion(); // <-- Llamamos a la nueva función
  }, [axiosPrivate]);
  
  // --- Funciones de Manejadores ---
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ type: '', text: '' });
    if (!formData.id_cita) {
      setFormMessage({ type: 'error', text: 'Debe seleccionar una cita' });
      return;
    }
    try {
      const response = await axiosPrivate.post('/dar-reportes', { 
        id_cita: formData.id_cita 
      });
      setFormMessage({ type: 'success', text: `Reporte ${response.data.id} creado!` });
      // Recargamos todo al crear un reporte nuevo
      fetchReportes(); 
      fetchStats();
      fetchPrediccion(); // <-- Recargamos la predicción
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear el reporte';
      setFormMessage({ type: 'error', text: msg });
    }
  };
  
  const handleDownloadCSV = () => { 
    if (reportes.length === 0) {
      alert("No hay reportes para descargar");
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
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // --- ¡ESTA ES LA FUNCIÓN QUE FALTABA! ---
  const handleSaveAndDownloadPDF = async (reporte) => {
    setFormMessage({ type: 'info', text: `Generando y descargando PDF para reporte ${reporte.reporte_id}...` });
    console.log(`[PDF] Iniciando descarga para reporte ${reporte.reporte_id}`);

    try {
      // 1. Llamar al endpoint, pidiendo un 'blob' (archivo)
      const response = await axiosPrivate.get(
        `/reportes/generar-pdf/${reporte.reporte_id}`,
        {
          responseType: 'blob', // Clave: le dice a axios que espere un archivo
        }
      );
      
      console.log("[PDF] Respuesta recibida del servidor.");

      // 2. Extraer el nombre del archivo (DE FORMA SEGURA)
      const contentDisposition = response.headers['content-disposition'];
      let filename = `reporte_${reporte.reporte_id}.pdf`; // Nombre por defecto

      if (contentDisposition) {
          console.log("[PDF] Content-Disposition encontrado:", contentDisposition);
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, ''); 
              console.log("[PDF] Nombre de archivo extraído:", filename);
          } else {
              console.warn("[PDF] No se pudo extraer el nombre del archivo del header.");
          }
      } else {
          console.warn("[PDF] ADVERTENCIA: El encabezado 'Content-Disposition' no fue encontrado.");
          console.warn("Asegúrate de que 'exposeHeaders: [\"Content-Disposition\"]' esté en tu 'app.js' de CORS.");
      }

      // 3. Crear un enlace en memoria para descargar el 'blob'
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      
      console.log(`[PDF] Simulando clic para descargar: ${filename}`);
      link.click();

      // 4. Limpiar
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setFormMessage({ type: 'success', text: `¡PDF ${filename} descargado!` });

    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      
      if (error.response && error.response.data.type === 'application/json') {
          const reader = new FileReader();
          reader.onload = () => {
              const errorJson = JSON.parse(reader.result);
              console.error("Error del servidor (convertido de blob):", errorJson);
              setFormMessage({ type: 'error', text: `Error del servidor: ${errorJson.message}` });
          };
          reader.readAsText(error.response.data);
      } else {
          setFormMessage({ type: 'error', text: "Error al descargar el PDF." });
      }
    }
  };

  // Estilo para la fila de estadísticas
  const statRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee'
  };
  
  // Estilo para la predicción
  const prediccionCardStyle = {
      background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
      color: 'white',
      borderRadius: '8px',
      padding: '1.5rem 2rem',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0, 86, 179, 0.3)'
  };


  // --- Renderizado ---
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: 'auto' }}>
      <h1>Dashboard de Reportes</h1>

      {/* --- SECCIÓN DE PREDICCIÓN --- */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Predicción del Próximo Mes</h2>
        {loadingPrediccion ? (
          <p>Calculando predicción...</p>
        ) : prediccion ? (
          <div style={prediccionCardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 300 }}>{prediccion.mes_predicho}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              {prediccion.visitas_predichas}
            </div>
            <span style={{ fontSize: '1rem', opacity: 0.8 }}>Citas/Visitas estimadas</span>
          </div>
        ) : (
          <p>No se pudo calcular la predicción.</p>
        )}
      </div>

      {/* --- SECCIÓN DE ESTADÍSTICAS --- */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Estadísticas Generales (Citas Confirmadas)</h2>
        {loadingStats ? (
          <p>Cargando estadísticas...</p>
        ) : errorStats ? (
          <p style={{ color: 'red' }}>{errorStats}</p>
        ) : stats ? (
          <>
            {/* --- Análisis de Afluencia --- */}
            <h3 style={{ marginTop: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
              Análisis de Afluencia
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <StatCard title="Promedio de Citas (Media)">
                <div style={statRowStyle}>
                  <strong>Por Día:</strong> 
                  <span>{stats.estadisticasVisitas.mediaPorDia} citas</span>
                </div>
                <div style={statRowStyle}>
                  <strong>Por Semana:</strong> 
                  <span>{stats.estadisticasVisitas.mediaPorSemana} citas</span>
                </div>
                <div style={statRowStyle}>
                  <strong>Por Mes:</strong> 
                  <span>{stats.estadisticasVisitas.mediaPorMes} citas</span>
                </div>
              </StatCard>
              <StatCard title="Afluencia (Moda)">
                 <div style={statRowStyle}>
                  <strong>Día más concurrido:</strong> 
                  <span>{stats.estadisticasVisitas.modaDiaSemana}</span>
                </div>
                <div style={statRowStyle}>
                  <strong>Hora más concurrida:</strong> 
                  <span>{stats.estadisticasVisitas.modaHora}</span>
                </div>
              </StatCard>
              <StatCard title="Punto Medio (Mediana)">
                <div style={statRowStyle}>
                  <strong>Mediana de Citas/Día:</strong> 
                  <span>{stats.estadisticasVisitas.medianaVisitas}</span>
                </div>
                 <div style={statRowStyle}>
                  <strong>Total de Citas:</strong> 
                  <span>{stats.estadisticasVisitas.totalVisitas}</span>
                </div>
              </StatCard>
            </div>

            {/* --- Análisis de Visitantes --- */}
            <h3 style={{ marginTop: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
              Análisis de Visitantes
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <StatCard title="Top 5 Empresas Visitantes">
                {stats.topEmpresas && stats.topEmpresas.length > 0 ? (
                  stats.topEmpresas.map((item, index) => (
                    <div key={index} style={statRowStyle}>
                      <span>{index + 1}. {item.empresa}</span>
                      <strong>{item.cantidad}</strong>
                    </div>
                  ))
                ) : ( <p>No hay datos de empresas.</p> )}
              </StatCard>
              <StatCard title="Top 5 Divisiones (Creadores)">
                {stats.topDivisiones && stats.topDivisiones.length > 0 ? (
                  stats.topDivisiones.map((item, index) => (
                    <div key={index} style={statRowStyle}>
                      <span>{index + 1}. {item.division}</span>
                      <strong>{item.cantidad}</strong>
                    </div>
                  ))
                ) : ( <p>No hay datos de divisiones.</p> )}
              </StatCard>
              <StatCard title="Top 5 Tipos de Visitante">
                {stats.topTipoVisitante && stats.topTipoVisitante.length > 0 ? (
                  stats.topTipoVisitante.map((item, index) => (
                    <div key={index} style={statRowStyle}>
                      <span>{index + 1}. {item.tipo_visitante}</span>
                      <strong>{item.cantidad}</strong>
                    </div>
                  ))
                ) : ( <p>No hay datos de tipos.</p> )}
              </StatCard>
            </div>
          </>
        ) : (
          <p>No hay datos de estadísticas disponibles.</p>
        )}
      </div>
      
      {/* --- SECCIÓN 3: CREAR REPORTE --- */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Crear Nuevo Reporte (Automático)</h2>
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="id_cita">Cita Asociada (La fecha se registrará automáticamente):</label>
              {loadingCitas ? (
                <p>Cargando citas...</p>
              ) : (
                <select
                  id="id_cita"
                  name="id_cita"
                  value={formData.id_cita}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">-- Seleccione una cita --</option>
                  {citas.map(cita => (
                    <option key={cita.id} value={cita.id}>
                      (ID: {cita.id}) - {cita.motivo} - {cita.fecha_inicio}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <button type="submit" style={{ padding: '10px 15px' }}>
            Guardar Reporte de Hoy
          </button>
          {formMessage.text && (
            <p style={{ color: formMessage.type === 'info' ? 'blue' : (formMessage.type === 'error' ? 'red' : 'green'), marginTop: '1rem' }}>
              {formMessage.text}
            </p>
          )}
        </form>
      </div>

      {/* --- SECCIÓN 4: TABLA DE REPORTES --- */}
      <div style={{ padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Reportes de Acceso Existentes</h2>
          <button onClick={handleDownloadCSV} style={{ padding: '10px 15px' }}>
            Descargar todo (CSV)
          </button>
        </div>
        
        {loadingReportes ? (
          <p>Cargando reportes...</p>
        ) : errorReportes ? (
          <p style={{ color: 'red' }}>{errorReportes}</p>
        ) : reportes.length === 0 ? (
          <p>No hay reportes para mostrar.</p>
        ) : (
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '8px' }}>ID Reporte</th>
                <th style={{ padding: '8px' }}>Fecha Acceso</th>
                <th style={{ padding: '8px' }}>Motivo Cita</th>
                <th style={{ padding: '8px' }}>Usuario (Creador)</th>
                <th style={{ padding: '8px' }}>Correo</th>
                <th style={{ padding: '8px' }}>Tipo Usuario</th>
                <th style={{ padding: '8px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((reporte) => (
                <tr key={reporte.reporte_id}>
                  <td style={{ padding: '8px' }}>{reporte.reporte_id}</td>
                  <td style={{ padding: '8px' }}>
                    {new Date(reporte.fecha_reporte).toLocaleString('es-MX', { 
                      year: 'numeric', month: '2-digit', day: '2-digit', 
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </td>
                  <td style={{ padding: '8px' }}>{reporte.motivo_cita}</td>
                  <td style={{ padding: '8px' }}>{reporte.nombre_usuario}</td>
                  <td style={{ padding: '8px' }}>{reporte.correo_usuario}</td>
                  <td style={{ padding: '8px' }}>{reporte.tipo_usuario}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleSaveAndDownloadPDF(reporte)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      title="Guardar y Descargar PDF"
                    >
                      Descargar PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
    </div>
  );
};

export default Reportes;