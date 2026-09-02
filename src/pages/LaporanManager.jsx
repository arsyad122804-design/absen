import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Calendar, Filter, FileSpreadsheet, 
  BarChart2, FileIcon, Search, CheckCircle2 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import './LaporanManager.css';

export default function LaporanManager() {
  const [chartData, setChartData] = useState([]);
  const [reportType, setReportType] = useState('Bulanan');
  const [isExporting, setIsExporting] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data, error } = await supabase.from('absensi').select('*');
        if (!error && data) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const counts = months.map(m => ({ name: m, hadir: 0, telat: 0, cuti: 0 }));

          data.forEach(r => {
            const dateObj = r.tanggal ? new Date(r.tanggal) : null;
            if (dateObj) {
              const monthIdx = dateObj.getMonth();
              if (r.status === 'Hadir') {
                counts[monthIdx].hadir++;
              } else if (r.status === 'Terlambat') {
                counts[monthIdx].telat++;
              } else if (['Izin', 'Sakit', 'Cuti'].includes(r.status)) {
                counts[monthIdx].cuti++;
              }
            }
          });

          const currentMonth = new Date().getMonth();
          const filtered = counts.slice(0, currentMonth + 1);
          setChartData(filtered);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAnalytics();
  }, []);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzoffset).toISOString().split('T')[0];
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[new Date().getMonth()];
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const getPeriodLabel = () => {
    if (reportType === 'Harian') {
      const d = new Date(selectedDate);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (reportType === 'Mingguan') {
      const d = new Date(selectedDate);
      // Dapatkan awal minggu
      const firstDay = new Date(d.setDate(d.getDate() - d.getDay() + 1));
      const lastDay = new Date(d.setDate(d.getDate() - d.getDay() + 7));
      return `Minggu (${firstDay.getDate()} ${firstDay.toLocaleDateString('id-ID', { month: 'short' })} - ${lastDay.getDate()} ${lastDay.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })})`;
    }
    if (reportType === 'Bulanan') {
      return `${selectedMonth} ${selectedYear}`;
    }
    return `Tahun ${selectedYear}`;
  };

  const [filterDivisi, setFilterDivisi] = useState('Semua Divisi');

  const handleExport = async (type, overrideItem = null) => {
    setIsExporting(true);
    try {
      const activeReportType = overrideItem?.reportType || reportType;
      const activeSelectedDate = overrideItem?.selectedDate || selectedDate;
      const activeSelectedMonth = overrideItem?.selectedMonth || selectedMonth;
      const activeSelectedYear = overrideItem?.selectedYear || selectedYear;
      const activeFilterDivisi = overrideItem?.filterDivisi || filterDivisi;
      const activePeriodStr = overrideItem?.periodStr || getPeriodLabel();

      const { data: emps } = await supabase.from('karyawan').select('*');
      const { data: absData } = await supabase.from('absensi').select('*');

      const allEmps = emps || [];
      const allAbs = absData || [];

      let filteredEmps = allEmps;
      if (activeFilterDivisi && activeFilterDivisi !== 'Semua Divisi') {
        filteredEmps = allEmps.filter(e => (e.divisi || e.div || '').toLowerCase().includes(activeFilterDivisi.toLowerCase()));
      }

      let filteredAbs = allAbs;
      if (activeReportType === 'Harian') {
        filteredAbs = allAbs.filter(a => a.tanggal === activeSelectedDate);
      } else if (activeReportType === 'Bulanan') {
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const mIdx = monthNames.indexOf(activeSelectedMonth);
        filteredAbs = allAbs.filter(a => {
          if (!a.tanggal) return false;
          const d = new Date(a.tanggal);
          return d.getMonth() === mIdx && d.getFullYear() === Number(activeSelectedYear);
        });
      } else if (activeReportType === 'Tahunan') {
        filteredAbs = allAbs.filter(a => {
          if (!a.tanggal) return false;
          return new Date(a.tanggal).getFullYear() === Number(activeSelectedYear);
        });
      }

      const formatFullDateId = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const formatted = d.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
      };

      const getSessionLabel = (empDiv, timeStr) => {
        const isKep = (empDiv || '').toLowerCase().includes('pesantren') || 
                      (empDiv || '').toLowerCase().includes('santri') || 
                      (empDiv || '').toLowerCase().includes('asrama');
        if (!isKep) return 'Reguler';
        const hour = parseInt((timeStr || '00').split(':')[0], 10);
        if (hour < 12) return 'Sesi 1 (Pagi)';
        return 'Sesi 2 (Sore)';
      };

      const reportName = `Laporan_Kehadiran_${activeReportType}_${activePeriodStr.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Group absensi by date (sorted descending)
      const absByDate = {};
      filteredAbs.forEach(a => {
        const d = a.tanggal || 'Tanpa Tanggal';
        if (!absByDate[d]) absByDate[d] = [];
        absByDate[d].push(a);
      });

      const sortedDates = Object.keys(absByDate).sort((a, b) => b.localeCompare(a));

      if (type === 'Excel') {
        let csvContent = "\uFEFF";
        csvContent += `LAPORAN REKAPITULASI KEHADIRAN KARYAWAN - HIBATULLAH IIBS\n`;
        csvContent += `Periode:;${activePeriodStr}\n`;
        csvContent += `Divisi:;${activeFilterDivisi}\n`;
        csvContent += `Tanggal Cetak:;${new Date().toLocaleDateString('id-ID')}\n\n`;

        if (sortedDates.length === 0) {
          csvContent += `No;Nama Karyawan;Divisi;Sesi / Shift;Tanggal;Waktu Masuk;Waktu Pulang;Status Kehadiran;Lokasi Presisi\n`;
          filteredEmps.forEach((emp, idx) => {
            const sess = getSessionLabel(emp.divisi, '07:00');
            csvContent += `${idx + 1};"${emp.name}";"${emp.divisi || 'Operasional'}";"${sess}";"${activeSelectedDate}";"-";"-";"Tidak Hadir";"-"\n`;
          });
        } else {
          sortedDates.forEach(dateKey => {
            const fullDateText = formatFullDateId(dateKey);
            csvContent += `\n;;;=== ${fullDateText.toUpperCase()} ===;;;;\n`;
            csvContent += `No;Nama Karyawan;Divisi;Sesi / Shift;Tanggal;Waktu Masuk;Waktu Pulang;Status Kehadiran;Lokasi Presisi\n`;

            let dayCount = 0;
            absByDate[dateKey].forEach(a => {
              const emp = filteredEmps.find(e => String(e.id) === String(a.karyawan_id));
              const empName = emp ? emp.name : (a.nama || a.karyawan_id || 'Karyawan');
              const empDiv = emp ? (emp.divisi || emp.div || 'Operasional') : 'Operasional';

              if (activeFilterDivisi !== 'Semua Divisi' && !empDiv.toLowerCase().includes(activeFilterDivisi.toLowerCase())) return;

              dayCount++;
              const sess = getSessionLabel(empDiv, a.waktu_masuk);
              csvContent += `${dayCount};"${empName}";"${empDiv}";"${sess}";"${a.tanggal || '-'}"`;
              csvContent += `;"${a.waktu_masuk || '-'}"`;
              csvContent += `;"${a.waktu_keluar || '-'}"`;
              csvContent += `;"${a.status || '-'}"`;
              csvContent += `;"${a.lokasi || '-'}"\n`;
            });
          });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${reportName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          let fullHtmlBody = '';

          if (sortedDates.length === 0) {
            let emptyRows = '';
            filteredEmps.forEach((emp, idx) => {
              const sess = getSessionLabel(emp.divisi, '07:00');
              emptyRows += `
                <tr>
                  <td style="padding:8px;border:1px solid #ddd;text-align:center">${idx + 1}</td>
                  <td style="padding:8px;border:1px solid #ddd;font-weight:bold">${emp.name}</td>
                  <td style="padding:8px;border:1px solid #ddd">${emp.divisi || 'Operasional'}</td>
                  <td style="padding:8px;border:1px solid #ddd;font-size:11px;color:#475569">${sess}</td>
                  <td style="padding:8px;border:1px solid #ddd">${activeSelectedDate}</td>
                  <td style="padding:8px;border:1px solid #ddd">-</td>
                  <td style="padding:8px;border:1px solid #ddd">-</td>
                  <td style="padding:8px;border:1px solid #ddd;color:#dc2626;font-weight:bold">Tidak Hadir</td>
                </tr>
              `;
            });
            fullHtmlBody += `
              <div style="background:#f1f5f9;padding:10px 14px;border-radius:8px;font-weight:bold;color:#0f172a;margin-top:20px;margin-bottom:8px;border-left:4px solid #2563eb;">
                📅 ${formatFullDateId(activeSelectedDate)}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Karyawan</th>
                    <th>Divisi</th>
                    <th>Sesi / Shift</th>
                    <th>Tanggal</th>
                    <th>Jam Masuk</th>
                    <th>Jam Pulang</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>${emptyRows}</tbody>
              </table>
            `;
          } else {
            sortedDates.forEach(dateKey => {
              let dayRowsHtml = '';
              let dayCount = 0;

              absByDate[dateKey].forEach(a => {
                const emp = filteredEmps.find(e => String(e.id) === String(a.karyawan_id));
                const empName = emp ? emp.name : (a.nama || 'Karyawan');
                const empDiv = emp ? (emp.divisi || 'Operasional') : 'Operasional';

                if (activeFilterDivisi !== 'Semua Divisi' && !empDiv.toLowerCase().includes(activeFilterDivisi.toLowerCase())) return;

                dayCount++;
                const sess = getSessionLabel(empDiv, a.waktu_masuk);
                dayRowsHtml += `
                  <tr>
                    <td style="padding:8px;border:1px solid #ddd;text-align:center">${dayCount}</td>
                    <td style="padding:8px;border:1px solid #ddd;font-weight:bold">${empName}</td>
                    <td style="padding:8px;border:1px solid #ddd">${empDiv}</td>
                    <td style="padding:8px;border:1px solid #ddd;font-size:12px;color:#2563eb;font-weight:600">${sess}</td>
                    <td style="padding:8px;border:1px solid #ddd">${a.tanggal}</td>
                    <td style="padding:8px;border:1px solid #ddd">${a.waktu_masuk || '-'}</td>
                    <td style="padding:8px;border:1px solid #ddd">${a.waktu_keluar || '-'}</td>
                    <td style="padding:8px;border:1px solid #ddd;color:${a.status==='Terlambat'?'#d97706':'#16a34a'};font-weight:bold">${a.status}</td>
                  </tr>
                `;
              });

              if (dayCount > 0) {
                fullHtmlBody += `
                  <div style="background:#EFF6FF;padding:12px 16px;border-radius:10px;font-weight:bold;color:#1E40AF;margin-top:24px;margin-bottom:10px;border-left:5px solid #2563EB;font-size:14px;display:flex;align-items:center;gap:8px;">
                    📅 ${formatFullDateId(dateKey)}
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Karyawan</th>
                        <th>Divisi</th>
                        <th>Sesi / Shift</th>
                        <th>Tanggal</th>
                        <th>Jam Masuk</th>
                        <th>Jam Pulang</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${dayRowsHtml}
                    </tbody>
                  </table>
                `;
              }
            });
          }

          printWindow.document.write(`
            <html>
              <head>
                <title>Laporan Kehadiran - ${activePeriodStr}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.5; }
                  h1 { color: #0f172a; margin-bottom: 4px; font-size: 22px; font-weight: 800; }
                  p { color: #64748b; font-size: 13px; margin-top: 0; }
                  table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 13px; }
                  th { background: #F8FAFC; padding: 10px 8px; border: 1px solid #CBD5E1; text-align: left; font-size: 12px; color: #334155; text-transform: uppercase; }
                  .header-box { border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
                </style>
              </head>
              <body>
                <div class="header-box">
                  <h1>LAPORAN REKAPITULASI KEHADIRAN KARYAWAN</h1>
                  <p>Hibatullah International Islamic Boarding School • Periode: ${activePeriodStr} • Divisi: ${activeFilterDivisi}</p>
                </div>
                ${fullHtmlBody}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        }
      }

      if (!overrideItem) {
        const newReport = {
          id: Date.now(),
          name: `Laporan ${reportType} - ${activePeriodStr}`,
          date: new Date().toLocaleDateString('id-ID'),
          type,
          reportType,
          selectedDate,
          selectedMonth,
          selectedYear,
          filterDivisi,
          periodStr: activePeriodStr
        };
        setHistoryList([newReport, ...historyList]);
      }
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadHistory = (item) => {
    handleExport(item.type || 'Excel', item);
  };

  return (
    <div className="mgr-page-content">
      <div className="lm-header">
        <h1>Laporan & Analitik</h1>
        <p>Buat, pantau, dan unduh laporan absensi perusahaan secara instan.</p>
      </div>

      <div className="lm-grid">
        {/* LEFT COLUMN */}
        <div className="lm-left-col">
          
          {/* ANALYTICS CARD */}
          <div className="lm-card">
            <div className="lm-card-header">
              <h3>Tren Kehadiran 2026</h3>
              <div className="lm-legend">
                <span className="lm-legend-item"><span className="lm-dot green"></span> Hadir</span>
                <span className="lm-legend-item"><span className="lm-dot orange"></span> Terlambat</span>
              </div>
            </div>
            <div className="lm-chart-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {chartData.length === 0 ? (
                <div style={{ color: '#64748B', fontSize: '14px', textAlign: 'center' }}>
                  Belum ada data analitik tren kehadiran di database.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="hadir" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} barSize={30} />
                    <Bar dataKey="telat" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="cuti" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* GENERATE REPORT CARD */}
          <div className="lm-card">
            <div className="lm-card-header">
              <h3>Buat Laporan Baru</h3>
            </div>
            <div className="lm-form-grid">
              <div className="lm-field-group">
                <label>Tipe Laporan</label>
                <select className="lm-select" value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option>Harian</option>
                  <option>Mingguan</option>
                  <option>Bulanan</option>
                  <option>Tahunan</option>
                </select>
              </div>
              <div className="lm-field-group">
                <label>Pilih Periode</label>
                <div className="lm-input-wrapper">
                  <Calendar size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  {reportType === 'Harian' && (
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={e => setSelectedDate(e.target.value)} 
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#334155' }}
                    />
                  )}
                  {reportType === 'Mingguan' && (
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={e => setSelectedDate(e.target.value)} 
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#334155' }}
                    />
                  )}
                  {reportType === 'Bulanan' && (
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <select 
                        value={selectedMonth} 
                        onChange={e => setSelectedMonth(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: '#334155', cursor: 'pointer', flex: 1, padding: '10px 0' }}
                      >
                        <option value="Januari">Januari</option>
                        <option value="Februari">Februari</option>
                        <option value="Maret">Maret</option>
                        <option value="April">April</option>
                        <option value="Mei">Mei</option>
                        <option value="Juni">Juni</option>
                        <option value="Juli">Juli</option>
                        <option value="Agustus">Agustus</option>
                        <option value="September">September</option>
                        <option value="Oktober">Oktober</option>
                        <option value="November">November</option>
                        <option value="Desember">Desember</option>
                      </select>
                      <select 
                        value={selectedYear} 
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: '#334155', cursor: 'pointer', width: '80px', padding: '10px 0' }}
                      >
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>
                      </select>
                    </div>
                  )}
                  {reportType === 'Tahunan' && (
                    <select 
                      value={selectedYear} 
                      onChange={e => setSelectedYear(Number(e.target.value))}
                      style={{ border: 'none', background: 'transparent', outline: 'none', color: '#334155', cursor: 'pointer', width: '100%', padding: '10px 0' }}
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="lm-field-group">
                <label>Filter Divisi</label>
                <div className="lm-input-wrapper">
                  <Filter size={16} color="#94A3B8" />
                  <select value={filterDivisi} onChange={e => setFilterDivisi(e.target.value)}>
                    <option>Semua Divisi</option>
                    <option>Operasional</option>
                    <option>Sekolah</option>
                    <option>Kepesantrenan</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="lm-btn-row">
              <button onClick={() => handleExport('PDF')} disabled={isExporting} className="lm-btn pdf">
                {isExporting ? <span className="spinner"></span> : <FileIcon size={18} />}
                Ekspor ke PDF
              </button>
              <button onClick={() => handleExport('Excel')} disabled={isExporting} className="lm-btn excel">
                {isExporting ? <span className="spinner"></span> : <FileSpreadsheet size={18} />}
                Ekspor ke Excel
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div>
          <div className="lm-card">
            <div className="lm-card-header">
              <h3>Riwayat Laporan</h3>
            </div>
            
            <div className="lm-history-list">
              {historyList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748B', fontSize: '13px' }}>
                  Belum ada riwayat laporan yang diekspor.
                </div>
              ) : (
                historyList.map((item) => (
                  <div key={item.id} className="lm-history-item">
                    <div className="lm-hi-icon">
                      <FileText size={20} />
                    </div>
                    <div className="lm-hi-text">
                      <h4>{item.name}</h4>
                      <p>Ekspor {item.type} • {item.date}</p>
                    </div>
                    <button onClick={() => handleDownloadHistory(item)} className="lm-hi-btn">
                      <Download size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <button className="lm-btn-outline">
              Lihat Semua Riwayat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
