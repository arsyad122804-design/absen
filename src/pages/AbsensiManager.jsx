import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, CheckCircle2, BarChart2, XCircle, TrendingUp, Calendar, 
  Download, Search, Filter, Eye, MoreVertical, Clock, Info, AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import './AbsensiManager.css';

// --- MOCK DATA ---
const initialTableData = [
  { id: 1, img: 'https://ui-avatars.com/api/?name=Dewi+Hartati', name: 'Dewi Hartati', div: 'Operasional', status: 'Hadir', jamM: '07:32', statM: 'Tepat Waktu', jamP: '16:01', dur: '8j 29m', loc: 'Kantor Pusat' },
  { id: 2, img: 'https://ui-avatars.com/api/?name=Rizky+Maulana', name: 'Rizky Maulana', div: 'Marketing', status: 'Terlambat', jamM: '08:15', statM: '45m Terlambat', jamP: '16:20', dur: '8j 5m', loc: 'Kantor Pusat' },
  { id: 3, img: 'https://ui-avatars.com/api/?name=Siti+Nurhaliza', name: 'Siti Nurhaliza', div: 'IT Development', status: 'Hadir', jamM: '07:45', statM: 'Tepat Waktu', jamP: '16:10', dur: '8j 25m', loc: 'Kantor Pusat' },
  { id: 4, img: 'https://ui-avatars.com/api/?name=Budi+Santoso', name: 'Budi Santoso', div: 'Finance', status: 'Hadir', jamM: '07:28', statM: 'Tepat Waktu', jamP: '16:00', dur: '8j 32m', loc: 'Kantor Pusat' },
  { id: 5, img: 'https://ui-avatars.com/api/?name=Ahmad+Fauzi', name: 'Ahmad Fauzi', div: 'HR & GA', status: 'Tidak Hadir', jamM: '-', statM: '-', jamP: '-', dur: '-', loc: '-' },
  { id: 6, img: 'https://ui-avatars.com/api/?name=Lina+Agustina', name: 'Lina Agustina', div: 'Finance', status: 'Hadir', jamM: '07:50', statM: 'Tepat Waktu', jamP: '16:05', dur: '8j 15m', loc: 'Kantor Pusat' },
  { id: 7, img: 'https://ui-avatars.com/api/?name=Yoga+Pratama', name: 'Yoga Pratama', div: 'IT Development', status: 'Terlambat', jamM: '08:05', statM: '35m Terlambat', jamP: '16:00', dur: '7j 55m', loc: 'Kantor Pusat' },
];

const DONUT_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

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

export default function AbsensiManager() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('Semua Divisi');
  const dateInputRef = useRef(null);

  const handleDatePickerClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().split('T')[0];
  });

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  };

  const [tableData, setTableData] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchLiveAbsensi = async () => {
      const local = safeJsonParse('local_absensi', []);
      const localKaryawan = safeJsonParse('local_karyawan', []);
      
      let dbData = [];
      let dbKaryawan = [];
      try {
        const { data } = await supabase.from('absensi').select('*');
        if (data) dbData = data;
        const { data: kData } = await supabase.from('karyawan').select('*');
        if (kData) dbKaryawan = kData;
      } catch(e) {}

      const allEmps = [...localKaryawan, ...dbKaryawan];
      const combined = [...local, ...dbData];

      // 1. Dapatkan daftar karyawan unik
      const uniqueEmps = [];
      allEmps.forEach(emp => {
        if (emp.name && !uniqueEmps.some(u => u.name?.toLowerCase() === emp.name?.toLowerCase())) {
          uniqueEmps.push(emp);
        }
      });

      // 2. Filter absensi untuk tanggal terpilih saja
      const filteredAbs = combined.filter(ab => ab.tanggal === selectedDate);

      // 3. Petakan seluruh karyawan
      const mapped = uniqueEmps.map((emp, idx) => {
        const userAbs = filteredAbs.filter(ab => 
          String(ab.karyawan_id) === String(emp.id) || 
          (ab.nama && emp.name && ab.nama.toLowerCase() === emp.name.toLowerCase()) ||
          (ab.nama_karyawan && emp.name && ab.nama_karyawan.toLowerCase() === emp.name.toLowerCase())
        );
        
        if (userAbs.length > 0) {
          // Urutkan biar Sesi 1 duluan
          userAbs.sort((a, b) => (a.waktu_masuk || '').localeCompare(b.waktu_masuk || ''));
          const r = userAbs[0];
          
          // Gabungkan status
          const hasLate = userAbs.some(ab => ab.status === 'Terlambat');
          const finalStatus = hasLate ? 'Terlambat' : r.status;
          
          const empDiv = (emp.divisi || emp.div || '').toLowerCase();
          const isKep = empDiv.includes('pesantren') || empDiv.includes('santri') || empDiv.includes('asrama');

          let jamMasukStr = '';
          let jamPulangStr = '';

          if (isKep) {
            const s1 = userAbs[0];
            const s2 = userAbs[1];
            jamMasukStr = `S1: ${s1?.waktu_masuk ? s1.waktu_masuk.substring(0, 5) : '-'} | S2: ${s2?.waktu_masuk ? s2.waktu_masuk.substring(0, 5) : 'Belum Absen'}`;
            jamPulangStr = `S1: ${s1?.waktu_keluar ? s1.waktu_keluar.substring(0, 5) : '-'} | S2: ${s2?.waktu_keluar ? s2.waktu_keluar.substring(0, 5) : 'Belum Absen'}`;
          } else {
            jamMasukStr = userAbs.map(ab => ab.waktu_masuk ? ab.waktu_masuk.substring(0, 5) : '-').join(' | ');
            jamPulangStr = userAbs.map(ab => ab.waktu_keluar ? ab.waktu_keluar.substring(0, 5) : '-').join(' | ');
          }

          const allKets = userAbs.map(ab => ab.keterangan).filter(k => k && k !== '-' && k !== 'null').join('; ');
          const lateKet = allKets || r.keterangan || '-';

          return {
            id: r.id || `local-${idx}`,
            img: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name || 'Karyawan')}`,
            name: emp.name,
            div: emp.divisi || emp.div || 'Operasional',
            status: finalStatus === 'Hadir' ? 'Tepat Waktu' : (finalStatus || 'Tepat Waktu'),
            jamM: jamMasukStr,
            statM: finalStatus === 'Terlambat' ? 'Terlambat' : 'Tepat Waktu',
            jamP: jamPulangStr,
            dur: '-',
            loc: r.lokasi ? 'Lokasi Presisi (GPS)' : 'Tanpa Lokasi',
            ket: lateKet,
            sessions: userAbs
          };
        } else {
          return {
            id: `unabs-${idx}`,
            img: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name || 'Karyawan')}`,
            name: emp.name,
            div: emp.divisi || emp.div || 'Operasional',
            status: 'Tidak Hadir',
            jamM: '-',
            statM: '-',
            jamP: '-',
            dur: '-',
            loc: '-'
          };
        }
      });

      setTableData(mapped);
    };

    fetchLiveAbsensi();
  }, [selectedDate]);

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let rowsHtml = '';
    filteredData.forEach((row, idx) => {
      const statusColor = row.status === 'Hadir' ? '#16a34a' : (row.status === 'Terlambat' ? '#d97706' : '#dc2626');
      rowsHtml += `
        <tr>
          <td style="padding:10px 8px;border:1px solid #cbd5e1;text-align:center;">${idx + 1}</td>
          <td style="padding:10px 8px;border:1px solid #cbd5e1;font-weight:bold;color:#0f172a;">${row.name}</td>
          <td style="padding:10px 8px;border:1px solid #cbd5e1;">${row.div}</td>
          <td style="padding:10px 8px;border:1px solid #cbd5e1;text-align:center;">${row.jamM || '-'}</td>
          <td style="padding:10px 8px;border:1px solid #cbd5e1;text-align:center;">${row.jamP || '-'}</td>
          <td style="padding:10px 8px;border:1px solid #cbd5e1;text-align:center;font-size:12px;">${row.dur || '-'}</td>
          <td style="padding:10px 8px;border:1px solid #cbd5e1;font-weight:bold;color:${statusColor};">${row.status}</td>
          <td style="padding:10px 8px;border:1px solid #cbd5e1;font-size:12px;color:#475569;">📍 ${row.loc || '-'}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Kehadiran - ${getFormattedDate(selectedDate)}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.4; }
            .header-box { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 14px; margin-bottom: 20px; }
            .header-title h1 { margin: 0; font-size: 22px; color: #0f172a; font-weight: 800; letter-spacing: -0.5px; }
            .header-title p { margin: 4px 0 0 0; font-size: 13px; color: #64748b; }
            .header-title .date-tag { margin-top: 6px; font-size: 13px; color: #2563eb; font-weight: 700; display: inline-block; }
            .badge-doc { background: #eff6ff; color: #1e40af; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; border: 1px solid #bfdbfe; }
            
            .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
            .scard { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; text-align: center; }
            .scard .num { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
            .scard .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { background: #f1f5f9; padding: 10px 8px; border: 1px solid #cbd5e1; text-align: left; font-size: 11px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; }
            
            .footer-sign { margin-top: 40px; display: flex; justify-content: flex-end; }
            .sign-box { text-align: center; width: 220px; }
            .sign-space { height: 60px; }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div class="header-title">
              <h1>LAPORAN KEHADIRAN KARYAWAN</h1>
              <p>Hibatullah International Islamic Boarding School</p>
              <div class="date-tag">📅 ${getFormattedDate(selectedDate)}</div>
            </div>
            <div>
              <span class="badge-doc">DOKUMEN RESMI MANAGER</span>
            </div>
          </div>

          <div class="summary-cards">
            <div class="scard">
              <div class="num">${total}</div>
              <div class="lbl">Total Karyawan</div>
            </div>
            <div class="scard" style="border-top:3px solid #10b981;">
              <div class="num" style="color:#10b981;">${hadir}</div>
              <div class="lbl">Hadir Tepat Waktu</div>
            </div>
            <div class="scard" style="border-top:3px solid #f59e0b;">
              <div class="num" style="color:#f59e0b;">${terlambat}</div>
              <div class="lbl">Terlambat</div>
            </div>
            <div class="scard" style="border-top:3px solid #ef4444;">
              <div class="num" style="color:#ef4444;">${tidakHadir}</div>
              <div class="lbl">Tidak Hadir / Cuti</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align:center;">No</th>
                <th>Nama Karyawan</th>
                <th>Divisi</th>
                <th style="text-align:center;">Jam Masuk</th>
                <th style="text-align:center;">Jam Pulang</th>
                <th style="text-align:center;">Durasi</th>
                <th>Status</th>
                <th>Lokasi Presisi</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer-sign">
            <div class="sign-box">
              <p style="font-size:12px;color:#475569;margin:0;">Bojonegoro, ${new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
              <p style="font-size:12px;font-weight:bold;color:#0f172a;margin:2px 0 0 0;">Manager Operasional & HR</p>
              <div class="sign-space"></div>
              <p style="font-size:12px;font-weight:bold;color:#0f172a;margin:0;border-top:1px solid #94a3b8;padding-top:4px;">( Tanda Tangan & Cap )</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleMenu = (id) => {
    if (activeMenuId === id) setActiveMenuId(null);
    else setActiveMenuId(id);
  };

  useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const divSet = new Set(tableData.map(d => d.div));

  // APPLY FILTERS
  const filteredData = tableData.filter(row => {
    const matchTab = activeTab === 'Semua' || row.status === activeTab;
    const matchSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        row.div.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDivisi = filterDivisi === 'Semua Divisi' || row.div === filterDivisi;
    
    return matchTab && matchSearch && matchDivisi;
  });

  // Calculate dynamic stats
  const total = tableData.length;
  const hadir = tableData.filter(d => d.status === 'Hadir').length;
  const terlambat = tableData.filter(d => d.status === 'Terlambat').length;
  const tidakHadir = tableData.filter(d => d.status === 'Tidak Hadir' || d.status === 'Izin' || d.status === 'Sakit').length;

  const donutData = [
    { name: 'Hadir', value: hadir },
    { name: 'Terlambat', value: terlambat },
    { name: 'Tidak Hadir', value: tidakHadir },
  ];

  return (
    <div className="am-page">
      
      {/* HEADER */}
      <div className="am-header-row hide-on-print">
        <div className="am-hl">
          <h1>Absensi Manager</h1>
          <p>Pantau dan kelola kehadiran tim Anda secara real-time.</p>
        </div>
        <div className="am-hr">
          <div className="am-date-picker" onClick={handleDatePickerClick} style={{ position: 'relative', cursor: 'pointer' }}>
            <Calendar size={16} color="#64748B" style={{ pointerEvents: 'none' }} />
            <input 
              ref={dateInputRef}
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                zIndex: 5
              }}
            />
            <span style={{ pointerEvents: 'none' }}>{getFormattedDate(selectedDate)}</span>
            <span className="caret" style={{ pointerEvents: 'none' }}>▼</span>
          </div>
          <button className="btn-export" onClick={handleExportPDF}>
            <Download size={16} /> Ekspor Laporan
          </button>
          <div className="am-notif">
            <BellIcon />
          </div>
        </div>
      </div>

      {/* 5 TOP CARDS */}
      <div className="am-top-cards hide-on-print">
        
        <div className="am-tcard">
          <div className="amt-left">
            <div className="amt-icon blue"><Users size={24} /></div>
          </div>
          <div className="amt-right">
            <h2>{total}</h2>
            <p>Total Karyawan</p>
            <span className="amt-desc">Semua Divisi</span>
          </div>
        </div>

        <div className="am-tcard">
          <div className="amt-left">
            <div className="amt-icon green"><CheckCircle2 size={24} /></div>
          </div>
          <div className="amt-right">
            <h2>{hadir}</h2>
            <p>Hadir</p>
            <span className="amt-desc flex-between">{total > 0 ? Math.round((hadir/total)*100) : 0}% dari total</span>
          </div>
        </div>

        <div className="am-tcard">
          <div className="amt-left">
            <div className="amt-icon orange"><BarChart2 size={24} /></div>
          </div>
          <div className="amt-right">
            <h2>{terlambat}</h2>
            <p>Terlambat</p>
            <span className="amt-desc flex-between">{total > 0 ? Math.round((terlambat/total)*100) : 0}% dari total</span>
          </div>
        </div>

        <div className="am-tcard">
          <div className="amt-left">
            <div className="amt-icon red"><XCircle size={24} /></div>
          </div>
          <div className="amt-right">
            <h2>{tidakHadir}</h2>
            <p>Tidak Hadir</p>
            <span className="amt-desc flex-between">{total > 0 ? Math.round((tidakHadir/total)*100) : 0}% dari total</span>
          </div>
        </div>

        <div className="am-tcard">
          <div className="amt-left">
            <div className="amt-icon blue-light"><TrendingUp size={24} /></div>
          </div>
          <div className="amt-right">
            <h2>{total > 0 ? Math.round(((hadir+terlambat)/total)*100) : 0}%</h2>
            <p>Tingkat Kehadiran</p>
            <span className="amt-desc flex-between">{total > 0 ? 'Aktif' : 'Belum Ada Data'}</span>
          </div>
        </div>

      </div>

      {/* 3 MIDDLE CARDS */}
      <div className="am-mid-cards hide-on-print">
        
        {/* Ringkasan */}
        <div className="am-mcard">
          <h3>Ringkasan Kehadiran Hari Ini</h3>
          <div className="am-mc-body">
            <div className="mc-donut">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                    {donutData.map((e, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mc-donut-text">
                <h2>{total}</h2>
                <p>Total</p>
              </div>
            </div>
            <div className="mc-legend">
              <div className="mcl-item"><span className="dot green"></span> Hadir <strong style={{marginLeft: 'auto'}}>{hadir}</strong> ({total > 0 ? Math.round((hadir/total)*100) : 0}%)</div>
              <div className="mcl-item"><span className="dot orange"></span> Terlambat <strong style={{marginLeft: 'auto'}}>{terlambat}</strong> ({total > 0 ? Math.round((terlambat/total)*100) : 0}%)</div>
              <div className="mcl-item"><span className="dot red"></span> Tidak Hadir <strong style={{marginLeft: 'auto'}}>{tidakHadir}</strong> ({total > 0 ? Math.round((tidakHadir/total)*100) : 0}%)</div>
            </div>
          </div>
        </div>

        {/* Real-time */}
        <div className="am-mcard">
          <div className="flex-between">
            <h3>Kehadiran Real-time</h3>
            <span className="badge-live">Live</span>
          </div>
          <div className="am-rt-list">
            <div className="rt-item"><span><span className="icon">🏠</span> Sedang Check-in</span> <strong className="green">{hadir}</strong></div>
            <div className="rt-item"><span><span className="icon">👥</span> Sedang Bekerja</span> <strong className="blue">{hadir}</strong></div>
            <div className="rt-item"><span><span className="icon">🕒</span> Sedang Istirahat</span> <strong className="orange">0</strong></div>
            <div className="rt-item"><span><span className="icon">✅</span> Sudah Check-out</span> <strong className="gray">0</strong></div>
          </div>
        </div>

        {/* Rata-rata */}
        <div className="am-mcard">
          <h3>Rata-rata Jam Kerja</h3>
          <div className="am-avg-body">
            <div className="avg-big">
              <div className="icon-blue"><Clock size={24} /></div>
              <div className="avg-text">
                <h2>{total > 0 ? '7j 45m' : '0j 0m'}</h2>
                <p>Dari 8 jam standar</p>
              </div>
            </div>
            <div className="avg-bar-container">
              <div className="avg-bar-fill" style={{ width: total > 0 ? '96%' : '0%' }}></div>
            </div>
            <div className="avg-eff flex-between">
              <span>Efisiensi Hari Ini</span>
              <strong className={total > 0 ? "green" : ""}>{total > 0 ? '96%' : '0%'}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* TABLE SECTION */}
      <div className="am-table-card print-section" ref={tableRef}>
        <div className="print-header hide-on-screen">
          <h1>Laporan Kehadiran Karyawan</h1>
          <p>Periode: {getFormattedDate(selectedDate)}</p>
        </div>

        <div className="am-tc-header hide-on-print">
          <div className="tc-tabs">
            <button className={`tc-tab ${activeTab === 'Semua' ? 'active' : ''}`} onClick={() => setActiveTab('Semua')}>Semua ({total})</button>
            <button className={`tc-tab ${activeTab === 'Hadir' ? 'active' : ''}`} onClick={() => setActiveTab('Hadir')}>Hadir ({hadir})</button>
            <button className={`tc-tab ${activeTab === 'Terlambat' ? 'active' : ''}`} onClick={() => setActiveTab('Terlambat')}>Terlambat ({terlambat})</button>
            <button className={`tc-tab ${activeTab === 'Tidak Hadir' ? 'active' : ''}`} onClick={() => setActiveTab('Tidak Hadir')}>Tidak Hadir ({tidakHadir})</button>
          </div>
          <div className="tc-filters">
            <div className="search-box">
              <Search size={16} color="#94A3B8" />
              <input type="text" placeholder="Cari karyawan..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="filter-box" style={{padding: '0', position: 'relative'}}>
              <select value={filterDivisi} onChange={e => setFilterDivisi(e.target.value)} style={{ appearance: 'none', background: 'transparent', border: 'none', width: '100%', height: '100%', padding: '8px 36px 8px 16px', color: '#0F172A', fontWeight: 500, outline: 'none', cursor: 'pointer' }}>
                <option value="Semua Divisi">Semua Divisi</option>
                {[...divSet].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="caret" style={{position: 'absolute', right: '12px', top: '10px', pointerEvents: 'none'}}>▼</span>
            </div>
          </div>
        </div>

        <div className="table-wrapper hide-on-mobile">
          <table className="am-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Divisi</th>
                <th>Status</th>
                <th>Jam Masuk</th>
                <th>Jam Pulang</th>
                <th>Durasi Kerja</th>
                <th>Lokasi</th>
                <th className="hide-on-print">Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="8" style={{textAlign: 'center', padding: '32px', color: '#64748B'}}>Tidak ada karyawan yang cocok dengan filter.</td>
                </tr>
              )}
              {filteredData.map(row => (
                <tr key={row.id}>
                  <td>
                    <div className="td-user">
                      <img src={row.img} alt={row.name} />
                      <strong>{row.name}</strong>
                    </div>
                  </td>
                  <td>{row.div}</td>
                  <td>
                    <span className={`badge-status ${row.status.toLowerCase().replace(' ', '-')}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    {row.jamM !== '-' ? (
                      <div className="td-time">
                        <strong>{row.jamM}</strong>
                        <span className={`time-stat ${row.status === 'Terlambat' ? 'orange' : 'green'}`}>{row.statM}</span>
                        {row.ket && row.ket !== '-' && (
                          <div style={{ fontSize: '11px', color: '#D97706', fontStyle: 'italic', marginTop: '2px', fontWeight: 500 }}>
                            💬 Alasan: "{row.ket}"
                          </div>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  <td>{row.jamP}</td>
                  <td>{row.dur}</td>
                  <td>
                    {row.loc !== '-' ? (
                      <span className="td-loc"><span className="icon">📍</span> {row.loc}</span>
                    ) : '-'}
                  </td>
                  <td className="hide-on-print">
                    <div className="td-actions" style={{position: 'relative'}}>
                      <button onClick={() => alert(`Detail Kehadiran: ${row.name}\nDivisi: ${row.div}\nStatus: ${row.status}`)}>
                        <Eye size={16}/>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggleMenu(row.id); }}>
                        <MoreVertical size={16}/>
                      </button>
                      
                      {activeMenuId === row.id && (
                        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: '0', top: '30px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '8px', minWidth: '150px' }}>
                          <button onClick={() => alert('Log Aktivitas ' + row.name)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#0F172A', fontSize: '13px', fontWeight: 500 }}>
                            <Info size={14} /> Log Aktivitas
                          </button>
                          <button onClick={() => alert('Beri Surat Peringatan: ' + row.name)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#EF4444', fontSize: '13px', fontWeight: 500 }}>
                            <AlertTriangle size={14} /> Peringatan
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARD LIST FOR MOBILE */}
        <div className="am-card-list show-on-mobile" style={{ padding: '16px', boxSizing: 'border-box' }}>
          {filteredData.length === 0 ? (
            <div style={{textAlign:'center', padding: '32px', color: '#64748B'}}>Tidak ada karyawan yang cocok dengan filter.</div>
          ) : (
            filteredData.map((row) => (
              <div key={row.id} className="am-mob-card" style={{ background: 'white', border: '1px solid #F1F5F9', borderRadius: '16px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div className="ammc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="ammc-user" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={row.img} alt={row.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div className="ammc-names" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <strong style={{ fontSize: '14px', color: '#0F172A' }}>{row.name}</strong>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>{row.div}</span>
                    </div>
                  </div>
                  <span className={`badge-status ${row.status.toLowerCase().replace(' ', '-')}`} style={{ margin: 0 }}>
                    {row.status}
                  </span>
                </div>
                
                <div className="ammc-body" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="ammc-info-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748B' }}>Jam Masuk:</span>
                    <strong>{row.jamM} {row.statM && <span className={`time-stat ${row.status === 'Terlambat' ? 'orange' : 'green'}`} style={{ marginLeft: '4px', fontSize: '10px' }}>{row.statM}</span>}</strong>
                  </div>
                  <div className="ammc-info-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748B' }}>Jam Pulang:</span>
                    <strong>{row.jamP}</strong>
                  </div>
                  <div className="ammc-info-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748B' }}>Durasi Kerja:</span>
                    <strong>{row.dur}</strong>
                  </div>
                  <div className="ammc-info-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748B' }}>Lokasi:</span>
                    <strong style={{ maxWidth: '70%', textAlign: 'right', wordBreak: 'break-all' }}>{row.loc !== '-' ? `📍 ${row.loc}` : '-'}</strong>
                  </div>

                  {row.ket && row.ket !== '-' && (
                    <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', color: '#92400E', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{ fontSize: '14px' }}>💬</span>
                      <div>
                        <strong>Alasan Keterlambatan:</strong> {row.ket}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ammc-actions" style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '12px', justifyContent: 'flex-end', position: 'relative' }}>
                  <button onClick={() => alert(`Detail Kehadiran: ${row.name}\nDivisi: ${row.div}\nStatus: ${row.status}`)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <Eye size={14}/> Detail
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button onClick={(e) => { e.stopPropagation(); toggleMenu(row.id); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', color: '#64748B' }}>
                      <MoreVertical size={14}/>
                    </button>
                    {activeMenuId === row.id && (
                      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: '0', bottom: '34px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '8px', minWidth: '150px' }}>
                        <button onClick={() => alert('Log Aktivitas ' + row.name)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#0F172A', fontSize: '13px', fontWeight: 500 }}>
                          <Info size={14} /> Log Aktivitas
                        </button>
                        <button onClick={() => alert('Beri Surat Peringatan: ' + row.name)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#EF4444', fontSize: '13px', fontWeight: 500 }}>
                          <AlertTriangle size={14} /> Peringatan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="am-tc-footer hide-on-print">
          <span>Menampilkan {filteredData.length} data karyawan</span>
          <div className="tc-pagination">
            <button className="pg-btn">‹</button>
            <button className="pg-btn active">1</button>
            <button className="pg-btn">›</button>
          </div>
          <div className="tc-show" style={{position: 'relative', cursor: 'pointer'}}>
            Tampilkan 
            <select style={{appearance: 'none', background: 'transparent', border: 'none', outline: 'none', padding: '0 16px 0 4px', fontWeight: 600, color: '#0F172A'}}>
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span style={{position: 'absolute', right: '4px', top: '2px', fontSize: '10px'}}>▼</span> 
            data
          </div>
        </div>

      </div>

    </div>
  );
}

function BellIcon() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setOpen(!open)} 
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', right: 0, top: '36px', width: '280px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 1000, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Notifikasi Absensi</h3>
              <span onClick={() => setOpen(false)} style={{ fontSize: '12px', color: '#3B82F6', cursor: 'pointer', fontWeight: 500 }}>Tutup</span>
            </div>
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              Belum ada notifikasi baru.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
