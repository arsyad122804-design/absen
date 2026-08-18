import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Absensi from './pages/Absensi'
import DashboardLayout from './layouts/DashboardLayout'
import RiwayatAbsen from './pages/RiwayatAbsen'
import Jadwal from './pages/Jadwal'
import Pengumuman from './pages/Pengumuman'
import ProfilSaya from './pages/ProfilSaya'
import Pengaturan from './pages/Pengaturan'
import Bantuan from './pages/Bantuan'
import Dashboard from './pages/Dashboard'
import ManagerLayout from './layouts/ManagerLayout'
import AbsensiManager from './pages/AbsensiManager'
import TimKaryawan from './pages/TimKaryawan'
import RiwayatAbsensiManager from './pages/RiwayatAbsensiManager'
import LaporanManager from './pages/LaporanManager'
import IzinCutiManager from './pages/IzinCutiManager'
import PengajuanManager from './pages/PengajuanManager'
import PengaturanManager from './pages/PengaturanManager'
import { LanguageProvider } from './contexts/LanguageContext'
import './App.css'
function DashboardRedirect() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  if (user.role?.toLowerCase() === 'manager') {
    return <Navigate to="/manager/dashboard" replace />;
  }
  return <Navigate to="/absen" replace />;
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        
        {/* Manager Routes */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="absensi" element={<AbsensiManager />} />
          <Route path="tim" element={<TimKaryawan />} />
          <Route path="riwayat" element={<RiwayatAbsensiManager />} />
          <Route path="laporan" element={<LaporanManager />} />
          <Route path="izin" element={<IzinCutiManager />} />
          <Route path="pengajuan" element={<PengajuanManager />} />
          <Route path="pengaturan" element={<PengaturanManager />} />
        </Route>
        
        {/* Karyawan Routes */}
        <Route path="/absen" element={<DashboardLayout />}>
          <Route index element={<Absensi />} />
          <Route path="riwayat" element={<RiwayatAbsen />} />
          <Route path="profil" element={<ProfilSaya />} />
          <Route path="pengaturan" element={<Pengaturan />} />
          <Route path="bantuan" element={<Bantuan />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
