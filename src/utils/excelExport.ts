import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ReceiptExcelData {
  receiptNum: string;
  receiptDate: string;
  clientName: string;
  cinOrPassport: string;
  phone: string;
  packName: string;
  roomTypeDisplay: string;
  departureDate: string;
  returnDate: string;
  airline: string;
  makkahHotel: string;
  madinahHotel: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  remainingBalance: number;
}

export async function exportReceiptToStyledExcel(data: ReceiptExcelData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Zad Travel & Tourism';
  workbook.lastModifiedBy = 'Zad Travel & Tourism';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Reçu de Paiement', {
    views: [{ showGridLines: true }],
    properties: { defaultRowHeight: 20 },
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3,
      },
    },
  });

  // Set precise column widths matching the layout
  worksheet.getColumn(1).width = 38; // Col A
  worksheet.getColumn(2).width = 46; // Col B

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };

  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFB4C6E7' }, // Soft periwinkle blue from screenshot
  };

  const formatMAD = (amount: number) => {
    return `${new Intl.NumberFormat('fr-FR').format(amount || 0)} MAD`;
  };

  // Row 1: Spacing
  worksheet.addRow([]);
  worksheet.getRow(1).height = 10;

  // Row 2: Arabic Agency Title
  const r2 = worksheet.addRow(['زاد للسفر و السياحة', '']);
  worksheet.mergeCells('A2:B2');
  r2.height = 28;
  const cellA2 = worksheet.getCell('A2');
  cellA2.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF000000' } };
  cellA2.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 3: English Agency Title
  const r3 = worksheet.addRow(['Zad Travel & Tourism', '']);
  worksheet.mergeCells('A3:B3');
  r3.height = 22;
  const cellA3 = worksheet.getCell('A3');
  cellA3.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF000000' } };
  cellA3.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 4: Spacing
  worksheet.addRow([]);
  worksheet.getRow(4).height = 10;

  // Row 5: Receipt Number Line
  const r5 = worksheet.addRow([
    `Reçu de Paiement n°:     ${data.receiptNum || ''}     :وصل أداء رقم`,
    '',
  ]);
  worksheet.mergeCells('A5:B5');
  r5.height = 20;
  const cellA5 = worksheet.getCell('A5');
  cellA5.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF000000' } };
  cellA5.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 6: Date Line
  const r6 = worksheet.addRow([
    `Du:     ${data.receiptDate || ''}     :بتاريخ`,
    '',
  ]);
  worksheet.mergeCells('A6:B6');
  r6.height = 20;
  const cellA6 = worksheet.getCell('A6');
  cellA6.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF000000' } };
  cellA6.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 7: Spacing before Table 1
  worksheet.addRow([]);
  worksheet.getRow(7).height = 8;

  // ========================= TABLE 1: INFORMATIONS =========================
  // Row 8: Table 1 Header
  const r8 = worksheet.addRow(['Informations / المعلومات', '']);
  worksheet.mergeCells('A8:B8');
  r8.height = 26;
  const cellA8 = worksheet.getCell('A8');
  cellA8.fill = headerFill;
  cellA8.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF000000' } };
  cellA8.alignment = { vertical: 'middle', horizontal: 'center' };
  cellA8.border = thinBorder;
  worksheet.getCell('B8').border = thinBorder;

  // Table 1 Rows
  const table1Data = [
    ['Nom du Client / اسم العميل', data.clientName || ''],
    ['C.I.N / رقم ب.ت.و', data.cinOrPassport || ''],
    ['Téléphone / الهاتف', data.phone || ''],
    ['Pack / الباقة', data.packName || ''],
    ['Type de chambre / نوع الغرفة', data.roomTypeDisplay || ''],
    ['Date de Départ / تاريخ الذهاب', data.departureDate || ''],
    ['Date de Retour / تاريخ العودة', data.returnDate || ''],
    ['Compagnie Aérienne / شركة الطيران', data.airline || ''],
    ['Hôtel la Mecque / فندق مكة', data.makkahHotel || ''],
    ['Hôtel Médine / فندق المدينة', data.madinahHotel || ''],
  ];

  table1Data.forEach(([label, value]) => {
    const row = worksheet.addRow([label, value]);
    row.height = 21;
    const c1 = row.getCell(1);
    const c2 = row.getCell(2);

    c1.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF000000' } };
    c1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    c1.border = thinBorder;

    c2.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF000000' } };
    c2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    c2.border = thinBorder;
  });

  // Row Spacing before Table 2
  const emptyBetween = worksheet.addRow([]);
  emptyBetween.height = 14;

  // ========================= TABLE 2: INFORMATIONS DE PAIEMENT =========================
  const paymentHeaderRowIndex = worksheet.lastRow ? worksheet.lastRow.number + 1 : 20;
  const rPayHeader = worksheet.addRow(['Informations de Paiement / معلومات الأداء', '']);
  worksheet.mergeCells(`A${paymentHeaderRowIndex}:B${paymentHeaderRowIndex}`);
  rPayHeader.height = 26;
  const cellPayHeader = worksheet.getCell(`A${paymentHeaderRowIndex}`);
  cellPayHeader.fill = headerFill;
  cellPayHeader.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF000000' } };
  cellPayHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  cellPayHeader.border = thinBorder;
  worksheet.getCell(`B${paymentHeaderRowIndex}`).border = thinBorder;

  // Table 2 Rows
  const table2Data = [
    ['Montant Total / المبلغ الإجمالي', formatMAD(data.totalAmount)],
    ['Montant Payé / المبلغ المدفوع', formatMAD(data.paidAmount)],
    ['Mode de Paiement / طريقة الدفع', data.paymentMethod || ''],
    ['Reste à Payer / الباقي', formatMAD(data.remainingBalance)],
  ];

  table2Data.forEach(([label, value]) => {
    const row = worksheet.addRow([label, value]);
    row.height = 21;
    const c1 = row.getCell(1);
    const c2 = row.getCell(2);

    c1.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF000000' } };
    c1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    c1.border = thinBorder;

    c2.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF000000' } };
    c2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    c2.border = thinBorder;
  });

  // Spacing after Table 2
  const postTableSpacing = worksheet.addRow([]);
  postTableSpacing.height = 14;

  // ========================= SIGNATURES =========================
  const sigRow = worksheet.addRow(['Signature Agence', 'Signature Client']);
  sigRow.height = 22;
  const sigA = sigRow.getCell(1);
  const sigB = sigRow.getCell(2);

  sigA.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF000000' } };
  sigA.alignment = { vertical: 'middle', horizontal: 'center' };

  sigB.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF000000' } };
  sigB.alignment = { vertical: 'middle', horizontal: 'center' };

  // Spacing before footer (3 empty rows)
  for (let i = 0; i < 3; i++) {
    const rEmpty = worksheet.addRow([]);
    rEmpty.height = 14;
  }

  // ========================= FOOTER =========================
  const fRow1Num = worksheet.lastRow ? worksheet.lastRow.number + 1 : 30;
  const fRow1 = worksheet.addRow([
    'RDC 383 Lot Al Amane Mhamid Marrakech (En face Mosquée Al Amira-Maatallah)',
    '',
  ]);
  worksheet.mergeCells(`A${fRow1Num}:B${fRow1Num}`);
  fRow1.height = 18;
  const cellF1 = worksheet.getCell(`A${fRow1Num}`);
  cellF1.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF000000' } };
  cellF1.alignment = { vertical: 'middle', horizontal: 'center' };

  const fRow2Num = fRow1Num + 1;
  const fRow2 = worksheet.addRow([
    'Tél 05 24 20 97 13    Gsm 06 64 61 00 61',
    '',
  ]);
  worksheet.mergeCells(`A${fRow2Num}:B${fRow2Num}`);
  fRow2.height = 18;
  const cellF2 = worksheet.getCell(`A${fRow2Num}`);
  cellF2.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF000000' } };
  cellF2.alignment = { vertical: 'middle', horizontal: 'center' };

  // Generate buffer and trigger browser download via file-saver
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `Receipt_${data.receiptNum || 'ZAD'}.xlsx`);
}
