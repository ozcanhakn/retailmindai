"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Maximize2, 
  MoreHorizontal,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Color palettes for different chart types
const CHART_COLORS = {
  primary: ['#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D'],
  success: ['#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D'],
  warning: ['#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D'],
  danger: ['#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D'],
  gradient: ['#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D']
};

const HEATMAP_COLORS = ['#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D', '#FF4D4D'];

interface ChartProps {
  data: any[];
  title: string;
  description?: string;
  height?: number;
  colors?: string[];
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  loading?: boolean;
  error?: string;
}

// Enhanced Bar Chart Component
export const AdvancedBarChart: React.FC<ChartProps & {
  xKey: string;
  yKey: string;
  orientation?: 'vertical' | 'horizontal';
  stacked?: boolean;
  animated?: boolean;
}> = ({
  data,
  title,
  description,
  xKey,
  yKey,
  height = 300,
  colors = CHART_COLORS.primary,
  className,
  showLegend = true,
  showGrid = true,
  orientation = 'vertical',
  stacked = false,
  animated = true,
  loading = false,
  error
}) => {
  if (loading) {
    return (
      <Card className={className} style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card className={className} style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            {error || 'No data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>{title}</span>
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {orientation === 'horizontal' ? 'Horizontal' : 'Vertical'} Bar
            </Badge>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <XAxis 
                dataKey={orientation === 'horizontal' ? yKey : xKey}
                type={orientation === 'horizontal' ? 'number' : 'category'}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                dataKey={orientation === 'horizontal' ? xKey : yKey}
                type={orientation === 'horizontal' ? 'category' : 'number'}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              {showLegend && <Legend />}
              <Bar 
                dataKey={yKey} 
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
                animationDuration={animated ? 800 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Line Chart Component
export const AdvancedLineChart: React.FC<ChartProps & {
  xKey: string;
  yKeys: string[];
  area?: boolean;
  smooth?: boolean;
  dots?: boolean;
}> = ({
  data,
  title,
  description,
  xKey,
  yKeys,
  height = 300,
  colors = CHART_COLORS.primary,
  className,
  showLegend = true,
  showGrid = true,
  area = false,
  smooth = true,
  dots = true,
  loading = false,
  error
}) => {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ChartComponent = area ? AreaChart : LineChart;
  const DataComponent = area ? Area : Line;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>{title}</span>
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {area ? 'Area' : 'Line'} Chart
            </Badge>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <ChartComponent
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <XAxis 
                dataKey={xKey}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              {showLegend && <Legend />}
              {yKeys.map((key, index) => {
                if (area) {
                  return (
                    <Area
                      key={key}
                      type={smooth ? "monotone" : "linear"}
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.3}
                      strokeWidth={2}
                      dot={dots ? { fill: colors[index % colors.length], strokeWidth: 2, r: 4 } : false}
                      animationDuration={800}
                    />
                  );
                } else {
                  return (
                    <Line
                      key={key}
                      type={smooth ? "monotone" : "linear"}
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={dots ? { fill: colors[index % colors.length], strokeWidth: 2, r: 4 } : false}
                      animationDuration={800}
                    />
                  );
                }
              })}
            </ChartComponent>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Pie Chart Component
export const AdvancedPieChart: React.FC<ChartProps & {
  dataKey: string;
  nameKey: string;
  innerRadius?: number;
  showLabels?: boolean;
  showPercentage?: boolean;
}> = ({
  data,
  title,
  description,
  dataKey,
  nameKey,
  height = 300,
  colors = CHART_COLORS.primary,
  className,
  showLegend = true,
  innerRadius = 0,
  showLabels = true,
  showPercentage = true,
  loading = false,
  error
}) => {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderLabel = (entry: any) => {
    if (!showLabels) return null;
    if (showPercentage) {
      return `${entry.name} (${(entry.percent * 100).toFixed(0)}%)`;
    }
    return entry.name;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-blue-600" />
              <span>{title}</span>
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {innerRadius > 0 ? 'Donut' : 'Pie'} Chart
            </Badge>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                innerRadius={innerRadius}
                fill="#8884d8"
                dataKey={dataKey}
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Heatmap Component
export const HeatmapChart: React.FC<{
  data: Array<{ x: string; y: string; value: number }>;
  title: string;
  description?: string;
  className?: string;
  width?: number;
  height?: number;
}> = ({
  data,
  title,
  description,
  className,
  width = 600,
  height = 400
}) => {
  const getColor = (value: number, min: number, max: number) => {
    const ratio = (value - min) / (max - min);
    const colorIndex = Math.floor(ratio * (HEATMAP_COLORS.length - 1));
    return HEATMAP_COLORS[colorIndex] || HEATMAP_COLORS[0];
  };

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const uniqueX = [...new Set(data.map(d => d.x))];
  const uniqueY = [...new Set(data.map(d => d.y))];

  const cellWidth = width / uniqueX.length;
  const cellHeight = height / uniqueY.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>{title}</span>
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <Badge variant="outline" className="text-xs">Heatmap</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={width} height={height + 60}>
              {/* Y-axis labels */}
              {uniqueY.map((y, index) => (
                <text
                  key={y}
                  x={-10}
                  y={index * cellHeight + cellHeight / 2 + 5}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6B7280"
                >
                  {y}
                </text>
              ))}
              
              {/* X-axis labels */}
              {uniqueX.map((x, index) => (
                <text
                  key={x}
                  x={index * cellWidth + cellWidth / 2}
                  y={height + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6B7280"
                >
                  {x}
                </text>
              ))}
              
              {/* Heatmap cells */}
              {data.map((item, index) => {
                const xIndex = uniqueX.indexOf(item.x);
                const yIndex = uniqueY.indexOf(item.y);
                const color = getColor(item.value, minValue, maxValue);
                
                return (
                  <g key={index}>
                    <rect
                      x={xIndex * cellWidth}
                      y={yIndex * cellHeight}
                      width={cellWidth - 1}
                      height={cellHeight - 1}
                      fill={color}
                      stroke="#fff"
                      strokeWidth="1"
                    />
                    <text
                      x={xIndex * cellWidth + cellWidth / 2}
                      y={yIndex * cellHeight + cellHeight / 2 + 5}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#374151"
                      fontWeight="medium"
                    >
                      {item.value}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
            <span>Low ({minValue})</span>
            <div className="flex space-x-1">
              {HEATMAP_COLORS.map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span>High ({maxValue})</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Multi-metric Dashboard Chart
export const DashboardChart: React.FC<{
  data: any[];
  title: string;
  metrics: Array<{ key: string; name: string; type: 'bar' | 'line' | 'area'; color: string }>;
  xKey: string;
  height?: number;
  className?: string;
}> = ({
  data,
  title,
  metrics,
  xKey,
  height = 400,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              
              {metrics.map((metric) => {
                if (metric.type === 'bar') {
                  return (
                    <Bar
                      key={metric.key}
                      dataKey={metric.key}
                      name={metric.name}
                      fill={metric.color}
                      radius={[4, 4, 0, 0]}
                    />
                  );
                } else if (metric.type === 'area') {
                  return (
                    <Area
                      key={metric.key}
                      type="monotone"
                      dataKey={metric.key}
                      name={metric.name}
                      stroke={metric.color}
                      fill={metric.color}
                      fillOpacity={0.3}
                    />
                  );
                } else {
                  return (
                    <Line
                      key={metric.key}
                      type="monotone"
                      dataKey={metric.key}
                      name={metric.name}
                      stroke={metric.color}
                      strokeWidth={2}
                      dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                    />
                  );
                }
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};