import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronRight, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Jadwal() {
  const { t } = useLanguage();
  const [activeDay, setActiveDay] = useState('Kamis');
  
  // Create localized day names mapping
  const dayKeys = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const localizedDays = {
    Senin: t.senin,
    Selasa: t.selasa,
    Rabu: t.rabu,
    Kamis: t.kamis,
    Jumat: t.jumat
  };

  const scheduleData = {
    Senin: [
      { time: '07:30 - 09:00', subject: 'Pemrograman Web', class: 'XII RPL 1', room: 'Lab Komputer A', color: 'blue' },
      { time: '09:30 - 11:00', subject: 'Kecerdasan Buatan', class: 'XII RPL 2', room: 'Lab Komputer B', color: 'purple' },
    ],
    Selasa: [
      { time: '08:00 - 10:00', subject: 'Basis Data', class: 'XI RPL 1', room: 'Lab Komputer A', color: 'green' },
      { time: '13:00 - 14:30', subject: 'Rapat Dewan Guru', class: '-', room: 'Ruang Rapat Utama', color: 'orange' },
    ],
    Rabu: [
      { time: '07:30 - 09:00', subject: 'Pemrograman Web', class: 'XII RPL 2', room: 'Lab Komputer A', color: 'blue' },
    ],
    Kamis: [
      { time: '07:30 - 09:30', subject: 'Proyek Akhir', class: 'XII RPL 1', room: 'Lab Komputer A', color: 'pink' },
      { time: '10:00 - 12:00', subject: 'Proyek Akhir', class: 'XII RPL 2', room: 'Lab Komputer B', color: 'pink' },
      { time: '13:30 - 15:00', subject: 'Ekstrakurikuler Robotik', class: 'Gabungan', room: 'Ruang Robotik', color: 'indigo' },
    ],
    Jumat: [
      { time: '07:30 - 09:00', subject: 'Literasi Digital', class: 'X Semua Jurusan', room: 'Aula Utama', color: 'teal' },
    ]
  };

  const getPastelColor = (color) => {
    const colors = {
      blue: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
      purple: { bg: '#FAF5FF', text: '#9333EA', border: '#E9D5FF' },
      green: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
      orange: { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
      pink: { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
      indigo: { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
      teal: { bg: '#F0FDFA', text: '#0D9488', border: '#BFDBFE' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="content-container jadwal-page">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div className="greeting">
          <h1>{t.jadwalMengajar}</h1>
          <p>{t.kalenderAktivitas}</p>
        </div>
        <div className="j-week-picker">
          <Calendar size={18} color="#64748B" />
          <span>{t.mingguKe}</span>
        </div>
      </div>

      <div className="j-days-tabs">
        {dayKeys.map(day => (
          <button 
            key={day} 
            className={`j-day-tab ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            {localizedDays[day]}
            {activeDay === day && <span className="j-active-dot"></span>}
          </button>
        ))}
      </div>

      <div className="j-timeline">
        {scheduleData[activeDay]?.length > 0 ? scheduleData[activeDay].map((item, idx) => {
          const theme = getPastelColor(item.color);
          return (
            <div className="j-card" key={idx} style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
              <div className="j-time-col">
                <Clock size={18} color={theme.text} />
                <strong style={{ color: theme.text }}>{item.time.split(' - ')[0]}</strong>
                <span style={{ color: theme.text, opacity: 0.7 }}>{item.time.split(' - ')[1]}</span>
              </div>
              <div className="j-divider" style={{ backgroundColor: theme.border }}></div>
              <div className="j-content-col">
                <h3 style={{ color: theme.text }}>{item.subject}</h3>
                <div className="j-details">
                  <div className="j-detail-item">
                    <BookOpen size={16} color={theme.text} style={{ opacity: 0.7 }} />
                    <span style={{ color: theme.text }}>{t.kelas}: {item.class}</span>
                  </div>
                  <div className="j-detail-item">
                    <MapPin size={16} color={theme.text} style={{ opacity: 0.7 }} />
                    <span style={{ color: theme.text }}>{t.ruang}: {item.room}</span>
                  </div>
                </div>
              </div>
              <button className="j-go-btn" style={{ color: theme.text, backgroundColor: theme.border }}>
                <ChevronRight size={20} />
              </button>
            </div>
          );
        }) : (
          <div className="j-empty-state">
            <div className="j-empty-icon">🏖️</div>
            <h3>{t.tidakAdaJadwal}</h3>
            <p>{t.waktuEvaluasi}</p>
          </div>
        )}
      </div>
    </div>
  );
}
