import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Printer,
  FileCheck,
  DollarSign,
  Download,
  ShieldCheck,
  Calendar,
  CreditCard,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Phone,
  MapPin,
  X,
  FileText,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Booking, Pilgrim, Program } from '../types';
import { AGENCY_DETAILS } from '../data/mockData';
import { PaymentReceiptModal } from './PaymentReceiptModal';

interface PaymentsViewProps {
  bookings: Booking[];
  pilgrims: Pilgrim[];
  programs: Program[];
  onOpenNewBooking: () => void;
  selectedInvoiceBooking: Booking | null;
  setSelectedInvoiceBooking: (booking: Booking | null) => void;
  onUpdateBooking: (id: string, booking: Partial<Booking>) => Promise<void>;
  onDeleteBooking: (id: string) => Promise<void>;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  bookings,
  pilgrims,
  programs,
  onOpenNewBooking,
  selectedInvoiceBooking,
  setSelectedInvoiceBooking,
  onUpdateBooking,
  onDeleteBooking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('الكل');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('الكل');

  // Compute financial totals
  const totalInvoiced = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPaid = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalRemaining = bookings.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

  const fullyPaidCount = bookings.filter((b) => b.paymentStatus === 'مدفوع بالكامل').length;
  const partialPaidCount = bookings.filter((b) => b.paymentStatus === 'مدفوع جزئياً').length;
  const unpaidCount = bookings.filter((b) => b.paymentStatus === 'بانتظار السداد').length;

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.pilgrimName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.passportNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'الكل' || b.paymentStatus === selectedStatus;

    const matchesMethod =
      selectedPaymentMethod === 'الكل' || b.paymentMethod === selectedPaymentMethod;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat('ar-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F382E] bg-[#F4F7F6] px-2.5 py-1 rounded-full w-fit mb-1 border border-emerald-900/10">
            <Receipt className="w-3.5 h-3.5 text-[#D4AF37]" />
            سجل المدفوعات والفواتير الرسمية
          </div>
          <h2 className="text-2xl font-black text-[#0F382E] font-['Alexandria',sans-serif]">
            إدارة الفواتير والتحصيلات المالية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة المقبوضات المالية، طباعة إيصالات السداد، وتدقيق المستحقات للعملاء
          </p>
        </div>

        <button
          onClick={onOpenNewBooking}
          className="bg-[#D4AF37] hover:bg-[#c49f2f] text-[#0F382E] font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all border border-amber-300/60 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#0F382E]" />
          <span>إصدار فاتورة / وصل جديد</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>مجموع المبالغ المفلترة</span>
            <div className="w-8 h-8 rounded-lg bg-[#0F382E]/10 text-[#0F382E] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-[#0F382E]">{formatMAD(totalInvoiced)}</p>
          <p className="text-[11px] text-slate-500">إجمالي قيمة الحجوزات الصادرة</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200/80 shadow-sm space-y-2 bg-gradient-to-br from-emerald-50/40 to-transparent">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span>المبالغ المحصلة (المقبوضة)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-800">{formatMAD(totalPaid)}</p>
          <p className="text-[11px] text-emerald-700 font-medium">{fullyPaidCount} حجز مكتمل السداد</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200/80 shadow-sm space-y-2 bg-gradient-to-br from-amber-50/40 to-transparent">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>المبالغ المتبقية للتحصيل</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-900">{formatMAD(totalRemaining)}</p>
          <p className="text-[11px] text-amber-800 font-medium">{partialPaidCount} حجز بدفعة جزئية</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>إجمالي الفواتير الصادرة</span>
            <div className="w-8 h-8 rounded-lg bg-[#0F382E]/10 text-[#0F382E] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-[#0F382E]">{bookings.length} فاتورة</p>
          <p className="text-[11px] text-rose-600 font-medium">{unpaidCount} فاتورة غير مدفوعة</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث برقم الفاتورة، اسم المعتمر، البرنامج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs bg-[#F4F7F6] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F382E] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F4F7F6] border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none focus:border-[#0F382E]"
          >
            <option value="الكل">جميع حالات السداد</option>
            <option value="مدفوع بالكامل">مدفوع بالكامل</option>
            <option value="دفعة أولى">دفعة أولى / جزئي</option>
            <option value="غير مدفوع">غير مدفوع</option>
          </select>

          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F4F7F6] border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none focus:border-[#0F382E]"
          >
            <option value="الكل">جميع طرق الدفع</option>
            <option value="نقداً (Cash)">نقداً (Cash)</option>
            <option value="تحويل بنكي">تحويل بنكي</option>
            <option value="شيك بنكي">شيك بنكي</option>
            <option value="بطاقة بانكية">بطاقة بانكية</option>
          </select>
        </div>
      </div>

      {/* Payments & Invoices Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="bg-[#F4F7F6] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 border-b">رقم الفاتورة</th>
                <th className="p-3.5 border-b">اسم الحاج / المعتمر</th>
                <th className="p-3.5 border-b">اسم البرنامج</th>
                <th className="p-3.5 border-b">تاريخ الوصل</th>
                <th className="p-3.5 border-b">المبلغ الإجمالي</th>
                <th className="p-3.5 border-b">المدفوع</th>
                <th className="p-3.5 border-b">المتبقي</th>
                <th className="p-3.5 border-b">طريقة الدفع</th>
                <th className="p-3.5 border-b">الحالة</th>
                <th className="p-3.5 border-b text-center">الطباعة / الوصل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => {
                  const remaining = b.totalAmount - b.paidAmount;
                  return (
                    <tr key={b.id} className="hover:bg-[#F4F7F6]/60 transition-colors">
                      <td className="p-3.5 font-bold text-[#0F382E] dir-ltr text-right">
                        {b.bookingRef}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0F382E]/10 text-[#0F382E] flex items-center justify-center font-bold text-xs shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{b.pilgrimName}</div>
                            <div className="text-[10px] text-slate-500 font-mono dir-ltr text-right">جواز: {b.passportNumber}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 max-w-[200px]">
                        <div className="font-bold text-[#0F382E] line-clamp-1" title={b.programName}>
                          {b.programName}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">غرفة {b.roomType}</span>
                          {b.travelDate && <span>• {b.travelDate}</span>}
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-600 dir-ltr text-right">
                        {b.bookingDate}
                      </td>

                      <td className="p-3.5 font-bold text-slate-900">
                        {formatMAD(b.totalAmount)}
                      </td>

                      <td className="p-3.5 font-bold text-emerald-800">
                        {formatMAD(b.paidAmount)}
                      </td>

                      <td className="p-3.5 font-bold text-slate-700">
                        {remaining > 0 ? (
                          <span className="text-amber-800">{formatMAD(remaining)}</span>
                        ) : (
                          <span className="text-emerald-700">0 درهم</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                          {b.paymentMethod}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                          b.paymentStatus === 'مدفوع بالكامل'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : b.paymentStatus === 'مدفوع جزئياً'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : b.paymentStatus === 'متأخر في السداد'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                            : 'bg-slate-100 text-slate-800 border border-slate-300'
                        }`}>
                          {b.paymentStatus === 'مدفوع بالكامل' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {b.paymentStatus === 'مدفوع جزئياً' && <Clock className="w-3 h-3 text-amber-600" />}
                          {b.paymentStatus === 'متأخر في السداد' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          {b.paymentStatus === 'بانتظار السداد' && <AlertCircle className="w-3 h-3 text-slate-500" />}
                          {b.paymentStatus}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedInvoiceBooking(b)}
                            className="bg-[#F4F7F6] hover:bg-[#0F382E] hover:text-white text-[#0F382E] font-bold px-3 py-1.5 rounded-md border border-slate-200 transition-colors text-[11px] inline-flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>طباعة الفاتورة</span>
                          </button>
                          <button
                            onClick={() => onDeleteBooking(b.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف الحجز / الفاتورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    لا توجد فواتير أو مدفوعات مطابقة للشروط
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Receipt / Invoice Modal */}
      {selectedInvoiceBooking && (
        <PaymentReceiptModal
          booking={selectedInvoiceBooking}
          program={programs.find(p => p.id === selectedInvoiceBooking.programId || (p.name && p.name === selectedInvoiceBooking.programName))}
          pilgrim={pilgrims.find(p => p.id === selectedInvoiceBooking.pilgrimId || (p.passportNumber && p.passportNumber === selectedInvoiceBooking.passportNumber) || (p.fullName && p.fullName === selectedInvoiceBooking.pilgrimName))}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}
    </div>
  );
};
