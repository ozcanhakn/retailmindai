"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Download, 
  RefreshCw, 
  Settings, 
  Upload,
  Filter,
  Eye,
  TrendingUp,
  Users,
  Package,
  Target,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import our custom components
import { AnalyticsSidebar } from '../components/analytics-sidebar';
import { AnalyticsFilters, FilterState } from '../components/analytics-filters';
import { KPIGrid, KPISummaryCard, QuickStats } from '../components/kpi-cards';
import { AdvancedBarChart, AdvancedLineChart, AdvancedPieChart, HeatmapChart, DashboardChart } from '../components/advanced-charts';
import { AdvancedFileUpload } from '../components/file-upload';

// Import types and services
import { KPI_DEFINITIONS, CalculatedKPI, getKPIsByCategory, KPICategory } from '../../types/kpi-definitions';
import { kpiDetector, KPIDetectionResult } from '../../utils/kpi-detector';
import { exportService, ExportData } from '../../utils/export-service';

interface AnalyticsDashboardProps {
  className?: string;
}

interface DashboardState {
  selectedTab: KPICategory | 'overview';
  filters: FilterState;
  kpiData: CalculatedKPI[];
  rawData: Record<string, any>[];
  detectionResult: KPIDetectionResult | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const [state, setState] = useState<DashboardState>({
    selectedTab: 'overview',
    filters: {
      dateRange: {},
      categories: [],
      regions: [],
      products: [],
      channels: [],
      customerSegments: [],
      priceRange: {},
      searchQuery: ''
    },
    kpiData: [],
    rawData: [],
    detectionResult: null,
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Mock available filters - in real app, this would come from data analysis
  const availableFilters = {
    categories: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'],
    regions: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'],
    products: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    channels: ['Online', 'Retail Store', 'Mobile App', 'Social Media', 'Phone'],
    customerSegments: ['Premium', 'Standard', 'Budget', 'Enterprise', 'Student'],
    priceRange: { min: 0, max: 10000 }
  };

  // Handle file upload and KPI detection
  const handleFilesUploaded = async (files: any[]) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // In real implementation, this would process the uploaded files
      // For now, we'll simulate with mock data
      const mockData = generateMockData(1000);
      const columns = Object.keys(mockData[0] || {});
      
      // Detect column mappings and available KPIs
      const columnMappings = kpiDetector.detectColumnMappings(columns, mockData.slice(0, 10));
      const detectionResult = kpiDetector.detectAvailableKPIs(mockData, columnMappings);

      setState(prev => ({
        ...prev,
        rawData: mockData,
        kpiData: detectionResult.availableKPIs,
        detectionResult,
        isLoading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to process files: ${error}`,
        isLoading: false
      }));
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setState(prev => ({ ...prev, filters: newFilters }));
    // In real app, this would trigger data re-filtering and KPI recalculation
  };

  // Handle export
  const handleExport = async (format: 'pdf' | 'excel' | 'png') => {
    if (state.kpiData.length === 0) {
      alert('No data available to export');
      return;
    }

    setIsExporting(true);

    try {
      const exportData: ExportData = {
        kpis: state.kpiData,
        rawData: state.rawData,
        metadata: {
          generatedAt: new Date(),
          dataSource: 'Uploaded CSV Files',
          totalRows: state.rawData.length,
          dateRange: state.filters.dateRange.start && state.filters.dateRange.end ? {
            start: state.filters.dateRange.start,
            end: state.filters.dateRange.end
          } : undefined
        }
      };

      const options = {
        format,
        filename: `analytics-dashboard-${new Date().toISOString().split('T')[0]}`,
        title: 'Analytics Dashboard Report',
        subtitle: `Generated from ${state.rawData.length.toLocaleString()} records`,
        includeCharts: true,
        includeRawData: true
      };

      switch (format) {
        case 'pdf':
          await exportService.exportToPDF(exportData, options);
          break;
        case 'excel':
          await exportService.exportToExcel(exportData, options);
          break;
        case 'png':
          await exportService.exportToPNG('dashboard-content', options);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Get KPIs for current tab
  const getTabKPIs = (tab: string): CalculatedKPI[] => {
    if (tab === 'overview') {
      return state.kpiData.slice(0, 8); // Show key overview KPIs
    }
    return getKPIsByCategory(state.kpiData, tab as KPICategory);
  };

  // Generate chart data for current tab
  const generateChartData = (tab: string) => {
    // Mock chart data - in real app, this would be generated from actual data
    const mockChartData = Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      revenue: Math.floor(Math.random() * 100000) + 50000,
      orders: Math.floor(Math.random() * 1000) + 500,
      customers: Math.floor(Math.random() * 500) + 200
    }));

    return mockChartData;
  };

  const tabKPIs = getTabKPIs(state.selectedTab);
  const chartData = generateChartData(state.selectedTab);

  return (
    <div className={cn("flex h-screen bg-gray-50", className)}>
      {/* Sidebar */}
      <AnalyticsSidebar />

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnalyticsFilters
              initialFilters={state.filters}
              availableFilters={availableFilters}
              onFiltersChange={handleFiltersChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-600">
                Comprehensive e-commerce KPI analysis and reporting
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Filter Toggle */}
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              {/* Export Dropdown */}
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting || state.kpiData.length === 0}
                >
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('excel')}
                  disabled={isExporting || state.kpiData.length === 0}
                >
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('png')}
                  disabled={isExporting || state.kpiData.length === 0}
                >
                  PNG
                </Button>
              </div>

              {/* Refresh */}
              <Button variant="outline" size="sm" disabled={state.isLoading}>
                <RefreshCw className={cn("h-4 w-4", state.isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div id="dashboard-content" className="flex-1 overflow-auto p-6">
          {state.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* No Data State */}
          {state.kpiData.length === 0 && !state.isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <Upload className="h-16 w-16 mx-auto text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Data Available
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload CSV files to start analyzing your e-commerce data and generate comprehensive KPI reports.
                </p>
                <AdvancedFileUpload
                  onFilesUploaded={handleFilesUploaded}
                  onKPIsDetected={(kpis) => console.log('Detected KPIs:', kpis)}
                  className="max-w-2xl mx-auto"
                />
              </div>
            </motion.div>
          )}

          {/* Dashboard Content */}
          {state.kpiData.length > 0 && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickStats
                  totalKPIs={KPI_DEFINITIONS.length}
                  availableKPIs={state.kpiData.length}
                  lastUpdated={state.lastUpdated}
                />
                
                {state.detectionResult && (
                  <KPISummaryCard
                    title="KPI Status Overview"
                    kpis={state.kpiData}
                  />
                )}

                <Card style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>Data Quality</h3>
                        <p className="text-sm" style={{ color: '#B4C2DC' }}>
                          {state.detectionResult ? 
                            `${state.detectionResult.coverage.percentage.toFixed(0)}% Coverage` : 
                            'Processing...'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for KPI Categories */}
              <Tabs value={state.selectedTab} onValueChange={(value) => 
                setState(prev => ({ ...prev, selectedTab: value as any }))
              }>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview" className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="sales" className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Sales</span>
                  </TabsTrigger>
                  <TabsTrigger value="customers" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Customers</span>
                  </TabsTrigger>
                  <TabsTrigger value="operations" className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Operations</span>
                  </TabsTrigger>
                  <TabsTrigger value="forecast" className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Forecast</span>
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AdvancedLineChart
                      data={chartData}
                      title="Revenue Trend"
                      description="Monthly revenue performance"
                      xKey="month"
                      yKeys={["revenue"]}
                      area={true}
                    />
                    <AdvancedBarChart
                      data={chartData}
                      title="Orders vs Customers"
                      description="Monthly orders and customer acquisition"
                      xKey="month"
                      yKey="orders"
                    />
                  </div>
                  <KPIGrid kpis={tabKPIs.map(kpi => ({ definition: kpi.definition, value: kpi.value }))} />
                </TabsContent>

                {/* Sales Tab */}
                <TabsContent value="sales" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <DashboardChart
                        data={chartData}
                        title="Sales Performance"
                        xKey="month"
                        metrics={[
                          { key: 'revenue', name: 'Revenue', type: 'bar', color: '#3B82F6' },
                          { key: 'orders', name: 'Orders', type: 'line', color: '#10B981' }
                        ]}
                      />
                    </div>
                    <AdvancedPieChart
                      data={[
                        { name: 'Online', value: 45 },
                        { name: 'Retail', value: 30 },
                        { name: 'Mobile', value: 25 }
                      ]}
                      title="Sales by Channel"
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                    />
                  </div>
                  <KPIGrid kpis={tabKPIs.map(kpi => ({ definition: kpi.definition, value: kpi.value }))} />
                </TabsContent>

                {/* Other tabs follow similar patterns */}
                <TabsContent value="customers" className="space-y-6">
                  <KPIGrid kpis={tabKPIs.map(kpi => ({ definition: kpi.definition, value: kpi.value }))} />
                </TabsContent>

                <TabsContent value="operations" className="space-y-6">
                  <KPIGrid kpis={tabKPIs.map(kpi => ({ definition: kpi.definition, value: kpi.value }))} />
                </TabsContent>

                <TabsContent value="forecast" className="space-y-6">
                  <KPIGrid kpis={tabKPIs.map(kpi => ({ definition: kpi.definition, value: kpi.value }))} />
                </TabsContent>

                {/* Upload Tab */}
                <TabsContent value="upload" className="space-y-6">
                  <AdvancedFileUpload
                    onFilesUploaded={handleFilesUploaded}
                    onKPIsDetected={(kpis) => console.log('Detected KPIs:', kpis)}
                  />
                  
                  {state.detectionResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle>KPI Detection Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {state.detectionResult.availableKPIs.length}
                              </div>
                              <div className="text-sm text-gray-600">Available KPIs</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {state.detectionResult.coverage.percentage.toFixed(0)}%
                              </div>
                              <div className="text-sm text-gray-600">Coverage</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {state.detectionResult.columnMappings.length}
                              </div>
                              <div className="text-sm text-gray-600">Mapped Columns</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {state.detectionResult.recommendations.length}
                              </div>
                              <div className="text-sm text-gray-600">Recommendations</div>
                            </div>
                          </div>

                          {state.detectionResult.recommendations.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">Recommendations:</h4>
                              {state.detectionResult.recommendations.map((rec: string, index: number) => (
                                <Alert key={index} className="text-sm">
                                  <Info className="h-4 w-4" />
                                  <AlertDescription>{rec}</AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to generate mock data for demonstration
function generateMockData(count: number): Record<string, any>[] {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const channels = ['Online', 'Retail Store', 'Mobile App'];
  
  return Array.from({ length: count }, (_, i) => ({
    order_id: `ORD-${1000 + i}`,
    customer_id: `CUST-${Math.floor(Math.random() * 500) + 1}`,
    product: `Product ${Math.floor(Math.random() * 100) + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    price: Number((Math.random() * 500 + 10).toFixed(2)),
    quantity: Math.floor(Math.random() * 5) + 1,
    region: regions[Math.floor(Math.random() * regions.length)],
    channel: channels[Math.floor(Math.random() * channels.length)],
    date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    status: Math.random() > 0.1 ? 'completed' : 'refunded'
  }));
}