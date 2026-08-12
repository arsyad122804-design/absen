import React, { useState } from 'react';
import { Umbrella, Search, Filter, MoreVertical, Plus, X, Edit3, History } from 'lucide-react';
import './LaporanManager.css'; // Reuse CSS for layout

const cutiData = [
  { id: 1, name: 'Dewi Hartati', div: 'Operasional', kuota: 12, sisa: 10, terpakai: 2, last: '12 Jan 2026' },
  { id: 2, name: 'Rizky Maulana', div: 'Marketing', kuota: 12, sisa: 12, terpakai: 0, last: '-' },
  { id: 3, name: 'Siti Nurhaliza', div: 'IT Development', kuota: 12, sisa: 8, terpakai: 4, last: '15 Mar 2026' },
  { id: 4, name: 'Budi Santoso', div: 'Finance', kuota: 12, sisa: 5, terpakai: 7, last: '10 Mei 2026' },
];

export default function IzinCutiManager() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };
  
  return (
    <div className="mgr-page-content" style={{ padding: '32px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Izin & Cuti</h1>
          <p style={{ color: '#64748B', fontSize: '15px' }}>Pantau kuota cuti tahunan dan riwayat izin karyawan Anda.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 16px', background: '#3B82F6', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Plus size={16} /> Atur Kuota Cuti
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3B82F6' }}>
              <Umbrella size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>45</h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Total Cuti Diambil (Tahun Ini)</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Data Kuota Cuti Karyawan</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 14px' }}>
              <Search size={16} color="#94A3B8" />
              <input type="text" placeholder="Cari karyawan..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '200px', padding: '10px', border: 'none', outline: 'none', background: 'transparent', color: '#0F172A', fontSize: '13px' }} />
            </div>
            <button style={{ padding: '10px 16px', background: '#F8FAFC', color: '#0F172A', borderRadius: '8px', border: '1px solid #E2E8F0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '13px' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Karyawan</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Divisi</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Kuota Tahunan</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Terpakai</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Sisa Cuti</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Cuti Terakhir</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {cutiData.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map(row => (
              <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{row.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>{row.div}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>{row.kuota} Hari</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#EF4444', fontWeight: 600 }}>{row.terpakai} Hari</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', background: row.sisa > 5 ? '#D1FAE5' : '#FEF3C7', color: row.sisa > 5 ? '#047857' : '#B45309', fontWeight: 600 }}>
                    {row.sisa} Hari
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>{row.last}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative' }}>
                  <button onClick={() => toggleDropdown(row.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><MoreVertical size={18} /></button>
                  {activeDropdown === row.id && (
                    <>
                      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setActiveDropdown(null)}></div>
                      <div style={{ position: 'absolute', right: '30px', top: '10px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 999, width: '160px', overflow: 'hidden' }}>
                        <button onClick={() => setActiveDropdown(null)} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#0F172A', textAlign: 'left' }}><Edit3 size={14}/> Edit Kuota</button>
                        <button onClick={() => setActiveDropdown(null)} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#0F172A', textAlign: 'left' }}><History size={14}/> Riwayat Izin</button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Atur Kuota Cuti Karyawan</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20}/></button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Pilih Karyawan</label>
              <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box' }}>
                <option>Dewi Hartati</option>
                <option>Rizky Maulana</option>
                <option>Semua Karyawan</option>
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Kuota Tahunan Baru</label>
              <input type="number" defaultValue="12" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
              <button onClick={() => { alert('Kuota Cuti Berhasil Diperbarui!'); setShowModal(false); }} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#3B82F6', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
