import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, FileText, Send, CheckCircle2, Info, Clock, XCircle, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './PengajuanCuti.css';

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

export default function PengajuanCuti() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('Izin');
  const [tanggal, setTanggal] = useState(() => {
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().split('T')[0];
  });
  const [durasi, setDurasi] = useState(1);
  const [keterangan, setKeterangan] = useState('');
  const [riwayat, setRiwayat] = useState([]);
  const [stats, setStats] = useState({
    kuota: 12,
    terpakai: 0,
    sisa: 12
  });

  const loadUserAndHistory = async (currentUser) => {
    if (!currentUser) return;
    
    // Fetch stats
    const savedQuotas = safeJsonParse('leave_quotas', {});
    const customQuota = savedQuotas[currentUser.id] !== undefined ? savedQuotas[currentUser.id] : 12;

    const localAbs = safeJsonParse('local_absensi', []);
    let dbAbs = [];
    try {
      const { data } = await supabase
        .from('absensi')
        .select('*')
        .eq('karyawan_id', currentUser.id);
      if (data) dbAbs = data;
    } catch(e) {}

    const combinedAbs = [...localAbs.filter(r => r.karyawan_id === currentUser.id), ...dbAbs];
    const uniqueAbs = [];
    combinedAbs.forEach(item => {
      if (!uniqueAbs.some(u => u.tanggal === item.tanggal && u.status === item.status)) {
        uniqueAbs.push(item);
      }
    });
    // Filter only leave records (Izin, Sakit, Cuti)
    const leavesOnly = uniqueAbs.filter(r => ['Izin', 'Sakit', 'Cuti'].includes(r.status));
    const terpakai = leavesOnly.length;

    // Fetch riwayat pengajuan cuti (Pending, Approved, Rejected)
    const localPengajuan = safeJsonParse('local_pengajuan', []);
    let dbPengajuan = [];
    try {
      const { data } = await supabase
        .from('pengajuan')
        .select('*')
        .eq('karyawan_id', currentUser.id);
      if (data) dbPengajuan = data;
    } catch(e) {}

    const combinedPengajuan = [...localPengajuan.filter(r => r.karyawan_id === currentUser.id), ...dbPengajuan];
    
    const uniquePengajuan = [];
    combinedPengajuan.forEach(item => {
      if (!uniquePengajuan.some(u => u.id === item.id || (u.tanggal_mulai === item.tanggal_mulai && u.jenis === item.jenis && u.alasan === item.alasan))) {
        uniquePengajuan.push(item);
      }
    });

    const mapped = uniquePengajuan.map(item => {
      let duration = item.durasi || item.duration || 1;
      let cleanReason = item.alasan || item.keterangan || item.reason || '';
      
      const match = cleanReason.match(/^\[(\d+)\s*Hari\]/i);
      if (match) {
        duration = parseInt(match[1]);
        cleanReason = cleanReason.replace(/^\[\d+\s*Hari\]\s*/i, '');
      }

      return {
        id: item.id,
        tanggal_mulai: item.tanggal_mulai || item.date || item.tanggal,
        jenis: item.jenis || item.type || item.status,
        alasan: cleanReason,
        durasi: duration,
        status: item.status || 'Pending'
      };
    });

    mapped.sort((a, b) => new Date(b.tanggal_mulai) - new Date(a.tanggal_mulai));
    setRiwayat(mapped);

    setStats({
      kuota: customQuota,
      terpakai,
      sisa: customQuota - terpakai < 0 ? 0 : customQuota - terpakai
    });
  };

  useEffect(() => {
    const userData = safeJsonParse('user', null);
    if (userData) {
      setUser(userData);
      loadUserAndHistory(userData);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Sesi login tidak valid. Silakan login ulang.");
      return;
    }
    if (keterangan.trim().length < 5) {
      alert("Alasan/Keterangan terlalu singkat!");
      return;
    }

    try {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}:${seconds}`;

      // 1. Simpan ke LocalStorage local_pengajuan
      const newLocalReq = {
        id: Date.now(),
        karyawan_id: user.id,
        name: user.name,
        type: status,
        date: tanggal,
        duration: durasi,
        reason: keterangan,
        status: 'Pending',
        created_at: new Date().toISOString()
      };

      const local = safeJsonParse('local_pengajuan', []);
      local.unshift(newLocalReq);
      localStorage.setItem('local_pengajuan', JSON.stringify(local));

      // 2. Simpan ke Supabase pengajuan
      const isDemo = !user.id || user.id.toString().startsWith('karyawan-') || user.id.toString().startsWith('admin-');
      if (!isDemo) {
        const { error } = await supabase
          .from('pengajuan')
          .insert([
            {
              karyawan_id: user.id,
              jenis: status,
              tanggal_mulai: tanggal,
              alasan: `[${durasi} Hari] ${keterangan}`,
              status: 'Pending'
            }
          ]);
        if (error) console.error("Error submitting leave to Supabase:", error);
      }

      alert("Pengajuan Cuti/Izin Berhasil Dikirim!");
      setKeterangan('');
      setDurasi(1);
      loadUserAndHistory(user);
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim pengajuan.");
    }
  };

  return (
    <div className="pcuti-container">
      <div className="pcuti-header">
        <button onClick={() => navigate('/absen')} className="pcuti-back-btn">
          <ChevronLeft size={16} /> Kembali ke Absensi
        </button>
        <h1>Pengajuan Izin & Cuti</h1>
        <p>Silakan ajukan izin ketidakhadiran atau cuti tahunan Anda di bawah ini.</p>
      </div>

      {/* Quota Grid */}
      <div className="pcuti-quota-grid">
        <div className="pcuti-quota-card blue">
          <div className="pcuti-qc-icon">
            <Calendar size={24} />
          </div>
          <div className="pcuti-qc-text">
            <h3>{stats.kuota} Hari</h3>
            <p>Kuota Tahunan</p>
          </div>
        </div>
        <div className="pcuti-quota-card orange">
          <div className="pcuti-qc-icon">
            <Clock size={24} />
          </div>
          <div className="pcuti-qc-text">
            <h3>{stats.terpakai} Hari</h3>
            <p>Cuti Terpakai</p>
          </div>
        </div>
        <div className="pcuti-quota-card green">
          <div className="pcuti-qc-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="pcuti-qc-text">
            <h3>{stats.sisa} Hari</h3>
            <p>Sisa Kuota Cuti</p>
          </div>
        </div>
      </div>

      <div className="pcuti-main-grid">
        {/* FORM CARD */}
        <div className="pcuti-form-card">
          <h3>Formulir Pengajuan</h3>
          <form onSubmit={handleSubmit}>
            <div className="pcuti-field">
              <label>Jenis Pengajuan</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Izin">Izin (Keperluan Mendesak)</option>
                <option value="Sakit">Sakit (Butuh Istirahat)</option>
                <option value="Cuti">Cuti Tahunan</option>
              </select>
            </div>
            <div className="pcuti-field">
              <label>Tanggal Pengajuan</label>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
            </div>
            <div className="pcuti-field">
              <label>Durasi Pengajuan (Hari)</label>
              <input 
                type="number" 
                min="1" 
                max="30"
                value={durasi} 
                onChange={e => setDurasi(parseInt(e.target.value) || 1)} 
              />
            </div>
            <div className="pcuti-field">
              <label>Alasan / Keterangan</label>
              <textarea 
                placeholder="Tuliskan keterangan detail pengajuan Anda..."
                value={keterangan}
                onChange={e => setKeterangan(e.target.value)}
                rows={4}
              />
              <span className="pcuti-hint">Keterangan minimal 5 karakter.</span>
            </div>
            <button type="submit" className="pcuti-btn-submit">
              <Send size={16} /> Kirim Pengajuan
            </button>
          </form>
        </div>

        {/* HISTORY CARD */}
        <div className="pcuti-history-card">
          <h3>Riwayat Pengajuan Anda</h3>
          <div className="pcuti-history-list">
            {riwayat.length === 0 ? (
              <div className="pcuti-history-empty">
                <Info size={32} />
                <p>Belum ada riwayat pengajuan cuti/izin.</p>
              </div>
            ) : (
              riwayat.map(item => (
                <div key={item.id} className="pcuti-history-item" style={{ flexDirection: 'column', gap: '8px' }}>
                  <div className="pcuti-hi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span className={`pcuti-hi-badge ${item.jenis.toLowerCase()}`}>
                      {item.jenis}
                    </span>
                    <span className={`pcuti-hi-status ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="pcuti-hi-content">
                    <strong>
                      {new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      <span className="pcuti-hi-duration"> ({item.durasi} Hari)</span>
                    </strong>
                    <p>{item.alasan}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}