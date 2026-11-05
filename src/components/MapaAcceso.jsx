// src/components/MapaAcceso.jsx
// Muestra el diseño de un acceso (SVG exportado de Figma) y pinta cada cajón
// según su estado en la base de datos. No necesita peticiones nuevas:
// usa el GET /api/cajones que ya existe (getTodosCajones).
//
// Requisitos:
//  1. Guardar los SVG en src/assets/accesos/acceso1.svg, acceso2.svg, acceso3.svg
//     (exportados de Figma con "Include id attribute" activado).
//  2. En Figma, el rectángulo de cada cajón se llama cajon-<numero_cajon>,
//     por ejemplo cajon-A1-01, y en la BD numero_cajon = 'A1-01'.
//
// Uso (por ejemplo en src/pages/Automoviles.jsx):
//   import MapaAcceso from '../components/MapaAcceso';
//   const [vista, setVista] = useState('general');
//   <button onClick={() => setVista('general')}>General</button>
//   <button onClick={() => setVista(1)}>Acceso 1</button>
//   <button onClick={() => setVista(2)}>Acceso 2</button>
//   <button onClick={() => setVista(3)}>Acceso 3</button>
//   {vista === 'general' ? (/* mapa actual */) : <MapaAcceso acceso={vista} />}
//
// Nota: en el mapa general actual, filtrar los cajones de los accesos para que
// no se mezclen con la Zona A:
//   cajones.filter(c => !/^A[123]-/.test(c.numero_cajon))

import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { getTodosCajones } from '../api/cajones';
import acceso1 from '../assets/accesos/acceso1.svg?raw';
import acceso2 from '../assets/accesos/acceso2.svg?raw';
import acceso3 from '../assets/accesos/acceso3.svg?raw';

const SVGS = { 1: acceso1, 2: acceso2, 3: acceso3 };

const COLORES = {
  Disponible: '#2ecc71',
  Ocupado: '#e74c3c',
  Mantenimiento: '#f1c40f',
};

export default function MapaAcceso({ acceso }) {
  const ref = useRef(null);
  const [cajones, setCajones] = useState([]);
  const [error, setError] = useState(null);

  // 1. Traer los cajones (una sola vez)
  useEffect(() => {
    getTodosCajones()
      .then(setCajones)
      .catch(() => setError('No se pudieron cargar los cajones'));
  }, []);

  // 2. Pintar los cajones de este acceso cada vez que cambian los datos o el acceso
  useEffect(() => {
    const cont = ref.current;
    if (!cont) return;

    // Que el SVG se ajuste al ancho del contenedor
    const svg = cont.querySelector('svg');
    if (svg) {
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width = '100%';
      svg.style.height = 'auto';
    }

    // Primero todos en gris: si un cajón del diseño no está en la BD, no debe verse "disponible"
    cont.querySelectorAll('[id^="cajon-"]').forEach(el => {
      const figura = el.tagName === 'g' ? el.querySelector('rect, path') : el;
      if (figura) figura.style.fill = '#95a5a6';
    });

    const prefijo = `A${acceso}-`;
    cajones
      .filter(c => c.numero_cajon?.startsWith(prefijo))
      .forEach(c => {
        const el = cont.querySelector(`[id="cajon-${c.numero_cajon}"]`);
        if (!el) return; // el cajón existe en la BD pero no en el diseño

        // Si Figma exportó un grupo, se pinta la figura de adentro
        const figura = el.tagName === 'g' ? el.querySelector('rect, path') : el;
        if (figura) figura.style.fill = COLORES[c.estado] || '#95a5a6';
        // Los de discapacidad conservan un borde azul para identificarlos
        if (figura && c.zona === 'Discapacitados') {
          figura.style.stroke = '#0082CA';
          figura.style.strokeWidth = '3';
        }

        el.style.cursor = 'pointer';
        el.onclick = () =>
          Swal.fire({
            title: `Cajón ${c.numero_cajon}`,
            html: `Estado: <b>${c.estado}</b><br>Zona: ${c.zona}`,
            icon: c.estado === 'Disponible' ? 'success' : c.estado === 'Ocupado' ? 'error' : 'warning',
          });
      });
  }, [cajones, acceso]);

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex gap-3 mb-2 small">
        <span><span style={{ color: COLORES.Disponible }}>■</span> Disponible</span>
        <span><span style={{ color: COLORES.Ocupado }}>■</span> Ocupado</span>
        <span><span style={{ color: COLORES.Mantenimiento }}>■</span> Mantenimiento</span>
      </div>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: SVGS[acceso] }} />
    </div>
  );
}
