import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegionAnalysis } from '../../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Sector } from 'recharts';
import { Button } from '@/components/ui/button';
import { AnalyzeService } from '../../utils/analyze-service';
import { exportElementToPng, exportElementToPdf } from '../../utils/export-utils';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, BarChart3 } from 'lucide-react';

interface RegionAnalysisChartsProps {
  regionData: RegionAnalysis;
  isLoading?: boolean;
}

const GRADIENT_COLORS = [
  { start: '#667eea', end: '#764ba2', stroke: '#667eea' },
  { start: '#f093fb', end: '#f5576c', stroke: '#f093fb' },
  { start: '#4facfe', end: '#00f2fe', stroke: '#4facfe' },
  { start: '#43e97b', end: '#38f9d7', stroke: '#43e97b' },
  { start: '#fa709a', end: '#fee140', stroke: '#fa709a' },
  { start: '#a8edea', end: '#fed6e3', stroke: '#a8edea' }
];

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#a8edea'];

export const RegionAnalysisCharts: React.FC<RegionAnalysisChartsProps> = ({ regionData, isLoading = false }) => {
  const pieRef = useRef<HTMLDivElement | null>(null);
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
    <div className="space-y-6">
      {/* Enhanced Sales by Region Pie Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-green-500/6 to-purple-500/8 opacity-0 group-hover:opacity-100 transition-all duration-700" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-green-500 to-purple-600"></div>
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-lg font-semibold flex items-center space-x-3">
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-green-500/20 shadow-lg">
                <MapPin className="w-6 h-6" style={{ color: '#667eea' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-green-400/30 rounded-xl blur-sm"></div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                  Bölgesel Satış Dağılımı
                </span>
                <p className="text-xs text-gray-500 font-normal mt-1 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                  Coğrafi satış performans analizi
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs text-gray-500">Toplam Bölge</p>
                <p className="text-lg font-bold text-gray-900">
                  {(regionData.salesByRegion || []).length}
                </p>
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hover:bg-blue-50 hover:border-blue-200 hover:scale-105 transition-all duration-200"
                  onClick={() => pieRef.current && exportElementToPng(pieRef.current, 'bolgesel-satis-dagilimi.png')}
                >
                  <span className="text-blue-600">PNG</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hover:bg-green-50 hover:border-green-200 hover:scale-105 transition-all duration-200"
                  onClick={() => pieRef.current && exportElementToPdf(pieRef.current, 'bolgesel-satis-dagilimi.pdf')}
                >
                  <span className="text-green-600">PDF</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div ref={pieRef}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <defs>
                    {(regionData.salesByRegion || []).map((_, index) => (
                      <linearGradient key={index} id={`regionGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={GRADIENT_COLORS[index]?.start || COLORS[index]} stopOpacity={0.95}/>
                        <stop offset="50%" stopColor={GRADIENT_COLORS[index]?.end || COLORS[index]} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={GRADIENT_COLORS[index]?.start || COLORS[index]} stopOpacity={0.8}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={regionData.salesByRegion || []}
                    dataKey="totalSales"
                    nameKey="region"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    innerRadius={55}
                    paddingAngle={3}
                    activeIndex={activeIndex}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(-1)}
                    animationBegin={0}
                    animationDuration={1400}
                    animationEasing="ease-out"
                  >
                    {(regionData.salesByRegion || []).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#regionGradient${index})`}
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
                    formatter={(value: number) => [
                      AnalyzeService.formatCurrency(value), 
                      'Bölge Satışı'
                    ]}
                    labelFormatter={(label) => `Bölge: ${label}`}
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Region Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/3 via-transparent to-blue-500/3 opacity-0 group-hover:opacity-100 transition-all duration-700" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold flex items-center space-x-3">
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-gray-500/20 to-blue-500/20 shadow-lg">
                <BarChart3 className="w-6 h-6" style={{ color: '#4facfe' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400/30 to-blue-400/30 rounded-xl blur-sm"></div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent">
                  Bölge Performansı
                </span>
                <p className="text-xs text-gray-500 font-normal mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Detaylı bölgesel analiz tablosu
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-auto rounded-xl" style={{ border: '1px solid #354656' }}>
              <table className="min-w-full text-sm" style={{ backgroundColor: '#292E3B' }}>
                <thead style={{ backgroundColor: '#1A1F2B' }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-bold border-b" style={{ color: '#B4C2DC', borderColor: '#354656' }}>Bölge</th>
                    <th className="px-4 py-3 text-left font-bold border-b" style={{ color: '#B4C2DC', borderColor: '#354656' }}>Performans</th>
                    <th className="px-4 py-3 text-left font-bold border-b" style={{ color: '#B4C2DC', borderColor: '#354656' }}>Skor</th>
                    <th className="px-4 py-3 text-left font-bold border-b" style={{ color: '#B4C2DC', borderColor: '#354656' }}>Satış</th>
                    <th className="px-4 py-3 text-left font-bold border-b" style={{ color: '#B4C2DC', borderColor: '#354656' }}>Müşteri</th>
                    <th className="px-4 py-3 text-left font-bold border-b" style={{ color: '#B4C2DC', borderColor: '#354656' }}>Büyüme</th>
                  </tr>
                </thead>
                <tbody>
                  {regionData.regionPerformance?.map((row, idx) => (
                    <motion.tr 
                      key={idx} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (idx * 0.1) }}
                      className="border-b hover:bg-opacity-50 transition-all duration-200"
                      style={{ 
                        borderColor: '#354656'
                      }}
                    >
                      <td className="px-4 py-3 font-semibold" style={{ color: '#B4C2DC' }}>{row.region}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          row.performance === 'excellent' ? 'bg-green-600 text-white' :
                          row.performance === 'good' ? 'bg-blue-600 text-white' :
                          row.performance === 'average' ? 'bg-yellow-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {row.performance}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: '#B4C2DC' }}>{row.score}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#B4C2DC' }}>
                        {AnalyzeService.formatCurrency(Number(row.metrics.sales))}
                      </td>
                      <td className="px-4 py-3" style={{ color: '#B4C2DC' }}>{row.metrics.customers}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${
                          row.metrics.growth > 0 ? 'text-green-400' : 
                          row.metrics.growth < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {row.metrics.growth > 0 ? '+' : ''}{row.metrics.growth}%
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
