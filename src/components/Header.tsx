import React from 'react';
import { AGENCY_DETAILS } from '../data/mockData';
import {
  Compass,
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  Building2,
  Phone,
  MapPin,
  Plus,
  Receipt,
  RotateCcw
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewProgram: () => void;
  onOpenNewPilgrim: () => void;
  onOpenNewBooking: () => void;
  onClearAll?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewProgram,
  onOpenNewPilgrim,
  onOpenNewBooking,
  onClearAll,
}) => {
  const [showQuickMenu, setShowQuickMenu] = React.useState(false);

  const navItems: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'programs', label: 'البرامج والرحلات', icon: Calendar },
    { id: 'pilgrims', label: 'الحجاج والمعتمرون', icon: Users },
    { id: 'bookings', label: 'الحجوزات والمالية', icon: CreditCard },
    { id: 'payments', label: 'المدفوعات والفواتير', icon: Receipt },
    { id: 'partners', label: 'الفنادق والشركاء', icon: Building2 },
  ];

  return (
    <header className="bg-[#0B382C] text-white shadow-xl border-b border-[#144b3c] sticky top-0 z-40">
      {/* Top Bar with Agency Info */}
      <div className="bg-[#072920] border-b border-[#124235] text-[11px] sm:text-xs text-emerald-100/90 py-1.5 px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-[#D4AF37]">
              زاد للسفر والسياحة (Zad Travel & Tourism)
            </span>
            <span className="hidden md:inline text-[#1a4d41]">•</span>
            <span className="hidden md:flex items-center gap-1 text-emerald-200/80">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              {AGENCY_DETAILS.address}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:+212524209713" className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors dir-ltr">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              {AGENCY_DETAILS.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation Row - All side by side */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        
        {/* Logo & Agency Title */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D4AF37] text-[#0B382C] flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform border border-amber-200/60">
            ز
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white font-['Alexandria',sans-serif]">
                زَاد للسفر
              </h1>
              <span className="text-[9px] sm:text-[10px] bg-[#164d3f] text-[#D4AF37] font-bold px-2 py-0.5 rounded-md border border-[#D4AF37]/30 whitespace-nowrap">
                للحج والعمرة
              </span>
            </div>
            <p className="text-[10px] text-emerald-100/70 font-medium whitespace-nowrap">
              إدارة رحلات الحج والعمرة والخدمات الفندقية
            </p>
          </div>
        </div>

        {/* Navigation Tabs - Centered side-by-side in one row */}
        <nav className="flex items-center gap-1.5 shrink-0 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#154a3b] text-white border-2 border-[#D4AF37] shadow-lg ring-1 ring-[#D4AF37]/30'
                    : 'text-emerald-100/80 hover:bg-[#154a3b]/60 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-emerald-300/80'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Quick Actions Dropdown Button (Far left) */}
        <div className="relative shrink-0 flex items-center">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="bg-[#D4AF37] hover:bg-[#c49f2f] text-[#0B382C] font-extrabold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 border border-amber-200/80 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة جديدة</span>
          </button>

          {showQuickMenu && (
            <div className="absolute left-0 top-full mt-2 w-52 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                إجراء سريع
              </div>
              <button
                onClick={() => { onOpenNewProgram(); setShowQuickMenu(false); }}
                className="w-full text-right px-4 py-2.5 text-xs hover:bg-[#F4F7F6] text-[#0F382E] font-semibold flex items-center gap-2 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-[#0F382E]/10 text-[#0F382E] flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                إنشاء برنامج جديد
              </button>
              <button
                onClick={() => { onOpenNewPilgrim(); setShowQuickMenu(false); }}
                className="w-full text-right px-4 py-2.5 text-xs hover:bg-[#F4F7F6] text-[#0F382E] font-semibold flex items-center gap-2 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-[#0F382E]/10 text-[#0F382E] flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
                تسجيل حاج / معتمر
              </button>
              <button
                onClick={() => { onOpenNewBooking(); setShowQuickMenu(false); }}
                className="w-full text-right px-4 py-2.5 text-xs hover:bg-[#F4F7F6] text-[#0F382E] font-semibold flex items-center gap-2 transition-colors border-b border-slate-100"
              >
                <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/20 text-[#0F382E] flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                إصدار حجز ووصل مال
              </button>
              {onClearAll && (
                <button
                  onClick={() => { onClearAll(); setShowQuickMenu(false); }}
                  className="w-full text-right px-4 py-2 text-xs hover:bg-rose-50 text-rose-700 font-semibold flex items-center gap-2 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                  تصفير السجلات (بدء سجل جديد)
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

