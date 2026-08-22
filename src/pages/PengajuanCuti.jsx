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

    const combined = [...localAbs.filter(r => r.karyawan_id === currentUser.id), ...dbAbs];
    
    // Remove duplicates
    const unique = [];
    combined.forEach(item => {
      if (!unique.some(u => u.tanggal === item.tanggal && u.status === item.status)) {
        unique.push(item);
      }
    });

    // Filter only leave records (Izin, Sakit, Cuti)
    const leavesOnly = unique.filter(r => ['Izin', 'Sakit', 'Cuti'].includes(r.status));
    
    // Sort by date desc
    leavesOnly.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    setRiwayat(leavesOnly);

    const terpakai = leavesOnly.length;
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

      // 1. Simpan ke LocalStorage
      const localRec = {
        id: Date.now(),
        karyawan_id: user.id,
        nama: user.name,
        tanggal: tanggal,
        waktu_masuk: timeStr,
        waktu_keluar: null,
        status: status,
        keterangan: keterangan,
        lokasi: null
      };

      const local = safeJsonParse('local_absensi', []);
      local.unshift(localRec);
      localStorage.setItem('local_absensi', JSON.stringify(local));

      // 2. Simpan ke Supabase
      const isDemo = !user.id || user.id.startsWith('karyawan-') || user.id.startsWith('admin-');
      if (!isDemo) {
        const { error } = await supabase
          .from('absensi')
          .insert([
            {
              karyawan_id: user.id,
              tanggal: tanggal,
              waktu_masuk: timeStr,
              status: status,
              keterangan: keterangan,
              lokasi: null
            }
          ]);
        if (error) console.error("Error submitting leave to Supabase:", error);
      }

      alert("Pengajuan Cuti/Izin Berhasil Dikirim!");
      setKeterangan('');
      loadUserAndHistory(user);
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim pengajuan.");
    }
  };

  return (
    <div className="pc-page-container">
      <div className="pc-header">
        <button onClick={() => navigate('/absen')} className="pc-back-btn">
          <ChevronLeft size={16} /> Kembali ke Absensi
        </button>
        <h1>Pengajuan Izin & Cuti</h1>
        <p>Silakan ajukan izin ketidakhadiran atau cuti tahunan Anda di bawah ini.</p>
      </div>

      {/* Quota Grid */}
      <div className="pc-quota-grid">
        <div className="pc-quota-card blue">
          <div className="pc-qc-icon">
            <Calendar size={24} />
          </div>
          <div className="pc-qc-text">
            <h3>{stats.kuota} Hari</h3>
            <p>Kuota Tahunan</p>
          </div>
        </div>
        <div className="pc-quota-card orange">
          <div className="pc-qc-icon">
            <Clock size={24} />
          </div>
          <div className="pc-qc-text">
            <h3>{stats.terpakai} Hari</h3>
            <p>Cuti Terpakai</p>
          </div>
        </div>
        <div className="pc-quota-card green">
          <div className="pc-qc-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="pc-qc-text">
            <h3>{stats.sisa} Hari</h3>
            <p>Sisa Kuota Cuti</p>
          </div>
        </div>
      </div>

      <div className="pc-main-grid">
        {/* FORM CARD */}
        <div className="pc-form-card">
          <h3>Formulir Pengajuan</h3>
          <form onSubmit={handleSubmit}>
            <div className="pc-field">
              <label>Jenis Pengajuan</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Izin">Izin (Keperluan Mendesak)</option>
                <option value="Sakit">Sakit (Butuh Istirahat)</option>
                <option value="Cuti">Cuti Tahunan</option>
              </select>
            </div>
            <div className="pc-field">
              <label>Tanggal Pengajuan</label>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
            </div>
            <div className="pc-field">
              <label>Alasan / Keterangan</label>
              <textarea 
                placeholder="Tuliskan keterangan detail pengajuan Anda..."
                value={keterangan}
                onChange={e => setKeterangan(e.target.value)}
                rows={4}
              />
              <span className="pc-hint">Keterangan minimal 5 karakter.</span>
            </div>
            <button type="submit" className="pc-btn-submit">
              <Send size={16} /> Kirim Pengajuan
            </button>
          </form>
        </div>

        {/* HISTORY CARD */}
        <div className="pc-history-card">
          <h3>Riwayat Pengajuan Anda</h3>
          <div className="pc-history-list">
            {riwayat.length === 0 ? (
              <div className="pc-history-empty">
                <Info size={32} />
                <p>Belum ada riwayat pengajuan cuti/izin.</p>
              </div>
            ) : (
              riwayat.map(item => (
                <div key={item.id} className="pc-history-item">
                  <div className={`pc-hi-badge ${item.status.toLowerCase()}`}>
                    {item.status}
                  </div>
                  <div className="pc-hi-content">
                    <strong>{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    <p>{item.keterangan}</p>
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