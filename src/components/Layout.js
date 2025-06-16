import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import './Layout.css';
import { Outlet } from 'react-router-dom';
import { Toolbar } from '@mui/material';

const Layout = ({ children, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Esta función cierra el sidebar siempre
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout">
      <Sidebar
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        user={user}
        closeSidebar={closeSidebar} // 👈 le pasamos la función
      />
      <div className={`main-content ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
        <Header user={user} />
        <div className="children">
          <Toolbar />
          <Outlet />
        </div>
      </div>
      
      <button onClick={toggleSidebar} className="toggle-sidebar-btn">
        
        {isSidebarOpen ? <GoSidebarCollapse size={34} /> : <GoSidebarExpand size={34} />}
      </button>
    </div>
  );
};

export default Layout;
