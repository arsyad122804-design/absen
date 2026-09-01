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

const defaultGeofences = {
  Sekolah: {
    name: 'Area Sekolah (Akademik)',
    center: { lat: -7.1338, lng: 111.6262 },
    radius: 50 // meters
  },
  Kepesantrenan: {
    name: 'Area Kantor Pengasuh (Kepesantrenan)',
    center: { lat: -7.1336, lng: 111.6252 },
    radius: 50 // meters
  },
  Operasional: {
    name: 'Area Operasional (Pusat & Staff)',
    center: { lat: -7.1348, lng: 111.6246 },
    radius: 50 // meters
  }
};

const parseCoordsString = (coordsStr, fallbackCenter) => {
  if (!coordsStr || typeof coordsStr !== 'string') return fallbackCenter;
  const str = coordsStr.trim();
  
  // 1. Format DMS: 7°08'02.70"S 111°37'27.78"E atau variasi derajat/menit/detik
  const dmsRegex = /(\d+)[°\s]+(\d+)['\s]+([\d.]+)["]?\s*([NSEWnsew])/g;
  const matches = [...str.matchAll(dmsRegex)];
  
  if (matches.length === 2) {
    let lat = null;
    let lng = null;
    
    matches.forEach(m => {
      const deg = parseFloat(m[1]);
      const min = parseFloat(m[2]);
      const sec = parseFloat(m[3]);
      const dir = m[4].toUpperCase();
      
      let val = deg + (min / 60) + (sec / 3600);
      if (dir === 'S' || dir === 'W') val = -val;
      
      if (dir === 'N' || dir === 'S') lat = val;
      if (dir === 'E' || dir === 'W') lng = val;
    });
    
    if (lat !== null && lng !== null) {
      return { lat, lng };
    }
  }

  // 2. Format Desimal: "-7.1344, 111.6256" atau "-7.1344 111.6256"
  const clean = str.replace(/,/g, ' ').replace(/[^\d.\s-]/g, '').trim();
  const parts = clean.split(/\s+/).map(Number);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] };
  }

  return fallbackCenter;
};

const parseGeofence = (config, fallback) => {
  if (!config) return fallback;
  const center = parseCoordsString(config.coords, fallback.center);
  return {
    name: config.name || fallback.name,
    center,
    radius: Number(config.radius) || fallback.radius || 50
  };
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
  let locations = null;
  try {
    const saved = localStorage.getItem('app_office_locations');
    if (saved) locations = JSON.parse(saved);
  } catch (e) {}

  const name = divisionName?.toLowerCase() || '';
  if (name.includes('pesantren') || name.includes('santri') || name.includes('asrama') || name.includes('pengasuh')) {
    return parseGeofence(locations?.Kepesantrenan, defaultGeofences.Kepesantrenan);
  }
  if (name.includes('operasional') || name.includes('staff') || name.includes('pekerja') || name.includes('ob') || name.includes('admin')) {
    return parseGeofence(locations?.Operasional, defaultGeofences.Operasional);
  }
  return parseGeofence(locations?.Sekolah, defaultGeofences.Sekolah);
};

export default function Absensi() {
  const { t } = useLanguage()
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(null)
  const [todayRecords, setTodayRecords] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [user, setUser] = useState(null)
  const [alasan, setAlasan] = useState('')
  const [buktiSakit, setBuktiSakit] = useState('')
  const [hasStream, setHasStream] = useState(false)

  // Variabel kontrol alur
  let isAllDone = false;
  let currentActiveRecord = null;
  let flowType = 'checkin_1';

  const checkTodayAttendance = async (currentUser) => {
    if (!currentUser) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Ambil data dari LocalStorage
    const local = safeJsonParse('local_absensi', []);

    // Ambil data dari Supabase jika bukan akun demo
    let dbRecords = [];
    const isDemo = !currentUser.id || currentUser.id.toString().startsWith('karyawan-') || currentUser.id.toString().startsWith('admin-');
    if (!isDemo) {
      try {
        let targetId = currentUser.id;
        if (currentUser.name) {
          const { data: empData } = await supabase
            .from('karyawan')
            .select('id')
            .ilike('name', currentUser.name.trim())
            .maybeSingle();
          if (empData && empData.id) {
            targetId = empData.id;
            if (String(currentUser.id) !== String(targetId)) {
              const updatedUser = { ...currentUser, id: targetId };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          }
        }

        const { data } = await supabase
          .from('absensi')
          .select('*')
          .eq('karyawan_id', targetId)
          .eq('tanggal', todayStr)
          .order('waktu_masuk', { ascending: true });
        if (data) {
          dbRecords = data;
        }
      } catch (e) {
        console.error("Gagal memuat absensi hari ini:", e);
      }
    }

    if (dbRecords.length > 0) {
      // Supabase is ground truth! Filter out stale local records for today
      const freshLocal = local.filter(r => !(
        (String(r.karyawan_id) === String(currentUser.id) || (r.nama && currentUser.name && r.nama.toLowerCase() === currentUser.name.toLowerCase())) &&
        r.tanggal === todayStr
      ));
      localStorage.setItem('local_absensi', JSON.stringify(freshLocal));
    }

    const localRecords = safeJsonParse('local_absensi', [])
      .filter(r => String(r.karyawan_id) === String(currentUser.id) && r.tanggal === todayStr)
      .map(r => ({ ...r, isLocal: true }));

    // Gabungkan secara cerdas agar tidak menduplikasi waktu_masuk yang sama
    const combined = [...dbRecords];
    localRecords.forEach(lr => {
      const exists = dbRecords.some(dr => dr.waktu_masuk === lr.waktu_masuk);
      if (!exists) {
        combined.push(lr);
      }
    });

    // Urutkan berdasarkan waktu masuk secara menaik
    combined.sort((a, b) => (a.waktu_masuk || '').localeCompare(b.waktu_masuk || ''));

    setTodayRecords(combined);
    setAlreadyCheckedIn(combined[0] || null);
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

      // Ambil konfigurasi jam kerja dari LocalStorage
      const defaultHours = {
        Operasional: { masuk: "07:00", pulang: "15:00" },
        Sekolah: { masuk: "07:00", pulang: "15:00" },
        Kepesantrenan: { masuk1: "03:30", pulang1: "07:30", masuk2: "15:00", pulang2: "21:00" }
      };
      let workHours = defaultHours;
      try {
        const saved = localStorage.getItem('app_work_hours');
        if (saved) workHours = JSON.parse(saved);
      } catch (e) {}

      const division = user?.divisi || user?.div || 'Operasional';
      const hoursConfig = workHours[division] || workHours['Operasional'];
      
      // Target jam masuk (Sesi 2 untuk Kepesantrenan, atau masuk/masuk1 standar)
      const targetMasukStr = (isKepesantrenan && flowType === 'checkin_2') 
        ? hoursConfig.masuk2 
        : (hoursConfig.masuk1 || hoursConfig.masuk || '08:00');
      
      const [targetHour, targetMinute] = targetMasukStr.split(':').map(Number);
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const isLate = (currentHour > targetHour) || (currentHour === targetHour && currentMinute > targetMinute);

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

  const submitPulang = async () => {
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

      // Ambil konfigurasi jam kerja dari LocalStorage
      const defaultHours = {
        Operasional: { masuk: "07:00", pulang: "15:00" },
        Sekolah: { masuk: "07:00", pulang: "15:00" },
        Kepesantrenan: { masuk1: "03:30", pulang1: "07:30", masuk2: "15:00", pulang2: "21:00" }
      };
      let workHours = defaultHours;
      try {
        const saved = localStorage.getItem('app_work_hours');
        if (saved) workHours = JSON.parse(saved);
      } catch (e) {}

      const division = user?.divisi || user?.div || 'Operasional';
      const hoursConfig = workHours[division] || workHours['Operasional'];
      
      // Target jam pulang (Sesi 2 untuk Kepesantrenan, atau pulang/pulang1 standar)
      const targetPulangStr = (isKepesantrenan && flowType === 'checkout_2') 
        ? hoursConfig.pulang2 
        : (hoursConfig.pulang1 || hoursConfig.pulang || '17:00');
        
      const [targetPHour, targetPMinute] = targetPulangStr.split(':').map(Number);
      const currentPHour = now.getHours();
      const currentPMinute = now.getMinutes();
      const isEarlyCheckout = (currentPHour < targetPHour) || (currentPHour === targetPHour && currentPMinute < targetPMinute);

      if (isEarlyCheckout) {
        const confirmCheckout = window.confirm(`Jam pulang resmi adalah pukul ${targetPulangStr}. Apakah Anda yakin ingin melakukan absen pulang lebih awal?`);
        if (!confirmCheckout) {
          setShowModal(false);
          setSelectedStatus(null);
          return;
        }
      }

      if (!currentActiveRecord) {
        alert("Data absen masuk tidak ditemukan.");
        return;
      }

      // 1. Update di LocalStorage
      const local = safeJsonParse('local_absensi', []);
      const updatedLocal = local.map(r => {
        if (String(r.id) === String(currentActiveRecord.id)) {
          return { ...r, waktu_keluar: timeStr };
        }
        return r;
      });
      localStorage.setItem('local_absensi', JSON.stringify(updatedLocal));

      // 2. Update di Supabase jika bukan akun demo
      const isDemo = !user.id || user.id.toString().startsWith('karyawan-') || user.id.toString().startsWith('admin-');
      if (!isDemo && !currentActiveRecord.isLocal) {
        const { error } = await supabase
          .from('absensi')
          .update({ waktu_keluar: timeStr })
          .eq('id', currentActiveRecord.id);
        if (error) console.error("Error updating checkout to Supabase:", error);
      }

      setShowModal(false);
      setSelectedStatus(null);
      alert('Absen pulang berhasil dicatat!');
      checkTodayAttendance(user);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem.');
    }
  }

  const isKepesantrenan = user && (user.divisi === 'Kepesantrenan' || user.div === 'Kepesantrenan');

  const defaultHours = {
    Operasional: { masuk: "07:00", pulang: "15:00" },
    Sekolah: { masuk: "07:00", pulang: "15:00" },
    Kepesantrenan: { masuk1: "03:30", pulang1: "07:30", masuk2: "15:00", pulang2: "21:00" }
  };
  let workHours = defaultHours;
  try {
    const saved = localStorage.getItem('app_work_hours');
    if (saved) workHours = JSON.parse(saved);
  } catch (e) {}

  const division = user?.divisi || user?.div || 'Operasional';
  const hoursConfig = workHours[division] || workHours['Operasional'];
  
  const targetPulang1 = hoursConfig.pulang1 || hoursConfig.pulang || '17:00';
  const targetPulang2 = hoursConfig.pulang2 || '17:00';
  
  isAllDone = false;
  currentActiveRecord = null;
  flowType = 'checkin_1'; // checkin_1, checkout_1, checkin_2, checkout_2, done

  if (todayRecords.length === 0) {
    flowType = 'checkin_1';
  } else {
    const r1 = todayRecords[0];
    const hasIzinSakit = r1.status === 'Izin' || r1.status === 'Sakit';
    
    if (hasIzinSakit) {
      flowType = 'done';
      isAllDone = true;
      currentActiveRecord = r1;
    } else if (!r1.waktu_keluar || r1.waktu_keluar === '-') {
      flowType = 'checkout_1';
      currentActiveRecord = r1;
    } else {
      // Sesi 1 selesai
      if (!isKepesantrenan) {
        flowType = 'done';
        isAllDone = true;
        currentActiveRecord = r1;
      } else {
        // Kepesantrenan bisa Sesi 2
        if (todayRecords.length === 1) {
          flowType = 'checkin_2';
        } else {
          const r2 = todayRecords[1];
          if (!r2.waktu_keluar || r2.waktu_keluar === '-') {
            flowType = 'checkout_2';
            currentActiveRecord = r2;
          } else {
            flowType = 'done';
            isAllDone = true;
            currentActiveRecord = r2;
          }
        }
      }
    }
  }

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="greeting">
          <h1>{t.halo}, {user ? user.name : 'Karyawan'}!</h1>
          <p>{alreadyCheckedIn ? ((alreadyCheckedIn.status === 'Izin' || alreadyCheckedIn.status === 'Sakit' || (alreadyCheckedIn.waktu_keluar && alreadyCheckedIn.waktu_keluar !== '-')) ? 'Anda telah melakukan absensi hari ini.' : 'Silakan melakukan absen pulang.') : t.pilihKondisi}</p>
        </div>
        <div className="date-badge">
          <Cal size={18} />
          <span>{currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {flowType === 'done' ? (
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
          
          {isKepesantrenan && todayRecords.length >= 2 ? (
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
                <strong style={{ color: '#16A34A', fontSize: '14px' }}>{todayRecords[0].status}</strong>
              </div>
              <div style={{ borderBottom: '1px dashed #E2E8F0', paddingBottom: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: 600 }}>Sesi 1 (Pagi)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Waktu Masuk</span>
                  <strong style={{ color: '#0F172A', fontSize: '14px' }}>{todayRecords[0].waktu_masuk || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Waktu Pulang</span>
                  <strong style={{ color: '#0F172A', fontSize: '14px' }}>{todayRecords[0].waktu_keluar || '-'}</strong>
                </div>
              </div>
              <div>
                <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: 600 }}>Sesi 2 (Sore)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Waktu Masuk</span>
                  <strong style={{ color: '#0F172A', fontSize: '14px' }}>{todayRecords[1].waktu_masuk || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Waktu Pulang</span>
                  <strong style={{ color: '#0F172A', fontSize: '14px' }}>{todayRecords[1].waktu_keluar || '-'}</strong>
                </div>
              </div>
            </div>
          ) : (
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
                  color: currentActiveRecord?.status === 'Hadir' || currentActiveRecord?.status === 'Terlambat' ? '#16A34A' : '#2563EB',
                  fontSize: '14px' 
                }}>{currentActiveRecord?.status}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontSize: '13px' }}>Waktu Absen Masuk</span>
                <strong style={{ color: '#0F172A', fontSize: '14px' }}>
                  {currentActiveRecord?.waktu_masuk || currentActiveRecord?.waktu || '-'}
                </strong>
              </div>
              {currentActiveRecord?.waktu_keluar && currentActiveRecord?.waktu_keluar !== '-' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Waktu Absen Pulang</span>
                  <strong style={{ color: '#0F172A', fontSize: '14px' }}>
                    {currentActiveRecord?.waktu_keluar}
                  </strong>
                </div>
              )}
              {currentActiveRecord?.keterangan && currentActiveRecord?.keterangan !== '-' && !currentActiveRecord?.keterangan.startsWith('data:image/') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Keterangan</span>
                  <span style={{ color: '#334155', fontSize: '13px', lineHeight: 1.4 }}>
                    {currentActiveRecord?.keterangan}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : flowType === 'checkout_1' ? (
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
            background: '#EFF6FF',
            color: '#2563EB',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.12)'
          }}>
            <Clock size={40} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Absen Pulang {isKepesantrenan ? 'Sesi 1' : '(Check Out)'}</h2>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Anda sudah melakukan absen masuk hari ini. Silakan catatkan absen pulang Anda {isKepesantrenan ? `Sesi 1 (Jam ${targetPulang1})` : `setelah jam pulang dimulai (Jam ${targetPulang1})`}.
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
              <span style={{ color: '#64748B', fontSize: '13px' }}>Status Masuk</span>
              <strong style={{ color: '#16A34A', fontSize: '14px' }}>{currentActiveRecord?.status}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', fontSize: '13px' }}>Jam Masuk</span>
              <strong style={{ color: '#0F172A', fontSize: '14px' }}>
                {currentActiveRecord?.waktu_masuk || currentActiveRecord?.waktu || '-'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', fontSize: '13px' }}>Jam Pulang</span>
              <strong style={{ color: '#94A3B8', fontSize: '14px' }}>Belum Absen</strong>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 10px 20px -5px rgba(37,99,235,0.2)'
            }}
            onClick={() => {
              setSelectedStatus('pulang');
              setShowModal(true);
            }}
          >
            Rekam Absen Pulang
          </button>
        </div>
      ) : flowType === 'checkin_2' ? (
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
            background: '#EFF6FF',
            color: '#2563EB',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.12)'
          }}>
            <Check size={40} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Absen Masuk Sore (Sesi 2)</h2>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Absensi Sesi 1 Anda telah selesai. Silakan lakukan absen masuk untuk Sesi 2 (Sore).
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
              <span style={{ color: '#64748B', fontSize: '13px' }}>Masuk Sesi 1</span>
              <strong style={{ color: '#0F172A', fontSize: '14px' }}>{todayRecords[0].waktu_masuk || '-'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', fontSize: '13px' }}>Pulang Sesi 1</span>
              <strong style={{ color: '#0F172A', fontSize: '14px' }}>{todayRecords[0].waktu_keluar || '-'}</strong>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 10px 20px -5px rgba(37,99,235,0.2)'
            }}
            onClick={() => {
              setSelectedStatus('hadir');
              setShowModal(true);
            }}
          >
            Rekam Absen Masuk Sesi 2
          </button>
        </div>
      ) : flowType === 'checkout_2' ? (
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
            background: '#EFF6FF',
            color: '#2563EB',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.12)'
          }}>
            <Clock size={40} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Absen Pulang Sore (Sesi 2)</h2>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Anda sudah melakukan absen masuk Sesi 2. Silakan catatkan absen pulang sore Anda (Mulai Jam {targetPulang2}).
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
              <span style={{ color: '#64748B', fontSize: '13px' }}>Masuk Sesi 2</span>
              <strong style={{ color: '#16A34A', fontSize: '14px' }}>{currentActiveRecord?.status}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', fontSize: '13px' }}>Jam Masuk Sesi 2</span>
              <strong style={{ color: '#0F172A', fontSize: '14px' }}>{currentActiveRecord?.waktu_masuk || '-'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', fontSize: '13px' }}>Jam Pulang Sesi 2</span>
              <strong style={{ color: '#94A3B8', fontSize: '14px' }}>Belum Absen</strong>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 10px 20px -5px rgba(37,99,235,0.2)'
            }}
            onClick={() => {
              setSelectedStatus('pulang');
              setShowModal(true);
            }}
          >
            Rekam Absen Pulang Sesi 2
          </button>
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
                  disabled={locationStatus === 'loading'}
                  style={{ 
                    width: '100%', 
                    marginTop: '16px', 
                    padding: '16px', 
                    borderRadius: '16px', 
                    fontSize: '16px', 
                    boxShadow: '0 10px 20px -5px rgba(37,99,235,0.3)',
                    cursor: locationStatus === 'loading' ? 'not-allowed' : 'pointer'
                  }} 
                  onClick={selectedStatus === 'pulang' ? submitPulang : submitHadir}
                >
                  {selectedStatus === 'pulang' ? 'Rekam Absen Pulang' : t.rekamHadir}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
