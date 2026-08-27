import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  FileCheck,
  Building2,
  Phone,
  MapPin,
  X,
  CheckCircle2,
  DollarSign,
  Download,
  QrCode,
  ShieldCheck,
  Edit,
  Trash2,
  Calendar,
  User,
  AlertTriangle,
  AlertCircle,
  Clock,
  Send,
  BellRing,
  Wallet,
  TrendingUp,
  Filter,
  ExternalLink
} from 'lucide-react';
import { Booking, Pilgrim, Program, PaymentStatus } from '../types';
import { AGENCY_DETAILS } from '../data/mockData';
import { PaymentReceiptModal } from './PaymentReceiptModal';

interface BookingsViewProps {
  bookings: Booking[];
  pilgrims: Pilgrim[];
  programs: Program[];
  preselectedPilgrim?: Pilgrim | null;
  onClearPreselectedPilgrim?: () => void;
  onCreateBooking: (booking: Omit<Booking, 'id' | 'bookingRef'>) => Promise<void>;
  onUpdateBooking: (id: string, booking: Partial<Booking>) => Promise<void>;
  onDeleteBooking: (id: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedInvoiceBooking: Booking | null;
  setSelectedInvoiceBooking: (booking: Booking | null) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  pilgrims,
  programs,
  preselectedPilgrim,
  onClearPreselectedPilgrim,
  onCreateBooking,
  onUpdateBooking,
  onDeleteBooking,
  isModalOpen,
  setIsModalOpen,
  selectedInvoiceBooking,
  setSelectedInvoiceBooking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('الكل');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Payment Status Summary Metrics
  const fullyPaidList = bookings.filter(b => b.paymentStatus === 'مدفوع بالكامل');
  const partiallyPaidList = bookings.filter(b => b.paymentStatus === 'مدفوع جزئياً');
  const overdueList = bookings.filter(b => b.paymentStatus === 'متأخر في السداد');
  const pendingList = bookings.filter(b => b.paymentStatus === 'بانتظار السداد');

  const fullyPaidTotal = fullyPaidList.reduce((sum, b) => sum + b.paidAmount, 0);
  const partiallyPaidCollected = partiallyPaidList.reduce((sum, b) => sum + b.paidAmount, 0);
  const partiallyPaidRemaining = partiallyPaidList.reduce((sum, b) => sum + b.remainingBalance, 0);
  const overdueRemaining = overdueList.reduce((sum, b) => sum + b.remainingBalance, 0);
  const pendingTotal = pendingList.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalUncollected = bookings.reduce((sum, b) => sum + b.remainingBalance, 0);

  // Helper to extract the exact room / program price
  const getProgramPrice = (
    prog?: Program,
    roomType: 'خماسية' | 'رباعية' | 'ثلاثية' | 'ثنائية' | 'فردية' = 'رباعية'
  ): number => {
    if (!prog) return 15525;
    
    if (prog.roomPricing) {
      if (roomType === 'خماسية' && prog.roomPricing.quintuple && prog.roomPricing.quintuple > 0) {
        return prog.roomPricing.quintuple;
      }
      if (roomType === 'رباعية' && prog.roomPricing.quad && prog.roomPricing.quad > 0) {
        return prog.roomPricing.quad;
      }
      if (roomType === 'ثلاثية' && prog.roomPricing.triple && prog.roomPricing.triple > 0) {
        return prog.roomPricing.triple;
      }
      if (roomType === 'ثنائية' && prog.roomPricing.double && prog.roomPricing.double > 0) {
        return prog.roomPricing.double;
      }
      if (roomType === 'فردية' && prog.roomPricing.single && prog.roomPricing.single > 0) {
        return prog.roomPricing.single;
      }
      if (prog.roomPricing.quad && prog.roomPricing.quad > 0) {
        return prog.roomPricing.quad;
      }
    }
    
    if (prog.costBreakdown?.suggestedSellingPrice && prog.costBreakdown.suggestedSellingPrice > 0) {
      return prog.costBreakdown.suggestedSellingPrice;
    }
    
    return 15525;
  };

  // Form State
  const [formData, setFormData] = useState({
    pilgrimId: '',
    pilgrimName: '',
    passportNumber: '',
    phone: '',
    programId: '',
    programName: '',
    travelDate: '',
    roomType: 'رباعية' as 'خماسية' | 'رباعية' | 'ثلاثية' | 'ثنائية' | 'فردية',
    totalAmount: 15525,
    paidAmount: 0,
    remainingBalance: 15525,
    paymentStatus: 'بانتظار السداد' as PaymentStatus,
    paymentMethod: 'تحويل بنكي' as any,
    notes: '',
  });

  // Automatically initialize / sync form when modal opens or preselected pilgrim changes
  useEffect(() => {
    if (isModalOpen && !editingBooking) {
      const activePilgrims = pilgrims.filter(p => !p.inCorbeille);
      const targetPilgrim = preselectedPilgrim 
        || (formData.pilgrimId ? activePilgrims.find(p => p.id === formData.pilgrimId) : null)
        || activePilgrims[0]
        || pilgrims[0];

      if (targetPilgrim) {
        const targetProg = (targetPilgrim.programId ? programs.find(pr => pr.id === targetPilgrim.programId) : null)
          || (formData.programId ? programs.find(pr => pr.id === formData.programId) : null)
          || programs[0];
        const targetRoom = (targetPilgrim.roomType || formData.roomType || 'رباعية') as any;
        const autoPrice = getProgramPrice(targetProg, targetRoom);

        setFormData(prev => ({
          ...prev,
          pilgrimId: targetPilgrim.id,
          pilgrimName: targetPilgrim.fullName,
          passportNumber: targetPilgrim.passportNumber || '',
          phone: targetPilgrim.phone || '',
          programId: targetProg?.id || '',
          programName: targetProg?.name || '',
          travelDate: targetProg?.travelDate || '',
          roomType: targetRoom,
          totalAmount: autoPrice,
          remainingBalance: Math.max(0, autoPrice - prev.paidAmount),
        }));
      }
    }
  }, [isModalOpen, preselectedPilgrim]);

  const formatMAD = (amount: number) => {
    return new Intl.NumberFormat('ar-MA').format(amount) + ' د.م.';
  };

  const handleOpenCreateModal = () => {
    setEditingBooking(null);
    const activePilgrims = pilgrims.filter(p => !p.inCorbeille);
    const firstPilgrim = preselectedPilgrim || activePilgrims[0] || pilgrims[0];
    const firstProgram = programs.find(pr => pr.id === firstPilgrim?.programId) || programs[0];
    const initialRoomType = (firstPilgrim?.roomType || 'رباعية') as any;
    const autoPrice = getProgramPrice(firstProgram, initialRoomType);

    setFormData({
      pilgrimId: firstPilgrim?.id || '',
      pilgrimName: firstPilgrim?.fullName || '',
      passportNumber: firstPilgrim?.passportNumber || '',
      phone: firstPilgrim?.phone || '',
      programId: firstProgram?.id || '',
      programName: firstProgram?.name || '',
      travelDate: firstProgram?.travelDate || '',
      roomType: initialRoomType,
      totalAmount: autoPrice,
      paidAmount: 0,
      remainingBalance: autoPrice,
      paymentStatus: 'بانتظار السداد',
      paymentMethod: 'تحويل بنكي',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      pilgrimId: booking.pilgrimId,
      pilgrimName: booking.pilgrimName,
      passportNumber: booking.passportNumber,
      phone: booking.phone,
      programId: booking.programId,
      programName: booking.programName,
      travelDate: booking.travelDate,
      roomType: booking.roomType,
      totalAmount: booking.totalAmount,
      paidAmount: booking.paidAmount,
      remainingBalance: booking.remainingBalance,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      notes: booking.notes || '',
    });
    setIsModalOpen(true);
  };

  const handlePilgrimChange = (pilgrimId: string) => {
    const pilgrim = pilgrims.find(p => p.id === pilgrimId);
    if (pilgrim) {
      const prog = programs.find(pr => pr.id === pilgrim.programId) || programs.find(pr => pr.id === formData.programId) || programs[0];
      const roomType = (pilgrim.roomType || formData.roomType || 'رباعية') as any;
      const autoPrice = getProgramPrice(prog, roomType);

      setFormData(prev => {
        const remaining = Math.max(0, autoPrice - prev.paidAmount);
        let newStatus = prev.paymentStatus;
        if (prev.paidAmount >= autoPrice && autoPrice > 0) {
          newStatus = 'مدفوع بالكامل';
        } else if (prev.paidAmount > 0) {
          newStatus = 'مدفوع جزئياً';
        } else {
          newStatus = 'بانتظار السداد';
        }

        return {
          ...prev,
          pilgrimId: pilgrim.id,
          pilgrimName: pilgrim.fullName,
          passportNumber: pilgrim.passportNumber || '',
          phone: pilgrim.phone || '',
          programId: prog?.id || '',
          programName: prog?.name || '',
          travelDate: prog?.travelDate || '',
          roomType: roomType,
          totalAmount: autoPrice,
          remainingBalance: remaining,
          paymentStatus: newStatus,
        };
      });
    }
  };

  const handleProgramChange = (programId: string) => {
    const prog = programs.find(p => p.id === programId);
    if (prog) {
      const autoPrice = getProgramPrice(prog, formData.roomType);

      setFormData(prev => {
        const remaining = Math.max(0, autoPrice - prev.paidAmount);
        let newStatus = prev.paymentStatus;
        if (prev.paidAmount >= autoPrice && autoPrice > 0) {
          newStatus = 'مدفوع بالكامل';
        } else if (prev.paidAmount > 0) {
          newStatus = 'مدفوع جزئياً';
        } else {
          newStatus = 'بانتظار السداد';
        }

        return {
          ...prev,
          programId: prog.id,
          programName: prog.name,
          travelDate: prog.travelDate,
          totalAmount: autoPrice,
          remainingBalance: remaining,
          paymentStatus: newStatus,
        };
      });
    }
  };

  const handleRoomTypeChange = (roomType: 'خماسية' | 'رباعية' | 'ثلاثية' | 'ثنائية' | 'فردية') => {
    const prog = programs.find(p => p.id === formData.programId) || programs[0];
    const autoPrice = getProgramPrice(prog, roomType);

    setFormData(prev => {
      const remaining = Math.max(0, autoPrice - prev.paidAmount);
      let newStatus = prev.paymentStatus;
      if (prev.paidAmount >= autoPrice && autoPrice > 0) {
        newStatus = 'مدفوع بالكامل';
      } else if (prev.paidAmount > 0) {
        newStatus = 'مدفوع جزئياً';
      } else {
        newStatus = 'بانتظار السداد';
      }

      return {
        ...prev,
        roomType,
        totalAmount: autoPrice,
        remainingBalance: remaining,
        paymentStatus: newStatus,
      };
    });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guarantee all pilgrim and program data are filled
    const selPilgrim = pilgrims.find(p => p.id === formData.pilgrimId);
    const selProg = programs.find(p => p.id === formData.programId);

    const finalPilgrimName = (formData.pilgrimName || '').trim() || selPilgrim?.fullName || 'معتمر';
    const finalPassportNumber = (formData.passportNumber || '').trim() || selPilgrim?.passportNumber || '';
    const finalPhone = (formData.phone || '').trim() || selPilgrim?.phone || '';
    const finalProgramName = (formData.programName || '').trim() || selProg?.name || 'برنامج العمرة';
    const finalTravelDate = (formData.travelDate || '').trim() || selProg?.travelDate || '';
    const finalRoomType = formData.roomType || selPilgrim?.roomType || 'رباعية';
    const finalTotal = Number(formData.totalAmount) || 0;
    const finalPaid = Number(formData.paidAmount) || 0;
    const finalRemaining = Math.max(0, finalTotal - finalPaid);

    const bookingPayload = {
      ...formData,
      pilgrimId: formData.pilgrimId || selPilgrim?.id || '',
      pilgrimName: finalPilgrimName,
      passportNumber: finalPassportNumber,
      phone: finalPhone,
      programId: formData.programId || selProg?.id || '',
      programName: finalProgramName,
      travelDate: finalTravelDate,
      roomType: finalRoomType,
      totalAmount: finalTotal,
      paidAmount: finalPaid,
      remainingBalance: finalRemaining,
      bookingDate: editingBooking?.bookingDate || new Date().toISOString().split('T')[0],
    };

    if (editingBooking) {
      await onUpdateBooking(editingBooking.id, bookingPayload);
    } else {
      await onCreateBooking(bookingPayload);
    }
    if (onClearPreselectedPilgrim) {
      onClearPreselectedPilgrim();
    }
    setIsModalOpen(false);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.pilgrimName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.programName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedPaymentStatus === 'الكل' || b.paymentStatus === selectedPaymentStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F382E] bg-[#F4F7F6] px-3 py-1 rounded-full w-fit mb-1 border border-emerald-900/10">
            <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
            إدارة الحجوزات والمدفوعات المالية
          </div>
          <h2 className="text-2xl font-black text-[#0F382E] font-['Alexandria',sans-serif]">
            جدول الحجوزات ونظام تنبيهات المدفوعات
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة دقيقة لحالات السداد (مكتمل، مدفوع جزئياً، متأخر) مع إمكانية إصدار الفواتير وتذكير المعتمرين.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-[#D4AF37] hover:bg-[#c49f2f] text-[#0F382E] font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all border border-amber-300/60 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#0F382E]" />
          <span>إصدار حجز ووصل مالي جديد</span>
        </button>
      </div>

      {/* Visual Payment Alerts Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Fully Paid */}
        <div
          onClick={() => setSelectedPaymentStatus(selectedPaymentStatus === 'مدفوع بالكامل' ? 'الكل' : 'مدفوع بالكامل')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedPaymentStatus === 'مدفوع بالكامل'
              ? 'bg-[#0F382E] text-white border-emerald-700 ring-2 ring-emerald-500'
              : 'bg-white border-emerald-200 hover:border-emerald-400 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${selectedPaymentStatus === 'مدفوع بالكامل' ? 'bg-emerald-800 text-amber-300' : 'bg-emerald-100 text-emerald-800'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              selectedPaymentStatus === 'مدفوع بالكامل'
                ? 'bg-emerald-800 text-emerald-200 border-emerald-700'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              مكتمل السداد
            </span>
          </div>
          <p className={`text-xs font-bold ${selectedPaymentStatus === 'مدفوع بالكامل' ? 'text-emerald-200' : 'text-slate-500'}`}>
            مدفوع بالكامل
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-['Alexandria',sans-serif]">
              {fullyPaidList.length} <span className="text-xs font-normal">حجز</span>
            </span>
            <span className={`text-xs font-bold dir-ltr ${selectedPaymentStatus === 'مدفوع بالكامل' ? 'text-amber-300' : 'text-emerald-700'}`}>
              {formatMAD(fullyPaidTotal)}
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-500/20 text-[10px] flex items-center justify-between font-semibold">
            <span>نسبة الاستكمال 100%</span>
            <span>جاهز للرحلة</span>
          </div>
        </div>

        {/* Card 2: Partially Paid */}
        <div
          onClick={() => setSelectedPaymentStatus(selectedPaymentStatus === 'مدفوع جزئياً' ? 'الكل' : 'مدفوع جزئياً')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedPaymentStatus === 'مدفوع جزئياً'
              ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-400'
              : 'bg-white border-amber-200 hover:border-amber-400 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${selectedPaymentStatus === 'مدفوع جزئياً' ? 'bg-amber-700 text-amber-100' : 'bg-amber-100 text-amber-800'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              selectedPaymentStatus === 'مدفوع جزئياً'
                ? 'bg-amber-700 text-amber-100 border-amber-600'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              دفعة أولى
            </span>
          </div>
          <p className={`text-xs font-bold ${selectedPaymentStatus === 'مدفوع جزئياً' ? 'text-amber-100' : 'text-slate-500'}`}>
            مدفوع جزئياً
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-['Alexandria',sans-serif]">
              {partiallyPaidList.length} <span className="text-xs font-normal">حجز</span>
            </span>
            <span className={`text-xs font-bold dir-ltr ${selectedPaymentStatus === 'مدفوع جزئياً' ? 'text-white' : 'text-amber-700'}`}>
              متبقي: {formatMAD(partiallyPaidRemaining)}
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-amber-400/30 text-[10px] flex items-center justify-between font-semibold">
            <span>تم تحصيل: {formatMAD(partiallyPaidCollected)}</span>
            <span>بانتظار الاستكمال</span>
          </div>
        </div>

        {/* Card 3: Overdue Payments */}
        <div
          onClick={() => setSelectedPaymentStatus(selectedPaymentStatus === 'متأخر في السداد' ? 'الكل' : 'متأخر في السداد')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedPaymentStatus === 'متأخر في السداد'
              ? 'bg-rose-900 text-white border-rose-700 ring-2 ring-rose-500'
              : 'bg-rose-50/70 border-rose-200 hover:border-rose-400 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${selectedPaymentStatus === 'متأخر في السداد' ? 'bg-rose-800 text-rose-200' : 'bg-rose-100 text-rose-700'}`}>
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
            <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
              تنبيه عاجل
            </span>
          </div>
          <p className={`text-xs font-bold ${selectedPaymentStatus === 'متأخر في السداد' ? 'text-rose-200' : 'text-rose-800'}`}>
            متأخر في السداد
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-['Alexandria',sans-serif] text-rose-600">
              {overdueList.length} <span className="text-xs font-normal">حجز</span>
            </span>
            <span className="text-xs font-extrabold text-rose-700 dir-ltr">
              {formatMAD(overdueRemaining)}
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-200 text-[10px] flex items-center justify-between font-bold text-rose-700">
            <span>تجاوز موعد الدفع</span>
            <span>يتطلب المتابعة</span>
          </div>
        </div>

        {/* Card 4: Pending Payments */}
        <div
          onClick={() => setSelectedPaymentStatus(selectedPaymentStatus === 'بانتظار السداد' ? 'الكل' : 'بانتظار السداد')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedPaymentStatus === 'بانتظار السداد'
              ? 'bg-slate-900 text-white border-slate-700 ring-2 ring-slate-500'
              : 'bg-white border-slate-200 hover:border-slate-400 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${selectedPaymentStatus === 'بانتظار السداد' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              selectedPaymentStatus === 'بانتظار السداد'
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              حجز جديد
            </span>
          </div>
          <p className={`text-xs font-bold ${selectedPaymentStatus === 'بانتظار السداد' ? 'text-slate-300' : 'text-slate-500'}`}>
            بانتظار السداد
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-['Alexandria',sans-serif]">
              {pendingList.length} <span className="text-xs font-normal">حجز</span>
            </span>
            <span className={`text-xs font-bold dir-ltr ${selectedPaymentStatus === 'بانتظار السداد' ? 'text-amber-400' : 'text-slate-700'}`}>
              {formatMAD(pendingTotal)}
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] flex items-center justify-between font-semibold text-slate-500">
            <span>لم يُسدد عربون</span>
            <span>بانتظار التحويل</span>
          </div>
        </div>
      </div>

      {/* Payment Alerts & Uncollected Receivables Panel */}
      {(overdueList.length > 0 || partiallyPaidList.length > 0 || pendingList.length > 0) && (
        <div className="bg-white border-2 border-rose-200/90 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-rose-100">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md flex-shrink-0 animate-bounce">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-rose-950 text-base font-['Alexandria',sans-serif]">
                    نظام تنبيهات مدفوعات الحجاج والبرامج
                  </span>
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                    تنبيه مالي مباشر
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                  متابعة المعتمرين أصحاب المبالغ المتبقية للتحصيل قبل موعد انطلاق الرحلات. إجمالي المتبقي للتحصيل: <strong className="text-rose-900 font-black text-sm dir-ltr inline-block bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-300">{formatMAD(totalUncollected)}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
              {overdueList.length > 0 && (
                <button
                  onClick={() => setSelectedPaymentStatus('متأخر في السداد')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                    selectedPaymentStatus === 'متأخر في السداد'
                      ? 'bg-rose-700 text-white shadow-md ring-2 ring-rose-400'
                      : 'bg-rose-100 text-rose-900 hover:bg-rose-200 border border-rose-300'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  متأخرات ({overdueList.length})
                </button>
              )}

              {partiallyPaidList.length > 0 && (
                <button
                  onClick={() => setSelectedPaymentStatus('مدفوع جزئياً')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                    selectedPaymentStatus === 'مدفوع جزئياً'
                      ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  دفعات جزئية ({partiallyPaidList.length})
                </button>
              )}

              {selectedPaymentStatus !== 'الكل' && (
                <button
                  onClick={() => setSelectedPaymentStatus('الكل')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  إظهار كافة الحجوزات
                </button>
              )}
            </div>
          </div>

          {/* Quick Alert Cards for each pilgrim needing payment attention */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {[...overdueList, ...partiallyPaidList].slice(0, 6).map((item) => (
              <div 
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                  item.paymentStatus === 'متأخر في السداد'
                    ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
                    : 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.bookingRef}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.paymentStatus === 'متأخر في السداد'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}>
                      {item.paymentStatus}
                    </span>
                  </div>

                  {/* Pilgrim Name */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-emerald-900/10 text-[#0F382E] flex items-center justify-center font-bold text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs">{item.pilgrimName}</div>
                      <div className="text-[10px] text-slate-500 font-mono dir-ltr text-right">{item.passportNumber} {item.phone ? `• ${item.phone}` : ''}</div>
                    </div>
                  </div>

                  {/* Program Name */}
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200/70 mt-2 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-700 font-bold">
                      <span className="truncate max-w-[170px]" title={item.programName}>{item.programName}</span>
                      <span className="text-[10px] text-[#0F382E] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">{item.roomType}</span>
                    </div>
                    {item.travelDate && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#D4AF37]" />
                        <span>تاريخ الرحلة: {item.travelDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount details & actions */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">المبلغ المتبقي:</span>
                    <strong className="text-xs font-black text-rose-700 dir-ltr">{formatMAD(item.remainingBalance)}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.phone && (
                      <a
                        href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `السلام عليكم ورحمة الله أخي/أختي الكريم(ة) ${item.pilgrimName}.\nنود تذكيركم من وكالة زاد للسفر والسياحة بخصوص حجزكم المرجعي (${item.bookingRef}) الخاص ببرنامج (${item.programName}).\nالمبلغ المتبقي للاستكمال: ${item.remainingBalance} درهم مغربي.\nنرجو التواصل معنا لترتيب الاستكمال.\nهاتف الوكالة: 0524209713 / 0664610061`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                        title="إرسال تذكير واتساب فوري"
                      >
                        <Send className="w-3 h-3" />
                        <span>واتساب</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold transition-all"
                    >
                      تسجيل دفعة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar with Quick Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              placeholder="بحث برقم الحجز المرجعي، اسم الحاج، رقم الجواز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 text-xs bg-[#F4F7F6] border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F382E] font-medium transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedPaymentStatus('الكل')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                selectedPaymentStatus === 'الكل'
                  ? 'bg-[#0F382E] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-3 h-3" />
              الكل ({bookings.length})
            </button>

            <button
              onClick={() => setSelectedPaymentStatus('مدفوع بالكامل')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedPaymentStatus === 'مدفوع بالكامل'
                  ? 'bg-emerald-800 text-white shadow-xs ring-1 ring-emerald-600'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              مكتمل ({fullyPaidList.length})
            </button>

            <button
              onClick={() => setSelectedPaymentStatus('مدفوع جزئياً')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedPaymentStatus === 'مدفوع جزئياً'
                  ? 'bg-amber-600 text-white shadow-xs ring-1 ring-amber-500'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              جزئي ({partiallyPaidList.length})
            </button>

            <button
              onClick={() => setSelectedPaymentStatus('متأخر في السداد')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedPaymentStatus === 'متأخر في السداد'
                  ? 'bg-rose-700 text-white shadow-xs ring-1 ring-rose-500'
                  : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              متأخر ({overdueList.length})
            </button>

            <button
              onClick={() => setSelectedPaymentStatus('بانتظار السداد')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedPaymentStatus === 'بانتظار السداد'
                  ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-600'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
              بانتظار ({pendingList.length})
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="bg-[#F4F7F6] text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 border-b">مرجع الحجز</th>
                <th className="p-3.5 border-b">اسم الحاج / المعتمر</th>
                <th className="p-3.5 border-b">اسم البرنامج</th>
                <th className="p-3.5 border-b">الغرفة</th>
                <th className="p-3.5 border-b">المبلغ الكلي</th>
                <th className="p-3.5 border-b">المسدد</th>
                <th className="p-3.5 border-b">المتبقي</th>
                <th className="p-3.5 border-b text-center">حالة الدفع والتنبيهات</th>
                <th className="p-3.5 border-b">طريقة الدفع</th>
                <th className="p-3.5 border-b text-center">الوصل / الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="font-bold text-sm text-slate-600">لا توجد حجوزات مطابقة لمعايير البحث</p>
                    <p className="text-xs text-slate-400 mt-0.5">جرّب تغيير التصفية أو كلمة البحث.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const percentPaid = Math.min(100, Math.round((b.paidAmount / (b.totalAmount || 1)) * 100));

                  return (
                    <tr key={b.id} className="hover:bg-[#F4F7F6]/60 transition-colors">
                      <td className="p-3.5 font-bold text-[#0F382E] dir-ltr text-right">
                        {b.bookingRef}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0F382E]/10 text-[#0F382E] flex items-center justify-center font-bold text-xs shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs hover:text-[#0F382E] transition-colors">
                              {b.pilgrimName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 font-mono dir-ltr text-right">
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                                {b.passportNumber}
                              </span>
                              {b.phone && <span>{b.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 max-w-[220px]">
                        <div className="font-bold text-[#0F382E] text-xs leading-snug line-clamp-1" title={b.programName}>
                          {b.programName}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          {b.travelDate && (
                            <span className="flex items-center gap-1 bg-amber-50 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200/70 font-semibold">
                              <Calendar className="w-2.5 h-2.5 text-[#D4AF37]" />
                              {b.travelDate}
                            </span>
                          )}
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                            {b.roomType}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                          {b.roomType}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-slate-900">
                        {formatMAD(b.totalAmount)}
                      </td>

                      <td className="p-3.5 font-bold text-emerald-700">
                        {formatMAD(b.paidAmount)}
                      </td>

                      <td className="p-3.5 font-bold">
                        {b.remainingBalance > 0 ? (
                          <span className={b.paymentStatus === 'متأخر في السداد' ? 'text-rose-600 font-black' : 'text-amber-700'}>
                            {formatMAD(b.remainingBalance)}
                          </span>
                        ) : (
                          <span className="text-slate-400">0 د.م.</span>
                        )}
                      </td>

                      {/* Visual Payment Status Badge */}
                      <td className="p-3.5 text-center">
                        {b.paymentStatus === 'مدفوع بالكامل' && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              مدفوع بالكامل
                            </span>
                            <div className="w-20 bg-emerald-200 h-1 rounded-full overflow-hidden">
                              <div className="bg-emerald-600 h-full w-full"></div>
                            </div>
                          </div>
                        )}

                        {b.paymentStatus === 'مدفوع جزئياً' && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              مدفوع جزئياً ({percentPaid}%)
                            </span>
                            <div className="w-20 bg-amber-200 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-600 h-full rounded-full transition-all"
                                style={{ width: `${percentPaid}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {b.paymentStatus === 'متأخر في السداد' && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              متأخر في السداد
                            </span>
                            <div className="w-20 bg-rose-200 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-600 h-full rounded-full transition-all"
                                style={{ width: `${percentPaid}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {b.paymentStatus === 'بانتظار السداد' && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
                              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                              بانتظار السداد
                            </span>
                            <div className="w-20 bg-slate-200 h-1 rounded-full overflow-hidden">
                              <div className="bg-slate-400 h-full w-0"></div>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md font-semibold text-[10px] border border-amber-200/60 whitespace-nowrap">
                          {b.paymentMethod}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedInvoiceBooking(b)}
                            className="bg-[#0F382E] hover:bg-emerald-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                            title="عرض ومعاينة وصل الاستلام"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-300" />
                            الوصل
                          </button>

                          <a
                            href={`?receipt=${b.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="فتح الوصل في صفحة مستقلة عبر رابط مباشر (Lien direct)"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* WhatsApp Reminder for unpaid balances */}
                          {b.remainingBalance > 0 && b.phone && (
                            <a
                              href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `السلام عليكم ورحمة الله أخي/أختي الكريم(ة) ${b.pilgrimName}.\nنود تذكيركم من وكالة زاد للسفر والسياحة بخصوص حجزكم المرجعي (${b.bookingRef}) الخاص ببرنامج (${b.programName}).\nالمبلغ المتبقي للاستكمال: ${b.remainingBalance} درهم مغربي.\nنرجو التواصل معنا لترتيب الاستكمال.\nهاتف الوكالة: 0524209713 / 0664610061`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                              title="إرسال تذكير بالسداد عبر واتساب"
                            >
                              <Send className="w-3.5 h-3.5 text-emerald-700" />
                            </a>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(b)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="تحديث بيانات الدفعة"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteBooking(b.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors active:scale-90"
                            title="حذف الحجز نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT BOOKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full my-8 border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-['Alexandria',sans-serif]">
                  {editingBooking ? 'تحديث بيانات الحجز والدفع' : 'إصدار حجز ووصل مالي جديد'}
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  ربط المعتمر بالبرنامج وتوثيق المبلغ المسدد والمتبقي.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              {/* Select Pilgrim */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اختر الحاج / المعتمر *</label>
                <select
                  value={formData.pilgrimId}
                  onChange={(e) => handlePilgrimChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  {pilgrims.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.passportNumber}) {p.city ? `- ${p.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilgrim Details Verification / Direct Edit */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#0F382E]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    بيانات المعتمر المستفيد في الوصل
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">تدرج في الوصل المالي تلقائياً</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      value={formData.pilgrimName}
                      onChange={(e) => setFormData(prev => ({ ...prev, pilgrimName: e.target.value }))}
                      placeholder="الاسم الكامل"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#0F382E]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">رقم الجواز / ب.ت.و *</label>
                    <input
                      type="text"
                      required
                      value={formData.passportNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value }))}
                      placeholder="رقم الجواز"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 uppercase focus:outline-none focus:border-[#0F382E]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">رقم الهاتف</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="06xxxxxxxx"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#0F382E]"
                    />
                  </div>
                </div>
              </div>

              {/* Select Program */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">اختر البرنامج السياحي *</label>
                  {programs.find(pr => pr.id === formData.programId)?.costBreakdown?.suggestedSellingPrice && (
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                      السعر المقترح: {formatMAD(programs.find(pr => pr.id === formData.programId)?.costBreakdown.suggestedSellingPrice || 0)}
                    </span>
                  )}
                </div>
                <select
                  value={formData.programId}
                  onChange={(e) => handleProgramChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  {programs.map(pr => {
                    const progBasePrice = pr.roomPricing?.quad || pr.costBreakdown?.suggestedSellingPrice || 15525;
                    return (
                      <option key={pr.id} value={pr.id}>
                        {pr.name} ({pr.travelDate}) — يبدأ من {formatMAD(progBasePrice)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Room Type with Prices */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">نوع الغرفة المختار والتسعيرة</label>
                {(() => {
                  const currentProg = programs.find(p => p.id === formData.programId) || programs[0];
                  return (
                    <select
                      value={formData.roomType}
                      onChange={(e) => handleRoomTypeChange(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      <option value="خماسية">
                        غرفة خماسية {currentProg?.roomPricing?.quintuple ? `(${formatMAD(currentProg.roomPricing.quintuple)})` : ''}
                      </option>
                      <option value="رباعية">
                        غرفة رباعية {currentProg?.roomPricing?.quad ? `(${formatMAD(currentProg.roomPricing.quad)})` : (currentProg?.costBreakdown?.suggestedSellingPrice ? `(${formatMAD(currentProg.costBreakdown.suggestedSellingPrice)})` : '')}
                      </option>
                      <option value="ثلاثية">
                        غرفة ثلاثية {currentProg?.roomPricing?.triple ? `(${formatMAD(currentProg.roomPricing.triple)})` : ''}
                      </option>
                      <option value="ثنائية">
                        غرفة ثنائية {currentProg?.roomPricing?.double ? `(${formatMAD(currentProg.roomPricing.double)})` : ''}
                      </option>
                      <option value="فردية">
                        غرفة فردية {currentProg?.roomPricing?.single ? `(${formatMAD(currentProg.roomPricing.single)})` : ''}
                      </option>
                    </select>
                  );
                })()}
              </div>

              {/* Official Program Price Informational Banner */}
              {(() => {
                const currentProg = programs.find(p => p.id === formData.programId) || programs[0];
                const officialPrice = getProgramPrice(currentProg, formData.roomType);
                const isMatching = formData.totalAmount === officialPrice;

                return currentProg ? (
                  <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0F382E] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        سعر البرنامج المعتمد (غرفة {formData.roomType}):
                      </span>
                      <strong className="text-emerald-950 font-black text-sm">
                        {formatMAD(officialPrice)}
                      </strong>
                    </div>

                    {currentProg.costBreakdown?.suggestedSellingPrice ? (
                      <div className="text-[11px] text-emerald-800 flex items-center justify-between pt-1.5 border-t border-emerald-200/60">
                        <span>سعر البيع الأساسي المقترح للبرنامج:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {formatMAD(currentProg.costBreakdown.suggestedSellingPrice)}
                        </span>
                      </div>
                    ) : null}

                    {!isMatching && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => {
                            const rem = Math.max(0, officialPrice - prev.paidAmount);
                            let newStat = prev.paymentStatus;
                            if (prev.paidAmount >= officialPrice && officialPrice > 0) newStat = 'مدفوع بالكامل';
                            else if (prev.paidAmount > 0) newStat = 'مدفوع جزئياً';
                            else newStat = 'بانتظار السداد';

                            return {
                              ...prev,
                              totalAmount: officialPrice,
                              remainingBalance: rem,
                              paymentStatus: newStat,
                            };
                          });
                        }}
                        className="w-full text-center py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 mt-1"
                      >
                        <span>تطبيق سعر البرنامج الرسمي</span>
                        <span className="font-mono underline">({formatMAD(officialPrice)})</span>
                      </button>
                    )}
                  </div>
                ) : null;
              })()}

              {/* Amounts Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">السعر الإجمالي (MAD)</label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      const paid = formData.paidAmount;
                      let newStat = formData.paymentStatus;
                      if (paid >= total && total > 0) newStat = 'مدفوع بالكامل';
                      else if (paid > 0) newStat = 'مدفوع جزئياً';
                      else newStat = 'بانتظار السداد';

                      setFormData(prev => ({
                        ...prev,
                        totalAmount: total,
                        remainingBalance: Math.max(0, total - paid),
                        paymentStatus: newStat,
                      }));
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-emerald-800 text-[11px]">المبلغ المسدد الآن</label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => {
                      const paid = Number(e.target.value);
                      const total = formData.totalAmount;
                      let newStat = formData.paymentStatus;
                      if (paid >= total && total > 0) newStat = 'مدفوع بالكامل';
                      else if (paid > 0) newStat = 'مدفوع جزئياً';
                      else newStat = 'بانتظار السداد';

                      setFormData(prev => ({
                        ...prev,
                        paidAmount: paid,
                        remainingBalance: Math.max(0, total - paid),
                        paymentStatus: newStat,
                      }));
                    }}
                    className="w-full p-2 bg-emerald-50 border border-emerald-300 rounded-xl font-bold text-emerald-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-rose-700 text-[11px]">المبلغ المتبقي</label>
                  <div className="w-full p-2 bg-rose-50 border border-rose-200 rounded-xl font-bold text-rose-900">
                    {formatMAD(formData.remainingBalance)}
                  </div>
                </div>
              </div>

              {/* Quick Payment Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 font-bold">تسديد سريع:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      paidAmount: prev.totalAmount,
                      remainingBalance: 0,
                      paymentStatus: 'مدفوع بالكامل',
                    }));
                  }}
                  className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-bold transition-all border border-emerald-300"
                >
                  سداد كامل ({formatMAD(formData.totalAmount)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const deposit = Math.min(formData.totalAmount, 5000);
                    setFormData(prev => ({
                      ...prev,
                      paidAmount: deposit,
                      remainingBalance: Math.max(0, prev.totalAmount - deposit),
                      paymentStatus: deposit >= prev.totalAmount ? 'مدفوع بالكامل' : 'مدفوع جزئياً',
                    }));
                  }}
                  className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-bold transition-all border border-amber-300"
                >
                  دفعة تسبيق (5,000 د.م.)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const deposit = Math.min(formData.totalAmount, 10000);
                    setFormData(prev => ({
                      ...prev,
                      paidAmount: deposit,
                      remainingBalance: Math.max(0, prev.totalAmount - deposit),
                      paymentStatus: deposit >= prev.totalAmount ? 'مدفوع بالكامل' : 'مدفوع جزئياً',
                    }));
                  }}
                  className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-bold transition-all border border-amber-300"
                >
                  دفعة تسبيق (10,000 د.م.)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      paidAmount: 0,
                      remainingBalance: prev.totalAmount,
                      paymentStatus: 'بانتظار السداد',
                    }));
                  }}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold transition-all border border-slate-300"
                >
                  تأجيل السداد (0 د.م.)
                </button>
              </div>

              {/* Payment Status Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">حالة السداد والمالية *</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="مدفوع بالكامل">مدفوع بالكامل (مكتمل)</option>
                  <option value="مدفوع جزئياً">مدفوع جزئياً (دفعة أولى)</option>
                  <option value="متأخر في السداد">متأخر في السداد (تنبيه تجاوز الأجل)</option>
                  <option value="بانتظار السداد">بانتظار السداد (لم يُسدد بعد)</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">طريقة الأداء / الدفع *</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="تحويل بنكي">تحويل بنكي (Virement)</option>
                  <option value="نقداً">نقداً بمقر الوكالة (Espèce)</option>
                  <option value="شيك بنكي">شيك بنكي (Chèque)</option>
                  <option value="بطاقة بانكية">بطاقة بانكية (Carte)</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">ملاحظات وشروط الدفع</label>
                <input
                  type="text"
                  placeholder="ملاحظات حول البنك أو الآجال..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg border border-emerald-700"
                >
                  حفظ الحجز وتوليد الوصل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL RECEIPT / INVOICE MODAL */}
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
