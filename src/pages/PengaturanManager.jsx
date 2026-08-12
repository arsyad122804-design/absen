import React, { useState } from 'react';
import { Settings, Clock, MapPin, Bell, Shield, Save } from 'lucide-react';
import './LaporanManager.css';

export default function PengaturanManager() {
  const [activeTab, setActiveTab] = useState('jam');

  const getBtnStyle = (tab) => ({
    padding: '12px 16px',
    background: activeTab === tab ? '#EFF6FF' : 'transparent',
    color: activeTab === tab ? '#3B82F6' : '#64748B',
    borderRadius: '8px',
    border: 'none',
    fontWeight: activeTab === tab ? 600 : 500,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  return (
    <div className="mgr-page-content" style={{ padding: '32px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Pengaturan Perusahaan</h1>
          <p style={{ color: '#64748B', fontSize: '15px' }}>Konfigurasi jam kerja, lokasi, dan preferensi aplikasi absensi.</p>
        </div>
        <button onClick={() => alert('Pengaturan Disimpan!')} style={{ padding: '10px 20px', background: '#3B82F6', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Save size={16} /> Simpan Perubahan
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px' }}>
        
        {/* SIDE MENU SETTINGS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={getBtnStyle('jam')} onClick={() => setActiveTab('jam')}>
            <Clock size={18} /> Jam Operasional
          </button>
          <button style={getBtnStyle('lokasi')} onClick={() => setActiveTab('lokasi')}>
            <MapPin size={18} /> Lokasi Kantor
          </button>
          <button style={getBtnStyle('notifikasi')} onClick={() => setActiveTab('notifikasi')}>
            <Bell size={18} /> Notifikasi
          </button>
          <button style={getBtnStyle('keamanan')} onClick={() => setActiveTab('keamanan')}>
            <Shield size={18} /> Keamanan
          </button>
        </div>

        {/* SETTINGS FORM */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          
          {activeTab === 'jam' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>Konfigurasi Jam Operasional</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Jam Masuk Standar</label>
                  <input type="time" defaultValue="08:00" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', color: '#0F172A', fontWeight: 500 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Jam Pulang Standar</label>
                  <input type="time" defaultValue="17:00" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', color: '#0F172A', fontWeight: 500 }} />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Toleransi Keterlambatan (Menit)</label>
                <input type="number" defaultValue="15" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', color: '#0F172A', fontWeight: 500 }} />
                <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px' }}>Karyawan yang absen di luar batas toleransi akan ditandai "Terlambat".</p>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#3B82F6' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Aktifkan Notifikasi Pengingat Absensi (Otomatis H-15 menit)</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'lokasi' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>Pengaturan Lokasi Kantor</h2>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Titik Koordinat Utama (Latitude, Longitude)</label>
                <input type="text" defaultValue="-6.2088, 106.8456" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', color: '#0F172A', fontWeight: 500 }} />
                <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px' }}>Digunakan sebagai titik pusat validasi kehadiran karyawan.</p>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Radius Maksimal Absensi (Meter)</label>
                <input type="number" defaultValue="500" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', color: '#0F172A', fontWeight: 500 }} />
                <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px' }}>Karyawan tidak dapat check-in jika berada di luar radius ini.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifikasi' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>Notifikasi Sistem Manager</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#3B82F6' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Kirim Notifikasi via Email saat ada Pengajuan Cuti Baru</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#3B82F6' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Terima Laporan Kehadiran Mingguan via Email (Tiap Jumat Sore)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: '#3B82F6' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Alert jika ada Karyawan Terlambat lebih dari 30 Menit</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'keamanan' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>Kebijakan Keamanan Absensi</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#3B82F6' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Wajibkan Pengenalan Wajah (Face Recognition) saat Check In</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#3B82F6' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Blokir Aplikasi Manipulasi GPS (Mock Location)</span>
                </label>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Batas Waktu Sesi Login Kedaluwarsa (Jam)</label>
                <input type="number" defaultValue="24" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', color: '#0F172A', fontWeight: 500 }} />
                <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px' }}>Karyawan harus login ulang setelah durasi ini tercapai.</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
