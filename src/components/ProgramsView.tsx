import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Building,
  Plane,
  Users,
  DollarSign,
  Sparkles,
  ChevronDown,
  X,
  Edit,
  Trash2,
  CheckCircle2,
  Info,
  Building2,
  BedDouble,
  FileText,
  Archive,
  ArchiveRestore,
  FolderArchive,
  RotateCcw,
  UserPlus,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Program, ProgramType, ProgramStatus, RoomPricing, CostBreakdown, HotelInfo, Pilgrim, Booking } from '../types';

interface ProgramsViewProps {
  programs: Program[];
  pilgrims?: Pilgrim[];
  bookings?: Booking[];
  onCreateProgram: (program: Omit<Program, 'id'>) => Promise<void>;
  onUpdateProgram: (id: string, program: Partial<Program>) => Promise<void>;
  onDeleteProgram: (id: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onOpenNewPilgrimWithProgram?: (programId: string, programName: string) => void;
  onViewPilgrimsOfProgram?: (programId: string) => void;
}

export const ProgramsView: React.FC<ProgramsViewProps> = ({
  programs,
  pilgrims = [],
  bookings = [],
  onCreateProgram,
  onUpdateProgram,
  onDeleteProgram,
  isModalOpen,
  setIsModalOpen,
  onOpenNewPilgrimWithProgram,
  onViewPilgrimsOfProgram,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('الكل');
  const [selectedStatus, setSelectedStatus] = useState<string>('الكل');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProgramDetails, setSelectedProgramDetails] = useState<Program | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [archiveTab, setArchiveTab] = useState<'active' | 'archived'>('active');

  // Compute live real-time statistics for any program based on the pilgrims repository
  const getProgramStats = (prog: Program) => {
    const allProgramPilgrims = (pilgrims || []).filter(p => p.programId === prog.id);
    const activePilgrims = allProgramPilgrims.filter(p => !p.inCorbeille && p.visaStatus !== 'ملغاة');
    const withdrawnPilgrims = allProgramPilgrims.filter(p => p.inCorbeille || p.visaStatus === 'ملغاة');
    
    const totalSeats = Number(prog.totalSeats) || 0;
    const activeCount = activePilgrims.length;
    const withdrawnCount = withdrawnPilgrims.length;
    const remainingSeats = Math.max(0, totalSeats - activeCount);
    const fillPercentage = totalSeats > 0 ? Math.round((activeCount / totalSeats) * 100) : 0;
    
    const isFull = totalSeats > 0 && activeCount >= totalSeats;
    const isNearlyFull = !isFull && (fillPercentage >= 85 || remainingSeats <= 5) && activeCount > 0;
    const isEmpty = activeCount === 0;

    let computedStatus: ProgramStatus = prog.status;
    if (prog.status !== 'انتهت' && prog.status !== 'قريباً') {
      if (isFull) {
        computedStatus = 'اكتمل العدد';
      } else {
        computedStatus = 'مفتوح للتسجيل';
      }
    }

    return {
      totalSeats,
      activeCount,
      withdrawnCount,
      remainingSeats,
      fillPercentage,
      isFull,
      isNearlyFull,
      isEmpty,
      computedStatus,
      activePilgrims,
      withdrawnPilgrims,
      allProgramPilgrims,
    };
  };

  const activePrograms = programs.filter(p => !p.isArchived);
  const archivedPrograms = programs.filter(p => p.isArchived === true);
  const expiredUnarchivedPrograms = activePrograms.filter(p => p.status === 'انتهت');

  const handleArchiveProgram = async (id: string) => {
    await onUpdateProgram(id, { isArchived: true });
  };

  const handleRestoreProgram = async (id: string) => {
    await onUpdateProgram(id, { isArchived: false });
  };

  const handleAutoArchiveExpired = async () => {
    if (expiredUnarchivedPrograms.length === 0) return;
    for (const prog of expiredUnarchivedPrograms) {
      await onUpdateProgram(prog.id, { isArchived: true });
    }
  };

  // Form State for New / Edit Program
  const [formData, setFormData] = useState({
    name: '',
    type: 'عمرة شعبان' as ProgramType,
    description: '',
    travelDate: '',
    returnDate: '',
    durationDays: 15,
    departureCity: 'الدار البيضاء (CMN)',
    airline: 'الخطوط الملكية المغربية (RAM)',
    totalSeats: 45,
    bookedSeats: 0,
    status: 'مفتوح للتسجيل' as ProgramStatus,
    isArchived: false,
    costBreakdown: {
      flightCost: 6000,
      hotelCost: 7500,
      visaCost: 1800,
      transportCost: 1200,
      otherCost: 800,
      profitMargin: 15,
      suggestedSellingPrice: 20000,
    } as CostBreakdown,
    makkahHotel: {
      name: 'فندق أنجم مكة (5 نجوم)',
      city: 'مكة المكرمة',
      stars: 5,
      distanceToHaram: 300,
      shuttleService: false,
      address: 'شارع إبراهيم الخليل، مكة المكرمة',
      contactPerson: '',
      phone: '',
    } as HotelInfo,
    madinahHotel: {
      name: 'فندق دار التقوى (5 نجوم)',
      city: 'المدينة المنورة',
      stars: 5,
      distanceToHaram: 50,
      shuttleService: false,
      address: 'المنطقة الشمالية، المدينة المنورة',
      contactPerson: '',
      phone: '',
    } as HotelInfo,
    roomPricing: {
      quad: 18500,
      triple: 20500,
      double: 23000,
      single: 30000,
    } as RoomPricing,
    features: [
      'طيران مباشر مع خيارات أمتعة مناسبة',
      'إقامة فندقية قريبة من الحرمين الشريفين',
      'تأطير وإرشاد ديني معتمد طيلة أيام الرحلة',
      'تأمين صحي وشامل معتمد من منصة نسك',
    ],
  });

  // Calculate Suggested Price automatically when costs or margin change
  const calculateCosts = (costs: CostBreakdown) => {
    const totalCost = (costs.flightCost || 0) + 
                      (costs.hotelCost || 0) + 
                      (costs.visaCost || 0) + 
                      (costs.transportCost || 0) + 
                      (costs.otherCost || 0);
    const marginAmount = totalCost * ((costs.profitMargin || 0) / 100);
    const suggestedSellingPrice = Math.round(totalCost + marginAmount);
    return { totalCost, suggestedSellingPrice };
  };

  const handleCostChange = (field: keyof CostBreakdown, value: number) => {
    const updated = { ...formData.costBreakdown, [field]: value };
    const { suggestedSellingPrice } = calculateCosts(updated);
    updated.suggestedSellingPrice = suggestedSellingPrice;
    setFormData({ ...formData, costBreakdown: updated });
  };

  const handleOpenCreateModal = () => {
    setEditingProgram(null);
    setFormData({
      name: '',
      type: 'عمرة شعبان',
      description: `برنامج عمرة شعبان المباركة - وكالة زاد للسفر والسياحة:
• طيران مباشر مع الخطوط الملكية المغربية أو الخطوط السعودية.
• إقامة فاخرة بفندق أنجم مكة المكرمة وفندق دار التقوى بالمدينة المنورة.
• تأطير وإرشاد ديني معتمد طيلة أيام الرحلة مع زيارة المزارات الشريفة.
• شامل للتأشيرة والتأمين الصحي وشحن الأمتعة.`,
      travelDate: '2026-03-01',
      returnDate: '2026-03-15',
      durationDays: 15,
      departureCity: 'الدار البيضاء (CMN)',
      airline: 'الخطوط الملكية المغربية (RAM)',
      totalSeats: 45,
      bookedSeats: 0,
      status: 'مفتوح للتسجيل',
      costBreakdown: {
        flightCost: 6500,
        hotelCost: 8000,
        visaCost: 1800,
        transportCost: 1500,
        otherCost: 800,
        profitMargin: 15,
        suggestedSellingPrice: 21390,
      },
      makkahHotel: {
        name: 'فندق أنجم مكة المكرمة',
        city: 'مكة المكرمة',
        stars: 5,
        distanceToHaram: 300,
        shuttleService: false,
        address: 'جبل عمر، مكة المكرمة',
      },
      madinahHotel: {
        name: 'فندق دار التقوى',
        city: 'المدينة المنورة',
        stars: 5,
        distanceToHaram: 50,
        shuttleService: false,
        address: 'المنطقة الشمالية، المدينة المنورة',
      },
      roomPricing: {
        quintuple: 17500,
        quad: 19500,
        triple: 21500,
        double: 24000,
        single: 32000,
      },
      features: [
        'طيران مباشر من مطار الدار البيضاء',
        'فنادق راقية قريبة جداً من ساحة الحرم',
        'مرافق ومرشد ديني مغربي متمرس',
      ],
      isArchived: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prog: Program) => {
    setEditingProgram(prog);
    setFormData({
      name: prog.name,
      type: prog.type,
      description: prog.description,
      travelDate: prog.travelDate,
      returnDate: prog.returnDate,
      durationDays: prog.durationDays,
      departureCity: prog.departureCity,
      airline: prog.airline,
      totalSeats: prog.totalSeats,
      bookedSeats: prog.bookedSeats,
      status: prog.status,
      costBreakdown: { ...prog.costBreakdown },
      makkahHotel: { ...prog.makkahHotel },
      madinahHotel: { ...prog.madinahHotel },
      roomPricing: {
        quintuple: prog.roomPricing.quintuple || 17500,
        quad: prog.roomPricing.quad,
        triple: prog.roomPricing.triple,
        double: prog.roomPricing.double,
        single: prog.roomPricing.single,
      },
      features: [...prog.features],
      isArchived: prog.isArchived || false,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProgram) {
      await onUpdateProgram(editingProgram.id, formData);
    } else {
      await onCreateProgram(formData);
    }
    setIsModalOpen(false);
  };

  const handleAiGenerateDescription = async () => {
    try {
      setIsAiGenerating(true);
      const res = await fetch('/api/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          durationDays: formData.durationDays,
          budgetLevel: formData.makkahHotel.stars === 5 ? 'فاخر 5 نجوم' : 'اقتصادي',
          targetMonth: formData.travelDate,
        }),
      });
      const data = await res.json();
      const textToWrite = data.itinerary || `برنامج ${formData.type} المتميز - وكالة زاد للسفر والسياحة:
• طيران مباشر مع الرحلات الدولية المعتمدة.
• إقامة ممتازة بـ ${formData.makkahHotel.name} بمكة و${formData.madinahHotel.name} بالمدينة.
• تأطير وإرشاد ديني وإداري شامل طيلة الرحلة.`;
      
      setFormData(prev => ({ ...prev, description: textToWrite }));
    } catch (err) {
      console.error(err);
      const fallbackText = `برنامج ${formData.type} المتميز - وكالة زاد للسفر والسياحة:
• طيران مباشر وإقامة ممتازة في فنادق الحرمين.
• مرافقة وإرشاد ديني وإداري طيلة أيام الرحلة المباركة.`;
      setFormData(prev => ({ ...prev, description: fallbackText }));
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Filter logic based on active or archived tab
  const baseProgramList = archiveTab === 'active' ? activePrograms : archivedPrograms;

  const availableProgramTypes = Array.from(
    new Set([
      'عمرة VIP',
      'عمرة شعبان',
      'عمرة رمضان',
      'حج فاخر',
      'حج الجمعيات',
      'رحلة خاصة',
      ...programs.map(p => p.type).filter(Boolean)
    ])
  );

  const filteredPrograms = baseProgramList.filter(prog => {
    const matchesSearch = prog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prog.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prog.makkahHotel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'الكل' || prog.type === selectedType;
    const matchesStatus = selectedStatus === 'الكل' || prog.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatMAD = (num: number) => {
    return new Intl.NumberFormat('ar-MA').format(num) + ' د.م.';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Title Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F382E] bg-[#F4F7F6] px-2.5 py-1 rounded-full w-fit mb-1 border border-emerald-900/10">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            إدارة البرامج والرحلات السياحية
          </div>
          <h2 className="text-2xl font-black text-[#0F382E] font-['Alexandria',sans-serif]">
            جدول برامج العمرة والحج
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدخال البرامج، احتساب التكاليف (الطيران، الفنادق، التأشيرة) وتحديد أسعار الإقامة الفردية والرباعية.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-[#0F382E] hover:bg-[#1a4d41] text-white font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all border border-[#0F382E] active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>إنشاء برنامج جديد</span>
        </button>
      </div>

      {/* Active / Archive Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setArchiveTab('active')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
              archiveTab === 'active'
                ? 'bg-[#0F382E] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>البرامج النشطة والمفتوحة</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              archiveTab === 'active' ? 'bg-[#D4AF37] text-[#003425]' : 'bg-slate-200 text-slate-700'
            }`}>
              {activePrograms.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setArchiveTab('archived')}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
              archiveTab === 'archived'
                ? 'bg-[#0F382E] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>أرشيف البرامج المنتهية</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              archiveTab === 'archived' ? 'bg-[#D4AF37] text-[#003425]' : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {archivedPrograms.length}
            </span>
          </button>
        </div>

        {/* Quick auto-archive button for finished programs */}
        {archiveTab === 'active' && expiredUnarchivedPrograms.length > 0 && (
          <button
            type="button"
            onClick={handleAutoArchiveExpired}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all animate-pulse"
            title="نقل جميع الرحلات والبرامج ذات الحالة 'انتهت' إلى الأرشيف دفعة واحدة"
          >
            <Archive className="w-4 h-4 text-amber-600" />
            <span>أرشفة البرامج المنتهية تلقائياً ({expiredUnarchivedPrograms.length})</span>
          </button>
        )}
      </div>

      {/* Archive Notice Banner */}
      {archiveTab === 'archived' && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-4 flex items-center justify-between gap-4 text-amber-900 text-xs font-medium shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-200/70 text-amber-900 flex-shrink-0">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950 mb-0.5">قائمة البرامج والرحلات المؤرشفة</h4>
              <p className="text-amber-900/80 leading-relaxed">
                هذه القائمة تضم سجل الرحلات والبرامج المنتهية للحفاظ على أرشيف وكالة زاد دون التأثير على قائمة الرحلات الحالية. يمكنك الاطلاع على بياناتها أو استخدام زر الاستعادة لإعادتها إلى القائمة النشطة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="بحث باسم البرنامج، الفندق، الخطوط..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2 text-xs bg-[#F4F7F6] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F382E] font-medium"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F4F7F6] border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none focus:border-[#0F382E]"
            >
              <option value="الكل">جميع أنواع البرامج</option>
              {availableProgramTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F4F7F6] border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none focus:border-[#0F382E]"
            >
              <option value="الكل">جميع الحالات</option>
              <option value="مفتوح للتسجيل">مفتوح للتسجيل</option>
              <option value="اكتمل العدد">اكتمل العدد</option>
              <option value="انتهت">انتهت</option>
              <option value="قريباً">قريباً</option>
            </select>

            <div className="flex items-center bg-[#F4F7F6] p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-[#0F382E] text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                بطاقات
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  viewMode === 'table' ? 'bg-[#0F382E] text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                جدول
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Content View (Grid or Table) */}
      {filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F4F7F6] text-[#0F382E] flex items-center justify-center font-bold">
            <Calendar className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-[#0F382E] text-base font-['Alexandria',sans-serif]">
              {archiveTab === 'active' ? 'لا توجد برامج رحلات نشطة حالياً' : 'أرشيف البرامج المنتهية فارغ حالياً'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              تم مسح سجلات البيانات التوضيحية بنجاح. يمكنك بدء إنشاء أول برنامج رحلة عمرة أو حج جديد وتأطير خطتك المالية بكل سهولة.
            </p>
          </div>
          {archiveTab === 'active' && (
            <button
              onClick={handleOpenCreateModal}
              className="bg-[#0F382E] hover:bg-[#1a4d41] text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>إنشاء أول برنامج رحلة</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => {
            const stats = getProgramStats(prog);
            return (
              <div
                key={prog.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0F382E] hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top Banner */}
                <div className="p-5 border-b border-slate-100 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#0F382E] bg-[#F4F7F6] border border-emerald-900/20 px-2.5 py-0.5 rounded-full">
                      {prog.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      stats.computedStatus === 'مفتوح للتسجيل'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : stats.computedStatus === 'اكتمل العدد'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {stats.isFull && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      {stats.computedStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#0F382E] text-base leading-snug group-hover:text-[#1a4d41] transition-colors">
                    {prog.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {prog.description}
                  </p>
                </div>

                {/* Details Summary */}
                <div className="p-5 space-y-3.5 text-xs text-slate-700 bg-[#F4F7F6]/40">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                      <Calendar className="w-3.5 h-3.5 text-[#0F382E]" />
                      <span>السفر: <strong className="text-slate-900">{prog.travelDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                      <Plane className="w-3.5 h-3.5 text-[#0F382E]" />
                      <span>الانطلاق: <strong className="text-slate-900">{prog.departureCity.split(' ')[0]}</strong></span>
                    </div>
                  </div>

                  {/* Hotels summary */}
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/60">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">فندق مكة:</span>
                      <span className="font-bold text-slate-900 text-right">{prog.makkahHotel.name} ({prog.makkahHotel.distanceToHaram}م)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">فندق المدينة:</span>
                      <span className="font-bold text-slate-900 text-right">{prog.madinahHotel.name} ({prog.madinahHotel.distanceToHaram}م)</span>
                    </div>
                  </div>

                  {/* Room Pricing Preview */}
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-xs text-slate-500 font-semibold">سعر الغرفة الرباعية:</span>
                    <span className="text-sm font-black text-[#0F382E]">
                      {formatMAD(prog.roomPricing.quad)}
                    </span>
                  </div>

                  {/* REAL-TIME SEATS & REGISTRATION TRACKER */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#0F382E]" />
                        إحصائيات المقاعد والتسجيل
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        stats.isFull
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : stats.isNearlyFull
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        نسبة الامتلاء {stats.fillPercentage}%
                      </span>
                    </div>

                    {/* 3 Metric Grid: Total / Active Registered / Remaining */}
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-[#F4F7F6] p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">السعة الكلية</span>
                        <strong className="text-slate-900 text-xs font-black">{stats.totalSeats}</strong>
                        <span className="text-[9px] text-slate-400 block">مقعد</span>
                      </div>
                      <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-emerald-700 block font-bold">المسجلون</span>
                        <strong className="text-emerald-900 text-xs font-black">{stats.activeCount}</strong>
                        <span className="text-[9px] text-emerald-600 block">معتمر</span>
                      </div>
                      <div className={`p-2 rounded-lg border ${
                        stats.remainingSeats === 0
                          ? 'bg-rose-50 border-rose-100 text-rose-900'
                          : 'bg-blue-50/80 border-blue-100 text-blue-900'
                      }`}>
                        <span className="text-[10px] block font-bold">المتبقي</span>
                        <strong className="text-xs font-black">{stats.remainingSeats}</strong>
                        <span className="text-[9px] block">شاغر</span>
                      </div>
                    </div>

                    {/* Withdrawn/Cancelled indicator if any */}
                    {stats.withdrawnCount > 0 && (
                      <div className="flex items-center justify-between text-[10px] text-rose-700 bg-rose-50/60 px-2 py-1 rounded-md border border-rose-100">
                        <span className="flex items-center gap-1">
                          <UserX className="w-3 h-3 text-rose-500" />
                          منسحبون / ملغاة:
                        </span>
                        <span className="font-bold">{stats.withdrawnCount} مسجل</span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            stats.isFull
                              ? 'bg-rose-600'
                              : stats.isNearlyFull
                              ? 'bg-amber-500'
                              : 'bg-[#0F382E]'
                          }`}
                          style={{ width: `${Math.min(stats.fillPercentage, 100)}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span>{stats.activeCount} مسجل فعلي</span>
                        <span>{stats.remainingSeats > 0 ? `باقي ${stats.remainingSeats} مقعد` : 'اكتملت المقاعد'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer with Registration Quick Button */}
                <div className="p-4 bg-white border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedProgramDetails(prog)}
                      className="text-xs font-bold text-[#0F382E] hover:text-[#1a4d41] flex items-center gap-1 bg-[#F4F7F6] px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex-1 justify-center"
                    >
                      <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>تفاصيل البرنامج ({stats.activeCount})</span>
                    </button>

                    {onOpenNewPilgrimWithProgram && !prog.isArchived && (
                      <button
                        onClick={() => onOpenNewPilgrimWithProgram(prog.id, prog.name)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs ${
                          stats.isFull
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            : 'bg-[#0F382E] hover:bg-[#1a4d41] text-white border border-[#0F382E]'
                        }`}
                        title="تسجيل معتمر جديد في هذا البرنامج مباشرة"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>تسجيل معتمر</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                    <div className="text-[10px] text-slate-400 font-medium">
                      إدارة البرنامج:
                    </div>
                    <div className="flex items-center gap-1">
                      {prog.isArchived ? (
                        <button
                          onClick={() => handleRestoreProgram(prog.id)}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md flex items-center gap-1 transition-colors"
                          title="استعادة هذا البرنامج إلى القائمة النشطة"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5 text-emerald-600" />
                          <span>استعادة</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchiveProgram(prog.id)}
                          className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors"
                          title="نقل إلى الأرشيف"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditModal(prog)}
                        className="p-1.5 text-slate-500 hover:text-[#0F382E] hover:bg-[#F4F7F6] rounded-md transition-colors"
                        title="تعديل البرنامج"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProgram(prog.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                        title="حذف نهائي"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead className="bg-[#F4F7F6] text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 border-b">اسم البرنامج</th>
                  <th className="p-3.5 border-b">النوع</th>
                  <th className="p-3.5 border-b">تاريخ السفر</th>
                  <th className="p-3.5 border-b">مطار المغادرة</th>
                  <th className="p-3.5 border-b">الطيران</th>
                  <th className="p-3.5 border-b">سعر الرباعية (MAD)</th>
                  <th className="p-3.5 border-b text-center">المسجلون / السعة</th>
                  <th className="p-3.5 border-b text-center">المتبقي</th>
                  <th className="p-3.5 border-b text-center">المنسحبون</th>
                  <th className="p-3.5 border-b text-center">الحالة</th>
                  <th className="p-3.5 border-b text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredPrograms.map((prog) => {
                  const stats = getProgramStats(prog);
                  return (
                    <tr key={prog.id} className="hover:bg-[#F4F7F6]/60 transition-colors">
                      <td className="p-3.5 font-bold text-[#0F382E]">{prog.name}</td>
                      <td className="p-3.5">
                        <span className="bg-[#F4F7F6] text-[#0F382E] text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                          {prog.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-800 font-semibold">{prog.travelDate}</td>
                      <td className="p-3.5">{prog.departureCity.split(' ')[0]}</td>
                      <td className="p-3.5">{prog.airline}</td>
                      <td className="p-3.5 font-black text-emerald-800">{formatMAD(prog.roomPricing.quad)}</td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-slate-900">
                            {stats.activeCount} / {stats.totalSeats}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            ({stats.fillPercentage}%)
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          stats.remainingSeats === 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-50 text-blue-800'
                        }`}>
                          {stats.remainingSeats} شاغر
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {stats.withdrawnCount > 0 ? (
                          <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {stats.withdrawnCount}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          stats.computedStatus === 'مفتوح للتسجيل'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stats.computedStatus === 'اكتمل العدد'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {stats.computedStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {onOpenNewPilgrimWithProgram && !prog.isArchived && (
                            <button
                              onClick={() => onOpenNewPilgrimWithProgram(prog.id, prog.name)}
                              className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-lg"
                              title="تسجيل معتمر في هذا البرنامج"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedProgramDetails(prog)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg"
                            title="عرض التفاصيل والمسجلين"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {prog.isArchived ? (
                            <button
                              onClick={() => handleRestoreProgram(prog.id)}
                              className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-lg"
                              title="استعادة من الأرشيف"
                            >
                              <ArchiveRestore className="w-4 h-4 text-emerald-600" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchiveProgram(prog.id)}
                              className="p-1.5 text-amber-800 hover:bg-amber-50 rounded-lg"
                              title="نقل للبرامج المؤرشفة"
                            >
                              <Archive className="w-4 h-4 text-amber-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(prog)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProgram(prog.id)}
                            className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROGRAM MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full my-8 border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-['Alexandria',sans-serif]">
                  {editingProgram ? 'تعديل برنامج الرحلة' : 'صفحة إنشاء برنامج جديد'}
                </h3>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  إدخال تفاصيل العمرة/الحج، احتساب تكاليف الطيران، الفندق، التأشيرة والأسعار.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-emerald-900 font-bold text-sm">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>1. المعلومات الأساسية للبرنامج</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">عنوان/اسم البرنامج *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: عمرة شعبان الفاخرة - الطيران المباشر"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">نوع البرنامج *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: عمرة VIP، عمرة شعبان، رحلة خاصة..."
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span>وصف وشروط البرنامج</span>
                      <span className="text-[10px] text-slate-400 font-normal">(يمكنك الكتابة المباشرة أو التوليد التلقائي)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAiGenerateDescription}
                      disabled={isAiGenerating}
                      className="text-[11px] text-[#003425] bg-[#E5B842]/20 border border-[#E5B842] font-extrabold px-3 py-1 rounded-lg hover:bg-[#E5B842]/30 flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#003425]" />
                      {isAiGenerating ? 'جاري الصياغة والتوليد...' : 'توليد/صياغة الوصف بالذكاء الاصطناعي'}
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={4}
                      placeholder="اكتب وصف برنامج الرحلة هنا، أو اضغط على زر التوليد بالذكاء الاصطناعي لتأليف برنامج متكامل تلقائياً..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full p-3 bg-slate-50 border rounded-xl font-medium text-slate-800 focus:border-[#003425] focus:bg-white focus:ring-2 focus:ring-[#003425]/10 focus:outline-none leading-relaxed transition-all resize-y ${
                        isAiGenerating ? 'border-[#E5B842] bg-amber-50/40 animate-pulse' : 'border-slate-200'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Trip & Flight Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-emerald-900 font-bold text-sm">
                  <Plane className="w-4 h-4 text-blue-500" />
                  <span>2. تفاصيل الرحلة والطيران والمقاعد</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">تاريخ الذهاب (السفر) *</label>
                    <input
                      type="date"
                      required
                      value={formData.travelDate}
                      onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">تاريخ العودة *</label>
                    <input
                      type="date"
                      required
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">المدة الإجمالية (بالأيام)</label>
                    <input
                      type="number"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">مدينة/مطار المغادرة *</label>
                    <select
                      value={formData.departureCity}
                      onChange={(e) => setFormData({ ...formData, departureCity: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="الدار البيضاء (CMN)">الدار البيضاء (CMN)</option>
                      <option value="أكادير (AGA)">أكادير (AGA)</option>
                      <option value="مراكش (RAK)">مراكش (RAK)</option>
                      <option value="الرباط (RBA)">الرباط (RBA)</option>
                      <option value="طنجة (TNG)">طنجة (TNG)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">شركة الطيران الناقلة *</label>
                    <input
                      type="text"
                      placeholder="الخطوط الملكية المغربية / الخطوط السعودية"
                      value={formData.airline}
                      onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">إجمالي مقاعد الرحلة المتاحة</label>
                    <input
                      type="number"
                      value={formData.totalSeats}
                      onChange={(e) => setFormData({ ...formData, totalSeats: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">حالة البرنامج</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ProgramStatus })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="مفتوح للتسجيل">مفتوح للتسجيل</option>
                      <option value="اكتمل العدد">اكتمل العدد</option>
                      <option value="انتهت">انتهت</option>
                      <option value="قريباً">قريباً</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Cost Breakdown (Calculated in MAD) */}
              <div className="space-y-4 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2 text-emerald-900 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    <span>3. احتساب التكاليف بالدرهم المغربي (Cost Breakdown in MAD)</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-300">
                    حساب آلي لسعر البيع المقترح
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px]">تكلفة الطيران (MAD)</label>
                    <input
                      type="number"
                      value={formData.costBreakdown.flightCost}
                      onChange={(e) => handleCostChange('flightCost', Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px]">تكلفة الفندق (MAD)</label>
                    <input
                      type="number"
                      value={formData.costBreakdown.hotelCost}
                      onChange={(e) => handleCostChange('hotelCost', Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px]">التأشيرة والتأمين</label>
                    <input
                      type="number"
                      value={formData.costBreakdown.visaCost}
                      onChange={(e) => handleCostChange('visaCost', Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px]">التنقل والمزارات</label>
                    <input
                      type="number"
                      value={formData.costBreakdown.transportCost}
                      onChange={(e) => handleCostChange('transportCost', Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px]">مصاريف إضافية</label>
                    <input
                      type="number"
                      value={formData.costBreakdown.otherCost}
                      onChange={(e) => handleCostChange('otherCost', Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-emerald-800 text-[11px]">هامش الربح (%)</label>
                    <input
                      type="number"
                      value={formData.costBreakdown.profitMargin}
                      onChange={(e) => handleCostChange('profitMargin', Number(e.target.value))}
                      className="w-full p-2 bg-amber-100 border border-amber-300 rounded-xl font-bold text-amber-900"
                    />
                  </div>
                </div>

                <div className="bg-emerald-900 text-white p-3 rounded-xl flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-xs">سعر التكلفة الصافية للحاج: <span className="text-amber-300 font-black">{formatMAD(calculateCosts(formData.costBreakdown).totalCost)}</span></span>
                  <span className="font-bold text-xs bg-amber-400 text-emerald-950 px-3 py-1 rounded-lg">
                    سعر البيع الأساسي المقترح: {formatMAD(formData.costBreakdown.suggestedSellingPrice)}
                  </span>
                </div>
              </div>

              {/* Section 4: Hotel & Accommodation Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-emerald-900 font-bold text-sm">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>4. بيانات الفنادق والإقامة بمكة المكرمة والمدينة المنورة</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Makkah Hotel */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      فندق مكة المكرمة
                    </span>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="اسم فندق مكة"
                        value={formData.makkahHotel.name}
                        onChange={(e) => setFormData({ ...formData, makkahHotel: { ...formData.makkahHotel, name: e.target.value } })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="عدد النجوم (1-5)"
                          value={formData.makkahHotel.stars}
                          onChange={(e) => setFormData({ ...formData, makkahHotel: { ...formData.makkahHotel, stars: Number(e.target.value) } })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                        <input
                          type="number"
                          placeholder="المسافة للحرم (بالمتر)"
                          value={formData.makkahHotel.distanceToHaram}
                          onChange={(e) => setFormData({ ...formData, makkahHotel: { ...formData.makkahHotel, distanceToHaram: Number(e.target.value) } })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Madinah Hotel */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      فندق المدينة المنورة
                    </span>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="اسم فندق المدينة"
                        value={formData.madinahHotel.name}
                        onChange={(e) => setFormData({ ...formData, madinahHotel: { ...formData.madinahHotel, name: e.target.value } })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="عدد النجوم (1-5)"
                          value={formData.madinahHotel.stars}
                          onChange={(e) => setFormData({ ...formData, madinahHotel: { ...formData.madinahHotel, stars: Number(e.target.value) } })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                        <input
                          type="number"
                          placeholder="المسافة للمسجد النبوي"
                          value={formData.madinahHotel.distanceToHaram}
                          onChange={(e) => setFormData({ ...formData, madinahHotel: { ...formData.madinahHotel, distanceToHaram: Number(e.target.value) } })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Types Pricing in MAD */}
                <div className="space-y-2 pt-2">
                  <label className="font-bold text-slate-700">أسعار الإقامة حسب نوع الغرفة (درهم مغربي MAD)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-600 mb-1">غرفة خماسية (Quintuple)</div>
                      <input
                        type="number"
                        value={formData.roomPricing.quintuple ?? 17500}
                        onChange={(e) => setFormData({ ...formData, roomPricing: { ...formData.roomPricing, quintuple: Number(e.target.value) } })}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                      />
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-600 mb-1">غرفة رباعية (Quad)</div>
                      <input
                        type="number"
                        value={formData.roomPricing.quad}
                        onChange={(e) => setFormData({ ...formData, roomPricing: { ...formData.roomPricing, quad: Number(e.target.value) } })}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                      />
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-600 mb-1">غرفة ثلاثية (Triple)</div>
                      <input
                        type="number"
                        value={formData.roomPricing.triple}
                        onChange={(e) => setFormData({ ...formData, roomPricing: { ...formData.roomPricing, triple: Number(e.target.value) } })}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                      />
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-600 mb-1">غرفة ثنائية (Double)</div>
                      <input
                        type="number"
                        value={formData.roomPricing.double}
                        onChange={(e) => setFormData({ ...formData, roomPricing: { ...formData.roomPricing, double: Number(e.target.value) } })}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                      />
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-600 mb-1">غرفة فردية (Single)</div>
                      <input
                        type="number"
                        value={formData.roomPricing.single}
                        onChange={(e) => setFormData({ ...formData, roomPricing: { ...formData.roomPricing, single: Number(e.target.value) } })}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Archiving Toggle Checkbox */}
                <div className="bg-amber-50/60 border border-amber-200/70 p-3.5 rounded-xl flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isArchivedFormCheck"
                    checked={formData.isArchived || false}
                    onChange={(e) => setFormData({ ...formData, isArchived: e.target.checked })}
                    className="w-4 h-4 text-[#0F382E] focus:ring-[#0F382E] border-slate-300 rounded cursor-pointer"
                  />
                  <div>
                    <label htmlFor="isArchivedFormCheck" className="text-xs font-bold text-slate-800 cursor-pointer block">
                      نقل هذا البرنامج إلى أرشيف البرامج المنتهية
                    </label>
                    <span className="text-[11px] text-slate-500">
                      تفعيل هذا الخيار سيحفظ البرنامج في الأرشيف دون حذفه ويزيله من قائمة البرامج النشطة الحالية.
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                {editingProgram ? (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteProgram(editingProgram.id);
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف هذا البرنامج</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all border border-emerald-700"
                  >
                    {editingProgram ? 'حفظ التعديلات' : 'إنشاء البرنامج وحفظ البيانات'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROGRAM DETAILS MODAL */}
      {selectedProgramDetails && (() => {
        const stats = getProgramStats(selectedProgramDetails);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full my-8 border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-emerald-900 text-white p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full inline-block">
                      {selectedProgramDetails.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      stats.computedStatus === 'مفتوح للتسجيل'
                        ? 'bg-emerald-800 text-emerald-100 border border-emerald-700'
                        : stats.computedStatus === 'اكتمل العدد'
                        ? 'bg-rose-900 text-rose-100 border border-rose-700'
                        : 'bg-slate-800 text-slate-200'
                    }`}>
                      {stats.computedStatus}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-['Alexandria',sans-serif]">
                    {selectedProgramDetails.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProgramDetails(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto text-xs text-slate-700">
                {/* 1. SEATS & REGISTRATION LIVE METRICS DASHBOARD */}
                <div className="bg-emerald-950 text-white p-5 rounded-2xl space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-sm text-amber-300">
                        إحصائيات وإحداثيات المقاعد والتسجيل في هذا البرنامج:
                      </h4>
                    </div>
                    <span className={`text-xs font-black px-3 py-1 rounded-full w-fit ${
                      stats.isFull
                        ? 'bg-rose-500 text-white'
                        : stats.isNearlyFull
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      نسبة الامتلاء الحالية: {stats.fillPercentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-300 block">السعة الإجمالية</span>
                      <strong className="text-white text-lg font-black">{stats.totalSeats}</strong>
                      <span className="text-[10px] text-slate-400 block">مقعد متاح</span>
                    </div>

                    <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-400/30">
                      <span className="text-[11px] text-emerald-300 block font-bold">المسجلون الفعليون</span>
                      <strong className="text-emerald-400 text-lg font-black">{stats.activeCount}</strong>
                      <span className="text-[10px] text-emerald-200 block">معتمر مؤكد</span>
                    </div>

                    <div className={`p-3 rounded-xl border ${
                      stats.remainingSeats === 0
                        ? 'bg-rose-500/20 border-rose-400/30 text-rose-300'
                        : 'bg-blue-500/20 border-blue-400/30 text-blue-300'
                    }`}>
                      <span className="text-[11px] block font-bold">المقاعد المتبقية</span>
                      <strong className="text-lg font-black">{stats.remainingSeats}</strong>
                      <span className="text-[10px] block">{stats.remainingSeats > 0 ? 'مقعد شاغر' : 'لا توجد مقاعد'}</span>
                    </div>

                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-300 block">المنسحبون / الملغاة</span>
                      <strong className="text-rose-400 text-lg font-black">{stats.withdrawnCount}</strong>
                      <span className="text-[10px] text-slate-400 block">حالة انسحاب/إلغاء</span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1 pt-1">
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.isFull ? 'bg-rose-500' : stats.isNearlyFull ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(stats.fillPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <span>{stats.activeCount} مسجل من أصل {stats.totalSeats} مقعد</span>
                      <span>{stats.remainingSeats > 0 ? `متبقي ${stats.remainingSeats} مقاعد للاكتمال` : 'اكتملت السعة بالكامل'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. REGISTERED PILGRIMS IN THIS PROGRAM */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#0F382E]" />
                        <span>قائمة المعتمرين والحجاج المسجلين في هذا البرنامج ({stats.activeCount})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        جميع المعتمرين المسجلين رسمياً في هذه الرحلة مع حالة التأشيرة والدفعات.
                      </p>
                    </div>

                    {onOpenNewPilgrimWithProgram && !selectedProgramDetails.isArchived && (
                      <button
                        type="button"
                        onClick={() => {
                          const prog = selectedProgramDetails;
                          setSelectedProgramDetails(null);
                          onOpenNewPilgrimWithProgram(prog.id, prog.name);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0F382E] hover:bg-[#1a4d41] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>تسجيل معتمر جديد في هذا البرنامج</span>
                      </button>
                    )}
                  </div>

                  {stats.activePilgrims.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-2.5">
                      <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                        <Users className="w-5 h-5 text-[#0F382E]" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        لم يتم تسجيل أي معتمر في هذا البرنامج حتى الآن
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        البرنامج جديد والمقاعد شاغرة بالكامل ({stats.totalSeats} مقعد متاح). يمكنك تسجيل المعتمرين وإضافتهم مباشرة.
                      </p>
                      {onOpenNewPilgrimWithProgram && !selectedProgramDetails.isArchived && (
                        <button
                          type="button"
                          onClick={() => {
                            const prog = selectedProgramDetails;
                            setSelectedProgramDetails(null);
                            onOpenNewPilgrimWithProgram(prog.id, prog.name);
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F382E] text-white text-xs font-bold hover:bg-[#1a4d41] transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>تسجيل أول معتمر في هذا البرنامج</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">اسم المعتمر</th>
                              <th className="p-2.5">رقم الجواز</th>
                              <th className="p-2.5">الهاتف</th>
                              <th className="p-2.5">نوع الغرفة</th>
                              <th className="p-2.5">التأشيرة</th>
                              <th className="p-2.5">حالة الدفع</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {stats.activePilgrims.map((pilgrim) => (
                              <tr key={pilgrim.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{pilgrim.fullName}</span>
                                </td>
                                <td className="p-2.5 font-mono text-slate-700">{pilgrim.passportNumber}</td>
                                <td className="p-2.5 text-slate-600">{pilgrim.phone}</td>
                                <td className="p-2.5">
                                  <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                    غرفة {pilgrim.roomType}
                                  </span>
                                </td>
                                <td className="p-2.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    pilgrim.visaStatus === 'تم إصدار التأشيرة'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {pilgrim.visaStatus}
                                  </span>
                                </td>
                                <td className="p-2.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    pilgrim.paymentStatus === 'مدفوع بالكامل'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : pilgrim.paymentStatus === 'مدفوع جزئياً'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {pilgrim.paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Withdrawn/Cancelled pilgrims list if any */}
                  {stats.withdrawnPilgrims.length > 0 && (
                    <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                        <UserX className="w-4 h-4 text-rose-600" />
                        <span>معتمرون انسحبوا أو ألغيت حجوزاتهم ({stats.withdrawnPilgrims.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {stats.withdrawnPilgrims.map((p) => (
                          <div key={p.id} className="bg-white p-2.5 rounded-lg border border-rose-100 flex items-center justify-between">
                            <span className="font-bold text-slate-800">{p.fullName}</span>
                            <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                              {p.inCorbeille ? 'سلة المهملات' : 'حجز ملغى'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">وصف البرنامج والمزايا:</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedProgramDetails.description}</p>
                </div>

                {/* Flight & Dates */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">تاريخ الذهاب:</span>
                    <strong className="text-slate-900 text-sm">{selectedProgramDetails.travelDate}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">تاريخ العودة:</span>
                    <strong className="text-slate-900 text-sm">{selectedProgramDetails.returnDate}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">مدينة المغادرة:</span>
                    <strong className="text-slate-900 text-sm">{selectedProgramDetails.departureCity}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">شركة الطيران:</span>
                    <strong className="text-slate-900 text-sm">{selectedProgramDetails.airline}</strong>
                  </div>
                </div>

                {/* Hotels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-amber-200 bg-amber-50/40 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">فندق مكة المكرمة</span>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                        {selectedProgramDetails.makkahHotel.stars} نجوم
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900">{selectedProgramDetails.makkahHotel.name}</div>
                    <div className="text-slate-600">المسافة عن الحرم المكي: {selectedProgramDetails.makkahHotel.distanceToHaram} متر</div>
                    <div className="text-slate-500 text-[11px]">{selectedProgramDetails.makkahHotel.address}</div>
                  </div>

                  <div className="border border-emerald-200 bg-emerald-50/40 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900">فندق المدينة المنورة</span>
                      <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                        {selectedProgramDetails.madinahHotel.stars} نجوم
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900">{selectedProgramDetails.madinahHotel.name}</div>
                    <div className="text-slate-600">المسافة عن المسجد النبوي: {selectedProgramDetails.madinahHotel.distanceToHaram} متر</div>
                    <div className="text-slate-500 text-[11px]">{selectedProgramDetails.madinahHotel.address}</div>
                  </div>
                </div>

                {/* Room Pricing */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
                  <h4 className="font-bold text-amber-300 text-sm">أسعار الغرف والإقامة المعتمدة (MAD):</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-300 block">غرفة خماسية</span>
                      <strong className="text-amber-400 text-base">{formatMAD(selectedProgramDetails.roomPricing.quintuple || 0)}</strong>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-300 block">غرفة رباعية</span>
                      <strong className="text-amber-400 text-base">{formatMAD(selectedProgramDetails.roomPricing.quad)}</strong>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-300 block">غرفة ثلاثية</span>
                      <strong className="text-amber-400 text-base">{formatMAD(selectedProgramDetails.roomPricing.triple)}</strong>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-300 block">غرفة ثنائية</span>
                      <strong className="text-amber-400 text-base">{formatMAD(selectedProgramDetails.roomPricing.double)}</strong>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-300 block">غرفة فردية</span>
                      <strong className="text-amber-400 text-base">{formatMAD(selectedProgramDetails.roomPricing.single)}</strong>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown Info for Management */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900">هيكل التكاليف الداخلية (Cost Breakdown):</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px] text-slate-600">
                    <div>طيران: <strong className="text-slate-900">{formatMAD(selectedProgramDetails.costBreakdown.flightCost)}</strong></div>
                    <div>فنادق: <strong className="text-slate-900">{formatMAD(selectedProgramDetails.costBreakdown.hotelCost)}</strong></div>
                    <div>تأشيرة: <strong className="text-slate-900">{formatMAD(selectedProgramDetails.costBreakdown.visaCost)}</strong></div>
                    <div>تنقلات: <strong className="text-slate-900">{formatMAD(selectedProgramDetails.costBreakdown.transportCost)}</strong></div>
                    <div>هامش ربح: <strong className="text-emerald-700">{selectedProgramDetails.costBreakdown.profitMargin}%</strong></div>
                    <div>السعر المقترح: <strong className="text-amber-700">{formatMAD(selectedProgramDetails.costBreakdown.suggestedSellingPrice)}</strong></div>
                  </div>
                </div>

                {/* Action Buttons in Details Modal */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteProgram(selectedProgramDetails.id);
                        setSelectedProgramDetails(null);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف نهائي</span>
                    </button>

                    {selectedProgramDetails.isArchived ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleRestoreProgram(selectedProgramDetails.id);
                          setSelectedProgramDetails(null);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-emerald-300 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <ArchiveRestore className="w-4 h-4 text-emerald-600" />
                        <span>استعادة من الأرشيف</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleArchiveProgram(selectedProgramDetails.id);
                          setSelectedProgramDetails(null);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Archive className="w-4 h-4 text-amber-600" />
                        <span>أرشفة هذا البرنامج</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const progToEdit = selectedProgramDetails;
                        setSelectedProgramDetails(null);
                        handleOpenEditModal(progToEdit);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#0F382E] text-white font-bold hover:bg-[#1a4d41] transition-colors flex items-center gap-1.5"
                    >
                      <Edit className="w-4 h-4 text-[#D4AF37]" />
                      <span>تعديل هذا البرنامج</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProgramDetails(null)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
