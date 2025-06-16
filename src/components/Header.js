import React from 'react';
import './Layout.css';

const Header = ({ user }) => {

  return (
    <div className="header">
      
      <div className="user-info">
        <p>{user ? user.nombre + " " + user.apellido : 'Nombre no disponible'}</p> {/* Cambiado de user.name a user.nombre */}
        <p>{user ? `Cargo: ${ user.nombre_rol}` : 'Rol no disponible'}</p> {/* Cambiado de user.role a user.rol_id */}
      </div>
    </div>
  );
};

export default Header;
