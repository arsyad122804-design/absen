import React, { createContext, useState, useContext } from 'react';

const dictionary = {
  Indonesia: {
    // Sidebar
    dashboard: "Dashboard",
    riwayatAbsen: "Riwayat Absen",
    pengajuanCuti: "Pengajuan Cuti",
    jadwal: "Jadwal",
    pengumuman: "Pengumuman",
    profilSaya: "Profil Saya",
    pengaturan: "Pengaturan",
    bantuan: "Bantuan",
    beradabBerkarya: "Beradab dan Berkarya",
    
    // Pengaturan
    prefAplikasi: "Preferensi Aplikasi",
    modeGelap: "Mode Gelap (Dark Mode)",
    modeGelapDesc: "Ubah tampilan aplikasi menjadi gelap.",
    bahasaApp: "Bahasa Aplikasi",
    bahasaAppDesc: "Pilih bahasa pengantar.",
    notifikasi: "Notifikasi",
    notifPush: "Notifikasi Push",
    notifPushDesc: "Terima pengingat absensi di perangkat ini.",
    notifEmail: "Notifikasi Email",
    notifEmailDesc: "Terima rekap absensi mingguan via email.",
    privasiKeamanan: "Privasi & Keamanan",
    akurasiLokasi: "Akurasi Lokasi Tinggi",
    akurasiLokasiDesc: "Gunakan GPS untuk merekam lokasi secara akurat.",
    loginBiometrik: "Login Biometrik",
    loginBiometrikDesc: "Gunakan sidik jari atau Face ID untuk masuk.",
    
    // Absensi
    halo: "Halo",
    catatKehadiran: "Catat Kehadiran",
    pilihKondisi: "Pilih kondisi Anda hari ini untuk direkam dalam sistem.",
    hadir: "Hadir",
    hadirDesc: "Saya berada di lokasi sekolah.",
    izin: "Izin",
    izinDesc: "Ada keperluan keluarga / mendesak.",
    sakit: "Sakit",
    sakitDesc: "Tidak enak badan / istirahat.",
    rekamHadir: "Rekam Kehadiran Sekarang",
    batal: "Batal",
    kirimAlasan: "Kirim Alasan",
    tulisAlasan: "Tuliskan alasan Anda secara detail...",
    
    // Riwayat Absen
    pantauJejak: "Pantau jejak kehadiran Anda sepanjang bulan ini.",
    unduhLaporan: "Unduh Laporan",
    hari: "Hari",
    totalHadir: "Total Hadir",
    izinSakit: "Izin & Sakit",
    tanpaKeterangan: "Tanpa Keterangan",
    semua: "Semua",
    cariTanggal: "Cari tanggal atau keterangan...",
    tanggal: "Tanggal",
    waktuMasuk: "Waktu Masuk / Info",
    keterangan: "Keterangan",
    status: "Status",
    terlambat: "Terlambat",
    absen: "Absen",
    
    // Jadwal
    jadwalMengajar: "Jadwal Mengajar",
    kalenderAktivitas: "Kalender dan aktivitas belajar mengajar Anda minggu ini.",
    mingguKe: "Minggu ke-2, Agustus 2026",
    senin: "Senin", selasa: "Selasa", rabu: "Rabu", kamis: "Kamis", jumat: "Jumat",
    kelas: "Kelas", ruang: "Ruang",
    tidakAdaJadwal: "Alhamdulillah, Tidak ada jadwal mengajar",
    waktuEvaluasi: "Anda bisa menggunakan waktu ini untuk evaluasi atau persiapan materi.",
    
    // Pengumuman
    pengumumanSekolah: "Pengumuman Sekolah",
    infoResmi: "Informasi resmi, agenda kegiatan, dan berita terbaru.",
    baru: "Baru",
    bacaSelengkapnya: "Baca selengkapnya",
    
    // Profil Saya
    kelolaData: "Kelola data diri dan informasi akun Anda.",
    infoPribadi: "Informasi Pribadi",
    namaLengkap: "Nama Lengkap",
    alamatEmail: "Alamat Email",
    nomorHP: "Nomor HP / WhatsApp",
    alamatTinggal: "Alamat Tempat Tinggal",
    ubahPassword: "Ubah Password",
    simpanPerubahan: "Simpan Perubahan",
    
    // Bantuan
    pusatBantuan: "Pusat Bantuan",
    panduanPenggunaan: "Panduan penggunaan aplikasi dan jawaban atas pertanyaan umum.",
    pertanyaanUmum: "Pertanyaan yang Sering Diajukan (FAQ)",
    butuhBantuan: "Butuh Bantuan Langsung?",
    adminSiap: "Admin IT kami siap membantu Anda menyelesaikan masalah teknis terkait aplikasi absensi.",
    chatAdmin: "Chat Admin IT",
    hubungiTU: "Hubungi Tata Usaha",
    kendalaTU: "Untuk kendala administratif atau penyesuaian data kehadiran."
  },
  Inggris: {
    // Sidebar
    dashboard: "Dashboard",
    riwayatAbsen: "Attendance History",
    pengajuanCuti: "Leave Request",
    jadwal: "Schedule",
    pengumuman: "Announcements",
    profilSaya: "My Profile",
    pengaturan: "Settings",
    bantuan: "Help",
    beradabBerkarya: "Civilized and Creative",
    
    // Pengaturan
    prefAplikasi: "Application Preferences",
    modeGelap: "Dark Mode",
    modeGelapDesc: "Change the application appearance to dark.",
    bahasaApp: "Application Language",
    bahasaAppDesc: "Select the interface language.",
    notifikasi: "Notifications",
    notifPush: "Push Notifications",
    notifPushDesc: "Receive attendance reminders on this device.",
    notifEmail: "Email Notifications",
    notifEmailDesc: "Receive weekly attendance summary via email.",
    privasiKeamanan: "Privacy & Security",
    akurasiLokasi: "High Location Accuracy",
    akurasiLokasiDesc: "Use GPS to record location accurately.",
    loginBiometrik: "Biometric Login",
    loginBiometrikDesc: "Use fingerprint or Face ID to log in.",
    
    // Absensi
    halo: "Hello",
    catatKehadiran: "Record Attendance",
    pilihKondisi: "Choose your condition today to be recorded in the system.",
    hadir: "Present",
    hadirDesc: "I am at the school location.",
    izin: "Excused",
    izinDesc: "I have family / urgent matters.",
    sakit: "Sick",
    sakitDesc: "Not feeling well / resting.",
    rekamHadir: "Record Attendance Now",
    batal: "Cancel",
    kirimAlasan: "Submit Reason",
    tulisAlasan: "Write your reason in detail...",
    
    // Riwayat Absen
    pantauJejak: "Monitor your attendance track record throughout this month.",
    unduhLaporan: "Download Report",
    hari: "Days",
    totalHadir: "Total Present",
    izinSakit: "Excused & Sick",
    tanpaKeterangan: "Without Explanation",
    semua: "All",
    cariTanggal: "Search date or explanation...",
    tanggal: "Date",
    waktuMasuk: "Check-in Time / Info",
    keterangan: "Explanation",
    status: "Status",
    terlambat: "Late",
    absen: "Absent",
    
    // Jadwal
    jadwalMengajar: "Teaching Schedule",
    kalenderAktivitas: "Your teaching calendar and activities this week.",
    mingguKe: "2nd Week, August 2026",
    senin: "Monday", selasa: "Tuesday", rabu: "Wednesday", kamis: "Thursday", jumat: "Friday",
    kelas: "Class", ruang: "Room",
    tidakAdaJadwal: "Alhamdulillah, No teaching schedule",
    waktuEvaluasi: "You can use this time for evaluation or material preparation.",
    
    // Pengumuman
    pengumumanSekolah: "School Announcements",
    infoResmi: "Official information, agenda, and latest news.",
    baru: "New",
    bacaSelengkapnya: "Read more",
    
    // Profil Saya
    kelolaData: "Manage your personal data and account information.",
    infoPribadi: "Personal Information",
    namaLengkap: "Full Name",
    alamatEmail: "Email Address",
    nomorHP: "Phone / WhatsApp Number",
    alamatTinggal: "Residential Address",
    ubahPassword: "Change Password",
    simpanPerubahan: "Save Changes",
    
    // Bantuan
    pusatBantuan: "Help Center",
    panduanPenggunaan: "Application usage guide and answers to common questions.",
    pertanyaanUmum: "Frequently Asked Questions (FAQ)",
    butuhBantuan: "Need Direct Help?",
    adminSiap: "Our IT Admin is ready to help you solve technical problems related to the attendance application.",
    chatAdmin: "Chat IT Admin",
    hubungiTU: "Contact Administration",
    kendalaTU: "For administrative issues or attendance data adjustment."
  },
  Arab: {
    // Sidebar
    dashboard: "لوحة القيادة",
    riwayatAbsen: "سجل الحضور",
    jadwal: "الجدول الزمني",
    pengumuman: "الإعلانات",
    profilSaya: "ملفي الشخصي",
    pengaturan: "الإعدادات",
    bantuan: "مساعدة",
    beradabBerkarya: "متحضر ومبدع",
    
    // Pengaturan
    prefAplikasi: "تفضيلات التطبيق",
    modeGelap: "الوضع الداكن",
    modeGelapDesc: "تغيير مظهر التطبيق إلى الداكن.",
    bahasaApp: "لغة التطبيق",
    bahasaAppDesc: "حدد لغة الواجهة.",
    notifikasi: "الإشعارات",
    notifPush: "إشعارات الدفع",
    notifPushDesc: "تلقي تذكيرات الحضور على هذا الجهاز.",
    notifEmail: "إشعارات البريد الإلكتروني",
    notifEmailDesc: "تلقي ملخص الحضور الأسبوعي عبر البريد الإلكتروني.",
    privasiKeamanan: "الخصوصية والأمان",
    akurasiLokasi: "دقة موقع عالية",
    akurasiLokasiDesc: "استخدم GPS لتسجيل الموقع بدقة.",
    loginBiometrik: "تسجيل الدخول البيومتري",
    loginBiometrikDesc: "استخدم بصمة الإصبع أو بصمة الوجه لتسجيل الدخول.",
    
    // Absensi
    halo: "مرحباً",
    catatKehadiran: "تسجيل الحضور",
    pilihKondisi: "اختر حالتك اليوم ليتم تسجيلها في النظام.",
    hadir: "حاضر",
    hadirDesc: "أنا في موقع المدرسة.",
    izin: "مستأذن",
    izinDesc: "لدي أمور عائلية / طارئة.",
    sakit: "مريض",
    sakitDesc: "لست بخير / أرتاح.",
    rekamHadir: "سجل الحضور الآن",
    batal: "إلغاء",
    kirimAlasan: "إرسال السبب",
    tulisAlasan: "اكتب سببك بالتفصيل...",
    
    // Riwayat Absen
    pantauJejak: "راقب سجل حضورك طوال هذا الشهر.",
    unduhLaporan: "تحميل التقرير",
    hari: "أيام",
    totalHadir: "إجمالي الحضور",
    izinSakit: "مستأذن ومريض",
    tanpaKeterangan: "بدون تفسير",
    semua: "الكل",
    cariTanggal: "ابحث عن التاريخ أو التفسير...",
    tanggal: "التاريخ",
    waktuMasuk: "وقت الدخول / معلومات",
    keterangan: "التفسير",
    status: "الحالة",
    terlambat: "متأخر",
    absen: "غائب",
    
    // Jadwal
    jadwalMengajar: "جدول التدريس",
    kalenderAktivitas: "تقويم التدريس والأنشطة هذا الأسبوع.",
    mingguKe: "الأسبوع الثاني ، أغسطس ٢٠٢٦",
    senin: "الاثنين", selasa: "الثلاثاء", rabu: "الأربعاء", kamis: "الخميس", jumat: "الجمعة",
    kelas: "الفصل", ruang: "الغرفة",
    tidakAdaJadwal: "الحمد لله، لا يوجد جدول تدريس",
    waktuEvaluasi: "يمكنك استخدام هذا الوقت للتقييم أو تحضير المواد.",
    
    // Pengumuman
    pengumumanSekolah: "إعلانات المدرسة",
    infoResmi: "معلومات رسمية، جدول أعمال، وأحدث الأخبار.",
    baru: "جديد",
    bacaSelengkapnya: "اقرأ المزيد",
    
    // Profil Saya
    kelolaData: "إدارة بياناتك الشخصية ومعلومات حسابك.",
    infoPribadi: "معلومات شخصية",
    namaLengkap: "الاسم الكامل",
    alamatEmail: "عنوان البريد الإلكتروني",
    nomorHP: "رقم الهاتف / واتساب",
    alamatTinggal: "عنوان السكن",
    ubahPassword: "تغيير كلمة المرور",
    simpanPerubahan: "حفظ التغييرات",
    
    // Bantuan
    pusatBantuan: "مركز المساعدة",
    panduanPenggunaan: "دليل استخدام التطبيق وإجابات على الأسئلة الشائعة.",
    pertanyaanUmum: "الأسئلة المتداولة (FAQ)",
    butuhBantuan: "هل تحتاج إلى مساعدة مباشرة؟",
    adminSiap: "مسؤول تكنولوجيا المعلومات لدينا مستعد لمساعدتك في حل المشاكل التقنية.",
    chatAdmin: "دردشة مسؤول تكنولوجيا المعلومات",
    hubungiTU: "اتصل بالإدارة",
    kendalaTU: "للقضايا الإدارية أو تعديل بيانات الحضور."
  },
  Mandarin: {
    // Sidebar
    dashboard: "仪表板",
    riwayatAbsen: "考勤历史",
    jadwal: "时间表",
    pengumuman: "公告",
    profilSaya: "我的主页",
    pengaturan: "设置",
    bantuan: "帮助",
    beradabBerkarya: "文明与创造",
    
    // Pengaturan
    prefAplikasi: "应用偏好",
    modeGelap: "深色模式",
    modeGelapDesc: "将应用程序外观更改为深色。",
    bahasaApp: "应用语言",
    bahasaAppDesc: "选择界面语言。",
    notifikasi: "通知",
    notifPush: "推送通知",
    notifPushDesc: "在此设备上接收考勤提醒。",
    notifEmail: "电子邮件通知",
    notifEmailDesc: "通过电子邮件接收每周考勤摘要。",
    privasiKeamanan: "隐私与安全",
    akurasiLokasi: "高定位精度",
    akurasiLokasiDesc: "使用GPS准确记录位置。",
    loginBiometrik: "生物识别登录",
    loginBiometrikDesc: "使用指纹或面容ID登录。",
    
    // Absensi
    halo: "你好",
    catatKehadiran: "记录出勤",
    pilihKondisi: "选择您今天的情况以记录在系统中。",
    hadir: "出席",
    hadirDesc: "我在学校位置。",
    izin: "请假",
    izinDesc: "我有家庭/紧急事务。",
    sakit: "生病",
    sakitDesc: "身体不适/休息。",
    rekamHadir: "立即记录出勤",
    batal: "取消",
    kirimAlasan: "提交原因",
    tulisAlasan: "详细写下您的原因...",
    
    // Riwayat Absen
    pantauJejak: "监控您本月的考勤记录。",
    unduhLaporan: "下载报告",
    hari: "天",
    totalHadir: "总出勤",
    izinSakit: "请假和生病",
    tanpaKeterangan: "无解释",
    semua: "全部",
    cariTanggal: "搜索日期或解释...",
    tanggal: "日期",
    waktuMasuk: "入住时间 / 信息",
    keterangan: "解释",
    status: "状态",
    terlambat: "迟到",
    absen: "缺席",
    
    // Jadwal
    jadwalMengajar: "教学时间表",
    kalenderAktivitas: "您本周的教学日历和活动。",
    mingguKe: "2026年8月，第二周",
    senin: "星期一", selasa: "星期二", rabu: "星期三", kamis: "星期四", jumat: "星期五",
    kelas: "班级", ruang: "房间",
    tidakAdaJadwal: "赞美真主，没有教学安排",
    waktuEvaluasi: "您可以利用这段时间进行评估或准备材料。",
    
    // Pengumuman
    pengumumanSekolah: "学校公告",
    infoResmi: "官方信息，议程和最新消息。",
    baru: "新",
    bacaSelengkapnya: "阅读更多",
    
    // Profil Saya
    kelolaData: "管理您的个人数据和帐户信息。",
    infoPribadi: "个人信息",
    namaLengkap: "全名",
    alamatEmail: "电子邮件地址",
    nomorHP: "电话/WhatsApp号码",
    alamatTinggal: "居住地址",
    ubahPassword: "更改密码",
    simpanPerubahan: "保存更改",
    
    // Bantuan
    pusatBantuan: "帮助中心",
    panduanPenggunaan: "应用程序使用指南和常见问题解答。",
    pertanyaanUmum: "常见问题 (FAQ)",
    butuhBantuan: "需要直接帮助吗？",
    adminSiap: "我们的IT管理员随时准备帮助您解决相关的技术问题。",
    chatAdmin: "与IT管理员聊天",
    hubungiTU: "联系行政部门",
    kendalaTU: "处理行政问题或考勤数据调整。"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('Indonesia');

  // helper function to translate key
  const t = dictionary[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
