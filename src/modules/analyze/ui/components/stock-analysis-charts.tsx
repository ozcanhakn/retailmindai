import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockAnalysis } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface StockAnalysisChartsProps {
  stockData: StockAnalysis;
  isLoading?: boolean;
}

export const StockAnalysisCharts: React.FC<StockAnalysisChartsProps> = ({ stockData, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-gray-200 rounded w-40"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Low Stock Products Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Düşük Stoklu Ürünler</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockData.lowStockProducts?.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="productName" stroke="#666" fontSize={12} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip formatter={(value: number) => [value, 'Stok']} />
              <Bar dataKey="currentStock" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stock Turnover Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Stok Devir Hızı</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockData.stockTurnover?.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="productName" stroke="#666" fontSize={12} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip formatter={(value: number) => [value, 'Devir Hızı']} />
              <Bar dataKey="turnoverRate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Inventory Value */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Toplam Envanter Değeri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {stockData.inventoryValue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
