import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Calendar,
  FileText,
  CreditCard,
  Search,
  Printer,
  ChevronLeft
} from 'lucide-react';
import { Pilgrim, Booking, Program, OperationAlert } from '../types';

interface OperationsAlertsViewProps {
  alerts: OperationAlert[];
  pilgrims: Pilgrim[];
  bookings: Booking[];
  programs: Program[];
  onSelectPilgrimTab: () => void;
  onSelectBookingTab: () => void;
}

export const OperationsAlertsView: React.FC<OperationsAlertsViewProps> = ({
  alerts,
  pilgrims,
  bookings,
  programs,
  onSelectPilgrimTab,
  onSelectBookingTab,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'حرج' | 'تحذير' | 'معلومة'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-generate alerts from current state to ensure realtime accuracy
  const computedAlerts: OperationAlert[] = [];

  // 1. Passport expiry warnings (< 6 months)
  const now = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(now.getMonth() + 6);

  pilgrims.forEach(p => {
    if (!p.inCorbeille && p.passportExpiry) {
      const expDate = new Date(p.passportExpiry);
      if (expDate <= sixMonthsFromNow) {
        computedAlerts.push({
          id: `alt-exp-${p.id}`,
          type: 'جواز سفر قريب الانتهاء',
          title: `انتهاء جواز المعتمر: ${p.fullName}`,
          description: `جواز السفر رقم (${p.passportNumber}) ينتهي بتاريخ ${p.passportExpiry}، وهو أقل من 6 أشهر المطلوب لفيزا السعودية.`,
          severity: 'حرج',
          targetId: p.id,
          targetName: p.fullName,
          date: p.passportExpiry,
        });
      }
    }

    // 2. Visa Pending Warnings
    if (!p.inCorbeille && (p.visaStatus === 'بانتظار الوثائق' || p.visaStatus === 'قيد المعالجة')) {
      computedAlerts.push({
        id: `alt-visa-${p.id}`,
        type: 'تأشيرة متأخرة',
        title: `تأشيرة بانتظار الاعتماد: ${p.fullName}`,
        description: `حالة التأشيرة حالياً (${p.visaStatus}). يرجى استكمال الصور والتأمين الصحي.`,
        severity: 'تحذير',
        targetId: p.id,
        targetName: p.fullName,
      });
    }
  });

  // 3. Overdue Payments Warnings
  bookings.forEach(b => {
    if (b.paymentStatus === 'متأخر في السداد' || (b.remainingBalance > 0 && b.paymentStatus === 'مدفوع جزئياً')) {
      computedAlerts.push({
        id: `alt-pay-${b.id}`,
        type: 'مبلغ مستحق',
        title: `الحاج/المعتمر: ${b.pilgrimName} — برنامج: ${b.programName}`,
        description: `حجز رقم (${b.bookingRef}) الخاص ببرنامج (${b.programName}) - المبلغ المتبقي للاستكمال: ${b.remainingBalance.toLocaleString()} د.م. من أصل ${b.totalAmount.toLocaleString()} د.م.`,
        severity: b.paymentStatus === 'متأخر في السداد' ? 'حرج' : 'تحذير',
        targetId: b.id,
        targetName: `${b.pilgrimName} (${b.programName})`,
      });
    }
  });

  // Combine custom alerts + computed alerts
  const allAlerts = [...alerts, ...computedAlerts];

  const filteredAlerts = allAlerts.filter(alt => {
    const matchesSev = selectedSeverity === 'all' || alt.severity === selectedSeverity;
    const matchesSearch = alt.title.includes(searchTerm) || alt.description.includes(searchTerm) || (alt.targetName && alt.targetName.includes(searchTerm));
    return matchesSev && matchesSearch;
  });

  const criticalCount = allAlerts.filter(a => a.severity === 'حرج').length;
  const warningCount = allAlerts.filter(a => a.severity === 'تحذير').length;
  const infoCount = allAlerts.filter(a => a.severity === 'معلومة').length;

  const handlePrintAlerts = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>تقرير تنبيهات العمليات والجوازات</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 25px; color: #111; }
          .header { text-align: center; border-bottom: 2px solid #1a4d41; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { color: #1a4d41; margin: 0; font-size: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: right; }
          th { background: #1a4d41; color: white; }
          .critical { color: #dc2626; font-weight: bold; }
          .warning { color: #d97706; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>وكالة زاد للسفر والسياحة - ZAD TRAVEL & TOURISM</h1>
          <p>تقرير تنبيهات الجوازات، التأشيرات، والمستحقات المالي المترتبة</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>نوع التنبيه</th>
              <th>درجة الخطورة</th>
              <th>العنوان والتفاصيل</th>
              <th>المعني بالطلب</th>
              <th>التاريخ المترتب</th>
            </tr>
          </thead>
          <tbody>
            ${allAlerts.map(alt => `
              <tr>
                <td>${alt.type}</td>
                <td class="${alt.severity === 'حرج' ? 'critical' : 'warning'}">${alt.severity}</td>
                <td><strong>${alt.title}</strong><br/><small>${alt.description}</small></td>
                <td>${alt.targetName || '-'}</td>
                <td>${alt.date || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#003425] to-[#004d37] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#00261b]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#E5B842]" />
            <h2 className="text-xl font-black font-['Alexandria',sans-serif]">
              تنبيهات العمليات والجوازات
            </h2>
          </div>
          <p className="text-xs text-emerald-100/80">
            تنبيهات تلقائية للجوازات القريبة من الانتهاء، التأشيرات المعلقة، والمستحقات المترتبة على الحجوزات.
          </p>
        </div>

        <button
          onClick={handlePrintAlerts}
          className="bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 border border-amber-200/60"
        >
          <Printer className="w-4 h-4 stroke-[2.5]" />
          <span>طباعة تقرير التنبيهات</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedSeverity('حرج')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedSeverity === 'حرج' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400' : 'bg-white border-slate-200 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">تنبيهات حرجة (جوازات)</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900 mt-2 font-['Alexandria',sans-serif]">
            {criticalCount}
          </p>
        </div>

        <div
          onClick={() => setSelectedSeverity('تحذير')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedSeverity === 'تحذير' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400' : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">تحذيرات (تأشيرات/دفعات)</span>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2 font-['Alexandria',sans-serif]">
            {warningCount}
          </p>
        </div>

        <div
          onClick={() => setSelectedSeverity('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedSeverity === 'all' ? 'bg-[#003425] text-white border-[#00261b]' : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${selectedSeverity === 'all' ? 'text-emerald-100' : 'text-slate-700'}`}>إجمالي التنبيهات</span>
            <Info className={`w-5 h-5 ${selectedSeverity === 'all' ? 'text-[#E5B842]' : 'text-slate-600'}`} />
          </div>
          <p className={`text-2xl font-black mt-2 font-['Alexandria',sans-serif] ${selectedSeverity === 'all' ? 'text-white' : 'text-slate-900'}`}>
            {allAlerts.length}
          </p>
        </div>
      </div>

      {/* Alerts List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث في التنبيهات..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#003425]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${selectedSeverity === 'all' ? 'bg-[#003425] text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedSeverity('حرج')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${selectedSeverity === 'حرج' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              الحرجة فقط
            </button>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">لا توجد تنبيهات حرج حالياً</p>
            <p className="text-xs text-slate-400">جميع جوازات السفر والتأشيرات والمدفوعات مستوفية الشروط.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map((alt) => {
              const isCritical = alt.severity === 'حرج';
              const isWarning = alt.severity === 'تحذير';

              return (
                <div
                  key={alt.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical ? 'bg-rose-100 text-rose-700' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {isCritical ? <AlertTriangle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isCritical ? 'bg-rose-100 text-rose-800' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {alt.type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm font-['Alexandria',sans-serif]">
                          {alt.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600">
                        {alt.description}
                      </p>
                      {alt.targetName && (
                        <p className="text-[11px] text-slate-500 font-medium">
                          الطرف المعني: <span className="font-bold text-slate-800">{alt.targetName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {alt.type.includes('جواز') || alt.type.includes('تأشيرة') ? (
                      <button
                        onClick={onSelectPilgrimTab}
                        className="bg-[#003425] hover:bg-[#004d37] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <span>سجل المعتمرين</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={onSelectBookingTab}
                        className="bg-[#003425] hover:bg-[#004d37] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <span>سجل الحجوزات</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
