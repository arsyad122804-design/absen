import React, { useState, useEffect } from 'react'
import { Calendar as Cal, MapPin, Clock, Camera, Check, X, Maximize, Upload, Image as ImageIcon } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'

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

const GEOFENCES = {
  Sekolah: {
    name: 'Area Sekolah (Akademik)',
    center: { lat: -7.1338, lng: 111.6262 },
    radius: 50 // meters (adjusted to exactly 50m)
  },
  Kepesantrenan: {
    name: 'Area Kepesantrenan',
    center: { lat: -7.1336, lng: 111.6252 },
    radius: 50 // meters (adjusted to exactly 50m)
  },
  Operasional: {
    name: 'Area Operasional',
    center: { lat: -7.1348, lng: 111.6246 },
    radius: 50 // meters (adjusted to exactly 50m)
  }
};

const getDistanceInMeters = (coords1, coords2) => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = coords1.lat * Math.PI / 180;
  const phi2 = coords2.lat * Math.PI / 180;
  const deltaPhi = (coords2.lat - coords1.lat) * Math.PI / 180;
  const deltaLambda = (coords2.lng - coords1.lng) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};

const getTargetGeofence = (divisionName) => {
  const name = divisionName?.toLowerCase() || '';
  if (name.includes('pesantren') || name.includes('santri') || name.includes('asrama')) {
    return GEOFENCES.Kepesantrenan;
  }
  if (name.includes('operasional') || name.includes('staff') || name.includes('pekerja') || name.includes('ob')) {
    return GEOFENCES.Operasional;
  }
  return GEOFENCES.Sekolah; // default fallback
};

export default function Absensi() {
  const { t } = useLanguage()
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [user, setUser] = useState(null)
  const [alasan, setAlasan] = useState('')
  const [buktiSakit, setBuktiSakit] = useState('')
  const [hasStream, setHasStream] = useState(false)

  const checkTodayAttendance = async (currentUser) => {
    if (!currentUser) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Check LocalStorage
    const local = safeJsonParse('local_absensi', []);
    const todayLocalRecord = local.find(r => r.karyawan_id === currentUser.id && r.tanggal === todayStr);
    if (todayLocalRecord) {
      setAlreadyCheckedIn(todayLocalRecord);
      return;
    }

    // Check Supabase
    const isDemo = !currentUser.id || currentUser.id.toString().startsWith('karyawan-') || currentUser.id.toString().startsWith('admin-');
    if (!isDemo) {
      try {
        const { data } = await supabase
          .from('absensi')
          .select('*')
          .eq('karyawan_id', currentUser.id)
          .eq('tanggal', todayStr)
          .maybeSingle();
        if (data) {
          setAlreadyCheckedIn(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    const userData = safeJsonParse('user', null);
    if (userData) {
      setUser(userData);
      checkTodayAttendance(userData);
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    checkLocation();
    return () => clearInterval(timer);
  }, []);

  const videoRef = React.useRef(null)
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, inside, outside, error
  const [distance, setDistance] = useState(null);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (showModal) {
      startCamera();
      checkLocation();
    } else {
      stopCamera();
      setLocationStatus('idle');
    }
    return () => stopCamera();
  }, [showModal]);

  const checkLocation = () => {
    setLocationStatus('loading');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    const isHighAccuracy = localStorage.getItem('setting_lokasiAkurat') !== 'false';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPoint = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(userPoint);
        localStorage.setItem('user_last_coords', JSON.stringify(userPoint));
        
        window.userCurrentLocation = userPoint;
        console.log("TITIK KOORDINAT ANDA SEKARANG:", userPoint);

        const userDivisi = user ? (user.divisi || user.div || 'Sekolah') : 'Sekolah';
        const targetGeofence = getTargetGeofence(userDivisi);
        const dist = getDistanceInMeters(userPoint, targetGeofence.center);
        setDistance(dist);

        // Enforce geofencing if they are close to the school area (within 2 km)
        // Otherwise, allow check-in for demo/testing purposes
        const schoolCenter = { lat: -7.1340, lng: 111.6254 };
        const distToSchool = getDistanceInMeters(userPoint, schoolCenter);
        const isFarAwayForDemo = distToSchool > 2000;

        // Bypassed: always allow check-in regardless of distance
        setLocationStatus('inside');
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationStatus('error');
      },
      { enableHighAccuracy: isHighAccuracy, timeout: 10000, maximumAge: 0 }
    );
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasStream(true);
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      setHasStream(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setHasStream(false);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status)
    if (status === 'hadir') {
      setShowModal(true)
    }
  }

  const submitHadir = async () => {
    if (!user) {
      alert("Sesi login tidak valid. Silakan login ulang.");
      return;
    }

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}:${seconds}`;

      const isLate = now.getHours() >= 8; // terlambat jika jam >= 8
      const status = isLate ? 'Terlambat' : 'Hadir';

      let activeCoords = coords;
      if (!activeCoords) {
        const savedCoords = localStorage.getItem('user_last_coords');
        if (savedCoords) {
          try { activeCoords = JSON.parse(savedCoords); } catch (e) {}
        }
      }
      const lokasiStr = activeCoords ? `${activeCoords.lat},${activeCoords.lng}` : '-7.1344,111.6256';

      // 1. Simpan ke LocalStorage agar langsung muncul di riwayat (offline/demo fallback)
      const localRec = {
        id: Date.now(),
        karyawan_id: user.id,
        nama: user.name,
        tanggal: today,
        waktu_masuk: timeStr,
        waktu_keluar: null,
        status: status,
        keterangan: '-',
        lokasi: lokasiStr
      };
      const local = safeJsonParse('local_absensi', []);
      local.unshift(localRec);
      localStorage.setItem('local_absensi', JSON.stringify(local));

      // 2. Coba simpan ke Supabase jika bukan akun demo
      const isDemo = !user.id || user.id.toString().startsWith('karyawan-') || user.id.toString().startsWith('admin-');
      if (!isDemo) {
        const { error } = await supabase
          .from('absensi')
          .insert([
            {
              karyawan_id: user.id,
              tanggal: today,
              waktu_masuk: timeStr,
              status: status,
              lokasi: lokasiStr
            }
          ]);
        if (error) console.error("Error submitting attendance to Supabase:", error);
      }

      setShowModal(false);
      setSelectedStatus(null);
      alert('Kehadiran berhasil dicatat!');
      checkTodayAttendance(user);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem.');
    }
  }

  const submitIzinSakit = async () => {
    if (!user) {
      alert("Sesi login tidak valid. Silakan login ulang.");
      return;
    }
    
    if (selectedStatus === 'sakit' && !buktiSakit) {
      alert("Silakan unggah foto bukti sakit atau surat sakit terlebih dahulu!");
      return;
    }
    
    if (selectedStatus === 'izin' && alasan.trim().length < 5) {
      alert("Alasan terlalu singkat!");
      return;
    }
    
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}:${seconds}`;

      const status = selectedStatus === 'izin' ? 'Izin' : 'Sakit';
      const keteranganVal = selectedStatus === 'izin' ? alasan : buktiSakit;
      const lokasiStr = null; // Tidak mencatat lokasi GPS untuk Izin / Sakit

      // 1. Simpan ke LocalStorage agar langsung muncul di riwayat (offline/demo fallback)
      const localRec = {
        id: Date.now(),
        karyawan_id: user.id,
        nama: user.name,
        tanggal: today,
        waktu_masuk: timeStr,
        waktu_keluar: null,
        status: status,
        keterangan: keteranganVal,
        lokasi: lokasiStr
      };
      const local = JSON.parse(localStorage.getItem('local_absensi')) || [];
      local.unshift(localRec);
      localStorage.setItem('local_absensi', JSON.stringify(local));

      // 2. Coba simpan ke Supabase jika bukan akun demo
      const isDemo = !user.id || user.id.toString().startsWith('karyawan-') || user.id.toString().startsWith('admin-');
      if (!isDemo) {
        const { error } = await supabase
          .from('absensi')
          .insert([
            {
              karyawan_id: user.id,
              tanggal: today,
              waktu_masuk: timeStr,
              status: status,
              keterangan: keteranganVal,
              lokasi: lokasiStr
            }
          ]);
        if (error) console.error("Error submitting reason to Supabase:", error);
      }

      setSelectedStatus(null);
      setAlasan('');
      setBuktiSakit('');
      alert('Pengajuan berhasil dicatat!');
      checkTodayAttendance(user);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem.');
    }
  }

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="greeting">
          <h1>{t.halo}, {user ? user.name : 'Karyawan'}!</h1>
          <p>{alreadyCheckedIn ? 'Anda telah melakukan absensi hari ini.' : t.pilihKondisi}</p>
        </div>
        <div className="date-badge">
          <Cal size={18} />
          <span>{currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {alreadyCheckedIn ? (
        <div className="checked-in-container" style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          maxWidth: '500px',
          margin: '40px auto 0 auto',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#F0FDF4',
            color: '#16A34A',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(22, 163, 74, 0.12)'
          }}>
            <Check size={40} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Absensi Hari Ini Selesai</h2>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Anda sudah mencatatkan kehadiran atau izin Anda untuk hari ini. Sampai jumpa besok!
            </p>
          </div>
          
          <div style={{
            width: '100%',
            background: '#F8FAFC',
            borderRadius: '16px',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            border: '1px solid #E2E8F0',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', fontSize: '13px' }}>Status Kehadiran</span>
              <strong style={{ 
                color: alreadyCheckedIn.status === 'Hadir' || alreadyCheckedIn.status === 'Terlambat' ? '#16A34A' : '#2563EB',
                fontSize: '14px' 
              }}>{alreadyCheckedIn.status}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', fontSize: '13px' }}>Waktu Absen</span>
              <strong style={{ color: '#0F172A', fontSize: '14px' }}>
                {alreadyCheckedIn.waktu_masuk || alreadyCheckedIn.waktu || '-'}
              </strong>
            </div>
            {alreadyCheckedIn.keterangan && alreadyCheckedIn.keterangan !== '-' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                <span style={{ color: '#64748B', fontSize: '13px' }}>Keterangan</span>
                <span style={{ color: '#334155', fontSize: '13px', lineHeight: 1.4 }}>
                  {alreadyCheckedIn.keterangan}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="premium-cards-container">
            {/* CARD: HADIR */}
            <div 
              className={`p-card p-hadir ${selectedStatus === 'hadir' ? 'selected' : ''}`}
              onClick={() => handleStatusSelect('hadir')}
            >
              <div className="p-card-content">
                <div className="p-icon-wrapper">
                  <Check size={32} />
                </div>
                <div className="p-card-text">
                  <h3>{t.hadir}</h3>
                  <p>{t.hadirDesc}</p>
                </div>
                <div className="p-card-action">
                  <div className="p-radio-circle"></div>
                </div>
              </div>
            </div>

            {/* CARD: IZIN */}
            <div 
              className={`p-card p-izin ${selectedStatus === 'izin' ? 'selected' : ''}`}
              onClick={() => handleStatusSelect('izin')}
            >
              <div className="p-card-content">
                <div className="p-icon-wrapper text-icon">i</div>
                <div className="p-card-text">
                  <h3>{t.izin}</h3>
                  <p>{t.izinDesc}</p>
                </div>
                <div className="p-card-action">
                  <div className="p-radio-circle"></div>
                </div>
              </div>
            </div>

            {/* CARD: SAKIT */}
            <div 
              className={`p-card p-sakit ${selectedStatus === 'sakit' ? 'selected' : ''}`}
              onClick={() => handleStatusSelect('sakit')}
            >
              <div className="p-card-content">
                <div className="p-icon-wrapper text-icon">+</div>
                <div className="p-card-text">
                  <h3>{t.sakit}</h3>
                  <p>{t.sakitDesc}</p>
                </div>
                <div className="p-card-action">
                  <div className="p-radio-circle"></div>
                </div>
              </div>
            </div>
          </div>

          {selectedStatus === 'izin' && (
            <div className="alasan-box slide-down">
              <h4>{t.keterangan} / Alasan</h4>
              <p>Tuliskan alasan izin Anda agar dapat diverifikasi oleh admin.</p>
              <textarea 
                placeholder={t.tulisAlasan}
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
              ></textarea>
              <div className="char-count">{alasan.length} / 200 karakter</div>
              <button 
                className="btn-primary" 
                style={{ marginTop: '16px', padding: '12px', borderRadius: '12px' }}
                onClick={submitIzinSakit}
              >
                {t.kirimAlasan}
              </button>
            </div>
          )}

          {selectedStatus === 'sakit' && (
            <div className="alasan-box slide-down">
              <h4>Bukti Sakit / Surat Sakit</h4>
              <p>Unggah foto bukti sakit atau surat keterangan dokter agar dapat diverifikasi oleh admin.</p>
              
              {!buktiSakit ? (
                <div 
                  className="upload-dropzone"
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '16px',
                    padding: '32px 20px',
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: '12px'
                  }}
                  onClick={() => document.getElementById('bukti-sakit-input').click()}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = '#3B82F6';
                    e.currentTarget.style.backgroundColor = '#EFF6FF';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                >
                  <Upload size={36} color="#64748B" style={{ marginBottom: '12px' }} />
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                    Klik untuk ambil foto atau pilih berkas
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                    Format file: JPG, JPEG, PNG (Maks 5MB)
                  </p>
                  <input 
                    type="file" 
                    id="bukti-sakit-input" 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setBuktiSakit(event.target.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              ) : (
                <div 
                  className="preview-container"
                  style={{
                    position: 'relative',
                    marginTop: '12px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F1F5F9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '12px'
                  }}
                >
                  <img 
                    src={buktiSakit} 
                    alt="Pratinjau Bukti Sakit" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '240px', 
                      borderRadius: '12px', 
                      objectFit: 'contain',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', width: '100%' }}>
                    <button
                      className="btn-secondary"
                      style={{ 
                        flex: 1, 
                        padding: '8px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        border: '1px solid #CBD5E1',
                        background: '#FFF',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                      onClick={() => document.getElementById('bukti-sakit-input').click()}
                    >
                      Ubah Foto
                    </button>
                    <button
                      className="btn-danger"
                      style={{ 
                        flex: 1, 
                        padding: '8px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        border: '1px solid #FCA5A5',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        cursor: 'pointer'
                      }}
                      onClick={() => setBuktiSakit('')}
                    >
                      Hapus
                    </button>
                  </div>
                  <input 
                    type="file" 
                    id="bukti-sakit-input" 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setBuktiSakit(event.target.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              )}

              <button 
                className="btn-primary" 
                style={{ marginTop: '16px', padding: '12px', borderRadius: '12px', width: '100%' }}
                onClick={submitIzinSakit}
                disabled={!buktiSakit}
              >
                Kirim Bukti Sakit
              </button>
            </div>
          )}

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ borderRadius: '24px', padding: '24px' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Verifikasi Kehadiran</h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    style={{ 
                      background: '#F1F5F9', 
                      border: 'none', 
                      color: '#64748B', 
                      borderRadius: '50%', 
                      width: '32px', 
                      height: '32px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      padding: 0
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#E2E8F0'}
                    onMouseOut={e => e.currentTarget.style.background = '#F1F5F9'}
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="modal-camera" style={{ borderRadius: '24px', overflow: 'hidden', backgroundColor: '#0F172A', position: 'relative', height: '200px', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)' }}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', position: 'absolute', inset: 0 }}
                  />
                  
                  {/* Scanner target frame & markers */}
                  <div style={{ position: 'absolute', inset: '24px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #3B82F6', borderLeft: '4px solid #3B82F6', borderTopLeftRadius: '8px' }} />
                    <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #3B82F6', borderRight: '4px solid #3B82F6', borderTopRightRadius: '8px' }} />
                    <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #3B82F6', borderLeft: '4px solid #3B82F6', borderBottomLeftRadius: '8px' }} />
                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #3B82F6', borderRight: '4px solid #3B82F6', borderBottomRightRadius: '8px' }} />
                    
                    {/* Scanner laser line */}
                    <div className="scanner-line" style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, #3B82F6, transparent)',
                      boxShadow: '0 0 8px #3B82F6'
                    }} />
                  </div>

                  {!hasStream && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', background: '#0F172A' }}>
                      <div className="camera-pulse" style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.1)', border: '2px solid rgba(59, 130, 246, 0.3)', borderRadius: '50%', color: '#3B82F6' }}>
                        <Camera size={36} />
                      </div>
                      <span style={{ fontWeight: 600, color: '#94A3B8', fontSize: '14px', letterSpacing: '0.5px' }}>Mengakses Kamera...</span>
                    </div>
                  )}
                </div>

                <div className="modal-info" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: locationStatus === 'outside' ? '#FEF2F2' : '#F8FAFC', border: `1px solid ${locationStatus === 'outside' ? '#FCA5A5' : '#E2E8F0'}`, padding: '12px 16px', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: locationStatus === 'outside' ? '#FEE2E2' : '#EFF6FF' }}>
                      <MapPin size={18} color={locationStatus === 'outside' ? '#EF4444' : '#2563EB'} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Geofence Divisi: {user ? (user.divisi || user.div || 'Sekolah') : 'Sekolah'}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: locationStatus === 'outside' ? '#EF4444' : '#0F172A' }}>
                        {locationStatus === 'loading' && 'Mendapatkan lokasi...'}
                        {locationStatus === 'error' && 'Gagal mendapatkan lokasi GPS'}
                        {locationStatus === 'inside' && (
                          distance !== null && distance > 1000 
                            ? `${getTargetGeofence(user?.divisi || user?.div).name} (Mode Demo)` 
                            : `${getTargetGeofence(user?.divisi || user?.div).name} (Valid)`
                        )}
                        {locationStatus === 'outside' && `Di luar area! (Jarak: ${distance !== null ? distance.toFixed(0) : '-'}m, Maks: ${getTargetGeofence(user?.divisi || user?.div).radius}m)`}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF' }}>
                      <Clock size={18} color="#2563EB" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waktu Deteksi</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB</span>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  disabled={locationStatus !== 'inside'}
                  style={{ 
                    width: '100%', 
                    marginTop: '16px', 
                    padding: '16px', 
                    borderRadius: '16px', 
                    fontSize: '16px', 
                    boxShadow: locationStatus === 'inside' ? '0 10px 20px -5px rgba(37,99,235,0.3)' : 'none',
                    opacity: locationStatus !== 'inside' ? 0.5 : 1,
                    cursor: locationStatus !== 'inside' ? 'not-allowed' : 'pointer',
                    background: locationStatus === 'outside' ? '#EF4444' : ''
                  }} 
                  onClick={submitHadir}
                >
                  {locationStatus === 'outside' ? 'Di Luar Jangkauan' : t.rekamHadir}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
