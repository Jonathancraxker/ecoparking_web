import React, { useState, useEffect } from 'react';
import { getTodosCajones } from '../api/cajones';

export default function EstadoCajones() {
  const [cajones, setCajones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Disponible': return '#10b981';
      case 'Ocupado': return '#ef4444';
      case 'Mantenimiento': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'Disponible': return 'Disponible';
      case 'Ocupado': return 'Ocupado';
      case 'Mantenimiento': return 'Mantenimiento';
      default: return estado;
    }
  };

  const estadisticas = {
    total: cajones.length,
    disponibles: cajones.filter(c => c.estado === 'Disponible').length,
    ocupados: cajones.filter(c => c.estado === 'Ocupado').length,
    mantenimiento: cajones.filter(c => c.estado === 'Mantenimiento').length,
  };

  const cajonesFiltrados = cajones.filter(c => filtro === 'todos' || c.estado === filtro);
  const cajonesPorZona = cajonesFiltrados.reduce((acc, c) => {
    const zona = c.numero_cajon.charAt(0);
    if (!acc[zona]) acc[zona] = [];
    acc[zona].push(c);
    return acc;
  }, {});

  useEffect(() => {
    const cargar = async () => {
      try {
        const datos = await getTodosCajones();
        setCajones(datos);
      } catch (err) {
        setError('Error al cargar los cajones');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Cargando...</p>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p style={{ color: '#ef4444' }}>{error}</p>
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#111827', margin: '0 0 8px 0' }}>
          Estado de Cajones
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          {estadisticas.total} cajones totales
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ padding: '12px 20px', backgroundColor: '#f9fafb', borderRadius: '8px', minWidth: '100px' }}>
          <div style={{ fontSize: '28px', fontWeight: '500', color: '#111827' }}>{estadisticas.disponibles}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Disponibles</div>
        </div>
        <div style={{ padding: '12px 20px', backgroundColor: '#f9fafb', borderRadius: '8px', minWidth: '100px' }}>
          <div style={{ fontSize: '28px', fontWeight: '500', color: '#111827' }}>{estadisticas.ocupados}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Ocupados</div>
        </div>
        <div style={{ padding: '12px 20px', backgroundColor: '#f9fafb', borderRadius: '8px', minWidth: '100px' }}>
          <div style={{ fontSize: '28px', fontWeight: '500', color: '#111827' }}>{estadisticas.mantenimiento}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Mantenimiento</div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
        {['todos', 'Disponible', 'Ocupado', 'Mantenimiento'].map(tipo => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            style={{
              padding: '6px 16px',
              background: 'none',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              color: filtro === tipo ? '#111827' : '#6b7280',
              fontWeight: filtro === tipo ? '500' : '400',
              borderBottom: filtro === tipo ? '2px solid #111827' : 'none',
              marginBottom: '-13px',
            }}
          >
            {tipo === 'todos' ? 'Todos' : tipo}
          </button>
        ))}
      </div>

      {/* Grid de cajones por zona */}
      {Object.keys(cajonesPorZona).sort().map(zona => (
        <div key={zona} style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '16px' }}>
            Zona {zona}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '12px',
            maxWidth: '600px',
          }}>
            {cajonesPorZona[zona].map(cajon => (
              <div
                key={cajon.id}
                style={{
                  padding: '12px 8px',
                  backgroundColor: getEstadoColor(cajon.estado),
                  borderRadius: '6px',
                  textAlign: 'center',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '500',
                  opacity: cajon.estado === 'Disponible' ? 1 : 0.85,
                }}
              >
                {cajon.numero_cajon}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Leyenda simplificada */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Disponible</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Ocupado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Mantenimiento</span>
        </div>
      </div>
    </div>
  );
}