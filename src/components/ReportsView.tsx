import React, { useState } from 'react';
import {
  Program,
  Pilgrim,
  Booking,
  Partner
} from '../types';
import { AGENCY_DETAILS } from '../data/mockData';
import {
  ArrowRight,
  TrendingUp,
  Wallet,
  Receipt,
  Landmark,
  Scale,
  Printer,
  Download,
  Filter,
  Search,
  X,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  ShieldCheck,
  RefreshCw,
  FolderDown,
  Layers,
  ChevronDown
} from 'lucide-react';

interface ReportsViewProps {
  programs: Program[];
  pilgrims: Pilgrim[];
  bookings: Booking[];
  partners?: Partner[];
  onBackToDashboard: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  programs,
  pilgrims,
  bookings,
  partners = [],
  onBackToDashboard,
}) => {
  // Modal State for active detailed report
  const [activeReportModal, setActiveReportModal] = useState<
    'profit' | 'revenue' | 'expenses' | 'checks' | 'comparison' | null
  >(null);

  // Filters State
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // CALCULATE FINANCIAL METRICS
  const activePrograms = programs.filter((p) => !p.isArchived);

  // Filtered Bookings based on selected program and date
  const filteredBookings = bookings.filter((b) => {
    const matchesProgram = selectedProgramId === 'all' || b.programId === selectedProgramId;
    const matchesSearch =
      b.pilgrimName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.programName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProgram && matchesSearch;
  });

  // 1. Total Revenues (إجمالي الإيرادات)
  const totalRevenues = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  // Total Paid Amount (إجمالي المبالغ المحصلة)
  const totalPaid = filteredBookings.reduce((sum, b) => sum + b.paidAmount, 0);

  // Remaining Balance (إجمالي الذمم المتبقية)
  const remainingRevenues = totalRevenues - totalPaid;

  // 2. Total Estimated Costs (إجمالي التكاليف التقديرية)
  // Calculated from program cost breakdowns multiplied by booked seats (or total seats if booked is 0)
  const totalEstimatedCosts = (selectedProgramId === 'all' ? activePrograms : activePrograms.filter(p => p.id === selectedProgramId)).reduce(
    (sum, p) => {
      const seatsCount = p.bookedSeats > 0 ? p.bookedSeats : p.totalSeats > 0 ? p.totalSeats : 1;
      const cb = p.costBreakdown;
      const perSeatCost = cb ? (cb.flightCost + cb.hotelCost + cb.visaCost + cb.transportCost + cb.otherCost) : 0;
      return sum + perSeatCost * seatsCount;
    },
    0
  );

  // 3. Net Profit / Loss (صافي الربح / الخسارة)
  const netProfit = totalRevenues - totalEstimatedCosts;
  const profitMarginPercent = totalRevenues > 0 ? Math.round((netProfit / totalRevenues) * 100) : 0;

  // 4. Collection Rate (%) (نسبة التحصيل)
  const collectionRate = totalRevenues > 0 ? Math.round((totalPaid / totalRevenues) * 100) : 100;

  // CSV Export Helper
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel Arabic support
      [headers.join(','), ...rows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check data helper (Checks extracted from bookings with paymentMethod === 'شيك بنكي' or simulated checks)
  const checkBookings = filteredBookings.filter((b) => b.paymentMethod === 'شيك بنكي' || b.paymentStatus === 'مدفوع جزئياً');

  return (
    <div className="space-y-6 pb-12 font-['Cairo',sans-serif]">
      {/* HEADER BAR WITH TITLE & BACK BUTTON */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="p-2.5 bg-slate-100 hover:bg-[#003425] hover:text-white text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center shadow-xs border border-slate-200 group"
            title="الرجوع إلى لوحة التحكم الرئيسية"
          >
            <ArrowRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#003425] font-['Alexandria',sans-serif]">
                التقارير المحاسبية والمالية
              </h1>
              <span className="bg-[#E5B842]/20 text-[#003425] text-xs font-bold px-2.5 py-0.5 rounded-md border border-[#E5B842]/40">
                وكالة زاد
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              مركز إدارة التحليلات، ميزانيات البرامج، المداخيل والمصروفات والشيكات
            </p>
          </div>
        </div>

        {/* Action Controls & Program Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400 mr-2" />
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 p-1.5 focus:outline-none cursor-pointer"
            >
              <option value="all">جميع البرامج والرحلات ({activePrograms.length})</option>
              {activePrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">طباعة الموجز</span>
          </button>
        </div>
      </div>

      {/* TOP SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الإيرادات</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-['Alexandria',sans-serif]">
              {totalRevenues.toLocaleString()} <span className="text-xs font-bold text-slate-500">د.م.</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تحصيل {totalPaid.toLocaleString()} د.م. محصلة فعلياً</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-600 rounded-r-2xl" />
        </div>

        {/* Card 2: Total Estimated Costs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي التكاليف التقديرية</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-['Alexandria',sans-serif]">
              {totalEstimatedCosts.toLocaleString()} <span className="text-xs font-bold text-slate-500">د.م.</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-rose-700">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>فنادق وطيران وتأشيرات وحافلات</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-600 rounded-r-2xl" />
        </div>

        {/* Card 3: Net Profit / Loss */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-[#E5B842] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">صافي الربح المتوقع</span>
            <div className={`p-2.5 rounded-xl border ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black tracking-tight font-['Alexandria',sans-serif] ${netProfit >= 0 ? 'text-[#003425]' : 'text-rose-600'}`}>
              {netProfit.toLocaleString()} <span className="text-xs font-bold text-slate-500">د.م.</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-emerald-800">
              <span className="px-2 py-0.5 rounded-md bg-[#E5B842]/20 text-[#003425] border border-[#E5B842]/40">
                هامش الربح {profitMarginPercent}%
              </span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-[#E5B842] rounded-r-2xl" />
        </div>

        {/* Card 4: Collection Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">نسبة التحصيل النقدية</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-['Alexandria',sans-serif]">
              {collectionRate}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden border border-slate-200">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-bold mt-1.5">
              متبقي {remainingRevenues.toLocaleString()} د.م. قيد التحصيل
            </p>
          </div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-600 rounded-r-2xl" />
        </div>
      </div>

      {/* REPORT CARDS GRID SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-[#003425] font-['Alexandria',sans-serif] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#E5B842]" />
            <span>التقارير المحاسبية التفصيلية المتاحة</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">اختر التقرير للاطلاع على البيانات والطباعة والتصدير</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. PROFIT REPORT CARD */}
          <div
            onClick={() => setActiveReportModal('profit')}
            className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  تحليل الأرباح
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Alexandria',sans-serif] group-hover:text-emerald-800 transition-colors">
                  1. تقرير أرباح البرامج والرحلات
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
                  تحليل الربحية الصافية لكل برنامج رحلة على حدة، مقارنة أسعار التكلفة بسعر البيع، وحساب هامش الربح لكل معتمر.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                إجمالي الربح الصافي: <strong className="text-emerald-700">{netProfit.toLocaleString()} د.م.</strong>
              </span>
              <button
                type="button"
                className="px-3.5 py-1.5 bg-[#003425] hover:bg-[#00261b] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                عرض التقرير
              </button>
            </div>
          </div>

          {/* 2. REVENUE REPORT CARD */}
          <div
            onClick={() => setActiveReportModal('revenue')}
            className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  المداخيل والدفعات
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Alexandria',sans-serif] group-hover:text-blue-800 transition-colors">
                  2. تقرير الإيرادات والمطالبات
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
                  جدول تفصيلي للإيرادات المحصلة والمتبقية، توزيع المداخيل حسب وسائل الدفع (نقداً، تحويل، شيكات)، والذمم المالية.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                المحصل: <strong className="text-blue-700">{totalPaid.toLocaleString()} د.م.</strong>
              </span>
              <button
                type="button"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                عرض التقرير
              </button>
            </div>
          </div>

          {/* 3. EXPENSES REPORT CARD */}
          <div
            onClick={() => setActiveReportModal('expenses')}
            className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-rose-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Receipt className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  التكاليف التشغيلية
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Alexandria',sans-serif] group-hover:text-rose-800 transition-colors">
                  3. تقرير المصروفات والنفقات
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
                  سجل نفقات الفنادق بمكة والمدينة، تذاكر الطيران، التأشيرات السعودية، حافلات النقل، ومصاريف الإعاشة والمرافقين.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                إجمالي المصاريف: <strong className="text-rose-700">{totalEstimatedCosts.toLocaleString()} د.م.</strong>
              </span>
              <button
                type="button"
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                عرض التقرير
              </button>
            </div>
          </div>

          {/* 4. CHECK REPORT CARD */}
          <div
            onClick={() => setActiveReportModal('checks')}
            className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Landmark className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  المعاملات البنكية
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Alexandria',sans-serif] group-hover:text-amber-800 transition-colors">
                  4. تقرير الشيكات والتحويلات
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
                  متابعة الشيكات الواردة من المعتمرين والصادرة للموردين، حالات الصرف (مستحقة، مقبوضة، قيد التحصيل) ومواعيد الاستحقاق.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                سجلات الشيكات: <strong className="text-amber-800">{checkBookings.length} معاملات</strong>
              </span>
              <button
                type="button"
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                عرض التقرير
              </button>
            </div>
          </div>

          {/* 5. REVENUE VS EXPENSES COMPARISON REPORT CARD */}
          <div
            onClick={() => setActiveReportModal('comparison')}
            className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-2"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Scale className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  الموازنة المقارنة
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Alexandria',sans-serif] group-hover:text-indigo-800 transition-colors">
                  5. تقرير مقارنة الإيرادات مقابل المصروفات (Side-by-Side)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
                  مقارنة جانبية متوازنة لنسب المداخيل مقابل المصاريف لكل برنامج ورحلة وتحديد انحراف الميزانية ونسبة تغطية التكاليف التشغيلية.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                <span>الإيرادات: <strong className="text-emerald-700">{totalRevenues.toLocaleString()} د.م.</strong></span>
                <span>المصروفات: <strong className="text-rose-700">{totalEstimatedCosts.toLocaleString()} د.م.</strong></span>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                عرض التقرير المقارن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED INTERACTIVE MODALS FOR EACH REPORT */}
      {activeReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Print & Agency Header */}
            <div className="p-5 bg-[#003425] text-white flex items-center justify-between gap-4 border-b border-[#00261b]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E5B842] text-[#003425] font-black flex items-center justify-center text-xl">
                  ز
                </div>
                <div>
                  <h2 className="text-base font-black font-['Alexandria',sans-serif]">
                    {activeReportModal === 'profit' && 'تقرير أرباح البرامج والرحلات'}
                    {activeReportModal === 'revenue' && 'تقرير الإيرادات والمطالبات المالية'}
                    {activeReportModal === 'expenses' && 'تقرير المصروفات والنفقات التشغيلية'}
                    {activeReportModal === 'checks' && 'تقرير الشيكات والمعاملات البنكية'}
                    {activeReportModal === 'comparison' && 'تقرير مقارنة الإيرادات بالمصروفات'}
                  </h2>
                  <p className="text-[11px] text-[#E5B842] font-bold">
                    وكالة زاد للسفر والسياحة - مراكش | تاريخ التقرير: {new Date().toLocaleDateString('ar-MA')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#004d37] hover:bg-[#006045] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-600/40"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة</span>
                </button>

                <button
                  onClick={() => {
                    if (activeReportModal === 'profit') {
                      exportToCSV('تقرير_الأرباح', ['اسم البرنامج', 'الحجوزات', 'الإيرادات', 'التكاليف التقديرية', 'صافي الربح', 'نسبة الهامش'], 
                        activePrograms.map(p => {
                          const pBookings = bookings.filter(b => b.programId === p.id);
                          const rev = pBookings.reduce((sum, b) => sum + b.totalAmount, 0);
                          const cb = p.costBreakdown;
                          const cost = cb ? (cb.flightCost + cb.hotelCost + cb.visaCost + cb.transportCost + cb.otherCost) * (p.bookedSeats || 1) : 0;
                          return [p.name, p.bookedSeats, rev, cost, rev - cost, `${rev > 0 ? Math.round(((rev - cost)/rev)*100) : 0}%`];
                        })
                      );
                    } else if (activeReportModal === 'revenue') {
                      exportToCSV('تقرير_الإيرادات', ['مرجع الحجز', 'اسم المعتمر', 'البرنامج', 'المبلغ الإجمالي', 'المبلغ المدفوع', 'المتبقي', 'طريقة الدفع', 'الحالة'],
                        filteredBookings.map(b => [b.bookingRef, b.pilgrimName, b.programName, b.totalAmount, b.paidAmount, b.remainingBalance, b.paymentMethod, b.paymentStatus])
                      );
                    } else if (activeReportModal === 'expenses') {
                      exportToCSV('تقرير_المصروفات', ['الرحلة / البرنامج', 'طيران', 'فنادق مكة والمدينة', 'التأشيرات', 'النقل والمزارات', 'المصاريف الإدارية', 'مجموع التكلفة'],
                        activePrograms.map(p => {
                          const cb = p.costBreakdown || { flightCost: 0, hotelCost: 0, visaCost: 0, transportCost: 0, otherCost: 0 };
                          const seats = p.bookedSeats || 1;
                          return [p.name, cb.flightCost * seats, cb.hotelCost * seats, cb.visaCost * seats, cb.transportCost * seats, cb.otherCost * seats, (cb.flightCost + cb.hotelCost + cb.visaCost + cb.transportCost + cb.otherCost) * seats];
                        })
                      );
                    } else if (activeReportModal === 'checks') {
                      exportToCSV('تقرير_الشيكات', ['مرجع الحجز', 'اسم العميل', 'المبلغ', 'طريقة الدفع', 'حالة الدفع', 'تاريخ الحجز'],
                        checkBookings.map(b => [b.bookingRef, b.pilgrimName, b.paidAmount, b.paymentMethod, b.paymentStatus, b.bookingDate])
                      );
                    } else if (activeReportModal === 'comparison') {
                      exportToCSV('تقرير_المقارنة', ['البرنامج', 'الإيرادات المتوقعة', 'المصروفات المقدرة', 'الفارق الصافي', 'نسبة التغطية'],
                        activePrograms.map(p => {
                          const rev = bookings.filter(b => b.programId === p.id).reduce((s, b) => s + b.totalAmount, 0);
                          const cb = p.costBreakdown;
                          const exp = cb ? (cb.flightCost + cb.hotelCost + cb.visaCost + cb.transportCost + cb.otherCost) * (p.bookedSeats || 1) : 0;
                          return [p.name, rev, exp, rev - exp, `${exp > 0 ? Math.round((rev / exp) * 100) : 0}%`];
                        })
                      );
                    }
                  }}
                  className="px-3 py-1.5 bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير CSV</span>
                </button>

                <button
                  onClick={() => setActiveReportModal(null)}
                  className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-[#004d37] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {/* 1. PROFIT REPORT DETAIL MODAL */}
              {activeReportModal === 'profit' && (
                <div className="space-y-6">
                  {/* Summary Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-xs text-slate-500 font-bold block">مجموع الإيرادات المحصلة</span>
                      <span className="text-xl font-black text-emerald-900 font-['Alexandria',sans-serif]">{totalRevenues.toLocaleString()} د.م.</span>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-xs text-slate-500 font-bold block">مجموع التكاليف التقديرية</span>
                      <span className="text-xl font-black text-rose-900 font-['Alexandria',sans-serif]">{totalEstimatedCosts.toLocaleString()} د.م.</span>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-xs text-slate-500 font-bold block">صافي ربح الوكالة</span>
                      <span className="text-xl font-black text-emerald-800 font-['Alexandria',sans-serif]">{netProfit.toLocaleString()} د.م. ({profitMarginPercent}%)</span>
                    </div>
                  </div>

                  {/* Programs Profit Breakdown Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#003425] text-white font-bold">
                        <tr>
                          <th className="p-3">اسم البرنامج</th>
                          <th className="p-3">نوع البرنامج</th>
                          <th className="p-3">المقاعد المكتتبة</th>
                          <th className="p-3">مجموع الإيراد</th>
                          <th className="p-3">التكلفة التقديرية</th>
                          <th className="p-3">صافي الربح</th>
                          <th className="p-3 text-center">الهامش %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                        {activePrograms.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-slate-400">لا توجد برامج مسجلة حالياً لإنشاء تحليل الأرباح.</td>
                          </tr>
                        ) : (
                          activePrograms.map((prog) => {
                            const progBookings = bookings.filter((b) => b.programId === prog.id);
                            const rev = progBookings.reduce((sum, b) => sum + b.totalAmount, 0);
                            const cb = prog.costBreakdown;
                            const costPerSeat = cb ? cb.flightCost + cb.hotelCost + cb.visaCost + cb.transportCost + cb.otherCost : 0;
                            const seatsCount = prog.bookedSeats > 0 ? prog.bookedSeats : 1;
                            const totalCost = costPerSeat * seatsCount;
                            const profit = rev - totalCost;
                            const margin = rev > 0 ? Math.round((profit / rev) * 100) : 0;

                            return (
                              <tr key={prog.id} className="hover:bg-slate-50">
                                <td className="p-3 font-bold text-[#003425]">{prog.name}</td>
                                <td className="p-3">{prog.type}</td>
                                <td className="p-3">{prog.bookedSeats} / {prog.totalSeats}</td>
                                <td className="p-3 font-bold text-slate-900">{rev.toLocaleString()} د.م.</td>
                                <td className="p-3 text-rose-700">{totalCost.toLocaleString()} د.م.</td>
                                <td className={`p-3 font-black ${profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                  {profit.toLocaleString()} د.م.
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded font-bold ${margin >= 15 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                                    {margin}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. REVENUE REPORT DETAIL MODAL */}
              {activeReportModal === 'revenue' && (
                <div className="space-y-6">
                  {/* Payment Methods Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[11px] text-slate-500 font-bold block">نقداً</span>
                      <span className="text-base font-black text-emerald-900">
                        {filteredBookings.filter(b => b.paymentMethod === 'نقداً').reduce((s, b) => s + b.paidAmount, 0).toLocaleString()} د.م.
                      </span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="text-[11px] text-slate-500 font-bold block">تحويل بنكي</span>
                      <span className="text-base font-black text-blue-900">
                        {filteredBookings.filter(b => b.paymentMethod === 'تحويل بنكي').reduce((s, b) => s + b.paidAmount, 0).toLocaleString()} د.م.
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-[11px] text-slate-500 font-bold block">شيكات بنكية</span>
                      <span className="text-base font-black text-amber-900">
                        {filteredBookings.filter(b => b.paymentMethod === 'شيك بنكي').reduce((s, b) => s + b.paidAmount, 0).toLocaleString()} د.م.
                      </span>
                    </div>
                    <div className="p-3 bg-[#E5B842]/20 rounded-xl border border-[#E5B842]/40">
                      <span className="text-[11px] text-slate-500 font-bold block">المتبقي الذمم</span>
                      <span className="text-base font-black text-[#003425]">
                        {remainingRevenues.toLocaleString()} د.م.
                      </span>
                    </div>
                  </div>

                  {/* Revenue Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#003425] text-white font-bold">
                        <tr>
                          <th className="p-3">مرجع الحجز</th>
                          <th className="p-3">اسم المعتمر</th>
                          <th className="p-3">البرنامج</th>
                          <th className="p-3">الإجمالي</th>
                          <th className="p-3">المدفوع</th>
                          <th className="p-3">المتبقي</th>
                          <th className="p-3">طريقة الدفع</th>
                          <th className="p-3 text-center">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-slate-400">لا توجد حجوزات أو مداخيل مسجلة.</td>
                          </tr>
                        ) : (
                          filteredBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-emerald-800">{b.bookingRef}</td>
                              <td className="p-3 font-bold text-slate-900">{b.pilgrimName}</td>
                              <td className="p-3 text-slate-600">{b.programName}</td>
                              <td className="p-3 font-bold">{b.totalAmount.toLocaleString()} د.م.</td>
                              <td className="p-3 text-emerald-700 font-bold">{b.paidAmount.toLocaleString()} د.م.</td>
                              <td className="p-3 text-rose-600 font-bold">{b.remainingBalance.toLocaleString()} د.م.</td>
                              <td className="p-3">{b.paymentMethod}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  b.paymentStatus === 'مدفوع بالكامل' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {b.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. EXPENSES REPORT DETAIL MODAL */}
              {activeReportModal === 'expenses' && (
                <div className="space-y-6">
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#003425] text-white font-bold">
                        <tr>
                          <th className="p-3">اسم البرنامج</th>
                          <th className="p-3">تكلفة الطيران</th>
                          <th className="p-3">فنادق مكة والمدينة</th>
                          <th className="p-3">التأشيرة والتأمين</th>
                          <th className="p-3">النقل والمزارات</th>
                          <th className="p-3">الإعاشة والمؤطرين</th>
                          <th className="p-3 font-black">مجموع التكلفة التقديرية</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                        {activePrograms.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-slate-400">لا توجد مصاريف برامج مسجلة.</td>
                          </tr>
                        ) : (
                          activePrograms.map((p) => {
                            const cb = p.costBreakdown || { flightCost: 0, hotelCost: 0, visaCost: 0, transportCost: 0, otherCost: 0 };
                            const seats = p.bookedSeats > 0 ? p.bookedSeats : 1;
                            const totalProgCost = (cb.flightCost + cb.hotelCost + cb.visaCost + cb.transportCost + cb.otherCost) * seats;

                            return (
                              <tr key={p.id} className="hover:bg-slate-50">
                                <td className="p-3 font-bold text-[#003425]">{p.name} ({p.bookedSeats} مقعد)</td>
                                <td className="p-3">{(cb.flightCost * seats).toLocaleString()} د.م.</td>
                                <td className="p-3">{(cb.hotelCost * seats).toLocaleString()} د.م.</td>
                                <td className="p-3">{(cb.visaCost * seats).toLocaleString()} د.م.</td>
                                <td className="p-3">{(cb.transportCost * seats).toLocaleString()} د.م.</td>
                                <td className="p-3">{(cb.otherCost * seats).toLocaleString()} د.م.</td>
                                <td className="p-3 font-black text-rose-700">{totalProgCost.toLocaleString()} د.م.</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. CHECKS REPORT DETAIL MODAL */}
              {activeReportModal === 'checks' && (
                <div className="space-y-6">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-center gap-3 text-xs text-amber-900 font-medium">
                    <Landmark className="w-5 h-5 text-amber-700 flex-shrink-0" />
                    <p>
                      يتضمن هذا التقرير جميع المعاملات البنكية والشيكات المقبوضة من المعتمرين والحجاج لصالح وكالة زاد، مع تواريخ الصرف والمبالغ المستحقة.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#003425] text-white font-bold">
                        <tr>
                          <th className="p-3">رقم الحجز</th>
                          <th className="p-3">اسم المعتمر/العميل</th>
                          <th className="p-3">المبلغ (د.م.)</th>
                          <th className="p-3">طريقة الدفع</th>
                          <th className="p-3">تاريخ الحجز</th>
                          <th className="p-3 text-center">حالة الصرف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                        {checkBookings.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-400">لا توجد معاملات شيكات بنكية مسجلة حالياً.</td>
                          </tr>
                        ) : (
                          checkBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-amber-900">{b.bookingRef}</td>
                              <td className="p-3 font-bold text-slate-900">{b.pilgrimName}</td>
                              <td className="p-3 font-black text-[#003425]">{b.paidAmount.toLocaleString()} د.م.</td>
                              <td className="p-3">{b.paymentMethod}</td>
                              <td className="p-3">{b.bookingDate}</td>
                              <td className="p-3 text-center">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  قيد التحصيل / محصل
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. COMPARISON REPORT DETAIL MODAL */}
              {activeReportModal === 'comparison' && (
                <div className="space-y-6">
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 flex items-center gap-3 text-xs text-indigo-900 font-medium">
                    <Scale className="w-5 h-5 text-indigo-700 flex-shrink-0" />
                    <p>
                      مقارنة مباشرة ومتوازنة بين إجمالي المداخيل المحصلة والتكاليف التشغيلية المقدرة لكل برنامج، لحساب مؤشر التغطية المالية ونسبة الربح الصافية.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#003425] text-white font-bold">
                        <tr>
                          <th className="p-3">اسم البرنامج</th>
                          <th className="p-3">تاريخ السفر</th>
                          <th className="p-3">الإيرادات (A)</th>
                          <th className="p-3">المصروفات (B)</th>
                          <th className="p-3">الفارق الصافي (A - B)</th>
                          <th className="p-3 text-center">مؤشر التغطية %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                        {activePrograms.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-400">لا توجد برامج للمقارنة.</td>
                          </tr>
                        ) : (
                          activePrograms.map((p) => {
                            const rev = bookings.filter((b) => b.programId === p.id).reduce((s, b) => s + b.totalAmount, 0);
                            const cb = p.costBreakdown;
                            const exp = cb ? (cb.flightCost + cb.hotelCost + cb.visaCost + cb.transportCost + cb.otherCost) * (p.bookedSeats || 1) : 0;
                            const diff = rev - exp;
                            const coverage = exp > 0 ? Math.round((rev / exp) * 100) : 0;

                            return (
                              <tr key={p.id} className="hover:bg-slate-50">
                                <td className="p-3 font-bold text-[#003425]">{p.name}</td>
                                <td className="p-3">{p.travelDate}</td>
                                <td className="p-3 font-bold text-emerald-700">{rev.toLocaleString()} د.م.</td>
                                <td className="p-3 font-bold text-rose-700">{exp.toLocaleString()} د.م.</td>
                                <td className={`p-3 font-black ${diff >= 0 ? 'text-emerald-800' : 'text-rose-600'}`}>
                                  {diff.toLocaleString()} د.م.
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded font-bold ${coverage >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                    {coverage}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>نظام إدارة الحج والعمرة - وكالة زاد للسفر والسياحة</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveReportModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors"
              >
                إغلاق التقرير
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
