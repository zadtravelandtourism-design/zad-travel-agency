import React, { useEffect, useCallback } from 'react';
import { Booking, Program, Pilgrim } from '../types';
import { Printer, ArrowRight, Check, Copy, FileSpreadsheet, Building2, Phone, Calendar, User, Compass, X } from 'lucide-react';
import { formatReceiptNumber } from '../utils/receiptGenerator';
import { ZadLogo } from './ZadLogo';
import { exportReceiptToStyledExcel } from '../utils/excelExport';

interface PaymentReceiptProps {
  booking?: Booking | null;
  program?: Program | null;
  pilgrim?: Pilgrim | null;
  onBack?: () => void;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  booking,
  program,
  pilgrim,
  onBack,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Safe Exit / Close Handler
  const handleExit = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      // Fallback if accessed via direct URL param without React state handler
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('receipt');
        url.searchParams.delete('receiptId');
        url.searchParams.delete('bookingId');
        window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {
        window.location.href = '/';
      }
    }
  }, [onBack]);

  // Listen to Escape key (Esc) to close immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit]);

  // Format receipt number strictly according to YYMMXXXX (e.g., 26080001)
  const bookingDate = booking?.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString('fr-FR')
    : '';

  const bookingRef = formatReceiptNumber(booking?.bookingRef, booking?.bookingDate);

  const clientName = booking?.pilgrimName || pilgrim?.fullName || '';
  const cinOrPassport = booking?.passportNumber || pilgrim?.passportNumber || '';
  const phone = booking?.phone || pilgrim?.phone || '';
  const packName = booking?.programName || program?.name || program?.type || '';
  const rawRoomType = booking?.roomType || pilgrim?.roomType || '';
  const roomTypeDisplay = rawRoomType ? (rawRoomType.startsWith('غرفة') ? rawRoomType : `غرفة ${rawRoomType}`) : '';
  const airline = program?.airline || '';
  const departureDate = booking?.travelDate || program?.travelDate || '';
  const returnDate = program?.returnDate || '';
  const makkahHotel = program?.makkahHotel?.name || '';
  const madinahHotel = program?.madinahHotel?.name || '';

  const totalAmount = booking?.totalAmount !== undefined ? booking.totalAmount : 0;
  const paidAmount = booking?.paidAmount !== undefined ? booking.paidAmount : 0;
  const remainingBalance = booking?.remainingBalance !== undefined ? booking.remainingBalance : Math.max(0, totalAmount - paidAmount);

  // Format payment method in French/Arabic
  const getFrenchPaymentMethod = (method?: string) => {
    if (!method) return '';
    switch (method) {
      case 'نقداً':
        return 'Espèces / نقداً';
      case 'شيك بنكي':
        return 'Chèque / شيك بنكي';
      case 'تحويل بنكي':
        return 'Virement / تحويل بنكي';
      case 'بطاقة بانكية':
        return 'Carte bancaire / بطاقة بنكية';
      default:
        return method;
    }
  };

  const paymentMethodDisplay = getFrenchPaymentMethod(booking?.paymentMethod);

  const handleCopyDirectLink = () => {
    const directUrl = `${window.location.origin}${window.location.pathname}?receipt=${booking?.id || 'sample'}`;
    navigator.clipboard.writeText(directUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    try {
      await exportReceiptToStyledExcel({
        receiptNum: bookingRef || '',
        receiptDate: bookingDate || '',
        clientName: clientName || '',
        cinOrPassport: cinOrPassport || '',
        phone: phone || '',
        packName: packName || '',
        roomTypeDisplay: roomTypeDisplay || '',
        departureDate: departureDate || '',
        returnDate: returnDate || '',
        airline: airline || '',
        makkahHotel: makkahHotel || '',
        madinahHotel: madinahHotel || '',
        totalAmount: totalAmount || 0,
        paidAmount: paidAmount || 0,
        paymentMethod: paymentMethodDisplay || '',
        remainingBalance: remainingBalance || 0,
      });
    } catch (err) {
      console.error('Error exporting styled excel receipt:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 p-4 sm:p-8 flex flex-col items-center justify-start print:bg-white print:p-0 print:m-0 relative">
      {/* Floating Quick-Exit Button (Always visible on screen, hidden in print) */}
      <div className="fixed top-4 left-4 z-50 print:hidden flex items-center gap-2">
        <button
          onClick={handleExit}
          className="bg-slate-900/90 hover:bg-rose-700 text-white font-bold py-2 px-3.5 rounded-full shadow-lg flex items-center gap-2 text-xs backdrop-blur-sm transition-all border border-slate-700 hover:border-rose-600 hover:scale-105 cursor-pointer"
          title="إغلاق الوصل والعودة (Esc)"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">إغلاق الوصل (Fermer)</span>
          <kbd className="hidden md:inline bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-mono border border-slate-600">Esc</kbd>
        </button>
      </div>

      {/* Top Action Bar (hidden in print) */}
      <div className="w-full max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={handleExit}
          className="bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-700 font-bold py-2.5 px-4 rounded-xl border border-slate-300 hover:border-rose-300 shadow-xs flex items-center gap-2 text-xs sm:text-sm transition-all cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 text-emerald-800" />
          <span>العودة إلى لوحة التحكم (Retour / Fermer)</span>
        </button>

        <div className="flex items-center gap-2 mr-auto">
          {booking && (
            <button
              onClick={handleCopyDirectLink}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-3.5 rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 text-xs transition-all cursor-pointer"
              title="نسخ الرابط المباشر للوصل"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">تم نسخ الرابط المباشر!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>نسخ الرابط (Lien)</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-xl shadow-xs flex items-center gap-2 text-xs sm:text-sm transition-all border border-emerald-800 cursor-pointer"
            title="تصدير بيانات الوصل إلى ملف إكسيل"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>تصدير إكسيل (Excel)</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#0B3B2C] hover:bg-[#082b20] text-amber-300 font-bold py-2 px-5 rounded-xl shadow-xs flex items-center gap-2 text-xs sm:text-sm transition-all border border-[#0B3B2C] cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>طباعة الوصل (Imprimer)</span>
          </button>
        </div>
      </div>

      {/* Official Printable Invoice / Receipt Sheet (Exact Layout from Screenshot_2) */}
      <div
        id="printable-receipt-card"
        className="w-full max-w-[660px] bg-white p-6 sm:p-8 shadow-xl border-[1.5px] border-black text-black print:shadow-none print:border-[1.5px] print:border-black print:p-6 print:m-0 print:max-w-none print:w-full"
        style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
      >
        {/* ======================= TOP LOGO & HEADER ======================= */}
        <div className="flex flex-col items-center justify-center text-center mb-4">
          <ZadLogo size="lg" showText={false} className="mb-1" />

          <h1 className="text-lg sm:text-xl font-black text-black tracking-wide font-['Alexandria',sans-serif] mt-1">
            زاد للسفر و السياحة
          </h1>
          <h2 className="text-xs sm:text-sm font-bold text-black tracking-wider">
            Zad Travel & Tourism
          </h2>

          {/* Receipt Number & Date */}
          <div className="w-full mt-3 space-y-1 text-xs font-bold text-black">
            <div className="flex justify-between items-center">
              <span>
                Reçu de Paiement n°:&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-mono font-bold">{bookingRef}</span>
              </span>
              <span className="dir-rtl text-right">
                وصل أداء رقم :&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-mono font-bold">{bookingRef}</span>
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>
                Du:&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-mono font-bold">{bookingDate}</span>
              </span>
              <span className="dir-rtl text-right">
                بتاريخ :&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-mono font-bold">{bookingDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ======================= TABLE 1: INFORMATIONS ======================= */}
        <div className="mt-2 border-[1.5px] border-black overflow-hidden">
          <div className="bg-[#B4C6E7] text-black font-bold text-center py-1.5 text-xs sm:text-[13px] border-b-[1.5px] border-black receipt-header-blue">
            Informations / المعلومات
          </div>
          <table className="w-full text-xs border-collapse">
            <tbody className="font-medium text-black">
              <tr>
                <td className="w-[45%] p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  Nom du Client / اسم العميل
                </td>
                <td className="w-[55%] p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                  {clientName}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  C.I.N / رقم ب.ت.و
                </td>
                <td className="p-1.5 px-2.5 border-b border-black text-black font-mono font-bold bg-white text-left">
                  {cinOrPassport}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  Téléphone / الهاتف
                </td>
                <td className="p-1.5 px-2.5 border-b border-black text-black font-mono font-bold bg-white text-left">
                  {phone}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  Pack / الباقة
                </td>
                <td className="p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                  {packName}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  Type de chambre / نوع الغرفة
                </td>
                <td className="p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                  {roomTypeDisplay}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  Date de Départ / تاريخ الذهاب
                </td>
                <td className="p-1.5 px-2.5 border-b border-black text-black font-mono font-semibold bg-white text-left">
                  {departureDate}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  Date de Retour / تاريخ العودة
                </td>
                <td className="p-1.5 px-2.5 border-b border-black text-black font-mono font-semibold bg-white text-left">
                  {returnDate}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  Compagnie Aérienne / شركة الطيران
                </td>
                <td className="p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                  {airline}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  Hôtel la Mecque / فندق مكة
                </td>
                <td className="p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                  {makkahHotel}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-black text-black font-bold bg-white text-left">
                  Hôtel Médine / فندق المدينة
                </td>
                <td className="p-1.5 px-2.5 text-black font-semibold bg-white text-left">
                  {madinahHotel}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ======================= TABLE 2: INFORMATIONS DE PAIEMENT ======================= */}
        <div className="mt-3 border-[1.5px] border-black overflow-hidden">
          <div className="bg-[#B4C6E7] text-black font-bold text-center py-1.5 text-xs sm:text-[13px] border-b-[1.5px] border-black receipt-header-blue">
            Informations de Paiement / معلومات الأداء
          </div>
          <table className="w-full text-xs border-collapse">
            <tbody className="font-medium text-black">
              <tr>
                <td className="w-[45%] p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  Montant Total / المبلغ الإجمالي
                </td>
                <td className="w-[55%] p-1.5 px-2.5 border-b border-black text-black font-bold bg-white font-mono text-left">
                  {new Intl.NumberFormat('en-US').format(totalAmount)} MAD
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  Montant Payé / المبلغ المدفوع
                </td>
                <td className="p-1.5 px-2.5 border-b border-black text-black font-bold bg-white font-mono text-left">
                  {new Intl.NumberFormat('en-US').format(paidAmount)} MAD
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                  Mode de Paiement / طريقة الدفع
                </td>
                <td className="p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                  {paymentMethodDisplay}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 px-2.5 border-r border-black text-black font-bold bg-white text-left">
                  Reste à Payer / الباقي
                </td>
                <td className="p-1.5 px-2.5 text-black font-bold bg-white font-mono text-left">
                  {new Intl.NumberFormat('en-US').format(remainingBalance)} MAD
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ======================= SIGNATURES ======================= */}
        <div className="mt-6 pt-2 flex items-center justify-between text-xs font-bold text-black px-6">
          <div className="text-center space-y-8">
            <div>Signature Agence</div>
            <div className="w-36 h-0.5 border-b border-transparent"></div>
          </div>
          <div className="text-center space-y-8">
            <div>Signature Client</div>
            <div className="w-36 h-0.5 border-b border-transparent"></div>
          </div>
        </div>

        {/* ======================= FOOTER / ADDRESS ======================= */}
        <div className="mt-8 pt-4 text-center text-[10px] text-black space-y-0.5 font-semibold">
          <p>
            RDC 383 Lot Al Amane Mhamid Marrakech (En face Mosquée Al Amira-Maatallah)
          </p>
          <p className="dir-ltr text-center font-mono">
            Tél 05 24 20 97 13 &nbsp;&nbsp;&nbsp;&nbsp; Gsm 06 64 61 00 61
          </p>
        </div>

        {/* Bottom Action Bar (hidden in print) */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center print:hidden flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleExit}
            className="bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 font-bold py-2.5 px-6 rounded-xl border border-slate-300 hover:border-rose-300 shadow-sm transition-all inline-flex items-center gap-2 text-sm cursor-pointer"
          >
            <X className="w-4 h-4 text-rose-600" />
            <span>إغلاق الوصل والرجوع (Fermer / Quitter)</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 text-sm border border-emerald-800 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>تصدير إلى إكسيل (Exporter vers Excel)</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#0B3B2C] hover:bg-[#082b20] text-amber-300 font-bold py-2.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 text-sm border border-[#0B3B2C] cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>طباعة الوصل الرسمي (Imprimer le Reçu)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;

