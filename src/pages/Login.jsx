import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Lock, EyeOff, Eye, ShieldCheck, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Masukkan nama dan password!');
      return;
    }
    
    const cleanUsername = username.trim().toLowerCase();
    
    // 1. Cek Admin Demo
    if (cleanUsername === 'hibatullah') {
      if (password === 'hibatullah maju') {
        const adminData = {
          id: 'admin-1',
          name: 'Direktur Hibatullah',
          role: 'Manager',
          divisi: 'Kepesantrenan'
        };
        localStorage.setItem('user', JSON.stringify(adminData));
        navigate('/manager/dashboard');
        return;
      } else {
        setErrorMsg('Password untuk akun Manager Hibatullah salah!');
        return;
      }
    } 
    // 2. Cek data terdaftar di local_karyawan (localStorage)
    const localUsers = JSON.parse(localStorage.getItem('local_karyawan')) || [];
    const foundLocal = localUsers.find(u => 
      (u.name?.toLowerCase() === username.trim().toLowerCase() || u.email?.toLowerCase() === username.trim().toLowerCase()) &&
      u.password === password
    );

    if (foundLocal) {
      const userData = {
        id: foundLocal.id || `kry-${Date.now()}`,
        name: foundLocal.name,
        role: foundLocal.role || 'Karyawan',
        divisi: foundLocal.div || foundLocal.divisi || 'Kepesantrenan'
      };
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.role?.toLowerCase() === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/absen');
      }
      return;
    }

    // 3. Cek Supabase
    try {
      const { data, error } = await supabase
        .from('karyawan')
        .select('*')
        .or(`email.eq.${username},name.eq.${username}`)
        .eq('password', password)
        .maybeSingle();

      if (!error && data) {
        localStorage.setItem('user', JSON.stringify(data));
        if (data.role?.toLowerCase() === 'manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/absen');
        }
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setErrorMsg('Username atau password salah!');
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
            <h2>Selamat Datang<br/><span>Guru Hebat!</span></h2>
            <div className="welcome-divider"></div>
            <p>
              Absensi mudah, cepat, dan akurat<br/>
              untuk mendukung pendidikan<br/>
              yang beradab dan berkarya.
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
              
              <h2>Login</h2>
              <p>Sistem Absensi Guru Hibatullah</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Username atau Email" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
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

              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  Ingat saya
                </label>
                <a href="#" className="forgot-link">Lupa password?</a>
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                Masuk
              </button>

            </form>
            
            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748B', position: 'relative', zIndex: 10 }}>
              Belum punya akun?{' '}
              <Link to="/register" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
                Daftar sekarang
              </Link>
            </div>
            
            <div className="mosque-silhouette"></div>
          </div>
        </div>
      </div>
      
      {/* FOOTER */}
      <div className="login-footer">
        <div className="copyright">
          © 2026 Hibatullah IIBS. All Rights Reserved.
        </div>
      </div>

    </div>
  )
}
