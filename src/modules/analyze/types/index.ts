// Workspace and Analysis Types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  userId: string;
  files: WorkspaceFile[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'processing' | 'completed' | 'error';
}

export interface WorkspaceFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  uploadedAt: string;
  processedData: ProcessedFileData;
}

export interface ProcessedFileData {
  rows: number;
  columns: number;
  features: string[];
  dataTypes: {
    numeric: string[];
    categorical: string[];
    datetime: string[];
  };
  summary: {
    nullValues: number;
    duplicates: number;
    outliers: number;
  };
  preview: Record<string, any>[];
}

// Analysis Types
export interface AnalysisSummary {
  totalRows: number;
  totalColumns: number;
  dateRange: {
    start: string;
    end: string;
  };
  totalSales: number;
  uniqueProducts: number;
  uniqueCustomers: number;
  uniqueRegions: number;
}

export interface SalesAnalysis {
  totalSales: number;
  averageOrderValue: number;
  salesByPeriod: SalesDataPoint[];
  topProducts: ProductSales[];
  salesByRegion: RegionSales[];
  salesTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface ProductAnalysis {
  totalProducts: number;
  topSellingProducts: ProductSales[];
  productCategories: CategorySales[];
  productPerformance: ProductPerformance[];
}

export interface CustomerAnalysis {
  totalCustomers: number;
  customerSegments: CustomerSegment[];
  customerLifetimeValue: number;
  repeatCustomerRate: number;
  customerAcquisition: CustomerAcquisitionData[];
}

export interface RegionAnalysis {
  totalRegions: number;
  salesByRegion: RegionSales[];
  regionPerformance: RegionPerformance[];
  topPerformingRegions: RegionSales[];
}

export interface StockAnalysis {
  totalProducts: number;
  lowStockProducts: StockAlert[];
  stockTurnover: StockTurnover[];
  inventoryValue: number;
}

// Data Point Types
export interface SalesDataPoint {
  date: string;
  value: number;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface ProductSales {
  productId: string;
  productName: string;
  category: string;
  totalSales: number;
  quantity: number;
  revenue: number;
}

export interface RegionSales {
  region: string;
  totalSales: number;
  revenue: number;
  growth: number;
}

export interface CategorySales {
  category: string;
  totalSales: number;
  productCount: number;
  revenue: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  score: number;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  averageValue: number;
}

export interface CustomerAcquisitionData {
  date: string;
  newCustomers: number;
  totalCustomers: number;
}

export interface RegionPerformance {
  region: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  score: number;
  metrics: {
    sales: number;
    customers: number;
    growth: number;
  };
}

export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  status: 'critical' | 'low' | 'warning';
}

export interface StockTurnover {
  productId: string;
  productName: string;
  turnoverRate: number;
  category: string;
}

// Chart Data Types
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter';

export interface ChartConfig {
  type: ChartType;
  title: string;
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}

// Analysis Filters
export interface AnalysisFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  regions?: string[];
  products?: string[];
  categories?: string[];
  customers?: string[];
}