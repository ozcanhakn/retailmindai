"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  Target, 
  Truck,
  Calendar,
  DollarSign,
  ShoppingCart,
  Star,
  Activity,
  PieChart
} from "lucide-react";

interface AnalysisData {
  basic_stats: any;
  sales_analysis: any;
  product_analysis: any;
  customer_analysis: any;
  advanced_sales: any;
  advanced_customer: any;
  advanced_product: any;
  marketing_analysis: any;
  operational_analysis: any;
  data_preview: any[];
  charts: {
    sales?: {
      monthly_trend?: string;
      daily_distribution?: string;
    };
    customer?: {
      top_customers?: string;
      customer_segments?: string;
    };
    product?: {
      top_products?: string;
      category_distribution?: string;
    };
    marketing?: {
      campaign_performance?: string;
      channel_performance?: string;
    };
    operational?: {
      order_status?: string;
      delivery_time?: string;
    };
  };
}

export default function AnalysisPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyze/workspace/latest');
      const data = await response.json();
      
      if (data.success && data.workspace?.files?.[0]?.processedData) {
        setAnalysisData(data.workspace.files[0].processedData);
      } else {
        setError('Analiz verisi bulunamadı');
      }
    } catch (err) {
      setError('Analiz verisi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('tr-TR').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Analiz verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Analiz verisi bulunamadı'}</p>
          <Button onClick={fetchAnalysisData}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gelişmiş Analiz Dashboard</h1>
          <p className="text-gray-600 mt-2">Detaylı satış, müşteri ve ürün analizleri</p>
        </div>
        <Button onClick={fetchAnalysisData} variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analysisData.sales_analysis?.sales_stats?.total_sales || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analysisData.basic_stats?.total_rows || 0)} satır veri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteri Sayısı</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analysisData.advanced_customer?.customer_segments?.total_customers || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              %{analysisData.advanced_customer?.customer_segments?.retention_rate?.toFixed(1) || 0} retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Sepet</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analysisData.sales_analysis?.sales_stats?.average_sales || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sipariş başına ortalama
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Müşteriler</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analysisData.advanced_customer?.customer_tiers?.vip_customers || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Toplam müşterilerin %{((analysisData.advanced_customer?.customer_tiers?.vip_customers || 0) / (analysisData.advanced_customer?.customer_segments?.total_customers || 1) * 100).toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ana Analiz Sekmeleri */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="sales" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Satış</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Müşteri</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Ürün</span>
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Pazarlama</span>
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Operasyon</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Veri</span>
          </TabsTrigger>
        </TabsList>

        {/* Satış Analizi */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aylık Satış Trendi */}
            {analysisData.charts?.sales?.monthly_trend && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Aylık Satış Trendi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={`data:image/png;base64,${analysisData.charts.sales.monthly_trend}`}
                    alt="Aylık Satış Trendi"
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Günlük Satış Dağılımı */}
            {analysisData.charts?.sales?.daily_distribution && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Günlük Satış Dağılımı</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={`data:image/png;base64,${analysisData.charts.sales.daily_distribution}`}
                    alt="Günlük Satış Dağılımı"
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Satış İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Toplam Satış</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analysisData.sales_analysis?.sales_stats?.total_sales || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ortalama Satış</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(analysisData.sales_analysis?.sales_stats?.average_sales || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Maksimum Satış</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analysisData.sales_analysis?.sales_stats?.max_sales || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Müşteri Analizi */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* En İyi Müşteriler */}
            {analysisData.charts?.customer?.top_customers && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>En İyi 10 Müşteri</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={`data:image/png;base64,${analysisData.charts.customer.top_customers}`}
                    alt="En İyi Müşteriler"
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Müşteri Segmentleri */}
            {analysisData.charts?.customer?.customer_segments && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Müşteri Segmentleri</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={`data:image/png;base64,${analysisData.charts.customer.customer_segments}`}
                    alt="Müşteri Segmentleri"
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Müşteri İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Toplam Müşteri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(analysisData.advanced_customer?.customer_segments?.total_customers || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Yeni Müşteriler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(analysisData.advanced_customer?.customer_segments?.new_customers || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">VIP Müşteriler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatNumber(analysisData.advanced_customer?.customer_tiers?.vip_customers || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  %{analysisData.advanced_customer?.customer_segments?.retention_rate?.toFixed(1) || 0}
                </div>
              </CardContent>
            </Card>
          </div>
                  <div className="flex justify-between items-center">
                    <span>VIP Müşteriler:</span>
                    <Badge variant="default">{formatNumber(analysisData.advanced_customer?.customer_tiers?.vip_customers || 0)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Retention Rate:</span>
                    <span className="font-medium">%{analysisData.advanced_customer?.customer_segments?.retention_rate?.toFixed(1) || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Müşteri Yaşam Boyu Değeri</CardTitle>
                <CardDescription>CLV analizi ve dağılımı</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisData.advanced_customer?.clv_analysis ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Ortalama CLV:</span>
                      <span className="font-medium">{formatCurrency(analysisData.advanced_customer.clv_analysis.avg_clv || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Düşük CLV:</span>
                      <span className="font-medium">{formatCurrency(analysisData.advanced_customer.clv_analysis.clv_distribution?.low || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yüksek CLV:</span>
                      <span className="font-medium">{formatCurrency(analysisData.advanced_customer.clv_analysis.clv_distribution?.high || 0)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">CLV verisi bulunamadı</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ürün Analizi */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* En Çok Satan Ürünler */}
            {analysisData.charts?.product?.top_products && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>En Çok Satan 15 Ürün</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={`data:image/png;base64,${analysisData.charts.product.top_products}`}
                    alt="En Çok Satan Ürünler"
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Kategori Dağılımı */}
            {analysisData.charts?.product?.category_distribution && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Kategori Bazlı Satış Dağılımı</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={`data:image/png;base64,${analysisData.charts.product.category_distribution}`}
                    alt="Kategori Dağılımı"
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Ürün İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Toplam Ürün Çeşidi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(analysisData.advanced_product?.best_sellers?.products?.length || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ortalama Karlılık</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  %{analysisData.advanced_product?.profitability?.avg_profit_margin?.toFixed(1) || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Yeni Ürünler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(analysisData.advanced_product?.product_lifecycle?.new_products || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
                  <p className="text-gray-500">Ürün verisi bulunamadı</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kategori Dağılımı</CardTitle>
                <CardDescription>Kategori bazlı satış oranları</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisData.advanced_product?.category_distribution ? (
                  <div className="space-y-2">
                    {analysisData.advanced_product.category_distribution.categories?.slice(0, 5).map((category: string, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm truncate">{category}</span>
                        <span className="font-medium">%{analysisData.advanced_product.category_distribution.percentages[index]?.toFixed(1) || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Kategori verisi bulunamadı</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pazarlama Analizi */}
        <TabsContent value="marketing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kampanya Performansı */}
            {analysisData.charts?.marketing?.campaign_performance && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Kampanya Performansı</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={`data:image/png;base64,${analysisData.charts.marketing.campaign_performance}`}
                    alt="Kampanya Performansı"
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Kanal Performansı */}
            {analysisData.charts?.marketing?.channel_performance && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Kanal Performansı</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={`data:image/png;base64,${analysisData.charts.marketing.channel_performance}`}
                    alt="Kanal Performansı"
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Pazarlama İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Toplam Kampanya</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(analysisData.marketing_analysis?.campaign_performance?.campaigns?.length || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">En İyi Kanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analysisData.marketing_analysis?.channel_performance?.channels?.[0] || 'N/A'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Kanal Sayısı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(analysisData.marketing_analysis?.channel_performance?.channels?.length || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
                        <span className="font-medium">{formatCurrency(analysisData.marketing_analysis.campaign_performance.total_sales[index] || 0)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Kampanya verisi bulunamadı</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kanal Performansı</CardTitle>
                <CardDescription>Satış kanalları analizi</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisData.marketing_analysis?.channel_performance ? (
                  <div className="space-y-2">
                    {analysisData.marketing_analysis.channel_performance.channels?.slice(0, 5).map((channel: string, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm truncate">{channel}</span>
                        <span className="font-medium">%{analysisData.marketing_analysis.channel_performance.percentages[index]?.toFixed(1) || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Kanal verisi bulunamadı</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operasyon Analizi */}
        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sipariş Durumu */}
            {analysisData.charts?.operational?.order_status && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Sipariş Durumu Dağılımı</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={`data:image/png;base64,${analysisData.charts.operational.order_status}`}
                    alt="Sipariş Durumu"
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Teslimat Süresi */}
            {analysisData.charts?.operational?.delivery_time && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Teslimat Süresi Dağılımı</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={`data:image/png;base64,${analysisData.charts.operational.delivery_time}`}
                    alt="Teslimat Süresi"
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Operasyon İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ortalama Teslimat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analysisData.operational_analysis?.delivery_analysis?.avg_delivery_time?.toFixed(1) || 0} gün
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">En Hızlı Teslimat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analysisData.operational_analysis?.delivery_analysis?.min_delivery_time || 0} gün
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Durum Çeşidi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(analysisData.operational_analysis?.order_status?.statuses?.length || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
              </CardHeader>
              <CardContent>
                {analysisData.operational_analysis?.order_status ? (
                  <div className="space-y-2">
                    {analysisData.operational_analysis.order_status.statuses?.slice(0, 5).map((status: string, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm truncate">{status}</span>
                        <span className="font-medium">{formatNumber(analysisData.operational_analysis.order_status.counts[index] || 0)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Sipariş durumu verisi bulunamadı</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Veri Önizleme */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Veri Önizleme</CardTitle>
              <CardDescription>İlk 10 satır veri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {analysisData.data_preview?.[0] && Object.keys(analysisData.data_preview[0]).map((key) => (
                        <th key={key} className="text-left p-2 font-medium">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.data_preview?.slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-b">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="p-2 text-xs">
                            {String(value).length > 50 ? String(value).substring(0, 50) + '...' : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
