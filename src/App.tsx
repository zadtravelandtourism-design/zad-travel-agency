import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { ProgramsView } from './components/ProgramsView';
import { PilgrimsView } from './components/PilgrimsView';
import { BookingsView } from './components/BookingsView';
import { PaymentsView } from './components/PaymentsView';
import { FamiliesGroupsView } from './components/FamiliesGroupsView';
import { HotelAccommodationView } from './components/HotelAccommodationView';
import { OperationsAlertsView } from './components/OperationsAlertsView';
import { ReportsView } from './components/ReportsView';
import { ExportBackupView } from './components/ExportBackupView';
import { PartnersView } from './components/PartnersView';
import { Footer } from './components/Footer';
import { ConfirmModal } from './components/ConfirmModal';
import { PaymentReceipt } from './components/PaymentReceipt';
import { generateReceiptNumber } from './utils/receiptGenerator';
import { Program, Pilgrim, Booking, Partner, DashboardStats, FamilyGroup, RoomAllocation, OperationAlert } from './types';
import {
  AGENCY_DETAILS,
  INITIAL_PROGRAMS,
  INITIAL_PILGRIMS,
  INITIAL_BOOKINGS,
  INITIAL_PARTNERS,
  INITIAL_FAMILIES_GROUPS,
  INITIAL_ROOM_ALLOCATIONS,
  INITIAL_OPERATIONAL_ALERTS
} from './data/mockData';
import { MapPin, Phone, Mail, Building2, CheckCircle, ShieldCheck } from 'lucide-react';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'programs' | 'pilgrims' | 'bookings' | 'payments' | 'reports' | 'export' | 'partners' | 'families' | 'hotels' | 'alerts'
  >('dashboard');

  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Handler to cast setActiveTab to proper type
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab as 'dashboard' | 'programs' | 'pilgrims' | 'bookings' | 'payments' | 'reports' | 'export' | 'partners' | 'families' | 'hotels' | 'alerts');
  };

  // State Collections
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>(INITIAL_PILGRIMS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [groups, setGroups] = useState<FamilyGroup[]>(INITIAL_FAMILIES_GROUPS);
  const [allocations, setAllocations] = useState<RoomAllocation[]>(INITIAL_ROOM_ALLOCATIONS);
  const [alerts, setAlerts] = useState<OperationAlert[]>(INITIAL_OPERATIONAL_ALERTS);

  // Modals & Active selections
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isPilgrimModalOpen, setIsPilgrimModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedPilgrimForBooking, setPreselectedPilgrimForBooking] = useState<Pilgrim | null>(null);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  // Direct route detection for Payment Receipt (Lien direct)
  const [directReceiptId, setDirectReceiptId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('receipt') || params.get('receiptId') || params.get('bookingId') || null;
    }
    return null;
  });

  // Listen to browser forward/back navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const receiptParam = params.get('receipt') || params.get('receiptId') || params.get('bookingId');
      setDirectReceiptId(receiptParam);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenDirectReceipt = (booking: Booking) => {
    const url = new URL(window.location.href);
    url.searchParams.set('receipt', booking.id);
    window.history.pushState({}, '', url.toString());
    setDirectReceiptId(booking.id);
  };

  const handleCloseDirectReceipt = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('receipt');
      url.searchParams.delete('receiptId');
      url.searchParams.delete('bookingId');
      window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
    } catch (e) {
      console.error(e);
    }
    setDirectReceiptId(null);
    setSelectedInvoiceBooking(null);
  };

  const [notification, setNotification] = useState<string | null>(null);

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch initial data from Express API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, pilgRes, bookRes, partRes] = await Promise.all([
          fetch('/api/programs'),
          fetch('/api/pilgrims'),
          fetch('/api/bookings'),
          fetch('/api/partners'),
        ]);

        if (progRes.ok) setPrograms(await progRes.json());
        if (pilgRes.ok) setPilgrims(await pilgRes.json());
        if (bookRes.ok) setBookings(await bookRes.json());
        if (partRes.ok) setPartners(await partRes.json());
      } catch (err) {
        console.log('Using default client state', err);
      }
    };
    fetchData();
  }, []);

  // Compute stats dynamically
  const stats: DashboardStats = {
    totalPrograms: programs.filter(p => !p.isArchived).length,
    totalPilgrims: pilgrims.length,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
    totalPaid: bookings.reduce((sum, b) => sum + b.paidAmount, 0),
    pendingVisas: pilgrims.filter(p => p.visaStatus === 'قيد المعالجة' || p.visaStatus === 'بانتظار الوثائق').length,
  };

  // PROGRAM CRUD
  const handleCreateProgram = async (newProg: Omit<Program, 'id'>) => {
    try {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProg),
      });
      const created = res.ok ? await res.json() : { ...newProg, id: `prog_${Date.now()}` };
      setPrograms(prev => [created, ...prev]);
      showToast('تمت إضافة البرنامج بنجاح');
    } catch {
      const fallback = { ...newProg, id: `prog_${Date.now()}` };
      setPrograms(prev => [fallback, ...prev]);
      showToast('تمت إضافة البرنامج بنجاح');
    }
  };

  const handleUpdateProgram = async (id: string, updated: Partial<Program>) => {
    try {
      await fetch(`/api/programs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      // client update
    }
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    showToast('تم تعديل بيانات البرنامج');
  };

  const handleDeleteProgram = async (id: string) => {
    const prog = programs.find(p => p.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'حذف البرنامج',
      message: `هل أنت متأكد من حذف البرنامج "${prog?.name || 'هذا البرنامج'}" نهائياً؟`,
      confirmLabel: 'تأكيد الحذف',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await fetch(`/api/programs/${id}`, { method: 'DELETE' });
        } catch {}
        setPrograms(prev => prev.filter(p => p.id !== id));
        showToast('تم حذف البرنامج بنجاح');
      },
    });
  };

  // PILGRIM CRUD
  const handleCreatePilgrim = async (newPilgrim: Omit<Pilgrim, 'id'>) => {
    try {
      const res = await fetch('/api/pilgrims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPilgrim),
      });
      const created = res.ok ? await res.json() : { ...newPilgrim, id: `pilg_${Date.now()}` };
      setPilgrims(prev => [created, ...prev]);
      showToast('تم تسجيل الحاج/المعتمر بنجاح');
    } catch {
      const fallback = { ...newPilgrim, id: `pilg_${Date.now()}` };
      setPilgrims(prev => [fallback, ...prev]);
      showToast('تم تسجيل الحاج/المعتمر بنجاح');
    }
  };

  const handleUpdatePilgrim = async (id: string, updated: Partial<Pilgrim>) => {
    try {
      await fetch(`/api/pilgrims/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {}
    setPilgrims(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    showToast('تم تعديل بيانات الحاج');
  };

  const handleDeletePilgrim = async (id: string) => {
    const pilg = pilgrims.find(p => p.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'نقل إلى سلة المهملات (Corbeille)',
      message: `هل أنت متأكد من نقل المعتمر "${pilg?.fullName || 'هذا المعتمر'}" إلى سلة المهملات؟ يمكنك استعادته في أي وقت.`,
      confirmLabel: 'نقل للسلة',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await fetch(`/api/pilgrims/${id}`, { method: 'DELETE' });
        } catch {}
        setPilgrims(prev => prev.map(p => p.id === id ? { ...p, inCorbeille: true, deletedAt: new Date().toISOString() } : p));
        showToast('تم نقل المعتمر إلى سلة المهملات (Corbeille)');
      },
    });
  };

  const handleRestorePilgrim = async (id: string) => {
    try {
      await fetch(`/api/pilgrims/${id}/restore`, { method: 'POST' });
    } catch {}
    setPilgrims(prev => prev.map(p => p.id === id ? { ...p, inCorbeille: false, deletedAt: undefined } : p));
    showToast('تم استعادة المعتمر بنجاح');
  };

  const handlePermanentDeletePilgrim = async (id: string) => {
    const pilg = pilgrims.find(p => p.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'حذف نهائي للمعتمر',
      message: `تنبيه: هل أنت متأكد من الحذف النهائي للمعتمر "${pilg?.fullName || ''}"؟ لا يمكن التراجع عن هذه العملية.`,
      confirmLabel: 'حذف نهائي',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await fetch(`/api/pilgrims/${id}?permanent=true`, { method: 'DELETE' });
        } catch {}
        setPilgrims(prev => prev.filter(p => p.id !== id));
        showToast('تم الحذف النهائي من سلة المهملات');
      },
    });
  };

  const handleEmptyCorbeille = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'تفريغ سلة المهملات بالكامل',
      message: 'تنبيه هام: هل أنت متأكد من تفريغ سلة المهملات (Corbeille) بالكامل؟ سيتم حذف جميع المعتمرين المتواجدين بها نهائياً.',
      confirmLabel: 'تفريغ السلة نهائياً',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await fetch('/api/pilgrims/corbeille/empty', { method: 'DELETE' });
        } catch {}
        setPilgrims(prev => prev.filter(p => !p.inCorbeille));
        showToast('تم تفريغ سلة المهملات بالكامل');
      },
    });
  };

  // BOOKING CRUD
  const handleCreateBooking = async (newBooking: Omit<Booking, 'id' | 'bookingRef'>) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      const created = res.ok ? await res.json() : {
        ...newBooking,
        id: `BK-${Date.now().toString().slice(-4)}`,
        bookingRef: generateReceiptNumber(bookings),
        bookingDate: new Date().toISOString().split('T')[0],
      };
      setBookings(prev => [created, ...prev]);
      setSelectedInvoiceBooking(created);
      showToast('تم إنشاء الحجز وتوليد وصل الاستلام');
    } catch {
      const fallback = {
        ...newBooking,
        id: `BK-${Date.now().toString().slice(-4)}`,
        bookingRef: generateReceiptNumber(bookings),
        bookingDate: new Date().toISOString().split('T')[0],
      };
      setBookings(prev => [fallback, ...prev]);
      setSelectedInvoiceBooking(fallback);
      showToast('تم إنشاء الحجز وتوليد وصل الاستلام');
    }
  };

  const handleUpdateBooking = async (id: string, updated: Partial<Booking>) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {}
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
    showToast('تم تحديث بيانات الدفع والحجز');
  };

  const handleDeleteBooking = async (id: string) => {
    const b = bookings.find(item => item.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'حذف الحجز والوصل المالي',
      message: `هل ترغب بحذف الحجز رقم (${b?.bookingRef || id}) الخاص بـ (${b?.pilgrimName || ''})؟`,
      confirmLabel: 'تأكيد الحذف',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
        } catch {}
        setBookings(prev => prev.filter(b => b.id !== id));
        showToast('تم حذف الحجز بنجاح');
      },
    });
  };

  // PARTNER CRUD
  const handleCreatePartner = async (newPartner: Omit<Partner, 'id'>) => {
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPartner),
      });
      const created = res.ok ? await res.json() : { ...newPartner, id: `ptr_${Date.now()}` };
      setPartners(prev => [created, ...prev]);
      showToast('تمت إضافة الفندق / الشريك للدليل بنجاح');
    } catch {
      const fallback = { ...newPartner, id: `ptr_${Date.now()}` };
      setPartners(prev => [fallback, ...prev]);
      showToast('تمت إضافة الفندق / الشريك للدليل بنجاح');
    }
  };

  const handleUpdatePartner = async (id: string, updated: Partial<Partner>) => {
    try {
      await fetch(`/api/partners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {}
    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    showToast('تم تحديث بيانات الفندق / الشريك');
  };

  const handleDeletePartner = (id: string) => {
    const p = partners.find(item => item.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'حذف الفندق / الشريك',
      message: `هل أنت متأكد من رغبتك في حذف (${p?.name || 'هذا العنصر'}) من دليل الشركاء والفنادق؟`,
      confirmLabel: 'تأكيد الحذف',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await fetch(`/api/partners/${id}`, { method: 'DELETE' });
        } catch {}
        setPartners(prev => prev.filter(item => item.id !== id));
        showToast('تم حذف الفندق / الشريك بنجاح');
      },
    });
  };

  // CLEAR ALL DATA
  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'تصفير كافة السجلات والبيانات',
      message: 'هل أنت متأكد من تصفير ومسح كافة السجلات والبدء بسجل فارغ جديد؟ لا يمكن التراجع عن هذه العملية.',
      confirmLabel: 'تصفير النظام بالكامل',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await fetch('/api/clear-all', { method: 'POST' });
        } catch (err) {
          console.error(err);
        }
        setPrograms([]);
        setPilgrims([]);
        setBookings([]);
        setPartners([]);
        showToast('تم تصفير جميع البيانات بنجاح. المنظومة جاهزة لاستقبال إدخالاتك الجديدة.');
      },
    });
  };

  // If a direct receipt route is accessed (e.g. ?receipt=BK-1234), render the standalone receipt view directly without sidebars
  if (directReceiptId) {
    const targetBooking = bookings.find(b => b.id === directReceiptId || b.bookingRef === directReceiptId) || bookings[0] || null;
    const targetProgram = targetBooking ? programs.find(p => p.id === targetBooking.programId) || programs[0] : programs[0];
    const targetPilgrim = targetBooking ? pilgrims.find(p => p.id === targetBooking.pilgrimId) : null;

    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 font-['Cairo',sans-serif]">
        <PaymentReceipt
          booking={targetBooking}
          program={targetProgram}
          pilgrim={targetPilgrim}
          onBack={handleCloseDirectReceipt}
        />
      </div>
    );
  }

  // إيلا ما كانش مسجل دخول، وريه صفحة Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-['Cairo',sans-serif] selection:bg-[#E5B842] selection:text-[#003425] flex">
      {/* Vertical Sidebar Layout (Right side for RTL) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onOpenNewProgram={() => {
          setActiveTab('programs');
          setIsProgramModalOpen(true);
        }}
        onOpenNewPilgrim={() => {
          setActiveTab('pilgrims');
          setIsPilgrimModalOpen(true);
        }}
        onOpenNewBooking={() => {
          setActiveTab('bookings');
          setIsBookingModalOpen(true);
        }}
        onClearAll={handleClearAll}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 mr-0 md:mr-64 transition-all">
        {/* Top Navigation Header */}
        <TopHeader
          activeTab={activeTab}
          onOpenNewProgram={() => {
            setActiveTab('programs');
            setIsProgramModalOpen(true);
          }}
          onOpenNewPilgrim={() => {
            setActiveTab('pilgrims');
            setIsPilgrimModalOpen(true);
          }}
          onOpenNewBooking={() => {
            setActiveTab('bookings');
            setIsBookingModalOpen(true);
          }}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
        />

        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 left-6 z-50 bg-[#003425] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#E5B842] flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-[#E5B842]" />
            <span>{notification}</span>
          </div>
        )}

        {/* Views */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              programs={programs}
              pilgrims={pilgrims}
              bookings={bookings}
              setActiveTab={handleSetActiveTab}
              onOpenNewProgram={() => {
                setActiveTab('programs');
                setIsProgramModalOpen(true);
              }}
              onOpenNewPilgrim={() => {
                setActiveTab('pilgrims');
                setIsPilgrimModalOpen(true);
              }}
              onOpenNewBooking={() => {
                setActiveTab('bookings');
                setIsBookingModalOpen(true);
              }}
              onSelectBookingForInvoice={(booking) => {
                handleOpenDirectReceipt(booking);
              }}
              onOpenInvoice={(booking) => {
                handleOpenDirectReceipt(booking);
              }}
              onOpenDirectReceipt={(booking) => {
                handleOpenDirectReceipt(booking);
              }}
            />
          )}

          {activeTab === 'programs' && (
            <ProgramsView
              programs={programs}
              onCreateProgram={handleCreateProgram}
              onUpdateProgram={handleUpdateProgram}
              onDeleteProgram={handleDeleteProgram}
              isModalOpen={isProgramModalOpen}
              setIsModalOpen={setIsProgramModalOpen}
            />
          )}

          {activeTab === 'pilgrims' && (
            <PilgrimsView
              pilgrims={pilgrims}
              programs={programs}
              onCreatePilgrim={handleCreatePilgrim}
              onUpdatePilgrim={handleUpdatePilgrim}
              onDeletePilgrim={handleDeletePilgrim}
              onRestorePilgrim={handleRestorePilgrim}
              onPermanentDeletePilgrim={handlePermanentDeletePilgrim}
              onEmptyCorbeille={handleEmptyCorbeille}
              isModalOpen={isPilgrimModalOpen}
              setIsModalOpen={setIsPilgrimModalOpen}
              onOpenNewBookingWithPilgrim={(pilgrim) => {
                setPreselectedPilgrimForBooking(pilgrim);
                setActiveTab('bookings');
                setIsBookingModalOpen(true);
              }}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsView
              bookings={bookings}
              pilgrims={pilgrims}
              programs={programs}
              preselectedPilgrim={preselectedPilgrimForBooking}
              onClearPreselectedPilgrim={() => setPreselectedPilgrimForBooking(null)}
              onCreateBooking={handleCreateBooking}
              onUpdateBooking={handleUpdateBooking}
              onDeleteBooking={handleDeleteBooking}
              isModalOpen={isBookingModalOpen}
              setIsModalOpen={(open) => {
                setIsBookingModalOpen(open);
                if (!open) setPreselectedPilgrimForBooking(null);
              }}
              selectedInvoiceBooking={selectedInvoiceBooking}
              setSelectedInvoiceBooking={setSelectedInvoiceBooking}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              bookings={bookings}
              pilgrims={pilgrims}
              programs={programs}
              onOpenNewBooking={() => setIsBookingModalOpen(true)}
              selectedInvoiceBooking={selectedInvoiceBooking}
              setSelectedInvoiceBooking={setSelectedInvoiceBooking}
              onUpdateBooking={handleUpdateBooking}
              onDeleteBooking={handleDeleteBooking}
            />
          )}

          {activeTab === 'families' && (
            <FamiliesGroupsView
              groups={groups}
              pilgrims={pilgrims}
              programs={programs}
              onCreateGroup={(newGrp) => {
                setGroups(prev => [newGrp, ...prev]);
                showToast('تم إضافة المجموعة العائلية بنجاح');
              }}
              onDeleteGroup={(id) => {
                setGroups(prev => prev.filter(g => g.id !== id));
                showToast('تم حذف المجموعة العائلية');
              }}
            />
          )}

          {activeTab === 'hotels' && (
            <HotelAccommodationView
              allocations={allocations}
              pilgrims={pilgrims}
              partners={partners}
              programs={programs}
              onAddPartner={handleCreatePartner}
              onDeletePartner={handleDeletePartner}
              onAddAllocation={(newAlloc) => {
                setAllocations(prev => [newAlloc, ...prev]);
                showToast('تمت إضافة الغرفة بنجاح');
              }}
              onUpdateAllocation={(updatedAlloc) => {
                setAllocations(prev => prev.map(a => a.id === updatedAlloc.id ? updatedAlloc : a));
                showToast('تم تحديث بيانات الغرفة والتسكين');
              }}
              onDeleteAllocation={(id) => {
                setAllocations(prev => prev.filter(a => a.id !== id));
                showToast('تم حذف الغرفة');
              }}
            />
          )}

          {activeTab === 'alerts' && (
            <OperationsAlertsView
              alerts={alerts}
              pilgrims={pilgrims}
              bookings={bookings}
              programs={programs}
              onSelectPilgrimTab={() => setActiveTab('pilgrims')}
              onSelectBookingTab={() => setActiveTab('bookings')}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              programs={programs}
              pilgrims={pilgrims}
              bookings={bookings}
              partners={partners}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'export' && (
            <ExportBackupView
              programs={programs}
              pilgrims={pilgrims}
              bookings={bookings}
              partners={partners}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'partners' && (
            <PartnersView
              partners={partners}
              onCreatePartner={handleCreatePartner}
            />
          )}
        </main>

        {/* Agency Footer */}
        <Footer />
      </div>

      {/* Global Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default App;
