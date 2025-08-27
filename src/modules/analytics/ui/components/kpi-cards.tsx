"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Target,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPIDefinition, CalculatedKPI, formatKPIValue } from '../../types/kpi-definitions';

interface KPICardProps {
  definition: KPIDefinition;
  value: number;
  trend?: { direction: 'up' | 'down' | 'stable'; percentage: number };
  previousValue?: number;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ 
  definition, 
  value, 
  trend, 
  previousValue, 
  className 
}) => {
  const formattedValue = formatKPIValue({ definition, value, trend, previousValue });
  
  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-4 w-4 text-gray-400" />;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    return trend.direction === 'up' ? 'text-green-600' : 
           trend.direction === 'down' ? 'text-red-600' : 'text-gray-500';
  };

  const getCardSize = () => {
    switch (definition.visualization.size) {
      case 'large':
        return 'md:col-span-2 lg:col-span-3';
      case 'medium':
        return 'md:col-span-2';
      case 'small':
      default:
        return 'col-span-1';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(getCardSize(), className)}
    >
      <Card className="hover:shadow-md transition-shadow" style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{ color: '#B4C2DC' }}>
            {definition.title}
          </CardTitle>
          <Badge variant="outline" className="text-xs" style={{ color: '#B4C2DC', borderColor: '#3a4050' }}>
            {definition.category}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                {formattedValue}
              </div>
              <p className="text-xs mt-1" style={{ color: '#B4C2DC' }}>
                {definition.description}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              {trend && (
                <span className={cn("text-sm font-medium", getTrendColor())}>
                  {Math.abs(trend.percentage).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface KPIGridProps {
  kpis: Array<{ definition: KPIDefinition; value: number }>;
  className?: string;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ kpis, className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {kpis.map((kpi, index) => (
        <KPICard
          key={kpi.definition.id}
          definition={kpi.definition}
          value={kpi.value}
        />
      ))}
    </div>
  );
};

interface KPISummaryCardProps {
  title: string;
  kpis: CalculatedKPI[];
  className?: string;
}

export const KPISummaryCard: React.FC<KPISummaryCardProps> = ({ 
  title, 
  kpis, 
  className 
}) => {
  const totalKPIs = kpis.length;
  const positiveKPIs = kpis.filter(kpi => 
    kpi.trend?.direction === 'up' || kpi.value > 0
  ).length;
  const negativeKPIs = kpis.filter(kpi => 
    kpi.trend?.direction === 'down'
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2" style={{ color: '#FFFFFF' }}>
            <BarChart3 className="h-5 w-5" style={{ color: '#B4C2DC' }} />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{totalKPIs}</div>
              <div className="text-sm" style={{ color: '#B4C2DC' }}>Total KPIs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{positiveKPIs}</div>
              <div className="text-sm text-green-400">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{negativeKPIs}</div>
              <div className="text-sm text-red-400">Negative</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface QuickStatsProps {
  totalKPIs: number;
  availableKPIs: number;
  lastUpdated?: Date | null;
  className?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ 
  totalKPIs, 
  availableKPIs, 
  lastUpdated, 
  className 
}) => {
  const coverage = totalKPIs > 0 ? (availableKPIs / totalKPIs) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2" style={{ color: '#FFFFFF' }}>
            <Target className="h-5 w-5" style={{ color: '#B4C2DC' }} />
            <span>Quick Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#B4C2DC' }}>Available KPIs</span>
              <span className="font-bold" style={{ color: '#FFFFFF' }}>
                {availableKPIs} / {totalKPIs}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#B4C2DC' }}>Coverage</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold" style={{ color: '#FFFFFF' }}>
                  {coverage.toFixed(0)}%
                </span>
                {coverage >= 80 ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                )}
              </div>
            </div>

            {lastUpdated && (
              <div className="flex justify-between items-center pt-2" style={{ borderTopColor: '#3a4050', borderTopWidth: '1px' }}>
                <span className="text-xs flex items-center" style={{ color: '#B4C2DC' }}>
                  <Calendar className="h-3 w-3 mr-1" />
                  Last Updated
                </span>
                <span className="text-xs" style={{ color: '#B4C2DC' }}>
                  {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};