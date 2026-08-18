import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  Bell, Home, Calendar, Clock, Volume2, User, Settings, HelpCircle, Lock, LogOut
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
      
      <div className="sidebar">
        <div className="sidebar-logo">
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L65.4508 15.4508L87.3223 12.6777L90.0954 34.5492L100 50L90.0954 65.4508L87.3223 87.3223L65.4508 90.0954L50 100L34.5492 90.0954L12.6777 87.3223L9.90462 65.4508L0 50L9.90462 34.5492L12.6777 12.6777L34.5492 15.4508L50 0Z" fill="#FBBF24"/>
            <path d="M50 8L62.45 20.45L80.3 18.3L82.45 36.15L90 50L82.45 63.85L80.3 81.7L62.45 79.55L50 92L37.55 79.55L19.7 81.7L17.55 63.85L10 50L17.55 36.15L19.7 18.3L37.55 20.45L50 8Z" fill="#1E40AF"/>
            <path d="M50 16L58.5 24.5L72 23L73.5 36.5L80 50L73.5 63.5L72 77L58.5 75.5L50 84L41.5 75.5L28 77L26.5 63.5L20 50L26.5 36.5L28 23L41.5 24.5L50 16Z" fill="#60A5FA"/>
            <rect x="35" y="45" width="8" height="20" fill="white" />
            <rect x="57" y="45" width="8" height="20" fill="white" />
            <path d="M50 30L60 40H40L50 30Z" fill="white"/>
          </svg>
          <h2>HIBATULLAH</h2>
          <div className="sidebar-subtitle">
            <div className="line"></div>
            <span>IIBS</span>
            <div className="line"></div>
          </div>
          <p>{t.beradabBerkarya}</p>
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
          <div className="topbar-left">
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
            <div className="user-avatar" onClick={() => {setShowProfile(!showProfile); setShowNotif(false)}} style={{ cursor: 'pointer', overflow: 'hidden', background: '#e2e8f0' }}>
              <img 
                src={localStorage.getItem('avatar_' + (user.id || 'default')) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=100&background=0D8ABC&color=fff`} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
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
                  <div onClick={() => navigate('/')} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#EF4444', cursor: 'pointer', borderRadius: '6px', marginTop: '4px', borderTop: '1px solid #F1F5F9' }} onMouseOver={e => e.currentTarget.style.background='#FEF2F2'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
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
