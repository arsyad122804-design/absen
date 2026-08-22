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
import { supabase } from '../lib/supabase';
import './DashboardManager.css';

const safeJsonParse = (key, fallback = {}) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
};

export default function DashboardManager() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showTrendFilter, setShowTrendFilter] = useState(false);

  const getTodayLabel = () => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  const getWeekLabel = () => {
    const now = new Date();
    const d1 = new Date(now);
    const d2 = new Date(now);
    const firstDay = new Date(d1.setDate(d1.getDate() - d1.getDay() + 1));
    const lastDay = new Date(d2.setDate(d2.getDate() - d2.getDay() + 7));
    return `${firstDay.getDate()} ${firstDay.toLocaleDateString('id-ID', { month: 'short' })} - ${lastDay.getDate()} ${lastDay.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`;
  };

  const getMonthLabel = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${firstDay.getDate()} ${firstDay.toLocaleDateString('id-ID', { month: 'short' })} - ${lastDay.getDate()} ${lastDay.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`;
  };

  const [dateRange, setDateRange] = useState(() => getMonthLabel());
  const [trendFilter, setTrendFilter] = useState('Harian');
  const [divisiData, setDivisiData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [stats, setStats] = useState({
    totalKaryawan: 0,
    hadir: 0,
    terlambat: 0,
    tidakHadir: 0,
    kehadiranPct: 0
  });

  React.useEffect(() => {
    const userData = safeJsonParse('user', {});
    setUser(userData);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 1. Ambil total karyawan (local + db)
      const localKaryawan = safeJsonParse('local_karyawan', []);
      let dbKaryawan = [];
      try {
        const { data } = await supabase.from('karyawan').select('*');
        if (data) dbKaryawan = data;
      } catch(e) {}
      
      const allKaryawan = [...localKaryawan, ...dbKaryawan];
      const uniqueKaryawan = [];
      allKaryawan.forEach(emp => {
        if (emp.name && !uniqueKaryawan.some(u => u.name?.toLowerCase() === emp.name?.toLowerCase())) {
          uniqueKaryawan.push(emp);
        }
      });
      const totalKaryawan = uniqueKaryawan.length;

      // 2. Ambil absensi hari ini (local + db)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;

      const localAbs = safeJsonParse('local_absensi', []);
      let dbAbs = [];
      try {
        const { data } = await supabase.from('absensi').select('*').eq('tanggal', today);
        if (data) dbAbs = data;
      } catch(e) {}

      // Ambil absensi lokal hari ini
      const localTodayAbs = localAbs.filter(ab => ab.tanggal === today);
      const combinedAbs = [...localTodayAbs, ...dbAbs];

      // Hilangkan duplikat absensi per karyawan_id
      const uniqueAbs = [];
      combinedAbs.forEach(ab => {
        if (ab.karyawan_id && !uniqueAbs.some(u => String(u.karyawan_id) === String(ab.karyawan_id))) {
          uniqueAbs.push(ab);
        }
      });

      console.log("Dashboard fetchStats Debug:", {
        today,
        uniqueKaryawan,
        localAbs,
        localTodayAbs,
        dbAbs,
        combinedAbs,
        uniqueAbs
      });

      let hadir = 0;
      let terlambat = 0;
      let tidakHadir = totalKaryawan;

      uniqueAbs.forEach(ab => {
        if (ab.status === 'Hadir') hadir++;
        if (ab.status === 'Terlambat') terlambat++;
      });
      tidakHadir = totalKaryawan - (hadir + terlambat);

      const kehadiranPct = totalKaryawan > 0 ? Math.round(((hadir + terlambat) / totalKaryawan) * 100) : 0;

      // 3. Hitung stats per divisi
      const divisionMap = {};
      uniqueKaryawan.forEach(emp => {
        const divName = emp.divisi || emp.div || 'Operasional';
        if (!divisionMap[divName]) {
          divisionMap[divName] = {
            kar: 0,
            hadir: 0,
            telat: 0
          };
        }
        divisionMap[divName].kar++;
      });

      uniqueAbs.forEach(ab => {
        const emp = uniqueKaryawan.find(e => String(e.id) === String(ab.karyawan_id));
        if (emp) {
          const divName = emp.divisi || emp.div || 'Operasional';
          if (divisionMap[divName]) {
            if (ab.status === 'Hadir') divisionMap[divName].hadir++;
            if (ab.status === 'Terlambat') divisionMap[divName].telat++;
          }
        }
      });

      const getIconAndBg = (name) => {
        if (name === 'Kepesantrenan') return { icon: Users, color: '#10B981', bg: '#ECFDF5' };
        if (name === 'Sekolah') return { icon: BookOpen, color: '#3B82F6', bg: '#EFF6FF' };
        return { icon: Briefcase, color: '#F59E0B', bg: '#FFFBEB' }; // Operasional
      };

      const computedDivisiData = Object.keys(divisionMap).map(name => {
        const d = divisionMap[name];
        const { icon, color, bg } = getIconAndBg(name);
        return {
          name,
          icon,
          iconColor: color,
          bg,
          kar: d.kar,
          hadir: d.hadir,
          telat: d.telat,
          absen: d.kar - (d.hadir + d.telat),
          pct: d.kar > 0 ? Math.round(((d.hadir + d.telat) / d.kar) * 100) : 0
        };
      });

      setDivisiData(computedDivisiData);

      // Fetch 5 latest activities from Supabase
      let dbRecentAbs = [];
      try {
        const { data } = await supabase
          .from('absensi')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (data) dbRecentAbs = data;
      } catch(e) {}

      // Map to aktivitasData structure
      const mappedActivity = dbRecentAbs.map(r => {
        const emp = uniqueKaryawan.find(e => String(e.id) === String(r.karyawan_id)) || {};
        
        let desc = '';
        let type = 'green';
        if (r.status === 'Hadir') {
          desc = `Melakukan absensi masuk pada jam ${r.waktu_masuk || '-'}`;
          type = 'green';
        } else if (r.status === 'Terlambat') {
          desc = `Melakukan absensi terlambat pada jam ${r.waktu_masuk || '-'}`;
          type = 'orange';
        } else {
          desc = `Mengajukan status ${r.status}: ${r.keterangan || '-'}`;
          type = 'orange';
        }

        return {
          id: r.id,
          name: emp.name || r.nama || r.user_name || 'Karyawan',
          img: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name || r.user_name || 'Karyawan')}`,
          desc,
          time: r.tanggal,
          type
        };
      });

      setRecentActivity(mappedActivity);

      setStats({
        totalKaryawan,
        hadir,
        terlambat,
        tidakHadir: tidakHadir < 0 ? 0 : tidakHadir,
        kehadiranPct
      });

    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const trendData = stats.totalKaryawan > 0 ? [
    { name: 'Hari Ini', hadir: stats.hadir, terlambat: stats.terlambat, absen: stats.tidakHadir }
  ] : [];

  const sparkHadir = stats.hadir > 0 ? [{uv: stats.hadir}] : [];
  const sparkTerlambat = stats.terlambat > 0 ? [{uv: stats.terlambat}] : [];
  const sparkAbsen = stats.tidakHadir > 0 ? [{uv: stats.tidakHadir}] : [];

  const donutData = stats.totalKaryawan > 0 ? [
    { name: 'Hadir', value: stats.hadir },
    { name: 'Terlambat', value: stats.terlambat },
    { name: 'Tidak Hadir', value: stats.tidakHadir },
  ] : [];
  const DONUT_COLORS = ['#10B981', '#F59E0B', '#EF4444'];



  const aktivitasData = recentActivity;

  return (
      <div className="mgr-main">
        {/* Mobile Date Picker */}
        <div className="dm-mobile-date-picker show-on-mobile" onClick={() => setShowDateFilter(!showDateFilter)} style={{ cursor: 'pointer', position: 'relative' }}>
          <CalendarIcon size={16} color="#64748B" />
          <span>{dateRange}</span>
          <ChevronDown size={16} color="#64748B" style={{ marginLeft: 'auto' }} />
          {showDateFilter && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={(e) => { e.stopPropagation(); setShowDateFilter(false); }} />
              <div className="dm-date-dropdown-mobile" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setDateRange(getTodayLabel()); setShowDateFilter(false); }}>Hari Ini</button>
                <button onClick={() => { setDateRange(getWeekLabel()); setShowDateFilter(false); }}>Minggu Ini</button>
                <button onClick={() => { setDateRange(getMonthLabel()); setShowDateFilter(false); }}>Bulan Ini</button>
              </div>
            </>
          )}
        </div>
        
        {/* TOP HEADER */}
        <div className="dm-header-row">
          <div className="dm-header-left">
            <h1>Dasbor Manager</h1>
            <p className="dm-greeting">Selamat datang kembali, <strong>{user.name || 'Manajer'}</strong> 👋</p>
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
                    <button style={{ width: '100%', padding: '10px 16px', background: 'white', border: 'none', borderBottom: '1px solid #F1F5F9', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setDateRange(getTodayLabel()); setShowDateFilter(false); }}>Hari Ini</button>
                    <button style={{ width: '100%', padding: '10px 16px', background: 'white', border: 'none', borderBottom: '1px solid #F1F5F9', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setDateRange(getWeekLabel()); setShowDateFilter(false); }}>Minggu Ini</button>
                    <button style={{ width: '100%', padding: '10px 16px', background: 'white', border: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setDateRange(getMonthLabel()); setShowDateFilter(false); }}>Bulan Ini</button>
                  </div>
                </>
              )}
            </div>

            {/* Notification Dropdown */}
            <div style={{ position: 'relative' }}>
              <button className="dm-btn-notif" onClick={() => setShowNotif(!showNotif)}>
                <Bell size={20} color="#0F172A" />
                {stats.tidakHadir > 0 && <span className="dm-badge">{stats.tidakHadir}</span>}
              </button>
              {showNotif && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowNotif(false)} />
                  <div style={{ position: 'absolute', right: 0, top: '48px', width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 1000, overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Notifikasi</h3>
                      <span onClick={() => setShowNotif(false)} style={{ fontSize: '12px', color: '#3B82F6', cursor: 'pointer', fontWeight: 500 }}>Tutup</span>
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        Belum ada notifikasi baru.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <div className="dm-profile-box" onClick={() => setShowProfile(!showProfile)} style={{ cursor: 'pointer' }}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Manager')}&background=0D8ABC&color=fff`} alt="User" />
                <div className="dm-profile-info">
                  <strong>{user.name || 'Manajer'}</strong>
                  <span>{user.role || 'Manager'}</span>
                </div>
              </div>
              {showProfile && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowProfile(false)} />
                  <div style={{ position: 'absolute', right: 0, top: '56px', width: '220px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 1000, padding: '8px' }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: '8px' }}>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0F172A' }}>{user.name || 'Manajer'}</strong>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>Manager System</span>
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
                <h2>{stats.totalKaryawan}</h2>
                <p>Total Karyawan</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="dm-stat-card">
            <div className="dm-sc-top">
              <div className="dm-sc-icon-box" style={{ background: '#ECFDF5', color: '#10B981' }}>
                <CheckCircle2 size={24} />
              </div>
              <div className="dm-sc-val">
                <h2>{stats.hadir}</h2>
                <p>Hadir</p>
              </div>
            </div>
            <div className="dm-sc-bot split">
              <span className="dm-sc-desc">{stats.totalKaryawan > 0 ? Math.round((stats.hadir/stats.totalKaryawan)*100) : 0}% dari total</span>
              <div className="dm-sc-spark">
                <LineChart width={40} height={20} data={sparkHadir}>
                  <Line type="monotone" dataKey="uv" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
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
                <h2>{stats.terlambat}</h2>
                <p>Terlambat</p>
              </div>
            </div>
            <div className="dm-sc-bot split">
              <span className="dm-sc-desc">{stats.totalKaryawan > 0 ? Math.round((stats.terlambat/stats.totalKaryawan)*100) : 0}% dari total</span>
              <div className="dm-sc-spark">
                <LineChart width={40} height={20} data={sparkTerlambat}>
                  <Line type="monotone" dataKey="uv" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
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
                <h2>{stats.tidakHadir}</h2>
                <p>Tidak Hadir</p>
              </div>
            </div>
            <div className="dm-sc-bot split">
              <span className="dm-sc-desc">{stats.totalKaryawan > 0 ? Math.round((stats.tidakHadir/stats.totalKaryawan)*100) : 0}% dari total</span>
              <div className="dm-sc-spark">
                <LineChart width={40} height={20} data={sparkAbsen}>
                  <Line type="monotone" dataKey="uv" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
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
                <h2>{stats.kehadiranPct}%</h2>
                <p>Tingkat Kehadiran</p>
              </div>
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
                    <h3>{stats.totalKaryawan}</h3>
                    <p>Total</p>
                  </div>
                </div>
                <div className="donut-legend">
                  <div className="d-leg-item">
                    <div className="d-leg-left"><span className="dot bg-green"></span> Hadir</div>
                    <div className="d-leg-right"><strong>{stats.hadir}</strong></div>
                  </div>
                  <div className="d-leg-item">
                    <div className="d-leg-left"><span className="dot bg-orange"></span> Terlambat</div>
                    <div className="d-leg-right"><strong>{stats.terlambat}</strong></div>
                  </div>
                  <div className="d-leg-item">
                    <div className="d-leg-left"><span className="dot bg-red"></span> Tidak Hadir</div>
                    <div className="d-leg-right"><strong>{stats.tidakHadir}</strong></div>
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
                  
                  {aktivitasData.length > 0 ? (
                    aktivitasData.map(act => (
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
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                      Belum ada aktivitas terekam.
                    </div>
                  )}

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
