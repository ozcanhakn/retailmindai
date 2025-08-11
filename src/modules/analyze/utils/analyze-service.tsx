import { 
  Workspace, 
  AnalysisSummary, 
  SalesAnalysis, 
  ProductAnalysis, 
  CustomerAnalysis, 
  RegionAnalysis, 
  StockAnalysis,
  AnalysisFilters 
} from '../types';

interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  fileIds: string[];
}

interface CreateWorkspaceResponse {
  success: boolean;
  workspace?: Workspace;
  error?: string;
}

interface AnalysisResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AnalyzeService {
  private static BASE_URL = '/api/analyze';

  // Workspace Management
  static async createWorkspace(request: CreateWorkspaceRequest): Promise<CreateWorkspaceResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/workspace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create workspace error:', error);
      return {
        success: false,
        error: 'Workspace oluşturma hatası'
      };
    }
  }

  static async getWorkspace(workspaceId: string): Promise<CreateWorkspaceResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/workspace/${workspaceId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get workspace error:', error);
      return {
        success: false,
        error: 'Workspace yükleme hatası'
      };
    }
  }

  static async deleteWorkspace(workspaceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/workspace/${workspaceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Delete workspace error:', error);
      return {
        success: false,
        error: 'Workspace silme hatası'
      };
    }
  }

  // Analysis Methods
  static async getAnalysisSummary(
    workspaceId: string, 
    filters?: AnalysisFilters
  ): Promise<AnalysisResponse<AnalysisSummary>> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }
      if (filters?.regions?.length) {
        params.append('regions', filters.regions.join(','));
      }

      const response = await fetch(
        `${this.BASE_URL}/workspace/${workspaceId}/summary?${params}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Analysis summary error:', error);
      return {
        success: false,
        error: 'Analiz özeti yükleme hatası'
      };
    }
  }

  static async getSalesAnalysis(
    workspaceId: string, 
    filters?: AnalysisFilters
  ): Promise<AnalysisResponse<SalesAnalysis>> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }

      const response = await fetch(
        `${this.BASE_URL}/workspace/${workspaceId}/sales?${params}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Sales analysis error:', error);
      return {
        success: false,
        error: 'Satış analizi yükleme hatası'
      };
    }
  }

  static async getProductAnalysis(
    workspaceId: string, 
    filters?: AnalysisFilters
  ): Promise<AnalysisResponse<ProductAnalysis>> {
    try {
      const params = new URLSearchParams();
      if (filters?.categories?.length) {
        params.append('categories', filters.categories.join(','));
      }

      const response = await fetch(
        `${this.BASE_URL}/workspace/${workspaceId}/products?${params}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Product analysis error:', error);
      return {
        success: false,
        error: 'Ürün analizi yükleme hatası'
      };
    }
  }

  static async getCustomerAnalysis(
    workspaceId: string, 
    filters?: AnalysisFilters
  ): Promise<AnalysisResponse<CustomerAnalysis>> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }

      const response = await fetch(
        `${this.BASE_URL}/workspace/${workspaceId}/customers?${params}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Customer analysis error:', error);
      return {
        success: false,
        error: 'Müşteri analizi yükleme hatası'
      };
    }
  }

  static async getRegionAnalysis(
    workspaceId: string, 
    filters?: AnalysisFilters
  ): Promise<AnalysisResponse<RegionAnalysis>> {
    try {
      const params = new URLSearchParams();
      if (filters?.regions?.length) {
        params.append('regions', filters.regions.join(','));
      }

      const response = await fetch(
        `${this.BASE_URL}/workspace/${workspaceId}/regions?${params}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Region analysis error:', error);
      return {
        success: false,
        error: 'Bölge analizi yükleme hatası'
      };
    }
  }

  static async getStockAnalysis(
    workspaceId: string, 
    filters?: AnalysisFilters
  ): Promise<AnalysisResponse<StockAnalysis>> {
    try {
      const params = new URLSearchParams();
      if (filters?.products?.length) {
        params.append('products', filters.products.join(','));
      }

      const response = await fetch(
        `${this.BASE_URL}/workspace/${workspaceId}/stock?${params}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Stock analysis error:', error);
      return {
        success: false,
        error: 'Stok analizi yükleme hatası'
      };
    }
  }

  // Utility Methods
  static generateMockWorkspaceId(): string {
    return crypto.randomUUID();
  }

  static formatCurrency(amount: number, currency: string = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static formatNumber(number: number): string {
    return new Intl.NumberFormat('tr-TR').format(number);
  }

  static formatPercentage(value: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }
}