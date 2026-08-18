import React, { useState } from 'react';
import { Settings, Clock, MapPin, Bell, Shield, Save } from 'lucide-react';
import './PengaturanManager.css';

export default function PengaturanManager() {
  const [activeTab, setActiveTab] = useState('jam');

  return (
    <div className="mgr-page-content">
      <div className="pmg-header">
        <div>
          <h1>Pengaturan Perusahaan</h1>
          <p>Konfigurasi jam kerja, lokasi, dan preferensi aplikasi absensi.</p>
        </div>
        <button onClick={() => alert('Pengaturan Disimpan!')} className="pmg-btn-save">
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
            <div>
              <h2 className="pmg-section-title">Konfigurasi Jam Operasional</h2>
              
              <div className="pmg-form-grid">
                <div className="pmg-field">
                  <label>Jam Masuk Standar</label>
                  <input type="time" defaultValue="08:00" className="pmg-input" />
                </div>
                <div className="pmg-field">
                  <label>Jam Pulang Standar</label>
                  <input type="time" defaultValue="17:00" className="pmg-input" />
                </div>
              </div>

              <div className="pmg-field">
                <label>Toleransi Keterlambatan (Menit)</label>
                <input type="number" defaultValue="15" className="pmg-input" />
                <p className="pmg-hint">Karyawan yang absen di luar batas toleransi akan ditandai "Terlambat".</p>
              </div>

              <div className="pmg-checkbox-group">
                <label className="pmg-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Aktifkan Notifikasi Pengingat Absensi (Otomatis H-15 menit)</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'lokasi' && (
            <div>
              <h2 className="pmg-section-title">Pengaturan Lokasi Kantor</h2>
              <div className="pmg-field">
                <label>Titik Koordinat Utama (Latitude, Longitude)</label>
                <input type="text" defaultValue="-7.1344, 111.6256" className="pmg-input" />
                <p className="pmg-hint">Alamat: Jl. Wonosari No.16, Sendang Gedhe, Sambeng, Kasiman, Bojonegoro</p>
              </div>
              <div className="pmg-field">
                <label>Radius Maksimal Absensi (Meter)</label>
                <input type="number" defaultValue="500" className="pmg-input" />
                <p className="pmg-hint">Karyawan tidak dapat check-in jika berada di luar radius ini.</p>
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
