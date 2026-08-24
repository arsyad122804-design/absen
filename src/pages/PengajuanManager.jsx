import React, { useState, useEffect } from 'react';
import { ClipboardList, Check, X, AlertCircle } from 'lucide-react';
import './PengajuanManager.css';
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

export default function PengajuanManager() {
  const [reqs, setReqs] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    // 1. Fetch karyawan to resolve names
    const localKaryawan = safeJsonParse('local_karyawan', []);
    let dbKaryawan = [];
    try {
      const { data } = await supabase.from('karyawan').select('*');
      if (data) dbKaryawan = data;
    } catch(e) {}
    const allKaryawan = [...localKaryawan, ...dbKaryawan];

    // 2. Fetch local requests
    const local = safeJsonParse('local_pengajuan', []);
    
    // 3. Fetch DB requests
    let dbData = [];
    try {
      const { data } = await supabase.from('pengajuan').select('*').eq('status', 'Pending');
      if (data) dbData = data;
    } catch (e) {}

    // Map DB data columns to match UI fields
    const mappedDbData = dbData.map(item => {
      const emp = allKaryawan.find(k => k.id?.toString() === item.karyawan_id?.toString());
      const empName = emp ? emp.name : `Karyawan ID: ${item.karyawan_id}`;
      
      let duration = item.durasi || item.duration || 1;
      let cleanReason = item.alasan || item.keterangan || item.reason || '';
      
      const match = cleanReason.match(/^\[(\d+)\s*Hari\]/i);
      if (match) {
        duration = parseInt(match[1]);
        cleanReason = cleanReason.replace(/^\[\d+\s*Hari\]\s*/i, '');
      }

      return {
        id: item.id,
        karyawan_id: item.karyawan_id,
        name: empName,
        type: item.jenis || item.type || 'Izin',
        date: item.tanggal_mulai || item.date || '',
        duration: duration,
        reason: cleanReason,
        status: item.status || 'Pending',
        isDb: true
      };
    });

    const mappedLocal = local.map(item => ({
      ...item,
      isDb: false
    })).filter(item => item.status === 'Pending');

    const combined = [...mappedLocal, ...mappedDbData];
    setReqs(combined);
  };

  const handleAction = async (req, action) => {
    try {
      const newStatus = action === 'Setujui' ? 'Approved' : 'Rejected';

      // 1. Update status based on source
      if (req.isDb) {
        const { error } = await supabase
          .from('pengajuan')
          .update({ status: newStatus })
          .eq('id', req.id);
        if (error) throw error;
      } else {
        const local = safeJsonParse('local_pengajuan', []);
        const idx = local.findIndex(r => r.id === req.id);
        if (idx !== -1) {
          local[idx].status = newStatus;
          localStorage.setItem('local_pengajuan', JSON.stringify(local));
        }
      }

      // 2. If approved, generate attendance entries for each day of duration
      if (action === 'Setujui') {
        const recordsToInsert = [];
        const startDate = new Date(req.date);
        
        for (let i = 0; i < (req.duration || 1); i++) {
          const d = new Date(startDate);
          d.setDate(startDate.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          
          recordsToInsert.push({
            karyawan_id: req.karyawan_id,
            nama: req.name,
            tanggal: dateStr,
            waktu_masuk: '08:00:00',
            waktu_keluar: null,
            status: req.type,
            keterangan: req.reason,
            lokasi: null
          });
        }

        // Save to local storage local_absensi
        const localAbs = safeJsonParse('local_absensi', []);
        localAbs.unshift(...recordsToInsert.map(r => ({ ...r, id: Date.now() + Math.random() })));
        localStorage.setItem('local_absensi', JSON.stringify(localAbs));

        // Save to Supabase absensi
        if (req.isDb) {
          const dbRecords = recordsToInsert.map(r => ({
            karyawan_id: r.karyawan_id,
            tanggal: r.tanggal,
            waktu_masuk: r.waktu_masuk,
            status: r.status,
            keterangan: r.keterangan,
            lokasi: null
          }));

          const { error: absError } = await supabase
            .from('absensi')
            .insert(dbRecords);
          if (absError) console.error("Error inserting attendance logs on approval:", absError);
        }
      }

      alert(`Pengajuan dari ${req.name} telah di-${action.toLowerCase()}!`);
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert(`Gagal memproses pengajuan: ${err.message || err}`);
    }
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
                    <p><span>Tanggal Mulai:</span> {new Date(req.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p><span>Durasi Cuti:</span> <strong style={{ color: '#2563EB' }}>{req.duration || 1} Hari</strong></p>
                    <p><span>Alasan:</span> {req.reason}</p>
                  </div>
                </div>
                <div className="pm-actions">
                  <button onClick={() => handleAction(req, 'Tolak')} className="pm-btn-reject">
                    <X size={16} /> Tolak
                  </button>
                  <button onClick={() => handleAction(req, 'Setujui')} className="pm-btn-approve">
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
