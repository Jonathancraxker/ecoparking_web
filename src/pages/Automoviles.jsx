import React, { useState } from 'react';

export default function Automoviles() {
  // Datos simulados de los cajones para el panel derecho
  const [cajones] = useState([
    { id: 1, num: "A-01", estatus: "disponible" },
    { id: 2, num: "A-02", estatus: "ocupado" },
    { id: 3, num: "B-05", estatus: "disponible" },
    { id: 4, num: "C-02", estatus: "mantenimiento" },
  ]);

  // URL de Google Maps centrada en la UTEQ (basada en tus coordenadas)
  // Esta URL usa el modo 'place' que es más estable para embeber
  const googleMapsUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3734.053535265089!2d-100.409489124269!3d20.654142719833878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d346436363880d%3A0x99272827e3c85418!2sUniversidad%20Tecnol%C3%B3gica%20de%20Quer%C3%A9taro!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx";

  return (
    <div style={{ padding: '20px', backgroundColor: '#fdfdfd', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', color: '#1a3a3a', margin: '0' }}>EcoParking UTEQ</h1>
        <p style={{ fontSize: '14px', color: '#888', margin: '5px 0' }}>Consulta la ubicación física de tu cajón y su disponibilidad.</p>
      </header>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* PANEL IZQUIERDO: MAPA DE UBICACIONES */}
        <div style={{ 
          flex: '2', 
          backgroundColor: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          border: '1px solid #eee'
        }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee' }}>
            <h2 style={{ fontSize: '18px', color: '#34495e', margin: '0' }}>Mapa de Ubicaciones</h2>
          </div>
          <div style={{ height: '500px', width: '100%' }}>
            <iframe
              src={googleMapsUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa UTEQ"
            ></iframe>
          </div>
        </div>

        {/* PANEL DERECHO: ESTADO ACTUAL */}
        <div style={{ 
          flex: '0.8', 
          backgroundColor: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          padding: '20px',
          border: '1px solid #eee'
        }}>
          <h2 style={{ fontSize: '18px', color: '#34495e', marginTop: '0', marginBottom: '20px' }}>Estado Actual</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cajones.map((cajon) => (
              <div 
                key={cajon.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  border: '1px solid #f0f0f0',
                  borderLeft: `5px solid ${
                    cajon.estatus === 'disponible' ? '#2ecc71' : 
                    cajon.estatus === 'ocupado' ? '#e74c3c' : '#f1c40f'
                  }`
                }}
              >
                <span style={{ fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>Cajón {cajon.num}</span>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  color: cajon.estatus === 'disponible' ? '#2ecc71' : cajon.estatus === 'ocupado' ? '#e74c3c' : '#f39c12',
                  backgroundColor: cajon.estatus === 'disponible' ? '#eafaf1' : cajon.estatus === 'ocupado' ? '#fdedec' : '#fef9e7',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {cajon.estatus.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}