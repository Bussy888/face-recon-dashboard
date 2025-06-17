// src/routes/PrivateRoutes.jsx
import { Route, Navigate, Outlet } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import GestionRoles from '../pages/GestionRoles';
import AgregarEmpleado from '../pages/AgregarEmpleado';
import CrearRol from '../pages/CrearRol';
import EditarRol from '../pages/EditarRol';
import EditarEmpleado from '../pages/EditarEmpleado';
import GestionCuotas from '../pages/GestionCuotas';
import GestionEventos from '../pages/GestionEventos';
import CrearEvento from '../pages/CrearEvento';
import GestionSocios from '../pages/GestionSocios';
import RegistrarSocio from '../pages/RegistrarSocio';
import EditarSocio from '../pages/EditarSocio';

import { useUserStore } from '../store/useUserStore';

const RequireAuth = () => {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Envolver con Layout si el usuario está autenticado
  return <Layout user={user}><Outlet /></Layout>;
};

const PrivateRoutes = [
  <Route key="private" element={<RequireAuth />}>
    <Route path="/" element={<Home />} />
    <Route path="/gestion-roles" element={<GestionRoles />} />
    <Route path="/agregar-empleado" element={<AgregarEmpleado />} />
    <Route path="/crear-rol" element={<CrearRol />} />
    <Route path="/editar-rol/:id_rol" element={<EditarRol />} />
    <Route path="/editar-empleado/:correo" element={<EditarEmpleado />} />
    <Route path="/gestion-cuotas" element={<GestionCuotas />} />
    <Route path="/gestion-eventos" element={<GestionEventos />} />
    <Route path="/crear-evento" element={<CrearEvento />} />
    <Route path="/editar-evento/:id" element={<CrearEvento />} />
    <Route path="/gestion-estudiante" element={<GestionSocios />} />
    <Route path="/registrar-estudiante" element={<RegistrarSocio />} />
    <Route path="/editar-estudiante/:codigo" element={<EditarSocio />} />
  </Route>,
];

export default PrivateRoutes;
