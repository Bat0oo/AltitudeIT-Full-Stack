import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
//forgot about this..
const Layout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;