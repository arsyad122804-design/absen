import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Lock, EyeOff, Eye, ShieldCheck, Check, Mail, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Karyawan')
  const [divisi, setDivisi] = useState('Kepesantrenan')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    try {
      // Masukkan data pengguna ke tabel karyawan
      const { data, error } = await supabase
        .from('karyawan')
        .insert([
          { 
            name, 
            password, // Dalam aplikasi nyata, password harus di-hash (misal menggunakan supabase auth)
            role,
            divisi,
            status: 'Aktif'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error(error);
      }

      // Simpan ke local_karyawan untuk fallback lokal
      const localUsers = JSON.parse(localStorage.getItem('local_karyawan')) || [];
      const newUser = {
        id: data?.id || `KRY-${String(localUsers.length + 1).padStart(4, '0')}`,
        name,
        password,
        role,
        div: divisi,
        type: 'Full Time',
        status: 'Aktif',
        join: new Date().toLocaleDateString('id-ID'),
        email: `${name.toLowerCase().replace(/\s+/g, '')}@inovasidigital.id`,
        phone: '+62 812-0000-0000'
      };
      const filteredUsers = localUsers.filter(u => u.name?.toLowerCase() !== name.toLowerCase());
      filteredUsers.push(newUser);
      localStorage.setItem('local_karyawan', JSON.stringify(filteredUsers));

      setSuccessMsg('Pendaftaran berhasil! Mengalihkan ke halaman Login...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error(err)
      setErrorMsg('Terjadi kesalahan pada sistem!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-overlay"></div>
      
      <div className="login-container">
        
        {/* LEFT SIDE */}
        <div className="login-left">
          <div className="login-brand">
            <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-logo">
              <path d="M50 0L65.4508 15.4508L87.3223 12.6777L90.0954 34.5492L100 50L90.0954 65.4508L87.3223 87.3223L65.4508 90.0954L50 100L34.5492 90.0954L12.6777 87.3223L9.90462 65.4508L0 50L9.90462 34.5492L12.6777 12.6777L34.5492 15.4508L50 0Z" fill="#1E3A8A"/>
              <path d="M50 8L62.45 20.45L80.3 18.3L82.45 36.15L90 50L82.45 63.85L80.3 81.7L62.45 79.55L50 92L37.55 79.55L19.7 81.7L17.55 63.85L10 50L17.55 36.15L19.7 18.3L37.55 20.45L50 8Z" fill="#FBBF24"/>
              <path d="M50 16L58.5 24.5L72 23L73.5 36.5L80 50L73.5 63.5L72 77L58.5 75.5L50 84L41.5 75.5L28 77L26.5 63.5L20 50L26.5 36.5L28 23L41.5 24.5L50 16Z" fill="white"/>
              <rect x="35" y="45" width="8" height="20" fill="#1E3A8A" />
              <rect x="57" y="45" width="8" height="20" fill="#1E3A8A" />
              <path d="M50 30L60 40H40L50 30Z" fill="#1E3A8A"/>
            </svg>
            
            <h1 className="brand-title">HIBATULLAH</h1>
            <div className="brand-subtitle">
              <div className="brand-line"></div>
              <span>IIBS</span>
              <div className="brand-line"></div>
            </div>
            <p className="brand-motto">Beradab dan Berkarya</p>
          </div>

          <div className="login-welcome">
            <h2>Bergabunglah<br/><span>Bersama Kami!</span></h2>
            <div className="welcome-divider"></div>
            <p>
              Daftarkan diri Anda untuk mulai<br/>
              menggunakan sistem absensi yang<br/>
              cepat dan terintegrasi.
            </p>
          </div>

          <div className="login-trust">
            <div className="trust-icon">
              <ShieldCheck size={28} />
            </div>
            <div className="trust-text">
              <h3>Aman & Terpercaya</h3>
              <p>Data absensi Anda aman dan hanya dapat diakses oleh yang berwenang.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <div className="login-card">
            
            <div className="login-card-header">
              <div className="login-avatar-bg">
                <div className="login-avatar-inner">
                  <User size={32} />
                  <div className="avatar-check"><Check size={12} strokeWidth={4} /></div>
                </div>
              </div>
              
              <h2>Daftar Akun</h2>
              <p>Sistem Absensi Guru Hibatullah</p>
            </div>

            <form onSubmit={handleRegister} className="login-form">
              
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Nama Lengkap" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>


              <div className="input-group">
                <Briefcase className="input-icon" size={20} />
                <select 
                  required 
                  value={divisi}
                  onChange={(e) => setDivisi(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 44px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '15px',
                    color: '#334155',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Kepesantrenan">Kepesantrenan</option>
                  <option value="Sekolah">Sekolah</option>
                  <option value="Operasional">Operasional</option>
                </select>
              </div>
              
              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div 
                  className="input-icon-right" 
                  style={{ cursor: 'pointer', pointerEvents: 'auto' }} 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </div>
              </div>

              {errorMsg && (
                <div style={{ color: '#EF4444', fontSize: '13px', textAlign: 'center', marginTop: '-4px' }}>
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div style={{ color: '#10B981', fontSize: '13px', textAlign: 'center', marginTop: '-4px' }}>
                  {successMsg}
                </div>
              )}

              <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: '16px' }}>
                {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748B' }}>
              Sudah punya akun?{' '}
              <Link to="/" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
                Login di sini
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
