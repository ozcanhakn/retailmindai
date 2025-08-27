export interface SavedWorkspace {
  id: string;
  name: string;
  description?: string;
  analysisType: 'sales' | 'customer' | 'product' | 'region' | 'comprehensive';
  createdAt: Date;
  updatedAt: Date;
  summary: {
    totalSales?: number;
    totalRevenue?: number;
    topProducts?: string[];
    topRegions?: string[];
    topMetrics: MetricData[];
  };
  tags: string[];
  starred: boolean;
  visibility: 'private' | 'team' | 'public';
  kpiCount: number;
  chartCount: number;
  dataRows: number;
  data: {
    kpiData: any[];
    chartData: any[];
    rawData: any[];
    filters: any;
    metadata: any;
  };
}

export interface MetricData {
  label?: string;
  name: string;
  value: string | number;
  change?: number;
  type?: 'currency' | 'percentage' | 'number' | 'count' | 'text';
}

export interface SaveWorkspaceRequest {
  name: string;
  description?: string;
  tags: string[];
  visibility: 'private' | 'team' | 'public';
  analysisData: {
    kpiData: any[];
    chartData: any[];
    rawData: any[];
    filters: any;
    metadata: any;
  };
}

export interface WorkspaceFilters {
  search?: string;
  analysisType?: 'all' | 'sales' | 'customer' | 'product' | 'region' | 'comprehensive';
  tags?: string[];
  starred?: boolean;
  visibility?: 'all' | 'private' | 'team' | 'public';
  sortBy?: 'recent' | 'name' | 'type' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface WorkspaceFilter {
  sortBy?: 'recent' | 'name' | 'type' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface WorkspaceStats {
  total: number;
  starred: number;
  byType: Record<string, number>;
}