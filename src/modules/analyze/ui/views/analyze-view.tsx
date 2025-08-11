'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Package, 
  MapPin, 
  Boxes,
  MessageCircle,
  Filter,
  Download,
  Share,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { 
  Workspace, 
  AnalysisSummary, 
  SalesAnalysis, 
  ProductAnalysis, 
  CustomerAnalysis, 
  RegionAnalysis, 
  StockAnalysis 
} from '../../types';
import { AnalyzeService } from '../../utils/analyze-service';
import { AnalysisSummaryCards } from '../components/analysis-summary-cards';
import { SalesAnalysisCharts } from '../components/sales-analysis-charts';

interface AnalyzeViewProps {
  workspaceId: string;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({ workspaceId }) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analysis Data State
  const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary | null>(null);
  const [salesAnalysis, setSalesAnalysis] = useState<SalesAnalysis | null>(null);
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null);
  const [customerAnalysis, setCustomerAnalysis] = useState<CustomerAnalysis | null>(null);
  const [regionAnalysis, setRegionAnalysis] = useState<RegionAnalysis | null>(null);
  const [stockAnalysis, setStockAnalysis] = useState<StockAnalysis | null>(null);

  // Loading states for each tab
  const [loadingStates, setLoadingStates] = useState({
    overview: true,
    sales: false,
    products: false,
    customers: false,
    regions: false,
    stock: false
  });

  useEffect(() => {
    loadWorkspace();
    loadAnalysisSummary();
  }, [workspaceId]);

  const loadWorkspace = async () => {
    try {
      const response = await AnalyzeService.getWorkspace(workspaceId);
      if (response.success && response.workspace) {
        setWorkspace(response.workspace);
      } else {
        setError('Workspace yüklenemedi');
      }
    } catch (error) {
      console.error('Workspace load error:', error);
      setError('Workspace yükleme hatası');
    }
  };

  const loadAnalysisSummary = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, overview: true }));
      
      // Mock data for demonstration
      const mockSummary: AnalysisSummary = {
        totalRows: 15420,
        totalColumns: 12,
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        totalSales: 2450000,
        uniqueProducts: 347,
        uniqueCustomers: 1250,
        uniqueRegions: 7
      };

      setAnalysisSummary(mockSummary);
    } catch (error) {
      console.error('Analysis summary error:', error);
      setError('Analiz özeti yüklenemedi');
    } finally {
      setLoadingStates(prev => ({ ...prev, overview: false }));
      setIsLoading(false);
    }
  };

  const loadSalesAnalysis = async () => {
    if (salesAnalysis) return; // Already loaded

    try {
      setLoadingStates(prev => ({ ...prev, sales: true }));
      
      // Mock data for demonstration
      const mockSalesData: SalesAnalysis = {
        totalSales: 2450000,
        averageOrderValue: 1960,
        salesTrend: 'increasing',
        salesByPeriod: [
          { date: '2024-01-01', value: 180000, period: 'month' },
          { date: '2024-02-01', value: 195000, period: 'month' },
          { date: '2024-03-01', value: 210000, period: 'month' },
          { date: '2024-04-01', value: 225000, period: 'month' },
          { date: '2024-05-01', value: 240000, period: 'month' },
          { date: '2024-06-01', value: 255000, period: 'month' }
        ],
        topProducts: [
          { productId: '1', productName: 'iPhone 15', category: 'Electronics', totalSales: 150, quantity: 150, revenue: 450000 },
          { productId: '2', productName: 'Samsung TV', category: 'Electronics', totalSales: 80, quantity: 80, revenue: 320000 },
          { productId: '3', productName: 'Nike Ayakkabı', category: 'Fashion', totalSales: 200, quantity: 200, revenue: 280000 },
          { productId: '4', productName: 'Adidas Tişört', category: 'Fashion', totalSales: 300, quantity: 300, revenue: 210000 },
          { productId: '5', productName: 'MacBook Pro', category: 'Electronics', totalSales: 50, quantity: 50, revenue: 400000 }
        ],
        salesByRegion: [
          { region: 'İstanbul', totalSales: 850000, revenue: 850000, growth: 15.2 },
          { region: 'Ankara', totalSales: 420000, revenue: 420000, growth: 8.7 },
          { region: 'İzmir', totalSales: 380000, revenue: 380000, growth: 12.1 },
          { region: 'Antalya', totalSales: 290000, revenue: 290000, growth: 5.3 },
          { region: 'Bursa', totalSales: 250000, revenue: 250000, growth: 9.8 },
          { region: 'Adana', totalSales: 180000, revenue: 180000, growth: -2.1 },
          { region: 'Gaziantep', totalSales: 80000, revenue: 80000, growth: 3.4 }
        ]
      };

      setSalesAnalysis(mockSalesData);
    } catch (error) {
      console.error('Sales analysis error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, sales: false }));
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Load data based on active tab
    switch (value) {
      case 'sales':
        loadSalesAnalysis();
        break;
      case 'products':
        // loadProductAnalysis();
        break;
      case 'customers':
        // loadCustomerAnalysis();
        break;
      case 'regions':
        // loadRegionAnalysis();
        break;
      case 'stock':
        // loadStockAnalysis();
        break;
    }
  };

  const refreshData = () => {
    switch (activeTab) {
      case 'overview':
        loadAnalysisSummary();
        break;
      case 'sales':
        setSalesAnalysis(null);
        loadSalesAnalysis();
        break;
      // Add other cases as needed
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <BarChart3 className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Analiz Yüklenemedi
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Yeniden Dene
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analiz Dashboard
            </h1>
            {workspace && (
              <div className="flex items-center space-x-4">
                <p className="text-gray-600">
                  {workspace.name} • {workspace.files.length} dosya
                </p>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {workspace.status === 'completed' ? 'Tamamlandı' : 'İşleniyor'}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              İndir
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Paylaş
            </Button>
          </div>
        </div>

        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Genel</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Satışlar</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Ürünler</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Müşteriler</span>
            </TabsTrigger>
            <TabsTrigger value="regions" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Bölgeler</span>
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center space-x-2">
              <Boxes className="w-4 h-4" />
              <span>Stok</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {analysisSummary ? (
              <AnalysisSummaryCards 
                summary={analysisSummary} 
                isLoading={loadingStates.overview} 
              />
            ) : (
              <div>Analiz özeti yükleniyor...</div>
            )}
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            {salesAnalysis ? (
              <SalesAnalysisCharts 
                salesData={salesAnalysis} 
                isLoading={loadingStates.sales} 
              />
            ) : (
              <div>Satış analizi yükleniyor...</div>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ürün Analizi
                </h3>
                <p className="text-gray-600">
                  Ürün performansı ve kategori analizleri yakında eklenecek.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Müşteri Analizi
                </h3>
                <p className="text-gray-600">
                  Müşteri segmentasyonu ve davranış analizleri yakında eklenecek.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regions Tab */}
          <TabsContent value="regions" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Bölge Analizi
                </h3>
                <p className="text-gray-600">
                  Bölgesel performans ve coğrafi analizler yakında eklenecek.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Tab */}
          <TabsContent value="stock" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Boxes className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Stok Analizi
                </h3>
                <p className="text-gray-600">
                  Stok durumu ve envanter analizleri yakında eklenecek.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Chatbot Section */}
        <Card className="border-2 border-dashed border-blue-200">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Chatbot Desteği
            </h3>
            <p className="text-gray-600 mb-4">
              Verileriniz hakkında soru sorun ve AI destekli öneriler alın.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chatbot'u Başlat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};