import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  History, 
  Settings, 
  LogOut,
  Menu,
  Coffee,
  WifiOff,
  Cloud,
  CloudOff
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon">
          <Coffee size={20} />
        </div>
        <span className="brand-title">Sarapan Ceria</span>
      </div>
      
      <ul className="nav-list">
        <li className="nav-item">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end onClick={() => toggleSidebar(false)}>
            <LayoutDashboard size={20} />
            Dasbor
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/vendors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => toggleSidebar(false)}>
            <Users size={20} />
            Data Vendor
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => toggleSidebar(false)}>
            <Package size={20} />
            Data Produk
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => toggleSidebar(false)}>
            <History size={20} />
            Riwayat Data
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => toggleSidebar(false)}>
            <Settings size={20} />
            Pengaturan
          </NavLink>
        </li>
      </ul>
      
      <div className="sidebar-footer">
        <button className="nav-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </aside>
  );
};

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isOffline, setOfflineStatus, isFirebaseConnected, isFirebaseConfigured } = useStore();
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setOfflineStatus(false);
    const handleOffline = () => setOfflineStatus(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOfflineStatus]);

  const toggleSidebar = (state) => {
    setIsSidebarOpen(state !== undefined ? state : !isSidebarOpen);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dasbor';
      case '/vendors': return 'Data Vendor';
      case '/products': return 'Data Produk';
      case '/history': return 'Riwayat Data';
      case '/settings': return 'Pengaturan';
      default: return '';
    }
  };

  return (
    <div className="app-container">
      {isSidebarOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 40 }} 
          onClick={() => toggleSidebar(false)}
        />
      )}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="main-content">
        {isOffline && (
          <div className="offline-banner">
            <WifiOff size={16} />
            Anda sedang offline. Perubahan akan disinkronkan saat kembali online.
          </div>
        )}
        
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-menu-btn" onClick={() => toggleSidebar()}>
              <Menu size={24} />
            </button>
            <h1 className="header-title">{getPageTitle()}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isFirebaseConnected ? (
              <span 
                title="Sinkronisasi Cloud Multi-User Aktif"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.8rem', 
                  color: '#16a34a', 
                  background: '#dcfce7', 
                  padding: '4px 10px', 
                  borderRadius: '16px',
                  fontWeight: 500
                }}
              >
                <Cloud size={14} /> Cloud Sync
              </span>
            ) : isFirebaseConfigured ? (
              <span 
                title="Menghubungkan ke Cloud..."
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.8rem', 
                  color: '#d97706', 
                  background: '#fef3c7', 
                  padding: '4px 10px', 
                  borderRadius: '16px' 
                }}
              >
                <Cloud size={14} /> Sinkron...
              </span>
            ) : null}
            <div className="header-date">
              {format(new Date(), 'EEEE, dd MMM yyyy')}
            </div>
          </div>
        </header>
        
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
