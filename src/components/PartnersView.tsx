import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  Star,
  MapPin,
  Phone,
  Mail,
  Bus,
  ShieldCheck,
  Building,
  UserCheck,
  X
} from 'lucide-react';
import { Partner } from '../types';

interface PartnersViewProps {
  partners: Partner[];
  onCreatePartner: (partner: Omit<Partner, 'id'>) => Promise<void>;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  partners,
  onCreatePartner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('الكل');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'فندق مكة' as any,
    location: 'مكة المكرمة - جبل عمر',
    rating: 5,
    distanceToHaram: 300,
    contactName: '',
    phone: '+966 ',
    email: '',
    services: ['خدمة الاستقبال والغرف 24/7', 'بوفيه طعام مفتوح', 'إنترنت مجاني'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreatePartner(formData);
    setIsModalOpen(false);
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'الكل' || p.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F382E] bg-[#F4F7F6] px-2.5 py-1 rounded-full w-fit mb-1 border border-emerald-900/10">
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            دليل الفنادق وشركاء الخدمة
          </div>
          <h2 className="text-2xl font-black text-[#0F382E] font-['Alexandria',sans-serif]">
            دليل فنادق مكة والمدينة وشركات النقل
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            دليل الفنادق الخمس والأربع نجوم المعتمدة بمكة والمدينة الشريفة، أطقم النقل بالحافلات، وموردي الخدمات.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0F382E] hover:bg-[#1a4d41] text-white font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all border border-[#0F382E] active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>إضافة فندق / شريك جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث باسم الفندق، الشريك، المدينة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs bg-[#F4F7F6] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F382E] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedType('الكل')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedType === 'الكل' ? 'bg-[#0F382E] text-white shadow-sm' : 'bg-[#F4F7F6] text-slate-600'
            }`}
          >
            الكل ({partners.length})
          </button>
          <button
            onClick={() => setSelectedType('فندق مكة')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedType === 'فندق مكة' ? 'bg-[#0F382E] text-white shadow-sm' : 'bg-[#F4F7F6] text-slate-600'
            }`}
          >
            فنادق مكة المكرمة
          </button>
          <button
            onClick={() => setSelectedType('فندق المدينة')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedType === 'فندق المدينة' ? 'bg-[#0F382E] text-white shadow-sm' : 'bg-[#F4F7F6] text-slate-600'
            }`}
          >
            فنادق المدينة المنورة
          </button>
          <button
            onClick={() => setSelectedType('شركة نقل حافلات')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedType === 'شركة نقل حافلات' ? 'bg-[#0F382E] text-white shadow-sm' : 'bg-[#F4F7F6] text-slate-600'
            }`}
          >
            النقل والحافلات
          </button>
        </div>
      </div>

      {/* Grid of Partners */}
      {filteredPartners.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F4F7F6] text-[#0F382E] flex items-center justify-center font-bold">
            <Building2 className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-[#0F382E] text-base font-['Alexandria',sans-serif]">
              دليل الفنادق والشركاء فارغ حالياً
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              يمكنك إضافة أسعار وبيانات الفنادق المتعاقد معها في مكة المكرمة والمدينة المنورة وشركات النقل الحافلات.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0F382E] hover:bg-[#1a4d41] text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>إضافة فندق أو شريك جديد</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPartners.map((ptr) => (
          <div
            key={ptr.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 hover:border-[#D4AF37] transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F4F7F6] text-[#0F382E] border border-slate-200 flex items-center justify-center font-bold text-lg">
                  {ptr.type.includes('فندق') ? <Building2 className="w-6 h-6" /> : <Bus className="w-6 h-6" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold bg-[#F4F7F6] text-[#0F382E] px-2 py-0.5 rounded-full border border-emerald-900/10">
                    {ptr.type}
                  </span>
                  <h3 className="text-base font-bold text-[#0F382E] mt-1">
                    {ptr.name}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ptr.location}</span>
                  </div>
                </div>
              </div>

              {/* Rating stars */}
              <div className="flex items-center gap-0.5 text-[#D4AF37]">
                {Array.from({ length: ptr.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
            </div>

            {/* Distance or Services info */}
            {ptr.distanceToHaram !== undefined && (
              <div className="bg-[#F4F7F6] p-3 rounded-lg border border-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>المسافة عن ساحة الحرم:</span>
                <span className="font-bold text-[#0F382E]">{ptr.distanceToHaram} متر</span>
              </div>
            )}

            {/* Services badges */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500">الخدمات والمميزات:</span>
              <div className="flex flex-wrap gap-1.5">
                {ptr.services.map((srv, idx) => (
                  <span key={idx} className="bg-[#F4F7F6] text-[#0F382E] text-[11px] font-medium px-2.5 py-0.5 rounded-md border border-slate-200">
                    ✓ {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Person */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>المسؤول: <strong>{ptr.contactName}</strong></span>
              </div>
              <a
                href={`tel:${ptr.phone}`}
                className="flex items-center gap-1 text-[#0F382E] font-bold bg-[#F4F7F6] px-2.5 py-1 rounded-md border border-slate-200"
              >
                <Phone className="w-3.5 h-3.5 text-[#0F382E]" />
                <span>{ptr.phone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* CREATE PARTNER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-amber-500 text-emerald-950 p-5 flex items-center justify-between">
              <h3 className="font-bold text-base font-['Alexandria',sans-serif]">
                إضافة فندق أو شريك خدمة جديد
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-black/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم الفندق / الشركة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فندق أبراج الكسوة"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">النوع</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="فندق مكة">فندق مكة</option>
                    <option value="فندق المدينة">فندق المدينة</option>
                    <option value="شركة نقل حافلات">شركة نقل حافلات</option>
                    <option value="مورد تأشيرات">مورد تأشيرات</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الموقع / العنوان</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">التقييم (النجوم 1-5)</label>
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">المسافة عن الحرم (متر)</label>
                  <input
                    type="number"
                    value={formData.distanceToHaram}
                    onChange={(e) => setFormData({ ...formData, distanceToHaram: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">اسم الشخص المسؤول *</label>
                  <input
                    type="text"
                    required
                    placeholder="الاسم الكامل للوكيل"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">رقم الهاتف التواصل *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-5 py-2 rounded-xl"
                >
                  حفظ الشريك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
