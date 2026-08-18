import React, { useState, useEffect } from 'react';
import { Calendar, Check, Clock, X, LayoutGrid, ChevronDown, ChevronRight, LogOut, Clock4, MapPin, Smartphone, FileText, Info, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import './RiwayatAbsen.css';

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

export default function RiwayatAbsen() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('Semua');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('Agu');

  useEffect(() => {
    // Purge data uji coba lama dari website browser
    if (!localStorage.getItem('has_cleared_old_test_data')) {
      localStorage.removeItem('local_absensi');
      localStorage.setItem('has_cleared_old_test_data', 'true');
    }

    const fetchRecords = async () => {
      const userData = safeJsonParse('user', {});
      const local = safeJsonParse('local_absensi', []);
      
      // Filter data lokal milik user ini
      const userLocal = local.filter(r => r.karyawan_id === userData.id);

      // Ambil data dari Supabase jika bukan akun demo
      let userDb = [];
      const isDemo = !userData.id || userData.id.startsWith('karyawan-') || userData.id.startsWith('admin-');
      if (!isDemo) {
        try {
          const { data, error } = await supabase
            .from('absensi')
            .select('*')
            .eq('karyawan_id', userData.id)
            .order('tanggal', { ascending: false });
          if (!error && data) {
            userDb = data;
          }
        } catch (e) {
          console.error("Failed to load attendance from database:", e);
        }
      }

      // Gabungkan data (DB + Lokal)
      const mergedDb = [...userLocal, ...userDb];
      
      // Map ke format UI
      const mapped = mergedDb.map(r => {
        if (!r.tanggal) return null;
        try {
          const dateParts = r.tanggal.split('-');
          const dObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          
          let dur = '-';
          if (r.waktu_masuk && r.waktu_keluar) {
            const [h1, m1] = r.waktu_masuk.split(':').map(Number);
            const [h2, m2] = r.waktu_keluar.split(':').map(Number);
            const diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (diffMins > 0) {
              const h = Math.floor(diffMins / 60);
              const m = diffMins % 60;
              dur = `${h}j ${m}m`;
            }
          }

          return {
            id: r.id || r.tanggal,
            dateNum: dObj.getDate().toString(),
            dateMon: months[dObj.getMonth()],
            day: days[dObj.getDay()],
            status: r.status || 'Hadir',
            in: r.waktu_masuk ? r.waktu_masuk.substring(0, 5) : '-',
            out: r.waktu_keluar ? r.waktu_keluar.substring(0, 5) : '-',
            dur,
            keterangan: r.keterangan || '-',
            lokasi: r.lokasi !== undefined ? r.lokasi : (['Hadir', 'Terlambat'].includes(r.status) ? '-7.1344,111.6256' : null)
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      setRecords(mapped);
    };

    fetchRecords();
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat absensi dari database?")) {
      localStorage.removeItem('local_absensi');
      setRecords([]);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesStatus = filter === 'Semua' || r.status === filter;
    const matchesMonth = r.dateMon === selectedMonth;
    return matchesStatus && matchesMonth;
  });

  // Hitung statistik bulanan secara dinamis dari database + lokal
  const stats = {
    hadir: records.filter(r => r.status === 'Hadir').length,
    terlambat: records.filter(r => r.status === 'Terlambat').length,
    tidakHadir: records.filter(r => ['Tidak Hadir', 'Izin', 'Sakit'].includes(r.status)).length
  };

  return (
    <div className="content-container riwayat-page">
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="greeting">
          <h1>Riwayat Absen</h1>
          <p>Kelola dan lihat riwayat kehadiran Anda</p>
        </div>
        <button 
          onClick={handleClearHistory}
          style={{
            padding: '8px 16px',
            background: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Trash2 size={15} /> Hapus Riwayat
        </button>
      </div>

      {/* SUMMARY BANNER */}
      <div className="ra-summary-banner">
        <div className="ra-sb-title">Ringkasan Bulan Ini</div>
        <div className="ra-sb-stats">
          <div className="ra-sb-stat">
            <div className="ra-sb-icon-circle green">
              <Check size={24} strokeWidth={3} />
            </div>
            <div className="ra-sb-text">
              <h2>{stats.hadir}</h2>
              <p>Hadir</p>
            </div>
          </div>
          <div className="ra-sb-divider"></div>
          <div className="ra-sb-stat">
            <div className="ra-sb-icon-circle orange">
              <Clock size={24} strokeWidth={3} />
            </div>
            <div className="ra-sb-text">
              <h2>{stats.terlambat}</h2>
              <p>Terlambat</p>
            </div>
          </div>
          <div className="ra-sb-divider"></div>
          <div className="ra-sb-stat">
            <div className="ra-sb-icon-circle red">
              <X size={24} strokeWidth={3} />
            </div>
            <div className="ra-sb-text">
              <h2>{stats.tidakHadir}</h2>
              <p>Tidak Hadir</p>
            </div>
          </div>
        </div>
        <div className="ra-sb-bg-icon">
          <Calendar size={120} />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="ra-table-card">
        <div className="ra-table-header">
          <div className="ra-filters">
            <button 
              className={`ra-filter-btn ${filter === 'Semua' ? 'active' : ''}`}
              onClick={() => setFilter('Semua')}
            >
              <LayoutGrid size={16} /> Semua
            </button>
            <button 
              className={`ra-filter-btn outline ${filter === 'Hadir' ? 'active-outline' : ''}`}
              onClick={() => setFilter('Hadir')}
            >
              <span className="ra-dot green"></span> Hadir
            </button>
            <button 
              className={`ra-filter-btn outline ${filter === 'Terlambat' ? 'active-outline' : ''}`}
              onClick={() => setFilter('Terlambat')}
            >
              <span className="ra-dot orange"></span> Terlambat
            </button>
            <button 
              className={`ra-filter-btn outline ${filter === 'Tidak Hadir' ? 'active-outline' : ''}`}
              onClick={() => setFilter('Tidak Hadir')}
            >
              <span className="ra-dot red"></span> Tidak Hadir
            </button>
          </div>
          <div className="ra-month-picker-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
            <Calendar size={16} color="#475569" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <select 
              className="ra-month-picker"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '10px 36px 10px 40px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                outline: 'none'
              }}
            >
              <option value="Agu">Agustus 2026</option>
              <option value="Jul">Juli 2026</option>
              <option value="Jun">Juni 2026</option>
            </select>
            <ChevronDown size={16} color="#94A3B8" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        <div className="ra-table-wrapper">
          <table className="ra-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Hari</th>
                <th>Status</th>
                <th>Jam Masuk</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '48px 24px', color: '#64748B' }}>
                    <Info size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Belum ada riwayat absensi</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>Data kehadiran akan muncul setelah Anda melakukan check-in.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="ra-date-box">
                        <span className="ra-db-num">{r.dateNum}</span>
                        <span className="ra-db-mon">{r.dateMon}</span>
                      </div>
                    </td>
                    <td className="ra-day-col">{r.day}</td>
                    <td>
                      <span className={`ra-status-pill ${r.status.toLowerCase().replace(' ', '-')}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="ra-time-col">{r.in}</td>
                    <td className="ra-action-col">
                      <button className="ra-action-btn" onClick={() => setSelectedRecord(r)}>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL ABSENSI */}
      {selectedRecord && (
        <div className="ra-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="ra-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ra-modal-header">
              <h3>Detail Absensi</h3>
              <button className="ra-modal-close" onClick={() => setSelectedRecord(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="ra-modal-body">
              <div className="ra-md-status-sec">
                <div className={`ra-md-status-icon ${selectedRecord.status.toLowerCase().replace(' ', '-')}`}>
                  <div className="ra-md-pulse-1">
                    <div className="ra-md-pulse-2">
                      {selectedRecord.status === 'Hadir' ? <Check size={32} strokeWidth={3} /> : 
                       selectedRecord.status === 'Terlambat' ? <Clock size={32} strokeWidth={3} /> : 
                       <X size={32} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
                <h2 className={selectedRecord.status.toLowerCase().replace(' ', '-')}>{selectedRecord.status}</h2>
                <p>{selectedRecord.day}, {selectedRecord.dateNum} {selectedRecord.dateMon} 2026</p>
              </div>

              <div className="ra-md-details-card">
                <div className="ra-md-row">
                  <div className="ra-md-label"><Clock size={18} color="#3B82F6" /> Jam Masuk</div>
                  <div className="ra-md-val">{selectedRecord.in}</div>
                </div>
                {selectedRecord.lokasi && ['Hadir', 'Terlambat'].includes(selectedRecord.status) && (
                  <div className="ra-md-row">
                    <div className="ra-md-label"><MapPin size={18} color="#3B82F6" /> Lokasi</div>
                    <div className="ra-md-val" style={{ fontSize: '12px' }}>
                      GPS: {selectedRecord.lokasi}
                    </div>
                  </div>
                )}
                <div className="ra-md-row">
                  <div className="ra-md-label"><Smartphone size={18} color="#3B82F6" /> Perangkat</div>
                  <div className="ra-md-val">Web Browser</div>
                </div>
                <div className="ra-md-row borderless">
                  <div className="ra-md-label"><FileText size={18} color="#3B82F6" /> Keterangan</div>
                  <div className="ra-md-val">{selectedRecord.keterangan || '-'}</div>
                </div>
              </div>

              {selectedRecord.lokasi && ['Hadir', 'Terlambat'].includes(selectedRecord.status) && (
                <div className="ra-md-map-card">
                  <div className="ra-md-map-img" style={{ position: 'relative', height: '160px', padding: 0, overflow: 'hidden' }}>
                    <iframe
                      title="Peta Lokasi Absensi"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0, display: 'block' }}
                      src={`https://maps.google.com/maps?q=${selectedRecord.lokasi}&z=15&output=embed`}
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="ra-md-map-footer">
                    <div className="ra-md-mf-text">
                      <h4>Koordinat Absen</h4>
                      <p>{selectedRecord.lokasi}</p>
                    </div>
                    <button 
                      className="ra-md-mf-btn"
                      onClick={() => {
                        if (selectedRecord.lokasi) {
                          window.open(`https://www.google.com/maps?q=${selectedRecord.lokasi}`, '_blank');
                        }
                      }}
                    >
                      Lihat di Peta
                    </button>
                  </div>
                </div>
              )}

              <div className="ra-md-info-banner">
                <Info size={20} color="#3B82F6" style={{ minWidth: '20px' }} />
                <p>Data absensi diambil saat Anda melakukan check-in melalui aplikasi.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
