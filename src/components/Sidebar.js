import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useUserStore } from '../store/useUserStore';
import { obtenerPermisosPorRol } from '../services/permisosService';
const Sidebar = ({ className, user, closeSidebar }) => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const { clearUser } = useUserStore();
  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        clearUser(); // <-- Aquí usas Zustand
        navigate('/login');
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  };

  const fetchPermissions = async () => {
  if (user?.rol_id) {
    try {
      const permisos = await obtenerPermisosPorRol(user.rol_id); // uso del servicio
      setPermissions(permisos);
    } catch (error) {
      console.error('Error al obtener permisos:', error);
    }
  }
};

  useEffect(() => {
    fetchPermissions();
  }, [user]);

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  return (
    <div className={className}>
      <img src="Logo-Text-Transmite.png" alt="Logo" className="logo" />
      <ul>
        <li>
          <Link to="/" className="sidebar-btn" onClick={closeSidebar}>Inicio</Link>
        </li>

        {hasPermission('gestion-socios') && (
          <li>
            <Link to="/gestion-socios" className="sidebar-btn" onClick={closeSidebar}>Gestión de Estudiantes</Link>
          </li>
        )}

        {hasPermission('gestion-cuotas') && (
          <li>
            <Link to="/gestion-cuotas" className="sidebar-btn" onClick={closeSidebar}>Gestión de Cuotas</Link>
          </li>
        )}

        {hasPermission('gestion-eventos') && (
          <li>
            <Link to="/gestion-eventos" className="sidebar-btn" onClick={closeSidebar}>Gestión de Eventos</Link>
          </li>
        )}

        {hasPermission('gestion-roles') && (
          <li>
            <Link to="/gestion-roles" className="sidebar-btn" onClick={closeSidebar}>Gestión de Roles</Link>
          </li>
        )}

        <li>
          <button onClick={handleLogout} className="sidebar-btn logout-btn">Cerrar Sesión</button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
