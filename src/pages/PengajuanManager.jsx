import React, { useState } from 'react';
import { ClipboardList, Check, X, AlertCircle } from 'lucide-react';
import './PengajuanManager.css';

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const initialPengajuan = [];

export default function PengajuanManager() {
  const [reqs, setReqs] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const local = JSON.parse(localStorage.getItem('local_pengajuan')) || [];
    
    let dbData = [];
    try {
      const { data } = await supabase.from('pengajuan').select('*').eq('status', 'Pending');
      if (data) dbData = data;
    } catch (e) {}

    const combined = [...local, ...dbData];
    setReqs(combined);
  };

  const handleAction = (id, action) => {
    setReqs(reqs.filter(r => r.id !== id));
    alert(`Pengajuan ${id} telah di-${action}!`);
  };

  return (
    <div className="mgr-page-content">
      <div className="pm-header">
        <h1>Pusat Persetujuan</h1>
        <p>Tinjau dan proses pengajuan izin atau cuti karyawan.</p>
      </div>

      <div className="pm-card">
        <div className="pm-card-header">
          <h3>Pengajuan Menunggu Persetujuan ({reqs.length})</h3>
        </div>
        
        {reqs.length === 0 ? (
          <div className="pm-empty">
            <ClipboardList size={52} opacity={0.4} />
            <p>Tidak ada pengajuan yang perlu diproses saat ini.</p>
          </div>
        ) : (
          <div className="pm-list">
            {reqs.map(req => (
              <div key={req.id} className="pm-item">
                <div className="pm-item-left">
                  <div className="pm-avatar">
                    {req.name.charAt(0)}
                  </div>
                  <div className="pm-details">
                    <h4>
                      {req.name} 
                      <span className="pm-badge">{req.type}</span>
                    </h4>
                    <p><span>Tanggal:</span> {req.date}</p>
                    <p><span>Alasan:</span> {req.reason}</p>
                  </div>
                </div>
                <div className="pm-actions">
                  <button onClick={() => handleAction(req.id, 'Tolak')} className="pm-btn-reject">
                    <X size={16} /> Tolak
                  </button>
                  <button onClick={() => handleAction(req.id, 'Setujui')} className="pm-btn-approve">
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
