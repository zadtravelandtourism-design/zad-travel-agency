import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  CreditCard,
  Receipt,
  BedDouble,
  Building2,
  BarChart3,
  Bell,
  Download,
  Plus,
  RotateCcw,
  ChevronLeft,
  X,
} from 'lucide-react';
import { ZadLogo } from './ZadLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewProgram: () => void;
  onOpenNewPilgrim: () => void;
  onOpenNewBooking: () => void;
  onClearAll?: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewProgram,
  onOpenNewPilgrim,
  onOpenNewBooking,
  onClearAll,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, desc: 'نظرة عامة وإحصائيات الشاملة' },
    { id: 'programs', label: 'البرامج والرحلات', icon: Calendar, desc: 'برامج العمرة والحج' },
    { id: 'pilgrims', label: 'المعتمرين والحجاج', icon: Users, desc: 'سجل المعتمرين والوثائق' },
    { id: 'families', label: 'العائلات والمجموعات', icon: UserCheck, desc: 'تجميع العائلات والمرافقين' },
    { id: 'bookings', label: 'الحجوزات والمالية', icon: CreditCard, desc: 'سجل الحجوزات والوصولات' },
    { id: 'payments', label: 'المدفوعات والفواتير', icon: Receipt, desc: 'تحصيل الفواتير والأقساط' },
    { id: 'hotels', label: 'إدارة وتسكين الفنادق', icon: BedDouble, desc: 'تسكين الغرف وحالة الأسرة' },
    { id: 'reports', label: 'التقارير المحاسبية', icon: BarChart3, desc: 'الأرباح والتكاليف والشيكات' },
    { id: 'alerts', label: 'تنبيهات العمليات', icon: Bell, desc: 'الجوازات والتأشيرات والمستحقات' },
    { id: 'export', label: 'تصدير البيانات', icon: Download, desc: 'القوائم والنسخ الاحتياطي' },
    { id: 'partners', label: 'الفنادق والشركاء', icon: Building2, desc: 'دليل الفنادق والموردين' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Vertical Sidebar on Right (RTL Layout) */}
      <aside
        className={`fixed top-0 right-0 h-screen w-64 bg-[#003425] text-white z-50 flex flex-col justify-between border-l border-[#00261b] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* Upper Sidebar Section */}
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-[#004d37] flex items-center justify-between">
            <div 
              onClick={() => { setActiveTab('dashboard'); setIsOpenMobile(false); }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg border border-amber-200/50 group-hover:scale-105 transition-transform overflow-hidden">
                <ZadLogo size="sm" showText={false} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black tracking-tight text-white font-['Alexandria',sans-serif]">
                    زاد للسفر والسياحة
                  </h1>
                </div>
                <span className="text-[10px] text-[#E5B842] font-bold tracking-wider">
                  ZAD TRAVEL & TOURISM
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsOpenMobile(false)}
              className="md:hidden text-emerald-200 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary CTA Action Button */}
          <div className="p-4 relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="w-full bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 border border-amber-200/60"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة جديدة</span>
            </button>

            {/* Quick Action Dropdown inside Sidebar */}
            {showQuickMenu && (
              <div className="mt-2 w-full bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                  إجراء جديد سريع
                </div>
                <button
                  onClick={() => { onOpenNewProgram(); setShowQuickMenu(false); setIsOpenMobile(false); }}
                  className="w-full text-right px-3 py-2 text-xs hover:bg-[#F4F7F6] text-[#003425] font-semibold flex items-center gap-2 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#003425]" />
                  إضافة برنامج رحلة
                </button>
                <button
                  onClick={() => { onOpenNewPilgrim(); setShowQuickMenu(false); setIsOpenMobile(false); }}
                  className="w-full text-right px-3 py-2 text-xs hover:bg-[#F4F7F6] text-[#003425] font-semibold flex items-center gap-2 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-[#003425]" />
                  تسجيل حاجز/معتمر
                </button>
                <button
                  onClick={() => { onOpenNewBooking(); setShowQuickMenu(false); setIsOpenMobile(false); }}
                  className="w-full text-right px-3 py-2 text-xs hover:bg-[#F4F7F6] text-[#003425] font-semibold flex items-center gap-2 transition-colors border-b border-slate-100"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#E5B842]" />
                  إصدار حجز ووصل دفع
                </button>
                {onClearAll && (
                  <button
                    onClick={() => { onClearAll(); setShowQuickMenu(false); setIsOpenMobile(false); }}
                    className="w-full text-right px-3 py-2 text-[11px] hover:bg-rose-50 text-rose-700 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    تصفير كافة البيانات
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1.5 flex-1">
            <div className="px-3 text-[10px] font-bold text-emerald-300/60 uppercase tracking-wider mb-2">
              القائمة الرئيسية
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#004d37] text-white border-r-4 border-[#E5B842] shadow-md'
                      : 'text-emerald-100/80 hover:bg-[#00422f] hover:text-white border-r-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E5B842]' : 'text-emerald-300/70'}`} />
                    <div className="flex flex-col text-right">
                      <span>{item.label}</span>
                      <span className="text-[9px] font-normal text-emerald-200/50">{item.desc}</span>
                    </div>
                  </div>
                  {isActive && <ChevronLeft className="w-3.5 h-3.5 text-[#E5B842]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-[#004d37] bg-[#00281c]/60 text-xs text-emerald-100/70">
          <div className="flex items-center justify-center text-[10px]">
            <span className="text-emerald-200/60">منظومة إدارة الوكالة</span>
          </div>
        </div>
      </aside>
    </>
  );
};
