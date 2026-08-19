import React, { useState } from 'react';
import { 
  FileText, Download, Calendar, Filter, FileSpreadsheet, 
  BarChart2, FileIcon, Search, CheckCircle2 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './LaporanManager.css';

const chartData = [];

export default function LaporanManager() {
  const [reportType, setReportType] = useState('Bulanan');
  const [isExporting, setIsExporting] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().split('T')[0];
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[new Date().getMonth()];
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const getPeriodLabel = () => {
    if (reportType === 'Harian') {
      const d = new Date(selectedDate);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (reportType === 'Mingguan') {
      const d = new Date(selectedDate);
      // Dapatkan awal minggu
      const firstDay = new Date(d.setDate(d.getDate() - d.getDay() + 1));
      const lastDay = new Date(d.setDate(d.getDate() - d.getDay() + 7));
      return `Minggu (${firstDay.getDate()} ${firstDay.toLocaleDateString('id-ID', { month: 'short' })} - ${lastDay.getDate()} ${lastDay.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })})`;
    }
    if (reportType === 'Bulanan') {
      return `${selectedMonth} ${selectedYear}`;
    }
    return `Tahun ${selectedYear}`;
  };

  const handleExport = (type) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const periodStr = getPeriodLabel();
      const newReport = {
        id: Date.now(),
        name: `Laporan ${reportType} - ${periodStr}`,
        date: new Date().toLocaleDateString('id-ID'),
        type
      };
      setHistoryList([newReport, ...historyList]);
      alert(`Laporan ${reportType} (${periodStr}) berhasil diekspor sebagai file ${type}!`);
    }, 1200);
  };

  const handleDownloadHistory = (name) => {
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`Dokumen Laporan: ${name}`);
    link.download = `${name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mgr-page-content">
      <div className="lm-header">
        <h1>Laporan & Analitik</h1>
        <p>Buat, pantau, dan unduh laporan absensi perusahaan secara instan.</p>
      </div>

      <div className="lm-grid">
        {/* LEFT COLUMN */}
        <div className="lm-left-col">
          
          {/* ANALYTICS CARD */}
          <div className="lm-card">
            <div className="lm-card-header">
              <h3>Tren Kehadiran 2026</h3>
              <div className="lm-legend">
                <span className="lm-legend-item"><span className="lm-dot green"></span> Hadir</span>
                <span className="lm-legend-item"><span className="lm-dot orange"></span> Terlambat</span>
              </div>
            </div>
            <div className="lm-chart-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {chartData.length === 0 ? (
                <div style={{ color: '#64748B', fontSize: '14px', textAlign: 'center' }}>
                  Belum ada data analitik tren kehadiran di database.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="hadir" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} barSize={30} />
                    <Bar dataKey="telat" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="cuti" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* GENERATE REPORT CARD */}
          <div className="lm-card">
            <div className="lm-card-header">
              <h3>Buat Laporan Baru</h3>
            </div>
            <div className="lm-form-grid">
              <div className="lm-field-group">
                <label>Tipe Laporan</label>
                <select className="lm-select" value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option>Harian</option>
                  <option>Mingguan</option>
                  <option>Bulanan</option>
                  <option>Tahunan</option>
                </select>
              </div>
              <div className="lm-field-group">
                <label>Pilih Periode</label>
                <div className="lm-input-wrapper">
                  <Calendar size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  {reportType === 'Harian' && (
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={e => setSelectedDate(e.target.value)} 
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#334155' }}
                    />
                  )}
                  {reportType === 'Mingguan' && (
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={e => setSelectedDate(e.target.value)} 
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#334155' }}
                    />
                  )}
                  {reportType === 'Bulanan' && (
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <select 
                        value={selectedMonth} 
                        onChange={e => setSelectedMonth(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: '#334155', cursor: 'pointer', flex: 1, padding: '10px 0' }}
                      >
                        <option value="Januari">Januari</option>
                        <option value="Februari">Februari</option>
                        <option value="Maret">Maret</option>
                        <option value="April">April</option>
                        <option value="Mei">Mei</option>
                        <option value="Juni">Juni</option>
                        <option value="Juli">Juli</option>
                        <option value="Agustus">Agustus</option>
                        <option value="September">September</option>
                        <option value="Oktober">Oktober</option>
                        <option value="November">November</option>
                        <option value="Desember">Desember</option>
                      </select>
                      <select 
                        value={selectedYear} 
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: '#334155', cursor: 'pointer', width: '80px', padding: '10px 0' }}
                      >
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>
                      </select>
                    </div>
                  )}
                  {reportType === 'Tahunan' && (
                    <select 
                      value={selectedYear} 
                      onChange={e => setSelectedYear(Number(e.target.value))}
                      style={{ border: 'none', background: 'transparent', outline: 'none', color: '#334155', cursor: 'pointer', width: '100%', padding: '10px 0' }}
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="lm-field-group">
                <label>Filter Divisi</label>
                <div className="lm-input-wrapper">
                  <Filter size={16} color="#94A3B8" />
                  <select>
                    <option>Semua Divisi</option>
                    <option>IT Development</option>
                    <option>Finance</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="lm-btn-row">
              <button onClick={() => handleExport('PDF')} disabled={isExporting} className="lm-btn pdf">
                {isExporting ? <span className="spinner"></span> : <FileIcon size={18} />}
                Ekspor ke PDF
              </button>
              <button onClick={() => handleExport('Excel')} disabled={isExporting} className="lm-btn excel">
                {isExporting ? <span className="spinner"></span> : <FileSpreadsheet size={18} />}
                Ekspor ke Excel
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div>
          <div className="lm-card">
            <div className="lm-card-header">
              <h3>Riwayat Laporan</h3>
            </div>
            
            <div className="lm-history-list">
              {historyList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748B', fontSize: '13px' }}>
                  Belum ada riwayat laporan yang diekspor.
                </div>
              ) : (
                historyList.map((item) => (
                  <div key={item.id} className="lm-history-item">
                    <div className="lm-hi-icon">
                      <FileText size={20} />
                    </div>
                    <div className="lm-hi-text">
                      <h4>{item.name}</h4>
                      <p>Ekspor {item.type} • {item.date}</p>
                    </div>
                    <button onClick={() => handleDownloadHistory(item.name)} className="lm-hi-btn">
                      <Download size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <button className="lm-btn-outline">
              Lihat Semua Riwayat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
