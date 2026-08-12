import React, { useState } from 'react';
import { Calendar, Check, Clock, X, LayoutGrid, ChevronDown, ChevronRight, LogOut, Clock4, MapPin, Smartphone, FileText, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function RiwayatAbsen() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('Semua');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const records = [
    { id: 1, dateNum: '10', dateMon: 'Agu', day: 'Sabtu', status: 'Hadir', in: '07:32', out: '16:01', dur: '8j 29m' },
    { id: 2, dateNum: '9', dateMon: 'Agu', day: 'Jumat', status: 'Terlambat', in: '07:46', out: '16:12', dur: '8j 26m' },
    { id: 3, dateNum: '8', dateMon: 'Agu', day: 'Kamis', status: 'Hadir', in: '07:28', out: '15:57', dur: '8j 29m' },
    { id: 4, dateNum: '7', dateMon: 'Agu', day: 'Rabu', status: 'Hadir', in: '07:30', out: '16:00', dur: '8j 30m' },
    { id: 5, dateNum: '6', dateMon: 'Agu', day: 'Selasa', status: 'Tidak Hadir', in: '-', out: '-', dur: '-' },
    { id: 6, dateNum: '5', dateMon: 'Agu', day: 'Senin', status: 'Hadir', in: '07:25', out: '15:54', dur: '8j 29m' },
    { id: 7, dateNum: '4', dateMon: 'Agu', day: 'Minggu', status: 'Hadir', in: '07:31', out: '16:02', dur: '8j 31m' },
  ];

  const filteredRecords = filter === 'Semua' 
    ? records 
    : records.filter(r => r.status === filter);

  return (
    <div className="content-container riwayat-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="greeting">
          <h1>Riwayat Absen</h1>
          <p>Kelola dan lihat riwayat kehadiran Anda</p>
        </div>
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
              <h2>22</h2>
              <p>Hadir</p>
            </div>
          </div>
          <div className="ra-sb-divider"></div>
          <div className="ra-sb-stat">
            <div className="ra-sb-icon-circle orange">
              <Clock size={24} strokeWidth={3} />
            </div>
            <div className="ra-sb-text">
              <h2>3</h2>
              <p>Terlambat</p>
            </div>
          </div>
          <div className="ra-sb-divider"></div>
          <div className="ra-sb-stat">
            <div className="ra-sb-icon-circle red">
              <X size={24} strokeWidth={3} />
            </div>
            <div className="ra-sb-text">
              <h2>1</h2>
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
          <div className="ra-month-picker">
            <Calendar size={16} color="#475569" />
            <span>Agustus 2026</span>
            <ChevronDown size={16} color="#94A3B8" />
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
                <th>Jam Pulang</th>
                <th>Durasi</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(r => (
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
                  <td className="ra-time-col">{r.out}</td>
                  <td className="ra-time-col">{r.dur}</td>
                  <td className="ra-action-col">
                    <button className="ra-action-btn" onClick={() => setSelectedRecord(r)}>
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
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
                <div className="ra-md-row">
                  <div className="ra-md-label"><LogOut size={18} color="#3B82F6" style={{ transform: 'scaleX(-1)' }} /> Jam Pulang</div>
                  <div className="ra-md-val">{selectedRecord.out}</div>
                </div>
                <div className="ra-md-row">
                  <div className="ra-md-label"><Clock4 size={18} color="#3B82F6" /> Durasi Kerja</div>
                  <div className="ra-md-val">{selectedRecord.dur !== '-' ? selectedRecord.dur.replace('j', ' Jam').replace('m', ' Menit') : '-'}</div>
                </div>
                <div className="ra-md-row">
                  <div className="ra-md-label"><MapPin size={18} color="#3B82F6" /> Lokasi</div>
                  <div className="ra-md-val">Kantor Pusat</div>
                </div>
                <div className="ra-md-row">
                  <div className="ra-md-label"><Smartphone size={18} color="#3B82F6" /> Perangkat</div>
                  <div className="ra-md-val">Web Browser</div>
                </div>
                <div className="ra-md-row borderless">
                  <div className="ra-md-label"><FileText size={18} color="#3B82F6" /> Keterangan</div>
                  <div className="ra-md-val">-</div>
                </div>
              </div>

              <div className="ra-md-map-card">
                <div className="ra-md-map-img">
                  <div className="ra-md-map-pin">
                    <MapPin size={24} color="white" fill="#3B82F6" />
                  </div>
                </div>
                <div className="ra-md-map-footer">
                  <div className="ra-md-mf-text">
                    <h4>Kantor Pusat</h4>
                    <p>Jl. Merdeka No.10, Jakarta Pusat</p>
                  </div>
                  <button className="ra-md-mf-btn">Lihat di Peta</button>
                </div>
              </div>

              <div className="ra-md-info-banner">
                <Info size={20} color="#3B82F6" style={{ minWidth: '20px' }} />
                <p>Data absensi diambil saat Anda melakukan check-in dan check-out melalui aplikasi.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
