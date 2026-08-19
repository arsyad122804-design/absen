import React, { useState, useEffect } from 'react';
import { Umbrella, Search, Filter, MoreVertical, Plus, X, Edit3, History, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './IzinCutiManager.css';

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

export default function IzinCutiManager() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('all');
  const [quotaVal, setQuotaVal] = useState(12);

  const loadData = async () => {
    const localKaryawan = safeJsonParse('local_karyawan', []);
    let dbKaryawan = [];
    try {
      const { data } = await supabase.from('karyawan').select('*');
      if (data) dbKaryawan = data;
    } catch(e) {}

    const all = [...localKaryawan, ...dbKaryawan];
    
    // Hilangkan duplikat nama jika ada
    const unique = [];
    all.forEach(emp => {
      if (emp.name && !unique.some(u => u.name?.toLowerCase() === emp.name?.toLowerCase())) {
        unique.push(emp);
      }
    });

    const savedQuotas = safeJsonParse('leave_quotas', {});
    const localAbs = safeJsonParse('local_absensi', []);
    let dbAbs = [];
    try {
      const { data } = await supabase.from('absensi').select('*');
      if (data) dbAbs = data;
    } catch(e) {}
    
    const allAbs = [...localAbs, ...dbAbs];

    const mapped = unique.map(emp => {
      const customQuota = savedQuotas[emp.id] !== undefined ? savedQuotas[emp.id] : 12;
      const used = allAbs.filter(r => r.karyawan_id === emp.id && ['Izin', 'Sakit', 'Cuti'].includes(r.status)).length;
      const lastRecord = allAbs.find(r => r.karyawan_id === emp.id && ['Izin', 'Sakit', 'Cuti'].includes(r.status));
      const formattedLast = lastRecord && lastRecord.tanggal 
        ? new Date(lastRecord.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : '-';

      return {
        id: emp.id,
        name: emp.name,
        div: emp.divisi || emp.div || 'Operasional',
        kuota: customQuota,
        terpakai: used,
        sisa: customQuota - used,
        last: formattedLast
      };
    });

    setEmployees(mapped);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleSave = () => {
    const savedQuotas = safeJsonParse('leave_quotas', {});
    if (selectedEmpId === 'all') {
      employees.forEach(emp => {
        savedQuotas[emp.id] = quotaVal;
      });
    } else {
      savedQuotas[selectedEmpId] = quotaVal;
    }
    localStorage.setItem('leave_quotas', JSON.stringify(savedQuotas));
    alert('Kuota Cuti Berhasil Diperbarui!');
    setShowModal(false);
    loadData();
  };

  const totalCutiDiambil = employees.reduce((acc, curr) => acc + curr.terpakai, 0);

  const filteredEmployees = employees.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="mgr-page-content">
      <div className="icm-header">
        <div>
          <h1>Izin & Cuti</h1>
          <p>Pantau kuota cuti tahunan dan riwayat izin karyawan Anda.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="icm-btn-primary">
          <Plus size={16} /> Atur Kuota Cuti
        </button>
      </div>

      <div className="icm-stats-grid">
        <div className="icm-stat-card">
          <div className="icm-sc-icon blue">
            <Umbrella size={24} />
          </div>
          <div className="icm-sc-text">
            <h2>{totalCutiDiambil}</h2>
            <p>Total Cuti Diambil (Tahun Ini)</p>
          </div>
        </div>
        <div className="icm-stat-card">
          <div className="icm-sc-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="icm-sc-text">
            <h2>{totalCutiDiambil}</h2>
            <p>Cuti Disetujui</p>
          </div>
        </div>
        <div className="icm-stat-card">
          <div className="icm-sc-icon orange">
            <Clock size={24} />
          </div>
          <div className="icm-sc-text">
            <h2>0</h2>
            <p>Pengajuan Pending</p>
          </div>
        </div>
      </div>

      <div className="icm-table-card">
        <div className="icm-tc-header">
          <h3>Data Kuota Cuti Karyawan</h3>
          <div className="icm-search-wrapper">
            <Search size={16} color="#94A3B8" />
            <input type="text" placeholder="Cari karyawan..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <table className="icm-table">
          <thead>
            <tr>
              <th>Karyawan</th>
              <th>Divisi</th>
              <th>Kuota Tahunan</th>
              <th>Terpakai</th>
              <th>Sisa Cuti</th>
              <th>Cuti Terakhir</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                  Belum ada data kuota cuti karyawan.
                </td>
              </tr>
            ) : (
              filteredEmployees.map(row => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600, color: '#0F172A' }}>{row.name}</td>
                  <td>{row.div}</td>
                  <td style={{ fontWeight: 600 }}>{row.kuota} Hari</td>
                  <td style={{ color: '#EF4444', fontWeight: 600 }}>{row.terpakai} Hari</td>
                  <td>
                    <span className={`icm-pill ${row.sisa > 5 ? 'high' : 'low'}`}>
                      {row.sisa} Hari
                    </span>
                  </td>
                  <td>{row.last}</td>
                  <td style={{ textAlign: 'center', position: 'relative' }}>
                    <button onClick={() => toggleDropdown(row.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                      <MoreVertical size={18} />
                    </button>
                    {activeDropdown === row.id && (
                      <>
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setActiveDropdown(null)}></div>
                        <div style={{ position: 'absolute', right: '30px', top: '10px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 999, width: '160px', overflow: 'hidden' }}>
                          <button onClick={() => { setSelectedEmpId(row.id); setQuotaVal(row.kuota); setShowModal(true); setActiveDropdown(null); }} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#0F172A', textAlign: 'left' }}><Edit3 size={14}/> Edit Kuota</button>
                          <button onClick={() => { alert('Membuka riwayat izin: ' + row.name); setActiveDropdown(null); }} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#0F172A', textAlign: 'left' }}><History size={14}/> Riwayat Izin</button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="icm-modal-overlay">
          <div className="icm-modal-card">
            <div className="icm-mc-header">
              <h2>Atur Kuota Cuti Karyawan</h2>
              <button onClick={() => setShowModal(false)} className="icm-mc-close"><X size={20}/></button>
            </div>
            <div className="icm-field">
              <label>Pilih Karyawan</label>
              <select value={selectedEmpId} onChange={e => setSelectedEmpId(e.target.value)}>
                <option value="all">Semua Karyawan</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="icm-field">
              <label>Kuota Tahunan Baru</label>
              <input type="number" value={quotaVal} onChange={e => setQuotaVal(Number(e.target.value))} />
            </div>
            <div className="icm-modal-footer">
              <button onClick={() => setShowModal(false)} className="icm-btn-cancel">Batal</button>
              <button onClick={handleSave} className="icm-btn-save">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
