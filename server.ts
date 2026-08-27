import express from 'express';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_PROGRAMS,
  INITIAL_PILGRIMS,
  INITIAL_BOOKINGS,
  INITIAL_PARTNERS,
  AGENCY_DETAILS
} from './src/data/mockData';
import { Program, Pilgrim, Booking, Partner } from './src/types';

// Safely resolve directory name across CJS and ESM environments
const getDirname = () => {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};

const currentDir = getDirname();

// In-memory persistent state during server runtime
let programsStore: Program[] = [...INITIAL_PROGRAMS];
let pilgrimsStore: Pilgrim[] = [...INITIAL_PILGRIMS];
let bookingsStore: Booking[] = [...INITIAL_BOOKINGS];
let partnersStore: Partner[] = [...INITIAL_PARTNERS];

// Helper to generate YYMMXXXX sequential receipt reference
function generateServerReceiptNumber(existingBookings: Booking[] = []): string {
  const now = new Date();
  const yearStr = now.getFullYear().toString().slice(-2);
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${yearStr}${monthStr}`;

  let maxSeq = 0;
  for (const b of existingBookings) {
    if (!b || !b.bookingRef) continue;
    const ref = String(b.bookingRef).trim();
    if (ref.startsWith(prefix) && ref.length >= prefix.length + 4) {
      const seqPart = parseInt(ref.slice(prefix.length, prefix.length + 4), 10);
      if (!isNaN(seqPart) && seqPart > maxSeq) {
        maxSeq = seqPart;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

// Helper to initialize Gemini SDK safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined. AI features will fallback gracefully.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes

  // 1. Dashboard Stats
  app.get('/api/stats', (req, res) => {
    const totalPrograms = programsStore.filter(p => !p.isArchived).length;
    const totalPilgrims = pilgrimsStore.length;
    const totalBookings = bookingsStore.length;
    const totalRevenue = bookingsStore.reduce((acc, b) => acc + b.totalAmount, 0);
    const totalPaid = bookingsStore.reduce((acc, b) => acc + b.paidAmount, 0);
    const pendingVisas = pilgrimsStore.filter(p => p.visaStatus === 'قيد المعالجة' || p.visaStatus === 'بانتظار الوثائق').length;

    res.json({
      totalPrograms,
      totalPilgrims,
      totalBookings,
      totalRevenue,
      totalPaid,
      pendingVisas,
      agencyDetails: AGENCY_DETAILS,
    });
  });

  // 2. Programs API
  app.get('/api/programs', (req, res) => {
    res.json(programsStore);
  });

  app.post('/api/programs', (req, res) => {
    const newProg: Program = {
      ...req.body,
      id: `PRG-${Date.now().toString().slice(-4)}`,
      bookedSeats: req.body.bookedSeats || 0,
      status: req.body.status || 'مفتوح للتسجيل',
    };
    programsStore.unshift(newProg);
    res.status(201).json(newProg);
  });

  app.put('/api/programs/:id', (req, res) => {
    const { id } = req.params;
    const idx = programsStore.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'البرنامج غير موجود' });
    }
    programsStore[idx] = { ...programsStore[idx], ...req.body };
    res.json(programsStore[idx]);
  });

  app.delete('/api/programs/:id', (req, res) => {
    const { id } = req.params;
    programsStore = programsStore.filter(p => p.id !== id);
    res.json({ success: true, message: 'تم حذف البرنامج بنجاح' });
  });

  // 3. Pilgrims API
  app.get('/api/pilgrims', (req, res) => {
    res.json(pilgrimsStore);
  });

  app.post('/api/pilgrims', (req, res) => {
    const newPilgrim: Pilgrim = {
      ...req.body,
      id: `PIL-${Date.now().toString().slice(-4)}`,
      documents: req.body.documents || { passportCopy: true, personalPhoto: true, vaccineCertificate: false },
      visaStatus: req.body.visaStatus || 'قيد المعالجة',
      paymentStatus: req.body.paymentStatus || 'بانتظار السداد',
    };
    pilgrimsStore.unshift(newPilgrim);

    if (newPilgrim.programId) {
      const prog = programsStore.find(p => p.id === newPilgrim.programId);
      if (prog) {
        prog.bookedSeats = Math.min(prog.totalSeats, prog.bookedSeats + 1);
      }
    }

    res.status(201).json(newPilgrim);
  });

  app.put('/api/pilgrims/:id', (req, res) => {
    const { id } = req.params;
    const idx = pilgrimsStore.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'الحاج غير موجود' });
    }
    pilgrimsStore[idx] = { ...pilgrimsStore[idx], ...req.body };
    res.json(pilgrimsStore[idx]);
  });

  app.delete('/api/pilgrims/:id', (req, res) => {
    const { id } = req.params;
    const { permanent } = req.query;
    
    if (permanent === 'true') {
      pilgrimsStore = pilgrimsStore.filter(p => p.id !== id);
      return res.json({ success: true, message: 'تم الحذف النهائي من سلة المهملات (Corbeille)' });
    }

    const pilgrim = pilgrimsStore.find(p => p.id === id);
    if (pilgrim) {
      pilgrim.inCorbeille = true;
      pilgrim.deletedAt = new Date().toISOString();
    }
    res.json({ success: true, message: 'تم نقل الحاج إلى سلة المهملات (Corbeille)' });
  });

  app.post('/api/pilgrims/:id/restore', (req, res) => {
    const { id } = req.params;
    const pilgrim = pilgrimsStore.find(p => p.id === id);
    if (pilgrim) {
      pilgrim.inCorbeille = false;
      delete pilgrim.deletedAt;
      return res.json({ success: true, message: 'تم استعادة المعتمر بنجاح' });
    }
    res.status(404).json({ error: 'المعتمر غير موجود' });
  });

  app.delete('/api/pilgrims/corbeille/empty', (req, res) => {
    pilgrimsStore = pilgrimsStore.filter(p => !p.inCorbeille);
    res.json({ success: true, message: 'تم تفريغ سلة المهملات (Corbeille) بالكامل' });
  });

  // 4. Bookings API
  app.get('/api/bookings', (req, res) => {
    res.json(bookingsStore);
  });

  app.post('/api/bookings', (req, res) => {
    const totalAmount = Number(req.body.totalAmount) || 0;
    const paidAmount = Number(req.body.paidAmount) || 0;
    const remainingBalance = Math.max(0, totalAmount - paidAmount);
    
    let paymentStatus: any = 'بانتظار السداد';
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = 'مدفوع بالكامل';
    } else if (paidAmount > 0) {
      paymentStatus = 'مدفوع جزئياً';
    }

    let pilgrimName = (req.body.pilgrimName || '').trim();
    let passportNumber = (req.body.passportNumber || '').trim();
    let phone = (req.body.phone || '').trim();
    let programName = (req.body.programName || '').trim();
    let travelDate = (req.body.travelDate || '').trim();
    let roomType = req.body.roomType;

    const pilgrim = req.body.pilgrimId 
      ? pilgrimsStore.find(p => p.id === req.body.pilgrimId)
      : (passportNumber ? pilgrimsStore.find(p => p.passportNumber === passportNumber) : null);

    if (pilgrim) {
      if (!pilgrimName) pilgrimName = pilgrim.fullName;
      if (!passportNumber) passportNumber = pilgrim.passportNumber;
      if (!phone) phone = pilgrim.phone;
      if (!roomType) roomType = pilgrim.roomType;
      if (!req.body.programId && pilgrim.programId) {
        req.body.programId = pilgrim.programId;
      }
    }

    const program = req.body.programId
      ? programsStore.find(p => p.id === req.body.programId)
      : (programName ? programsStore.find(p => p.name === programName) : null);

    if (program) {
      if (!programName) programName = program.name;
      if (!travelDate) travelDate = program.travelDate;
    }

    const newBooking: Booking = {
      ...req.body,
      id: `BK-${Date.now().toString().slice(-4)}`,
      bookingRef: req.body.bookingRef || generateServerReceiptNumber(bookingsStore),
      pilgrimId: req.body.pilgrimId || pilgrim?.id || '',
      pilgrimName: pilgrimName || 'معتمر',
      passportNumber: passportNumber || '',
      phone: phone || '',
      programId: req.body.programId || program?.id || '',
      programName: programName || 'برنامج العمرة',
      travelDate: travelDate || '',
      roomType: roomType || 'رباعية',
      totalAmount,
      paidAmount,
      remainingBalance,
      paymentStatus,
      bookingDate: req.body.bookingDate || new Date().toISOString().split('T')[0],
    };
    bookingsStore.unshift(newBooking);

    if (newBooking.pilgrimId) {
      const targetPilgrim = pilgrimsStore.find(p => p.id === newBooking.pilgrimId);
      if (targetPilgrim) {
        targetPilgrim.paymentStatus = paymentStatus;
      }
    }

    res.status(201).json(newBooking);
  });

  app.put('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const idx = bookingsStore.findIndex(b => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'الحجز غير موجود' });
    }

    const existing = bookingsStore[idx];
    const updatedPaid = req.body.paidAmount !== undefined ? Number(req.body.paidAmount) : existing.paidAmount;
    const totalAmount = req.body.totalAmount !== undefined ? Number(req.body.totalAmount) : existing.totalAmount;
    const remainingBalance = Math.max(0, totalAmount - updatedPaid);

    let paymentStatus: any = 'بانتظار السداد';
    if (updatedPaid >= totalAmount && totalAmount > 0) {
      paymentStatus = 'مدفوع بالكامل';
    } else if (updatedPaid > 0) {
      paymentStatus = 'مدفوع جزئياً';
    }

    bookingsStore[idx] = {
      ...existing,
      ...req.body,
      totalAmount,
      paidAmount: updatedPaid,
      remainingBalance,
      paymentStatus,
    };

    res.json(bookingsStore[idx]);
  });

  app.delete('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    bookingsStore = bookingsStore.filter(b => b.id !== id);
    res.json({ success: true, message: 'تم حذف الحجز بنجاح' });
  });

  // 4b. Professional Excel Receipt Export with Logo and Exact Styling
  app.get('/api/bookings/:id/export-excel', async (req, res) => {
    try {
      const booking = bookingsStore.find(b => b.id === req.params.id);
      if (!booking) {
        return res.status(404).json({ error: 'الحجز غير موجود' });
      }

      const program = programsStore.find(item => item.id === booking.programId);
      const exceljsModule = await import('exceljs');
      const exceljs = exceljsModule.default ?? exceljsModule;
      const workbook = new exceljs.Workbook();
      const sheet = workbook.addWorksheet('Reçu de Paiement');

      sheet.pageSetup = {
        paperSize: 9,
        orientation: 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 1,
        horizontalDpi: 300,
        verticalDpi: 300,
      };
      sheet.views = [{ rightToLeft: true }];

      // Embed agency logo if present in public/logo.png
      const logoCandidates = [
        path.join(currentDir, 'public', 'logo.png'),
        path.join(currentDir, 'public', 'logo.jpg'),
        path.join(currentDir, 'public', 'logo.jpeg'),
        path.join(currentDir, 'assets', 'logo.png'),
      ];

      const logoPath = logoCandidates.find(candidate => existsSync(candidate));
      if (logoPath) {
        try {
          const ext = path.extname(logoPath).toLowerCase() === '.png' ? 'png' : 'jpeg';
          const imageId = workbook.addImage({ filename: logoPath, extension: ext });
          sheet.addImage(imageId, {
            tl: { col: 1, row: 1 },
            ext: { width: 140, height: 55 }
          });
        } catch (err) {
          console.warn('Could not load logo image:', err);
        }
      }

      // Header Title Styling
      sheet.mergeCells('B5:E5');
      const titleCell = sheet.getCell('B5');
      titleCell.value = 'Reçu de Paiement n°: ' + (booking.bookingRef || 'N/A') + ' | وصل أداء رقم';
      titleCell.font = { bold: true, size: 14, color: { argb: 'FF1E3A8A' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6EEF8' } };

      sheet.mergeCells('B6:E6');
      const dateCell = sheet.getCell('B6');
      dateCell.value = 'Du / بتاريخ: ' + (booking.bookingDate || new Date().toISOString().split('T')[0]);
      dateCell.font = { size: 11, color: { argb: 'FF4B5563' } };
      dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Section 1: Client Information
      sheet.mergeCells('B8:E8');
      const infoHeader = sheet.getCell('B8');
      infoHeader.value = 'Informations / المعلومات';
      infoHeader.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      infoHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      infoHeader.alignment = { horizontal: 'right', vertical: 'middle' };

      const fields = [
        { label: 'Nom du Client / اسم العميل', value: booking.pilgrimName },
        { label: 'C.I.N / رقم ب.ت.و', value: booking.passportNumber || '-' },
        { label: 'Téléphone / الهاتف', value: booking.phone || '-' },
        { label: 'Pack / الباقة', value: booking.programName || '-' },
        { label: 'Type de chambre / نوع الغرفة', value: booking.roomType || '-' },
        { label: 'Date de Départ / تاريخ الذهاب', value: booking.travelDate || '-' },
        { label: 'Date de Retour / تاريخ العودة', value: program?.returnDate || '-' },
        { label: 'Compagnie Aérienne / شركة الطيران', value: program?.airline || '-' },
        { label: 'Hôtel la Mecque / فندق مكة', value: program?.makkahHotel?.name || '-' },
        { label: 'Hôtel Médine / فندق المدينة', value: program?.madinahHotel?.name || '-' },
      ];

      let currentRow = 9;
      fields.forEach(field => {
        sheet.getRow(currentRow).height = 25;
        sheet.getCell(`B${currentRow}`).value = field.label;
        sheet.getCell(`B${currentRow}`).font = { bold: true, size: 10 };
        sheet.getCell(`B${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        
        sheet.mergeCells(`C${currentRow}:E${currentRow}`);
        const valCell = sheet.getCell(`C${currentRow}`);
        valCell.value = field.value;
        valCell.font = { size: 10 };
        valCell.alignment = { vertical: 'middle', wrapText: true };
        currentRow++;
      });

      // Section 2: Payment Information
      currentRow++;
      sheet.getRow(currentRow).height = 25;
      sheet.mergeCells(`B${currentRow}:E${currentRow}`);
      const payHeader = sheet.getCell(`B${currentRow}`);
      payHeader.value = 'Informations de Paiement / معلومات الأداء';
      payHeader.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      payHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      payHeader.alignment = { horizontal: 'right', vertical: 'middle' };
      currentRow++;

      const payFields = [
        { label: 'Montant Total / المبلغ الإجمالي', value: `${Number(booking.totalAmount) || 0} MAD` },
        { label: 'Montant Payé / المبلغ المدفوع', value: `${Number(booking.paidAmount) || 0} MAD` },
        { label: 'Mode de Paiement / طريقة الدفع', value: (booking as any).paymentMethod || 'نقداً' },
        { label: 'Reste à Payer / الباقي', value: `${Math.max(0, (Number(booking.totalAmount) || 0) - (Number(booking.paidAmount) || 0))} MAD` },
      ];

      payFields.forEach(field => {
        sheet.getRow(currentRow).height = 25;
        sheet.getCell(`B${currentRow}`).value = field.label;
        sheet.getCell(`B${currentRow}`).font = { bold: true, size: 10 };
        sheet.getCell(`B${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        
        sheet.mergeCells(`C${currentRow}:E${currentRow}`);
        const valCell = sheet.getCell(`C${currentRow}`);
        valCell.value = field.value;
        valCell.font = { bold: true, size: 10, color: { argb: 'FF047857' } };
        valCell.alignment = { vertical: 'middle', wrapText: true };
        currentRow++;
      });

      // Signatures Footer
      currentRow += 2;
      sheet.getCell(`B${currentRow}`).value = 'Signature Agence';
      sheet.getCell(`B${currentRow}`).font = { bold: true, size: 10 };
      sheet.getCell(`D${currentRow}`).value = 'Signature Client';
      sheet.getCell(`D${currentRow}`).font = { bold: true, size: 10 };

      // Agency Address Footer
      currentRow += 3;
      sheet.mergeCells(`B${currentRow}:E${currentRow}`);
      const addr1 = sheet.getCell(`B${currentRow}`);
      addr1.value = AGENCY_DETAILS?.address || 'RDC 383 Lot Al Amane Mhamid Marrakech';
      addr1.font = { size: 9, color: { argb: 'FF6B7280' } };
      addr1.alignment = { horizontal: 'center' };

      currentRow++;
      sheet.mergeCells(`B${currentRow}:E${currentRow}`);
      const addr2 = sheet.getCell(`B${currentRow}`);
      const agencyPhoneNumbers = (AGENCY_DETAILS?.phone || '0524209713 / 0664610061')
        .split('/')
        .map(phone => phone.trim());
      addr2.value = `Tél: ${agencyPhoneNumbers[0]} | GSM: ${agencyPhoneNumbers[1] || '0664610061'}`;
      addr2.font = { size: 9, color: { argb: 'FF6B7280' } };
      addr2.alignment = { horizontal: 'center' };

      // Set column widths for a clean look
      sheet.getColumn('A').width = 4;
      sheet.getColumn('B').width = 30;
      sheet.getColumn('C').width = 15;
      sheet.getColumn('D').width = 25;
      sheet.getColumn('E').width = 15;
      sheet.getRow(5).height = 30;
      sheet.getRow(6).height = 24;
      sheet.getRow(8).height = 26;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Recu_${booking.bookingRef}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      console.error('Error exporting Excel:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء تصدير ملف الإكسيل' });
    }
  });

  // 5. Partners API
  app.get('/api/partners', (req, res) => {
    res.json(partnersStore);
  });

  app.post('/api/partners', (req, res) => {
    const newPartner: Partner = {
      ...req.body,
      id: `PTR-${Date.now().toString().slice(-3)}`,
      rating: req.body.rating || 5,
      services: req.body.services || ['خدمات فندقية ورعاية الضيوف'],
    };
    partnersStore.unshift(newPartner);
    res.status(201).json(newPartner);
  });

  // Clear All Data API
  app.post('/api/clear-all', (req, res) => {
    programsStore = [];
    pilgrimsStore = [];
    bookingsStore = [];
    partnersStore = [];
    res.json({ success: true, message: 'تم تصفير كافة البيانات بنجاح' });
  });

  // 6. AI Endpoints using Gemini
  
  // 6a. Generate Itinerary
  app.post('/api/ai/generate-itinerary', async (req, res) => {
    try {
      const { type, durationDays, budgetLevel, groupType, targetMonth } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          itinerary: `برنامج وجدول ${type || 'عمرة شعبان'} المنظم عبر وكالة زاد للسفر والسياحة (${durationDays || 15} يومًا):
• اليوم 1-2: المغادرة من مطار الدار البيضاء، الوصول إلى جدة ثم الانتقال إلى مكة المكرمة وأداء مناسك العمرة.
• اليوم 3-8: الإقامة في مكة المكرمة، أداء الصلوات في الحرم الشريف وزيارة جبل ثور وجبل النور.
• اليوم 9: الانتقال إلى المدينة المنورة عبر القطار السريع أو الحافلات الحديثة.
• اليوم 10-14: الإقامة بالمدينة المنورة، السلام على رسول الله ﷺ وزيارة الروضة الشريفة ومسجد قباء.
• اليوم 15: العودة المباركة إلى أرض الوطن.`
        });
      }

      const prompt = `أنت خبير تنفيذي في وكالة "زاد للسفر والسياحة" (Zad Travel and Tourism) المتخصصة في تنظيم رحلات الحج والعمرة بالمملكة المغربية.
يرجى كتابة برنامج وجدول رحلة تفصيلي ومشوق باللغة العربية لبرنامج:
- نوع الرحلة: ${type || 'عمرة شعبان'}
- المدة: ${durationDays || 15} يومًا
- المستوى/الفئة: ${budgetLevel || 'فاخر VIP'}
- الشهر المخطط: ${targetMonth || 'شعبان / رمضان'}

اكتب البرنامج بتنسيق واضح ومنظم يشمل:
1. مقدمة ترحيبية مميزة باسم وكالة زاد للسفر والسياحة (Zad Travel and Tourism).
2. تفاصيل الإقامة بمكة المكرمة والمدينة المنورة.
3. جدول زمني للرحلة والمزارات والمرافقة الدينية والإدارية.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({ itinerary: response.text || `برنامج ${type} الشامل مع وكالة زاد للسفر والسياحة` });
    } catch (error: any) {
      console.error('Error generating itinerary:', error);
      res.json({
        itinerary: `برنامج وجدول ${req.body?.type || 'العمرة'} مع وكالة زاد للسفر والسياحة:
• طيران مباشر مع الخطوط الملكية المغربية أو الخطوط السعودية.
• إقامة بفنادق ممتازة قريبة من الحرم المكي والحرم النبوي الشريف.
• تأطير وإرشاد ديني وإداري طيلة فترة الرحلة.
• زيارة المزارات والمعالم التاريخية بمكة والمدينة المنورة.`
      });
    }
  });

  // 6b. Visa & Passport Compliance Assistant
  app.post('/api/ai/check-visa', async (req, res) => {
    try {
      const { passportExpiry, birthDate, gender, maritalStatus, hasVaccine, nationality } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          result: `نتيجة الفحص الأولي للوثائق:
• صلاحية جواز السفر: يجب ألا تقل عن 6 أشهر من تاريخ السفر.
• التلقيح الصحي: شهادة التلقيح ضد الحمى الشوكية (Meningococcal) مطلوبة معتمدة.
• الشروط العامة: متوافقة مع ضوابط وزارة الحج والعمرة السعودية للعام الهجري الحالي.`
        });
      }

      const prompt = `أنت مستشار تأشيرات ومسؤول شؤون الحج والعمرة بوكالة "زاد للسفر والسياحة".
قم بتحليل بيانات المعتمر/الحاج التالية وتقديم تقرير دقيق باللغة العربية حول الجاهزية ومدى استيفاء شروط التأشيرة السعودية منصة نُسك:
- تاريخ انتهاء جواز السفر: ${passportExpiry || 'غير محدد'}
- الجنس: ${gender || 'ذكر'}
- الحالة الاجتماعية/المحرم: ${maritalStatus || 'غير محدد'}
- التلقيح ضد الحمى الشوكية وكوفيد: ${hasVaccine ? 'متوفر' : 'غير متوفر'}
- الجنسية: ${nationality || 'مغربية'}

قدم الإجابة في نقاط محددة:
1. تقييم صلاحية جواز السفر (شرط 6 أشهر على الأقل).
2. متطلبات المحرم أو العصبة للنساء إن وجدت حسب القوانين المحدثة.
3. التقاليد والاشتراطات الصحية المطلوبة.
4. الخطوات التالية لإصدار التأشيرة عبر وكالة زاد.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error('Error checking visa:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء فحص متطلبات التأشيرة.' });
    }
  });

  // 6c. Customer WhatsApp & Query Response Generator
  app.post('/api/ai/customer-reply', async (req, res) => {
    try {
      const { queryType, clientName, programName, customDetails } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          reply: `أهلاً وسهلاً بك أخي/أختي الكريم(ة) ${clientName || 'العزيز(ة)'} 🌸
معكم وكالة زاد للسفر والسياحة (zadtravelandtourism). يسعدنا إفادتكم بشأن ${programName || 'برامج العمرة والحج'}.
يرجى تزويدنا بصورة جواز السفر للتأكد من الصلاحية، أو زيارة مقرنا بمراكش (383 تجزئة الأمان، المحاميدية).
لأي استفسار مباشر: 0524209713 / 0664610061 📞`
        });
      }

      const prompt = `قم بصياغة رد عملي، راقٍ ومؤدب باللغة العربية المفهومة الموجهة للزبائن المغاربة عبر الواتساب/البريد الإلكتروني.
اسم الوكالة: زاد للسفر والسياحة (zadtravelandtourism).
بيانات الزبون والطلب:
- اسم الزبون: ${clientName || 'العميل الكريم'}
- نوع الاستفسار: ${queryType || 'استفسار عن أسعار العمرة'}
- اسم البرنامج: ${programName || 'عمرة شعبان VIP'}
- تفاصيل إضافية: ${customDetails || 'الاستفسار عن مواعيد الطيران والوثائق المطلوب تقديمها'}

اكتب الرد بصيغة جاهزة للنسخ واللصق تتضمن الترحيب، الإجابة الشافية، الوثائق المطلوبة، وخاتمة لطيفة مع أرقام التواصل.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Error generating reply:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء صياغة الرد الذكي.' });
    }
  });

  // 6d. Pilgrim Guide & Packing List Generator
  app.post('/api/ai/pilgrim-guide', async (req, res) => {
    try {
      const { tripType, duration, season } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          guide: `دليل ومستلزمات الحاج والمعتمر - وكالة زاد للسفر والسياحة:
1. الوثائق: جواز السفر الأصلي، بطاقة الهوية، تذاكر الطيران، وصل الحجز الفندقي.
2. ملابس الإحرام: طقمي إحرام للرجال (أبيض)، حزام الإحرام، نعل مناسب.
3. الأدوية: أدوية الضغط/السكر الشخصية، مرهم للتسلخات، مسكنات ألم وطارد جفاف.
4. الإرشادات الإيمانية: الميقات، النية، أذكار الطواف والسعي.`
        });
      }

      const prompt = `أنت الموجه الديني والميداني لوكالة "زاد للسفر والسياحة".
اكتب دليلاً نصائحياً شاملاً وقائمة مستلزمات وحقيبة السفر (Checklist) للحاج والمعتمر المغربي:
- نوع الرحلة: ${tripType || 'عمرة'}
- المدة: ${duration || '15 يوماً'}
- الموسم/الطقس: ${season || 'ربيعي / حار'}

قسم التقرير إلى:
1. نصائح وإرشادات الميقات والإحرام.
2. قائمة المستلزمات الأساسية في حقيبة السفر (الأوراق، الملابس، الأدوات الطبية، الشواحن).
3. نصائح للحفاظ على الصحة والنشاط أثناء المناسك وفي الحرمين الشريفين.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({ guide: response.text });
    } catch (error: any) {
      console.error('Error generating guide:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء إعداد دليل الحاج.' });
    }
  });

  // Vite Integration for dev vs production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();