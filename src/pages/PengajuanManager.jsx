import React, { useState } from 'react';
import { ClipboardList, Check, X, AlertCircle } from 'lucide-react';
import './LaporanManager.css';

const initialPengajuan = [
  { id: 'REQ-001', name: 'Rizky Maulana', type: 'Cuti Tahunan', date: '20 Mei - 22 Mei 2026', reason: 'Liburan keluarga', status: 'Pending' },
  { id: 'REQ-002', name: 'Ahmad Fauzi', type: 'Izin Sakit', date: '15 Mei 2026', reason: 'Demam tinggi (Surat dokter terlampir)', status: 'Pending' },
  { id: 'REQ-003', name: 'Dewi Hartati', type: 'Cuti Melahirkan', date: '1 Jun - 1 Sep 2026', reason: 'Persiapan persalinan', status: 'Pending' },
];

export default function PengajuanManager() {
  const [reqs, setReqs] = useState(initialPengajuan);

  const handleAction = (id, action) => {
    setReqs(reqs.filter(r => r.id !== id));
    alert(`Pengajuan ${id} telah di-${action}!`);
  };

  return (
    <div className="mgr-page-content" style={{ padding: '32px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Pusat Persetujuan</h1>
          <p style={{ color: '#64748B', fontSize: '15px' }}>Tinjau dan proses pengajuan izin atau cuti karyawan.</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '24px' }}>Pengajuan Menunggu Persetujuan ({reqs.length})</h3>
        
        {reqs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
            <ClipboardList size={48} opacity={0.5} style={{marginBottom: '16px'}} />
            <p>Tidak ada pengajuan yang perlu diproses saat ini.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reqs.map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4F46E5', fontWeight: 700 }}>
                    {req.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0' }}>{req.name} <span style={{ fontSize: '12px', background: '#DBEAFE', color: '#1D4ED8', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>{req.type}</span></h4>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 4px 0' }}><span style={{fontWeight: 600}}>Tanggal:</span> {req.date}</p>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}><span style={{fontWeight: 600}}>Alasan:</span> {req.reason}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleAction(req.id, 'Tolak')} style={{ padding: '10px 16px', background: 'white', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <X size={16} /> Tolak
                  </button>
                  <button onClick={() => handleAction(req.id, 'Setujui')} style={{ padding: '10px 16px', background: '#10B981', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Check size={16} /> Setujui
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
