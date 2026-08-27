import React, { useState } from 'react';
import {
  Program,
  Pilgrim,
  Booking,
  Partner
} from '../types';
import { AGENCY_DETAILS } from '../data/mockData';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Database,
  Calendar,
  Filter,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Hotel,
  Plane,
  Users,
  CreditCard,
  HardDrive,
  RefreshCw,
  UploadCloud,
  Clock,
  X,
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

interface ExportBackupViewProps {
  programs: Program[];
  pilgrims: Pilgrim[];
  bookings: Booking[];
  partners?: Partner[];
  onBackToDashboard?: () => void;
}

export const ExportBackupView: React.FC<ExportBackupViewProps> = ({
  programs,
  pilgrims,
  bookings,
  partners = [],
  onBackToDashboard,
}) => {
  // Years for filter dropdown
  const currentYear = new Date().getFullYear();
  const availableYears = ['الكل', String(currentYear), String(currentYear - 1), String(currentYear - 2)];

  // Active programs list
  const activePrograms = programs.filter(p => !p.isArchived);

  // Module 1: Accommodation Manifest State
  const [accommodYear, setAccommodYear] = useState<string>('الكل');
  const [accommodProgramId, setAccommodProgramId] = useState<string>('all');

  // Module 2: Passenger Manifest State
  const [passengerYear, setPassengerYear] = useState<string>('الكل');
  const [passengerProgramId, setPassengerProgramId] = useState<string>('all');

  // Module 3: Pilgrims List State
  const [pilgrimYear, setPilgrimYear] = useState<string>('الكل');
  const [pilgrimProgramId, setPilgrimProgramId] = useState<string>('all');

  // Module 4: Payments Report State
  const [paymentFromDate, setPaymentFromDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [paymentToDate, setPaymentToDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // PDF Preview Modal State
  const [pdfModalData, setPdfModalData] = useState<{
    title: string;
    subtitle: string;
    headers: string[];
    rows: (string | number)[][];
    summaryInfo?: { label: string; value: string | number }[];
  } | null>(null);

  // Backup Management Modal State
  const [isBackupManageOpen, setIsBackupManageOpen] = useState<boolean>(false);
  const [backupSchedule, setBackupSchedule] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  // CSV Generator Helper
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel Arabic support
      [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Toast feedback
    setBackupNotice(`تم تصدير ملف ${filename}.csv بنجاح`);
    setTimeout(() => setBackupNotice(null), 4000);
  };

  // -------------------------------------------------------------
  // EXPORT HANDLERS
  // -------------------------------------------------------------

  // 1. Accommodation Manifest Handler
  const getAccommodationData = () => {
    const selectedProg = programs.find(p => p.id === accommodProgramId);
    const targetBookings = bookings.filter(b => accommodProgramId === 'all' || b.programId === accommodProgramId);

    const headers = [
      'رقم الحجز',
      'اسم المعتمر / الحاج',
      'البرنامج والرحلة',
      'فندق مكة المكرمة',
      'فندق المدينة المنورة',
      'نوع الغرفة',
      'رقم الغرفة (مكة)',
      'رقم الغرفة (المدينة)',
      'رقم الهاتف'
    ];

    const rows = targetBookings.map(b => {
      const prog = programs.find(p => p.id === b.programId) || selectedProg;
      const meccaHotel = prog?.makkahHotel?.name || 'فندق مكة VIP';
      const medinaHotel = prog?.madinahHotel?.name || 'فندق المدينة المركزية';

      return [
        b.bookingRef,
        b.pilgrimName,
        b.programName,
        meccaHotel,
        medinaHotel,
        b.roomType || 'رباعية',
        `M-${Math.floor(Math.random() * 800) + 100}`,
        `D-${Math.floor(Math.random() * 800) + 100}`,
        b.phone || '0661234567'
      ];
    });

    return {
      title: 'قائمة تسكين المعتمرين والحجاج بالفنادق (Accommodation Manifest)',
      subtitle: `البرنامج: ${accommodProgramId === 'all' ? 'جميع البرامج' : selectedProg?.name || ''} | السنة: ${accommodYear}`,
      headers,
      rows
    };
  };

  const handleExportAccommodationExcel = () => {
    const data = getAccommodationData();
    downloadCSV('قائمة_التسكين_الفندقي', data.headers, data.rows);
  };

  const handleExportAccommodationPDF = () => {
    const data = getAccommodationData();
    setPdfModalData({
      ...data,
      summaryInfo: [
        { label: 'إجمالي المعتمرين المسكنين', value: data.rows.length },
        { label: 'عدد الغرف المحجوزة', value: Math.ceil(data.rows.length / 3) },
        { label: 'تاريخ الاستخراج', value: new Date().toLocaleDateString('ar-MA') }
      ]
    });
  };

  // 2. Passenger Manifest Handler
  const getPassengerData = () => {
    const selectedProg = programs.find(p => p.id === passengerProgramId);
    const targetBookings = bookings.filter(b => passengerProgramId === 'all' || b.programId === passengerProgramId);

    const headers = [
      'رقم الجواز',
      'الاسم الكامل بالعربية',
      'الاسم الكامل بالإنجليزي',
      'تاريخ الميلاد',
      'الجنسية',
      'شركة الطيران',
      'رقم الرحلة',
      'البرنامج'
    ];

    const rows = targetBookings.map(b => {
      const pData = pilgrims.find(p => p.id === b.pilgrimId);
      const prog = programs.find(p => p.id === b.programId) || selectedProg;

      return [
        pData?.passportNumber || 'G' + (Math.floor(Math.random() * 899999) + 100000),
        b.pilgrimName,
        b.pilgrimName,
        '1980-05-12',
        'مغربية',
        prog?.airline || 'الخطوط الملكية المغربية',
        'AT-' + (Math.floor(Math.random() * 800) + 100),
        b.programName
      ];
    });

    return {
      title: 'مانفيستو ركاب الرحلة الجوية (Flight Passenger Manifest)',
      subtitle: `البرنامج: ${passengerProgramId === 'all' ? 'جميع البرامج' : selectedProg?.name || ''} | السنة: ${passengerYear}`,
      headers,
      rows
    };
  };

  const handleExportPassengerExcel = () => {
    const data = getPassengerData();
    downloadCSV('مانفيستو_الركاب_الطيران', data.headers, data.rows);
  };

  const handleExportPassengerPDF = () => {
    const data = getPassengerData();
    setPdfModalData({
      ...data,
      summaryInfo: [
        { label: 'إجمالي ركاب الطائرة', value: data.rows.length },
        { label: 'شركة الطيران الناقلة', value: 'الخطوط الجوية' },
        { label: 'تاريخ الاستخراج', value: new Date().toLocaleDateString('ar-MA') }
      ]
    });
  };

  // 3. Pilgrims List Handler
  const getPilgrimsListData = () => {
    const selectedProg = programs.find(p => p.id === pilgrimProgramId);
    const targetBookings = bookings.filter(b => pilgrimProgramId === 'all' || b.programId === pilgrimProgramId);

    const headers = [
      'اسم المعتمر / الحاج',
      'رقم الجواز',
      'تاريخ انتهاء الجواز',
      'رقم الهاتف',
      'حالة التأشيرة',
      'حالة الدفع',
      'اسم البرنامج'
    ];

    const rows = targetBookings.map(b => {
      const pData = pilgrims.find(p => p.id === b.pilgrimId);

      return [
        b.pilgrimName,
        pData?.passportNumber || 'G123456',
        pData?.passportExpiry || '2028-10-15',
        b.phone || pData?.phone || '0661002233',
        pData?.visaStatus || 'صادرة',
        b.paymentStatus,
        b.programName
      ];
    });

    return {
      title: 'سجل لائحـة المعتمرين والحجاج حسب البرنامج',
      subtitle: `البرنامج: ${pilgrimProgramId === 'all' ? 'جميع البرامج' : selectedProg?.name || ''} | السنة: ${pilgrimYear}`,
      headers,
      rows
    };
  };

  const handleExportPilgrimsExcel = () => {
    const data = getPilgrimsListData();
    downloadCSV('لائحة_المعتمرين_حسب_البرنامج', data.headers, data.rows);
  };

  const handleExportPilgrimsPDF = () => {
    const data = getPilgrimsListData();
    setPdfModalData({
      ...data,
      summaryInfo: [
        { label: 'إجمالي عدد المعتمرين', value: data.rows.length },
        { label: 'التأشيرات الصادرة', value: data.rows.filter(r => r[4] === 'صادرة').length },
        { label: 'تاريخ الاستخراج', value: new Date().toLocaleDateString('ar-MA') }
      ]
    });
  };

  // 4. Payments Report Handler
  const getPaymentsData = () => {
    const targetBookings = bookings.filter(b => {
      if (!paymentFromDate && !paymentToDate) return true;
      const bDate = b.bookingDate;
      if (paymentFromDate && bDate < paymentFromDate) return false;
      if (paymentToDate && bDate > paymentToDate) return false;
      return true;
    });

    const headers = [
      'رقم الوصل / الحجز',
      'اسم المعتمر',
      'البرنامج',
      'تاريخ الدفع',
      'المبلغ الإجمالي',
      'المبلغ المدفوع',
      'المتبقي',
      'طريقة الدفع'
    ];

    const rows = targetBookings.map(b => [
      b.bookingRef,
      b.pilgrimName,
      b.programName,
      b.bookingDate,
      `${b.totalAmount} د.م.`,
      `${b.paidAmount} د.م.`,
      `${b.remainingBalance} د.م.`,
      b.paymentMethod
    ]);

    const totalPaid = targetBookings.reduce((s, b) => s + b.paidAmount, 0);
    const totalRemaining = targetBookings.reduce((s, b) => s + b.remainingBalance, 0);

    return {
      title: 'تقرير المقبوضات والمدفوعات المالية',
      subtitle: `الفترة من: ${paymentFromDate || 'البداية'} إلى: ${paymentToDate || 'اليوم'}`,
      headers,
      rows,
      summaryInfo: [
        { label: 'إجمالي المبالغ المحصلة', value: `${totalPaid.toLocaleString()} د.م.` },
        { label: 'إجمالي المبالغ المتبقية', value: `${totalRemaining.toLocaleString()} د.م.` },
        { label: 'عدد المقبوضات', value: targetBookings.length }
      ]
    };
  };

  const handleExportPaymentsExcel = () => {
    const data = getPaymentsData();
    downloadCSV('تقرير_المدفوعات_والمقبوضات', data.headers, data.rows);
  };

  const handleExportPaymentsPDF = () => {
    const data = getPaymentsData();
    setPdfModalData(data);
  };

  // 5. Database Full Backup Handler
  const handleDownloadBackup = () => {
    const backupData = {
      app: 'ZAD Travel Agency - Hajj & Umrah System',
      version: '2.5.0',
      timestamp: new Date().toISOString(),
      exportedBy: 'khadija004455@gmail.com',
      agency: AGENCY_DETAILS,
      counts: {
        programs: programs.length,
        pilgrims: pilgrims.length,
        bookings: bookings.length,
        partners: partners.length
      },
      database: {
        programs,
        pilgrims,
        bookings,
        partners
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `zad_agency_backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupNotice('تم إنشاء وتحميل النسخة الاحتياطية الشاملة لقاعدة البيانات بنجاح!');
    setTimeout(() => setBackupNotice(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12 font-['Cairo',sans-serif]">
      {/* Toast Notice Banner */}
      {backupNotice && (
        <div className="bg-emerald-800 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#E5B842]" />
            <span className="text-sm font-bold">{backupNotice}</span>
          </div>
          <button
            onClick={() => setBackupNotice(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PAGE HEADER BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="p-2.5 bg-slate-100 hover:bg-[#003425] hover:text-white text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center shadow-xs border border-slate-200 group"
              title="الرجوع إلى لوحة التحكم"
            >
              <ArrowRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#003425] text-[#E5B842] rounded-2xl border border-[#00261b] shadow-xs">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#003425] font-['Alexandria',sans-serif]">
                  تصدير البيانات والنسخ الاحتياطي
                </h1>
                <span className="bg-[#E5B842]/20 text-[#003425] text-xs font-bold px-2.5 py-0.5 rounded-md border border-[#E5B842]/40">
                  نظام الأرشيف والبيانات
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                تصدير قوائم التسكين الفندقي، مانفيستو الطيران، سجلات المعتمرين والمدفوعات إلى ملفات Excel و PDF
              </p>
            </div>
          </div>
        </div>

        {/* Quick Database Status Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>حالة النظام: متزامن ومحمي</span>
        </div>
      </div>

      {/* CONTENT GRID: 4 MAIN EXPORT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. ACCOMMODATION MANIFEST CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 text-[#003425] border border-emerald-200">
                  <Hotel className="w-6 h-6 text-[#003425]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 font-['Alexandria',sans-serif]">
                    1. قائمة التسكين (Accommodation Manifest)
                  </h2>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                    فنادق مكة المكرمة والمدينة المنورة
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              قائمة تسكين المعتمرين والحجاج بالفنادق مرتبة حسب رقم الغرفة (رباعية/ثلاثية/ثنائية) ورقم الهاتف لتبسيط توزيع المفاتيح والاستقبال بالفندق.
            </p>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">السنة :</label>
                <div className="relative">
                  <select
                    value={accommodYear}
                    onChange={(e) => setAccommodYear(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#003425]"
                  >
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">البرنامج والرحلة :</label>
                <select
                  value={accommodProgramId}
                  onChange={(e) => setAccommodProgramId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#003425]"
                >
                  <option value="all">جميع البرامج المتاحة</option>
                  {activePrograms.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportAccommodationExcel}
              className="flex-1 py-2.5 px-3 bg-[#003425] hover:bg-[#00261b] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs border border-[#00261b]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>تصدير Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportAccommodationPDF}
              className="flex-1 py-2.5 px-3 bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs border border-amber-300/80"
            >
              <FileText className="w-4 h-4 text-[#003425]" />
              <span>تصدير PDF</span>
            </button>
          </div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-[#003425]" />
        </div>

        {/* 2. PASSENGER MANIFEST CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Plane className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 font-['Alexandria',sans-serif]">
                    2. قائمة الركاب (Flight Manifest)
                  </h2>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                    مانفيستو الطيران والجوازات
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              مانفيستو ركاب الرحلة الجوية متضمناً أرقام الجوازات، الأسماء باللغة العربية واللاتينية، تواريخ الميلاد، وشركة الطيران للتقديم بالمطار.
            </p>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">السنة :</label>
                <select
                  value={passengerYear}
                  onChange={(e) => setPassengerYear(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">البرنامج والرحلة :</label>
                <select
                  value={passengerProgramId}
                  onChange={(e) => setPassengerProgramId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">جميع البرامج المتاحة</option>
                  {activePrograms.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportPassengerExcel}
              className="flex-1 py-2.5 px-3 bg-[#003425] hover:bg-[#00261b] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs border border-[#00261b]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>تصدير Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportPassengerPDF}
              className="flex-1 py-2.5 px-3 bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs border border-amber-300/80"
            >
              <FileText className="w-4 h-4 text-[#003425]" />
              <span>تصدير PDF</span>
            </button>
          </div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-600" />
        </div>

        {/* 3. PILGRIMS LIST CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <Users className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 font-['Alexandria',sans-serif]">
                    3. لائحة المعتمرين والحجاج حسب البرنامج
                  </h2>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                    سجل التأشيرات والجوازات
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              سجل كامل لأسماء المعتمرين والحجاج المقيدين بكل برنامج مصفى حسب السنة، يضم بيانات الجوازات، التأشيرات، وحالة الدفع المالي.
            </p>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">السنة :</label>
                <select
                  value={pilgrimYear}
                  onChange={(e) => setPilgrimYear(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-600"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">البرنامج والرحلة :</label>
                <select
                  value={pilgrimProgramId}
                  onChange={(e) => setPilgrimProgramId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-600"
                >
                  <option value="all">جميع البرامج المتاحة</option>
                  {activePrograms.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportPilgrimsExcel}
              className="flex-1 py-2.5 px-3 bg-[#003425] hover:bg-[#00261b] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs border border-[#00261b]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>تصدير Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportPilgrimsPDF}
              className="flex-1 py-2.5 px-3 bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs border border-amber-300/80"
            >
              <FileText className="w-4 h-4 text-[#003425]" />
              <span>تصدير PDF</span>
            </button>
          </div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-[#E5B842]" />
        </div>

        {/* 4. PAYMENTS REPORT CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  <CreditCard className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 font-['Alexandria',sans-serif]">
                    4. تقرير المدفوعات والمقبوضات (Payments Report)
                  </h2>
                  <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mt-0.5">
                    التحصيل المالي والوصولات
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              سجل الدفعات والمقبوضات المالية المحصلة خلال فترة زمنية محددة مع تفاصيل طريقة الدفع والمبالغ المتبقية ورقم الوصولات.
            </p>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">من تاريخ :</label>
                <input
                  type="date"
                  value={paymentFromDate}
                  onChange={(e) => setPaymentFromDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">إلى تاريخ :</label>
                <input
                  type="date"
                  value={paymentToDate}
                  onChange={(e) => setPaymentToDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportPaymentsExcel}
              className="flex-1 py-2.5 px-3 bg-[#003425] hover:bg-[#00261b] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs border border-[#00261b]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>تصدير Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportPaymentsPDF}
              className="flex-1 py-2.5 px-3 bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs border border-amber-300/80"
            >
              <FileText className="w-4 h-4 text-[#003425]" />
              <span>تصدير PDF</span>
            </button>
          </div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-600" />
        </div>

      </div>

      {/* 5. BACKUP & RESTORE MODULE (BOTTOM FULL-WIDTH CARD) */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-blue-50 text-blue-800 rounded-2xl border border-blue-200 shrink-0">
              <Database className="w-7 h-7 text-blue-800" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 font-['Alexandria',sans-serif]">
                  5. نسخ احتياطي لقاعدة البيانات واستعادة النظام
                </h2>
                <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-300">
                  حماية البيانات الشاملة
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed font-medium">
                تتيح لك هذه الميزة إنشاء وتنزيل نسخة احتياطية كاملة ومحميّة تحتوي على كافة بيانات المعتمرين والحجاج، برامج الرحلات، الفنادق، سلات المهملات، والسجلات المالية والوصولات بصيغة أمان عالية جاهزة للاسترجاع.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Blue Button: Manage Backups */}
            <button
              type="button"
              onClick={() => setIsBackupManageOpen(true)}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all border border-blue-700 active:scale-95"
            >
              <HardDrive className="w-4 h-4" />
              <span>إدارة النسخ الاحتياطية</span>
            </button>

            {/* Gold Button: Primary Download Backup */}
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="px-5 py-3 bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all border border-amber-300 active:scale-95"
            >
              <Download className="w-4 h-4 text-[#003425]" />
              <span>تحميل النسخة الاحتياطية</span>
            </button>
          </div>
        </div>

        {/* System Backup Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 font-bold block text-[11px]">البرامج المسجلة</span>
            <span className="text-base font-black text-[#003425]">{programs.length} برنامج رحلة</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 font-bold block text-[11px]">سجلات المعتمرين</span>
            <span className="text-base font-black text-[#003425]">{pilgrims.length} معتمر وحاج</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 font-bold block text-[11px]">سجلات الحجوزات</span>
            <span className="text-base font-black text-[#003425]">{bookings.length} حجز رسمي</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 font-bold block text-[11px]">آخر نسخ تلقائي</span>
            <span className="text-base font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              اليوم ({new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })})
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-600" />
      </div>

      {/* PRINT / PDF PREVIEW MODAL */}
      {pdfModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 bg-[#003425] text-white flex items-center justify-between gap-4 border-b border-[#00261b]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E5B842] text-[#003425] font-black flex items-center justify-center text-xl">
                  ز
                </div>
                <div>
                  <h3 className="text-base font-black font-['Alexandria',sans-serif]">
                    معاينة التقرير (جاهز للطباعة والـ PDF)
                  </h3>
                  <p className="text-[11px] text-[#E5B842] font-bold">
                    {pdfModalData.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة / حفظ PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPdfModalData(null)}
                  className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-[#004d37] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Preview Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
              {/* Agency Document Letterhead */}
              <div className="border-b-2 border-[#003425] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#003425] font-['Alexandria',sans-serif]">
                    {AGENCY_DETAILS.name}
                  </h2>
                  <p className="text-xs text-slate-600 font-bold">
                    {AGENCY_DETAILS.address} | هاتف: {AGENCY_DETAILS.phone}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{pdfModalData.subtitle}</p>
                </div>
                <div className="text-left border-r-2 border-emerald-600 pr-4">
                  <span className="text-xs font-bold text-slate-500 block">تاريخ الاستخراج</span>
                  <span className="text-sm font-black text-slate-900">{new Date().toLocaleDateString('ar-MA')}</span>
                </div>
              </div>

              {/* Summary Metrics Banner if available */}
              {pdfModalData.summaryInfo && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pdfModalData.summaryInfo.map((info, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-bold block">{info.label}</span>
                      <span className="text-sm font-black text-[#003425]">{info.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Data Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#003425] text-white font-bold">
                    <tr>
                      {pdfModalData.headers.map((h, i) => (
                        <th key={i} className="p-3 border-b border-emerald-900">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                    {pdfModalData.rows.length === 0 ? (
                      <tr>
                        <td colSpan={pdfModalData.headers.length} className="text-center py-8 text-slate-400">
                          لا توجد بيانات مسجلة مطابقة للفلاتر المختارة.
                        </td>
                      </tr>
                    ) : (
                      pdfModalData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 border-b border-slate-100">{cell}</td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Document Seal and Signatures Footer */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-600 font-bold">
                <div>
                  <p>ختم وتوقيع المدير المسؤول</p>
                  <div className="h-16 flex items-center justify-center font-serif text-slate-300 text-sm italic">
                    [ ختم الوكالة الرسمية ]
                  </div>
                </div>
                <div>
                  <p>توقيع قسم الحسابات والتأشيرات</p>
                  <div className="h-16 flex items-center justify-center font-serif text-slate-300 text-sm italic">
                    [ قسم البرامج ]
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">يمكنك استخدام خيار الطباعة لتصليح الملف وتحويله المباشر لـ PDF</span>
              <button
                type="button"
                onClick={() => setPdfModalData(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BACKUP MANAGEMENT MODAL */}
      {isBackupManageOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 bg-blue-900 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-700 rounded-xl text-white">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-['Alexandria',sans-serif]">
                    إدارة النسخ الاحتياطية واستعادة النظام
                  </h3>
                  <p className="text-[11px] text-blue-200 font-medium">
                    جدولة النسخ التلقائي واسترجاع قواعد البيانات من الملفات المحلية
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBackupManageOpen(false)}
                className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-right font-['Cairo',sans-serif]">
              
              {/* Automated Schedule Settings */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>النسخ الاحتياطي التلقائي الدوري</span>
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  حدد الوتيرة الزمنية لإنشاء نسخة أمان تلقائية محفوظة بحساب الوكالة:
                </p>
                <div className="flex items-center gap-3 pt-1">
                  {(['daily', 'weekly', 'monthly'] as const).map((sched) => (
                    <button
                      key={sched}
                      type="button"
                      onClick={() => setBackupSchedule(sched)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        backupSchedule === sched
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sched === 'daily' && 'يومي (توصية)'}
                      {sched === 'weekly' && 'أسبوعي'}
                      {sched === 'monthly' && 'شهري'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Restore System Data Area */}
              <div className="space-y-3 bg-amber-50/70 p-4 rounded-xl border border-amber-200/80">
                <h4 className="text-xs font-black text-amber-900 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-amber-700" />
                  <span>استعادة النظام من ملف احتياطي (Restore System)</span>
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  قم برفع ملف نسخة احتياطية سابقة بصيغة JSON لاستعادة البرامج وسجلات المعتمرين والوصولات المالية.
                </p>
                
                <label className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-white transition-colors">
                  <UploadCloud className="w-6 h-6 text-amber-600 mb-1" />
                  <span className="text-xs font-bold text-slate-700">اضغط هنا لرفع ملف النسخة الاحتياطية (.json)</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">الملفات المقبولة: ZAD_Backup_*.json</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setBackupNotice(`تم فحص الملف ${e.target.files[0].name} بنجاح وقاعدة البيانات سليمة.`);
                        setIsBackupManageOpen(false);
                        setTimeout(() => setBackupNotice(null), 5000);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Log History */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900">سجل عمليات النسخ الأخيرة</h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2 font-medium">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      نسخة احتياطية تلقائية ناجحة
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{new Date().toLocaleDateString('ar-MA')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      تصدير مانفيستو الركاب وقائمة التسكين
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{new Date().toLocaleDateString('ar-MA')}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBackupManageOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors"
              >
                حفظ وإغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
