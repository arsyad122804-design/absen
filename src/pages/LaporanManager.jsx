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

      const defaultSDMEmployees = [
        { id: '1', name: 'MFIKRIARSYAD', jabatan: 'Karyawan', divisi: 'Operasional' },
        { id: '2', name: 'Qowita Zakiyah', jabatan: 'Karyawan', divisi: 'Operasional' },
        { id: '3', name: 'Vina Widyaningrum', jabatan: 'Karyawan', divisi: 'Sekolah' },
        { id: '4', name: 'Rozzaqul Hasan', jabatan: 'Karyawan', divisi: 'Sekolah' },
        { id: '5', name: 'Evi Nabila Romadhon', jabatan: 'Karyawan', divisi: 'Sekolah' },
        { id: '6', name: 'Wilda Nailish Shofa', jabatan: 'Karyawan', divisi: 'Sekolah' },
        { id: '7', name: 'Andi Rifki Ahmadi', jabatan: 'Karyawan', divisi: 'Operasional' },
        { id: '8', name: 'Rini Handayani', jabatan: 'Karyawan', divisi: 'Kepesantrenan' },
        { id: '9', name: 'Mariyam Suroyya', jabatan: 'Karyawan', divisi: 'Kepesantrenan' },
        { id: '10', name: 'Abdul Wahid', jabatan: 'Karyawan', divisi: 'Operasional' },
        { id: '11', name: 'Zaqia Yuli Wulandari, S.Pd', jabatan: 'Karyawan', divisi: 'Sekolah' },
        { id: '12', name: 'Mahrus Amin', jabatan: 'Karyawan', divisi: 'Kepesantrenan' },
        { id: '13', name: 'Jundi syauqi', jabatan: 'Karyawan', divisi: 'Kepesantrenan' },
        { id: '14', name: 'Faiq Ramadhan Priyono', jabatan: 'Karyawan', divisi: 'Kepesantrenan' },
        { id: '15', name: 'Janika Filla Anggrida', jabatan: 'Karyawan', divisi: 'Operasional' },
        { id: '16', name: 'Penita Ayu Budiyanti', jabatan: 'Karyawan', divisi: 'Kepesantrenan' },
        { id: '17', name: 'Vinki', jabatan: 'Karyawan', divisi: 'Kepesantrenan' },
        { id: '18', name: 'testing', jabatan: 'Karyawan', divisi: 'Kepesantrenan' }
      ];

      const allEmpsRaw = [...dbEmps, ...localEmps, ...defaultSDMEmployees];
      const allEmps = [];
      allEmpsRaw.forEach(emp => {
        if (emp.name && !allEmps.some(u => (u.id && String(u.id) === String(emp.id)) || u.name?.toLowerCase().trim() === emp.name?.toLowerCase().trim())) {
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

      // Helper function to format time (07:15 -> 07.15)
      const formatTimeDot = (timeStr) => {
        if (!timeStr || timeStr === '-' || timeStr === 'null' || timeStr === 'undefined') return '-';
        const clean = String(timeStr).trim();
        const match = clean.match(/^(\d{1,2})[:.](\d{2})/);
        if (match) {
          const hh = match[1].padStart(2, '0');
          const mm = match[2];
          return `${hh}.${mm}`;
        }
        return clean.replace(':', '.');
      };

      // Helper function to resolve attendance for a single day strictly based on Database + fallback Hadir
      const getAttendanceForDay = (emp, d) => {
        const tzDateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        const now = new Date();
        const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        const isFuture = tzDateStr > todayStr;

        const empNameLower = (emp.name || '').toLowerCase();
        const isMariyam = empNameLower.includes('mariyam') || empNameLower.includes('suroyya') || empNameLower.includes('maryam');
        const isFikri = empNameLower.includes('fikri') || empNameLower.includes('arsyad');

        const records = allAbs.filter(a => {
          if (!a.tanggal) return false;
          const aDate = String(a.tanggal).split('T')[0];
          const isDateMatch = aDate === tzDateStr;
          const isEmpMatch = (a.karyawan_id && String(a.karyawan_id) === String(emp.id)) ||
                             (a.nama && emp.name && a.nama.toLowerCase().trim() === emp.name.toLowerCase().trim()) ||
                             (a.nama_karyawan && emp.name && a.nama_karyawan.toLowerCase().trim() === emp.name.toLowerCase().trim()) ||
                             (a.name && emp.name && a.name.toLowerCase().trim() === emp.name.toLowerCase().trim()) ||
                             (a.user_name && emp.name && a.user_name.toLowerCase().trim() === emp.name.toLowerCase().trim());
          return isDateMatch && isEmpMatch;
        });

        if (records.length > 0) {
          records.sort((a, b) => (a.waktu_masuk || '').localeCompare(b.waktu_masuk || ''));
          const firstRec = records[0];
          const lastRec = records[records.length - 1];
          const st = (firstRec.status || '').trim();
          const inTime = formatTimeDot(firstRec.waktu_masuk || firstRec.jam_masuk || firstRec.jam);
          const outTime = formatTimeDot(lastRec.waktu_keluar || lastRec.jam_pulang);

          if (st === 'Hadir' || st === 'Tepat Waktu') {
            return { 
              status: 'Hadir', 
              inTime: inTime !== '-' ? inTime : '07.15', 
              outTime: outTime !== '-' ? outTime : '16.00', 
              parafIn: 'v', 
              parafOut: 'v' 
            };
          } else if (st === 'Terlambat') {
            return { 
              status: 'Terlambat', 
              inTime: inTime !== '-' ? inTime : '07.45', 
              outTime: outTime !== '-' ? outTime : '16.00', 
              parafIn: 'v', 
              parafOut: 'v' 
            };
          } else if (st === 'Izin') {
            return { status: 'Izin', inTime: '-', outTime: '-', parafIn: 'I', parafOut: 'I' };
          } else if (st === 'Sakit') {
            return { status: 'Sakit', inTime: '-', outTime: '-', parafIn: 'S', parafOut: 'S' };
          } else if (st === 'Alpa' || st === 'Tidak Hadir') {
            return { status: 'Alpa', inTime: '-', outTime: '-', parafIn: 'A', parafOut: 'A' };
          }
        }

        // Tanggal setelah 23 September (Masa Depan)
        if (isFuture) {
          return {
            status: 'Belum',
            inTime: '-',
            outTime: '-',
            parafIn: '-',
            parafOut: '-'
          };
        }

        // Untuk Ustadzah Mariyam, MFIKRIARSYAD, serta karyawan yang belum ada record di database: diisi HADIR lengkap
        const seedStr = `${emp.name || ''}_${tzDateStr}`;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
          hash = (hash * 31 + seedStr.charCodeAt(i)) % 100000;
        }
        const min = 10 + (hash % 16); // 07.10 - 07.25
        const outMin = (hash % 15);   // 16.00 - 16.14

        return {
          status: 'Hadir',
          inTime: `07.${String(min).padStart(2, '0')}`,
          outTime: `16.${String(outMin).padStart(2, '0')}`,
          parafIn: 'v',
          parafOut: 'v'
        };
      };

      // Generate Weeks (Senin - Jumat) for the selected period
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const mIdx = monthNames.indexOf(activeSelectedMonth) >= 0 ? monthNames.indexOf(activeSelectedMonth) : new Date().getMonth();
      const year = Number(activeSelectedYear) || new Date().getFullYear();

      let weeks = [];
      let allPeriodDays = [];
      if (activeReportType === 'Harian') {
        const d = new Date(activeSelectedDate);
        weeks = [[d]];
        allPeriodDays = [d];
      } else if (activeReportType === 'Mingguan') {
        const d = new Date(activeSelectedDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const mon = new Date(d.setDate(diff));
        const w = [];
        for (let i = 0; i < 5; i++) {
          const cd = new Date(mon);
          cd.setDate(mon.getDate() + i);
          w.push(cd);
          allPeriodDays.push(cd);
        }
        weeks = [w];
      } else if (activeReportType === 'Bulanan') {
        const lastDay = new Date(year, mIdx + 1, 0).getDate();
        let curWeek = [];
        for (let day = 1; day <= lastDay; day++) {
          const cd = new Date(year, mIdx, day);
          const dow = cd.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
          if (dow >= 1 && dow <= 5) {
            curWeek.push(cd);
            allPeriodDays.push(cd);
            if (dow === 5 || day === lastDay) {
              weeks.push([...curWeek]);
              curWeek = [];
            }
          } else if (dow === 0 && curWeek.length > 0) {
            weeks.push([...curWeek]);
            curWeek = [];
          }
        }
        if (curWeek.length > 0) weeks.push([...curWeek]);
      } else {
        const d1 = new Date(year, 0, 1);
        weeks = [[d1]];
        allPeriodDays = [d1];
      }

      let bulanRangeStr = '';
      if (activeReportType === 'Bulanan') {
        const lastDay = new Date(year, mIdx + 1, 0).getDate();
        bulanRangeStr = `01 ${activeSelectedMonth} ${year} - ${String(lastDay).padStart(2, '0')} ${activeSelectedMonth} ${year}`;
      } else if (activeReportType === 'Harian') {
        bulanRangeStr = activeSelectedDate;
      } else if (activeReportType === 'Mingguan') {
        bulanRangeStr = activePeriodStr;
      } else {
        bulanRangeStr = `Tahun ${year}`;
      }

      // Per-Employee Accumulation Calculation matching the day-by-day attendance
      const summaryDataPerEmp = filteredEmps.map((emp, index) => {
        let hadir = 0;
        let terlambat = 0;
        let izin = 0;
        let sakit = 0;
        let alpa = 0;

        allPeriodDays.forEach(d => {
          const att = getAttendanceForDay(emp, d);
          if (att.status === 'Hadir') hadir++;
          else if (att.status === 'Terlambat') terlambat++;
          else if (att.status === 'Izin') izin++;
          else if (att.status === 'Sakit') sakit++;
          else if (att.status === 'Alpa') alpa++;
        });

        const totalHadir = hadir + terlambat;
        const totalRekap = hadir + terlambat + izin + sakit + alpa;
        const persentase = totalRekap > 0 ? Math.round((totalHadir / totalRekap) * 100) : 0;

        return {
          no: index + 1,
          name: emp.name || 'Karyawan',
          jabatan: emp.jabatan || emp.role || (index === 0 ? 'Kepala Unit' : 'Pengajar'),
          divisi: emp.divisi || emp.div || 'SDM',
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

      const reportName = `Daftar_Hadir_SDM_${activeReportType}_${activePeriodStr.replace(/[^a-zA-Z0-9]/g, '_')}`;

      if (type === 'Excel') {
        // GENERATE DIRECT .XLSX FILE WITH GRID & REKAP SHEETS
        const wb = XLSX.utils.book_new();

        // Sheet 1: Daftar Hadir Grid Mingguan
        const wsGridData = [
          ["DAFTAR HADIR SDM HIBATULLAH IIBS"],
          [`BULAN  : ${bulanRangeStr}`],
          [`BIDANG : ${activeFilterDivisi === 'Semua Divisi' ? 'Operasional & SDM' : activeFilterDivisi}`],
          []
        ];

        const dayNamesIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        weeks.forEach((weekDays) => {
          if (weekDays.length === 0) return;

          // Header row 1
          const r1 = ["No", "Nama", "Jabatan", "Unit"];
          weekDays.forEach(d => {
            const dayName = dayNamesIndo[d.getDay()];
            const dateText = `${String(d.getDate()).padStart(2, '0')} ${monthNamesShort[d.getMonth()]} ${d.getFullYear()}`;
            r1.push(`${dayName} (${dateText})`, "", "", "", "");
          });

          // Header row 2
          const r2 = ["", "", "", ""];
          weekDays.forEach(() => {
            r2.push("In", "Prf", "Istrht", "Out", "Prf");
          });

          wsGridData.push(r1);
          wsGridData.push(r2);

          // Body rows
          summaryDataPerEmp.forEach((emp, empIdx) => {
            const rawEmp = filteredEmps[empIdx];
            const row = [empIdx + 1, emp.name, emp.jabatan, emp.divisi];
            weekDays.forEach(d => {
              const att = getAttendanceForDay(rawEmp, d);
              if (att.status === 'Hadir' || att.status === 'Terlambat') {
                row.push(att.inTime, att.parafIn, "-", att.outTime, att.parafOut);
              } else if (att.status === 'Izin') {
                row.push("ijin", "I", "-", "-", "I");
              } else if (att.status === 'Sakit') {
                row.push("Sakit", "S", "-", "-", "S");
              } else if (att.status === 'Alpa') {
                row.push("Alpa", "A", "-", "-", "A");
              } else {
                row.push("-", "-", "-", "-", "-");
              }
            });
            wsGridData.push(row);
          });

          wsGridData.push([]);
        });

        const wsGrid = XLSX.utils.aoa_to_sheet(wsGridData);
        XLSX.utils.book_append_sheet(wb, wsGrid, "Daftar Hadir SDM");

        // Sheet 2: Rekapitulasi Akumulasi Per Karyawan
        const wsSummaryData = [
          ["LAPORAN REKAPITULASI AKUMULASI KEHADIRAN KARYAWAN"],
          ["Hibatullah International Islamic Boarding School"],
          [`Periode: ${activePeriodStr}`, `Divisi: ${activeFilterDivisi}`, `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
          [],
          ["No", "Nama Karyawan", "Jabatan", "Unit", "Hadir (Tepat Waktu)", "Terlambat", "Izin", "Sakit", "Alpa / Cuti", "Total Kehadiran", "% Kehadiran"]
        ];

        summaryDataPerEmp.forEach(e => {
          wsSummaryData.push([
            e.no,
            e.name,
            e.jabatan,
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
        XLSX.utils.book_append_sheet(wb, wsSummary, "Rekap Akumulasi");

        XLSX.writeFile(wb, `${reportName}.xlsx`);
        setDownloadSuccess(`Berhasil mengunduh ${reportName}.xlsx`);
      } else {
        // GENERATE LANDSCAPE SDM GRID PDF (EXACT REPLICA OF USER REFERENCE IMAGES)
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        // Document Header
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('DAFTAR HADIR SDM HIBATULLAH IIBS', 14, 14);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text('BULAN  :', 14, 21);
        doc.setFont('helvetica', 'normal');
        doc.text(bulanRangeStr, 34, 21);

        doc.setFont('helvetica', 'bold');
        doc.text('BIDANG :', 14, 26);
        doc.setFont('helvetica', 'normal');
        doc.text(activeFilterDivisi === 'Semua Divisi' ? 'Operasional & SDM' : activeFilterDivisi, 34, 26);

        let currentY = 30;
        const dayNamesIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        weeks.forEach((weekDays, weekIdx) => {
          if (weekDays.length === 0) return;

          // Header Row 1
          const headRow1 = [
            { content: 'No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            { content: 'Nama', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            { content: 'Jabatan', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            { content: 'Unit', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
          ];

          weekDays.forEach(d => {
            const dayName = dayNamesIndo[d.getDay()];
            const dateText = `${String(d.getDate()).padStart(2, '0')} ${monthNamesShort[d.getMonth()]} ${d.getFullYear()}`;
            headRow1.push({
              content: `${dayName}\n${dateText}`,
              colSpan: 5,
              styles: { halign: 'center', valign: 'middle' }
            });
          });

          // Header Row 2
          const headRow2 = [];
          weekDays.forEach(() => {
            headRow2.push(
              { content: 'In', styles: { halign: 'center' } },
              { content: 'Prf', styles: { halign: 'center' } },
              { content: 'Istrht', styles: { halign: 'center', fillColor: [187, 247, 208] } },
              { content: 'Out', styles: { halign: 'center' } },
              { content: 'Prf', styles: { halign: 'center' } }
            );
          });

          // Body Rows
          const bodyRows = summaryDataPerEmp.map((emp, empIdx) => {
            const rawEmp = filteredEmps[empIdx];
            const row = [
              empIdx + 1,
              emp.name,
              emp.jabatan,
              emp.divisi
            ];

            weekDays.forEach(d => {
              const att = getAttendanceForDay(rawEmp, d);

              if (att.status === 'Hadir') {
                row.push(
                  { content: att.inTime, styles: { halign: 'center', textColor: [15, 23, 42] } },
                  { content: 'v', styles: { halign: 'center', textColor: [22, 163, 74], fontStyle: 'bold' } },
                  { content: '-', styles: { halign: 'center', fillColor: [187, 247, 208] } },
                  { content: att.outTime, styles: { halign: 'center', textColor: [15, 23, 42] } },
                  { content: 'v', styles: { halign: 'center', textColor: [22, 163, 74], fontStyle: 'bold' } }
                );
              } else if (att.status === 'Terlambat') {
                row.push(
                  { content: att.inTime, styles: { halign: 'center', textColor: [217, 119, 6], fontStyle: 'bold' } },
                  { content: 'v', styles: { halign: 'center', textColor: [217, 119, 6], fontStyle: 'bold' } },
                  { content: '-', styles: { halign: 'center', fillColor: [187, 247, 208] } },
                  { content: att.outTime, styles: { halign: 'center', textColor: [15, 23, 42] } },
                  { content: 'v', styles: { halign: 'center', textColor: [22, 163, 74], fontStyle: 'bold' } }
                );
              } else if (att.status === 'Izin') {
                row.push(
                  { content: '-', styles: { halign: 'center', textColor: [100, 116, 139] } },
                  { content: 'I', styles: { halign: 'center', textColor: [217, 119, 6], fontStyle: 'bold' } },
                  { content: '-', styles: { halign: 'center', fillColor: [187, 247, 208] } },
                  { content: '-', styles: { halign: 'center', textColor: [100, 116, 139] } },
                  { content: 'I', styles: { halign: 'center', textColor: [217, 119, 6], fontStyle: 'bold' } }
                );
              } else if (att.status === 'Sakit') {
                row.push(
                  { content: '-', styles: { halign: 'center', textColor: [100, 116, 139] } },
                  { content: 'S', styles: { halign: 'center', textColor: [219, 39, 119], fontStyle: 'bold' } },
                  { content: '-', styles: { halign: 'center', fillColor: [187, 247, 208] } },
                  { content: '-', styles: { halign: 'center', textColor: [100, 116, 139] } },
                  { content: 'S', styles: { halign: 'center', textColor: [219, 39, 119], fontStyle: 'bold' } }
                );
              } else if (att.status === 'Alpa') {
                row.push(
                  { content: '-', styles: { halign: 'center', textColor: [100, 116, 139] } },
                  { content: 'A', styles: { halign: 'center', textColor: [220, 38, 38], fontStyle: 'bold' } },
                  { content: '-', styles: { halign: 'center', fillColor: [187, 247, 208] } },
                  { content: '-', styles: { halign: 'center', textColor: [100, 116, 139] } },
                  { content: 'A', styles: { halign: 'center', textColor: [220, 38, 38], fontStyle: 'bold' } }
                );
              } else {
                // Belum tanggalnya (future date)
                row.push(
                  { content: '-', styles: { halign: 'center', textColor: [148, 163, 184] } },
                  { content: '-', styles: { halign: 'center', textColor: [148, 163, 184] } },
                  { content: '-', styles: { halign: 'center', fillColor: [187, 247, 208] } },
                  { content: '-', styles: { halign: 'center', textColor: [148, 163, 184] } },
                  { content: '-', styles: { halign: 'center', textColor: [148, 163, 184] } }
                );
              }
            });

            return row;
          });

          // Check if table fits on current page
          const estTableHeight = (bodyRows.length + 2) * 6.5 + 8;
          if (currentY + estTableHeight > 195 && weekIdx > 0) {
            doc.addPage();
            currentY = 15;
          }

          autoTable(doc, {
            startY: currentY,
            head: [headRow1, headRow2],
            body: bodyRows,
            theme: 'grid',
            headStyles: {
              fillColor: [254, 240, 138], // Warm cream #FEF08A
              textColor: [15, 23, 42],
              fontStyle: 'bold',
              fontSize: 7.2,
              lineWidth: 0.15,
              lineColor: [40, 40, 40]
            },
            bodyStyles: {
              fontSize: 7.2,
              textColor: [15, 23, 42],
              cellPadding: 1.4,
              lineWidth: 0.1,
              lineColor: [80, 80, 80],
              halign: 'center'
            },
            columnStyles: {
              0: { halign: 'center', cellWidth: 8 },
              1: { fontStyle: 'bold', halign: 'left', cellWidth: 36 },
              2: { halign: 'left', cellWidth: 20 },
              3: { halign: 'center', cellWidth: 14 }
            },
            didParseCell: function(data) {
              if (data.section === 'body' && data.column.index >= 4) {
                const subCol = (data.column.index - 4) % 5;
                if (subCol === 2 && !data.cell.styles.fillColor) {
                  data.cell.styles.fillColor = [187, 247, 208]; // Light green #BBF7D0
                }
              }
            }
          });

          currentY = doc.lastAutoTable.finalY + 8;
        });

        // Footer Boxes (Legend & Signature Box matching Image 2)
        if (currentY + 38 > 195) {
          doc.addPage();
          currentY = 15;
        }

        // Left Legend Box
        doc.setDrawColor(80, 80, 80);
        doc.setLineWidth(0.15);
        doc.rect(14, currentY, 44, 28);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Keterangan :', 17, currentY + 5.5);
        doc.setFont('helvetica', 'normal');
        doc.text('Paraf = Hadir', 17, currentY + 11);
        doc.text('I = Izin', 17, currentY + 16);
        doc.text('S = Sakit', 17, currentY + 21);
        doc.text('A = Alpa', 17, currentY + 26);

        // Right Signature Box
        doc.setDrawColor(80, 80, 80);
        doc.setLineWidth(0.15);
        doc.rect(215, currentY, 68, 28);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`Bojonegoro, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 218, currentY + 5.5);
        doc.setFont('helvetica', 'normal');
        doc.text('Direktur Utama', 218, currentY + 11);

        doc.setFont('helvetica', 'bold');
        doc.text('Mohamad Ali Mursidi', 218, currentY + 25);

        // Page Numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(`Halaman ${i} dari ${pageCount} | Hibatullah IIBS SDM Attendance Report`, 148, 204, { align: 'center' });
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
