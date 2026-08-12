import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Edit3, Bell, BadgeCheck, MapPin, Calendar, Quote, 
  User, Mail, Phone, Briefcase, Award, Clock, X, Check,
  Activity, Zap, Target, BookOpen, PenTool, LayoutGrid, Heart, Camera, Settings
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProfilSaya() {
  const { t } = useLanguage();
  const outletContext = useOutletContext();
  const setIsProfileComplete = outletContext?.setIsProfileComplete;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Ringkasan');
  const [showEditModal, setShowEditModal] = useState(false);

  const [profile, setProfile] = useState({
    name: 'Fikri Arsyad',
    role: 'IT Development',
    location: 'Full Time',
    birthDate: '28 Desember 2004',
    about: 'Saya adalah Technology Specialist yang memiliki passion di bidang teknologi, AI, dan dakwah. Ingin menjadi investor muda, content creator, dan dai yang bermanfaat bagi banyak orang.',
    email: 'fikriarsyad@example.com',
    phone: '+62 812-3456-7890',
    skills: [
      { name: 'AI & Machine Learning', pct: '90%' },
      { name: 'Coding (AI)', pct: '80%' },
      { name: 'Trading & Investasi', pct: '80%' },
      { name: 'Desain', pct: '75%' },
      { name: 'Beladiri (Silat & Karate)', pct: '70%' }
    ],
    education: [
      { title: 'D1 Dakwah (ADI)', subtitle: 'Akademi Dakwah Indonesia (Elkisi)' },
      { title: 'SMA Elkisi', subtitle: '' },
      { title: 'SMP AL Anwar', subtitle: '' }
    ]
  });

  // State untuk form edit
  const [editForm, setEditForm] = useState({ ...profile });

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (index, field, value) => {
    const newSkills = [...editForm.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setEditForm({ ...editForm, skills: newSkills });
  };
  const addSkill = () => setEditForm({ ...editForm, skills: [...editForm.skills, { name: '', pct: '50%' }] });
  const removeSkill = (index) => {
    const newSkills = [...editForm.skills];
    newSkills.splice(index, 1);
    setEditForm({ ...editForm, skills: newSkills });
  };

  const handleEduChange = (index, field, value) => {
    const newEdu = [...editForm.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setEditForm({ ...editForm, education: newEdu });
  };
  const addEdu = () => setEditForm({ ...editForm, education: [...editForm.education, { title: '', subtitle: '' }] });
  const removeEdu = (index) => {
    const newEdu = [...editForm.education];
    newEdu.splice(index, 1);
    setEditForm({ ...editForm, education: newEdu });
  };

  const handleSave = () => {
    setProfile(editForm);
    setShowEditModal(false);
    
    // Unlock fitur jika ini adalah save pertama kali
    if (localStorage.getItem('isProfileComplete') !== 'true') {
      localStorage.setItem('isProfileComplete', 'true');
      if (setIsProfileComplete) setIsProfileComplete(true);
      // Optional: beri toast notifikasi atau arahkan ke dashboard
      alert("Profil berhasil disimpan! Fitur lainnya kini sudah terbuka.");
      navigate('/absen', { replace: true });
    }
  };

  return (
    <div className="content-container profil-page">
      {/* PAGE HEADER */}
      <div className="profil-header">
        <div className="greeting">
          <h1>Profil Saya</h1>
          <p>Kelola informasi profil dan preferensi Anda</p>
        </div>
        <div className="profil-header-actions">
          <button 
            className="btn-primary" 
            style={{ borderRadius: '12px', padding: '10px 20px' }}
            onClick={() => { setEditForm({...profile}); setShowEditModal(true); }}
          >
            <Edit3 size={18} /> Edit Profil
          </button>
          <button className="btn-icon">
            <Bell size={20} color="#475569" />
            <span className="notif-badge"></span>
          </button>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="profil-hero-banner">
        <div className="ph-overlay"></div>
        <div className="ph-content">
          <div className="ph-avatar-container">
            <img src={`https://ui-avatars.com/api/?name=${profile.name.replace(/ /g, '+')}&size=200&background=0D8ABC&color=fff`} alt={profile.name} className="ph-avatar" />
            <div className="ph-avatar-badge">
              <span className="camera-icon">📷</span>
            </div>
          </div>
          
          <div className="ph-info">
            <div className="ph-name-row">
              <h2>{profile.name}</h2>
              <BadgeCheck size={24} color="#3B82F6" fill="white" />
            </div>
            
            <div className="ph-role-badge">
              <Briefcase size={14} /> {profile.role}
            </div>

            <div className="ph-meta-row">
              <div className="ph-meta-item">
                <MapPin size={16} /> {profile.location}
              </div>
              <div className="ph-meta-item">
                <Calendar size={16} /> {profile.birthDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="profil-tabs-card">
        {['Ringkasan', 'Informasi Pribadi', 'Pendidikan', 'Keahlian', 'Pengaturan'].map(tab => (
          <button 
            key={tab} 
            className={`profil-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* GRID LAYOUT */}
      <div className={`profil-grid ${activeTab !== 'Ringkasan' ? 'single-focus' : ''}`}>
        
        {/* PENGATURAN TAB */}
        {activeTab === 'Pengaturan' && (
          <div className="profil-card" style={{ textAlign: 'center', padding: '64px 24px', gridColumn: '1 / -1' }}>
            <Settings size={48} color="#94A3B8" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#0F172A', marginBottom: '8px' }}>Pengaturan Profil</h2>
            <p style={{ color: '#64748B' }}>Silakan gunakan menu Pengaturan di navigasi kiri untuk mengelola preferensi, notifikasi, dan keamanan akun Anda.</p>
          </div>
        )}

        {/* KOLOM KIRI */}
        {['Ringkasan', 'Informasi Pribadi'].includes(activeTab) && (
        <div className="profil-col-left">
          
          <div className="profil-card">
            <div className="pc-header">
              <User size={20} color="#3B82F6" />
              <h3>Tentang Saya</h3>
            </div>
            <div className="pc-body">
              <p className="about-text">
                {profile.about}
              </p>
              
              <div className="info-list">
                <div className="info-item">
                  <User size={18} color="#94A3B8" className="ii-icon" />
                  <div className="ii-content">
                    <span className="ii-label">Nama Lengkap</span>
                    <span className="ii-val">{profile.name}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Calendar size={18} color="#94A3B8" className="ii-icon" />
                  <div className="ii-content">
                    <span className="ii-label">Tempat, Tanggal Lahir</span>
                    <span className="ii-val">{profile.birthDate}</span>
                  </div>
                </div>
                <div className="info-item">
                  <MapPin size={18} color="#94A3B8" className="ii-icon" />
                  <div className="ii-content">
                    <span className="ii-label">Alamat</span>
                    <span className="ii-val">{profile.location}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Mail size={18} color="#94A3B8" className="ii-icon" />
                  <div className="ii-content">
                    <span className="ii-label">Email</span>
                    <span className="ii-val">{profile.email}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Phone size={18} color="#94A3B8" className="ii-icon" />
                  <div className="ii-content">
                    <span className="ii-label">No. Handphone</span>
                    <span className="ii-val">{profile.phone}</span>
                  </div>
                </div>
              </div>

              <button className="btn-outline-full">Lihat Selengkapnya</button>
            </div>
          </div>

        </div>
        )}

        {/* KOLOM TENGAH */}
        {['Ringkasan'].includes(activeTab) && (
        <div className="profil-col-mid">
          
          {/* Stats Row */}
          <div className="profil-card stats-card">
            <div className="p-stat-item">
              <div className="p-stat-icon blue"><Calendar size={24} /></div>
              <h2>22</h2>
              <p>Total Absen</p>
            </div>
            <div className="p-stat-divider"></div>
            <div className="p-stat-item">
              <div className="p-stat-icon green"><Check size={24} /></div>
              <h2>22</h2>
              <p>Hadir</p>
            </div>
            <div className="p-stat-divider"></div>
            <div className="p-stat-item">
              <div className="p-stat-icon orange"><Clock size={24} /></div>
              <h2>3</h2>
              <p>Terlambat</p>
            </div>
            <div className="p-stat-divider"></div>
            <div className="p-stat-item">
              <div className="p-stat-icon red"><X size={24} /></div>
              <h2>1</h2>
              <p>Tidak Hadir</p>
            </div>
          </div>

          {/* Pencapaian */}
          <div className="profil-card">
            <div className="pc-header justify-between">
              <div className="pc-h-left">
                <Award size={20} color="#3B82F6" />
                <h3>Pencapaian</h3>
              </div>
              <a href="#" className="pc-link">Lihat Semua</a>
            </div>
            <div className="pc-body flex-row gap-16">
              <div className="badge-card">
                <div className="bc-icon hexagon blue"><Target size={24} /></div>
                <h4>Disiplin Tinggi</h4>
                <p>Hadir tepat waktu 20 kali</p>
              </div>
              <div className="badge-card">
                <div className="bc-icon hexagon green"><Calendar size={24} /></div>
                <h4>Konsisten</h4>
                <p>Hadir 5 hari berturut-turut</p>
              </div>
              <div className="badge-card">
                <div className="bc-icon hexagon purple"><Award size={24} /></div>
                <h4>Aktif</h4>
                <p>Menggunakan aplikasi secara aktif</p>
              </div>
            </div>
          </div>

          {/* Aktivitas Terbaru */}
          <div className="profil-card">
            <div className="pc-header justify-between">
              <div className="pc-h-left">
                <Activity size={20} color="#3B82F6" />
                <h3>Aktivitas Terbaru</h3>
              </div>
              <a href="#" className="pc-link">Lihat Semua</a>
            </div>
            <div className="pc-body list-body">
              
              <div className="act-item">
                <div className="act-icon-wrapper green"><Check size={16} /></div>
                <div className="act-content">
                  <h4>Check-in</h4>
                  <p>Sabtu, 10 Agustus 2026</p>
                </div>
                <div className="act-time">07:32</div>
              </div>

              <div className="act-item">
                <div className="act-icon-wrapper red"><X size={16} /></div>
                <div className="act-content">
                  <h4>Tidak Hadir</h4>
                  <p>Selasa, 6 Agustus 2026</p>
                </div>
                <div className="act-time">-</div>
              </div>

              <div className="act-item">
                <div className="act-icon-wrapper orange"><Clock size={16} /></div>
                <div className="act-content">
                  <h4>Terlambat</h4>
                  <p>Jumat, 9 Agustus 2026</p>
                </div>
                <div className="act-time">07:46</div>
              </div>

            </div>
          </div>

        </div>
        )}

        {/* KOLOM KANAN */}
        {['Ringkasan', 'Keahlian', 'Pendidikan', 'Informasi Pribadi'].includes(activeTab) && (
        <div className="profil-col-right">
          
          {/* Keahlian */}
          {['Ringkasan', 'Keahlian'].includes(activeTab) && (
          <div className="profil-card">
            <div className="pc-header justify-between">
              <div className="pc-h-left">
                <Zap size={20} color="#3B82F6" />
                <h3>Keahlian</h3>
              </div>
              <a href="#" className="pc-link">Lihat Semua</a>
            </div>
            <div className="pc-body">
              {profile.skills.map((skill, idx) => (
                <div className="skill-item" key={idx}>
                  <div className="si-header">
                    <div className="si-icon"><Zap size={16} color="#3B82F6"/></div>
                    <span>{skill.name}</span>
                  </div>
                  <div className="si-progress-wrapper">
                    <div className="si-progress-bar"><div className="si-progress" style={{ width: skill.pct }}></div></div>
                    <span className="si-pct">{skill.pct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Riwayat Pendidikan */}
          {['Ringkasan', 'Pendidikan'].includes(activeTab) && (
          <div className="profil-card">
            <div className="pc-header justify-between">
              <div className="pc-h-left">
                <BookOpen size={20} color="#3B82F6" />
                <h3>Riwayat Pendidikan</h3>
              </div>
              <a href="#" className="pc-link">Lihat Semua</a>
            </div>
            <div className="pc-body">
              <div className="timeline-list">
                {profile.education.map((edu, idx) => (
                  <div className="tl-item" key={idx}>
                    <div className="tl-dot"></div>
                    <div className="tl-content">
                      <h4>{edu.title}</h4>
                      {edu.subtitle && <p>{edu.subtitle}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Informasi Cepat */}
          {['Ringkasan', 'Informasi Pribadi'].includes(activeTab) && (
          <div className="profil-card">
            <div className="pc-header">
              <Briefcase size={20} color="#3B82F6" />
              <h3>Informasi Cepat</h3>
            </div>
            <div className="pc-body list-body">
              
              <div className="act-item no-border">
                <div className="act-icon-wrapper gray"><Briefcase size={16} /></div>
                <div className="act-content">
                  <p>Pekerjaan</p>
                  <h4 style={{ fontWeight: 500 }}>Technology Specialist</h4>
                </div>
              </div>

              <div className="act-item no-border">
                <div className="act-icon-wrapper gray"><Target size={16} /></div>
                <div className="act-content">
                  <p>Hobi</p>
                  <h4 style={{ fontWeight: 500 }}>Sepak Bola, Basket, Coding, Membaca</h4>
                </div>
              </div>

              <div className="act-item no-border">
                <div className="act-icon-wrapper gray"><LayoutGrid size={16} /></div>
                <div className="act-content">
                  <p>Bahasa</p>
                  <h4 style={{ fontWeight: 500 }}>Indonesia, English, العربية</h4>
                </div>
              </div>

              <div className="act-item no-border">
                <div className="act-icon-wrapper gray"><Heart size={16} /></div>
                <div className="act-content">
                  <p>Status</p>
                  <h4 style={{ fontWeight: 500 }}>LDR dengan Dewi Hartati 💙</h4>
                </div>
              </div>

            </div>
          </div>
          )}

        </div>
        )}

      </div>

      {/* MODAL EDIT PROFIL */}
      {showEditModal && (
        <div className="ra-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="ra-modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '560px', padding: '0', overflowY: 'auto', overflowX: 'hidden' }}>
            
            {/* Modal Header with Gradient */}
            <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', padding: '32px 32px 64px 32px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Edit Profil</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: '0 32px 32px 32px', position: 'relative', marginTop: '-48px' }}>
              
              {/* Avatar Upload */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${profile.name.replace(/ /g, '+')}&size=120&background=0D8ABC&color=fff`} 
                    alt="Avatar" 
                    style={{ width: '96px', height: '96px', borderRadius: '50%', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                  <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#2563EB', width: '32px', height: '32px', borderRadius: '50%', border: '3px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: 'white' }}>
                    <Camera size={14} />
                  </div>
                </div>
              </div>

              <div className="edit-form-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Lengkap</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="text" 
                        name="name" 
                        value={editForm.name} 
                        onChange={handleEditChange}
                        style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', transition: '0.2s', boxSizing: 'border-box' }}
                        onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                        onBlur={(e) => { e.target.style.background = '#F8FAFC'; e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Divisi</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <select 
                        name="role" 
                        value={editForm.role} 
                        onChange={handleEditChange}
                        style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', transition: '0.2s', boxSizing: 'border-box', appearance: 'none' }}
                        onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                        onBlur={(e) => { e.target.style.background = '#F8FAFC'; e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                      >
                        <option value="Operasional">Operasional</option>
                        <option value="IT Development">IT Development</option>
                        <option value="HR & GA">HR & GA</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sekolah">Sekolah</option>
                        <option value="Pesantren">Pesantren</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Kerja</label>
                    <div style={{ position: 'relative' }}>
                      <Activity size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <select 
                        name="location" 
                        value={editForm.location} 
                        onChange={handleEditChange}
                        style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', transition: '0.2s', boxSizing: 'border-box', appearance: 'none' }}
                        onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                        onBlur={(e) => { e.target.style.background = '#F8FAFC'; e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggal Bergabung</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="date" 
                        name="birthDate" 
                        value={editForm.birthDate} 
                        onChange={handleEditChange}
                        style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', transition: '0.2s', boxSizing: 'border-box' }}
                        onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                        onBlur={(e) => { e.target.style.background = '#F8FAFC'; e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="email" 
                        name="email" 
                        value={editForm.email} 
                        onChange={handleEditChange}
                        style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', transition: '0.2s', boxSizing: 'border-box' }}
                        onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                        onBlur={(e) => { e.target.style.background = '#F8FAFC'; e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nomor HP</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="text" 
                        name="phone" 
                        value={editForm.phone} 
                        onChange={handleEditChange}
                        style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', transition: '0.2s', boxSizing: 'border-box' }}
                        onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                        onBlur={(e) => { e.target.style.background = '#F8FAFC'; e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tentang Saya</label>
                  <textarea 
                    name="about" 
                    value={editForm.about} 
                    onChange={handleEditChange}
                    rows="3"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', transition: '0.2s', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
                    onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.background = '#F8FAFC'; e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Keahlian</label>
                  </div>
                  {editForm.skills.map((skill, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Nama Skill (Misal: Coding)"
                        value={skill.name} 
                        onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                        style={{ flex: 2, padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none' }}
                      />
                      <input 
                        type="text" 
                        placeholder="90%"
                        value={skill.pct} 
                        onChange={(e) => handleSkillChange(idx, 'pct', e.target.value)}
                        style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none' }}
                      />
                      <button 
                        onClick={() => removeSkill(idx)}
                        style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '8px', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={addSkill} style={{ alignSelf: 'flex-start', background: 'transparent', color: '#3B82F6', border: '1px dashed #3B82F6', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ Tambah Keahlian</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Riwayat Pendidikan</label>
                  </div>
                  {editForm.education.map((edu, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                          type="text" 
                          placeholder="Gelar / Institusi Utama"
                          value={edu.title} 
                          onChange={(e) => handleEduChange(idx, 'title', e.target.value)}
                          style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Deskripsi Opsional (Misal: Universitas Indonesia)"
                          value={edu.subtitle} 
                          onChange={(e) => handleEduChange(idx, 'subtitle', e.target.value)}
                          style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                      <button 
                        onClick={() => removeEdu(idx)}
                        style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '8px', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', marginTop: '2px' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={addEdu} style={{ alignSelf: 'flex-start', background: 'transparent', color: '#3B82F6', border: '1px dashed #3B82F6', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ Tambah Pendidikan</button>
                </div>

              </div>

              <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
                <button 
                  style={{ background: 'white', border: '1px solid #E2E8F0', color: '#475569', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setShowEditModal(false)}
                  onMouseOver={(e) => e.target.style.background = '#F8FAFC'}
                  onMouseOut={(e) => e.target.style.background = 'white'}
                >
                  Batal
                </button>
                <button 
                  style={{ background: '#2563EB', border: 'none', color: 'white', padding: '12px 32px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', transition: 'all 0.2s' }}
                  onClick={handleSave}
                  onMouseOver={(e) => { e.target.style.background = '#1D4ED8'; e.target.style.boxShadow = '0 6px 16px rgba(37,99,235,0.3)'; }}
                  onMouseOut={(e) => { e.target.style.background = '#2563EB'; e.target.style.boxShadow = '0 4px 12px rgba(37,99,235,0.2)'; }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
