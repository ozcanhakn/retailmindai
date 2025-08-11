import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { SalesAnalysis } from '../../types';
import { AnalyzeService } from '../../utils/analyze-service';

interface SalesAnalysisChartsProps {
  salesData: SalesAnalysis;
  isLoading?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const SalesAnalysisCharts: React.FC<SalesAnalysisChartsProps> = ({ 
  salesData, 
  isLoading = false 
}) => {
  const getTrendIcon = (trend: SalesAnalysis['salesTrend']) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendText = (trend: SalesAnalysis['salesTrend']) => {
    switch (trend) {
      case 'increasing':
        return 'Artan';
      case 'decreasing':
        return 'Azalan';
      default:
        return 'Stabil';
    }
  };

  const getTrendColor = (trend: SalesAnalysis['salesTrend']) => {
    switch (trend) {
      case 'increasing':
        return 'bg-green-100 text-green-800';
      case 'decreasing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-40"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Satış</p>
                <p className="text-2xl font-bold text-gray-900">
                  {AnalyzeService.formatCurrency(salesData.totalSales)}
                </p>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getTrendColor(salesData.salesTrend)}`}>
                {getTrendIcon(salesData.salesTrend)}
                <span>{getTrendText(salesData.salesTrend)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600">Ortalama Sipariş Değeri</p>
              <p className="text-2xl font-bold text-gray-900">
                {AnalyzeService.formatCurrency(salesData.averageOrderValue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600">Satış Trendi</p>
              <div className="flex items-center space-x-2 mt-1">
                {getTrendIcon(salesData.salesTrend)}
                <span className="text-lg font-semibold text-gray-900">
                  {getTrendText(salesData.salesTrend)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Satış Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData.salesByPeriod}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => AnalyzeService.formatCurrency(value).replace('₺', '₺ ')}
                />
                <Tooltip 
                  formatter={(value: number) => [AnalyzeService.formatCurrency(value), 'Satış']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('tr-TR')}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">En Çok Satan Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData.topProducts.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="productName" 
                  stroke="#666"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => AnalyzeService.formatCurrency(value).replace('₺', '₺ ')}
                />
                <Tooltip 
                  formatter={(value: number) => [AnalyzeService.formatCurrency(value), 'Gelir']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Region Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Bölgesel Satış Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesData.salesByRegion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ region, percentage }) => `${region} (${(percentage || 0).toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalSales"
                >
                  {salesData.salesByRegion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [AnalyzeService.formatCurrency(value), 'Satış']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Region Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Bölge Performansı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesData.salesByRegion.slice(0, 6).map((region, index) => (
                <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{region.region}</p>
                      <p className="text-sm text-gray-500">
                        {AnalyzeService.formatCurrency(region.totalSales)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={region.growth > 0 ? "default" : "secondary"}
                      className={region.growth > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {region.growth > 0 ? '+' : ''}{region.growth.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};