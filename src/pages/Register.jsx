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
            <img src="/logo.png" className="brand-logo" alt="Hibatullah IIBS" style={{ width: '100%', maxWidth: '300px', height: 'auto' }} />
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
