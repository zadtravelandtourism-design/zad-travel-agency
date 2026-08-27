import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  FileCheck,
  AlertTriangle,
  Phone,
  Mail,
  User,
  CreditCard,
  X,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  Calendar,
  ShieldCheck,
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';
import { Pilgrim, VisaStatus, PaymentStatus, Program } from '../types';

interface PilgrimsViewProps {
  pilgrims: Pilgrim[];
  programs: Program[];
  onCreatePilgrim: (pilgrim: Omit<Pilgrim, 'id'>) => Promise<void>;
  onUpdatePilgrim: (id: string, pilgrim: Partial<Pilgrim>) => Promise<void>;
  onDeletePilgrim: (id: string) => Promise<void>;
  onRestorePilgrim?: (id: string) => Promise<void>;
  onPermanentDeletePilgrim?: (id: string) => Promise<void>;
  onEmptyCorbeille?: () => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onOpenNewBookingWithPilgrim?: (pilgrim: Pilgrim) => void;
}

export const PilgrimsView: React.FC<PilgrimsViewProps> = ({
  pilgrims,
  programs,
  onCreatePilgrim,
  onUpdatePilgrim,
  onDeletePilgrim,
  onRestorePilgrim,
  onPermanentDeletePilgrim,
  onEmptyCorbeille,
  isModalOpen,
  setIsModalOpen,
  onOpenNewBookingWithPilgrim,
}) => {
  const [viewTab, setViewTab] = useState<'active' | 'corbeille'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisaStatus, setSelectedVisaStatus] = useState<string>('الكل');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('الكل');
  const [selectedPilgrimDetails, setSelectedPilgrimDetails] = useState<Pilgrim | null>(null);
  const [editingPilgrim, setEditingPilgrim] = useState<Pilgrim | null>(null);
  const [isAiCheckingVisa, setIsAiCheckingVisa] = useState(false);
  const [aiVisaReport, setAiVisaReport] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    passportNumber: '',
    passportExpiry: '',
    phone: '',
    email: '',
    gender: 'ذكر' as 'ذكر' | 'أنثى',
    city: 'تزنيت',
    emergencyContact: '',
    emergencyPhone: '',
    programId: '',
    programName: '',
    roomType: 'رباعية' as 'خماسية' | 'رباعية' | 'ثلاثية' | 'ثنائية' | 'فردية',
    visaStatus: 'قيد المعالجة' as VisaStatus,
    paymentStatus: 'بانتظار السداد' as PaymentStatus,
    notes: '',
    documents: {
      passportCopy: true,
      personalPhoto: true,
      vaccineCertificate: false,
    },
  });

  const isPassportValidForSaudi = (expiryDateStr: string) => {
    if (!expiryDateStr) return true;
    const expiry = new Date(expiryDateStr);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    return expiry >= sixMonthsFromNow;
  };

  const handleOpenCreateModal = () => {
    setEditingPilgrim(null);
    const firstProg = programs[0];
    setFormData({
      fullName: '',
      passportNumber: '',
      passportExpiry: '2028-12-31',
      phone: '+212 6',
      email: '',
      gender: 'ذكر',
      city: 'الدار البيضاء',
      emergencyContact: '',
      emergencyPhone: '',
      programId: firstProg?.id || '',
      programName: firstProg?.name || '',
      roomType: 'رباعية',
      visaStatus: 'قيد المعالجة',
      paymentStatus: 'بانتظار السداد',
      notes: '',
      documents: {
        passportCopy: true,
        personalPhoto: true,
        vaccineCertificate: true,
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pilgrim: Pilgrim) => {
    setEditingPilgrim(pilgrim);
    setFormData({
      fullName: pilgrim.fullName,
      passportNumber: pilgrim.passportNumber,
      passportExpiry: pilgrim.passportExpiry,
      phone: pilgrim.phone,
      email: pilgrim.email,
      gender: pilgrim.gender,
      city: pilgrim.city,
      emergencyContact: pilgrim.emergencyContact,
      emergencyPhone: pilgrim.emergencyPhone,
      programId: pilgrim.programId,
      programName: pilgrim.programName,
      roomType: pilgrim.roomType,
      visaStatus: pilgrim.visaStatus,
      paymentStatus: pilgrim.paymentStatus,
      notes: pilgrim.notes || '',
      documents: { ...pilgrim.documents },
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPilgrim) {
      await onUpdatePilgrim(editingPilgrim.id, formData);
    } else {
      await onCreatePilgrim(formData);
    }
    setIsModalOpen(false);
  };

  const handleAiVisaCheck = async (pilgrim: Pilgrim) => {
    try {
      setIsAiCheckingVisa(true);
      setAiVisaReport(null);
      const res = await fetch('/api/ai/check-visa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passportExpiry: pilgrim.passportExpiry,
          gender: pilgrim.gender,
          maritalStatus: pilgrim.gender === 'أنثى' ? 'متزوجة (مع زوج محرم)' : 'عزب',
          hasVaccine: pilgrim.documents.vaccineCertificate,
          nationality: 'مغربية',
        }),
      });
      const data = await res.json();
      setAiVisaReport(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiCheckingVisa(false);
    }
  };

  const activePilgrims = pilgrims.filter(p => !p.inCorbeille);
  const corbeillePilgrims = pilgrims.filter(p => p.inCorbeille);

  const displayList = viewTab === 'active' ? activePilgrims : corbeillePilgrims;

  const filteredPilgrims = displayList.filter(pilgrim => {
    const matchesSearch = pilgrim.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pilgrim.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pilgrim.phone.includes(searchTerm) ||
                          pilgrim.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisa = selectedVisaStatus === 'الكل' || pilgrim.visaStatus === selectedVisaStatus;
    const matchesPayment = selectedPaymentStatus === 'الكل' || pilgrim.paymentStatus === selectedPaymentStatus;
    return matchesSearch && matchesVisa && matchesPayment;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F382E] bg-[#F4F7F6] px-2.5 py-1 rounded-full w-fit mb-1 border border-emerald-900/10">
            <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
            سجل المعتمرين والحجاج والعملاء
          </div>
          <h2 className="text-2xl font-black text-[#0F382E] font-['Alexandria',sans-serif]">
            إدارة بيانات المعتمرين والحجاج
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة جوازات السفر، حالة إصدار التأشيرات عبر منصة نسك، الدفعات المالية والوثائق المرفقة.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Active vs Corbeille Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-bold border border-slate-200">
            <button
              onClick={() => setViewTab('active')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewTab === 'active'
                  ? 'bg-white text-[#0F382E] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المعتمرون النشطون ({activePilgrims.length})
            </button>
            <button
              onClick={() => setViewTab('corbeille')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                viewTab === 'corbeille'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>سلة المهملات (Corbeille)</span>
              {corbeillePilgrims.length > 0 && (
                <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {corbeillePilgrims.length}
                </span>
              )}
            </button>
          </div>

          {viewTab === 'active' ? (
            <button
              onClick={handleOpenCreateModal}
              className="bg-[#0F382E] hover:bg-[#1a4d41] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-sm transition-all border border-[#0F382E] active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>تسجيل معتمر جديد</span>
            </button>
          ) : (
            onEmptyCorbeille && corbeillePilgrims.length > 0 && (
              <button
                onClick={onEmptyCorbeille}
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تفريغ السلة نهائياً</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث بالاسم، رقم الجواز، الهاتف، المدينة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs bg-[#F4F7F6] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F382E] font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedVisaStatus}
            onChange={(e) => setSelectedVisaStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F4F7F6] border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none focus:border-[#0F382E]"
          >
            <option value="الكل">جميع حالات التأشيرة</option>
            <option value="تم إصدار التأشيرة">تم إصدار التأشيرة</option>
            <option value="قيد المعالجة">قيد المعالجة</option>
            <option value="بانتظار الوثائق">بانتظار الوثائق</option>
            <option value="ملغاة">ملغاة</option>
          </select>

          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F4F7F6] border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none focus:border-[#0F382E]"
          >
            <option value="الكل">جميع حالات الدفع</option>
            <option value="مدفوع بالكامل">مدفوع بالكامل</option>
            <option value="مدفوع جزئياً">مدفوع جزئياً</option>
            <option value="بانتظار السداد">بانتظار السداد</option>
          </select>
        </div>
      </div>

      {/* Pilgrims Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="bg-[#F4F7F6] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 border-b">الاسم الكامل</th>
                <th className="p-3.5 border-b">رقم جواز السفر</th>
                <th className="p-3.5 border-b">تاريخ الانتهاء</th>
                <th className="p-3.5 border-b">رقم الهاتف / المدينة</th>
                <th className="p-3.5 border-b">البرنامج المخصص</th>
                <th className="p-3.5 border-b">نوع الغرفة</th>
                <th className="p-3.5 border-b">حالة التأشيرة</th>
                <th className="p-3.5 border-b">حالة السداد</th>
                <th className="p-3.5 border-b">الوثائق</th>
                <th className="p-3.5 border-b text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredPilgrims.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="font-bold text-sm text-slate-600">لا يوجد معتمرون أو حجاج مسجلون حالياً</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">السجل فارغ تماماً للبدء من الصفر. اضغط على الزر أعلاه لتسجيل أول معتمر.</p>
                    <button
                      onClick={handleOpenCreateModal}
                      className="bg-[#0F382E] hover:bg-[#1a4d41] text-white font-bold px-4 py-2 rounded-lg text-xs inline-flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>تسجيل أول معتمر</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPilgrims.map((pilgrim) => {
                const isPassportWarning = !isPassportValidForSaudi(pilgrim.passportExpiry);
                return (
                  <tr key={pilgrim.id} className="hover:bg-[#F4F7F6]/60 transition-colors">
                    <td className="p-3.5 font-bold text-[#0F382E]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#F4F7F6] text-[#0F382E] font-bold flex items-center justify-center text-[11px]">
                          {pilgrim.gender === 'ذكر' ? '👨' : '🧕'}
                        </div>
                        <span>{pilgrim.fullName}</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-slate-800 dir-ltr text-right">
                      {pilgrim.passportNumber}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1">
                        <span>{pilgrim.passportExpiry}</span>
                        {isPassportWarning && (
                          <span className="p-0.5 text-rose-600 bg-rose-50 rounded" title="تنبيه: الجواز ينتهي قبل 6 أشهر!">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-900">{pilgrim.phone}</div>
                      <div className="text-[10px] text-slate-400">{pilgrim.city}</div>
                    </td>

                    <td className="p-3.5 font-semibold text-slate-800 max-w-[160px] truncate">
                      {pilgrim.programName}
                    </td>

                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {pilgrim.roomType}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        pilgrim.visaStatus === 'تم إصدار التأشيرة'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : pilgrim.visaStatus === 'قيد المعالجة'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : pilgrim.visaStatus === 'بانتظار الوثائق'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {pilgrim.visaStatus}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        pilgrim.paymentStatus === 'مدفوع بالكامل'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pilgrim.paymentStatus === 'مدفوع جزئياً'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {pilgrim.paymentStatus}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${pilgrim.documents.passportCopy ? 'bg-emerald-500' : 'bg-slate-300'}`} title="نسخة الجواز" />
                        <span className={`w-2 h-2 rounded-full ${pilgrim.documents.personalPhoto ? 'bg-emerald-500' : 'bg-slate-300'}`} title="الصورة الشخصية" />
                        <span className={`w-2 h-2 rounded-full ${pilgrim.documents.vaccineCertificate ? 'bg-emerald-500' : 'bg-slate-300'}`} title="التلقيح الصحي" />
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedPilgrimDetails(pilgrim)}
                          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="عرض التفاصيل"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {viewTab === 'active' ? (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(pilgrim)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                              title="تعديل البيانات"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeletePilgrim(pilgrim.id)}
                              className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg"
                              title="نقل إلى سلة المهملات (Corbeille)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {onRestorePilgrim && (
                              <button
                                onClick={() => onRestorePilgrim(pilgrim.id)}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg"
                                title="استعادة المعتمر من سلة المهملات"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                            {onPermanentDeletePilgrim && (
                              <button
                                onClick={() => onPermanentDeletePilgrim(pilgrim.id)}
                                className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg font-bold"
                                title="حذف نهائي من سلة المهملات (Permanent Delete)"
                              >
                                <Trash2 className="w-4 h-4 text-rose-600" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PILGRIM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-950 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-['Alexandria',sans-serif]">
                  {editingPilgrim ? 'تعديل بيانات الحاج / المعتمر' : 'تسجيل حاج / معتمر جديد'}
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  إدخال اسم الزبون، بيانات الجواز، جهة الاتصال والبرنامج المخصص.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: عبد الرحيم التزنيتي"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الجنس</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">رقم جواز السفر *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: G1892341"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">تاريخ انتهاء جواز السفر *</label>
                  <input
                    type="date"
                    required
                    value={formData.passportExpiry}
                    onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">المدينة / السكن</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Program & Room Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">البرنامج المخصص *</label>
                  <select
                    value={formData.programId}
                    onChange={(e) => {
                      const prog = programs.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        programId: e.target.value,
                        programName: prog ? prog.name : '',
                      });
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    {programs.map(p => {
                      const startPrice = p.roomPricing?.quad || p.costBreakdown?.suggestedSellingPrice;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.travelDate}){startPrice ? ` — ${new Intl.NumberFormat('ar-MA').format(startPrice)} د.م.` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نوع الغرفة المختار والتسعيرة</label>
                  {(() => {
                    const selProg = programs.find(p => p.id === formData.programId) || programs[0];
                    const formatP = (num?: number) => num ? ` (${new Intl.NumberFormat('ar-MA').format(num)} د.م.)` : '';
                    return (
                      <select
                        value={formData.roomType}
                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value as any })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                      >
                        <option value="خماسية">غرفة خماسية{formatP(selProg?.roomPricing?.quintuple)}</option>
                        <option value="رباعية">غرفة رباعية{formatP(selProg?.roomPricing?.quad || selProg?.costBreakdown?.suggestedSellingPrice)}</option>
                        <option value="ثلاثية">غرفة ثلاثية{formatP(selProg?.roomPricing?.triple)}</option>
                        <option value="ثنائية">غرفة ثنائية{formatP(selProg?.roomPricing?.double)}</option>
                        <option value="فردية">غرفة فردية{formatP(selProg?.roomPricing?.single)}</option>
                      </select>
                    );
                  })()}
                </div>
              </div>

              {/* Visa Status & Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">حالة إصدار التأشيرة</label>
                  <select
                    value={formData.visaStatus}
                    onChange={(e) => setFormData({ ...formData, visaStatus: e.target.value as VisaStatus })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="قيد المعالجة">قيد المعالجة</option>
                    <option value="تم إصدار التأشيرة">تم إصدار التأشيرة</option>
                    <option value="بانتظار الوثائق">بانتظار الوثائق</option>
                    <option value="ملغاة">ملغاة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">جهة الاتصال في الطوارئ</label>
                  <input
                    type="text"
                    placeholder="اسم القريب ورقم هاتفه"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Documents Status */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 block">الوثائق المستلمة:</label>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={formData.documents.passportCopy}
                      onChange={(e) => setFormData({
                        ...formData,
                        documents: { ...formData.documents, passportCopy: e.target.checked }
                      })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>نسخة جواز السفر الاصلي</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={formData.documents.personalPhoto}
                      onChange={(e) => setFormData({
                        ...formData,
                        documents: { ...formData.documents, personalPhoto: e.target.checked }
                      })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>الصورة الشخصية خلفية بيضاء</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={formData.documents.vaccineCertificate}
                      onChange={(e) => setFormData({
                        ...formData,
                        documents: { ...formData.documents, vaccineCertificate: e.target.checked }
                      })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>دفتر التلقيح الصحي</span>
                  </label>
                </div>
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
                  className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg border border-blue-700"
                >
                  حفظ وتسجيل الحاج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PILGRIM DETAILS MODAL */}
      {selectedPilgrimDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-bold">
                  {selectedPilgrimDetails.gender === 'ذكر' ? '👨' : '🧕'}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-['Alexandria',sans-serif]">
                    {selectedPilgrimDetails.fullName}
                  </h3>
                  <p className="text-xs text-blue-200">
                    جواز سفر رقم: <span className="font-mono font-bold text-amber-300">{selectedPilgrimDetails.passportNumber}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedPilgrimDetails(null); setAiVisaReport(null); }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">الهاتف:</span>
                  <strong className="text-slate-900 text-sm">{selectedPilgrimDetails.phone}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">المدينة:</span>
                  <strong className="text-slate-900 text-sm">{selectedPilgrimDetails.city}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">انتهاء الجواز:</span>
                  <strong className="text-slate-900 text-sm">{selectedPilgrimDetails.passportExpiry}</strong>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">البرنامج والغرفة المخصصة:</h4>
                <div className="text-sm font-bold text-emerald-800">{selectedPilgrimDetails.programName}</div>
                <div className="text-slate-600">نوع الإقامة: غرفة {selectedPilgrimDetails.roomType}</div>
              </div>

              {/* AI Visa Compliance Report Button */}
              <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>فحص جاهزية التأشيرة الذكي (AI Visa Compliance)</span>
                  </div>
                  <button
                    onClick={() => handleAiVisaCheck(selectedPilgrimDetails)}
                    disabled={isAiCheckingVisa}
                    className="bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-400"
                  >
                    {isAiCheckingVisa ? 'جاري الفحص...' : 'فحص بالذكاء الاصطناعي'}
                  </button>
                </div>

                {aiVisaReport && (
                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                    {aiVisaReport}
                  </div>
                )}
              </div>

              {onOpenNewBookingWithPilgrim && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onOpenNewBookingWithPilgrim(selectedPilgrimDetails);
                      setSelectedPilgrimDetails(null);
                    }}
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold p-3 rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 text-amber-300" />
                    إصدار حجز مالي ووصل استلام لهذا المعتمر
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
