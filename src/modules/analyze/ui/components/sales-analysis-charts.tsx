// src/modules/analyze/ui/componenents/sales-analysis-charts.tsx
import React, { useRef } from 'react';
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
  Cell,
  AreaChart,
  Area,
  Sector,
  LabelList
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SalesAnalysis } from '../../types';
import { AnalyzeService } from '../../utils/analyze-service';
import { exportElementToPng, exportElementToPdf } from '../../utils/export-utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SalesAnalysisChartsProps {
  salesData: SalesAnalysis;
  isLoading?: boolean;
}

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#a8edea', '#ff9a9e', '#a18cd1'];

const GRADIENT_COLORS = [
  { start: '#667eea', end: '#764ba2', stroke: '#667eea' }, // Modern purple-blue
  { start: '#f093fb', end: '#f5576c', stroke: '#f093fb' }, // Pink-coral gradient
  { start: '#4facfe', end: '#00f2fe', stroke: '#4facfe' }, // Blue-cyan gradient
  { start: '#43e97b', end: '#38f9d7', stroke: '#43e97b' }, // Green-mint gradient
  { start: '#fa709a', end: '#fee140', stroke: '#fa709a' }, // Pink-yellow gradient
  { start: '#a8edea', end: '#fed6e3', stroke: '#a8edea' }, // Mint-pink gradient
  { start: '#ff9a9e', end: '#fecfef', stroke: '#ff9a9e' }, // Coral-pink gradient
  { start: '#a18cd1', end: '#fbc2eb', stroke: '#a18cd1' }  // Purple-pink gradient
];

// Enhanced custom active shape for pie chart with modern design
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 12) * cos;
  const sy = cy + (outerRadius + 12) * sin;
  const mx = cx + (outerRadius + 35) * cos;
  const my = cy + (outerRadius + 35) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 25;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      {/* Main enhanced sector with glow effect */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        filter="url(#glow)"
      />
      {/* Outer ring with gradient */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 16}
        fill={fill}
        opacity={0.6}
        filter="url(#softGlow)"
      />
      {/* Connection line with enhanced styling */}
      <path 
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
        stroke={fill} 
        fill="none" 
        strokeWidth={2.5} 
        opacity={0.8}
        filter="url(#lineShadow)"
      />
      {/* Enhanced connection point */}
      <circle 
        cx={ex} 
        cy={ey} 
        r={3} 
        fill={fill} 
        stroke="var(--bg-100)" 
        strokeWidth={2}
        filter="url(#dropShadow)"
      />
      {/* Modern text styling with background */}
      <rect
        x={ex + (cos >= 0 ? 1 : -1) * 15 - (cos >= 0 ? 0 : payload.region.length * 6)}
        y={ey - 25}
        width={Math.max(payload.region.length * 6.5, 80)}
        height={40}
        fill="var(--bg-100)"
        rx={8}
        ry={8}
        opacity={0.95}
        filter="url(#dropShadow)"
      />
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 18} 
        y={ey - 8} 
        textAnchor={textAnchor} 
        fill="var(--text-100)" 
        className="text-sm font-semibold"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
      >
        {payload.region}
      </text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 18} 
        y={ey + 8} 
        textAnchor={textAnchor} 
        fill="var(--text-200)" 
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(1)}% • ${AnalyzeService.formatCurrency(value)}`}
      </text>
    </g>
  );
};

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

  const trendRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-600/5" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-red-500" />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-200)' }}>Toplam Satış</p>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-100)' }}>
                    {AnalyzeService.formatCurrency(salesData.totalSales)}
                  </p>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-2 rounded-full text-xs ${getTrendColor(salesData.salesTrend)} shadow-sm`}>
                  {getTrendIcon(salesData.salesTrend)}
                  <span className="font-medium">{getTrendText(salesData.salesTrend)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-600/5" />
            <CardContent className="p-6 relative">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-medium" style={{ color: 'var(--text-200)' }}>Ortalama Sipariş Değeri</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-100)' }}>
                {AnalyzeService.formatCurrency(salesData.averageOrderValue)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-600/5" />
            <CardContent className="p-6 relative">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <p className="text-sm font-medium" style={{ color: 'var(--text-200)' }}>En Çok Satan Ürün</p>
              </div>
              <p className="text-2xl font-bold truncate" style={{ color: 'var(--text-100)' }}>
                {salesData.topProducts?.[0]?.productName || '-'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-600/5" />
            <CardContent className="p-6 relative">
              <div className="flex items-center space-x-2 mb-2">
                <PieChartIcon className="w-4 h-4 text-purple-500" />
                <p className="text-sm font-medium" style={{ color: 'var(--text-200)' }}>Bölgeler</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-100)' }}>
                {salesData.salesByRegion?.length || 0}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Area Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <Activity className="w-5 h-5" style={{ color: 'var(--chart-primary)' }} />
                <span>Satış Trendi</span>
              </CardTitle>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => trendRef.current && exportElementToPng(trendRef.current, 'satis-trendi.png')}>PNG</Button>
                <Button variant="outline" size="sm" onClick={() => trendRef.current && exportElementToPdf(trendRef.current, 'satis-trendi.pdf')}>PDF</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={trendRef}>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={salesData.salesByPeriod}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-300)" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--text-200)"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="var(--text-200)"
                      fontSize={12}
                      tickFormatter={(value) => AnalyzeService.formatCurrency(value).replace('₺', '₺ ')}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value: number) => [AnalyzeService.formatCurrency(value), 'Satış']}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('tr-TR')}
                      contentStyle={{ 
                        backgroundColor: '#1A1F2B', 
                        border: '1px solid #354656', 
                        borderRadius: '12px',
                        color: '#B4C2DC',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: '#FFFFFF' }}
                      itemStyle={{ color: '#B4C2DC' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--chart-primary)"
                      strokeWidth={3}
                      fill="url(#salesGradient)"
                      dot={{ fill: 'var(--chart-primary)', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 8, stroke: 'var(--chart-primary)', strokeWidth: 3, fill: 'var(--bg-100)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products Enhanced Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" style={{ color: 'var(--chart-secondary)' }} />
                <span>En Çok Satan Ürünler</span>
              </CardTitle>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => topRef.current && exportElementToPng(topRef.current, 'en-cok-satan-urunler.png')}>PNG</Button>
                <Button variant="outline" size="sm" onClick={() => topRef.current && exportElementToPdf(topRef.current, 'en-cok-satan-urunler.pdf')}>PDF</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={topRef}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={salesData.topProducts.slice(0, 5)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <defs>
                      {salesData.topProducts.slice(0, 5).map((_, index) => (
                        <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={GRADIENT_COLORS[index]?.start || COLORS[index]} stopOpacity={0.9}/>
                          <stop offset="95%" stopColor={GRADIENT_COLORS[index]?.end || COLORS[index]} stopOpacity={0.7}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-300)" opacity={0.3} />
                    <XAxis 
                      dataKey="productName" 
                      stroke="var(--text-200)"
                      fontSize={11}
                      angle={-25}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="var(--text-200)"
                      fontSize={12}
                      tickFormatter={(value) => AnalyzeService.formatCurrency(value).replace('₺', '₺ ')}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value: number) => [AnalyzeService.formatCurrency(value), 'Gelir']}
                      contentStyle={{ 
                        backgroundColor: '#1A1F2B', 
                        border: '1px solid #354656', 
                        borderRadius: '12px',
                        color: '#B4C2DC',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: '#FFFFFF' }}
                      itemStyle={{ color: '#B4C2DC' }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      radius={[8, 8, 0, 0]}
                      strokeWidth={1}
                      stroke="var(--bg-300)"
                    >
                      {salesData.topProducts.slice(0, 5).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#barGradient${index})`} />
                      ))}
                      <LabelList dataKey="revenue" position="top" formatter={(value: number) => AnalyzeService.formatCurrency(value).replace('₺', '₺')} style={{ fill: 'var(--text-200)', fontSize: '10px' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Interactive Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="h-full relative overflow-hidden group">
            {/* Enhanced card background with subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <div className="p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <PieChartIcon className="w-5 h-5" style={{ color: 'var(--chart-tertiary)' }} />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Bölgesel Satış Dağılımı
                  </span>
                  <p className="text-xs text-gray-500 font-normal mt-1">
                    İnteraktif görünüm için segmentlerin üzerine gelin
                  </p>
                </div>
              </CardTitle>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hover:bg-purple-50 hover:border-purple-200 transition-colors"
                  onClick={() => regionRef.current && exportElementToPng(regionRef.current, 'bolgesel-satis-dagilimi.png')}
                >
                  PNG
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  onClick={() => regionRef.current && exportElementToPdf(regionRef.current, 'bolgesel-satis-dagilimi.pdf')}
                >
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div ref={regionRef}>
                <ResponsiveContainer width="100%" height={380}>
                  <PieChart>
                    <defs>
                      {/* Enhanced gradients with multiple stops */}
                      {salesData.salesByRegion.map((_, index) => (
                        <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={GRADIENT_COLORS[index]?.start || COLORS[index]} stopOpacity={0.95}/>
                          <stop offset="50%" stopColor={GRADIENT_COLORS[index]?.end || COLORS[index]} stopOpacity={0.85}/>
                          <stop offset="100%" stopColor={GRADIENT_COLORS[index]?.start || COLORS[index]} stopOpacity={0.75}/>
                        </linearGradient>
                      ))}
                      {/* Glow effects */}
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="softColoredBlur"/>
                        <feMerge> 
                          <feMergeNode in="softColoredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                      </filter>
                      <filter id="lineShadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2"/>
                      </filter>
                    </defs>
                    <Pie
                      data={salesData.salesByRegion}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={110}
                      innerRadius={45}
                      paddingAngle={3}
                      dataKey="totalSales"
                      activeShape={renderActiveShape}
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {salesData.salesByRegion.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#pieGradient${index})`}
                          stroke="var(--bg-100)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [
                        AnalyzeService.formatCurrency(value), 
                        'Satış Miktarı'
                      ]}
                      labelFormatter={(label) => `Bölge: ${label}`}
                      contentStyle={{ 
                        backgroundColor: '#1A1F2B',
                        border: '1px solid #354656', 
                        borderRadius: '16px',
                        color: '#B4C2DC',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      labelStyle={{ color: '#FFFFFF' }}
                      itemStyle={{ color: '#B4C2DC' }}
                      cursor={{ fill: 'transparent' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Enhanced legend with statistics */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {salesData.salesByRegion.slice(0, 4).map((region, index) => {
                  const totalSales = salesData.salesByRegion.reduce((sum, r) => sum + r.totalSales, 0);
                  const percentage = (region.totalSales / totalSales) * 100;
                  return (
                    <motion.div
                      key={region.region}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + (index * 0.1) }}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-gray-50/50 to-transparent hover:from-gray-100/50 transition-all duration-300"
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-lg"
                        style={{ 
                          background: `linear-gradient(135deg, ${GRADIENT_COLORS[index]?.start || COLORS[index]}, ${GRADIENT_COLORS[index]?.end || COLORS[index]})` 
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{region.region}</p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}% • {AnalyzeService.formatCurrency(region.totalSales)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Region Performance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--chart-primary)' }} />
                <span>Bölge Performansı</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.salesByRegion.slice(0, 6).map((region, index) => (
                  <motion.div
                    key={region.region}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + (index * 0.1) }}
                    className="group"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:shadow-md" 
                         style={{ backgroundColor: 'var(--bg-200)' }}>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div 
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{ backgroundColor: GRADIENT_COLORS[index]?.start || COLORS[index % COLORS.length] }}
                          />
                          <div 
                            className="absolute inset-0 w-4 h-4 rounded-full animate-pulse opacity-50"
                            style={{ backgroundColor: GRADIENT_COLORS[index]?.start || COLORS[index % COLORS.length] }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-100)' }}>{region.region}</p>
                          <p className="text-sm" style={{ color: 'var(--text-200)' }}>
                            {AnalyzeService.formatCurrency(region.totalSales)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-200)' }}>Büyüme</p>
                          <Badge 
                            variant={region.growth > 0 ? "default" : "secondary"}
                            className={`${region.growth > 0 ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"} transition-all duration-300 group-hover:scale-105`}
                          >
                            {region.growth > 0 ? '+' : ''}{region.growth.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (region.percentage || 0))}%` }}
                            transition={{ delay: 1 + (index * 0.1), duration: 1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: GRADIENT_COLORS[index]?.start || COLORS[index % COLORS.length] }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};