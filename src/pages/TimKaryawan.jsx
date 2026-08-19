import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Plus, Bell, Users, UserCheck, Clock, UserMinus, Network, 
  Search, ChevronDown, Filter, MoreVertical, X, Info, Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './TimKaryawan.css';

export default function TimKaryawan() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('Semua Divisi');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterKerja, setFilterKerja] = useState('Semua');

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('local_karyawan');
      const local = [];
      
      let dbData = [];
      const { data, error } = await supabase
        .from('karyawan')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbData = data.map(emp => ({
          id: emp.id,
          name: emp.name,
          role: emp.role || 'Karyawan',
          div: emp.divisi || 'Sekolah',
          type: 'Full Time',
          status: emp.status || 'Aktif',
          join: emp.created_at ? new Date(emp.created_at).toLocaleDateString('id-ID') : 'Baru saja',
          email: `${emp.name.toLowerCase().replace(/\s+/g, '')}@inovasidigital.id`,
          phone: emp.phone || '+62 812-0000-0000'
        }));
      }

      // Gabungkan data lokal & Supabase (tanpa duplikat nama)
      const combined = [...local];
      dbData.forEach(d => {
        if (!combined.some(c => c.name?.toLowerCase() === d.name?.toLowerCase())) {
          combined.push(d);
        }
      });

      // Tambahkan juga user yang sedang login jika tipe Karyawan
      const loggedUser = JSON.parse(localStorage.getItem('user'));
      if (loggedUser && loggedUser.name && loggedUser.role?.toLowerCase() !== 'manager') {
        if (!combined.some(c => c.name?.toLowerCase() === loggedUser.name?.toLowerCase())) {
          combined.push({
            id: loggedUser.id || `KRY-${String(combined.length + 1).padStart(4, '0')}`,
            name: loggedUser.name,
            role: loggedUser.role || 'Karyawan',
            div: loggedUser.divisi || loggedUser.div || 'Kepesantrenan',
            type: 'Full Time',
            status: 'Aktif',
            join: new Date().toLocaleDateString('id-ID'),
            email: `${loggedUser.name.toLowerCase().replace(/\s+/g, '')}@inovasidigital.id`,
            phone: '+62 812-0000-0000'
          });
        }
      }

      setEmployees(combined);
    } catch (err) {
      console.error(err);
      const local = JSON.parse(localStorage.getItem('local_karyawan')) || [];
      setEmployees(local);
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Hapus karyawan ini?')) {
      const isLocalOnly = id.toString().startsWith('KRY-') || id.toString().startsWith('kry-');
      if (!isLocalOnly) {
        try {
          await supabase.from('karyawan').delete().eq('id', id);
        } catch (err) {
          console.error(err);
        }
      }
      
      const local = JSON.parse(localStorage.getItem('local_karyawan')) || [];
      const updatedLocal = local.filter(emp => emp.id !== id);
      localStorage.setItem('local_karyawan', JSON.stringify(updatedLocal));
      
      fetchEmployees();
    }
    setActiveMenuId(null);
  };

  const handleUpdateStatus = async (id, name, newStatus) => {
    const isLocalOnly = id.toString().startsWith('KRY-') || id.toString().startsWith('kry-');
    if (!isLocalOnly) {
      try {
        await supabase
          .from('karyawan')
          .update({ status: newStatus })
          .eq('id', id);
      } catch (err) {
        console.error("Gagal update status di Supabase:", err);
      }
    }
    
    const local = JSON.parse(localStorage.getItem('local_karyawan')) || [];
    const index = local.findIndex(emp => emp.id === id || emp.name?.toLowerCase() === name?.toLowerCase());
    if (index !== -1) {
      local[index].status = newStatus;
      localStorage.setItem('local_karyawan', JSON.stringify(local));
    } else {
      const targetEmp = employees.find(e => e.id === id);
      if (targetEmp) {
        local.push({
          ...targetEmp,
          status: newStatus
        });
        localStorage.setItem('local_karyawan', JSON.stringify(local));
      }
    }

    fetchEmployees();
    setActiveMenuId(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      alert('Simulasi: File ' + e.target.files[0].name + ' berhasil diimpor!');
      // Reset input so the same file can be selected again
      e.target.value = '';
    }
  };



  const toggleMenu = (id) => {
    if (activeMenuId === id) setActiveMenuId(null);
    else setActiveMenuId(id);
  };

  // Tutup menu jika klik di luar
  useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const filteredData = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        emp.div.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDivisi = filterDivisi === 'Semua Divisi' || emp.div === filterDivisi;
    const matchStatus = filterStatus === 'Semua' || emp.status === filterStatus;
    const matchKerja = filterKerja === 'Semua' || emp.type === filterKerja;
    return matchSearch && matchDivisi && matchStatus && matchKerja;
  });

  const totalEmps = employees.length;
  const activeEmps = employees.filter(e => e.status === 'Aktif').length;
  const cutiEmps = employees.filter(e => e.status === 'Cuti' || e.status === 'Izin').length;
  const nonActiveEmps = employees.filter(e => e.status === 'Non-Aktif').length;
  
  const divSet = new Set(employees.map(e => e.div));

  return (
    <div className="tk-page">
      
      {/* HEADER */}
      <div className="tk-header">
        <div className="tkh-left">
          <h1>Tim & Karyawan</h1>
          <p>Kelola data tim dan informasi karyawan perusahaan.</p>
        </div>
        <div className="tkh-right">
          <div style={{ position: 'relative' }}>
            <div className="tk-notif" style={{ cursor: 'pointer' }} onClick={() => setShowNotif(!showNotif)}>
              <Bell size={20} color="#64748B" />
            </div>
            {showNotif && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowNotif(false)} />
                <div style={{ position: 'absolute', right: 0, top: '48px', width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 1000, overflow: 'hidden' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>Notifikasi Tim</h3>
                    <span onClick={() => setShowNotif(false)} style={{ fontSize: '12px', color: '#3B82F6', cursor: 'pointer', fontWeight: 500 }}>Tutup</span>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                      Belum ada notifikasi baru.
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5 TOP CARDS */}
      <div className="tk-top-cards">
        
        <div className="tk-tcard">
          <div className="tkt-icon-box blue">
            <Users size={24} />
          </div>
          <div className="tkt-info">
            <h2>{totalEmps}</h2>
            <p>Total Karyawan</p>
          </div>
        </div>

        <div className="tk-tcard">
          <div className="tkt-icon-box green">
            <UserCheck size={24} />
          </div>
          <div className="tkt-info">
            <h2>{activeEmps}</h2>
            <p>Karyawan Aktif</p>
          </div>
        </div>

        <div className="tk-tcard">
          <div className="tkt-icon-box orange">
            <Clock size={24} />
          </div>
          <div className="tkt-info">
            <h2>{cutiEmps}</h2>
            <p>Cuti / Izin</p>
          </div>
        </div>

        <div className="tk-tcard">
          <div className="tkt-icon-box purple">
            <UserMinus size={24} />
          </div>
          <div className="tkt-info">
            <h2>{nonActiveEmps}</h2>
            <p>Non-Aktif</p>
          </div>
        </div>

        <div className="tk-tcard">
          <div className="tkt-icon-box cyan">
            <Network size={24} />
          </div>
          <div className="tkt-info">
            <h2>{divSet.size}</h2>
            <p>Total Divisi</p>
          </div>
        </div>

      </div>

      {/* FILTER ROW */}
      <div className="tk-filter-row">
        <div className="search-wrapper">
          <Search size={18} color="#94A3B8" />
          <input 
            type="text" 
            placeholder="Cari nama karyawan, jabatan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-dropdown select-wrap" style={{position: 'relative'}}>
          <select value={filterDivisi} onChange={e => setFilterDivisi(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', color: '#0F172A', fontWeight: 500, padding: '12px 24px 12px 0', width: '100%', height: '100%', appearance: 'none', WebkitAppearance: 'none'}}>
            <option value="Semua Divisi">Semua Divisi</option>
            {[...divSet].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown size={16} style={{position: 'absolute', right: '12px', pointerEvents: 'none'}} />
        </div>
        <div className="filter-dropdown select-wrap" style={{position: 'relative'}}>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', color: '#0F172A', fontWeight: 500, padding: '12px 24px 12px 0', width: '100%', height: '100%', appearance: 'none', WebkitAppearance: 'none'}}>
            <option value="Semua">Status: Semua</option>
            <option value="Aktif">Aktif</option>
            <option value="Cuti">Cuti / Izin</option>
            <option value="Non-Aktif">Non-Aktif</option>
          </select>
          <ChevronDown size={16} style={{position: 'absolute', right: '12px', pointerEvents: 'none'}} />
        </div>
        <div className="filter-dropdown select-wrap" style={{position: 'relative'}}>
          <select value={filterKerja} onChange={e => setFilterKerja(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', color: '#0F172A', fontWeight: 500, padding: '12px 24px 12px 0', width: '100%', height: '100%', appearance: 'none', WebkitAppearance: 'none'}}>
            <option value="Semua">Tipe Kerja: Semua</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
          </select>
          <ChevronDown size={16} style={{position: 'absolute', right: '12px', pointerEvents: 'none'}} />
        </div>
      </div>

      {/* TABLE FOR DESKTOP */}
      <div className="tk-table-container hide-on-mobile">
        <table className="tk-table">
          <thead>
            <tr>
              <th>Karyawan</th>
              <th>Jabatan</th>
              <th>Divisi</th>
              <th>Status Kerja</th>
              <th>Status</th>
              <th>Bergabung</th>
              <th>Kontak</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 && (
              <tr><td colSpan="8" style={{textAlign:'center', padding: '32px', color: '#64748B'}}>Tidak ada data karyawan ditemukan.</td></tr>
            )}
            {filteredData.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="td-user-info">
                    <img src={`https://ui-avatars.com/api/?name=${row.name.replace(/ /g, '+')}&background=random`} alt={row.name} />
                    <div className="user-names">
                      <strong>{row.name}</strong>
                      <span>ID: {row.id}</span>
                    </div>
                  </div>
                </td>
                <td className="td-text">{row.role}</td>
                <td className="td-text">{row.div}</td>
                <td>
                  <span className={`badge-kerja ${row.type === 'Full Time' ? 'full' : 'part'}`}>
                    {row.type}
                  </span>
                </td>
                <td>
                  <div className="status-label">
                    <span className={`status-dot ${row.status === 'Aktif' ? 'green' : row.status === 'Cuti' ? 'orange' : 'red'}`}></span>
                    <span className={`status-text ${row.status === 'Aktif' ? 'green' : row.status === 'Cuti' ? 'orange' : 'red'}`}>
                      {row.status}
                    </span>
                  </div>
                </td>
                <td className="td-text">{row.join}</td>
                <td>
                  <div className="contact-info">
                    <span className="c-email">{row.email}</span>
                    <span className="c-phone">{row.phone}</span>
                  </div>
                </td>
                <td style={{position: 'relative'}}>
                  <button className="btn-action" onClick={(e) => { e.stopPropagation(); toggleMenu(row.id); }}>
                    <MoreVertical size={18} />
                  </button>
                  {activeMenuId === row.id && (
                    <div className="action-dropdown" onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: '40px', top: '10px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '8px', minWidth: '160px' }}>
                      <button className="ad-btn" onClick={() => alert(`Detail Karyawan:\n===================\nNama: ${row.name}\nJabatan: ${row.role}\nDivisi: ${row.div}\nStatus Kerja: ${row.type}\nStatus Kehadiran: ${row.status}\nEmail: ${row.email}\nTelepon: ${row.phone}\nTanggal Gabung: ${row.join}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#0F172A', fontSize: '13px', width: '100%' }}>
                        <Info size={14} /> Lihat Info
                      </button>
                      
                      {row.status !== 'Aktif' && (
                        <button className="ad-btn" onClick={() => handleUpdateStatus(row.id, row.name, 'Aktif')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#10B981', fontSize: '13px', width: '100%' }}>
                          <UserCheck size={14} /> Set Aktif
                        </button>
                      )}

                      {row.status !== 'Cuti' && (
                        <button className="ad-btn" onClick={() => handleUpdateStatus(row.id, row.name, 'Cuti')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#F59E0B', fontSize: '13px', width: '100%' }}>
                          <Clock size={14} /> Set Cuti
                        </button>
                      )}

                      {row.status !== 'Non-Aktif' && (
                        <button className="ad-btn" onClick={() => handleUpdateStatus(row.id, row.name, 'Non-Aktif')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#64748B', fontSize: '13px', width: '100%' }}>
                          <UserMinus size={14} /> Set Non-Aktif
                        </button>
                      )}

                      <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }}></div>

                      <button className="ad-btn delete" onClick={() => handleDelete(row.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#EF4444', fontSize: '13px', width: '100%' }}>
                        <Trash2 size={14} /> Hapus Data
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* FOOTER DESKTOP */}
        <div className="tk-footer">
          <div className="footer-left">
            Menampilkan {filteredData.length} data karyawan
          </div>
          <div className="pagination">
            <button className="pg-arrow">‹</button>
            <button className="pg-num active">1</button>
            <button className="pg-arrow">›</button>
          </div>
        </div>
      </div>

      {/* CARD LIST FOR MOBILE */}
      <div className="tk-card-list show-on-mobile">
        {filteredData.length === 0 ? (
          <div style={{textAlign:'center', padding: '32px', color: '#64748B'}}>Tidak ada data karyawan ditemukan.</div>
        ) : (
          filteredData.map((row) => (
            <div key={row.id} className="tk-mob-card">
              <div className="tkmc-header">
                <div className="tkmc-user">
                  <img src={`https://ui-avatars.com/api/?name=${row.name.replace(/ /g, '+')}&background=random`} alt={row.name} className="tkmc-avatar" />
                  <div className="tkmc-names">
                    <strong>{row.name}</strong>
                    <span>{row.role} • {row.div}</span>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <button className="btn-action" onClick={(e) => { e.stopPropagation(); toggleMenu(row.id); }}>
                    <MoreVertical size={18} />
                  </button>
                  {activeMenuId === row.id && (
                    <div className="action-dropdown" onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: '0', top: '30px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '8px', minWidth: '160px' }}>
                      <button className="ad-btn" onClick={() => alert(`Detail Karyawan:\n===================\nNama: ${row.name}\nJabatan: ${row.role}\nDivisi: ${row.div}\nStatus Kerja: ${row.type}\nStatus Kehadiran: ${row.status}\nEmail: ${row.email}\nTelepon: ${row.phone}\nTanggal Gabung: ${row.join}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#0F172A', fontSize: '13px', width: '100%' }}>
                        <Info size={14} /> Lihat Info
                      </button>

                      {row.status !== 'Aktif' && (
                        <button className="ad-btn" onClick={() => handleUpdateStatus(row.id, row.name, 'Aktif')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#10B981', fontSize: '13px', width: '100%' }}>
                          <UserCheck size={14} /> Set Aktif
                        </button>
                      )}

                      {row.status !== 'Cuti' && (
                        <button className="ad-btn" onClick={() => handleUpdateStatus(row.id, row.name, 'Cuti')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#F59E0B', fontSize: '13px', width: '100%' }}>
                          <Clock size={14} /> Set Cuti
                        </button>
                      )}

                      {row.status !== 'Non-Aktif' && (
                        <button className="ad-btn" onClick={() => handleUpdateStatus(row.id, row.name, 'Non-Aktif')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#64748B', fontSize: '13px', width: '100%' }}>
                          <UserMinus size={14} /> Set Non-Aktif
                        </button>
                      )}

                      <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }}></div>

                      <button className="ad-btn delete" onClick={() => handleDelete(row.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#EF4444', fontSize: '13px', width: '100%' }}>
                        <Trash2 size={14} /> Hapus Data
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="tkmc-body">
                <div className="tkmc-row">
                  <span className={`badge-kerja ${row.type === 'Full Time' ? 'full' : 'part'}`}>{row.type}</span>
                  <div className="status-label">
                    <span className={`status-dot ${row.status === 'Aktif' ? 'green' : row.status === 'Cuti' ? 'orange' : 'red'}`}></span>
                    <span className={`status-text ${row.status === 'Aktif' ? 'green' : row.status === 'Cuti' ? 'orange' : 'red'}`}>{row.status}</span>
                  </div>
                </div>
                <div className="tkmc-info-row">
                  <span>Email:</span> <strong>{row.email}</strong>
                </div>
                <div className="tkmc-info-row">
                  <span>Telepon:</span> <strong>{row.phone}</strong>
                </div>
                <div className="tkmc-info-row">
                  <span>Bergabung:</span> <strong>{row.join}</strong>
                </div>
              </div>
            </div>
          ))
        )}

        {/* FOOTER MOBILE */}
        <div className="tk-footer" style={{ border: 'none', background: 'transparent', padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="footer-left" style={{ fontSize: '12px', color: '#64748B' }}>
            Menampilkan {filteredData.length} data karyawan
          </div>
          <div className="pagination">
            <button className="pg-arrow">‹</button>
            <button className="pg-num active">1</button>
            <button className="pg-arrow">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
