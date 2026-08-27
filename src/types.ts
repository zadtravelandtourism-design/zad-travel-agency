export type ProgramType = string;

export type ProgramStatus = 'مفتوح للتسجيل' | 'اكتمل العدد' | 'انتهت' | 'قريباً';

export interface RoomPricing {
  quintuple?: number; // سعر الغرفة الخماسية
  quad: number;   // سعر الغرفة الرباعية
  triple: number; // سعر الغرفة الثلاثية
  double: number; // سعر الغرفة الثنائية
  single: number; // سعر الغرفة الفردية
}

export interface CostBreakdown {
  flightCost: number;       // تكلفة الطيران
  hotelCost: number;        // تكلفة الفنادق
  visaCost: number;         // التأشيرة والتأمين الصحي
  transportCost: number;    // التنقلات الحافلات والمزارات
  otherCost: number;        // مصاريف إدارية وإعاشة
  profitMargin: number;     // هامش الربح %
  suggestedSellingPrice: number; // سعر البيع المقترح بالدرهم المغربي
}

export interface HotelInfo {
  id?: string;
  name: string;
  city: 'مكة المكرمة' | 'المدينة المنورة' | 'جدة';
  stars: number;
  distanceToHaram: number; // بالمتر
  shuttleService: boolean;
  address: string;
  contactPerson?: string;
  phone?: string;
}

export interface Program {
  id: string;
  name: string;
  type: ProgramType;
  description: string;
  travelDate: string;
  returnDate: string;
  durationDays: number;
  departureCity: string;
  airline: string;
  totalSeats: number;
  bookedSeats: number;
  status: ProgramStatus;
  costBreakdown: CostBreakdown;
  makkahHotel: HotelInfo;
  madinahHotel: HotelInfo;
  roomPricing: RoomPricing;
  features: string[];
  isArchived?: boolean;
}

export type VisaStatus = 'تم إصدار التأشيرة' | 'قيد المعالجة' | 'بانتظار الوثائق' | 'ملغاة';
export type PaymentStatus = 'مدفوع بالكامل' | 'مدفوع جزئياً' | 'بانتظار السداد' | 'متأخر في السداد';

export interface Pilgrim {
  id: string;
  fullName: string;
  passportNumber: string;
  passportExpiry: string;
  phone: string;
  email: string;
  gender: 'ذكر' | 'أنثى';
  city: string;
  emergencyContact: string;
  emergencyPhone: string;
  programId: string;
  programName: string;
  roomType: 'خماسية' | 'رباعية' | 'ثلاثية' | 'ثنائية' | 'فردية';
  visaStatus: VisaStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  documents: {
    passportCopy: boolean;
    personalPhoto: boolean;
    vaccineCertificate: boolean;
  };
  inCorbeille?: boolean;
  deletedAt?: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  pilgrimId: string;
  pilgrimName: string;
  passportNumber: string;
  phone: string;
  programId: string;
  programName: string;
  travelDate: string;
  roomType: 'خماسية' | 'رباعية' | 'ثلاثية' | 'ثنائية' | 'فردية';
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'نقداً' | 'تحويل بنكي' | 'شيك بنكي' | 'بطاقة بانكية';
  bookingDate: string;
  notes?: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'فندق مكة' | 'فندق المدينة' | 'شركة نقل حافلات' | 'مورد تأشيرات' | 'شركة طيران';
  location: string;
  rating: number;
  distanceToHaram?: number;
  contactName: string;
  phone: string;
  email: string;
  services: string[];
}

export interface FamilyGroup {
  id: string;
  groupName: string;
  leaderName: string;
  leaderPhone: string;
  programId: string;
  programName: string;
  memberIds: string[];
  roomPreference: 'خماسية' | 'رباعية' | 'ثلاثية' | 'ثنائية' | 'فردية';
  totalMembers: number;
  notes?: string;
}

export interface RoomAllocation {
  id: string;
  hotelId: string;
  hotelName: string;
  city: 'مكة المكرمة' | 'المدينة المنورة';
  roomNumber: string;
  floor: number;
  roomType: 'خماسية' | 'رباعية' | 'ثلاثية' | 'ثنائية' | 'فردية';
  capacity: number;
  pilgrimIds: string[];
  status: 'متاحة' | 'مكتملة' | 'تحت الصيانة';
  notes?: string;
}

export interface ChequeRecord {
  id: string;
  chequeNumber: string;
  bankName: string;
  drawerName: string;
  amount: number;
  dueDate: string;
  type: 'مستلم من معتمر' | 'صادر لمورد';
  status: 'مستحق' | 'تم الصرف' | 'مرتجع' | 'قيد التحصيل';
  notes?: string;
}

export interface OperationAlert {
  id: string;
  type: 'جواز سفر قريب الانتهاء' | 'تأشيرة متأخرة' | 'مبلغ مستحق' | 'غرفة غير مخصصة' | 'رحلة قريبة';
  title: string;
  description: string;
  severity: 'حرج' | 'تحذير' | 'معلومة';
  targetId?: string;
  targetName?: string;
  date?: string;
}

export interface DashboardStats {
  totalPrograms: number;
  totalPilgrims: number;
  totalBookings: number;
  totalRevenue: number;
  totalPaid: number;
  pendingVisas: number;
}
