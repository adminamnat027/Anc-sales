import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserSalesSummary, SalesRecord } from '../types';
import { formatCurrency, formatNumber } from './kpiCalculator';

export const generateSalesPdf = (
  summaries: UserSalesSummary[],
  records: SalesRecord[],
  periodLabel: string,
  totalSales: number,
  totalPancake: number,
  totalJst: number,
  totalDiffer: number,
  targetKpiTotal: number
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const overallKpiPct = targetKpiTotal > 0 ? (totalSales / targetKpiTotal) * 100 : 0;

  // Header Banner (Pastel Pink/Indigo accent)
  doc.setFillColor(244, 114, 182); // soft rose/pink
  doc.rect(0, 0, 210, 20, 'F');

  doc.setFillColor(253, 242, 248); // ultra light pink
  doc.rect(0, 20, 210, 26, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('EMPLOYEE SALES & KPI AUDIT REPORT', 14, 13);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.text(`Period: ${periodLabel} | Daily KPI Baseline: 185,000 THB/Person/Day`, 14, 28);
  doc.text(`Generated At: ${new Date().toLocaleString('th-TH')}`, 14, 34);
  doc.text(`Total Sales: ${formatCurrency(totalSales)} | Achievement: ${overallKpiPct.toFixed(1)}%`, 14, 40);

  // Table Data Preparation
  const tableRows = summaries.map(s => [
    s.userId,
    s.userName,
    formatCurrency(s.totalSales),
    `${s.kpiPercentage.toFixed(1)}%`,
    formatNumber(s.totalPancake),
    formatNumber(s.totalJst),
    s.differ === 0 ? '0 (Match)' : `${s.differ > 0 ? '+' : ''}${s.differ}`,
    s.isKpiPassed ? 'PASSED' : 'PENDING'
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['User ID', 'Name', 'Sales (THB)', '% KPI', 'Pancake', 'JST', 'Differ', 'KPI Status']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [244, 114, 182],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 },
      1: { cellWidth: 42 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 20 },
      5: { halign: 'right', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 24 },
      7: { halign: 'center', cellWidth: 24 }
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 6) {
        const text = String(data.cell.raw);
        if (text.includes('+') || (text.includes('-') && !text.includes('0'))) {
          data.cell.styles.textColor = [225, 29, 72]; // Rose warning
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald match
        }
      }
      if (data.section === 'body' && data.column.index === 7) {
        if (data.cell.raw === 'PASSED') {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [234, 88, 12];
        }
      }
    }
  });

  // Recent daily records table
  const finalY = (doc as any).lastAutoTable?.finalY || 130;

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Latest Daily Sales Logs (Audit Breakdown)', 14, finalY + 12);

  const dailyRows = records.slice(0, 15).map(r => [
    r.date,
    r.userId,
    r.userName,
    formatCurrency(r.salesAmount),
    formatNumber(r.pancakeOrders),
    formatNumber(r.jstSystemOrders),
    r.differ === 0 ? '0' : `${r.differ > 0 ? '+' : ''}${r.differ}`,
    r.notes || '-'
  ]);

  autoTable(doc, {
    startY: finalY + 16,
    head: [['Date', 'ID', 'Employee', 'Sales', 'Pancake', 'JST', 'Differ', 'Notes']],
    body: dailyRows,
    theme: 'striped',
    headStyles: {
      fillColor: [147, 197, 253], // pastel blue
      textColor: [30, 41, 59],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 },
      1: { halign: 'center', cellWidth: 18 },
      2: { cellWidth: 38 },
      3: { halign: 'right', cellWidth: 26 },
      4: { halign: 'right', cellWidth: 18 },
      5: { halign: 'right', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 16 },
      7: { cellWidth: 46 }
    }
  });

  // Footer note
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Employee Sales Tracking & Audit System - Confidential Internal Document',
    14,
    pageHeight - 8
  );

  doc.save(`Sales_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
