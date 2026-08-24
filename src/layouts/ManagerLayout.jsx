import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Users, Clock, History, Calendar, FileText, 
  Umbrella, ClipboardList, Settings, LogOut, ChevronDown, Menu, X, Bell, LayoutGrid
} from 'lucide-react';
import '../pages/DashboardManager.css';

export default function ManagerLayout() {
  const [user, setUser] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    setShowProfileMenu(false);
    setShowNotifMenu(false);
  }, [location.pathname]);

  const getPageTitle = (path) => {
    if (path.endsWith('dashboard')) return 'Dasbor';
    if (path.endsWith('tim')) return 'Tim & Karyawan';
    if (path.endsWith('absensi')) return 'Absensi';
    if (path.endsWith('riwayat')) return 'Riwayat Absensi';
    if (path.endsWith('laporan')) return 'Laporan & Analitik';
    if (path.endsWith('izin')) return 'Izin & Cuti';
    if (path.endsWith('pengajuan')) return 'Pusat Persetujuan';
    if (path.endsWith('pengaturan')) return 'Pengaturan';
    return 'AbsensiKu';
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const isLainnyaActive = !['/manager/dashboard', '/manager/tim', '/manager/absensi', '/manager/riwayat'].includes(location.pathname);

  return (
    <div className="manager-page">
      {/* Mobile Top Header Row */}
      <div className="mgr-mobile-header show-on-mobile">
        <div className="mmh-left">
          <button className="mmh-hamburger" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          {location.pathname.endsWith('dashboard') ? (
            <div className="mmh-greeting">
              <span className="mmh-welcome-lbl">Selamat datang kembali,</span>
              <h2 className="mmh-user-name">{user?.name || 'Manager'} 👋</h2>
              <span className="mmh-sub-lbl">Berikut ringkasan kehadiran tim Anda hari ini.</span>
            </div>
          ) : (
            <div className="mmh-title-only">
              <h2>{getPageTitle(location.pathname)}</h2>
            </div>
          )}
        </div>
        <div className="mmh-right">
          {/* Bell Notifications */}
          <div className="mmh-notif-box" onClick={() => setShowNotifMenu(!showNotifMenu)}>
            <Bell size={20} color="#0F172A" />
            <span className="mmh-badge">2</span>
          </div>
          
          {/* Profile Initials Bubble */}
          <div className="mmh-profile-box" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div className="mmh-avatar-initials">
              {getInitials(user?.name || 'Manager')}
            </div>
            <ChevronDown size={14} color="#64748B" />
          </div>
        </div>

        {/* Mobile Dropdown Menus */}
        {showNotifMenu && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowNotifMenu(false)} />
            <div style={{ position: 'absolute', right: '16px', top: '56px', width: '280px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 1000, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: '#0F172A' }}>Notifikasi</strong>
                <span onClick={() => setShowNotifMenu(false)} style={{ fontSize: '11px', color: '#3B82F6', cursor: 'pointer' }}>Tutup</span>
              </div>
              <div style={{ padding: '16px', fontSize: '12px', color: '#64748B', textAlign: 'center' }}>
                Belum ada notifikasi baru.
              </div>
            </div>
          </>
        )}

        {showProfileMenu && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowProfileMenu(false)} />
            <div style={{ position: 'absolute', right: '16px', top: '56px', width: '200px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 1000, padding: '8px' }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: '8px' }}>
                <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A' }}>{user?.name || 'Manager'}</strong>
                <span style={{ fontSize: '11px', color: '#64748B' }}>{user?.role || 'Manager'}</span>
              </div>
              <button style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', borderRadius: '6px', fontSize: '12px', textAlign: 'left' }} onClick={() => navigate('/manager/pengaturan')}>
                <Settings size={14} /> Pengaturan
              </button>
              <button style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', borderRadius: '6px', fontSize: '12px', textAlign: 'left', marginTop: '4px' }} onClick={handleLogout}>
                <LogOut size={14} /> Keluar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Backdrop for sidebar */}
      {isSidebarOpen && (
        <div className="mgr-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR MANAGER */}
      <div className={`mgr-sidebar-v2 ${isSidebarOpen ? 'open' : ''}`}>
        {/* Close Button inside Sidebar on mobile */}
        <button className="mgr-sidebar-close" onClick={() => setIsSidebarOpen(false)}>
          <X size={20} />
        </button>
        <div className="mgr-v2-logo" style={{ background: 'transparent', padding: '16px 24px' }}>
          <img src="/logo.png" alt="Hibatullah IIBS" style={{ width: '100%', maxWidth: '200px', height: 'auto', display: 'block', margin: '0 auto' }} />
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

      {/* Mobile Bottom Navigation Tab Bar */}
      <div className="mgr-mobile-bottom-bar show-on-mobile">
        <NavLink to="/manager/dashboard" className={({isActive}) => isActive ? "mbb-item active" : "mbb-item"}>
          <Home size={20} />
          <span>Dasbor</span>
        </NavLink>
        <NavLink to="/manager/tim" className={({isActive}) => isActive ? "mbb-item active" : "mbb-item"}>
          <Users size={20} />
          <span>Karyawan</span>
        </NavLink>
        <NavLink to="/manager/absensi" className={({isActive}) => isActive ? "mbb-item active" : "mbb-item"}>
          <Clock size={20} />
          <span>Absensi</span>
        </NavLink>
        <NavLink to="/manager/riwayat" className={({isActive}) => isActive ? "mbb-item active" : "mbb-item"}>
          <History size={20} />
          <span>Riwayat</span>
        </NavLink>
        <button className={`mbb-item mbb-more-btn ${isLainnyaActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(true)}>
          <LayoutGrid size={20} />
          <span>Lainnya</span>
        </button>
      </div>
    </div>
  );
}
