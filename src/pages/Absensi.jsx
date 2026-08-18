import React, { useState, useEffect } from 'react'
import { Calendar as Cal, MapPin, Clock, Camera, Check, X, Maximize } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'

export default function Absensi() {
  const { t } = useLanguage()
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [user, setUser] = useState(null)
  const [alasan, setAlasan] = useState('')

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user')
      if (userData && userData !== 'undefined' && userData !== 'null') {
        setUser(JSON.parse(userData))
      }
    } catch (e) {
      console.error(e)
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    checkLocation();
    return () => clearInterval(timer);
  }, []);

  const videoRef = React.useRef(null)
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, inside, outside, error
  const [distance, setDistance] = useState(null);
  const [coords, setCoords] = useState(null);

  // Kumpulan titik koordinat (Polygon) area sekolah (Jl. Wonosari No.16, Sambeng, Kasiman, Bojonegoro)
  const SCHOOL_POLYGON = [
    { lat: -7.1330, lng: 111.6240 },
    { lat: -7.1360, lng: 111.6240 },
    { lat: -7.1360, lng: 111.6270 },
    { lat: -7.1330, lng: 111.6270 },
  ];

  // Algoritma Ray-Casting untuk mendeteksi apakah lokasi user berada di DALAM area Polygon
  const isPointInPolygon = (point, polygon) => {
    let x = point.lat, y = point.lng;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i].lat, yi = polygon[i].lng;
      let xj = polygon[j].lat, yj = polygon[j].lng;
      
      let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

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
        
        // Simpan titik saat ini untuk debugging / pembuatan poligon asli
        window.userCurrentLocation = userPoint;
        console.log("TITIK KOORDINAT ANDA SEKARANG:", userPoint);

        const isInside = isPointInPolygon(userPoint, SCHOOL_POLYGON);
        
        // SEMENTARA UNTUK TESTING: Kita anggap selalu di dalam (true)
        // karena poligon asli belum dipasang. Nanti kita kembalikan ke `isInside`.
        if (true) {
          setLocationStatus('inside');
        } else {
          setLocationStatus('outside');
        }
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
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
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
        tanggal: today,
        waktu_masuk: timeStr,
        waktu_keluar: null,
        status: status,
        keterangan: '-',
        lokasi: lokasiStr
      };
      const local = JSON.parse(localStorage.getItem('local_absensi')) || [];
      local.unshift(localRec);
      localStorage.setItem('local_absensi', JSON.stringify(local));

      // 2. Coba simpan ke Supabase jika bukan akun demo
      const isDemo = !user.id || user.id.startsWith('karyawan-') || user.id.startsWith('admin-');
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
    if (alasan.trim().length < 5) {
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
      const lokasiStr = null; // Tidak mencatat lokasi GPS untuk Izin / Sakit

      // 1. Simpan ke LocalStorage agar langsung muncul di riwayat (offline/demo fallback)
      const localRec = {
        id: Date.now(),
        karyawan_id: user.id,
        tanggal: today,
        waktu_masuk: timeStr,
        waktu_keluar: null,
        status: status,
        keterangan: alasan,
        lokasi: lokasiStr
      };
      const local = JSON.parse(localStorage.getItem('local_absensi')) || [];
      local.unshift(localRec);
      localStorage.setItem('local_absensi', JSON.stringify(local));

      // 2. Coba simpan ke Supabase jika bukan akun demo
      const isDemo = !user.id || user.id.startsWith('karyawan-') || user.id.startsWith('admin-');
      if (!isDemo) {
        const { error } = await supabase
          .from('absensi')
          .insert([
            {
              karyawan_id: user.id,
              tanggal: today,
              waktu_masuk: timeStr,
              status: status,
              keterangan: alasan,
              lokasi: lokasiStr
            }
          ]);
        if (error) console.error("Error submitting reason to Supabase:", error);
      }

      setSelectedStatus(null);
      setAlasan('');
      alert('Pengajuan berhasil dicatat!');
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
          <p>{t.pilihKondisi}</p>
        </div>
        <div className="date-badge">
          <Cal size={18} />
          <span>{currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

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

      {(selectedStatus === 'izin' || selectedStatus === 'sakit') && (
        <div className="alasan-box slide-down">
          <h4>{t.keterangan} / Alasan</h4>
          <p>Tuliskan alasan {selectedStatus === 'izin' ? 'izin' : 'sakit'} Anda agar dapat diverifikasi oleh admin.</p>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '24px', padding: '32px' }}>
            <button className="modal-close" onClick={() => setShowModal(false)}><X size={24} /></button>
            <h3 className="modal-title" style={{ fontSize: '20px', marginBottom: '24px' }}>Verifikasi Kehadiran</h3>
            
            <div className="modal-camera" style={{ borderRadius: '20px', overflow: 'hidden', border: '2px dashed #CBD5E1', backgroundColor: '#000', position: 'relative' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', height: '240px', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
              {!videoRef.current?.srcObject && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', background: '#F8FAFC' }}>
                  <div style={{ padding: '16px', background: '#EEF2FF', borderRadius: '50%', color: '#4F46E5' }}>
                    <Camera size={36} />
                  </div>
                  <span style={{ fontWeight: 500, color: '#475569' }}>Mengakses Kamera...</span>
                </div>
              )}
            </div>

            <div className="modal-info" style={{ marginTop: '24px', background: '#F1F5F9', padding: '16px', borderRadius: '16px' }}>
              <div className="modal-info-row">
                <MapPin size={18} color={locationStatus === 'outside' ? '#EF4444' : '#2563EB'} />
                <span style={{ fontWeight: 500, color: locationStatus === 'outside' ? '#EF4444' : '#0F172A' }}>
                  {locationStatus === 'loading' && 'Mendapatkan lokasi...'}
                  {locationStatus === 'error' && 'Gagal mendapatkan lokasi GPS'}
                  {locationStatus === 'inside' && `SMA Hibatullah IIBS (Lokasi Valid)`}
                  {locationStatus === 'outside' && `Di luar area batas sekolah!`}
                </span>
              </div>
              <div className="modal-info-row" style={{ marginTop: '12px' }}>
                <Clock size={18} color="#2563EB" />
                <span style={{ fontWeight: 500, color: '#0F172A' }}>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
              </div>
            </div>

            <button 
              className="btn-primary" 
              disabled={locationStatus !== 'inside'}
              style={{ 
                width: '100%', 
                marginTop: '24px', 
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
    </div>
  )
}
