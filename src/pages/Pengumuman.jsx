import React from 'react';
import { BellRing, Megaphone, Calendar as Cal, ArrowRight, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Pengumuman() {
  const { t } = useLanguage();

  const announcements = [
    {
      id: 1,
      type: 'Penting',
      title: 'Pemberitahuan Cuti Bersama Idul Adha 2026',
      date: '8 Agustus 2026',
      author: 'Direktorat SDM',
      content: 'Berdasarkan surat keputusan Yayasan Hibatullah, diumumkan bahwa libur Idul Adha 1447 H jatuh pada tanggal 20-22 Agustus 2026. Seluruh kegiatan belajar mengajar ditiadakan pada tanggal tersebut.',
      isNew: true,
      color: 'blue'
    },
    {
      id: 2,
      type: 'Informasi',
      title: 'Jadwal Pengambilan Seragam Batik Baru',
      date: '5 Agustus 2026',
      author: 'Tata Usaha',
      content: 'Bagi seluruh dewan guru dan staf karyawan, pengambilan seragam batik yayasan yang baru sudah dapat dilakukan di ruang Tata Usaha pada jam kerja (08:00 - 15:00 WIB).',
      isNew: false,
      color: 'teal'
    },
    {
      id: 3,
      type: 'Agenda',
      title: 'Rapat Kerja Bulanan Agustus',
      date: '1 Agustus 2026',
      author: 'Kepala Sekolah',
      content: 'Dimohon kehadirannya dalam Rapat Kerja Evaluasi Bulanan yang akan diselenggarakan pada hari Sabtu, 10 Agustus 2026 di Aula Utama.',
      isNew: false,
      color: 'purple'
    }
  ];

  const getColorTheme = (color) => {
    const themes = {
      blue: { bg: '#EFF6FF', text: '#2563EB', icon: <Megaphone size={20} /> },
      teal: { bg: '#F0FDFA', text: '#0D9488', icon: <Info size={20} /> },
      purple: { bg: '#FAF5FF', text: '#9333EA', icon: <Cal size={20} /> },
    };
    return themes[color] || themes.blue;
  };

  return (
    <div className="content-container pengumuman-page">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div className="greeting">
          <h1>{t.pengumumanSekolah}</h1>
          <p>{t.infoResmi}</p>
        </div>
        <div className="p-header-icon">
          <BellRing size={28} color="#3B82F6" />
        </div>
      </div>

      <div className="p-feed">
        {announcements.map((item) => {
          const theme = getColorTheme(item.color);
          return (
            <div className="p-card" key={item.id}>
              <div className="p-card-left">
                <div className="p-icon-wrapper" style={{ backgroundColor: theme.bg, color: theme.text }}>
                  {item.id === 3 ? <Cal size={20} /> : theme.icon}
                </div>
                {item.isNew && <div className="p-new-badge">{t.baru}</div>}
              </div>
              <div className="p-card-right">
                <div className="p-meta">
                  <span className="p-type" style={{ color: theme.text }}>{item.type}</span>
                  <span className="p-dot">•</span>
                  <span className="p-date">{item.date}</span>
                  <span className="p-dot">•</span>
                  <span className="p-author">{item.author}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.content}</p>
                <a href="#" className="p-read-more">{t.bacaSelengkapnya} <ArrowRight size={14} /></a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
