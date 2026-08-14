import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Plus, Bell, Users, UserCheck, Clock, UserMinus, Network, 
  Search, ChevronDown, Filter, MoreVertical, X, Info, Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './TimKaryawan.css';

const initialTableData = [
  { id: 'KRY-0001', name: 'Dewi Hartati', role: 'Manager Operasional', div: 'Operasional', type: 'Full Time', status: 'Aktif', join: '12 Jan 2024', email: 'dewi@inovasidigital.id', phone: '0812-3456-7890' },
  { id: 'KRY-0002', name: 'Rizky Maulana', role: 'Staff Marketing', div: 'Marketing', type: 'Full Time', status: 'Aktif', join: '18 Feb 2024', email: 'rizky@inovasidigital.id', phone: '0813-2345-6789' },
  { id: 'KRY-0003', name: 'Siti Nurhaliza', role: 'UI/UX Designer', div: 'IT Development', type: 'Full Time', status: 'Aktif', join: '05 Mar 2024', email: 'siti@inovasidigital.id', phone: '0821-2345-9876' },
  { id: 'KRY-0004', name: 'Budi Santoso', role: 'Staff Finance', div: 'Finance', type: 'Full Time', status: 'Aktif', join: '21 Mar 2024', email: 'budi@inovasidigital.id', phone: '0812-8765-4321' },
  { id: 'KRY-0005', name: 'Ahmad Fauzi', role: 'HR Officer', div: 'HR & GA', type: 'Full Time', status: 'Cuti', join: '02 Apr 2024', email: 'fauzi@inovasidigital.id', phone: '0822-3344-5566' },
  { id: 'KRY-0006', name: 'Lina Agustina', role: 'Staff Accounting', div: 'Finance', type: 'Full Time', status: 'Aktif', join: '11 Apr 2024', email: 'lina@inovasidigital.id', phone: '0821-4455-6677' },
  { id: 'KRY-0007', name: 'Yoga Pratama', role: 'IT Support', div: 'IT Development', type: 'Full Time', status: 'Non-Aktif', join: '15 Des 2023', email: 'yoga@inovasidigital.id', phone: '0813-9988-7766' },
  { id: 'KRY-0008', name: 'Dinda Aulia', role: 'Staff Marketing', div: 'Marketing', type: 'Part Time', status: 'Aktif', join: '28 Apr 2024', email: 'dinda@inovasidigital.id', phone: '0821-6677-8899' },
];

export default function TimKaryawan() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('Semua Divisi');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterKerja, setFilterKerja] = useState('Semua');

  const [activeMenuId, setActiveMenuId] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('karyawan')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
      } else {
        // Map data dari Supabase ke format yang dibutuhkan UI jika perlu
        const mappedData = (data || []).map(emp => ({
          id: emp.id,
          name: emp.name,
          role: emp.role || 'Karyawan',
          div: emp.divisi || '-',
          type: 'Full Time',
          status: emp.status || 'Aktif',
          join: new Date(emp.created_at).toLocaleDateString('id-ID'),
          email: emp.email,
          phone: emp.phone || '-'
        }));
        setEmployees(mappedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Hapus karyawan ini?')) {
      const { error } = await supabase.from('karyawan').delete().eq('id', id);
      if (!error) {
        fetchEmployees();
      }
    }
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
          <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".pdf,.xlsx,.csv" onChange={handleFileChange} />
          <button className="btn-outline-blue" onClick={handleResetData}>
            <Upload size={16} /> Impor Data
          </button>
          <div className="tk-notif">
            <Bell size={20} color="#64748B" />
            <span className="notif-badge">3</span>
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
          <div className="tkt-trend up">↑ 8 dari bulan lalu</div>
        </div>

        <div className="tk-tcard">
          <div className="tkt-icon-box green">
            <UserCheck size={24} />
          </div>
          <div className="tkt-info">
            <h2>{activeEmps}</h2>
            <p>Karyawan Aktif</p>
          </div>
          <div className="tkt-trend up">↑ 6 dari bulan lalu</div>
        </div>

        <div className="tk-tcard">
          <div className="tkt-icon-box orange">
            <Clock size={24} />
          </div>
          <div className="tkt-info">
            <h2>{cutiEmps}</h2>
            <p>Cuti / Izin</p>
          </div>
          <div className="tkt-trend down">↓ 2 dari bulan lalu</div>
        </div>

        <div className="tk-tcard">
          <div className="tkt-icon-box purple">
            <UserMinus size={24} />
          </div>
          <div className="tkt-info">
            <h2>{nonActiveEmps}</h2>
            <p>Non-Aktif</p>
          </div>
          <div className="tkt-trend down">↓ 1 dari bulan lalu</div>
        </div>

        <div className="tk-tcard">
          <div className="tkt-icon-box cyan">
            <Network size={24} />
          </div>
          <div className="tkt-info">
            <h2>{divSet.size}</h2>
            <p>Total Divisi</p>
          </div>
          <div className="tkt-trend neutral">Tetap</div>
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
        
        <div className="filter-dropdown select-wrap">
          <select value={filterDivisi} onChange={e => setFilterDivisi(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', color: '#0F172A', fontWeight: 500, paddingRight: '20px', appearance: 'none', WebkitAppearance: 'none'}}>
            <option value="Semua Divisi">Semua Divisi</option>
            {[...divSet].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown size={16} style={{position: 'absolute', right: '12px', pointerEvents: 'none'}} />
        </div>
        <div className="filter-dropdown select-wrap" style={{position: 'relative'}}>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', color: '#0F172A', fontWeight: 500, paddingRight: '20px', appearance: 'none', WebkitAppearance: 'none'}}>
            <option value="Semua">Status: Semua</option>
            <option value="Aktif">Aktif</option>
            <option value="Cuti">Cuti / Izin</option>
            <option value="Non-Aktif">Non-Aktif</option>
          </select>
          <ChevronDown size={16} style={{position: 'absolute', right: '12px', pointerEvents: 'none'}} />
        </div>
        <div className="filter-dropdown select-wrap" style={{position: 'relative'}}>
          <select value={filterKerja} onChange={e => setFilterKerja(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', color: '#0F172A', fontWeight: 500, paddingRight: '20px', appearance: 'none', WebkitAppearance: 'none'}}>
            <option value="Semua">Tipe Kerja: Semua</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
          </select>
          <ChevronDown size={16} style={{position: 'absolute', right: '12px', pointerEvents: 'none'}} />
        </div>
      </div>

      {/* TABLE */}
      <div className="tk-table-container">
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
                    <div className="action-dropdown" onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: '40px', top: '10px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '8px', minWidth: '150px' }}>
                      <button className="ad-btn" onClick={() => alert('Detail Karyawan: ' + row.name)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#0F172A' }}>
                        <Info size={14} /> Lihat Info
                      </button>
                      <button className="ad-btn delete" onClick={() => handleDelete(row.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', color: '#EF4444' }}>
                        <Trash2 size={14} /> Hapus Data
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FOOTER */}
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

    </div>
  );
}
