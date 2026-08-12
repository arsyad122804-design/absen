import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, PhoneCall } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Bantuan() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'Bagaimana cara melakukan absensi Hadir?',
      a: 'Pilih menu Dashboard, lalu klik kotak "Hadir" yang berwarna hijau. Sistem akan meminta izin untuk mengakses kamera dan lokasi Anda. Pastikan wajah terlihat jelas, lalu klik "Rekam Kehadiran Sekarang".'
    },
    {
      q: 'Apa yang harus dilakukan jika GPS / Lokasi tidak terdeteksi?',
      a: 'Pastikan fitur Lokasi/GPS di HP Anda dalam keadaan aktif. Jika menggunakan browser (Chrome/Safari), pastikan Anda telah memberikan izin (Allow) untuk mengakses lokasi pada situs ini.'
    },
    {
      q: 'Bagaimana cara mengajukan Izin atau Sakit?',
      a: 'Pada menu Dashboard, pilih kotak "Izin" atau "Sakit". Akan muncul kolom isian "Alasan" di bawahnya. Tuliskan alasan ketidakhadiran Anda dengan jelas, lalu klik tombol biru "Kirim Alasan".'
    },
    {
      q: 'Apakah saya bisa mengubah absensi jika salah tekan?',
      a: 'Data absensi yang sudah dikirim tidak dapat diubah secara langsung oleh pengguna. Jika terjadi kesalahan pencatatan, silakan hubungi pihak Tata Usaha atau Admin IT untuk melakukan penyesuaian data.'
    }
  ];

  return (
    <div className="content-container bantuan-page">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div className="greeting">
          <h1>{t.pusatBantuan}</h1>
          <p>{t.panduanPenggunaan}</p>
        </div>
        <div className="p-header-icon" style={{ background: '#EEF2FF' }}>
          <HelpCircle size={28} color="#4F46E5" />
        </div>
      </div>

      <div className="b-grid">
        <div className="b-faq-section">
          <h2 className="b-section-title">{t.pertanyaanUmum}</h2>
          
          <div className="b-faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`b-faq-item ${openFaq === index ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              >
                <div className="b-faq-q">
                  <h4>{faq.q}</h4>
                  {openFaq === index ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
                </div>
                {openFaq === index && (
                  <div className="b-faq-a">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="b-contact-section">
          <div className="b-contact-card">
            <div className="b-contact-icon">
              <MessageSquare size={24} color="#3B82F6" />
            </div>
            <h3>{t.butuhBantuan}</h3>
            <p>{t.adminSiap}</p>
            <button className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '16px' }}>
              {t.chatAdmin}
            </button>
          </div>

          <div className="b-contact-card" style={{ marginTop: '24px' }}>
            <div className="b-contact-icon" style={{ background: '#F0FDF4' }}>
              <PhoneCall size={24} color="#16A34A" />
            </div>
            <h3>{t.hubungiTU}</h3>
            <p>{t.kendalaTU}</p>
            <h4 style={{ fontSize: '18px', margin: '12px 0 0', color: '#0F172A' }}>021-8899-7766</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
