import { Link } from 'react-router-dom';

export default function Terminos_y_Condiciones() {
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4 fw-bold text-dark">Términos y Condiciones de Uso</h2>
                            <p className="text-muted text-center mb-4">Última actualización: Agosto de 2026</p>
                            
                            <hr className="mb-4" />

                            <h5 className="fw-bold text-secondary mb-3">1. Aceptación de los Términos</h5>
                            <p className="text-muted">
                                Al acceder y utilizar la plataforma <strong>EcoParking</strong>, usted acepta cumplir y estar sujeto a los presentes Términos y Condiciones. Este sistema está destinado exclusivamente para la gestión y control de accesos vehiculares dentro de la comunidad institucional.
                            </p>

                            <h5 className="fw-bold text-secondary mb-3 mt-4">2. Privacidad y Seguridad Institucional (Protección de Datos UTEQ)</h5>
                            <p className="text-muted">
                                En cumplimiento con las normativas de seguridad de la información de la <strong>Universidad Tecnológica de Querétaro (UTEQ)</strong>, garantizamos que el uso, almacenamiento y procesamiento de los datos personales y vehiculares (incluyendo el registro de <strong>matrículas</strong>) es estrictamente confidencial y seguro.
                            </p>
                            <p className="text-muted">
                                La información proporcionada sobre matrículas e invitados se utiliza de manera exclusiva para el control de acceso a los cajones de estacionamiento, validación mediante códigos QR y la generación de reportes operativos internos, salvaguardando en todo momento la integridad digital de la institución.
                            </p>

                            <h5 className="fw-bold text-secondary mb-3 mt-4">3. Responsabilidad del Usuario</h5>
                            <p className="text-muted">
                                El usuario (personal administrativo, profesor o "Juca") es responsable de mantener la seguridad de sus credenciales de acceso y de los códigos QR generados para sus invitados. Queda prohibida la transferencia de códigos QR a terceros no autorizados.
                            </p>

                            <h5 className="fw-bold text-secondary mb-3 mt-4">4. Control y Disponibilidad de Cajones</h5>
                            <p className="text-muted">
                                EcoParking gestiona la disponibilidad de los cajones de estacionamiento en tiempo real. El uso indebido de los cajones asignados o el incumplimiento de las normativas de tránsito internas de la UTEQ podrá resultar en la restricción temporal o definitiva de los permisos en el sistema.
                            </p>

                            <h5 className="fw-bold text-secondary mb-3 mt-4">5. Modificaciones del Servicio</h5>
                            <p className="text-muted">
                                Nos reservamos el derecho de actualizar o modificar estos términos en cualquier momento para reflejar mejoras tecnológicas, normativas internas de la universidad o requerimientos operativos.
                            </p>

                            <div className="text-center mt-5">
                                <Link to="/mis_citas" className="btn btn-primary px-4">
                                    <i className="bi bi-arrow-left me-2"></i> Volver a la Aplicación
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}