import React, { useState } from 'react';
import {
  BedDouble,
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  Users,
  MapPin,
  Trash2,
  UserCheck,
  Star,
  Bus,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  Sparkles,
  ExternalLink,
  Layers,
  X
} from 'lucide-react';
import { RoomAllocation, Pilgrim, Partner, Program } from '../types';

interface HotelAccommodationViewProps {
  allocations: RoomAllocation[];
  pilgrims: Pilgrim[];
  partners: Partner[];
  programs: Program[];
  onAddAllocation: (alloc: RoomAllocation) => void;
  onUpdateAllocation: (alloc: RoomAllocation) => void;
  onDeleteAllocation: (id: string) => void;
  onAddPartner?: (partner: Omit<Partner, 'id'>) => Promise<void>;
  onDeletePartner?: (id: string) => void;
}

export const HotelAccommodationView: React.FC<HotelAccommodationViewProps> = ({
  allocations,
  pilgrims,
  partners,
  programs,
  onAddAllocation,
  onUpdateAllocation,
  onDeleteAllocation,
  onAddPartner,
  onDeletePartner,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rooms' | 'hotels'>('rooms');
  const [selectedCity, setSelectedCity] = useState<'all' | 'مكة المكرمة' | 'المدينة المنورة'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);

  // New Hotel Form State
  const [hotelFormData, setHotelFormData] = useState({
    name: '',
    city: 'مكة المكرمة' as 'مكة المكرمة' | 'المدينة المنورة' | 'جدة',
    rating: 5,
    distanceToHaram: 350,
    hasShuttle: false,
    location: 'مكة المكرمة - أجياد المصافي',
    contactName: '',
    phone: '+966 ',
    email: '',
    selectedServices: ['خدمة استقبال 24/7', 'بوفيه إفطار مفتوح', 'واي فاي مجاني'] as string[],
  });

  // New Room Form State
  const hotelPartners = partners.filter(p => p.type === 'فندق مكة' || p.type === 'فندق المدينة' || p.type.includes('فندق'));
  const [hotelName, setHotelName] = useState(hotelPartners[0]?.name || 'فندق أنجم مكة');
  const [city, setCity] = useState<'مكة المكرمة' | 'المدينة المنورة'>('مكة المكرمة');
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [roomType, setRoomType] = useState<'خماسية' | 'رباعية' | 'ثلاثية' | 'ثنائية' | 'فردية'>('رباعية');
  const [capacity, setCapacity] = useState(4);
  const [selectedPilgrimIds, setSelectedPilgrimIds] = useState<string[]>([]);
  const [roomNotes, setRoomNotes] = useState('');

  const filteredAllocations = allocations.filter(alloc => {
    const matchesCity = selectedCity === 'all' || alloc.city === selectedCity;
    const matchesSearch = alloc.roomNumber.includes(searchTerm) || alloc.hotelName.includes(searchTerm);
    return matchesCity && matchesSearch;
  });

  const filteredHotels = hotelPartners.filter(h => {
    const isMakkah = h.type === 'فندق مكة' || h.location.includes('مكة');
    const isMadinah = h.type === 'فندق المدينة' || h.location.includes('المدينة');
    const matchesCity = selectedCity === 'all' || (selectedCity === 'مكة المكرمة' && isMakkah) || (selectedCity === 'المدينة المنورة' && isMadinah);
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const availablePilgrims = pilgrims.filter(p => !p.inCorbeille);

  // Handle Add Hotel Submission
  const handleHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelFormData.name.trim()) return;

    const partnerType = hotelFormData.city === 'المدينة المنورة' ? 'فندق المدينة' : 'فندق مكة';
    const servicesList = [...hotelFormData.selectedServices];
    if (hotelFormData.hasShuttle && !servicesList.includes('باص نقل مجاني للحرم')) {
      servicesList.push('باص نقل مجاني للحرم');
    }

    if (onAddPartner) {
      await onAddPartner({
        name: hotelFormData.name.trim(),
        type: partnerType,
        location: hotelFormData.location || `${hotelFormData.city} - المنطقة المركزية`,
        rating: hotelFormData.rating,
        distanceToHaram: Number(hotelFormData.distanceToHaram) || 0,
        contactName: hotelFormData.contactName || 'مسؤول الحجوزات',
        phone: hotelFormData.phone,
        email: hotelFormData.email,
        services: servicesList,
      });
    }

    setHotelName(hotelFormData.name.trim());
    setCity(hotelFormData.city === 'المدينة المنورة' ? 'المدينة المنورة' : 'مكة المكرمة');
    setIsHotelModalOpen(false);

    // Reset Hotel Form
    setHotelFormData({
      name: '',
      city: 'مكة المكرمة',
      rating: 5,
      distanceToHaram: 350,
      hasShuttle: false,
      location: 'مكة المكرمة - أجياد المصافي',
      contactName: '',
      phone: '+966 ',
      email: '',
      selectedServices: ['خدمة استقبال 24/7', 'بوفيه إفطار مفتوح', 'واي فاي مجاني'],
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber) return;

    const newAlloc: RoomAllocation = {
      id: `rm-${Date.now()}`,
      hotelId: `h-${Date.now()}`,
      hotelName,
      city,
      roomNumber,
      floor,
      roomType,
      capacity,
      pilgrimIds: selectedPilgrimIds,
      status: selectedPilgrimIds.length >= capacity ? 'مكتملة' : 'متاحة',
      notes: roomNotes,
    };

    onAddAllocation(newAlloc);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setRoomNumber('');
    setFloor(1);
    setSelectedPilgrimIds([]);
    setRoomNotes('');
  };

  const togglePilgrimSelection = (pId: string) => {
    if (selectedPilgrimIds.includes(pId)) {
      setSelectedPilgrimIds(prev => prev.filter(id => id !== pId));
    } else {
      if (selectedPilgrimIds.length < capacity) {
        setSelectedPilgrimIds(prev => [...prev, pId]);
      }
    }
  };

  const handleOpenRoomForHotel = (hName: string, hCity: 'مكة المكرمة' | 'المدينة المنورة') => {
    setHotelName(hName);
    setCity(hCity);
    setIsModalOpen(true);
  };

  const handlePrintRoomingList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>قائمة تسكين الغرف الفندقية - زاد للسفر والسياحة</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 25px; color: #111; }
          .header { text-align: center; border-bottom: 2px solid #003425; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { color: #003425; margin: 0; font-size: 22px; }
          .header p { color: #666; font-size: 13px; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: right; }
          th { background: #003425; color: white; }
          .footer { margin-top: 30px; text-align: left; font-size: 11px; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>وكالة زاد للسفر والسياحة - ZAD TRAVEL & TOURISM</h1>
          <p>جدول توزيع الغرف وتسكين المعتمرين بمكة المكرمة والمدينة المنورة</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>رقم الغرفة</th>
              <th>الطابق</th>
              <th>الفندق</th>
              <th>المدينة</th>
              <th>نوع الغرفة</th>
              <th>الأسرة المشغولة</th>
              <th>أسماء المعتمرين القاطنين</th>
            </tr>
          </thead>
          <tbody>
            ${allocations.map(a => {
              const occupants = pilgrims.filter(p => a.pilgrimIds.includes(p.id)).map(p => p.fullName).join(' - ');
              return `
                <tr>
                  <td><strong>غرفة ${a.roomNumber}</strong></td>
                  <td>طابق ${a.floor}</td>
                  <td>${a.hotelName}</td>
                  <td>${a.city}</td>
                  <td>${a.roomType}</td>
                  <td>${a.pilgrimIds.length} / ${a.capacity}</td>
                  <td>${occupants || 'شاغرة'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div class="footer">
          تم السحب بتاريخ: ${new Date().toLocaleDateString('ar-MA')} - زاد للسفر والسياحة
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const commonAmenities = [
    'خدمة استقبال 24/7',
    'بوفيه إفطار مفتوح',
    'واي فاي مجاني',
    'إطلالة مباشرة على الحرم',
    'مصلى وسماعات الحرم',
    'خدمة غسيل وكي الملابس',
    'قريب من ساحات الحرم',
    'مطاعم ومقاهي فندقية',
    'مصاعد سريعة وواسعة',
    'كراسي متحركة لذوي الاحتياجات'
  ];

  const toggleAmenity = (amenity: string) => {
    setHotelFormData(prev => {
      const exists = prev.selectedServices.includes(amenity);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter(s => s !== amenity)
          : [...prev.selectedServices, amenity]
      };
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-l from-[#003425] to-[#004d37] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#00261b]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-[#E5B842]" />
            <h2 className="text-xl font-black font-['Alexandria',sans-serif]">
              إدارة الفنادق والغرف والتسكين
            </h2>
          </div>
          <p className="text-xs text-emerald-100/80">
            دليل فنادق مكة المكرمة والمدينة المنورة، مصفوفة توزيع الغرف والأسرة وتسكين المعتمرين.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Hotel Button */}
          <button
            onClick={() => setIsHotelModalOpen(true)}
            className="bg-white text-[#003425] hover:bg-emerald-50 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-white transition-all active:scale-95"
          >
            <Building2 className="w-4 h-4 text-[#003425]" />
            <span>إضافة فندق جديد</span>
          </button>

          {/* Add Room Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 border border-amber-200/60"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة غرفة جديدة</span>
          </button>

          {/* Print Rooming List Button */}
          <button
            onClick={handlePrintRoomingList}
            className="bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-emerald-600 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-[#E5B842]" />
            <span>طباعة قائمة التسكين</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation (Rooms Matrix vs Hotels Directory) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('rooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'rooms'
                ? 'bg-[#003425] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-[#E5B842]" />
            <span>تسكين وحالة الغرف ({allocations.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hotels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'hotels'
                ? 'bg-[#003425] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#E5B842]" />
            <span>دليل الفنادق المعتمدة ({hotelPartners.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline-block font-medium">
          {activeSubTab === 'rooms' ? `إجمالي الغرف: ${allocations.length}` : `إجمالي الفنادق: ${hotelPartners.length}`}
        </span>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* City Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCity('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCity === 'all'
                ? 'bg-[#003425] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            جميع المدن ({activeSubTab === 'rooms' ? allocations.length : hotelPartners.length})
          </button>
          <button
            onClick={() => setSelectedCity('مكة المكرمة')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedCity === 'مكة المكرمة'
                ? 'bg-[#003425] text-[#E5B842] shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>مكة المكرمة</span>
          </button>
          <button
            onClick={() => setSelectedCity('المدينة المنورة')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedCity === 'المدينة المنورة'
                ? 'bg-[#003425] text-[#E5B842] shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>المدينة المنورة</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeSubTab === 'rooms' ? "بحث برقم الغرفة أو الفندق..." : "بحث باسم الفندق أو الموقع..."}
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#003425]"
          />
        </div>
      </div>

      {/* SUB-TAB 1: ROOMS MATRIX */}
      {activeSubTab === 'rooms' && (
        <>
          {filteredAllocations.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <BedDouble className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">لا توجد غرف مسجلة حالياً</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                قم بإضافة غرف فندقية وتسكين المعتمرين حسب البرامج والغرف الفردية والثنائية والثلاثية والرباعية والخماسية.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsHotelModalOpen(true)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-[#003425] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4 text-[#003425]" />
                  <span>إضافة فندق أولاً</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#003425] hover:bg-[#004d37] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#E5B842]" />
                  <span>إضافة غرفة جديدة</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAllocations.map((alloc) => {
                const occupants = pilgrims.filter(p => alloc.pilgrimIds.includes(p.id));
                const occupancyRate = (alloc.pilgrimIds.length / alloc.capacity) * 100;
                const isFull = alloc.pilgrimIds.length >= alloc.capacity;

                return (
                  <div
                    key={alloc.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[#003425] text-lg font-['Alexandria',sans-serif]">
                              غرفة #{alloc.roomNumber}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              طابق {alloc.floor}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{alloc.hotelName}</span>
                          </p>
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isFull
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {isFull ? 'غرفة مكتملة' : 'شاغرة جزئياً'}
                        </span>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                          <span>نوع الغرفة: {alloc.roomType}</span>
                          <span>الأسرة: {alloc.pilgrimIds.length} / {alloc.capacity}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${isFull ? 'bg-rose-500' : 'bg-[#003425]'}`}
                            style={{ width: `${occupancyRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Occupants List */}
                      <div className="space-y-1.5 pt-1">
                        <h4 className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                          <span>النزلاء القاطنون بالغرفة:</span>
                        </h4>
                        {occupants.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2.5 rounded-xl text-center border border-dashed border-slate-200">
                            الغرفة فارغة تماماً جاهزة للتسكين
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {occupants.map((occ, idx) => (
                              <div key={occ.id} className="flex items-center justify-between bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-[#003425] text-[#E5B842] font-bold text-[10px] flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <span className="font-bold text-slate-800">{occ.fullName}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500">{occ.passportNumber}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {alloc.city}
                      </span>

                      <button
                        onClick={() => onDeleteAllocation(alloc.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                        title="حذف هذه الغرفة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* SUB-TAB 2: HOTELS DIRECTORY */}
      {activeSubTab === 'hotels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#003425]" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#003425]">
                  دليل فنادق مكة المكرمة والمدينة المنورة المعتمدة
                </h3>
                <p className="text-[11px] text-slate-500">
                  يمكنك إضافة وتعديل الفنادق وربطها بالبرامج وتسكين الغرف الفندقية مباشرة.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHotelModalOpen(true)}
              className="bg-[#003425] hover:bg-[#004d37] text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-[#E5B842]" />
              <span>إضافة فندق جديد</span>
            </button>
          </div>

          {filteredHotels.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">لا توجد فنادق مضافة في الدليل حتى الآن</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                قم بالضغط على زر «إضافة فندق جديد» لتسجيل فنادق مكة والمدينة والمسافة عن الحرم والخدمات الفندقية.
              </p>
              <button
                onClick={() => setIsHotelModalOpen(true)}
                className="bg-[#003425] text-white font-bold px-5 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4 text-[#E5B842]" />
                <span>إضافة أول فندق الآن</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHotels.map((hotel) => {
                const hotelRooms = allocations.filter(a => a.hotelName === hotel.name);
                const totalOccupants = hotelRooms.reduce((acc, r) => acc + r.pilgrimIds.length, 0);
                const isMakkah = hotel.type === 'فندق مكة' || hotel.location.includes('مكة');

                return (
                  <div
                    key={hotel.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Hotel Card Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${
                            isMakkah
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {hotel.type}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm font-['Alexandria',sans-serif]">
                            {hotel.name}
                          </h3>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 text-amber-400 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                          {Array.from({ length: hotel.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>

                      {/* Location & Distance to Haram */}
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#003425] shrink-0" />
                          <span>{hotel.location}</span>
                        </div>

                        {hotel.distanceToHaram && hotel.distanceToHaram > 0 && (
                          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50/70 px-2.5 py-1 rounded-lg w-fit text-[11px] font-bold border border-amber-100">
                            <span>المسافة عن ساحات الحرم: {hotel.distanceToHaram} متر</span>
                          </div>
                        )}
                      </div>

                      {/* Active Allocations Pill */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">الغرف المسكنة بالفندق:</span>
                        <span className="text-[#003425] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {hotelRooms.length} غرفة ({totalOccupants} نزيل)
                        </span>
                      </div>

                      {/* Contact Info */}
                      {(hotel.contactName || hotel.phone) && (
                        <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-100 pt-2">
                          {hotel.contactName && (
                            <p className="flex items-center gap-1">
                              <span className="font-bold text-slate-700">المسؤول:</span> {hotel.contactName}
                            </p>
                          )}
                          {hotel.phone && (
                            <p className="flex items-center gap-1 font-mono text-slate-600" dir="ltr">
                              <Phone className="w-3 h-3 text-slate-400" /> {hotel.phone}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Services badges */}
                      {hotel.services && hotel.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {hotel.services.slice(0, 3).map((srv, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              {srv}
                            </span>
                          ))}
                          {hotel.services.length > 3 && (
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md">
                              +{hotel.services.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenRoomForHotel(hotel.name, isMakkah ? 'مكة المكرمة' : 'المدينة المنورة')}
                        className="bg-[#003425] hover:bg-[#004d37] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#E5B842]" />
                        <span>تسكين غرفة بهذا الفندق</span>
                      </button>

                      {onDeletePartner && (
                        <button
                          onClick={() => onDeletePartner(hotel.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                          title="حذف هذا الفندق"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: ADD HOTEL (إضافة فندق جديد) ================= */}
      {isHotelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-['Alexandria',sans-serif]">
                    إضافة فندق جديد للدليل
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    تسجيل بيانات الفندق والمسافة عن الحرم والخدمات المتاحة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHotelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHotelSubmit} className="space-y-4 text-xs">
              {/* Hotel Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الفندق *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فندق سويس أوتيل المقام مكة / فندق دار التقوى المدينة"
                  value={hotelFormData.name}
                  onChange={e => setHotelFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425] font-medium"
                />
              </div>

              {/* City & Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدينة *</label>
                  <select
                    value={hotelFormData.city}
                    onChange={e => {
                      const newCity = e.target.value as any;
                      setHotelFormData(prev => ({
                        ...prev,
                        city: newCity,
                        location: newCity === 'المدينة المنورة' ? 'المدينة المنورة - المنطقة المركزية الشمالية' : 'مكة المكرمة - أجياد المصافي'
                      }));
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425] font-bold"
                  >
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                    <option value="جدة">جدة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تصنيف النجوم</label>
                  <select
                    value={hotelFormData.rating}
                    onChange={e => setHotelFormData(prev => ({ ...prev, rating: parseInt(e.target.value) || 5 }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425] font-bold text-amber-600"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 نجوم فاخر)</option>
                    <option value="4">⭐⭐⭐⭐ (4 نجوم ممتاز)</option>
                    <option value="3">⭐⭐⭐ (3 نجوم اقتصادي)</option>
                    <option value="2">⭐⭐ (نجمتان)</option>
                  </select>
                </div>
              </div>

              {/* Distance to Haram & Shuttle Service */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسافة عن الحرم (بالمتر)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="مثلاً: 250"
                    value={hotelFormData.distanceToHaram}
                    onChange={e => setHotelFormData(prev => ({ ...prev, distanceToHaram: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">باص نقل للحرم (Shuttle)</label>
                  <select
                    value={hotelFormData.hasShuttle ? 'yes' : 'no'}
                    onChange={e => setHotelFormData(prev => ({ ...prev, hasShuttle: e.target.value === 'yes' }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                  >
                    <option value="no">لا - مسافة مشي على الأقدام</option>
                    <option value="yes">نعم - متوفر باص ترددي مجاناً</option>
                  </select>
                </div>
              </div>

              {/* Location Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">العنوان والموقع التفصيلي</label>
                <input
                  type="text"
                  placeholder="مثال: أبراج البيت / شارع إبراهيم الخليل / المنطقة المركزية الغربية"
                  value={hotelFormData.location}
                  onChange={e => setHotelFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                />
              </div>

              {/* Contact Person & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مسؤول الحجوزات بالفندق</label>
                  <input
                    type="text"
                    placeholder="الاسم واللقب"
                    value={hotelFormData.contactName}
                    onChange={e => setHotelFormData(prev => ({ ...prev, contactName: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف / الواتساب</label>
                  <input
                    type="text"
                    placeholder="+966 50 000 0000"
                    value={hotelFormData.phone}
                    onChange={e => setHotelFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                  />
                </div>
              </div>

              {/* Amenities & Services Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  الخدمات والمزايا المتاحة بالفندق:
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                  {commonAmenities.map((amenity) => {
                    const isSelected = hotelFormData.selectedServices.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`text-right p-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#003425] text-[#E5B842] font-bold shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span>{amenity}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-[#E5B842]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHotelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-[#003425] bg-[#E5B842] hover:bg-[#d6a933] font-black shadow-md border border-amber-200 transition-all active:scale-95"
                >
                  حفظ وإضافة الفندق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD ROOM ALLOCATION (إضافة غرفة وتسجيل النزلاء) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-['Alexandria',sans-serif]">
                  إضافة غرفة وتسجيل النزلاء
                </h3>
                <p className="text-[11px] text-slate-500">
                  تحديد الفندق ورقم الغرفة وتعيين المعتمرين المخصصين
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">الفندق المرتبط *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsHotelModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 underline"
                  >
                    + إضافة فندق غير موجود
                  </button>
                </div>
                <select
                  value={hotelName}
                  onChange={e => {
                    setHotelName(e.target.value);
                    const found = hotelPartners.find(h => h.name === e.target.value);
                    if (found) {
                      setCity(found.type === 'فندق المدينة' || found.location.includes('المدينة') ? 'المدينة المنورة' : 'مكة المكرمة');
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425] font-bold"
                >
                  {hotelPartners.map(prt => (
                    <option key={prt.id} value={prt.name}>{prt.name} ({prt.location})</option>
                  ))}
                  {hotelPartners.length === 0 && (
                    <>
                      <option value="فندق أنجم مكة (Anjum Makkah)">فندق أنجم مكة</option>
                      <option value="فندق أبراج الكسوة">فندق أبراج الكسوة</option>
                      <option value="فندق العقيق دار التقوى">فندق العقيق دار التقوى</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدينة *</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                  >
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الغرفة *</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    placeholder="مثال: 402"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الطابق</label>
                  <input
                    type="number"
                    value={floor}
                    onChange={e => setFloor(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع الغرفة</label>
                  <select
                    value={roomType}
                    onChange={e => {
                      const type = e.target.value as any;
                      setRoomType(type);
                      if (type === 'فردية') setCapacity(1);
                      if (type === 'ثنائية') setCapacity(2);
                      if (type === 'ثلاثية') setCapacity(3);
                      if (type === 'رباعية') setCapacity(4);
                      if (type === 'خماسية') setCapacity(5);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                  >
                    <option value="رباعية">رباعية</option>
                    <option value="ثلاثية">ثلاثية</option>
                    <option value="ثنائية">ثنائية</option>
                    <option value="خماسية">خماسية</option>
                    <option value="فردية">فردية</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعة الأسرة</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                  />
                </div>
              </div>

              {/* Select Pilgrims for this room */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  تسكين المعتمرين بهذه الغرفة ({selectedPilgrimIds.length} / {capacity}):
                </label>
                <div className="border border-slate-200 rounded-xl p-2 max-h-36 overflow-y-auto space-y-1 bg-slate-50">
                  {availablePilgrims.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-2">لا يوجد معتمرون مسجلون حالياً</p>
                  ) : (
                    availablePilgrims.map(p => {
                      const isChecked = selectedPilgrimIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => togglePilgrimSelection(p.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                            isChecked ? 'bg-emerald-100 text-[#003425] font-bold border border-emerald-300' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-[#003425]"
                            />
                            <span>{p.fullName}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{p.passportNumber}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-[#003425] hover:bg-[#004d37] font-bold shadow-md"
                >
                  حفظ الغرفة والتسكين
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
