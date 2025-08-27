import { CalculatedKPI } from '../types/kpi-definitions';

export interface ExportData {
  kpis: CalculatedKPI[];
  rawData: any[];
  metadata: {
    generatedAt: Date;
    dataSource: string;
    totalRows: number;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'png';
  filename: string;
  title: string;
  subtitle?: string;
  includeCharts?: boolean;
  includeRawData?: boolean;
}

class ExportService {
  async exportToPDF(data: ExportData, options: ExportOptions): Promise<void> {
    try {
      // Dynamic import to reduce bundle size
      const jsPDF = (await import('jspdf')).default;
      
      const pdf = new jsPDF();
      let yPosition = 20;

      // Title
      pdf.setFontSize(20);
      pdf.text(options.title, 20, yPosition);
      yPosition += 15;

      // Subtitle
      if (options.subtitle) {
        pdf.setFontSize(12);
        pdf.text(options.subtitle, 20, yPosition);
        yPosition += 10;
      }

      // Metadata
      pdf.setFontSize(10);
      pdf.text(`Generated: ${data.metadata.generatedAt.toLocaleString()}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Data Source: ${data.metadata.dataSource}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Total Records: ${data.metadata.totalRows.toLocaleString()}`, 20, yPosition);
      yPosition += 15;

      // KPI Summary
      pdf.setFontSize(14);
      pdf.text('KPI Summary', 20, yPosition);
      yPosition += 10;

      // KPI Table
      pdf.setFontSize(10);
      const tableHeaders = ['KPI', 'Value', 'Category', 'Trend'];
      const tableData = data.kpis.slice(0, 20).map(kpi => [
        kpi.definition.title,
        this.formatKPIValue(kpi),
        kpi.definition.category,
        kpi.trend ? `${kpi.trend.direction} ${kpi.trend.percentage.toFixed(1)}%` : '-'
      ]);

      // Simple table implementation
      let xPosition = 20;
      const columnWidths = [80, 40, 30, 30];
      
      // Headers
      pdf.setFont('helvetica', 'bold');
      tableHeaders.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += 7;

      // Data rows
      pdf.setFont('helvetica', 'normal');
      tableData.forEach(row => {
        xPosition = 20;
        row.forEach((cell, index) => {
          pdf.text(String(cell), xPosition, yPosition);
          xPosition += columnWidths[index];
        });
        yPosition += 5;
        
        // New page if needed
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      });

      // Save
      pdf.save(options.filename + '.pdf');
      
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  async exportToExcel(data: ExportData, options: ExportOptions): Promise<void> {
    try {
      // Dynamic import to reduce bundle size
      const XLSX = await import('xlsx');
      
      const workbook = XLSX.utils.book_new();

      // KPI Summary sheet
      const kpiData = data.kpis.map(kpi => ({
        'KPI ID': kpi.definition.id,
        'KPI Name': kpi.definition.title,
        'Description': kpi.definition.description,
        'Category': kpi.definition.category,
        'Value': kpi.value,
        'Unit': kpi.definition.unit,
        'Format': kpi.definition.format,
        'Trend Direction': kpi.trend?.direction || '',
        'Trend Percentage': kpi.trend?.percentage || '',
        'Previous Value': kpi.previousValue || ''
      }));

      const kpiWorksheet = XLSX.utils.json_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(workbook, kpiWorksheet, 'KPI Summary');

      // Raw data sheet (if requested and available)
      if (options.includeRawData && data.rawData.length > 0) {
        const rawDataWorksheet = XLSX.utils.json_to_sheet(data.rawData);
        XLSX.utils.book_append_sheet(workbook, rawDataWorksheet, 'Raw Data');
      }

      // Metadata sheet
      const metadata = [
        { Property: 'Generated At', Value: data.metadata.generatedAt.toISOString() },
        { Property: 'Data Source', Value: data.metadata.dataSource },
        { Property: 'Total Records', Value: data.metadata.totalRows },
        { Property: 'Total KPIs', Value: data.kpis.length }
      ];

      if (data.metadata.dateRange) {
        metadata.push(
          { Property: 'Date Range Start', Value: data.metadata.dateRange.start.toISOString() },
          { Property: 'Date Range End', Value: data.metadata.dateRange.end.toISOString() }
        );
      }

      const metadataWorksheet = XLSX.utils.json_to_sheet(metadata);
      XLSX.utils.book_append_sheet(workbook, metadataWorksheet, 'Metadata');

      // Write file
      XLSX.writeFile(workbook, options.filename + '.xlsx');
      
    } catch (error) {
      console.error('Excel export failed:', error);
      throw new Error('Failed to generate Excel report');
    }
  }

  async exportToPNG(elementId: string, options: ExportOptions): Promise<void> {
    try {
      // Dynamic import to reduce bundle size
      const html2canvas = (await import('html2canvas')).default;
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID "${elementId}" not found`);
      }

      const canvas = await html2canvas(element, {
        background: '#ffffff',
        logging: false,
        useCORS: true
      });

      // Create download link
      const link = document.createElement('a');
      link.download = options.filename + '.png';
      link.href = canvas.toDataURL('image/png');
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('PNG export failed:', error);
      throw new Error('Failed to generate PNG image');
    }
  }

  async exportBulk(data: ExportData, formats: ('pdf' | 'excel' | 'png')[]): Promise<void> {
    const promises = formats.map(format => {
      const options: ExportOptions = {
        format,
        filename: `analytics-dashboard-${new Date().toISOString().split('T')[0]}`,
        title: 'Analytics Dashboard Report',
        subtitle: `Generated from ${data.metadata.totalRows.toLocaleString()} records`,
        includeCharts: true,
        includeRawData: true
      };

      switch (format) {
        case 'pdf':
          return this.exportToPDF(data, options);
        case 'excel':
          return this.exportToExcel(data, options);
        case 'png':
          return this.exportToPNG('dashboard-content', options);
        default:
          return Promise.reject(new Error(`Unsupported format: ${format}`));
      }
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Bulk export failed:', error);
      throw new Error('Failed to complete bulk export');
    }
  }

  private formatKPIValue(kpi: CalculatedKPI): string {
    const { value, definition } = kpi;
    
    switch (definition.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'decimal':
        return value.toFixed(2);
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(Math.round(value));
    }
  }

  // Utility method to generate file names with timestamps
  generateFileName(baseName: string, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${baseName}-${timestamp}.${format}`;
  }

  // Method to check if export dependencies are available
  async checkDependencies(): Promise<{ pdf: boolean; excel: boolean; png: boolean }> {
    const checks = {
      pdf: false,
      excel: false,
      png: false
    };

    try {
      await import('jspdf');
      checks.pdf = true;
    } catch (e) {
      console.warn('jsPDF not available');
    }

    try {
      await import('xlsx');
      checks.excel = true;
    } catch (e) {
      console.warn('XLSX not available');
    }

    try {
      await import('html2canvas');
      checks.png = true;
    } catch (e) {
      console.warn('html2canvas not available');
    }

    return checks;
  }
}

export const exportService = new ExportService();