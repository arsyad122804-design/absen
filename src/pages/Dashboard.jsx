import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, CheckCircle2, Clock, XCircle, Calendar as CalendarIcon, Bell,
  FileText, LogOut, ArrowRight, Home, Settings, FileBarChart, CalendarDays,
  ChevronDown, ArrowUp, Briefcase, Megaphone, Code, DollarSign, ChevronRight, TrendingUp, BookOpen, ShieldCheck
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import './DashboardManager.css';

// --- MOCK DATA ---
const trendData = [
  { name: '8 Mei', hadir: 70, terlambat: 22, absen: 15 },
  { name: '9 Mei', hadir: 82, terlambat: 18, absen: 10 },
  { name: '10 Mei', hadir: 75, terlambat: 21, absen: 14 },
  { name: '11 Mei', hadir: 81, terlambat: 18, absen: 9 },
  { name: '12 Mei', hadir: 87, terlambat: 19, absen: 11 },
  { name: '13 Mei', hadir: 78, terlambat: 20, absen: 13 },
  { name: '14 Mei', hadir: 72, terlambat: 19, absen: 14 },
];

const sparkHadir = [{uv: 30}, {uv: 40}, {uv: 35}, {uv: 50}, {uv: 49}, {uv: 60}, {uv: 75}];
const sparkTerlambat = [{uv: 20}, {uv: 15}, {uv: 18}, {uv: 12}, {uv: 15}, {uv: 14}, {uv: 14}];
const sparkAbsen = [{uv: 10}, {uv: 12}, {uv: 8}, {uv: 14}, {uv: 10}, {uv: 15}, {uv: 11}];

const donutData = [
  { name: 'Hadir', value: 96 },
  { name: 'Terlambat', value: 18 },
  { name: 'Tidak Hadir', value: 14 },
];
const DONUT_COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Green, Orange, Red

const divisiData = [
  { name: 'Sekolah (Guru)', icon: BookOpen, iconColor: '#3B82F6', bg: '#EFF6FF', kar: 48, hadir: 38, telat: 6, absen: 4, pct: 79 },
  { name: 'Pesantren (Asatidz)', icon: Users, iconColor: '#10B981', bg: '#ECFDF5', kar: 26, hadir: 21, telat: 3, absen: 2, pct: 81 },
  { name: 'Operasional', icon: Briefcase, iconColor: '#8B5CF6', bg: '#F5F3FF', kar: 54, hadir: 44, telat: 5, absen: 4, pct: 81 },
];

const aktivitasData = [
  { id: 1, type: 'blue', img: 'https://ui-avatars.com/api/?name=Dewi+Hartati', name: 'Dewi Hartati mengajukan izin', desc: 'Izin Sakit - 14 Mei 2026', time: '10:30' },
  { id: 2, type: 'orange', img: 'https://ui-avatars.com/api/?name=Rizky+Maulana', name: 'Rizky Maulana check-in terlambat', desc: 'Terlambat 25 menit', time: '09:15' },
  { id: 3, type: 'green', img: 'https://ui-avatars.com/api/?name=Siti+Nurhaliza', name: 'Siti Nurhaliza check-in', desc: '08:02 WIB', time: '08:02' },
  { id: 4, type: 'purple', icon: FileText, name: 'Laporan mingguan telah dibuat', desc: 'Periode 1 - 7 Mei 2026', time: 'Kemarin' },
  { id: 5, type: 'green', img: 'https://ui-avatars.com/api/?name=Budi+Santoso', name: 'Budi Santoso check-out', desc: '17:31 WIB', time: 'Kemarin' },
];

export default function DashboardManager() {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showTrendFilter, setShowTrendFilter] = useState(false);
  const [dateRange, setDateRange] = useState('8 Mei 2026 - 14 Mei 2026');
  const [trendFilter, setTrendFilter] = useState('Mingguan');

  const handleLogout = () => {
    navigate('/login');
  };

  return (
      <div className="mgr-main">
        
        {/* TOP HEADER */}
        <div className="dm-header-row">
          <div className="dm-header-left">
            <h1>Dasbor Manager</h1>
            <p className="dm-greeting">Selamat datang kembali, <strong>Fikri Arsyad</strong> 👋</p>
            <p className="dm-subtitle">Berikut ringkasan kehadiran tim Anda hari ini.</p>
          </div>
          <div className="dm-header-right">
            <div className="dm-date-picker" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setShowDateFilter(!showDateFilter)}>
              <CalendarIcon size={16} color="#64748B" />
              <span>{dateRange}</span>
              <ChevronDown size={16} color="#64748B" />
              {showDateFilter && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={(e) => { e.stopPropagation(); setShowDateFilter(false); }} />
                  <div style={{ position: 'absolute', right: 0, top: '40px', width: '200px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 1000, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                    <button style={{ width: '100%', padding: '10px 16px', background: 'white', border: 'none', borderBottom: '1px solid #F1F5F9', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setDateRange('Hari Ini'); setShowDateFilter(false); }}>Hari Ini</button>
                    <button style={{ width: '100%', padding: '10px 16px', background: 'white', border: 'none', borderBottom: '1px solid #F1F5F9', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setDateRange('8 Mei 2026 - 14 Mei 2026'); setShowDateFilter(false); }}>Minggu Ini</button>
                    <button style={{ width: '100%', padding: '10px 16px', background: 'white', border: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setDateRange('1 Mei 2026 - 31 Mei 2026'); setShowDateFilter(false); }}>Bulan Ini</button>
                  </div>
                </>
              )}
            </div>

            {/* Notification Dropdown */}
            <div style={{ position: 'relative' }}>
              <button className="dm-btn-notif" onClick={() => setShowNotif(!showNotif)}>
                <Bell size={20} color="#0F172A" />
                <span className="dm-badge">3</span>
              </button>
              {showNotif && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowNotif(false)} />
                  <div style={{ position: 'absolute', right: 0, top: '48px', width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 1000, overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Notifikasi</h3>
                      <span style={{ fontSize: '12px', color: '#3B82F6', cursor: 'pointer', fontWeight: 500 }}>Tandai semua dibaca</span>
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', cursor: 'pointer' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Pengajuan Cuti Baru</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Dewi Hartati mengajukan cuti tahunan.</p>
                        <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', display: 'block' }}>10 menit yang lalu</span>
                      </div>
                      <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Laporan Mingguan</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Laporan kehadiran minggu ini telah siap.</p>
                        <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', display: 'block' }}>1 jam yang lalu</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <div className="dm-profile-box" onClick={() => setShowProfile(!showProfile)} style={{ cursor: 'pointer' }}>
                <img src="https://ui-avatars.com/api/?name=Fikri+Arsyad&background=0D8ABC&color=fff" alt="User" />
                <div className="dm-profile-info">
                  <strong>Fikri Arsyad</strong>
                  <span>Manager Operasional</span>
                </div>
              </div>
              {showProfile && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowProfile(false)} />
                  <div style={{ position: 'absolute', right: 0, top: '56px', width: '220px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 1000, padding: '8px' }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: '8px' }}>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0F172A' }}>Fikri Arsyad</strong>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>fikri@inovasidigital.id</span>
                    </div>
                    <button style={{ width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', borderRadius: '6px', fontSize: '13px', textAlign: 'left', fontWeight: 500 }} onClick={() => navigate('/manager/pengaturan')}>
                      <Settings size={16} /> Pengaturan
                    </button>
                    <button style={{ width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', borderRadius: '6px', fontSize: '13px', textAlign: 'left', fontWeight: 500, marginTop: '4px' }} onClick={handleLogout}>
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* 5 STATS CARDS */}
        <div className="dm-stats-grid">
          
          {/* Card 1 */}
          <div className="dm-stat-card">
            <div className="dm-sc-top">
              <div className="dm-sc-icon-box" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                <Users size={24} />
              </div>
              <div className="dm-sc-val">
                <h2>128</h2>
                <p>Total Karyawan</p>
              </div>
            </div>
            <div className="dm-sc-bot">
              <span className="dm-sc-trend up"><ArrowUp size={12}/> 5 dari bulan lalu</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="dm-stat-card">
            <div className="dm-sc-top">
              <div className="dm-sc-icon-box" style={{ background: '#ECFDF5', color: '#10B981' }}>
                <CheckCircle2 size={24} />
              </div>
              <div className="dm-sc-val">
                <h2>96</h2>
                <p>Hadir</p>
              </div>
            </div>
            <div className="dm-sc-bot split">
              <span className="dm-sc-desc">75% dari total</span>
              <div className="dm-sc-spark">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkHadir}>
                    <Line type="monotone" dataKey="uv" stroke="#10B981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="dm-stat-card">
            <div className="dm-sc-top">
              <div className="dm-sc-icon-box" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
                <Clock size={24} />
              </div>
              <div className="dm-sc-val">
                <h2>18</h2>
                <p>Terlambat</p>
              </div>
            </div>
            <div className="dm-sc-bot split">
              <span className="dm-sc-desc">14% dari total</span>
              <div className="dm-sc-spark">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkTerlambat}>
                    <Line type="monotone" dataKey="uv" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="dm-stat-card">
            <div className="dm-sc-top">
              <div className="dm-sc-icon-box" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                <XCircle size={24} />
              </div>
              <div className="dm-sc-val">
                <h2>14</h2>
                <p>Tidak Hadir</p>
              </div>
            </div>
            <div className="dm-sc-bot split">
              <span className="dm-sc-desc">11% dari total</span>
              <div className="dm-sc-spark">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkAbsen}>
                    <Line type="monotone" dataKey="uv" stroke="#EF4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="dm-stat-card">
            <div className="dm-sc-top">
              <div className="dm-sc-icon-box" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
                <CalendarIcon size={24} />
              </div>
              <div className="dm-sc-val">
                <h2>92%</h2>
                <p>Tingkat Kehadiran</p>
              </div>
            </div>
            <div className="dm-sc-bot">
              <span className="dm-sc-trend up"><ArrowUp size={12}/> 4% dari minggu lalu</span>
            </div>
          </div>

        </div>

        {/* MAIN GRID */}
        <div className="dm-main-grid">
          
          {/* KOLOM KIRI */}
          <div className="dm-col-left">
            
            {/* TREN KEHADIRAN */}
            <div className="dm-card">
              <div className="dm-card-header flex-between">
                <div>
                  <h3 className="dm-card-title">Tren Kehadiran</h3>
                  <div className="dm-legend">
                    <span className="dl-item"><span className="dot bg-green"></span> Hadir</span>
                    <span className="dl-item"><span className="dot bg-orange"></span> Terlambat</span>
                    <span className="dl-item"><span className="dot bg-red"></span> Tidak Hadir</span>
                  </div>
                </div>
                <div className="dm-filter-btn" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowTrendFilter(!showTrendFilter)}>
                  {trendFilter} <ChevronDown size={14} />
                  {showTrendFilter && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={(e) => { e.stopPropagation(); setShowTrendFilter(false); }} />
                      <div style={{ position: 'absolute', right: 0, top: '30px', width: '120px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 1000, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <button style={{ width: '100%', padding: '8px 12px', background: 'white', border: 'none', borderBottom: '1px solid #F1F5F9', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setTrendFilter('Harian'); setShowTrendFilter(false); }}>Harian</button>
                        <button style={{ width: '100%', padding: '8px 12px', background: 'white', border: 'none', borderBottom: '1px solid #F1F5F9', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setTrendFilter('Mingguan'); setShowTrendFilter(false); }}>Mingguan</button>
                        <button style={{ width: '100%', padding: '8px 12px', background: 'white', border: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setTrendFilter('Bulanan'); setShowTrendFilter(false); }}>Bulanan</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="dm-card-body" style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="hadir" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="terlambat" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="absen" stroke="#EF4444" strokeWidth={2} dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KEHADIRAN PER DIVISI */}
            <div className="dm-card">
              <div className="dm-card-header">
                <h3 className="dm-card-title">Kehadiran Per Divisi</h3>
              </div>
              <div className="dm-card-body table-responsive">
                <table className="dm-table">
                  <thead>
                    <tr>
                      <th>Divisi</th>
                      <th className="t-center">Karyawan</th>
                      <th className="t-center">Hadir</th>
                      <th className="t-center">Terlambat</th>
                      <th className="t-center">Tidak Hadir</th>
                      <th>Tingkat Kehadiran</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {divisiData.map((div, i) => (
                      <tr key={i}>
                        <td>
                          <div className="div-info">
                            <div className="div-icon" style={{ background: div.bg, color: div.iconColor }}>
                              <div.icon size={16} />
                            </div>
                            <span className="div-name">{div.name}</span>
                          </div>
                        </td>
                        <td className="t-center fw-500">{div.kar}</td>
                        <td className="t-center text-green fw-500">{div.hadir}</td>
                        <td className="t-center text-orange fw-500">{div.telat}</td>
                        <td className="t-center text-red fw-500">{div.absen}</td>
                        <td>
                          <div className="div-progress-cell">
                            <span className="div-pct">{div.pct}%</span>
                            <div className="div-bar-bg">
                              <div className="div-bar-fill" style={{ width: `${div.pct}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="t-right">
                          <button className="btn-chevron"><ChevronRight size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="dm-card-footer">
                <Link to="/manager/tim" className="dm-link">Lihat Semua Divisi <ChevronRight size={14} /></Link>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN */}
          <div className="dm-col-right">
            
            {/* KEHADIRAN HARI INI */}
            <div className="dm-card">
              <div className="dm-card-header">
                <h3 className="dm-card-title">Kehadiran Hari Ini</h3>
              </div>
              <div className="dm-card-body donut-body">
                <div className="donut-chart-box">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-center">
                    <h3>128</h3>
                    <p>Total</p>
                  </div>
                </div>
                <div className="donut-legend">
                  <div className="d-leg-item">
                    <div className="d-leg-left"><span className="dot bg-green"></span> Hadir</div>
                    <div className="d-leg-right"><strong>96</strong> (75%)</div>
                  </div>
                  <div className="d-leg-item">
                    <div className="d-leg-left"><span className="dot bg-orange"></span> Terlambat</div>
                    <div className="d-leg-right"><strong>18</strong> (14%)</div>
                  </div>
                  <div className="d-leg-item">
                    <div className="d-leg-left"><span className="dot bg-red"></span> Tidak Hadir</div>
                    <div className="d-leg-right"><strong>14</strong> (11%)</div>
                  </div>
                </div>
              </div>
              <div className="dm-card-footer">
                <Link to="/manager/absensi" className="dm-link">Lihat Detail Kehadiran <ChevronRight size={14} /></Link>
              </div>
            </div>

            {/* AKTIVITAS TERBARU */}
            <div className="dm-card">
              <div className="dm-card-header flex-between">
                <h3 className="dm-card-title">Aktivitas Terbaru</h3>
                <Link to="/manager/riwayat" className="dm-link-small">Lihat Semua</Link>
              </div>
              <div className="dm-card-body p-0">
                <div className="dm-act-list">
                  
                  {aktivitasData.map(act => (
                    <div className="dm-act-item" key={act.id}>
                      <div className="act-indicator">
                        <div className={`act-dot bg-${act.type}`}></div>
                        <div className="act-line"></div>
                      </div>
                      {act.img ? (
                        <img src={act.img} alt={act.name} className="act-avatar" />
                      ) : (
                        <div className="act-icon-wrapper">
                          <act.icon size={16} color="#3B82F6" />
                        </div>
                      )}
                      <div className="act-content-text">
                        <h4>{act.name}</h4>
                        <p>{act.desc}</p>
                      </div>
                      <div className="act-time-text">{act.time}</div>
                    </div>
                  ))}

                </div>
              </div>
              <div className="dm-card-footer border-top">
                <Link to="/manager/riwayat" className="dm-link">Lihat Semua Aktivitas <ChevronRight size={14} /></Link>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM BANNER */}
        <div className="dm-bottom-banner">
          <div className="bb-left">
            <div className="bb-icon">
              <TrendingUp size={24} color="white" />
            </div>
            <div className="bb-text">
              <h4>Performa Kehadiran Minggu Ini</h4>
              <p>Tingkat kehadiran tim Anda meningkat 4% dibandingkan minggu lalu.</p>
            </div>
          </div>
          <Link to="/manager/laporan" className="bb-btn" style={{ textDecoration: 'none' }}>
            Lihat Laporan Lengkap <ChevronRight size={16} />
          </Link>
        </div>

      </div>
  );
}
