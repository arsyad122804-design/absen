import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Home, Users, Clock, History, Calendar, FileText, 
  Umbrella, ClipboardList, Settings, LogOut, ChevronDown, Menu, X
} from 'lucide-react';
import '../pages/DashboardManager.css';

export default function ManagerLayout() {
  const [user, setUser] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData && userData !== 'undefined' && userData !== 'null') {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="manager-page">
      {/* Mobile Topbar */}
      <div className="mgr-mobile-topbar">
        <button className="mgr-hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu size={24} />
        </button>
        <h2>AbsensiKu Manager</h2>
      </div>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div className="mgr-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR MANAGER */}
      <div className={`mgr-sidebar-v2 ${isSidebarOpen ? 'open' : ''}`}>
        {/* Close Button inside Sidebar on mobile */}
        <button className="mgr-sidebar-close" onClick={() => setIsSidebarOpen(false)}>
          <X size={20} />
        </button>
        <div className="mgr-v2-logo">
          <div className="mgr-v2-icon">
            <Calendar size={20} color="white" />
          </div>
          <div className="mgr-v2-title">
            <h2>AbsensiKu</h2>
            <p>Manager Panel</p>
          </div>
        </div>

        <div className="mgr-v2-menu">
          <NavLink to="/manager/dashboard" className={({isActive}) => isActive ? "mgr-v2-link active" : "mgr-v2-link"}>
            <Home size={18} /> Dasbor
          </NavLink>
          <NavLink to="/manager/tim" className={({isActive}) => isActive ? "mgr-v2-link active" : "mgr-v2-link"}>
            <Users size={18} /> Tim & Karyawan
          </NavLink>
          <NavLink to="/manager/absensi" className={({isActive}) => isActive ? "mgr-v2-link active" : "mgr-v2-link"}>
            <Clock size={18} /> Absensi
          </NavLink>
          <NavLink to="/manager/riwayat" className={({isActive}) => isActive ? "mgr-v2-link active" : "mgr-v2-link"}>
            <History size={18} /> Riwayat Absensi
          </NavLink>

          <NavLink to="/manager/laporan" className={({isActive}) => isActive ? "mgr-v2-link active" : "mgr-v2-link"}>
            <FileText size={18} /> Laporan
          </NavLink>
          <NavLink to="/manager/izin" className={({isActive}) => isActive ? "mgr-v2-link active" : "mgr-v2-link"}>
            <Umbrella size={18} /> Izin & Cuti
          </NavLink>
          <NavLink to="/manager/pengajuan" className={({isActive}) => isActive ? "mgr-v2-link active" : "mgr-v2-link"}>
            <ClipboardList size={18} /> Pengajuan
          </NavLink>
          <NavLink to="/manager/pengaturan" className={({isActive}) => isActive ? "mgr-v2-link active" : "mgr-v2-link"}>
            <Settings size={18} /> Pengaturan
          </NavLink>
        </div>

        <div className="mgr-v2-bottom">
          

          <div className="mgr-v2-profile-card">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Manager')}&background=0D8ABC&color=fff`} alt="User" />
            <div className="mp-text">
              <strong>{user?.name || 'Manager'}</strong>
              <span>{user?.role || 'Manager'}</span>
            </div>
            <ChevronDown size={14} color="#64748B" style={{marginLeft: 'auto'}} />
          </div>

        </div>
      </div>

      {/* OUTLET UNTUK HALAMAN */}
      <Outlet />
    </div>
  );
}
