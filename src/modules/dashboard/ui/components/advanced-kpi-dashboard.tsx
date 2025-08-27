'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Users,
  ShoppingCart, Package, Target, BarChart3, Activity, Clock, Star, Zap,
  Shield, RefreshCw, Filter, Search, Download, Eye, Percent, MapPin, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIItem {
  id: string;
  name: string;
  value: number | string;
  change?: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'currency' | 'number' | 'percentage' | 'decimal';
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: 'high' | 'medium' | 'low';
  isGoodWhenHigh?: boolean;
  unit?: string;
}

const categories = [
  { id: 'all', name: 'All KPIs', color: 'from-gray-500 to-gray-600' },
  { id: 'sales', name: 'Sales', color: 'from-blue-500 to-cyan-500', icon: DollarSign },
  { id: 'customer', name: 'Customer', color: 'from-green-500 to-emerald-500', icon: Users },
  { id: 'product', name: 'Product', color: 'from-purple-500 to-pink-500', icon: Package },
  { id: 'financial', name: 'Financial', color: 'from-yellow-500 to-orange-500', icon: BarChart3 },
  { id: 'operational', name: 'Operations', color: 'from-red-500 to-rose-500', icon: Activity },
  { id: 'marketing', name: 'Marketing', color: 'from-indigo-500 to-purple-500', icon: Target }
];

const generateKPIData = (): KPIItem[] => [
  // Sales KPIs (12)
  { id: 'total_revenue', name: 'Total Revenue', value: 2847593, change: 12.5, changeType: 'increase', format: 'currency', category: 'sales', icon: DollarSign, priority: 'high', isGoodWhenHigh: true },
  { id: 'monthly_revenue', name: 'Monthly Revenue', value: 387420, change: 8.3, changeType: 'increase', format: 'currency', category: 'sales', icon: Calendar, priority: 'high', isGoodWhenHigh: true },
  { id: 'daily_revenue', name: 'Daily Revenue', value: 12914, change: -2.1, changeType: 'decrease', format: 'currency', category: 'sales', icon: Clock, priority: 'medium', isGoodWhenHigh: true },
  { id: 'total_orders', name: 'Total Orders', value: 8432, change: 15.7, changeType: 'increase', format: 'number', category: 'sales', icon: ShoppingCart, priority: 'high', isGoodWhenHigh: true },
  { id: 'avg_order_value', name: 'Average Order Value', value: 337.65, change: 4.2, changeType: 'increase', format: 'currency', category: 'sales', icon: Target, priority: 'high', isGoodWhenHigh: true },
  { id: 'conversion_rate', name: 'Conversion Rate', value: 3.24, change: 0.8, changeType: 'increase', format: 'percentage', category: 'sales', icon: Percent, priority: 'high', isGoodWhenHigh: true },
  { id: 'sales_growth', name: 'Sales Growth Rate', value: 18.5, change: 2.3, changeType: 'increase', format: 'percentage', category: 'sales', icon: TrendingUp, priority: 'high', isGoodWhenHigh: true },
  { id: 'revenue_per_visitor', name: 'Revenue per Visitor', value: 10.93, change: 1.5, changeType: 'increase', format: 'currency', category: 'sales', icon: Eye, priority: 'medium', isGoodWhenHigh: true },
  { id: 'sales_velocity', name: 'Sales Velocity', value: 5.8, change: 12.1, changeType: 'increase', format: 'decimal', category: 'sales', icon: Zap, priority: 'medium', isGoodWhenHigh: false, unit: ' days' },
  { id: 'cart_abandonment', name: 'Cart Abandonment Rate', value: 68.7, change: -3.2, changeType: 'decrease', format: 'percentage', category: 'sales', icon: ShoppingCart, priority: 'medium', isGoodWhenHigh: false },
  { id: 'repeat_purchase', name: 'Repeat Purchase Rate', value: 27.3, change: 5.1, changeType: 'increase', format: 'percentage', category: 'sales', icon: RefreshCw, priority: 'medium', isGoodWhenHigh: true },
  { id: 'regional_performance', name: 'Top Region Performance', value: 425000, change: 7.8, changeType: 'increase', format: 'currency', category: 'sales', icon: MapPin, priority: 'medium', isGoodWhenHigh: true },

  // Customer KPIs (10)
  { id: 'total_customers', name: 'Total Customers', value: 12847, change: 22.4, changeType: 'increase', format: 'number', category: 'customer', icon: Users, priority: 'high', isGoodWhenHigh: true },
  { id: 'new_customers', name: 'New Customers', value: 1834, change: 18.9, changeType: 'increase', format: 'number', category: 'customer', icon: Users, priority: 'high', isGoodWhenHigh: true },
  { id: 'customer_acquisition_cost', name: 'Customer Acquisition Cost', value: 47.83, change: -8.2, changeType: 'decrease', format: 'currency', category: 'customer', icon: Target, priority: 'high', isGoodWhenHigh: false },
  { id: 'customer_lifetime_value', name: 'Customer Lifetime Value', value: 892.45, change: 15.3, changeType: 'increase', format: 'currency', category: 'customer', icon: Star, priority: 'high', isGoodWhenHigh: true },
  { id: 'customer_retention', name: 'Customer Retention Rate', value: 84.2, change: 3.7, changeType: 'increase', format: 'percentage', category: 'customer', icon: Shield, priority: 'high', isGoodWhenHigh: true },
  { id: 'churn_rate', name: 'Customer Churn Rate', value: 15.8, change: -2.1, changeType: 'decrease', format: 'percentage', category: 'customer', icon: TrendingDown, priority: 'high', isGoodWhenHigh: false },
  { id: 'customer_satisfaction', name: 'Customer Satisfaction', value: 4.3, change: 0.2, changeType: 'increase', format: 'decimal', category: 'customer', icon: Star, priority: 'medium', isGoodWhenHigh: true, unit: '/5' },
  { id: 'nps_score', name: 'Net Promoter Score', value: 67, change: 8.0, changeType: 'increase', format: 'number', category: 'customer', icon: TrendingUp, priority: 'medium', isGoodWhenHigh: true },
  { id: 'customer_engagement', name: 'Customer Engagement Rate', value: 73.5, change: 4.8, changeType: 'increase', format: 'percentage', category: 'customer', icon: Activity, priority: 'medium', isGoodWhenHigh: true },
  { id: 'support_tickets', name: 'Support Tickets', value: 234, change: -12.3, changeType: 'decrease', format: 'number', category: 'customer', icon: Shield, priority: 'low', isGoodWhenHigh: false },

  // Product KPIs (8)
  { id: 'total_products', name: 'Total Products', value: 1247, change: 3.2, changeType: 'increase', format: 'number', category: 'product', icon: Package, priority: 'medium', isGoodWhenHigh: true },
  { id: 'bestseller_revenue', name: 'Top Product Revenue', value: 89432, change: 23.1, changeType: 'increase', format: 'currency', category: 'product', icon: Star, priority: 'high', isGoodWhenHigh: true },
  { id: 'inventory_turnover', name: 'Inventory Turnover', value: 8.3, change: 1.2, changeType: 'increase', format: 'decimal', category: 'product', icon: RefreshCw, priority: 'medium', isGoodWhenHigh: true, unit: 'x' },
  { id: 'out_of_stock', name: 'Out of Stock Items', value: 23, change: -15.2, changeType: 'decrease', format: 'number', category: 'product', icon: Package, priority: 'high', isGoodWhenHigh: false },
  { id: 'product_return_rate', name: 'Product Return Rate', value: 4.7, change: -1.8, changeType: 'decrease', format: 'percentage', category: 'product', icon: TrendingDown, priority: 'medium', isGoodWhenHigh: false },
  { id: 'category_performance', name: 'Top Category Revenue', value: 547893, change: 11.2, changeType: 'increase', format: 'currency', category: 'product', icon: BarChart3, priority: 'medium', isGoodWhenHigh: true },
  { id: 'new_product_sales', name: 'New Product Sales', value: 134567, change: 45.7, changeType: 'increase', format: 'currency', category: 'product', icon: Star, priority: 'medium', isGoodWhenHigh: true },
  { id: 'product_views', name: 'Product Page Views', value: 284593, change: 8.9, changeType: 'increase', format: 'number', category: 'product', icon: Eye, priority: 'low', isGoodWhenHigh: true },

  // Financial KPIs (7)
  { id: 'gross_profit', name: 'Gross Profit', value: 1847239, change: 14.2, changeType: 'increase', format: 'currency', category: 'financial', icon: DollarSign, priority: 'high', isGoodWhenHigh: true },
  { id: 'gross_margin', name: 'Gross Profit Margin', value: 64.8, change: 2.1, changeType: 'increase', format: 'percentage', category: 'financial', icon: Percent, priority: 'high', isGoodWhenHigh: true },
  { id: 'operating_expenses', name: 'Operating Expenses', value: 543210, change: 5.3, changeType: 'increase', format: 'currency', category: 'financial', icon: TrendingDown, priority: 'high', isGoodWhenHigh: false },
  { id: 'net_profit', name: 'Net Profit', value: 1304029, change: 18.7, changeType: 'increase', format: 'currency', category: 'financial', icon: TrendingUp, priority: 'high', isGoodWhenHigh: true },
  { id: 'cash_flow', name: 'Cash Flow', value: 892345, change: 12.4, changeType: 'increase', format: 'currency', category: 'financial', icon: Activity, priority: 'high', isGoodWhenHigh: true },
  { id: 'roi', name: 'Return on Investment', value: 23.4, change: 4.8, changeType: 'increase', format: 'percentage', category: 'financial', icon: Target, priority: 'medium', isGoodWhenHigh: true },
  { id: 'break_even_point', name: 'Break-even Point', value: 67834, change: -8.1, changeType: 'decrease', format: 'currency', category: 'financial', icon: BarChart3, priority: 'medium', isGoodWhenHigh: false },

  // Operational KPIs (6)
  { id: 'order_fulfillment', name: 'Order Fulfillment Time', value: 2.3, change: -12.5, changeType: 'decrease', format: 'decimal', category: 'operational', icon: Clock, priority: 'high', isGoodWhenHigh: false, unit: ' days' },
  { id: 'website_uptime', name: 'Website Uptime', value: 99.8, change: 0.1, changeType: 'increase', format: 'percentage', category: 'operational', icon: Shield, priority: 'high', isGoodWhenHigh: true },
  { id: 'page_load_speed', name: 'Page Load Speed', value: 1.8, change: -15.3, changeType: 'decrease', format: 'decimal', category: 'operational', icon: Zap, priority: 'medium', isGoodWhenHigh: false, unit: 's' },
  { id: 'shipping_cost', name: 'Average Shipping Cost', value: 8.45, change: -3.2, changeType: 'decrease', format: 'currency', category: 'operational', icon: Package, priority: 'medium', isGoodWhenHigh: false },
  { id: 'employee_productivity', name: 'Employee Productivity', value: 87.3, change: 6.2, changeType: 'increase', format: 'percentage', category: 'operational', icon: Users, priority: 'medium', isGoodWhenHigh: true },
  { id: 'system_errors', name: 'System Errors', value: 12, change: -23.4, changeType: 'decrease', format: 'number', category: 'operational', icon: Shield, priority: 'low', isGoodWhenHigh: false },

  // Marketing KPIs (5)
  { id: 'marketing_roi', name: 'Marketing ROI', value: 340, change: 23.8, changeType: 'increase', format: 'percentage', category: 'marketing', icon: Target, priority: 'high', isGoodWhenHigh: true },
  { id: 'lead_generation', name: 'Monthly Leads', value: 2847, change: 18.5, changeType: 'increase', format: 'number', category: 'marketing', icon: Users, priority: 'high', isGoodWhenHigh: true },
  { id: 'email_open_rate', name: 'Email Open Rate', value: 24.7, change: 3.2, changeType: 'increase', format: 'percentage', category: 'marketing', icon: Eye, priority: 'medium', isGoodWhenHigh: true },
  { id: 'social_engagement', name: 'Social Media Engagement', value: 8.3, change: 12.1, changeType: 'increase', format: 'percentage', category: 'marketing', icon: Activity, priority: 'medium', isGoodWhenHigh: true },
  { id: 'ad_spend', name: 'Advertising Spend', value: 45789, change: 8.7, changeType: 'increase', format: 'currency', category: 'marketing', icon: DollarSign, priority: 'medium', isGoodWhenHigh: false }
];

const KPICard: React.FC<{ kpi: KPIItem }> = ({ kpi }) => {
  const formatValue = (value: number | string, format: string, unit?: string): string => {
    if (typeof value === 'string') return value;
    switch (format) {
      case 'currency': return `$${value.toLocaleString()}`;
      case 'percentage': return `${value}%`;
      case 'decimal': return unit ? `${value}${unit}` : value.toFixed(1);
      default: return value.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (!kpi.change) return null;
    const isPositive = kpi.changeType === 'increase';
    const isGoodChange = kpi.isGoodWhenHigh ? isPositive : !isPositive;
    
    return isPositive ? 
      <ArrowUpRight className={cn("w-4 h-4", isGoodChange ? "text-green-500" : "text-red-500")} /> :
      <ArrowDownRight className={cn("w-4 h-4", isGoodChange ? "text-green-500" : "text-red-500")} />;
  };

  const getPriorityColor = () => {
    switch (kpi.priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      default: return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn("border-2 transition-all duration-300 hover:shadow-lg", getPriorityColor())}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={cn("p-2 rounded-lg", `bg-gradient-to-r ${categories.find(c => c.id === kpi.category)?.color}`)}>
                <kpi.icon className="w-4 h-4 text-white" />
              </div>
              <Badge variant="outline" className="text-xs">{kpi.priority.toUpperCase()}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">{kpi.name}</h4>
            
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatValue(kpi.value, kpi.format, kpi.unit)}
              </span>
              
              {kpi.change && (
                <div className="flex items-center text-sm font-medium">
                  {getTrendIcon()}
                  <span className="ml-1">{Math.abs(kpi.change)}%</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const AdvancedKPIDashboard: React.FC = () => {
  const [kpiData] = useState<KPIItem[]>(generateKPIData());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyHigh, setShowOnlyHigh] = useState(false);

  const filteredKPIs = kpiData.filter(kpi => {
    const matchesCategory = selectedCategory === 'all' || kpi.category === selectedCategory;
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !showOnlyHigh || kpi.priority === 'high';
    return matchesCategory && matchesSearch && matchesPriority;
  });

  const kpiStats = {
    total: kpiData.length,
    high: kpiData.filter(k => k.priority === 'high').length,
    improving: kpiData.filter(k => k.changeType === 'increase').length,
    categories: categories.length - 1
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced KPI Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">48 comprehensive business metrics and performance indicators</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total KPIs', value: kpiStats.total, color: 'text-blue-600' },
          { label: 'High Priority', value: kpiStats.high, color: 'text-red-600' },
          { label: 'Improving', value: kpiStats.improving, color: 'text-green-600' },
          { label: 'Categories', value: kpiStats.categories, color: 'text-purple-600' }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search KPIs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant={showOnlyHigh ? "default" : "outline"} onClick={() => setShowOnlyHigh(!showOnlyHigh)} className="whitespace-nowrap">
            <Filter className="w-4 h-4 mr-2" />
            High Priority Only
          </Button>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.id === 'all' ? 'All' : category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredKPIs.map((kpi) => (
                <motion.div
                  key={kpi.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <KPICard kpi={kpi} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </TabsContent>
      </Tabs>

      {filteredKPIs.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="text-gray-400 text-lg">No KPIs found matching your criteria</div>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setShowOnlyHigh(false); }} className="mt-4">
            Clear Filters
          </Button>
        </motion.div>
      )}
    </div>
  );
};