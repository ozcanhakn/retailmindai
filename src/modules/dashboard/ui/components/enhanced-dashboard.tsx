'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExportService, exportUtils, ExportData } from '@/lib/export-service';
import { 
  Calendar, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign,
  ShoppingCart,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  MapPin,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  CalendarIcon,
  Search,
  X,
  FileText,
  Image,
  FileSpreadsheet
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

// Mock data - in real app this would come from API
const mockKPIData = {
  totalSales: { value: 125000, change: 12.5, period: 'last_month' },
  totalOrders: { value: 340, change: -2.3, period: 'last_month' },
  averageOrderValue: { value: 367.65, change: 15.2, period: 'last_month' },
  totalCustomers: { value: 1250, change: 8.7, period: 'last_month' },
  conversionRate: { value: 3.2, change: 0.8, period: 'last_month' },
  revenueGrowth: { value: 18.5, change: 5.2, period: 'last_month' }
};

interface FilterState {
  dateRange: {
    from: Date | undefined;
    to?: Date | undefined;
  };
  category: string;
  region: string;
  status: string;
  searchTerm: string;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports' }
];

const regions = [
  { value: 'all', label: 'All Regions' },
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'central', label: 'Central' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const quickDateRanges = [
  { label: 'Today', getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: 'Yesterday', getValue: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { label: 'Last 7 days', getValue: () => ({ from: startOfDay(subDays(new Date(), 7)), to: endOfDay(new Date()) }) },
  { label: 'Last 30 days', getValue: () => ({ from: startOfDay(subDays(new Date(), 30)), to: endOfDay(new Date()) }) },
  { label: 'Last 90 days', getValue: () => ({ from: startOfDay(subDays(new Date(), 90)), to: endOfDay(new Date()) }) }
];

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down' | 'neutral';
  format?: 'currency' | 'number' | 'percentage';
  period?: string;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend, 
  format = 'number',
  period = 'vs last month'
}) => {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return `$${typeof val === 'number' ? val.toLocaleString() : val}`;
    } else if (format === 'percentage') {
      return `${val}%`;
    }
    return typeof val === 'number' ? val.toLocaleString() : val;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4" />;
      case 'down': return <ArrowDownRight className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatValue(value)}
                </h3>
                <div className={cn("flex items-center text-sm font-medium", getTrendColor())}>
                  {getTrendIcon()}
                  <span>{Math.abs(change)}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{period}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 shadow-inner">
              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const EnhancedDashboard: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date()
    },
    category: 'all',
    region: 'all',
    status: 'all',
    searchTerm: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateRangeSelect = (range: { from: Date; to: Date }) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: {
        from: subDays(new Date(), 30),
        to: new Date()
      },
      category: 'all',
      region: 'all',
      status: 'all',
      searchTerm: ''
    });
  };

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.region !== 'all',
    filters.status !== 'all',
    filters.searchTerm !== ''
  ].filter(Boolean).length;

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExportPNG = async () => {
    if (!dashboardRef.current) return;
    
    try {
      setIsExporting(true);
      await exportUtils.quickPNG(dashboardRef.current, 'dashboard-report');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    
    try {
      setIsExporting(true);
      await exportUtils.quickPDF(dashboardRef.current, 'dashboard-report');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      
      const reportData: ExportData = {
        headers: ['Metric', 'Value', 'Change', 'Period'],
        rows: [
          ['Total Sales', `$${mockKPIData.totalSales.value.toLocaleString()}`, `${mockKPIData.totalSales.change}%`, 'Last Month'],
          ['Total Orders', mockKPIData.totalOrders.value.toString(), `${mockKPIData.totalOrders.change}%`, 'Last Month'],
          ['Average Order Value', `$${mockKPIData.averageOrderValue.value}`, `${mockKPIData.averageOrderValue.change}%`, 'Last Month'],
          ['Total Customers', mockKPIData.totalCustomers.value.toString(), `${mockKPIData.totalCustomers.change}%`, 'Last Month'],
          ['Conversion Rate', `${mockKPIData.conversionRate.value}%`, `${mockKPIData.conversionRate.change}%`, 'Last Month'],
          ['Revenue Growth', `${mockKPIData.revenueGrowth.value}%`, `${mockKPIData.revenueGrowth.change}%`, 'Last Month']
        ],
        title: 'Dashboard KPI Report',
        metadata: {
          'Export Date': new Date().toLocaleDateString(),
          'Date Range': filters.dateRange.from && filters.dateRange.to ? 
            `${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}` : 'Custom Range',
          'Filters Applied': {
            'Category': filters.category,
            'Region': filters.region,
            'Status': filters.status
          }
        }
      };
      
      await exportUtils.quickExcel(reportData, 'dashboard-kpi-report');
    } catch (error) {
      console.error('Excel export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={dashboardRef} className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6" data-export-target>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time analytics and insights for your business
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleExportPNG} disabled={isExporting}>
                <Image className="w-4 h-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={async () => {
                  if (!dashboardRef.current) return;
                  setIsExporting(true);
                  try {
                    await ExportService.exportMultipleFormats(
                      dashboardRef.current,
                      {
                        headers: ['Metric', 'Value', 'Change'],
                        rows: Object.entries(mockKPIData).map(([key, data]) => [
                          key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                          typeof data.value === 'number' && key.includes('Sales') || key.includes('Order') ? 
                            `$${data.value.toLocaleString()}` : data.value.toString(),
                          `${data.change}%`
                        ]),
                        title: 'Complete Dashboard Report'
                      },
                      ['png', 'pdf', 'excel'],
                      { filename: 'complete-dashboard-report' }
                    );
                  } catch (error) {
                    console.error('Multiple export failed:', error);
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                className="font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Formats
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Advanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Primary Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {/* Date Range Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[280px] justify-start text-left font-normal hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                            {format(filters.dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Quick Selection</p>
                        <div className="flex flex-wrap gap-2">
                          {quickDateRanges.map((range) => (
                            <Button
                              key={range.label}
                              variant="outline"
                              size="sm"
                              onClick={() => handleDateRangeSelect(range.getValue())}
                              className="text-xs"
                            >
                              {range.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={filters.dateRange?.from}
                        selected={filters.dateRange}
                        onSelect={(range) => {
                          if (range?.from) {
                            setFilters(prev => ({ 
                              ...prev, 
                              dateRange: { 
                                from: range.from, 
                                to: range.to 
                              } 
                            }));
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="pl-10 w-[200px]"
                  />
                  {filters.searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFilterChange('searchTerm', '')}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Secondary Filters Toggle */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            {/* Extended Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Category
                      </label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => handleFilterChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Region
                      </label>
                      <Select
                        value={filters.region}
                        onValueChange={(value) => handleFilterChange('region', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Status
                      </label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => handleFilterChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <KPICard
          title="Total Sales"
          value={mockKPIData.totalSales.value}
          change={mockKPIData.totalSales.change}
          icon={DollarSign}
          trend={mockKPIData.totalSales.change > 0 ? 'up' : 'down'}
          format="currency"
        />
        <KPICard
          title="Total Orders"
          value={mockKPIData.totalOrders.value}
          change={mockKPIData.totalOrders.change}
          icon={ShoppingCart}
          trend={mockKPIData.totalOrders.change > 0 ? 'up' : 'down'}
          format="number"
        />
        <KPICard
          title="Average Order Value"
          value={mockKPIData.averageOrderValue.value}
          change={mockKPIData.averageOrderValue.change}
          icon={Target}
          trend={mockKPIData.averageOrderValue.change > 0 ? 'up' : 'down'}
          format="currency"
        />
        <KPICard
          title="Total Customers"
          value={mockKPIData.totalCustomers.value}
          change={mockKPIData.totalCustomers.change}
          icon={Users}
          trend={mockKPIData.totalCustomers.change > 0 ? 'up' : 'down'}
          format="number"
        />
        <KPICard
          title="Conversion Rate"
          value={mockKPIData.conversionRate.value}
          change={mockKPIData.conversionRate.change}
          icon={Activity}
          trend={mockKPIData.conversionRate.change > 0 ? 'up' : 'down'}
          format="percentage"
        />
        <KPICard
          title="Revenue Growth"
          value={mockKPIData.revenueGrowth.value}
          change={mockKPIData.revenueGrowth.change}
          icon={TrendingUp}
          trend={mockKPIData.revenueGrowth.change > 0 ? 'up' : 'down'}
          format="percentage"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">View Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2 hover:bg-green-50 dark:hover:bg-green-900/20">
                <Package className="w-6 h-6" />
                <span className="text-sm">Manage Products</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                <Users className="w-6 h-6" />
                <span className="text-sm">Customer Reports</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                <PieChart className="w-6 h-6" />
                <span className="text-sm">Sales Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};