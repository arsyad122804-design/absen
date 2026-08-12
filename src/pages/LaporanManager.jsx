import React, { useState } from 'react';
import { 
  FileText, Download, Calendar, Filter, FileSpreadsheet, 
  BarChart2, FileIcon, Search, CheckCircle2 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './LaporanManager.css';

const chartData = [
  { name: 'Jan', hadir: 98, telat: 10, cuti: 5 },
  { name: 'Feb', hadir: 95, telat: 12, cuti: 8 },
  { name: 'Mar', hadir: 97, telat: 8, cuti: 4 },
  { name: 'Apr', hadir: 99, telat: 5, cuti: 2 },
  { name: 'Mei', hadir: 94, telat: 15, cuti: 10 },
];

export default function LaporanManager() {
  const [reportType, setReportType] = useState('Bulanan');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (type) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Simulasi: Laporan ${reportType} berhasil diekspor sebagai ${type}!`);
    }, 1500);
  };

  const handleDownloadHistory = () => {
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Simulasi File Laporan Absensi');
    link.download = 'Laporan_April_2026.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mgr-page-content" style={{ padding: '32px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Laporan & Analitik</h1>
          <p style={{ color: '#64748B', fontSize: '15px' }}>Buat, pantau, dan unduh laporan absensi perusahaan secara instan.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* ANALYTICS CARD */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Tren Kehadiran 2026</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></div> Hadir</span>
                <span style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></div> Terlambat</span>
              </div>
            </div>
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="hadir" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} barSize={30} />
                  <Bar dataKey="telat" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="cuti" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GENERATE REPORT CARD */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '20px' }}>Buat Laporan Baru</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>Tipe Laporan</label>
                <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', color: '#0F172A', fontWeight: 500 }}>
                  <option>Harian</option>
                  <option>Mingguan</option>
                  <option>Bulanan</option>
                  <option>Tahunan</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>Pilih Periode</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 14px' }}>
                  <Calendar size={16} color="#94A3B8" />
                  <input type="text" value="Mei 2026" readOnly style={{ width: '100%', padding: '10px', border: 'none', outline: 'none', background: 'transparent', color: '#0F172A', fontWeight: 500 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748B', marginBottom: '8px' }}>Filter Divisi</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 14px' }}>
                  <Filter size={16} color="#94A3B8" />
                  <select style={{ width: '100%', padding: '10px', border: 'none', outline: 'none', background: 'transparent', color: '#0F172A', fontWeight: 500 }}>
                    <option>Semua Divisi</option>
                    <option>IT Development</option>
                    <option>Finance</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleExport('PDF')} disabled={isExporting} style={{ flex: 1, padding: '12px', background: '#EF4444', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: isExporting ? 'wait' : 'pointer', opacity: isExporting ? 0.7 : 1 }}>
                {isExporting ? <span className="spinner"></span> : <FileIcon size={18} />}
                Ekspor ke PDF
              </button>
              <button onClick={() => handleExport('Excel')} disabled={isExporting} style={{ flex: 1, padding: '12px', background: '#10B981', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: isExporting ? 'wait' : 'pointer', opacity: isExporting ? 0.7 : 1 }}>
                {isExporting ? <span className="spinner"></span> : <FileSpreadsheet size={18} />}
                Ekspor ke Excel
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '20px' }}>Riwayat Laporan</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: i === 4 ? 'none' : '1px solid #F1F5F9' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3B82F6' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0' }}>Laporan April 2026</h4>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Diekspor oleh Anda • 12 Mei</p>
                  </div>
                  <button onClick={handleDownloadHistory} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', alignSelf: 'center' }}>
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <button style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px dashed #CBD5E1', borderRadius: '8px', color: '#64748B', fontWeight: 600, marginTop: '8px', cursor: 'pointer' }}>
              Lihat Semua Riwayat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
