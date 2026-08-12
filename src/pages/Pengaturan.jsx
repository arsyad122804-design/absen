import React from 'react';
import { 
  Bell, Smartphone, Monitor, Globe, Shield, Moon, Fingerprint, 
  Settings2, BellRing, Lock, Mail, ChevronRight, Check, MapPin
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Pengaturan() {
  const { language, setLanguage, t } = useLanguage();
  
  // Local state for UI toggles
  const [toggles, setToggles] = React.useState({
    notifPush: true,
    notifEmail: false,
    darkMode: false,
    biometrik: true,
    lokasiAkurat: true
  });
  
  const [toast, setToast] = React.useState(null);

  const handleToggle = (key, label) => {
    setToggles(prev => {
      const newVal = !prev[key];
      // Show toast
      if (label) {
        showToast(`${label} berhasil ${newVal ? 'diaktifkan' : 'dinonaktifkan'}.`);
      }
      return { ...prev, [key]: newVal };
    });
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  React.useEffect(() => {
    if (toggles.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [toggles.darkMode]);

  return (
    <div className="content-container pg-v2-container">
      {/* HEADER SECTION */}
      <div className="pg-v2-header">
        <div className="pg-v2-title">
          <h1>Pengaturan</h1>
          <p>Kelola data diri dan informasi akun Anda dengan mudah.</p>
        </div>
      </div>

      <div className="pg-v2-grid">
        
        {/* PREFERENSI APLIKASI */}
        <div className="pg-v2-card">
          <div className="pg-v2-card-header">
            <Settings2 size={20} color="#3B82F6" />
            <h3>Preferensi Aplikasi</h3>
          </div>
          
          <div className="pg-v2-card-body">
            <div className="pg-v2-card-left">
              
              <div className="pg-v2-set-item">
                <div className="pg-v2-si-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                  <Moon size={20} />
                </div>
                <div className="pg-v2-si-text">
                  <h4>Mode Gelap (Dark Mode)</h4>
                  <p>Ubah tampilan aplikasi menjadi gelap untuk kenyamanan mata Anda di kondisi minim cahaya.</p>
                </div>
                <div className={`pg-v2-toggle ${toggles.darkMode ? 'active' : ''}`} onClick={() => handleToggle('darkMode', 'Mode Gelap')}>
                  <div className="pg-v2-toggle-circle"></div>
                </div>
              </div>

              <div className="pg-v2-set-divider"></div>

              <div className="pg-v2-set-item">
                <div className="pg-v2-si-icon" style={{ background: '#F0FDFA', color: '#0D9488' }}>
                  <Globe size={20} />
                </div>
                <div className="pg-v2-si-text">
                  <h4>Bahasa Aplikasi</h4>
                  <p>Pilih bahasa yang Anda gunakan di aplikasi.</p>
                </div>
                <div className="pg-v2-si-action">
                  <select 
                    className="pg-v2-select"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      showToast(`Bahasa diubah ke ${e.target.value}.`);
                    }}
                  >
                    <option value="Indonesia">Bahasa Indonesia</option>
                    <option value="Inggris">English</option>
                  </select>
                </div>
              </div>

            </div>
            <div className="pg-v2-card-right">
              {/* Fake Illustration */}
              <div className="pg-v2-illus pg-v2-illus-blue">
                <div className="pg-v2-illus-circle bg-blue-1"></div>
                <div className="pg-v2-illus-circle bg-blue-2"></div>
                <Settings2 size={80} color="#93C5FD" strokeWidth={1} style={{ position: 'relative', zIndex: 2 }} />
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFIKASI */}
        <div className="pg-v2-card">
          <div className="pg-v2-card-header">
            <BellRing size={20} color="#3B82F6" />
            <h3>Notifikasi</h3>
          </div>
          
          <div className="pg-v2-card-body">
            <div className="pg-v2-card-left">
              
              <div className="pg-v2-set-item">
                <div className="pg-v2-si-icon" style={{ background: '#FDF2F8', color: '#DB2777' }}>
                  <Smartphone size={20} />
                </div>
                <div className="pg-v2-si-text">
                  <h4>Notifikasi Push</h4>
                  <p>Terima pengingat absensi langsung di perangkat Anda.</p>
                </div>
                <div className={`pg-v2-toggle ${toggles.notifPush ? 'active' : ''}`} onClick={() => handleToggle('notifPush', 'Notifikasi Push')}>
                  <div className="pg-v2-toggle-circle"></div>
                </div>
              </div>

              <div className="pg-v2-set-divider"></div>

              <div className="pg-v2-set-item">
                <div className="pg-v2-si-icon" style={{ background: '#FFF7ED', color: '#EA580C' }}>
                  <Mail size={20} />
                </div>
                <div className="pg-v2-si-text">
                  <h4>Notifikasi Email</h4>
                  <p>Terima rekap absensi mingguan dan informasi penting via email.</p>
                </div>
                <div className={`pg-v2-toggle ${toggles.notifEmail ? 'active' : ''}`} onClick={() => handleToggle('notifEmail', 'Notifikasi Email')}>
                  <div className="pg-v2-toggle-circle"></div>
                </div>
              </div>

            </div>
            <div className="pg-v2-card-right">
              <div className="pg-v2-illus pg-v2-illus-purple">
                <div className="pg-v2-illus-circle bg-purple-1"></div>
                <div className="pg-v2-illus-circle bg-purple-2"></div>
                <Mail size={80} color="#C4B5FD" strokeWidth={1} style={{ position: 'relative', zIndex: 2 }} />
                <div className="pg-v2-illus-badge">1</div>
              </div>
            </div>
          </div>
        </div>

        {/* PRIVASI & KEAMANAN */}
        <div className="pg-v2-card">
          <div className="pg-v2-card-header">
            <Shield size={20} color="#3B82F6" />
            <h3>Privasi & Keamanan</h3>
          </div>
          
          <div className="pg-v2-card-body">
            <div className="pg-v2-card-left">
              
              <div className="pg-v2-set-item">
                <div className="pg-v2-si-icon" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                  <MapPin size={20} />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="pg-v2-si-text">
                  <h4>Akurasi Lokasi Tinggi</h4>
                  <p>Gunakan GPS untuk merekam lokasi absensi secara akurat.</p>
                </div>
                <div className={`pg-v2-toggle ${toggles.lokasiAkurat ? 'active' : ''}`} onClick={() => handleToggle('lokasiAkurat', 'Akurasi Lokasi Tinggi')}>
                  <div className="pg-v2-toggle-circle"></div>
                </div>
              </div>

              <div className="pg-v2-set-divider"></div>

              <div className="pg-v2-set-item">
                <div className="pg-v2-si-icon" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                  <Fingerprint size={20} />
                </div>
                <div className="pg-v2-si-text">
                  <h4>Login Biometrik</h4>
                  <p>Gunakan sidik jari atau Face ID untuk masuk ke akun Anda.</p>
                </div>
                <div className={`pg-v2-toggle ${toggles.biometrik ? 'active' : ''}`} onClick={() => handleToggle('biometrik', 'Login Biometrik')}>
                  <div className="pg-v2-toggle-circle"></div>
                </div>
              </div>

            </div>
            <div className="pg-v2-card-right">
              <div className="pg-v2-illus pg-v2-illus-green">
                <div className="pg-v2-illus-circle bg-blue-1"></div>
                <Shield size={80} color="#93C5FD" strokeWidth={1} style={{ position: 'relative', zIndex: 2 }} />
                <div className="pg-v2-illus-check"><Check size={16} color="white" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY BANNER */}
        <div className="pg-v2-security-banner">
          <div className="pg-v2-sb-left">
            <div className="pg-v2-sb-icon">
              <Lock size={16} color="white" />
            </div>
            <div className="pg-v2-sb-text">
              <strong>Keamanan data Anda adalah prioritas kami.</strong>
              <p>Semua data disimpan dengan aman dan tidak dibagikan ke pihak ketiga.</p>
            </div>
          </div>
          <a href="#" className="pg-v2-sb-link">Pelajari lebih lanjut <ChevronRight size={16} /></a>
        </div>

      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1F2937',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeUp 0.3s ease-out'
        }}>
          <Check size={18} color="#10B981" />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{toast}</span>
        </div>
      )}
      
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
