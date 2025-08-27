// src/modules/analyze/ui/componenents/customer-analysis-charts.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomerAnalysis } from '../../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Sector } from 'recharts';
import { motion } from 'framer-motion';
import { Users, UserCheck, TrendingUp } from 'lucide-react';

interface CustomerAnalysisChartsProps {
  customerData: CustomerAnalysis;
  isLoading?: boolean;
}

const GRADIENT_COLORS = [
  { start: '#667eea', end: '#764ba2', stroke: '#667eea' }, // Modern purple-blue
  { start: '#f093fb', end: '#f5576c', stroke: '#f093fb' }, // Pink-coral gradient
  { start: '#4facfe', end: '#00f2fe', stroke: '#4facfe' }, // Blue-cyan gradient
  { start: '#43e97b', end: '#38f9d7', stroke: '#43e97b' }, // Green-mint gradient
  { start: '#fa709a', end: '#fee140', stroke: '#fa709a' }, // Pink-yellow gradient
  { start: '#a8edea', end: '#fed6e3', stroke: '#a8edea' }  // Mint-pink gradient
];

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#a8edea'];

// Enhanced custom active shape for customer segments pie chart
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 15) * cos;
  const sy = cy + (outerRadius + 15) * sin;
  const mx = cx + (outerRadius + 35) * cos;
  const my = cy + (outerRadius + 35) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 28;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      {/* Enhanced main sector with glow */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        filter="url(#customerGlow)"
      />
      {/* Outer ring with pulsing effect */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 18}
        fill={fill}
        opacity={0.5}
        filter="url(#customerPulse)"
      >
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
      </Sector>
      {/* Connection line with enhanced styling */}
      <path 
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
        stroke={fill} 
        fill="none" 
        strokeWidth={3} 
        opacity={0.9}
        filter="url(#lineShadow)"
        strokeDasharray="0"
      />
      {/* Enhanced connection point */}
      <circle 
        cx={ex} 
        cy={ey} 
        r={4} 
        fill={fill} 
        stroke="var(--bg-100)" 
        strokeWidth={3}
        filter="url(#pointShadow)"
      >
        <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Modern label background */}
      <rect
        x={ex + (cos >= 0 ? 1 : -1) * 18 - (cos >= 0 ? 0 : Math.max(payload.segment.length * 8, 85))}
        y={ey - 30}
        width={Math.max(payload.segment.length * 8.5, 90)}
        height={50}
        fill="var(--bg-100)"
        rx={12}
        ry={12}
        opacity={0.98}
        filter="url(#cardShadow)"
        stroke={fill}
        strokeWidth={1.5}
        strokeOpacity={0.3}
      />
      {/* Segment name with icon */}
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 25} 
        y={ey - 12} 
        textAnchor={textAnchor} 
        fill="var(--text-100)" 
        className="text-sm font-bold"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
      >
        {payload.segment}
      </text>
      {/* Customer count and percentage */}
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 25} 
        y={ey + 2} 
        textAnchor={textAnchor} 
        fill="var(--text-200)" 
        className="text-xs font-semibold"
      >
        {`${value} müşteri`}
      </text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 25} 
        y={ey + 15} 
        textAnchor={textAnchor} 
        fill={fill} 
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

export const CustomerAnalysisCharts: React.FC<CustomerAnalysisChartsProps> = ({ customerData, isLoading = false }) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
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
    <div className="space-y-8">
      {/* Enhanced Customer Segments Pie Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
          {/* Premium background with animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/6 to-pink-500/8 opacity-0 group-hover:opacity-100 transition-all duration-700" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600"></div>
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-lg font-semibold flex items-center space-x-3">
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg">
                <Users className="w-6 h-6" style={{ color: '#667eea' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-xl blur-sm"></div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Müşteri Segmentleri
                </span>
                <p className="text-xs text-gray-500 font-normal mt-1 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                  Segmentler arası dağılım analizi
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-xs text-gray-500">Toplam Müşteri</p>
                <p className="text-lg font-bold text-gray-900">
                  {(customerData.customerSegments || []).reduce((sum, segment) => sum + segment.count, 0)}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <defs>
                  {/* Enhanced gradients */}
                  {(customerData.customerSegments || []).map((_, index) => (
                    <linearGradient key={index} id={`customerGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={GRADIENT_COLORS[index]?.start || COLORS[index]} stopOpacity={0.95}/>
                      <stop offset="50%" stopColor={GRADIENT_COLORS[index]?.end || COLORS[index]} stopOpacity={0.9}/>
                      <stop offset="100%" stopColor={GRADIENT_COLORS[index]?.start || COLORS[index]} stopOpacity={0.8}/>
                    </linearGradient>
                  ))}
                  {/* Advanced filter effects */}
                  <filter id="customerGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="customerPulse" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2" result="pulseBlur"/>
                    <feMerge> 
                      <feMergeNode in="pulseBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="pointShadow" x="-20%" y="-20%" width="140%" height="140%">
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
                  data={customerData.customerSegments || []}
                  dataKey="count"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={50}
                  paddingAngle={3}
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  animationBegin={0}
                  animationDuration={1400}
                  animationEasing="ease-out"
                >
                  {(customerData.customerSegments || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#customerGradient${index})`}
                      stroke="var(--bg-100)"
                      strokeWidth={2.5}
                      style={{
                        filter: activeIndex === index ? 'brightness(1.15)' : 'brightness(1)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Müşteri Sayısı']}
                  labelFormatter={(label) => `Segment: ${label}`}
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
            
            {/* Enhanced segment statistics */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(customerData.customerSegments || []).map((segment, index) => {
                const totalCustomers = (customerData.customerSegments || []).reduce((sum, s) => sum + s.count, 0);
                const percentage = (segment.count / totalCustomers) * 100;
                const isActive = activeIndex === index;
                
                return (
                  <motion.div
                    key={segment.segment}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + (index * 0.1) }}
                    className={`group cursor-pointer transition-all duration-300 transform ${
                      isActive ? 'scale-105' : 'hover:scale-102'
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(-1)}
                  >
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-white to-gray-50 shadow-xl border-2' 
                        : 'bg-gradient-to-r from-gray-50/80 to-transparent hover:from-gray-100/80 hover:shadow-lg border'
                    }`}
                    style={{
                      borderColor: isActive ? (GRADIENT_COLORS[index]?.start || COLORS[index]) : 'var(--bg-300)'
                    }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
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
                          <div>
                            <p className={`font-semibold text-sm transition-colors duration-300 ${
                              isActive ? 'text-gray-900' : 'text-gray-800 group-hover:text-gray-900'
                            }`}>
                              {segment.segment}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                              {segment.count} müşteri
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold transition-colors duration-300 ${
                            isActive ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {percentage.toFixed(1)}%
                          </p>
                          <div className={`w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1 ${
                            isActive ? 'shadow-sm' : ''
                          }`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 1.6 + (index * 0.1), duration: 0.6 }}
                              className="h-full rounded-full"
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

      {/* Enhanced Customer Acquisition Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-all duration-700" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold flex items-center space-x-3">
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 shadow-lg">
                <UserCheck className="w-6 h-6" style={{ color: '#43e97b' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-blue-400/30 rounded-xl blur-sm"></div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Müşteri Kazanımı
                </span>
                <p className="text-xs text-gray-500 font-normal mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Aylık yeni müşteri trendi
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart 
                data={customerData.customerAcquisition || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="acquisitionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43e97b" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#38f9d7" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="var(--bg-300)" 
                  opacity={0.3} 
                />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-200)" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="var(--text-200)" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Yeni Müşteri']}
                  contentStyle={{ 
                    backgroundColor: '#1A1F2B',
                    border: '1px solid #354656', 
                    borderRadius: '12px',
                    color: '#B4C2DC',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  labelStyle={{ color: '#FFFFFF' }}
                  itemStyle={{ color: '#B4C2DC' }}
                />
                <Bar 
                  dataKey="newCustomers" 
                  fill="url(#acquisitionGradient)" 
                  radius={[6, 6, 0, 0]}
                  strokeWidth={1}
                  stroke="var(--bg-300)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
