// src/modules/analyze/ui/componenents/product-analysis_charts.tsx
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductAnalysis } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Sector, LabelList } from 'recharts';
import { Button } from '@/components/ui/button';
import { AnalyzeService } from '../../utils/analyze-service';
import { exportElementToPng, exportElementToPdf } from '../../utils/export-utils';
import { motion } from 'framer-motion';
import { Package, TrendingUp, ShoppingCart } from 'lucide-react';

interface ProductAnalysisChartsProps {
  productData: ProductAnalysis;
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

// Enhanced custom active shape for product categories pie chart
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 15) * cos;
  const sy = cy + (outerRadius + 15) * sin;
  const mx = cx + (outerRadius + 40) * cos;
  const my = cy + (outerRadius + 40) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 30;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      {/* Main enhanced sector with multiple layers */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        filter="url(#glowEffect)"
      />
      {/* Outer glow ring */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 14}
        outerRadius={outerRadius + 20}
        fill={fill}
        opacity={0.4}
        filter="url(#softGlow)"
      />
      {/* Enhanced connection line with gradient */}
      <defs>
        <linearGradient id={`lineGradient-${payload.category}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={fill} stopOpacity={0.8} />
          <stop offset="100%" stopColor={fill} stopOpacity={0.3} />
        </linearGradient>
      </defs>
      <path 
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
        stroke={`url(#lineGradient-${payload.category})`}
        fill="none" 
        strokeWidth={3} 
        filter="url(#lineShadow)"
      />
      {/* Enhanced connection point with pulsing effect */}
      <circle 
        cx={ex} 
        cy={ey} 
        r={4} 
        fill={fill} 
        stroke="var(--bg-100)" 
        strokeWidth={3}
        filter="url(#dropShadow)"
      >
        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Modern label background with rounded corners */}
      <rect
        x={ex + (cos >= 0 ? 1 : -1) * 20 - (cos >= 0 ? 0 : Math.max(payload.category.length * 7, 90))}
        y={ey - 28}
        width={Math.max(payload.category.length * 7.5, 95)}
        height={45}
        fill="var(--bg-100)"
        rx={12}
        ry={12}
        opacity={0.98}
        filter="url(#cardShadow)"
        stroke="var(--bg-300)"
        strokeWidth={1}
      />
      {/* Category name with enhanced styling */}
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 25} 
        y={ey - 10} 
        textAnchor={textAnchor} 
        fill="var(--text-100)" 
        className="text-sm font-bold"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
      >
        {payload.category}
      </text>
      {/* Enhanced percentage and value display */}
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 25} 
        y={ey + 6} 
        textAnchor={textAnchor} 
        fill="var(--text-200)" 
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 25} 
        y={ey + 18} 
        textAnchor={textAnchor} 
        fill={fill} 
        className="text-xs font-medium"
      >
        {AnalyzeService.formatCurrency(value)}
      </text>
    </g>
  );
};

export const ProductAnalysisCharts: React.FC<ProductAnalysisChartsProps> = ({ productData, isLoading = false }) => {
  const topRef = useRef<HTMLDivElement | null>(null);
  const catRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.2 }}
          >
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-40"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Selling Products Enhanced Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Package className="w-5 h-5" style={{ color: 'var(--chart-primary)' }} />
              <span>En Çok Satan Ürünler</span>
            </CardTitle>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => topRef.current && exportElementToPng(topRef.current, 'en-cok-satan-urunler.png')}>PNG</Button>
              <Button variant="outline" size="sm" onClick={() => topRef.current && exportElementToPdf(topRef.current, 'en-cok-satan-urunler.pdf')}>PDF</Button>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div ref={topRef}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={productData.topSellingProducts?.slice(0, 8) || []} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <defs>
                    {(productData.topSellingProducts?.slice(0, 8) || []).map((_, index) => (
                      <linearGradient key={index} id={`productGradient${index}`} x1="0" y1="0" x2="0" y2="1">
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
                    angle={-35} 
                    textAnchor="end" 
                    height={90}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="var(--text-200)" 
                    fontSize={12} 
                    tickFormatter={(v) => AnalyzeService.formatCurrency(Number(v)).replace('₺', '₺ ')}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [AnalyzeService.formatCurrency(value), 'Satış']}
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
                    dataKey="totalSales" 
                    radius={[8, 8, 0, 0]}
                    strokeWidth={1}
                    stroke="var(--bg-300)"
                  >
                    {(productData.topSellingProducts?.slice(0, 8) || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#productGradient${index})`} />
                    ))}
                    <LabelList 
                      dataKey="totalSales" 
                      position="top" 
                      formatter={(value: number) => AnalyzeService.formatCurrency(value).replace('₺', '₺')} 
                      style={{ fill: 'var(--text-200)', fontSize: '10px' }} 
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Interactive Product Categories Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          {/* Premium background with animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/8 via-blue-500/5 to-purple-500/8 opacity-0 group-hover:opacity-100 transition-all duration-700" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-lg font-semibold flex items-center space-x-3">
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 shadow-lg">
                <ShoppingCart className="w-6 h-6" style={{ color: 'var(--chart-secondary)' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-blue-400/30 rounded-xl blur-sm"></div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ürün Kategorileri Dağılımı
                </span>
                <p className="text-xs text-gray-500 font-normal mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  İnteraktif kategori analizi
                </p>
              </div>
            </CardTitle>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-green-50 hover:border-green-200 hover:scale-105 transition-all duration-200"
                onClick={() => catRef.current && exportElementToPng(catRef.current, 'urun-kategorileri.png')}
              >
                <span className="text-green-600">PNG</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-blue-50 hover:border-blue-200 hover:scale-105 transition-all duration-200"
                onClick={() => catRef.current && exportElementToPdf(catRef.current, 'urun-kategorileri.pdf')}
              >
                <span className="text-blue-600">PDF</span>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div ref={catRef}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <defs>
                    {/* Enhanced gradients with multiple color stops */}
                    {(productData.productCategories || []).map((_, index) => (
                      <linearGradient key={index} id={`categoryGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={GRADIENT_COLORS[index]?.start || COLORS[index]} stopOpacity={0.95}/>
                        <stop offset="50%" stopColor={GRADIENT_COLORS[index]?.end || COLORS[index]} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={GRADIENT_COLORS[index]?.start || COLORS[index]} stopOpacity={0.8}/>
                      </linearGradient>
                    ))}
                    {/* Advanced filter effects */}
                    <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="2" result="softBlur"/>
                      <feMerge> 
                        <feMergeNode in="softBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.3"/>
                    </filter>
                    <filter id="lineShadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.25"/>
                    </filter>
                    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
                    </filter>
                  </defs>
                  <Pie
                    data={productData.productCategories || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={130}
                    innerRadius={55}
                    paddingAngle={4}
                    dataKey="totalSales"
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(-1)}
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {(productData.productCategories || []).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#categoryGradient${index})`}
                        stroke="var(--bg-100)"
                        strokeWidth={3}
                        style={{
                          filter: activeIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [
                      AnalyzeService.formatCurrency(value), 
                      'Kategori Satışı'
                    ]}
                    labelFormatter={(label) => `Kategori: ${label}`}
                    contentStyle={{ 
                      backgroundColor: '#1A1F2B',
                      border: '1px solid #354656', 
                      borderRadius: '16px',
                      color: '#B4C2DC',
                      boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                      padding: '16px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backdropFilter: 'blur(10px)'
                    }}
                    labelStyle={{ color: '#FFFFFF' }}
                    itemStyle={{ color: '#B4C2DC' }}
                    cursor={{ fill: 'transparent' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Enhanced statistics grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(productData.productCategories || []).slice(0, 6).map((category, index) => {
                const totalSales = (productData.productCategories || []).reduce((sum, c) => sum + c.totalSales, 0);
                const percentage = (category.totalSales / totalSales) * 100;
                const isActive = activeIndex === index;
                
                return (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5 + (index * 0.1) }}
                    className={`group cursor-pointer transition-all duration-300 transform ${
                      isActive ? 'scale-105' : 'hover:scale-102'
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(-1)}
                  >
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-white to-gray-50 shadow-lg border-2' 
                        : 'bg-gradient-to-r from-gray-50/80 to-transparent hover:from-gray-100/80 hover:shadow-md border'
                    }`}
                    style={{
                      borderColor: isActive ? (GRADIENT_COLORS[index]?.start || COLORS[index]) : 'var(--bg-300)'
                    }}>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div 
                            className={`w-5 h-5 rounded-full shadow-lg transition-all duration-300 ${
                              isActive ? 'scale-110' : 'group-hover:scale-105'
                            }`}
                            style={{ 
                              background: `linear-gradient(135deg, ${GRADIENT_COLORS[index]?.start || COLORS[index]}, ${GRADIENT_COLORS[index]?.end || COLORS[index]})` 
                            }}
                          />
                          {isActive && (
                            <div 
                              className="absolute inset-0 w-5 h-5 rounded-full animate-ping opacity-75"
                              style={{ backgroundColor: GRADIENT_COLORS[index]?.start || COLORS[index] }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm transition-colors duration-300 truncate ${
                            isActive ? 'text-gray-900' : 'text-gray-800 group-hover:text-gray-900'
                          }`}>
                            {category.category}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs font-bold ${
                              isActive ? 'text-gray-700' : 'text-gray-600'
                            }`}>
                              {percentage.toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 font-medium">
                              {AnalyzeService.formatCurrency(category.totalSales)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`w-16 h-2 bg-gray-200 rounded-full overflow-hidden transition-all duration-300 ${
                            isActive ? 'shadow-md' : ''
                          }`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, percentage)}%` }}
                              transition={{ delay: 1.7 + (index * 0.1), duration: 0.8 }}
                              className="h-full rounded-full transition-all duration-300"
                              style={{ 
                                background: `linear-gradient(90deg, ${GRADIENT_COLORS[index]?.start || COLORS[index]}, ${GRADIENT_COLORS[index]?.end || COLORS[index]})` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
