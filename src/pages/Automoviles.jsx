import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import mapaUteq from '../assets/images/mapa-uteq-2.png';
import { getTodosCajones } from '../api/cajones';

export default function Automoviles() {
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [cajones, setCajones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rutas por zona (desde entrada principal)
  const getRutaByZona = (zona) => {
    const rutas = {
      'A': "M 180 40 L 240 40 L 240 160 L 240 210",
      'B': "M 180 40 L 240 40 L 240 160 L 260 160 L 260 210",
      'C': "M 180 40 L 240 40 L 240 160 L 300 160 L 300 210",
      'D': "M 180 40 L 240 40 L 240 160 L 350 160 L 350 210",
    };
    return rutas[zona] || "M 320 580 L 320 450 L 200 450 L 200 300";
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Disponible': return '#2ecc71';
      case 'Ocupado': return '#e74c3c';
      case 'Mantenimiento': return '#f1c40f';
      default: return '#95a5a6';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'Disponible': return 'DISPONIBLE';
      case 'Ocupado': return 'OCUPADO';
      case 'Mantenimiento': return 'MANTENIMIENTO';
      default: return estado?.toUpperCase() || 'DESCONOCIDO';
    }
  };

  // Contar cajones por zona y estado
  const getZonaStats = (zona) => {
    const cajonesZona = cajones.filter(c => c.numero_cajon.startsWith(zona));
    return {
      total: cajonesZona.length,
      disponibles: cajonesZona.filter(c => c.estado === 'Disponible').length,
      ocupados: cajonesZona.filter(c => c.estado === 'Ocupado').length,
      mantenimiento: cajonesZona.filter(c => c.estado === 'Mantenimiento').length,
    };
  };

  // Cambiar handleZonaClick por handleCajonClick
  const handleCajonClick = (cajon) => {
    // Obtener la zona del cajón (primera letra del número)
    const zona = cajon.numero_cajon.charAt(0);
    
    // Verificar el estado del cajón con SweetAlert2
    if (cajon.estado === 'Ocupado') {
      Swal.fire({
        icon: 'error',
        title: 'Cajón Ocupado',
        text: 'El estacionamiento actualmente se encuentra ocupado.',
        confirmButtonColor: '#e74c3c', // Rojo como en tu getEstadoColor
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    if (cajon.estado === 'Mantenimiento') {
      Swal.fire({
        icon: 'warning',
        title: 'En Mantenimiento',
        text: 'Lo sentimos, por el momento este cajón se encuentra en mantenimiento.',
        confirmButtonColor: '#f1c40f', // Amarillo como en tu getEstadoColor
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    // Si está disponible, mostrar la ruta de su zona
    setZonaSeleccionada(zona);
  };

  const limpiarRuta = () => {
    setZonaSeleccionada(null);
  };

  // Definir zonas disponibles
  const zonas = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    const cargarCajones = async () => {
      try {
        setLoading(true);
        const datos = await getTodosCajones();
        setCajones(datos);
      } catch (err) {
        setError('Error al cargar los cajones');
      } finally {
        setLoading(false);
      }
    };
    cargarCajones();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando información de cajones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', backgroundColor: '#fee', padding: '20px', borderRadius: '10px' }}>
          <p style={{ color: '#c33' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#fdfdfd', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', color: '#1a3a3a', margin: '0' }}>EcoParking UTEQ</h1>
        <p style={{ fontSize: '14px', color: '#888' }}>
          {cajones.length} cajones registrados • Haz clic en una zona para visualizar la ruta de acceso.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Panel izquierdo: Mapa */}
        <div style={{ 
          flex: '2', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '15px', 
          position: 'relative',
          height: '550px',
          overflow: 'hidden',
          border: '1px solid #ddd',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <img 
            src={mapaUteq} 
            alt="Mapa UTEQ" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', opacity: 0.9 }} 
          />
          <svg viewBox="0 0 800 600" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
            {zonaSeleccionada && (
              <path 
                d={getRutaByZona(zonaSeleccionada)} 
                fill="none" 
                stroke="#4285F4" 
                strokeWidth="6" 
                strokeLinecap="round"
                strokeDasharray="15, 10"
                className="ruta-animada"
              />
            )}
          </svg>
          <div style={{ position: 'absolute', bottom: '510px', left: '10%', zIndex: 20, backgroundColor: '#1a3a3a', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>
            ENTRADA PRINCIPAL
          </div>
        </div>

        {/* Panel derecho: Zonas (estilo como estaban los cajones) */}
        <div style={{ flex: '0.8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '18px', color: '#34495e', marginBottom: '5px' }}>Zonas de Estacionamiento</h2>
          
          {zonas.map(zona => {
            const stats = getZonaStats(zona);
            const estaSeleccionada = zonaSeleccionada === zona;
            
            return (
              <div 
                key={zona}
                style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '15px', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  backgroundColor: estaSeleccionada ? '#eef6ff' : '#fff',
                  border: estaSeleccionada ? '2px solid #4285F4' : '1px solid #eee',
                  borderLeft: `6px solid ${stats.disponibles > 0 ? '#2ecc71' : (stats.ocupados > 0 ? '#e74c3c' : '#f1c40f')}`,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}
                title={`Zona ${zona} - ${stats.disponibles} disponibles, ${stats.ocupados} ocupados`}
              >
                <div>
                  <span style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '16px' }}>
                    Zona {zona}
                  </span>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    {stats.disponibles} disponibles · {stats.ocupados} ocupados
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '4px',
                  backgroundColor: '#f8f9fa',
                  padding: '4px 8px',
                  borderRadius: '20px'
                }}>
                  <span style={{ color: '#2ecc71', fontSize: '12px' }}>🟢 {stats.disponibles}</span>
                  <span style={{ color: '#e74c3c', fontSize: '12px' }}>🔴 {stats.ocupados}</span>
                </div>
              </div>
            );
          })}
          
          {zonaSeleccionada && (
            <button 
              onClick={limpiarRuta}
              style={{ 
                marginTop: '10px', 
                padding: '12px', 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                color: '#666'
              }}
            >
              Limpiar ruta
            </button>
          )}
        </div>
      </div>

      {/* Cajones por zona (estilo cine) */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '18px', color: '#34495e', marginBottom: '20px' }}>Distribución de Cajones</h2>
        
        {zonas.filter(z => getZonaStats(z).total > 0).map(zona => {
          const cajonesZona = cajones.filter(c => c.numero_cajon.startsWith(zona));
          
          return (
            <div key={zona} style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '16px', color: '#2c3e50', marginBottom: '12px', paddingLeft: '4px', borderLeft: `3px solid #4285F4` }}>
                Zona {zona}
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                {cajonesZona.map(cajon => (
                  <div
                    key={cajon.id}
                    onClick={() => handleCajonClick(cajon)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '70px',
                      padding: '10px 8px',
                      backgroundColor: getEstadoColor(cajon.estado),
                      borderRadius: '8px',
                      cursor: cajon.estado === 'Disponible' ? 'pointer' : 'not-allowed',
                      opacity: cajon.estado === 'Disponible' ? 1 : 0.7,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    title={`${cajon.numero_cajon} - ${getEstadoTexto(cajon.estado)}`}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L6 9H18L19 13H5Z" stroke="white" strokeWidth="1.2" fill="white" fillOpacity="0.9"/>
                      <rect x="4" y="13" width="16" height="3" fill="white" fillOpacity="0.9"/>
                      <circle cx="8" cy="16" r="1.5" fill="white"/>
                      <circle cx="16" cy="16" r="1.5" fill="white"/>
                    </svg>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', marginTop: '6px' }}>
                      {cajon.numero_cajon}
                    </span>
                    <span style={{ fontSize: '9px', color: 'white', opacity: 0.9 }}>
                      {getEstadoTexto(cajon.estado)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Google Maps iframe */}
      <div style={{ 
        marginTop: '32px',
        borderRadius: '12px', 
        overflow: 'hidden',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <iframe 
          title="Ubicación UTEQ"
          src="https://maps.google.com/maps?q=Universidad+Tecnológica+de+Querétaro&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderTop: '1px solid #e9ecef' }}>
          <div style={{ fontWeight: '500', color: '#212529', fontSize: '14px' }}>Universidad Tecnológica de Querétaro</div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>Av. Pie de la Cuesta No. 2501, Col. Unidad Nacional, 76148 Santiago de Querétaro, Qro.</div>
          <a 
            href="https://maps.google.com/?q=Universidad+Tecnológica+de+Querétaro" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: '12px', color: '#4285F4', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}
          >
            Abrir en Google Maps →
          </a>
        </div>
      </div>

      <style>{`
        .ruta-animada {
          animation: dash 2s linear infinite;
        }
        @keyframes dash {
          to { stroke-dashoffset: -25; }
        }
      `}</style>
    </div>
  );
}