import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface ExportOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter' | 'legal';
  quality?: number;
  scale?: number;
}

export interface ExportData {
  headers: string[];
  rows: any[][];
  title?: string;
  metadata?: Record<string, any>;
}

export class ExportService {
  /**
   * Export element as PNG image
   */
  static async exportToPNG(
    element: HTMLElement, 
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      const {
        filename = 'export.png',
        quality = 1,
        scale = 2
      } = options;

      const canvas = await html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        background: '#ffffff',
        logging: false
      });

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', quality);
    } catch (error) {
      console.error('PNG export failed:', error);
      throw new Error('Failed to export as PNG');
    }
  }

  /**
   * Export element as PDF
   */
  static async exportToPDF(
    element: HTMLElement,
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      const {
        filename = 'export.pdf',
        orientation = 'portrait',
        format = 'a4',
        title = 'Export',
        author = 'RetailMind AI',
        subject = 'Analytics Report',
        quality = 1,
        scale = 2
      } = options;

      // Create high-quality canvas
      const canvas = await html2canvas(element, {
        allowTaint: true,
        useCORS: true,
        background: '#ffffff',
        logging: false
      });

      // Calculate dimensions for PDF
      const imgData = canvas.toDataURL('image/png', quality);
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: format
      });

      // Set PDF metadata
      pdf.setProperties({
        title: title,
        author: author,
        subject: subject,
        creator: 'RetailMind AI Export Service'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate scaling to fit page
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image on the page
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

      // Add footer with timestamp
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on ${timestamp} by RetailMind AI`, pageWidth - 60, pageHeight - 5);

      // Save the PDF
      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to export as PDF');
    }
  }

  /**
   * Export data as Excel file
   */
  static async exportToExcel(
    data: ExportData | ExportData[],
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      const {
        filename = 'export.xlsx',
        title = 'Export Data'
      } = options;

      const workbook = XLSX.utils.book_new();
      
      // Handle single sheet or multiple sheets
      const sheets = Array.isArray(data) ? data : [data];
      
      sheets.forEach((sheetData, index) => {
        const {
          headers,
          rows,
          title: sheetTitle = `Sheet${index + 1}`,
          metadata = {}
        } = sheetData;

        // Create worksheet data
        const wsData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        const colWidths = headers.map((header) => {
          const maxLength = Math.max(
            header.length,
            ...rows.map(row => String(row[headers.indexOf(header)] || '').length)
          );
          return { wch: Math.min(Math.max(maxLength, 10), 50) };
        });
        worksheet['!cols'] = colWidths;

        // Add metadata as comments if provided
        if (Object.keys(metadata).length > 0) {
          const metadataRows = Object.entries(metadata).map(([key, value]) => [key, value]);
          XLSX.utils.sheet_add_aoa(worksheet, [['Metadata'], ...metadataRows], {
            origin: { r: rows.length + 3, c: 0 }
          });
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
      });

      // Set workbook properties
      workbook.Props = {
        Title: title,
        Author: 'RetailMind AI',
        CreatedDate: new Date(),
        ModifiedDate: new Date()
      };

      // Save the file
      XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
    } catch (error) {
      console.error('Excel export failed:', error);
      throw new Error('Failed to export as Excel');
    }
  }

  /**
   * Export multiple formats at once
   */
  static async exportMultipleFormats(
    element: HTMLElement,
    data?: ExportData | ExportData[],
    formats: Array<'png' | 'pdf' | 'excel'> = ['png', 'pdf'],
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      const baseFilename = options.filename || 'export';
      
      const promises = formats.map(async (format) => {
        const formatOptions = { ...options, filename: `${baseFilename}.${format}` };
        
        switch (format) {
          case 'png':
            return this.exportToPNG(element, formatOptions);
          case 'pdf':
            return this.exportToPDF(element, formatOptions);
          case 'excel':
            if (!data) {
              throw new Error('Data is required for Excel export');
            }
            return this.exportToExcel(data, formatOptions);
          default:
            throw new Error(`Unsupported format: ${format}`);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Multiple format export failed:', error);
      throw new Error('Failed to export in multiple formats');
    }
  }

  /**
   * Generate report data from DOM elements
   */
  static generateReportData(
    title: string,
    sections: Array<{
      title: string;
      element: HTMLElement;
      type: 'table' | 'chart' | 'kpi';
    }>
  ): ExportData {
    const headers = ['Section', 'Type', 'Content'];
    const rows: any[][] = [];

    sections.forEach((section) => {
      let content = '';
      
      switch (section.type) {
        case 'table':
          const table = section.element.querySelector('table');
          if (table) {
            const tableRows = Array.from(table.querySelectorAll('tr'));
            content = tableRows.map(row => 
              Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent?.trim()).join(' | ')
            ).join('\\n');
          }
          break;
        case 'kpi':
          const kpiValue = section.element.querySelector('[data-kpi-value]')?.textContent?.trim();
          const kpiChange = section.element.querySelector('[data-kpi-change]')?.textContent?.trim();
          content = `Value: ${kpiValue || 'N/A'}, Change: ${kpiChange || 'N/A'}`;
          break;
        case 'chart':
          content = 'Chart visualization (see PDF/PNG export for visual)';
          break;
      }

      rows.push([section.title, section.type, content]);
    });

    return {
      headers,
      rows,
      title,
      metadata: {
        'Generated': new Date().toISOString(),
        'Total Sections': sections.length,
        'Report Title': title
      }
    };
  }

  /**
   * Prepare element for export (add data attributes, ensure visibility)
   */
  static prepareElementForExport(element: HTMLElement): void {
    element.setAttribute('data-export-target', 'true');
    
    // Ensure element is visible
    const originalDisplay = element.style.display;
    const originalVisibility = element.style.visibility;
    
    element.style.display = 'block';
    element.style.visibility = 'visible';
    
    // Restore after a brief delay
    setTimeout(() => {
      element.style.display = originalDisplay;
      element.style.visibility = originalVisibility;
    }, 100);
  }

  /**
   * Show export progress indicator
   */
  static showExportProgress(message: string = 'Exporting...'): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'export-progress-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; padding: 20px; background: rgba(0, 0, 0, 0.8); border-radius: 8px;">
        <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
        <div>${message}</div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.appendChild(overlay);
    return overlay;
  }

  /**
   * Hide export progress indicator
   */
  static hideExportProgress(): void {
    const overlay = document.getElementById('export-progress-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

// Utility functions for common export operations
export const exportUtils = {
  /**
   * Quick PNG export with progress indicator
   */
  async quickPNG(element: HTMLElement, filename?: string): Promise<void> {
    const progress = ExportService.showExportProgress('Generating PNG...');
    try {
      ExportService.prepareElementForExport(element);
      await ExportService.exportToPNG(element, { filename });
    } finally {
      ExportService.hideExportProgress();
    }
  },

  /**
   * Quick PDF export with progress indicator
   */
  async quickPDF(element: HTMLElement, filename?: string): Promise<void> {
    const progress = ExportService.showExportProgress('Generating PDF...');
    try {
      ExportService.prepareElementForExport(element);
      await ExportService.exportToPDF(element, { filename });
    } finally {
      ExportService.hideExportProgress();
    }
  },

  /**
   * Quick Excel export with progress indicator
   */
  async quickExcel(data: ExportData, filename?: string): Promise<void> {
    const progress = ExportService.showExportProgress('Generating Excel file...');
    try {
      await ExportService.exportToExcel(data, { filename });
    } finally {
      ExportService.hideExportProgress();
    }
  }
};

export default ExportService;