import React, { useState } from 'react';
import { Settings, Clock, MapPin, Bell, Shield, Save } from 'lucide-react';
import './PengaturanManager.css';

export default function PengaturanManager() {
  const [activeTab, setActiveTab] = useState('jam');

  const [workHours, setWorkHours] = useState(() => {
    const saved = localStorage.getItem('app_work_hours');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      Operasional: { masuk: "08:00", pulang: "17:00" },
      Sekolah: { masuk: "07:00", pulang: "14:00" },
      Kepesantrenan: { masuk1: "07:30", pulang1: "12:00", masuk2: "13:30", pulang2: "17:00" }
    };
  });

  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('app_office_locations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      Kepesantrenan: {
        name: 'Kantor Pengasuh (Kepesantrenan)',
        coords: '-7.1336, 111.6252',
        radius: 50,
        address: 'Kantor Pengasuhan Santri & Komplek Asrama'
      },
      Sekolah: {
        name: 'Kantor Sekolah (Akademik)',
        coords: '-7.1338, 111.6262',
        radius: 50,
        address: 'Gedung Sekolah, Ruang Guru & Kelas'
      },
      Operasional: {
        name: 'Kantor Operasional (Pusat)',
        coords: '-7.1348, 111.6246',
        radius: 50,
        address: 'Jl. Wonosari No.16, Sendang Gedhe, Sambeng, Kasiman, Bojonegoro'
      }
    };
  });

  const handleChange = (div, field, val) => {
    setWorkHours(prev => ({
      ...prev,
      [div]: {
        ...prev[div],
        [field]: val
      }
    }));
  };

  const handleLocationChange = (div, field, val) => {
    setLocations(prev => ({
      ...prev,
      [div]: {
        ...prev[div],
        [field]: val
      }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('app_work_hours', JSON.stringify(workHours));
    localStorage.setItem('app_office_locations', JSON.stringify(locations));
    alert('Pengaturan jam kerja dan lokasi kantor berhasil disimpan!');
  };

  return (
    <div className="mgr-page-content">
      <div className="pmg-header">
        <div>
          <h1>Pengaturan Perusahaan</h1>
          <p>Konfigurasi jam kerja, lokasi, dan preferensi aplikasi absensi.</p>
        </div>
        <button onClick={handleSave} className="pmg-btn-save">
          <Save size={16} /> Simpan Perubahan
        </button>
      </div>

      <div className="pmg-layout">
        
        {/* SIDE MENU SETTINGS */}
        <div className="pmg-nav-list">
          <button className={`pmg-nav-btn ${activeTab === 'jam' ? 'active' : ''}`} onClick={() => setActiveTab('jam')}>
            <Clock size={18} /> Jam Operasional
          </button>
          <button className={`pmg-nav-btn ${activeTab === 'lokasi' ? 'active' : ''}`} onClick={() => setActiveTab('lokasi')}>
            <MapPin size={18} /> Lokasi Kantor
          </button>
          <button className={`pmg-nav-btn ${activeTab === 'notifikasi' ? 'active' : ''}`} onClick={() => setActiveTab('notifikasi')}>
            <Bell size={18} /> Notifikasi
          </button>
          <button className={`pmg-nav-btn ${activeTab === 'keamanan' ? 'active' : ''}`} onClick={() => setActiveTab('keamanan')}>
            <Shield size={18} /> Keamanan
          </button>
        </div>

        {/* SETTINGS FORM */}
        <div className="pmg-form-card">
          
          {activeTab === 'jam' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 className="pmg-section-title" style={{ marginBottom: '8px', paddingBottom: '12px' }}>Konfigurasi Jam Kerja Divisi</h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0' }}>Sesuaikan jam masuk dan pulang untuk masing-masing divisi agar absensi tercatat dengan akurat.</p>
              </div>

              {/* DIVISI: OPERASIONAL */}
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                  Divisi Operasional (Admin & Staff)
                </h3>
                <div className="pmg-form-grid" style={{ gap: '16px' }}>
                  <div className="pmg-field">
                    <label>Jam Masuk</label>
                    <input 
                      type="time" 
                      value={workHours.Operasional.masuk} 
                      onChange={(e) => handleChange('Operasional', 'masuk', e.target.value)} 
                      className="pmg-input" 
                    />
                  </div>
                  <div className="pmg-field">
                    <label>Jam Pulang</label>
                    <input 
                      type="time" 
                      value={workHours.Operasional.pulang} 
                      onChange={(e) => handleChange('Operasional', 'pulang', e.target.value)} 
                      className="pmg-input" 
                    />
                  </div>
                </div>
              </div>

              {/* DIVISI: SEKOLAH */}
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span>
                  Divisi Sekolah (Guru & Akademik)
                </h3>
                <div className="pmg-form-grid" style={{ gap: '16px' }}>
                  <div className="pmg-field">
                    <label>Jam Masuk</label>
                    <input 
                      type="time" 
                      value={workHours.Sekolah.masuk} 
                      onChange={(e) => handleChange('Sekolah', 'masuk', e.target.value)} 
                      className="pmg-input" 
                    />
                  </div>
                  <div className="pmg-field">
                    <label>Jam Pulang</label>
                    <input 
                      type="time" 
                      value={workHours.Sekolah.pulang} 
                      onChange={(e) => handleChange('Sekolah', 'pulang', e.target.value)} 
                      className="pmg-input" 
                    />
                  </div>
                </div>
              </div>

              {/* DIVISI: KEPESANTRENAN */}
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                  Divisi Kepesantrenan (Pengasuh & Ustadz - Split Shift)
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Sesi 1 */}
                  <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '20px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#475569', margin: '0 0 12px 0' }}>Sesi 1 (Pagi - Siang)</h4>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="pmg-field" style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px' }}>Jam Masuk 1</label>
                        <input 
                          type="time" 
                          value={workHours.Kepesantrenan.masuk1} 
                          onChange={(e) => handleChange('Kepesantrenan', 'masuk1', e.target.value)} 
                          className="pmg-input" 
                        />
                      </div>
                      <div className="pmg-field" style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px' }}>Jam Pulang 1</label>
                        <input 
                          type="time" 
                          value={workHours.Kepesantrenan.pulang1} 
                          onChange={(e) => handleChange('Kepesantrenan', 'pulang1', e.target.value)} 
                          className="pmg-input" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sesi 2 */}
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#475569', margin: '0 0 12px 0' }}>Sesi 2 (Sore - Malam)</h4>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="pmg-field" style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px' }}>Jam Masuk 2</label>
                        <input 
                          type="time" 
                          value={workHours.Kepesantrenan.masuk2} 
                          onChange={(e) => handleChange('Kepesantrenan', 'masuk2', e.target.value)} 
                          className="pmg-input" 
                        />
                      </div>
                      <div className="pmg-field" style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px' }}>Jam Pulang 2</label>
                        <input 
                          type="time" 
                          value={workHours.Kepesantrenan.pulang2} 
                          onChange={(e) => handleChange('Kepesantrenan', 'pulang2', e.target.value)} 
                          className="pmg-input" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lokasi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 className="pmg-section-title" style={{ marginBottom: '8px', paddingBottom: '12px' }}>Pengaturan Lokasi Kantor & Geofence</h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0' }}>Atur titik koordinat GPS dan radius absensi untuk masing-masing unit/kantor.</p>
              </div>

              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '14px 16px', color: '#1E40AF', fontSize: '13px', lineHeight: 1.5 }}>
                💡 <strong>Tips Format Koordinat & Radius:</strong>
                <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                  <li>Mendukung format <strong>DMS</strong> (contoh: <code>7°08'02.70"S 111°37'27.78"E</code>) maupun <strong>Desimal</strong> (contoh: <code>-7.1336, 111.6252</code>).</li>
                  <li><strong>Radius Disarankan:</strong> Minimal <strong>30–50 meter</strong> karena akurasi GPS smartphone umumnya memiliki deviasi toleransi 10–30 meter.</li>
                </ul>
              </div>

              {/* KANTOR PENGASUH (KEPESANTRENAN) */}
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                  Kantor Pengasuh (Kepesantrenan)
                </h3>
                <div className="pmg-form-grid" style={{ gap: '16px', marginBottom: '14px' }}>
                  <div className="pmg-field">
                    <label>Titik Koordinat (Latitude, Longitude)</label>
                    <input 
                      type="text" 
                      value={locations.Kepesantrenan?.coords || ''} 
                      onChange={(e) => handleLocationChange('Kepesantrenan', 'coords', e.target.value)} 
                      placeholder="-7.1336, 111.6252"
                      className="pmg-input" 
                    />
                  </div>
                  <div className="pmg-field">
                    <label>Radius Maksimal Absensi (Meter)</label>
                    <input 
                      type="number" 
                      value={locations.Kepesantrenan?.radius || 50} 
                      onChange={(e) => handleLocationChange('Kepesantrenan', 'radius', Number(e.target.value))} 
                      className="pmg-input" 
                    />
                  </div>
                </div>
                <div className="pmg-field" style={{ margin: 0 }}>
                  <label>Alamat / Keterangan Area</label>
                  <input 
                    type="text" 
                    value={locations.Kepesantrenan?.address || ''} 
                    onChange={(e) => handleLocationChange('Kepesantrenan', 'address', e.target.value)} 
                    placeholder="Kantor Pengasuhan Santri & Komplek Asrama"
                    className="pmg-input" 
                  />
                  <p className="pmg-hint" style={{ marginTop: '6px' }}>Karyawan divisi Kepesantrenan akan divalidasi berdasarkan titik ini.</p>
                </div>
              </div>

              {/* KANTOR SEKOLAH (AKADEMIK) */}
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span>
                  Kantor Sekolah (Akademik)
                </h3>
                <div className="pmg-form-grid" style={{ gap: '16px', marginBottom: '14px' }}>
                  <div className="pmg-field">
                    <label>Titik Koordinat (Latitude, Longitude)</label>
                    <input 
                      type="text" 
                      value={locations.Sekolah?.coords || ''} 
                      onChange={(e) => handleLocationChange('Sekolah', 'coords', e.target.value)} 
                      placeholder="-7.1338, 111.6262"
                      className="pmg-input" 
                    />
                  </div>
                  <div className="pmg-field">
                    <label>Radius Maksimal Absensi (Meter)</label>
                    <input 
                      type="number" 
                      value={locations.Sekolah?.radius || 50} 
                      onChange={(e) => handleLocationChange('Sekolah', 'radius', Number(e.target.value))} 
                      className="pmg-input" 
                    />
                  </div>
                </div>
                <div className="pmg-field" style={{ margin: 0 }}>
                  <label>Alamat / Keterangan Area</label>
                  <input 
                    type="text" 
                    value={locations.Sekolah?.address || ''} 
                    onChange={(e) => handleLocationChange('Sekolah', 'address', e.target.value)} 
                    placeholder="Gedung Sekolah, Ruang Guru & Kelas"
                    className="pmg-input" 
                  />
                  <p className="pmg-hint" style={{ marginTop: '6px' }}>Guru dan staf akademik akan divalidasi berdasarkan titik ini.</p>
                </div>
              </div>

              {/* KANTOR OPERASIONAL (PUSAT) */}
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                  Kantor Operasional (Pusat & Staff)
                </h3>
                <div className="pmg-form-grid" style={{ gap: '16px', marginBottom: '14px' }}>
                  <div className="pmg-field">
                    <label>Titik Koordinat (Latitude, Longitude)</label>
                    <input 
                      type="text" 
                      value={locations.Operasional?.coords || ''} 
                      onChange={(e) => handleLocationChange('Operasional', 'coords', e.target.value)} 
                      placeholder="-7.1348, 111.6246"
                      className="pmg-input" 
                    />
                  </div>
                  <div className="pmg-field">
                    <label>Radius Maksimal Absensi (Meter)</label>
                    <input 
                      type="number" 
                      value={locations.Operasional?.radius || 50} 
                      onChange={(e) => handleLocationChange('Operasional', 'radius', Number(e.target.value))} 
                      className="pmg-input" 
                    />
                  </div>
                </div>
                <div className="pmg-field" style={{ margin: 0 }}>
                  <label>Alamat / Keterangan Area</label>
                  <input 
                    type="text" 
                    value={locations.Operasional?.address || ''} 
                    onChange={(e) => handleLocationChange('Operasional', 'address', e.target.value)} 
                    placeholder="Jl. Wonosari No.16, Sendang Gedhe, Sambeng, Kasiman, Bojonegoro"
                    className="pmg-input" 
                  />
                  <p className="pmg-hint" style={{ marginTop: '6px' }}>Staf operasional dan admin akan divalidasi berdasarkan titik ini.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifikasi' && (
            <div>
              <h2 className="pmg-section-title">Notifikasi Sistem Manager</h2>
              <div className="pmg-checkbox-group">
                <label className="pmg-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Kirim Notifikasi via Email saat ada Pengajuan Cuti Baru</span>
                </label>
                <label className="pmg-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Terima Laporan Kehadiran Mingguan via Email (Tiap Jumat Sore)</span>
                </label>
                <label className="pmg-checkbox-label">
                  <input type="checkbox" />
                  <span>Alert jika ada Karyawan Terlambat lebih dari 30 Menit</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'keamanan' && (
            <div>
              <h2 className="pmg-section-title">Kebijakan Keamanan Absensi</h2>
              <div className="pmg-checkbox-group" style={{ marginBottom: '24px' }}>
                <label className="pmg-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Wajibkan Pengenalan Wajah (Face Recognition) saat Check In</span>
                </label>
                <label className="pmg-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Blokir Aplikasi Manipulasi GPS (Mock Location)</span>
                </label>
              </div>
              <div className="pmg-field">
                <label>Batas Waktu Sesi Login Kedaluwarsa (Jam)</label>
                <input type="number" defaultValue="24" className="pmg-input" />
                <p className="pmg-hint">Karyawan harus login ulang setelah durasi ini tercapai.</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
