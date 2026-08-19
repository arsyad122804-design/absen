import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, Clock, Download, ChevronDown, MoreVertical, 
  FileText, Info, CheckCircle2, AlertCircle, XCircle, X, MapPin, Image as ImageIcon
} from 'lucide-react';
import './RiwayatAbsensiManager.css';

// Data statis untuk preview 
const mockData = [
  { id: 1, name: 'Dewi Hartati', div: 'Operasional', date: '11 Agu 2026', status: 'Hadir', inTime: '07:15', outTime: '16:05', detail: '', lat: '-6.2088', lng: '106.8456' },
  { id: 2, name: 'Ahmad Fauzi', div: 'HR & GA', date: '11 Agu 2026', status: 'Izin', inTime: '-', outTime: '-', detail: 'Keperluan Keluarga (Acara Pernikahan Kakak)' },
  { id: 3, name: 'Siti Nurhaliza', div: 'IT Development', date: '11 Agu 2026', status: 'Sakit', inTime: '-', outTime: '-', detail: 'Demam Berdarah (Surat Dokter Terlampir)' },
  { id: 4, name: 'Budi Santoso', div: 'Finance', date: '11 Agu 2026', status: 'Terlambat', inTime: '08:30', outTime: '16:00', detail: 'Ban bocor di jalan raya', lat: '-6.2146', lng: '106.8451' },
  { id: 5, name: 'Yoga Pratama', div: 'IT Development', date: '11 Agu 2026', status: 'Alpha', inTime: '-', outTime: '-', detail: 'Tanpa Keterangan' },
  { id: 6, name: 'Rizky Maulana', div: 'Marketing', date: '11 Agu 2026', status: 'Hadir', inTime: '07:22', outTime: '16:01', detail: '', lat: '-6.1751', lng: '106.8272' },
  { id: 7, name: 'Lina Agustina', div: 'Finance', date: '10 Agu 2026', status: 'Sakit', inTime: '-', outTime: '-', detail: 'Tipes (Istirahat 3 Hari)' },
];

import { supabase } from '../lib/supabase';

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

export default function RiwayatAbsensiManager() {
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    const fetchAllHistory = async () => {
      const local = safeJsonParse('local_absensi', []);
      const localKaryawan = safeJsonParse('local_karyawan', []);
      
      let dbData = [];
      let dbKaryawan = [];
      try {
        const { data, error } = await supabase.from('absensi').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          dbData = data;
        }
        const { data: kData } = await supabase.from('karyawan').select('*');
        if (kData) dbKaryawan = kData;
      } catch (e) {}

      const allEmps = [...localKaryawan, ...dbKaryawan];
      const combined = [...local, ...dbData];
      
      const mapped = combined.map((r, i) => {
        const emp = allEmps.find(e => String(e.id) === String(r.karyawan_id)) || {};
        const dateObj = r.tanggal ? new Date(r.tanggal) : new Date();
        const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        const formattedDate = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        
        return {
          id: r.id || `local-his-${i}`,
          name: emp.name || r.nama || r.user_name || 'Karyawan',
          div: emp.divisi || emp.div || r.divisi || 'Operasional',
          date: formattedDate,
          status: r.status || 'Hadir',
          inTime: r.waktu_masuk || r.jam_masuk || r.jam || '08:00',
          outTime: r.waktu_keluar || r.jam_pulang || '-',
          detail: r.alasan || r.keterangan || '',
          lat: r.lokasi ? r.lokasi.split(',')[0] : null,
          lng: r.lokasi ? r.lokasi.split(',')[1] : null,
          lokasi: r.lokasi
        };
      });

      setDataList(mapped);
    };

    fetchAllHistory();
  }, []);

  // Fungsi untuk mensimulasikan unduh dokumen
  const handleDownload = (filename) => {
    const element = document.createElement("a");
    const file = new Blob(["Ini adalah dokumen simulasi surat dokter/izin."], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filter Data
  const filteredData = filterStatus === 'Semua' 
    ? dataList 
    : dataList.filter(item => item.status === filterStatus);

  const renderDetail = (row) => {
    if (row.status === 'Hadir' || row.status === 'Terlambat') {
      return (
        <div className="rm-detail-time">
          <div className="time-block">
            <span className="time-lbl">Masuk:</span>
            <strong className={row.status === 'Terlambat' ? 'text-red' : 'text-green'}>
              {row.inTime}
            </strong>
          </div>
          <div className="time-block">
            <span className="time-lbl">Pulang:</span>
            <strong>{row.outTime}</strong>
          </div>
          {row.status === 'Terlambat' && (
            <div className="reason-block">
              <span className="time-lbl">Alasan:</span> {row.detail}
            </div>
          )}
        </div>
      );
    } else if (row.status === 'Izin') {
      return (
        <div className="rm-detail-text orange">
          <Info size={16} />
          <span><strong>Alasan Izin:</strong> {row.detail}</span>
        </div>
      );
    } else if (row.status === 'Sakit') {
      return (
        <div className="rm-detail-text red">
          <AlertCircle size={16} />
          <span><strong>Keterangan Sakit:</strong> {row.detail}</span>
        </div>
      );
    } else {
      return (
        <div className="rm-detail-text gray">
          <XCircle size={16} />
          <span>{row.detail}</span>
        </div>
      );
    }
  };

  return (
    <div className="rm-page">
      
      {/* HEADER */}
      <div className="rm-header">
        <div className="rmh-left">
          <h1>Riwayat Absensi (Detail)</h1>
          <p>Pantau log waktu kehadiran, alasan izin, dan keterangan sakit karyawan.</p>
        </div>
        <div className="rmh-right">
        </div>
      </div>

      {/* FILTER ROW */}
      <div className="rm-filter-card">
        <div className="search-wrapper">
          <Search size={18} color="#94A3B8" />
          <input type="text" placeholder="Cari nama karyawan..." />
        </div>
        
        <div className="rm-filter-tabs">
          {['Semua', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'].map(stat => (
            <button 
              key={stat}
              className={`rm-tab ${filterStatus === stat ? 'active' : ''}`}
              onClick={() => setFilterStatus(stat)}
            >
              {stat}
            </button>
          ))}
        </div>

        <div className="filter-dropdown">
          <Calendar size={16} /> <span>Bulan Ini</span> <ChevronDown size={14} />
        </div>
      </div>

      {/* TABLE */}
      <div className="rm-table-container">
        <table className="rm-table">
          <thead>
            <tr>
              <th width="15%">Tanggal</th>
              <th width="25%">Karyawan</th>
              <th width="15%">Status</th>
              <th width="35%">Detail Keterangan</th>
              <th width="10%">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>
                  <div className="td-date" style={{ whiteSpace: 'nowrap' }}>
                    <Calendar size={16} className="date-icon" style={{ flexShrink: 0 }} /> <span>{row.date}</span>
                  </div>
                </td>
                <td>
                  <div className="td-user-info">
                    <img src={`https://ui-avatars.com/api/?name=${row.name.replace(' ', '+')}&background=random`} alt={row.name} />
                    <div className="user-names">
                      <strong>{row.name}</strong>
                      <span>{row.div}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="status-label">
                    <span className={`status-dot ${
                      row.status === 'Hadir' ? 'green' : 
                      row.status === 'Izin' ? 'orange' : 
                      row.status === 'Terlambat' ? 'yellow' : 'red'
                    }`}></span>
                    <span className="status-text">{row.status}</span>
                  </div>
                </td>
                <td>
                  {renderDetail(row)}
                </td>
                <td>
                  <button className="btn-action" onClick={() => setSelectedRecord(row)}>
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="empty-state">
            <p>Tidak ada riwayat absensi untuk status ini.</p>
          </div>
        )}

      </div>

      {/* MODAL DETAIL */}
      {selectedRecord && (
        <div className="rm-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="rm-modal-card" onClick={e => e.stopPropagation()}>
            <div className="rm-modal-header">
              <h2>Detail Absensi</h2>
              <button className="btn-close" onClick={() => setSelectedRecord(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="rm-modal-body">
              <div className="rm-modal-user">
                <img src={`https://ui-avatars.com/api/?name=${selectedRecord.name.replace(' ', '+')}&background=random`} alt={selectedRecord.name} />
                <div>
                  <h3>{selectedRecord.name}</h3>
                  <p>{selectedRecord.div} • {selectedRecord.date}</p>
                </div>
              </div>

              <div className="rm-modal-grid">
                <div className="rm-info-box">
                  <span className="lbl">Status</span>
                  <strong className={`stat-${selectedRecord.status.toLowerCase()}`}>{selectedRecord.status}</strong>
                </div>
                {(selectedRecord.status === 'Hadir' || selectedRecord.status === 'Terlambat') && (
                  <>
                    <div className="rm-info-box">
                      <span className="lbl">Jam Masuk</span>
                      <strong>{selectedRecord.inTime}</strong>
                    </div>
                    <div className="rm-info-box">
                      <span className="lbl">Jam Pulang</span>
                      <strong>{selectedRecord.outTime}</strong>
                    </div>
                  </>
                )}
              </div>

              {(selectedRecord.status === 'Hadir' || selectedRecord.status === 'Terlambat') && selectedRecord.lat && (
                <div className="rm-modal-location">
                  <h4><MapPin size={16} /> Lokasi Absen Masuk</h4>
                  <div className="map-placeholder">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      style={{ border: 0, borderRadius: '12px' }}
                      src={`https://maps.google.com/maps?q=${selectedRecord.lat},${selectedRecord.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p>Kordinat: {selectedRecord.lat}, {selectedRecord.lng}</p>
                </div>
              )}

              {(selectedRecord.status === 'Izin' || selectedRecord.status === 'Sakit') && (
                <div className="rm-modal-attachment">
                  <h4><ImageIcon size={16} /> Bukti Lampiran</h4>
                  <div className="attachment-box">
                    <div className="doc-icon"><FileText size={32} color="#3B82F6" /></div>
                    <div className="doc-info">
                      <strong>{selectedRecord.status === 'Sakit' ? 'Surat_Dokter.pdf' : 'Bukti_Izin.jpg'}</strong>
                      <span>Diserahkan pada {selectedRecord.date}</span>
                    </div>
                    <button 
                      className="btn-download-sm" 
                      onClick={() => handleDownload(selectedRecord.status === 'Sakit' ? 'Surat_Dokter.pdf' : 'Bukti_Izin.jpg')}
                    >
                      Unduh
                    </button>
                  </div>
                  <div className="reason-text">
                    <strong>Catatan:</strong> {selectedRecord.detail}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
