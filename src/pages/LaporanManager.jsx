import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Calendar, Filter, FileSpreadsheet, 
  BarChart2, FileIcon, Search, CheckCircle2, Check
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import './LaporanManager.css';

const safeJsonParse = (key, fallback = []) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
};

export default function LaporanManager() {
  const [chartData, setChartData] = useState([]);
  const [reportType, setReportType] = useState('Bulanan');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [historyList, setHistoryList] = useState(() => {
    return safeJsonParse('laporan_history', []);
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const localAbs = safeJsonParse('local_absensi', []);
        let dbAbs = [];
        try {
          const { data, error } = await supabase.from('absensi').select('*');
          if (!error && data) {
            dbAbs = data;
          }
        } catch (e) {
          console.error("Fetch DB error:", e);
        }

        const combined = [...dbAbs];
        localAbs.forEach(loc => {
          const exists = dbAbs.some(d => String(d.karyawan_id) === String(loc.karyawan_id) && d.tanggal === loc.tanggal);
          if (!exists) combined.push(loc);
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const counts = months.map(m => ({ name: m, hadir: 0, telat: 0, cuti: 0 }));

        combined.forEach(r => {
          const dateObj = r.tanggal ? new Date(r.tanggal) : null;
          if (dateObj) {
            const monthIdx = dateObj.getMonth();
            if (monthIdx >= 0 && monthIdx < 12) {
              if (r.status === 'Hadir') {
                counts[monthIdx].hadir++;
              } else if (r.status === 'Terlambat') {
                counts[monthIdx].telat++;
              } else if (['Izin', 'Sakit', 'Cuti'].includes(r.status)) {
                counts[monthIdx].cuti++;
              }
            }
          }
        });

        const currentMonth = new Date().getMonth();
        const filtered = counts.slice(0, currentMonth + 1);
        setChartData(filtered);
      } catch (e) {
        console.error("Analytics error:", e);
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
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const firstDay = new Date(d.setDate(diff));
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6);
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
    setDownloadSuccess('');
    try {
      const activeReportType = overrideItem?.reportType || reportType;
      const activeSelectedDate = overrideItem?.selectedDate || selectedDate;
      const activeSelectedMonth = overrideItem?.selectedMonth || selectedMonth;
      const activeSelectedYear = overrideItem?.selectedYear || selectedYear;
      const activeFilterDivisi = overrideItem?.filterDivisi || filterDivisi;
      const activePeriodStr = overrideItem?.periodStr || getPeriodLabel();

      const localEmps = safeJsonParse('local_karyawan', []);
      const localAbs = safeJsonParse('local_absensi', []);

      let dbEmps = [];
      let dbAbs = [];
      try {
        const { data: emps } = await supabase.from('karyawan').select('*');
        if (emps) dbEmps = emps;
        const { data: absData } = await supabase.from('absensi').select('*');
        if (absData) dbAbs = absData;
      } catch (e) {
        console.error("Supabase fetch failed:", e);
      }

      const allEmpsRaw = [...localEmps, ...dbEmps];
      const allEmps = [];
      allEmpsRaw.forEach(emp => {
        if (emp.name && !allEmps.some(u => (u.id && String(u.id) === String(emp.id)) || u.name?.toLowerCase() === emp.name?.toLowerCase())) {
          allEmps.push(emp);
        }
      });

      const allAbs = [...dbAbs];
      localAbs.forEach(loc => {
        const exists = dbAbs.some(d => String(d.karyawan_id) === String(loc.karyawan_id) && d.tanggal === loc.tanggal);
        if (!exists) allAbs.push(loc);
      });

      let filteredEmps = allEmps;
      if (activeFilterDivisi && activeFilterDivisi !== 'Semua Divisi') {
        filteredEmps = allEmps.filter(e => (e.divisi || e.div || '').toLowerCase().includes(activeFilterDivisi.toLowerCase()));
      }

      let filteredAbs = allAbs;
      if (activeReportType === 'Harian') {
        filteredAbs = allAbs.filter(a => a.tanggal === activeSelectedDate);
      } else if (activeReportType === 'Mingguan') {
        const d = new Date(activeSelectedDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        filteredAbs = allAbs.filter(a => {
          if (!a.tanggal) return false;
          const aDate = new Date(a.tanggal);
          return aDate >= monday && aDate <= sunday;
        });
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

      // Per-Employee Accumulation Calculation
      const summaryDataPerEmp = filteredEmps.map((emp, index) => {
        const records = filteredAbs.filter(a => 
          (a.karyawan_id && String(a.karyawan_id) === String(emp.id)) ||
          (a.nama && emp.name && a.nama.toLowerCase() === emp.name.toLowerCase()) ||
          (a.nama_karyawan && emp.name && a.nama_karyawan.toLowerCase() === emp.name.toLowerCase()) ||
          (a.name && emp.name && a.name.toLowerCase() === emp.name.toLowerCase())
        );

        const dayStatusMap = {};
        records.forEach(r => {
          const d = r.tanggal || 'unknown';
          const st = (r.status || '').trim();
          if (!dayStatusMap[d]) {
            dayStatusMap[d] = st;
          } else {
            if (st === 'Terlambat') dayStatusMap[d] = 'Terlambat';
          }
        });

        let hadir = 0;
        let terlambat = 0;
        let izin = 0;
        let sakit = 0;
        let alpa = 0;

        Object.values(dayStatusMap).forEach(st => {
          if (st === 'Hadir' || st === 'Tepat Waktu') hadir++;
          else if (st === 'Terlambat') terlambat++;
          else if (st === 'Izin') izin++;
          else if (st === 'Sakit') sakit++;
          else if (st === 'Tidak Hadir' || st === 'Alpa' || st === 'Alpha' || st === 'Cuti') alpa++;
        });

        const totalHadir = hadir + terlambat;
        const totalRekap = hadir + terlambat + izin + sakit + alpa;
        const persentase = totalRekap > 0 ? Math.round((totalHadir / totalRekap) * 100) : 0;

        return {
          no: index + 1,
          name: emp.name || 'Karyawan',
          divisi: emp.divisi || emp.div || 'Operasional',
          hadir,
          terlambat,
          izin,
          sakit,
          alpa,
          totalHadir,
          persentase: `${persentase}%`
        };
      });

      const totalHadirAll = summaryDataPerEmp.reduce((sum, e) => sum + e.hadir, 0);
      const totalTelatAll = summaryDataPerEmp.reduce((sum, e) => sum + e.terlambat, 0);
      const totalIzinAll = summaryDataPerEmp.reduce((sum, e) => sum + e.izin, 0);
      const totalSakitAll = summaryDataPerEmp.reduce((sum, e) => sum + e.sakit, 0);
      const totalAlpaAll = summaryDataPerEmp.reduce((sum, e) => sum + e.alpa, 0);

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
        // GENERATE DIRECT .XLSX FILE WITH 2 SHEETS: REKAP AKUMULASI + LOG HARIAN
        const wb = XLSX.utils.book_new();

        // Sheet 1: Rekapitulasi Akumulasi Per Karyawan
        const wsSummaryData = [
          ["LAPORAN REKAPITULASI AKUMULASI KEHADIRAN KARYAWAN"],
          ["Hibatullah International Islamic Boarding School"],
          [`Periode: ${activePeriodStr}`, `Divisi: ${activeFilterDivisi}`, `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
          [],
          ["No", "Nama Karyawan", "Divisi", "Hadir (Tepat Waktu)", "Terlambat", "Izin", "Sakit", "Alpa / Cuti", "Total Kehadiran", "% Kehadiran"]
        ];

        summaryDataPerEmp.forEach(e => {
          wsSummaryData.push([
            e.no,
            e.name,
            e.divisi,
            e.hadir,
            e.terlambat,
            e.izin,
            e.sakit,
            e.alpa,
            e.totalHadir,
            e.persentase
          ]);
        });

        wsSummaryData.push([]);
        wsSummaryData.push([
          "",
          "TOTAL KESELURUHAN",
          "",
          totalHadirAll,
          totalTelatAll,
          totalIzinAll,
          totalSakitAll,
          totalAlpaAll,
          totalHadirAll + totalTelatAll,
          ""
        ]);

        const wsSummary = XLSX.utils.aoa_to_sheet(wsSummaryData);
        wsSummary['!cols'] = [
          { wch: 6 },
          { wch: 28 },
          { wch: 18 },
          { wch: 20 },
          { wch: 14 },
          { wch: 10 },
          { wch: 10 },
          { wch: 14 },
          { wch: 18 },
          { wch: 16 }
        ];
        XLSX.utils.book_append_sheet(wb, wsSummary, "Rekap Akumulasi");

        // Sheet 2: Rincian Log Harian
        const wsLogData = [
          ["LOG DETAIL KEHADIRAN HARIAN"],
          ["Hibatullah International Islamic Boarding School"],
          [`Periode: ${activePeriodStr}`, `Divisi: ${activeFilterDivisi}`, `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
          [],
          ["No", "Nama Karyawan", "Divisi", "Sesi / Shift", "Tanggal", "Jam Masuk", "Jam Pulang", "Status", "Lokasi"]
        ];

        if (sortedDates.length === 0) {
          filteredEmps.forEach((emp, idx) => {
            const sess = getSessionLabel(emp.divisi, '07:00');
            wsLogData.push([
              idx + 1,
              emp.name || 'Karyawan',
              emp.divisi || 'Operasional',
              sess,
              activeSelectedDate,
              '-',
              '-',
              'Tidak Hadir',
              '-'
            ]);
          });
        } else {
          sortedDates.forEach(dateKey => {
            const fullDateText = formatFullDateId(dateKey);
            wsLogData.push([]);
            wsLogData.push([`=== ${fullDateText.toUpperCase()} ===`]);
            let dayCount = 0;
            absByDate[dateKey].forEach(a => {
              const emp = filteredEmps.find(e => 
                (a.karyawan_id && String(e.id) === String(a.karyawan_id)) ||
                (a.nama && e.name && a.nama.toLowerCase() === e.name.toLowerCase())
              );
              const empName = emp ? emp.name : (a.nama || a.karyawan_id || 'Karyawan');
              const empDiv = emp ? (emp.divisi || emp.div || 'Operasional') : 'Operasional';

              if (activeFilterDivisi !== 'Semua Divisi' && !empDiv.toLowerCase().includes(activeFilterDivisi.toLowerCase())) return;

              dayCount++;
              const sess = getSessionLabel(empDiv, a.waktu_masuk);
              wsLogData.push([
                dayCount,
                empName,
                empDiv,
                sess,
                a.tanggal || '-',
                a.waktu_masuk || '-',
                a.waktu_keluar || '-',
                a.status || '-',
                a.lokasi || '-'
              ]);
            });
          });
        }

        const wsLog = XLSX.utils.aoa_to_sheet(wsLogData);
        wsLog['!cols'] = [
          { wch: 6 },
          { wch: 26 },
          { wch: 18 },
          { wch: 16 },
          { wch: 14 },
          { wch: 12 },
          { wch: 12 },
          { wch: 16 },
          { wch: 25 }
        ];
        XLSX.utils.book_append_sheet(wb, wsLog, "Log Harian");

        XLSX.writeFile(wb, `${reportName}.xlsx`);
        setDownloadSuccess(`Berhasil mengunduh ${reportName}.xlsx`);
      } else {
        // GENERATE DIRECT .PDF FILE WITH AKUMULASI SUMMARY TABLE & DAILY DETAIL
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // Header Banner
        doc.setFillColor(37, 99, 235); // Blue #2563EB
        doc.rect(0, 0, 210, 24, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('HIBATULLAH INTERNATIONAL ISLAMIC BOARDING SCHOOL', 105, 9, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('LAPORAN REKAPITULASI & AKUMULASI KEHADIRAN KARYAWAN', 105, 16, { align: 'center' });

        // Info Metadata Box
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text('Periode:', 14, 31);
        doc.setFont('helvetica', 'normal');
        doc.text(String(activePeriodStr), 30, 31);

        doc.setFont('helvetica', 'bold');
        doc.text('Divisi:', 14, 36);
        doc.setFont('helvetica', 'normal');
        doc.text(String(activeFilterDivisi), 30, 36);

        doc.setFont('helvetica', 'bold');
        doc.text('Tanggal Cetak:', 135, 31);
        doc.setFont('helvetica', 'normal');
        doc.text(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 158, 31);

        // SECTION 1: TABEL REKAPITULASI AKUMULASI PER KARYAWAN
        doc.setFillColor(239, 246, 255);
        doc.rect(14, 42, 182, 6.5, 'F');
        doc.setTextColor(37, 99, 235);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text('A. REKAPITULASI AKUMULASI KEHADIRAN (PER KARYAWAN)', 17, 46.5);

        const summaryTableBody = summaryDataPerEmp.map(e => [
          e.no,
          e.name,
          e.divisi,
          e.hadir,
          e.terlambat,
          e.izin,
          e.sakit,
          e.alpa,
          e.totalHadir,
          e.persentase
        ]);

        autoTable(doc, {
          startY: 50,
          head: [['No', 'Nama Karyawan', 'Divisi', 'Hadir', 'Telat', 'Izin', 'Sakit', 'Alpa', 'Total Hadir', '% Hadir']],
          body: summaryTableBody,
          foot: [[
            '', 'TOTAL KESELURUHAN', '',
            String(totalHadirAll),
            String(totalTelatAll),
            String(totalIzinAll),
            String(totalSakitAll),
            String(totalAlpaAll),
            String(totalHadirAll + totalTelatAll),
            ''
          ]],
          theme: 'grid',
          headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontSize: 8, fontStyle: 'bold', halign: 'center' },
          footStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold', halign: 'center' },
          styles: { fontSize: 7.5, cellPadding: 2 },
          columnStyles: {
            0: { halign: 'center', cellWidth: 8 },
            1: { fontStyle: 'bold' },
            2: { cellWidth: 24 },
            3: { halign: 'center', textColor: [22, 163, 74], fontStyle: 'bold' },
            4: { halign: 'center', textColor: [217, 119, 6], fontStyle: 'bold' },
            5: { halign: 'center', textColor: [59, 130, 246] },
            6: { halign: 'center', textColor: [219, 39, 119] },
            7: { halign: 'center', textColor: [220, 38, 38], fontStyle: 'bold' },
            8: { halign: 'center', textColor: [37, 99, 235], fontStyle: 'bold' },
            9: { halign: 'center', fontStyle: 'bold' }
          }
        });

        let currentY = doc.lastAutoTable.finalY + 10;

        // SECTION 2: RINCIAN LOG HARIAN (Jika ada)
        if (sortedDates.length > 0) {
          if (currentY > 240) {
            doc.addPage();
            currentY = 16;
          }

          doc.setFillColor(239, 246, 255);
          doc.rect(14, currentY, 182, 6.5, 'F');
          doc.setTextColor(37, 99, 235);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.text('B. RINCIAN LOG KEHADIRAN HARIAN', 17, currentY + 4.5);
          currentY += 8;

          sortedDates.forEach((dateKey) => {
            const fullDateText = formatFullDateId(dateKey);
            const rows = [];
            let dayCount = 0;

            absByDate[dateKey].forEach(a => {
              const emp = filteredEmps.find(e => 
                (a.karyawan_id && String(e.id) === String(a.karyawan_id)) ||
                (a.nama && e.name && a.nama.toLowerCase() === e.name.toLowerCase())
              );
              const empName = emp ? emp.name : (a.nama || a.karyawan_id || 'Karyawan');
              const empDiv = emp ? (emp.divisi || emp.div || 'Operasional') : 'Operasional';

              if (activeFilterDivisi !== 'Semua Divisi' && !empDiv.toLowerCase().includes(activeFilterDivisi.toLowerCase())) return;

              dayCount++;
              const sess = getSessionLabel(empDiv, a.waktu_masuk);
              rows.push([
                dayCount,
                empName,
                empDiv,
                sess,
                a.tanggal || dateKey,
                a.waktu_masuk ? a.waktu_masuk.substring(0, 5) : '-',
                a.waktu_keluar ? a.waktu_keluar.substring(0, 5) : '-',
                a.status || 'Hadir'
              ]);
            });

            if (rows.length > 0) {
              if (currentY > 245) {
                doc.addPage();
                currentY = 16;
              }

              // Sub-header date
              doc.setFontSize(8);
              doc.setTextColor(51, 65, 85);
              doc.setFont('helvetica', 'bold');
              doc.text(`Tanggal: ${fullDateText}`, 14, currentY + 3);
              currentY += 5;

              autoTable(doc, {
                startY: currentY,
                head: [['No', 'Nama Karyawan', 'Divisi', 'Sesi', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status']],
                body: rows,
                theme: 'grid',
                headStyles: { fillColor: [248, 250, 252], textColor: [51, 65, 85], fontSize: 7.5, fontStyle: 'bold' },
                styles: { fontSize: 7.5, cellPadding: 1.8 },
                columnStyles: {
                  0: { halign: 'center', cellWidth: 8 },
                  1: { fontStyle: 'bold' },
                  7: { fontStyle: 'bold' }
                },
                didParseCell: function(data) {
                  if (data.section === 'body' && data.column.index === 7) {
                    const val = data.cell.raw;
                    if (val === 'Terlambat') {
                      data.cell.styles.textColor = [217, 119, 6];
                    } else if (val === 'Hadir' || val === 'Tepat Waktu') {
                      data.cell.styles.textColor = [22, 163, 74];
                    } else {
                      data.cell.styles.textColor = [220, 38, 38];
                    }
                  }
                }
              });
              currentY = doc.lastAutoTable.finalY + 6;
            }
          });
        }

        // Tanda Tangan
        let signY = currentY + 8;
        if (signY > 245) {
          doc.addPage();
          signY = 24;
        }

        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`Bojonegoro, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 145, signY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Manager Operasional & HR', 145, signY + 4.5);
        doc.text('( Tanda Tangan & Cap )', 145, signY + 22);

        // Page Numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(`Halaman ${i} dari ${pageCount} | Hibatullah IIBS Attendance Report`, 105, 290, { align: 'center' });
        }

        doc.save(`${reportName}.pdf`);
        setDownloadSuccess(`Berhasil mengunduh ${reportName}.pdf`);
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
        const updatedHistory = [newReport, ...historyList.filter(h => h.name !== newReport.name)];
        setHistoryList(updatedHistory);
        try {
          localStorage.setItem('laporan_history', JSON.stringify(updatedHistory));
        } catch(e) {}
      }
    } catch (e) {
      console.error("Export error:", e);
      alert("Terjadi kesalahan saat mengunduh laporan: " + (e.message || e));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadHistory = (item) => {
    handleExport(item.type || 'PDF', item);
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

            {downloadSuccess && (
              <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '10px',
                color: '#065F46',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>{downloadSuccess}</span>
              </div>
            )}
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
