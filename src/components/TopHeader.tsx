import React from 'react';
import {
  Menu,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Bell,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { ZadLogo } from './ZadLogo';
import { AGENCY_DETAILS } from '../data/mockData';

interface TopHeaderProps {
  activeTab: string;
  onOpenNewProgram: () => void;
  onOpenNewPilgrim: () => void;
  onOpenNewBooking: () => void;
  onOpenMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenNewProgram,
  onOpenNewPilgrim,
  onOpenNewBooking,
  onOpenMobileMenu,
}) => {
  const getTabTitles = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'لوحة التحكم الرئيسية', subtitle: 'متابعة مؤشرات الأداء والمالية لوكالة زاد للسفر والسياحة' };
      case 'programs':
        return { title: 'إدارة البرامج والرحلات', subtitle: 'برامج رحلات العمرة والحج وتفاصيل الإقامة بالطيران' };
      case 'pilgrims':
        return { title: 'سجل الحجاج والمعتمرين', subtitle: 'متابعة الجوازات والتأشيرات والملفات الفردية والعائلية' };
      case 'bookings':
        return { title: 'نظام الحجوزات والتحصيل', subtitle: 'تسجيل الحجوزات وتوليد وصولات الاستلام الرسمية' };
      case 'payments':
        return { title: 'المدفوعات والفواتير', subtitle: 'متابعة الدفعات النقدية والبنكية والمبالغ المتبقية' };
      case 'families':
        return { title: 'إدارة العائلات والمجموعات', subtitle: 'تجميع المعتمرين في مجموعات عائلية وإدارة سكنهم ومرافقيهم' };
      case 'hotels':
        return { title: 'إدارة وتسكين الفنادق وحالة الغرف', subtitle: 'تسكين المعتمرين في فنادق مكة والمدينة وتتبع الأسرة الشاغرة' };
      case 'alerts':
        return { title: 'تنبيهات العمليات والجوازات', subtitle: 'متابعة تنبيهات صلاحية الجوازات، التأشيرات، والمبالغ المستحقة' };
      case 'reports':
        return { title: 'التقارير المحاسبية والمالية', subtitle: 'تقارير الأرباح، التكاليف، الإيرادات، ومتابعة الشيكات البنكية' };
      case 'export':
        return { title: 'تصدير البيانات والنسخ الاحتياطي', subtitle: 'تصدير قوائم التسكين، المانفيستو، وسجلات المعتمرين والنسخ الاحتياطي' };
      case 'partners':
        return { title: 'دليل الفنادق والشركاء', subtitle: 'بيانات فنادق مكة المكرمة والمدينة المنورة وشركات النقل' };
      default:
        return { title: 'وكالة زاد للسفر والسياحة', subtitle: 'نظام إدارة الحج والعمرة' };
    }
  };

  const { title, subtitle } = getTabTitles(activeTab);

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Right Section: Mobile Toggle & Page Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#003425] hover:bg-slate-100 transition-colors"
            aria-label="تنسيق القائمة"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-[#003425] font-['Alexandria',sans-serif]">
                {title}
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold bg-[#E5B842]/20 text-[#003425] px-2 py-0.5 rounded border border-[#E5B842]/40">
                زاد للسفر والسياحة
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden xs:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Left Section: Action Buttons & Agency Status */}
        <div className="flex items-center gap-2.5">
          {/* Quick Add Program/Booking buttons */}
          {activeTab === 'programs' && (
            <button
              onClick={onOpenNewProgram}
              className="bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">برنامج جديد</span>
            </button>
          )}

          {activeTab === 'pilgrims' && (
            <button
              onClick={onOpenNewPilgrim}
              className="bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">تسجيل معتمر</span>
            </button>
          )}

          {(activeTab === 'bookings' || activeTab === 'payments' || activeTab === 'dashboard') && (
            <button
              onClick={onOpenNewBooking}
              className="bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إصدار حجز جديد</span>
            </button>
          )}

          {/* Agency Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-[#003425] text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#00261b]">
            <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center p-0.5 overflow-hidden">
              <ZadLogo size="sm" showText={false} />
            </div>
            <span>زاد للسفر والسياحة</span>
          </div>
        </div>

      </div>
    </header>
  );
};
