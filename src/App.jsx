import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login'; 
import Registro from './pages/Registro';
import Codigo_qr from './pages/Codigo_qr';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Crud_Usuarios from './pages/CRUD_usuarios';
import Not_Found from './pages/Not_Found';
import Crud_Citas from './pages/Crud_Citas';
import Mis_Citas from './pages/Mis_Citas';
import Admin_Route from './components/Admin_Route';

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Login />} /> 
      <Route path="/registro" element={<Registro />} />

      {/* Rutas Privadas (protegidas por el login) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/codigo" element={<Codigo_qr />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mis_citas" element={<Mis_Citas />} />
      </Route>
      {/* Para acciones que solo realiza el usuario Juca */}
      <Route element={<Admin_Route />}>
        <Route path="/crud_citas" element={<Crud_Citas />} />
        <Route path="/crud_usuarios" element={<Crud_Usuarios />} />
      </Route>
      {/* RUTA 404 */}
        <Route path="*" element={<Not_Found />} />
    </Routes>
  );
}

export default App;