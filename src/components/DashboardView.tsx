import React from 'react';
import {
  Calendar,
  Users,
  CreditCard,
  Banknote,
  TrendingUp,
  BarChart3,
  Download,
  Plane,
  Clock,
  ArrowRightLeft,
  ChevronLeft,
  Sparkles,
  Building2,
  FileCheck2,
  AlertCircle,
  Plus,
  Printer,
  ExternalLink
} from 'lucide-react';
import { DashboardStats, Program, Booking, Pilgrim } from '../types';

interface DashboardViewProps {
  stats: DashboardStats;
  programs: Program[];
  bookings: Booking[];
  pilgrims: Pilgrim[];
  setActiveTab: (tab: string) => void;
  onOpenNewProgram: () => void;
  onOpenNewPilgrim: () => void;
  onOpenNewBooking: () => void;
  onSelectBookingForInvoice?: (booking: Booking) => void;
  onOpenInvoice?: (booking: Booking) => void;
  onOpenDirectReceipt?: (booking: Booking) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  programs,
  bookings,
  pilgrims,
  setActiveTab,
  onOpenNewProgram,
  onOpenNewPilgrim,
  onOpenNewBooking,
  onSelectBookingForInvoice,
  onOpenInvoice,
  onOpenDirectReceipt,
}) => {
  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat('ar-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    }).format(amount).replace('د.م.', 'د.م.');
  };

  const upcomingTrips = programs.slice(0, 3);
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner / Welcome Hero */}
      <div className="bg-[#0F382E] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-[#1a4d41]">
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#1a4d41] border border-[#D4AF37]/30 px-3 py-1 rounded-full text-xs text-[#D4AF37] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              مرحباً بكم في نظام زَاد لسفريات الحج والعمرة 1447هـ
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Alexandria',sans-serif]">
              نظرة عامة ومؤشرات أداء الوكالة
            </h2>
            <p className="text-emerald-100/80 text-sm max-w-2xl leading-relaxed">
              تابع الحجوزات اليومية، وتتبع حالة تأشيرات المعتمرين، والتدفقات المالية مع خطط الرحلات المنطلقة من مطارات المملكة المغربية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('reports')}
              className="bg-[#1a4d41] hover:bg-[#235e50] text-[#E5B842] font-bold px-3.5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 border border-[#D4AF37]/40 shadow-sm transition-all active:scale-95"
            >
              <BarChart3 className="w-4 h-4 text-[#E5B842]" />
              <span>التقارير المحاسبية</span>
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className="bg-[#1a4d41] hover:bg-[#235e50] text-emerald-100 font-bold px-3.5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 border border-emerald-700/60 shadow-sm transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-[#E5B842]" />
              <span>تصدير البيانات</span>
            </button>
            <button
              onClick={onOpenNewProgram}
              className="bg-[#D4AF37] hover:bg-[#c49f2f] text-[#0F382E] font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all border border-amber-200/50 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء برنامج</span>
            </button>
            <button
              onClick={onOpenNewPilgrim}
              className="bg-[#1a4d41] hover:bg-[#235e50] text-white font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 border border-emerald-700/50 transition-all active:scale-95"
            >
              <Users className="w-4 h-4 text-[#D4AF37]" />
              <span>تسجيل معتمر</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Programs */}
        <div 
          onClick={() => setActiveTab('programs')}
          className="bg-white p-5 rounded-xl shadow-sm border-r-4 border-[#0F382E] border-slate-200/80 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">إجمالي البرامج</span>
            <div className="w-9 h-9 rounded-lg bg-[#0F382E]/10 text-[#0F382E] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-[#0F382E]">{stats.totalPrograms}</div>
            <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full">
              برامج نشطة
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">رحلات عمرة وحج لعام 2026/1447</p>
        </div>

        {/* Total Pilgrims */}
        <div 
          onClick={() => setActiveTab('pilgrims')}
          className="bg-white p-5 rounded-xl shadow-sm border-r-4 border-[#D4AF37] border-slate-200/80 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">الحجاج والمعتمرون</span>
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/20 text-[#0F382E] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-[#0F382E]">{stats.totalPilgrims}</div>
            <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full">
              مسجل بالمنظومة
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {stats.pendingVisas} بانتظار استكمال التأشيرة
          </p>
        </div>

        {/* Total Bookings */}
        <div 
          onClick={() => setActiveTab('bookings')}
          className="bg-white p-5 rounded-xl shadow-sm border-r-4 border-[#0F382E] border-slate-200/80 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">إجمالي الحجوزات</span>
            <div className="w-9 h-9 rounded-lg bg-[#0F382E]/10 text-[#0F382E] flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-[#0F382E]">{stats.totalBookings}</div>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
              حجز مؤكد
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">ربط الغرف والخدمات المالية</p>
        </div>

        {/* Total Revenue */}
        <div 
          onClick={() => setActiveTab('bookings')}
          className="bg-white p-5 rounded-xl shadow-sm border-r-4 border-[#D4AF37] border-slate-200/80 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">إجمالي الإيرادات (MAD)</span>
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/20 text-[#0F382E] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-bold text-[#0F382E]">{formatMAD(stats.totalRevenue)}</div>
            <span className="text-[10px] text-[#0F382E] font-bold bg-[#F4F7F6] px-2 py-0.5 rounded-full border border-emerald-900/10">
              درهم
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-green-700 font-bold">المدفوع: {formatMAD(stats.totalPaid)}</span>
            <span className="text-rose-600 font-bold">المتبقي: {formatMAD(stats.totalRevenue - stats.totalPaid)}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Trips & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Departures Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F382E]/10 text-[#0F382E] flex items-center justify-center font-bold">
                <Plane className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-[#0F382E]">الرحلات المنطلقة قريباً</h3>
            </div>
            <button 
              onClick={() => setActiveTab('programs')}
              className="text-xs font-bold text-[#0F382E] hover:text-[#1a4d41] flex items-center gap-1"
            >
              عرض جميع البرامج
              <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingTrips.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl p-8 border border-slate-200/80 shadow-sm text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#F4F7F6] text-[#0F382E] flex items-center justify-center font-bold">
                  <Plane className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h4 className="font-bold text-[#0F382E] text-sm">السجل فارغ - لا توجد رحلات برامج مسجلة</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  يمكنك إضافة أول برنامج رحلة عمرة أو حج لوكالتك وتحديد تكاليف الفنادق والطيران بسهولة.
                </p>
                <button
                  onClick={onOpenNewProgram}
                  className="bg-[#0F382E] hover:bg-[#1a4d41] text-white font-bold px-4 py-2 rounded-lg text-xs inline-flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" />
                  إضافة أول برنامج رحلة
                </button>
              </div>
            ) : (
              upcomingTrips.map((prog) => {
                const progPilgrims = pilgrims.filter(p => p.programId === prog.id);
                const activePilgrims = progPilgrims.filter(p => !p.inCorbeille && p.visaStatus !== 'ملغاة');
                const withdrawnCount = progPilgrims.filter(p => p.inCorbeille || p.visaStatus === 'ملغاة').length;
                const activeCount = activePilgrims.length;
                const totalSeats = prog.totalSeats || 1;
                const fillPercentage = Math.round((activeCount / totalSeats) * 100);
                const remainingSeats = Math.max(0, totalSeats - activeCount);
                const isFull = remainingSeats === 0;

                return (
                  <div 
                    key={prog.id}
                    className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:border-[#0F382E] transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#0F382E] bg-[#F4F7F6] border border-[#0F382E]/20 px-2.5 py-0.5 rounded-full">
                          {prog.type}
                        </span>
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {prog.travelDate}
                        </span>
                      </div>

                      <h4 className="font-bold text-[#0F382E] text-sm line-clamp-1 group-hover:text-[#1a4d41] transition-colors">
                        {prog.name}
                      </h4>

                      <div className="text-xs text-slate-600 space-y-1.5 bg-[#F4F7F6]/80 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">مدينة المغادرة:</span>
                          <span className="font-semibold text-slate-800">{prog.departureCity}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">شركة الطيران:</span>
                          <span className="font-semibold text-slate-800">{prog.airline}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">فندق مكة:</span>
                          <span className="font-semibold text-slate-800">{prog.makkahHotel.name}</span>
                        </div>
                      </div>

                      {/* 3 Coordinates metric blocks */}
                      <div className="grid grid-cols-3 gap-1 text-center pt-1 text-[10px]">
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block">السعة</span>
                          <strong className="text-slate-900 font-bold">{totalSeats}</strong>
                        </div>
                        <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                          <span className="text-emerald-700 block font-bold">المسجلون</span>
                          <strong className="text-emerald-900 font-bold">{activeCount}</strong>
                        </div>
                        <div className={`p-1.5 rounded-lg border ${
                          isFull ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-blue-50 border-blue-100 text-blue-800'
                        }`}>
                          <span className="block font-bold">المتبقي</span>
                          <strong className="font-bold">{remainingSeats}</strong>
                        </div>
                      </div>

                      {withdrawnCount > 0 && (
                        <div className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center justify-between">
                          <span>حالات انسحاب / إلغاء:</span>
                          <span className="font-bold">{withdrawnCount}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium">نسبة إكتمال المقاعد:</span>
                        <span className="font-bold text-[#0F382E]">
                          {activeCount} / {totalSeats} ({fillPercentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFull ? 'bg-rose-500' : fillPercentage > 85 ? 'bg-amber-500' : 'bg-[#0F382E]'
                          }`}
                          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#0F382E] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-[#0F382E]">اختصارات ومهمات سريعة</h3>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <button
              onClick={onOpenNewProgram}
              className="w-full p-3 bg-[#F4F7F6] hover:bg-emerald-50 hover:border-[#0F382E]/30 border border-slate-100 rounded-xl text-right transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0F382E] text-[#D4AF37] flex items-center justify-center shadow-sm font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F382E] group-hover:text-[#1a4d41]">إنشاء برنامج رحلة جديد</div>
                  <div className="text-[11px] text-slate-500">إضافة تكاليف الطيران، الفنادق وهامش الربح</div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-[#D4AF37]" />
            </button>

            <button
              onClick={onOpenNewPilgrim}
              className="w-full p-3 bg-[#F4F7F6] hover:bg-emerald-50 hover:border-[#0F382E]/30 border border-slate-100 rounded-xl text-right transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0F382E] text-white flex items-center justify-center shadow-sm font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F382E] group-hover:text-[#1a4d41]">تسجيل حاج / معتمر جديد</div>
                  <div className="text-[11px] text-slate-500">إدخال بياني جواز السفر وحالة التأشيرة</div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-[#D4AF37]" />
            </button>

            <button
              onClick={onOpenNewBooking}
              className="w-full p-3 bg-[#F4F7F6] hover:bg-emerald-50 hover:border-[#0F382E]/30 border border-slate-100 rounded-xl text-right transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#D4AF37] text-[#0F382E] flex items-center justify-center shadow-sm font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F382E] group-hover:text-[#1a4d41]">إصدار حجز وتوثيق الدفعات</div>
                  <div className="text-[11px] text-slate-500">ربط المعتمر بالبرنامج وتوليد وصل مالي</div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-[#D4AF37]" />
            </button>

            <button
              onClick={() => setActiveTab('partners')}
              className="w-full p-3 bg-[#F4F7F6] hover:bg-emerald-50 hover:border-[#0F382E]/30 border border-slate-100 rounded-xl text-right transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1a4d41] text-white flex items-center justify-center shadow-sm font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F382E] group-hover:text-[#1a4d41]">دليل الفنادق والشركاء</div>
                  <div className="text-[11px] text-slate-500">استعراض فنادق مكة والمدينة والأسعار</div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-[#D4AF37]" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings & Financial Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F382E]/10 text-[#0F382E] flex items-center justify-center font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F382E]">أحدث الحجوزات والوصلات المالية</h3>
              <p className="text-xs text-slate-500">قائمة الحجوزات المسجلة حديثاً وإمكانية طباعة الفاتورة الرسمية</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('bookings')}
            className="text-xs font-bold text-[#0F382E] hover:text-[#1a4d41] flex items-center gap-1"
          >
            إدارة كافة الحجوزات
            <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="bg-[#F4F7F6] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 border-b">رقم الحجز المرجعي</th>
                <th className="p-3.5 border-b">اسم الحاج / المعتمر</th>
                <th className="p-3.5 border-b">اسم البرنامج</th>
                <th className="p-3.5 border-b">نوع الغرفة</th>
                <th className="p-3.5 border-b">المبلغ الإجمالي</th>
                <th className="p-3.5 border-b">المدفوع</th>
                <th className="p-3.5 border-b">المتبقي</th>
                <th className="p-3.5 border-b">حالة السداد</th>
                <th className="p-3.5 border-b text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    لا توجد حجوزات مسجلة حالياً. يمكنك النقر على <strong className="text-[#0F382E]">"إصدار حجز وتوثيق الدفعات"</strong> أعلاه لبدء تسجيل حجزك الأول.
                  </td>
                </tr>
              ) : (
                recentBookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-[#F4F7F6]/60 transition-colors">
                    <td className="p-3.5 font-bold text-[#0F382E] dir-ltr text-right">
                      {bk.bookingRef}
                    </td>
                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900">{bk.pilgrimName}</div>
                      <div className="text-[10px] text-slate-500 font-mono dir-ltr text-right">{bk.passportNumber}</div>
                    </td>
                    <td className="p-3.5 max-w-[200px]">
                      <div className="font-bold text-[#0F382E] line-clamp-1" title={bk.programName}>{bk.programName}</div>
                      {bk.travelDate && <div className="text-[10px] text-slate-500">{bk.travelDate}</div>}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-[#F4F7F6] text-[#0F382E] px-2 py-0.5 rounded font-semibold text-[11px] border border-slate-200">
                        غرفة {bk.roomType}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-[#0F382E]">
                      {formatMAD(bk.totalAmount)}
                    </td>
                    <td className="p-3.5 font-semibold text-green-700">
                      {formatMAD(bk.paidAmount)}
                    </td>
                    <td className="p-3.5 font-semibold text-rose-600">
                      {formatMAD(bk.remainingBalance)}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        bk.paymentStatus === 'مدفوع بالكامل'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : bk.paymentStatus === 'مدفوع جزئياً'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {bk.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            if (onOpenDirectReceipt) {
                              onOpenDirectReceipt(bk);
                            } else if (onSelectBookingForInvoice) {
                              onSelectBookingForInvoice(bk);
                            }
                          }}
                          className="bg-green-800 hover:bg-green-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors shadow-xs flex items-center gap-1.5"
                          title="طباعة الوصل المالي الرسمي / Reçu de Paiement"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-300" />
                          <span>طباعة الوصل</span>
                        </button>
                        <a
                          href={`?receipt=${bk.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-500 hover:text-green-800 hover:bg-slate-100 rounded transition-colors"
                          title="فتح في صفحة مستقلة للطباعة عبر رابط مباشر (Lien direct)"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
