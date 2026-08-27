import React from 'react';
import { MapPin, Phone, Mail, Compass } from 'lucide-react';
import { AGENCY_DETAILS } from '../data/mockData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#003425] text-white border-t-2 border-[#E5B842]/40 relative overflow-hidden no-print mt-16 font-['Alexandria',sans-serif]">
      {/* Subtle Background Pattern Decorative Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#004834]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#E5B842]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
          
          {/* Column 1: Branding & Description */}
          <div className="space-y-4 text-right">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5B842] to-[#c49826] flex items-center justify-center text-[#003425] shadow-md flex-shrink-0">
                <Compass className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-black text-[#ffffff] text-lg sm:text-xl tracking-wide leading-tight">
                  زاد للسفر والسياحة
                </h3>
                <span className="text-[#E5B842] font-semibold text-xs tracking-wider block font-sans">
                  Zad Travel and Tourism
                </span>
              </div>
            </div>

            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed max-w-md font-medium">
              المنظومة الرقمية الشاملة لإدارة رحلات الحج والعمرة والخدمات الفندقية والحجوزات المالية لوكالة زاد للسفر والسياحة.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-200/70 font-semibold">
                خدمة ضيوف الرحمن بأعلى معايير الجودة
              </span>
            </div>
          </div>

          {/* Column 2: Contact Information */}
          <div className="space-y-4 text-right">
            <h4 className="font-bold text-[#E5B842] text-sm sm:text-base flex items-center gap-2 pb-1 border-b border-[#004d37]">
              <span>للتواصل والاستفسارات:</span>
            </h4>

            <ul className="space-y-3 text-xs sm:text-sm text-emerald-50/90 font-medium">
              {/* Address */}
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#004834] text-[#E5B842] flex-shrink-0 mt-0.5 border border-[#E5B842]/20 shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="leading-relaxed">
                  <span className="text-[#E5B842] font-bold block text-[11px]">العنوان:</span>
                  <span className="text-white text-xs">383 تجزئة الأمان، المحاميد، مراكش (قبالة مسجد الأميرة لالة آمنة الله)</span>
                </div>
              </li>

              {/* Phone */}
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#004834] text-[#E5B842] flex-shrink-0 mt-0.5 border border-[#E5B842]/20 shadow-xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#E5B842] font-bold block text-[11px]">الهاتف:</span>
                  <span 
                    dir="ltr" 
                    className="text-white text-xs inline-block font-mono tracking-wider font-semibold"
                    style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}
                  >
                    +212 5 24 20 97 13 &nbsp;/&nbsp; +212 6 64 61 00 61
                  </span>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#004834] text-[#E5B842] flex-shrink-0 mt-0.5 border border-[#E5B842]/20 shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#E5B842] font-bold block text-[11px]">البريد الإلكتروني:</span>
                  <span className="text-white text-xs dir-ltr inline-block font-mono">
                    zadtravelandtourism@gmail.com
                  </span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line across full footer */}
        <div className="mt-10 pt-6 border-t border-[#004431] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-emerald-200/60">
          <p className="text-center sm:text-right font-medium">
            © 2026 زاد للسفر والسياحة (Zad Travel and Tourism). جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4 text-emerald-100/50">
            <span>نظام إدارة رحلات العمرة والحج</span>
            <span>•</span>
            <span>مراكش - المملكة المغربية</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
