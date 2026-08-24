import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  Bell, Home, Calendar, Clock, Volume2, User, Settings, HelpCircle, Lock, LogOut, Menu, X, Umbrella
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import '../pages/DashboardKaryawan.css'

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Close sidebar on path changes (navigation)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const [isProfileComplete, setIsProfileComplete] = useState(true);
  
  const getNavClass = ({ isActive }) => {
    let base = 'menu-item'
    if (isActive && location.pathname !== '/absen') base += ' active'
    return base
  }
  
  const getIndexNavClass = () => {
    return location.pathname === '/absen' ? 'menu-item active' : 'menu-item'
  }

  return (
    <div className="dashboard-karyawan">
      
      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          {/* Close button inside sidebar on mobile */}
          <button 
            className="sidebar-close-btn" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
          
          <img src="/logo.png" alt="Hibatullah IIBS" style={{ width: '100%', maxWidth: '200px', height: 'auto', display: 'block', margin: '0 auto' }} />
        </div>

        <div className="sidebar-menu">
          <NavLink 
            to="/absen" 
            className={getIndexNavClass} 
            end
          >
            <Home size={20} /> {t.dashboard}
          </NavLink>
          <NavLink 
            to="/absen/riwayat" 
            className={getNavClass}
          >
            <Calendar size={20} /> {t.riwayatAbsen}
          </NavLink>
          <NavLink 
            to="/absen/izin" 
            className={getNavClass}
          >
            <Umbrella size={20} /> {t.pengajuanCuti}
          </NavLink>
          <NavLink 
            to="/absen/profil" 
            className={getNavClass}
          >
            <User size={20} /> {t.profilSaya}
          </NavLink>
          <NavLink 
            to="/absen/pengaturan" 
            className={getNavClass}
          >
            <Settings size={20} /> {t.pengaturan}
          </NavLink>
          <NavLink 
            to="/absen/bantuan" 
            className={getNavClass} 
            style={{ marginTop: 'auto' }}
          >
            <HelpCircle size={20} /> {t.bantuan}
          </NavLink>
        </div>

        <div className="sidebar-mosque-bg"></div>
      </div>

      <div className="main-area">
        
        <div className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setIsSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#1E293B',
                display: 'none', // Will be shown in mobile CSS media query
                padding: '4px'
              }}
            >
              <Menu size={24} />
            </button>
            <h2 className="topbar-title">Absen Guru Hibatullah</h2>
          </div>
          <div className="topbar-right" style={{ position: 'relative' }}>
            
            {/* NOTIF BUTTON */}
            <button className="notification-btn" onClick={() => {setShowNotif(!showNotif); setShowProfile(false)}}>
              <Bell size={20} />
            </button>
            
            {/* NOTIF DROPDOWN */}
            {showNotif && (
              <div style={{ position: 'absolute', top: '100%', right: '40px', width: '300px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #F1F5F9', zIndex: 9999, marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', fontWeight: 600, color: '#0F172A' }}>Notifikasi</div>
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                  Belum ada notifikasi baru.
                </div>
              </div>
            )}

            {/* PROFILE BUTTON */}
            <div className="user-avatar" onClick={() => {setShowProfile(!showProfile); setShowNotif(false)}} style={{ cursor: 'pointer' }}>
              {String(user?.name || 'User').substring(0, 2).toUpperCase()}
            </div>
            
            {/* PROFILE DROPDOWN */}
            {showProfile && (
              <div style={{ position: 'absolute', top: '100%', right: '0', width: '220px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #F1F5F9', zIndex: 9999, marginTop: '8px', padding: '8px' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: '4px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{user?.name || 'User'}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{user?.divisi || 'Karyawan'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div onClick={() => {navigate('/absen/profil'); setShowProfile(false)}} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background='#F1F5F9'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <User size={16} /> Profil Saya
                  </div>
                  <div onClick={() => {navigate('/absen/pengaturan'); setShowProfile(false)}} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background='#F1F5F9'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <Settings size={16} /> Pengaturan
                  </div>
                  <div onClick={() => { localStorage.removeItem('user'); navigate('/'); }} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#EF4444', cursor: 'pointer', borderRadius: '6px', marginTop: '4px', borderTop: '1px solid #F1F5F9' }} onMouseOver={e => e.currentTarget.style.background='#FEF2F2'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <LogOut size={16} /> Keluar (Log Out)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="content-scroll">
          <Outlet context={{ setIsProfileComplete }} />
        </div>
        
      </div>
    </div>
  )
}
