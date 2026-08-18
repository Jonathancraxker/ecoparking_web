import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  
  const userRole = user?.tipo_usuario || 'Usuario';

  const modulos = [
    {
      title: 'Mis Citas',
      description: 'Consulta, registra y gestiona tus reservas de estacionamiento.',
      icon: 'bi-calendar-event',
      color: 'btn-primary',
      link: '/mis_citas',
      badge: 'Agenda',
      roles: ['Juca', 'Administrativo', 'Profesor']
    },
    {
      title: 'Código QR',
      description: 'Visualiza y valida los códigos de acceso de tus citas activas.',
      icon: 'bi-qr-code-scan',
      color: 'btn-primary',
      link: '/codigo',
      badge: 'Accesos',
      roles: ['Juca', 'Administrativo', 'Profesor']
    },
    {
      title: 'Cajones Disponibles',
      description: 'Verifica los espacios libres antes de realizar tu reserva.',
      icon: 'bi-car-front',
      color: 'btn-primary',
      link: '/autos',
      badge: 'Consulta',
      roles: ['Juca', 'Administrativo', 'Profesor']
    },
    {
      title: 'Estado de Cajones',
      description: 'Consulta la ocupación y disponibilidad de los cajones de estacionamiento.',
      icon: 'bi-geo-alt',
      color: 'btn-primary',
      link: '/estado_cajones',
      badge: 'Consulta',
      roles: ['Juca', 'Administrativo', 'Profesor']
    },
    {
      title: 'Gestión de Citas',
      description: 'Administra todas las reservas del sistema y genera accesos.',
      icon: 'bi-journal-text',
      color: 'btn-primary',
      link: '/crud_citas',
      badge: 'Agenda',
      roles: ['Juca']
    },
    {
      title: 'Usuarios',
      description: 'Administra perfiles de usuarios, asigna roles y controla accesos.',
      icon: 'bi-people',
      color: 'btn-primary',
      link: '/crud_usuarios',
      badge: 'Gestión',
      roles: ['Juca']
    },
    {
      title: 'Gestión de Cajones',
      description: 'Configura el catálogo de cajones y el estado del estacionamiento.',
      icon: 'bi-p-circle',
      color: 'btn-primary',
      link: '/crud_cajones',
      badge: 'Inventario',
      roles: ['Juca']
    },
    {
      title: 'Estadísticas',
      description: 'Analiza el uso del estacionamiento, horas pico y reportes gráficos.',
      icon: 'bi-bar-chart-line',
      color: 'btn-primary',
      link: '/estadisticas',
      badge: 'Análisis',
      roles: ['Juca']
    },
    {
      title: 'Términos de Uso',
      description: 'Consulta la normativa institucional sobre el uso del estacionamiento.',
      icon: 'bi-file-text',
      color: 'btn-primary',
      link: '/terminos',
      badge: 'Informativo',
      roles: ['Juca', 'Administrativo', 'Profesor']
    }
  ];

  // Filtramos los módulos dependiendo del rol del usuario logueado
  const modulosVisibles = modulos.filter((modulo) => modulo.roles.includes(userRole));

  return (
    <div className="container text-start py-5">
      <div className="card border-0 bg-dark text-white rounded-4 p-4 p-md-5 mb-4 shadow-sm">
        <div className="col-lg-8">
          <h1 className="display-6 fw-bold mb-2">
            ¡Bienvenido, {user?.nombre?.split(' ')[0] || 'Usuario'}!
          </h1>
          <p className="lead text-white-50 mb-0">
            Selecciona el módulo al que deseas acceder para gestionar el estacionamiento.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {modulosVisibles.map((modulo, index) => (
          <div className="col-12 col-md-6 col-lg-4" key={index}>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <i className={`bi ${modulo.icon} fs-1 text-dark`}></i>
                  <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                    {modulo.badge}
                  </span>
                </div>
                <h2 className="h5 fw-bold text-dark mb-2">{modulo.title}</h2>
                <p className="text-muted small mb-4">{modulo.description}</p>
              </div>

              <Link to={modulo.link} className={`btn ${modulo.color} rounded-pill w-100 fw-semibold`}>
                Ingresar al módulo &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}