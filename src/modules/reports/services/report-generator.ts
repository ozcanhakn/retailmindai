import { ExportService, ExportData } from '@/lib/export-service';
import html2canvas from 'html2canvas';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'analytics' | 'sales' | 'kpi' | 'custom';
  sections: ReportSection[];
  layout: 'portrait' | 'landscape';
  format: 'pdf' | 'excel' | 'both';
  styling: ReportStyling;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'kpi' | 'text' | 'image';
  dataSource: string;
  component?: string;
  query?: string;
  filters?: Record<string, any>;
  order: number;
  styling?: SectionStyling;
}

export interface ReportStyling {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  headerStyle: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
  };
  logoUrl?: string;
  showTimestamp: boolean;
  showPageNumbers: boolean;
  watermark?: string;
}

export interface SectionStyling {
  backgroundColor?: string;
  borderColor?: string;
  padding?: number;
  margin?: number;
  alignment?: 'left' | 'center' | 'right';
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  schedule: ReportSchedule;
  recipients: string[];
  isActive: boolean;
  lastGenerated?: Date;
  nextGeneration: Date;
  createdAt: Date;
  format: 'pdf' | 'excel' | 'both';
  includeAttachments: boolean;
}

export interface ReportSchedule {
  type: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  timezone: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  scheduledReportId?: string;
  name: string;
  generatedAt: Date;
  format: 'pdf' | 'excel';
  filePath: string;
  fileSize: number;
  downloadUrl: string;
  expiresAt?: Date;
}

export class ReportGenerator {
  private static instance: ReportGenerator;
  private templates: Map<string, ReportTemplate> = new Map();
  private scheduledReports: Map<string, ScheduledReport> = new Map();
  private generatedReports: Map<string, GeneratedReport> = new Map();

  static getInstance(): ReportGenerator {
    if (!ReportGenerator.instance) {
      ReportGenerator.instance = new ReportGenerator();
    }
    return ReportGenerator.instance;
  }

  // Template Management
  createTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): ReportTemplate {
    const newTemplate: ReportTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.templates.set(newTemplate.id, newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  updateTemplate(id: string, updates: Partial<ReportTemplate>): ReportTemplate | null {
    const template = this.templates.get(id);
    if (!template) return null;

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date()
    };
    
    this.templates.set(id, updatedTemplate);
    this.saveToStorage();
    return updatedTemplate;
  }

  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  getTemplate(id: string): ReportTemplate | null {
    return this.templates.get(id) || null;
  }

  getAllTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  // Scheduled Report Management
  scheduleReport(report: Omit<ScheduledReport, 'id' | 'createdAt' | 'nextGeneration'>): ScheduledReport {
    const nextGeneration = this.calculateNextGeneration(report.schedule);
    const scheduledReport: ScheduledReport = {
      ...report,
      id: this.generateId(),
      createdAt: new Date(),
      nextGeneration
    };
    
    this.scheduledReports.set(scheduledReport.id, scheduledReport);
    this.saveToStorage();
    return scheduledReport;
  }

  updateScheduledReport(id: string, updates: Partial<ScheduledReport>): ScheduledReport | null {
    const report = this.scheduledReports.get(id);
    if (!report) return null;

    const updatedReport = { ...report, ...updates };
    if (updates.schedule) {
      updatedReport.nextGeneration = this.calculateNextGeneration(updates.schedule);
    }
    
    this.scheduledReports.set(id, updatedReport);
    this.saveToStorage();
    return updatedReport;
  }

  deleteScheduledReport(id: string): boolean {
    const deleted = this.scheduledReports.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  getScheduledReport(id: string): ScheduledReport | null {
    return this.scheduledReports.get(id) || null;
  }

  getAllScheduledReports(): ScheduledReport[] {
    return Array.from(this.scheduledReports.values());
  }

  // Report Generation
  async generateReport(
    templateId: string, 
    options: {
      filename?: string;
      filters?: Record<string, any>;
      scheduledReportId?: string;
    } = {}
  ): Promise<GeneratedReport> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    try {
      // Create report content
      const reportContent = await this.buildReportContent(template, options.filters);
      
      // Generate filename
      const filename = options.filename || `${template.name}-${new Date().toISOString().split('T')[0]}`;
      
      // Export based on format
      let filePath: string;
      let fileSize: number;
      
      if (template.format === 'pdf' || template.format === 'both') {
        await this.generatePDFReport(reportContent, template, filename);
      }
      
      if (template.format === 'excel' || template.format === 'both') {
        await this.generateExcelReport(reportContent, template, filename);
      }

      // Create generated report record
      const generatedReport: GeneratedReport = {
        id: this.generateId(),
        templateId,
        scheduledReportId: options.scheduledReportId,
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        generatedAt: new Date(),
        format: template.format === 'both' ? 'pdf' : template.format,
        filePath: `/reports/${filename}`,
        fileSize: 0, // Will be calculated after file creation
        downloadUrl: `/api/reports/download/${this.generateId()}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      this.generatedReports.set(generatedReport.id, generatedReport);
      this.saveToStorage();

      // Update scheduled report if applicable
      if (options.scheduledReportId) {
        const scheduledReport = this.scheduledReports.get(options.scheduledReportId);
        if (scheduledReport) {
          scheduledReport.lastGenerated = new Date();
          scheduledReport.nextGeneration = this.calculateNextGeneration(scheduledReport.schedule);
          this.scheduledReports.set(options.scheduledReportId, scheduledReport);
        }
      }

      return generatedReport;
    } catch (error) {
      console.error('Report generation failed:', error);
      throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Built-in Templates
  getBuiltInTemplates(): ReportTemplate[] {
    return [
      {
        id: 'dashboard-overview',
        name: 'Dashboard Overview Report',
        description: 'Comprehensive overview of all key metrics and KPIs',
        type: 'dashboard',
        sections: [
          {
            id: 'kpi-summary',
            title: 'Key Performance Indicators',
            type: 'kpi',
            dataSource: 'kpi-dashboard',
            component: 'advanced-kpi-dashboard',
            order: 1
          },
          {
            id: 'sales-charts',
            title: 'Sales Analysis',
            type: 'chart',
            dataSource: 'sales-analysis',
            component: 'sales-analysis-charts',
            order: 2
          },
          {
            id: 'customer-insights',
            title: 'Customer Insights',
            type: 'chart',
            dataSource: 'customer-analysis',
            component: 'customer-analysis-charts',
            order: 3
          }
        ],
        layout: 'portrait',
        format: 'both',
        styling: this.getDefaultStyling(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sales-performance',
        name: 'Sales Performance Report',
        description: 'Detailed analysis of sales performance by region, product, and time',
        type: 'sales',
        sections: [
          {
            id: 'sales-overview',
            title: 'Sales Overview',
            type: 'kpi',
            dataSource: 'sales-kpis',
            order: 1
          },
          {
            id: 'regional-performance',
            title: 'Regional Performance',
            type: 'chart',
            dataSource: 'region-analysis',
            component: 'region-analysis-charts',
            order: 2
          },
          {
            id: 'product-performance',
            title: 'Product Performance',
            type: 'chart',
            dataSource: 'product-analysis',
            component: 'product-analysis-charts',
            order: 3
          }
        ],
        layout: 'landscape',
        format: 'pdf',
        styling: this.getDefaultStyling(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'monthly-analytics',
        name: 'Monthly Analytics Report',
        description: 'Monthly summary of business analytics and trends',
        type: 'analytics',
        sections: [
          {
            id: 'monthly-summary',
            title: 'Monthly Summary',
            type: 'text',
            dataSource: 'analytics-summary',
            order: 1
          },
          {
            id: 'trend-analysis',
            title: 'Trend Analysis',
            type: 'chart',
            dataSource: 'trend-data',
            order: 2
          },
          {
            id: 'performance-metrics',
            title: 'Performance Metrics',
            type: 'table',
            dataSource: 'performance-data',
            order: 3
          }
        ],
        layout: 'portrait',
        format: 'both',
        styling: this.getDefaultStyling(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // Private Methods
  private async buildReportContent(template: ReportTemplate, filters?: Record<string, any>): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = 'report-container';
    container.style.cssText = `
      font-family: ${template.styling.fontFamily};
      font-size: ${template.styling.fontSize}px;
      background: white;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    `;

    // Add header
    const header = this.createReportHeader(template);
    container.appendChild(header);

    // Add sections
    for (const section of template.sections.sort((a, b) => a.order - b.order)) {
      const sectionElement = await this.createReportSection(section, filters);
      container.appendChild(sectionElement);
    }

    // Add footer
    const footer = this.createReportFooter(template);
    container.appendChild(footer);

    return container;
  }

  private createReportHeader(template: ReportTemplate): HTMLElement {
    const header = document.createElement('div');
    header.className = 'report-header';
    header.style.cssText = `
      background: ${template.styling.headerStyle.backgroundColor};
      color: ${template.styling.headerStyle.textColor};
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const titleSection = document.createElement('div');
    titleSection.innerHTML = `
      <h1 style="margin: 0; font-size: ${template.styling.headerStyle.fontSize}px; font-weight: ${template.styling.headerStyle.fontWeight};">
        ${template.name}
      </h1>
      <p style="margin: 5px 0 0 0; opacity: 0.8;">${template.description}</p>
    `;

    const metaSection = document.createElement('div');
    metaSection.style.textAlign = 'right';
    metaSection.innerHTML = `
      <div style="opacity: 0.8;">Generated on</div>
      <div style="font-weight: bold;">${new Date().toLocaleDateString()}</div>
    `;

    header.appendChild(titleSection);
    header.appendChild(metaSection);

    return header;
  }

  private async createReportSection(section: ReportSection, filters?: Record<string, any>): Promise<HTMLElement> {
    const sectionElement = document.createElement('div');
    sectionElement.className = 'report-section';
    sectionElement.style.cssText = `
      margin-bottom: 40px;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: ${section.styling?.backgroundColor || '#ffffff'};
    `;

    // Section title
    const title = document.createElement('h2');
    title.textContent = section.title;
    title.style.cssText = `
      margin: 0 0 20px 0;
      color: #333;
      font-size: 24px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    `;
    sectionElement.appendChild(title);

    // Section content based on type
    const content = await this.createSectionContent(section, filters);
    sectionElement.appendChild(content);

    return sectionElement;
  }

  private async createSectionContent(section: ReportSection, filters?: Record<string, any>): Promise<HTMLElement> {
    const content = document.createElement('div');
    content.className = `section-content section-${section.type}`;

    switch (section.type) {
      case 'kpi':
        content.innerHTML = `
          <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div class="kpi-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #2563eb;">$125,430</div>
              <div style="color: #666; margin-top: 5px;">Total Revenue</div>
            </div>
            <div class="kpi-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #059669;">1,247</div>
              <div style="color: #666; margin-top: 5px;">Total Orders</div>
            </div>
            <div class="kpi-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #dc2626;">324</div>
              <div style="color: #666; margin-top: 5px;">New Customers</div>
            </div>
          </div>
        `;
        break;

      case 'chart':
        content.innerHTML = `
          <div class="chart-placeholder" style="height: 300px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666;">
            <div style="text-align: center;">
              <div style="font-size: 18px; margin-bottom: 10px;">📊</div>
              <div>Chart visualization will be rendered here</div>
              <div style="font-size: 12px; margin-top: 5px;">Data Source: ${section.dataSource}</div>
            </div>
          </div>
        `;
        break;

      case 'table':
        content.innerHTML = `
          <div class="table-container" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Metric</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Value</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Revenue</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">$125,430</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6; color: #059669;">+12.5%</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">Orders</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">1,247</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6; color: #059669;">+8.3%</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
        break;

      case 'text':
        content.innerHTML = `
          <div class="text-content" style="line-height: 1.6; color: #333;">
            <p>This section contains analytical insights and summary information based on the data analysis.</p>
            <p>Key findings and recommendations will be displayed here in a structured format.</p>
          </div>
        `;
        break;

      default:
        content.innerHTML = `<div style="color: #666;">Unsupported section type: ${section.type}</div>`;
    }

    return content;
  }

  private createReportFooter(template: ReportTemplate): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'report-footer';
    footer.style.cssText = `
      margin-top: 40px;
      padding: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 12px;
    `;

    footer.innerHTML = `
      <div>Generated by RetailMind AI on ${new Date().toLocaleString()}</div>
      ${template.styling.watermark ? `<div style="margin-top: 5px; opacity: 0.5;">${template.styling.watermark}</div>` : ''}
    `;

    return footer;
  }

  private async generatePDFReport(content: HTMLElement, template: ReportTemplate, filename: string): Promise<void> {
    await ExportService.exportToPDF(content, {
      filename: `${filename}.pdf`,
      orientation: template.layout,
      title: template.name,
      author: 'RetailMind AI',
      subject: template.description
    });
  }

  private async generateExcelReport(content: HTMLElement, template: ReportTemplate, filename: string): Promise<void> {
    const data: ExportData = {
      headers: ['Section', 'Type', 'Content'],
      rows: template.sections.map(section => [
        section.title,
        section.type,
        `Data from ${section.dataSource}`
      ]),
      title: template.name,
      metadata: {
        'Generated': new Date().toISOString(),
        'Template': template.name,
        'Description': template.description
      }
    };

    await ExportService.exportToExcel(data, {
      filename: `${filename}.xlsx`,
      title: template.name
    });
  }

  private calculateNextGeneration(schedule: ReportSchedule): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);

    switch (schedule.type) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(hours, minutes, 0, 0);
        return tomorrow;

      case 'weekly':
        const nextWeek = new Date(now);
        const daysUntilTarget = ((schedule.dayOfWeek || 0) - now.getDay() + 7) % 7;
        nextWeek.setDate(nextWeek.getDate() + (daysUntilTarget || 7));
        nextWeek.setHours(hours, minutes, 0, 0);
        return nextWeek;

      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(schedule.dayOfMonth || 1);
        nextMonth.setHours(hours, minutes, 0, 0);
        return nextMonth;

      case 'quarterly':
        const nextQuarter = new Date(now);
        nextQuarter.setMonth(nextQuarter.getMonth() + 3);
        nextQuarter.setDate(1);
        nextQuarter.setHours(hours, minutes, 0, 0);
        return nextQuarter;

      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to tomorrow
    }
  }

  private getDefaultStyling(): ReportStyling {
    return {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 14,
      headerStyle: {
        backgroundColor: '#1e293b',
        textColor: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold'
      },
      showTimestamp: true,
      showPageNumbers: true
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('reportTemplates', JSON.stringify(Array.from(this.templates.entries())));
      localStorage.setItem('scheduledReports', JSON.stringify(Array.from(this.scheduledReports.entries())));
      localStorage.setItem('generatedReports', JSON.stringify(Array.from(this.generatedReports.entries())));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const templates = localStorage.getItem('reportTemplates');
      if (templates) {
        this.templates = new Map(JSON.parse(templates));
      }

      const scheduled = localStorage.getItem('scheduledReports');
      if (scheduled) {
        this.scheduledReports = new Map(JSON.parse(scheduled));
      }

      const generated = localStorage.getItem('generatedReports');
      if (generated) {
        this.generatedReports = new Map(JSON.parse(generated));
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }

  // Initialize the service
  constructor() {
    this.loadFromStorage();
    
    // Initialize with built-in templates
    const builtInTemplates = this.getBuiltInTemplates();
    builtInTemplates.forEach(template => {
      if (!this.templates.has(template.id)) {
        this.templates.set(template.id, template);
      }
    });
  }
}

// Singleton instance
const reportGeneratorInstance = new ReportGenerator();
export default reportGeneratorInstance;