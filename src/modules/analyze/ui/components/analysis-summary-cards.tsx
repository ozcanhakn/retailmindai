// src/modules/analyze/ui/components/analysis-summary-cards.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Package, 
  MapPin, 
  Calendar,
  DollarSign,
  BarChart3,
  Activity,
  Sparkles
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
  const safeNumber = (val: any) => (typeof val === 'number' && !isNaN(val) ? val : 0);
  const safeString = (val: any) => (val && typeof val === 'string' && val !== 'Invalid Date' ? val : '-');
  const safeDate = (val: any) => {
    if (!val || val === '-' || val === 'Invalid Date') return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };
  const startDate = safeDate(summary.dateRange?.start);
  const endDate = safeDate(summary.dateRange?.end);
  const dayDiff = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : '-';

  const cards = [
    {
      title: 'Toplam Satış',
      value: AnalyzeService.formatCurrency(safeNumber(summary.totalSales)),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-500/20 via-emerald-400/10 to-teal-500/20',
      iconBg: 'bg-emerald-500/20',
      description: 'Genel satış performansı',
      trend: { direction: 'up', value: '+12.5%' },
      glowColor: 'emerald-500'
    },
    {
      title: 'Toplam Veri',
      value: AnalyzeService.formatNumber(safeNumber(summary.totalRows)),
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-500/20 via-blue-400/10 to-cyan-500/20',
      iconBg: 'bg-blue-500/20',
      description: `${safeNumber(summary.totalColumns)} kolon`,
      trend: { direction: 'stable', value: 'Stable' },
      glowColor: 'blue-500'
    },
    {
      title: 'Ürün Çeşidi',
      value: AnalyzeService.formatNumber(safeNumber(summary.uniqueProducts)),
      icon: Package,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-500/20 via-purple-400/10 to-pink-500/20',
      iconBg: 'bg-purple-500/20',
      description: 'Benzersiz ürün sayısı',
      trend: { direction: 'up', value: '+8.2%' },
      glowColor: 'purple-500'
    },
    {
      title: 'Müşteri Sayısı',
      value: AnalyzeService.formatNumber(safeNumber(summary.uniqueCustomers)),
      icon: Users,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-500/20 via-orange-400/10 to-red-500/20',
      iconBg: 'bg-orange-500/20',
      description: 'Aktif müşteri tabanı',
      trend: { direction: 'up', value: '+15.8%' },
      glowColor: 'orange-500'
    },
    {
      title: 'Bölge Sayısı',
      value: AnalyzeService.formatNumber(safeNumber(summary.uniqueRegions)),
      icon: MapPin,
      gradient: 'from-rose-500 to-pink-600',
      bgGradient: 'from-rose-500/20 via-rose-400/10 to-pink-500/20',
      iconBg: 'bg-rose-500/20',
      description: 'Hizmet verilen bölge',
      trend: { direction: 'stable', value: 'Stable' },
      glowColor: 'rose-500'
    },
    {
      title: 'Veri Aralığı',
      value: dayDiff !== '-' ? `${dayDiff} gün` : 'Bilinmiyor',
      icon: Calendar,
      gradient: 'from-indigo-500 to-purple-600',
      bgGradient: 'from-indigo-500/20 via-indigo-400/10 to-purple-500/20',
      iconBg: 'bg-indigo-500/20',
      description: `${safeString(startDate ? startDate.toLocaleDateString('tr-TR') : '')} - ${safeString(endDate ? endDate.toLocaleDateString('tr-TR') : '')}`,
      trend: { direction: 'stable', value: dayDiff !== '-' ? `${dayDiff}d` : 'N/A' },
      glowColor: 'indigo-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="relative overflow-hidden border-0 shadow-xl backdrop-blur-sm animate-pulse"
              style={{ backgroundColor: '#292E3B', borderColor: 'transparent' }}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600/10 via-gray-500/5 to-gray-600/10" />
              
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-600/30 rounded w-24"></div>
                  <div className="w-10 h-10 bg-gray-600/30 rounded-xl"></div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  <div className="h-8 bg-gray-600/30 rounded w-32"></div>
                  <div className="h-3 bg-gray-600/20 rounded w-40"></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            whileHover={{ 
              y: -5,
              transition: { duration: 0.2 }
            }}
          >
            <Card 
              className="group relative overflow-hidden border-0 shadow-2xl backdrop-blur-sm hover:shadow-3xl transition-all duration-500 cursor-pointer"
              style={{ backgroundColor: '#292E3B', borderColor: 'transparent' }}
            >
              {/* Animated Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Glow Effect */}
              <div className={`absolute -top-2 -right-2 w-20 h-20 bg-${card.glowColor}/20 rounded-full blur-xl group-hover:bg-${card.glowColor}/30 transition-all duration-500`} />
              
              {/* Floating Particles */}
              <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute top-4 right-8 w-1 h-1 bg-${card.glowColor} rounded-full animate-pulse opacity-60`} />
                <div className={`absolute bottom-8 left-6 w-1.5 h-1.5 bg-${card.glowColor}/60 rounded-full animate-bounce opacity-40`} style={{ animationDelay: '0.5s' }} />
                <div className={`absolute top-1/2 right-4 w-0.5 h-0.5 bg-${card.glowColor}/80 rounded-full animate-pulse opacity-50`} style={{ animationDelay: '1s' }} />
              </div>
              
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`relative p-3 rounded-xl ${card.iconBg} backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300`}
                    >
                      {/* Icon Glow */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300`} />
                      <Icon className="w-5 h-5 text-white relative z-10" />
                    </motion.div>
                    
                    <div>
                      <CardTitle className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors duration-300">
                        {card.title}
                      </CardTitle>
                      
                      {/* Trend Indicator */}
                      <div className="flex items-center space-x-1 mt-1">
                        {card.trend.direction === 'up' ? (
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        ) : card.trend.direction === 'down' ? (
                          <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
                        ) : (
                          <Activity className="w-3 h-3 text-yellow-400" />
                        )}
                        <span className={`text-xs font-medium ${
                          card.trend.direction === 'up' ? 'text-green-400' :
                          card.trend.direction === 'down' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {card.trend.value}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sparkle Icon */}
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="opacity-30 group-hover:opacity-60 transition-opacity duration-300"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  <motion.div
                    className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {card.value}
                  </motion.div>
                  
                  <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-300 leading-relaxed">
                    {card.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${card.gradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: card.trend.direction === 'up' ? '75%' : card.trend.direction === 'down' ? '45%' : '60%' }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {/* Border Gradient */}
              <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${card.gradient} p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <div className="w-full h-full rounded-lg" style={{ backgroundColor: '#292E3B' }} />
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};