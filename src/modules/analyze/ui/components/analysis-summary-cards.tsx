import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  MapPin, 
  Calendar,
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { AnalysisSummary } from '../../types';
import { AnalyzeService } from '../../utils/analyze-service';

interface AnalysisSummaryCardsProps {
  summary: AnalysisSummary;
  isLoading?: boolean;
}

export const AnalysisSummaryCards: React.FC<AnalysisSummaryCardsProps> = ({ 
  summary, 
  isLoading = false 
}) => {
  const cards = [
    {
      title: 'Toplam Satış',
      value: AnalyzeService.formatCurrency(summary.totalSales),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Genel satış performansı'
    },
    {
      title: 'Toplam Veri',
      value: AnalyzeService.formatNumber(summary.totalRows),
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `${summary.totalColumns} kolon`
    },
    {
      title: 'Ürün Çeşidi',
      value: AnalyzeService.formatNumber(summary.uniqueProducts),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Benzersiz ürün sayısı'
    },
    {
      title: 'Müşteri Sayısı',
      value: AnalyzeService.formatNumber(summary.uniqueCustomers),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Aktif müşteri tabanı'
    },
    {
      title: 'Bölge Sayısı',
      value: AnalyzeService.formatNumber(summary.uniqueRegions),
      icon: MapPin,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Hizmet verilen bölge'
    },
    {
      title: 'Veri Aralığı',
      value: `${Math.ceil((new Date(summary.dateRange.end).getTime() - new Date(summary.dateRange.start).getTime()) / (1000 * 60 * 60 * 24))} gün`,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: `${formatDate(summary.dateRange.start)} - ${formatDate(summary.dateRange.end)}`
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-40"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`w-8 h-8 ${card.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  {card.value}
                </div>
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Helper function to format dates
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}