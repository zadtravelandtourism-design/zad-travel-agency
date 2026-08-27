import React, { useRef, useEffect } from 'react';
import { Printer, X, Download, CheckCircle, Building2, Phone, Calendar, User, FileText, FileSpreadsheet } from 'lucide-react';
import { Booking, Program, Pilgrim } from '../types';
import { formatReceiptNumber } from '../utils/receiptGenerator';
import { ZadLogo } from './ZadLogo';
import { exportReceiptToStyledExcel } from '../utils/excelExport';

interface PaymentReceiptModalProps {
  booking: Booking;
  program?: Program;
  pilgrim?: Pilgrim;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  booking,
  program,
  pilgrim,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Extract or compute fields matching the official template - strictly from entered data
  const clientName = booking.pilgrimName || pilgrim?.fullName || '';
  const cinOrPassport = booking.passportNumber || pilgrim?.passportNumber || '';
  const phone = booking.phone || pilgrim?.phone || '';
  const packName = booking.programName || program?.name || program?.type || '';
  const rawRoomType = booking.roomType || pilgrim?.roomType || '';
  const roomTypeDisplay = rawRoomType ? (rawRoomType.startsWith('غرفة') ? rawRoomType : `غرفة ${rawRoomType}`) : '';
  const departureDate = booking.travelDate || program?.travelDate || '';
  const returnDate = program?.returnDate || '';
  const airline = program?.airline || '';
  const makkahHotel = program?.makkahHotel?.name || '';
  const madinahHotel = program?.madinahHotel?.name || '';

  const formatAmount = (val: number) => {
    return `${new Intl.NumberFormat('en-US').format(val)} MAD`;
  };

  // Format payment method in French/Arabic matching document
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

  const paymentMethodFr = getFrenchPaymentMethod(booking.paymentMethod);
  const remaining = Math.max(0, (booking.totalAmount || 0) - (booking.paidAmount || 0));

  // Date formatting for receipt
  const receiptDate = booking.bookingDate || '';
  const receiptNum = formatReceiptNumber(booking.bookingRef, booking.bookingDate);

  const handlePrint = () => {
    // Direct native browser print for maximum compatibility
    window.print();
  };

  const handleExportExcel = async () => {
    try {
      await exportReceiptToStyledExcel({
        receiptNum: receiptNum || '',
        receiptDate: receiptDate || '',
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
        totalAmount: booking.totalAmount || 0,
        paidAmount: booking.paidAmount || 0,
        paymentMethod: paymentMethodFr || '',
        remainingBalance: remaining,
      });
    } catch (err) {
      console.error('Error exporting excel receipt:', err);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full my-4 border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none print:my-0 print:w-full cursor-default relative"
      >
        
        {/* Modal Toolbar (hidden in print) */}
        <div className="bg-slate-900 text-white p-3.5 px-6 flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-bold text-xs sm:text-sm font-['Alexandria',sans-serif]">
              وصل أداء رسمي / Reçu de Paiement
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all border border-emerald-500/40 cursor-pointer"
              title="تصدير بيانات الوصل إلى ملف إكسيل"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير إكسيل</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#0F382E] hover:bg-[#1a4d41] text-amber-300 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all border border-amber-400/40 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </button>
            <button
              onClick={onClose}
              className="bg-rose-800 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all border border-rose-600 cursor-pointer"
              title="إغلاق النافذة (Esc)"
            >
              <X className="w-4 h-4" />
              <span>إغلاق</span>
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div className="p-4 sm:p-6 bg-slate-50 flex justify-center overflow-x-auto print:p-0 print:bg-white">
          <div 
            ref={receiptRef}
            id="printable-invoice"
            className="w-full max-w-[660px] p-6 sm:p-8 bg-white text-slate-900 text-[11px] leading-snug font-sans selection:bg-slate-200 border-[1.5px] border-black shadow-sm print:shadow-none print:border-[1.5px] print:border-black print:p-6 print:max-w-none print:w-full"
            style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
          >
            {/* Header Logo & Agency Name */}
            <div className="text-center pb-2 flex flex-col items-center justify-center">
              <ZadLogo size="lg" showText={false} className="mb-1" />
              <h1 className="text-lg sm:text-xl font-black text-black tracking-wide font-['Alexandria',sans-serif] mt-1">
                زاد للسفر و السياحة
              </h1>
              <h2 className="text-xs sm:text-sm font-bold text-black tracking-wider">
                Zad Travel & Tourism
              </h2>
            </div>

            {/* Receipt Number & Date Metadata */}
            <div className="py-2.5 space-y-1 text-xs font-bold text-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span>Reçu de Paiement n°:</span>
                  <span className="font-mono font-bold">{receiptNum}</span>
                </div>
                <div className="flex items-center gap-4 dir-rtl text-right">
                  <span>وصل أداء رقم :</span>
                  <span className="font-mono font-bold">{receiptNum}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span>Du:</span>
                  <span className="font-mono font-bold">{receiptDate}</span>
                </div>
                <div className="flex items-center gap-4 dir-rtl text-right">
                  <span>بتاريخ :</span>
                  <span className="font-mono font-bold">{receiptDate}</span>
                </div>
              </div>
            </div>

            {/* Table 1: Informations / المعلومات */}
            <div className="mt-2 border-[1.5px] border-black overflow-hidden">
              {/* Table 1 Header */}
              <div className="bg-[#B4C6E7] text-black font-bold text-center py-1.5 text-xs sm:text-[13px] border-b-[1.5px] border-black receipt-header-blue">
                Informations / المعلومات
              </div>

              <table className="w-full text-xs border-collapse">
                <tbody className="font-medium text-black">
                  {/* Row 1: Nom du Client / اسم العميل */}
                  <tr>
                    <td className="w-[45%] p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      Nom du Client / اسم العميل
                    </td>
                    <td className="w-[55%] p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                      {clientName}
                    </td>
                  </tr>

                  {/* Row 2: C.I.N / رقم ب.ت.و */}
                  <tr>
                    <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      C.I.N / رقم ب.ت.و
                    </td>
                    <td className="p-1.5 px-2.5 border-b border-black text-black font-mono font-bold bg-white text-left">
                      {cinOrPassport}
                    </td>
                  </tr>

                  {/* Row 3: Téléphone / الهاتف */}
                  <tr>
                    <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      Téléphone / الهاتف
                    </td>
                    <td className="p-1.5 px-2.5 border-b border-black text-black font-mono font-bold bg-white text-left">
                      {phone}
                    </td>
                  </tr>

                  {/* Row 4: Pack / الباقة */}
                  <tr>
                    <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      Pack / الباقة
                    </td>
                    <td className="p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                      {packName}
                    </td>
                  </tr>

                  {/* Row 5: Type de chambre / نوع الغرفة */}
                  <tr>
                    <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      Type de chambre / نوع الغرفة
                    </td>
                    <td className="p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                      {roomTypeDisplay}
                    </td>
                  </tr>

                  {/* Row 6: Date de Départ / تاريخ الذهاب */}
                  <tr>
                    <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      Date de Départ / تاريخ الذهاب
                    </td>
                    <td className="p-1.5 px-2.5 border-b border-black text-black font-mono font-semibold bg-white text-left">
                      {departureDate}
                    </td>
                  </tr>

                  {/* Row 7: Date de Retour / تاريخ العودة */}
                  <tr>
                    <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      Date de Retour / تاريخ العودة
                    </td>
                    <td className="p-1.5 px-2.5 border-b border-black text-black font-mono font-semibold bg-white text-left">
                      {returnDate}
                    </td>
                  </tr>

                  {/* Row 8: Compagnie Aérienne / شركة الطيران */}
                  <tr>
                    <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      Compagnie Aérienne / شركة الطيران
                    </td>
                    <td className="p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                      {airline}
                    </td>
                  </tr>

                  {/* Row 9: Hôtel la Mecque / فندق مكة */}
                  <tr>
                    <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      Hôtel la Mecque / فندق مكة
                    </td>
                    <td className="p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                      {makkahHotel}
                    </td>
                  </tr>

                  {/* Row 10: Hôtel Médine / فندق المدينة */}
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

            {/* Table 2: Informations de Paiement / معلومات الأداء */}
            <div className="mt-3 border-[1.5px] border-black overflow-hidden">
              {/* Table 2 Header */}
              <div className="bg-[#B4C6E7] text-black font-bold text-center py-1.5 text-xs sm:text-[13px] border-b-[1.5px] border-black receipt-header-blue">
                Informations de Paiement / معلومات الأداء
              </div>

              <table className="w-full text-xs border-collapse">
                <tbody className="font-medium text-black">
                  {/* Montant Total / المبلغ الإجمالي */}
                  <tr>
                    <td className="w-[45%] p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      Montant Total / المبلغ الإجمالي
                    </td>
                    <td className="w-[55%] p-1.5 px-2.5 border-b border-black text-black font-bold bg-white font-mono text-left">
                      {formatAmount(booking.totalAmount)}
                    </td>
                  </tr>

                  {/* Montant Payé / المبلغ المدفوع */}
                  <tr>
                    <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      Montant Payé / المبلغ المدفوع
                    </td>
                    <td className="p-1.5 px-2.5 border-b border-black text-black font-bold bg-white font-mono text-left">
                      {formatAmount(booking.paidAmount)}
                    </td>
                  </tr>

                  {/* Mode de Paiement / طريقة الدفع */}
                  <tr>
                    <td className="p-1.5 px-2.5 border-r border-b border-black text-black font-bold bg-white text-left">
                      Mode de Paiement / طريقة الدفع
                    </td>
                    <td className="p-1.5 px-2.5 border-b border-black text-black font-semibold bg-white text-left">
                      {paymentMethodFr}
                    </td>
                  </tr>

                  {/* Reste à Payer / الباقي */}
                  <tr>
                    <td className="p-1.5 px-2.5 border-r border-black text-black font-bold bg-white text-left">
                      Reste à Payer / الباقي
                    </td>
                    <td className="p-1.5 px-2.5 text-black font-bold bg-white font-mono text-left">
                      {formatAmount(remaining)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signatures Section */}
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

            {/* Official Agency Footer */}
            <div className="mt-8 pt-4 text-center text-[10px] text-black space-y-0.5 font-semibold">
              <p>
                RDC 383 Lot Al Amane Mhamid Marrakech (En face Mosquée Al Amira-Maatallah)
              </p>
              <p className="dir-ltr text-center font-mono">
                Tél 05 24 20 97 13 &nbsp;&nbsp;&nbsp;&nbsp; Gsm 06 64 61 00 61
              </p>
            </div>

          </div>
        </div>

        {/* Modal Bottom Action Bar (hidden in print) */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 px-6 flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 hover:border-rose-300 transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-rose-600" />
            <span>إغلاق النافذة (Fermer)</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all border border-emerald-600 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير إكسيل</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#0F382E] hover:bg-[#1a4d41] text-amber-300 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all border border-amber-400/40 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الوصل</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
