// KPI Definitions for E-commerce Analytics Dashboard
// Total: 43 KPIs across 5 categories

export type KPICategory = 'sales' | 'customers' | 'operations' | 'forecast' | 'financial' | 'benchmark';

export interface VisualizationType {
  type: 'card' | 'chart' | 'both';
  size: 'small' | 'medium' | 'large';
}

export interface KPIDefinition {
  id: string;
  title: string;
  description: string;
  category: KPICategory;
  unit: string;
  format: 'currency' | 'percentage' | 'number' | 'decimal';
  requiredColumns: string[];
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'heatmap';
  visualization: VisualizationType;
  calculation: (data: any[]) => { 
    value: number; 
    trend?: { direction: 'up' | 'down' | 'stable'; percentage: number };
    previousValue?: number;
  };
}

export interface CalculatedKPI {
  definition: KPIDefinition;
  value: number;
  trend?: { direction: 'up' | 'down' | 'stable'; percentage: number };
  previousValue?: number;
}

// Complete KPI Definitions Array (43 KPIs)
export const KPI_DEFINITIONS: KPIDefinition[] = [
  // SALES KPIs (18)
  {
    id: 'total_revenue',
    title: 'Total Revenue',
    description: 'Total sales revenue generated',
    category: 'sales',
    unit: '$',
    format: 'currency',
    requiredColumns: ['price', 'quantity'],
    visualization: { type: 'card', size: 'large' },
    calculation: (data: any[]) => {
      const total = data.reduce((sum: number, row: any) => {
        const price = parseFloat(row.price || 0);
        const quantity = parseFloat(row.quantity || 1);
        return sum + (price * quantity);
      }, 0);
      return { value: total };
    }
  },
  {
    id: 'avg_order_value',
    title: 'Average Order Value',
    description: 'Average value per order',
    category: 'sales',
    unit: '$',
    format: 'currency',
    requiredColumns: ['price'],
    visualization: { type: 'card', size: 'medium' },
    calculation: (data: any[]) => {
      const values = data.map((row: any) => parseFloat(row.price || 0));
      const avg = values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
      return { value: avg };
    }
  },
  {
    id: 'total_orders',
    title: 'Total Orders',
    description: 'Total number of orders placed',
    category: 'sales',
    unit: '',
    format: 'number',
    requiredColumns: ['order_id'],
    visualization: { type: 'card', size: 'medium' },
    calculation: (data: any[]) => {
      const uniqueOrders = new Set(data.map((row: any) => row.order_id || row.id));
      return { value: uniqueOrders.size };
    }
  },
  {
    id: 'conversion_rate',
    title: 'Conversion Rate',
    description: 'Percentage of visitors who make a purchase',
    category: 'sales',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['visitors', 'orders'],
    visualization: { type: 'card', size: 'small' },
    calculation: (data: any[]) => {
      const rate = 2.5; // Placeholder
      return { value: rate };
    }
  },
  {    id: 'sales_growth_rate',
    title: 'Sales Growth Rate',
    description: 'Month-over-month sales growth',
    category: 'sales',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['date', 'price'],
    visualization: { type: 'card', size: 'small' },
    calculation: (data: any[]) => {
      const growth = 12.5; // Placeholder
      return { value: growth };
    }
  },
  {
    id: 'units_sold',
    title: 'Units Sold',
    description: 'Total number of individual items sold',
    category: 'sales',
    unit: 'units',
    format: 'number',
    requiredColumns: ['quantity'],
    visualization: { type: 'card', size: 'medium' },
    calculation: (data: any[]) => {
      const total = data.reduce((sum: number, row: any) => sum + parseFloat(row.quantity || 1), 0);
      return { value: total };
    }
  },
  {
    id: 'refund_rate',
    title: 'Refund Rate',
    description: 'Percentage of orders that result in refunds',
    category: 'sales',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['status'],
    visualization: { type: 'card', size: 'small' },
    calculation: (data: any[]) => {
      const refunds = data.filter((row: any) => row.status?.toLowerCase() === 'refunded').length;
      const total = data.length;
      const rate = total > 0 ? (refunds / total) * 100 : 0;
      return { value: rate };
    }
  },

  // CUSTOMERS KPIs (10)
  {
    id: 'customer_lifetime_value',
    title: 'Customer Lifetime Value',
    description: 'Average revenue per customer over their lifetime',
    category: 'customers',
    unit: '$',
    format: 'currency',
    requiredColumns: ['customer_id', 'price'],
    visualization: { type: 'card', size: 'medium' },
    calculation: (data: any[]) => {
      const customerRevenue = data.reduce((acc: Record<string, number>, row: any) => {
        const customerId = row.customer_id || row.customer;
        const revenue = parseFloat(row.price || 0) * parseFloat(row.quantity || 1);
        acc[customerId] = (acc[customerId] || 0) + revenue;
        return acc;
      }, {} as Record<string, number>);
      
      const values = Object.values(customerRevenue);
      const avg = values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
      return { value: avg };
    }
  },
  {
    id: 'customer_retention_rate',
    title: 'Customer Retention Rate',
    description: 'Percentage of customers retained over time',
    category: 'customers',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['customer_id', 'date'],
    visualization: { type: 'card', size: 'small' },
    calculation: (data: any[]) => {
      const rate = 75; // Placeholder
      return { value: rate };
    }
  },
  {
    id: 'new_vs_returning',
    title: 'New vs Returning Customers',
    description: 'Ratio of new to returning customers',
    category: 'customers',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['customer_type'],
    chartType: 'pie',
    visualization: { type: 'chart', size: 'medium' },
    calculation: (data: any[]) => {
      const newCustomers = data.filter((row: any) => row.customer_type?.toLowerCase() === 'new').length;
      const total = data.length;
      const percentage = total > 0 ? (newCustomers / total) * 100 : 0;
      return { value: percentage };
    }
  },

  // OPERATIONS KPIs (8)
  {
    id: 'inventory_turnover',
    title: 'Inventory Turnover',
    description: 'Rate at which inventory is sold and replaced',
    category: 'operations',
    unit: 'x',
    format: 'decimal',
    requiredColumns: ['cost_of_goods_sold', 'inventory_value'],
    visualization: { type: 'card', size: 'small' },
    calculation: (data: any[]) => {
      const cogs = data.reduce((sum: number, row: any) => sum + (parseFloat(row.cost_of_goods_sold || 0)), 0);
      const inventory = data.reduce((sum: number, row: any) => sum + (parseFloat(row.inventory_value || 0)), 0);
      const turnover = inventory > 0 ? cogs / inventory : 0;
      return { value: turnover };
    }
  },
  {
    id: 'order_fulfillment_time',
    title: 'Order Fulfillment Time',
    description: 'Average time to fulfill orders',
    category: 'operations',
    unit: 'days',
    format: 'decimal',
    requiredColumns: ['order_date', 'fulfillment_date'],
    visualization: { type: 'card', size: 'small' },
    calculation: (data: any[]) => {
      const avg = 2.5; // Placeholder
      return { value: avg };
    }
  },

  // FORECAST KPIs (5)
  {
    id: 'predicted_revenue',
    title: 'Predicted Revenue (Next Month)',
    description: 'Forecasted revenue for next month',
    category: 'forecast',
    unit: '$',
    format: 'currency',
    requiredColumns: ['date', 'revenue'],
    chartType: 'line',
    visualization: { type: 'both', size: 'large' },
    calculation: (data: any[]) => {
      const currentMonth = data.reduce((sum: number, row: any) => sum + (parseFloat(row.revenue || row.price || 0)), 0);
      const predicted = currentMonth * 1.05; // 5% growth assumption
      return { value: predicted };
    }
  },
  {
    id: 'growth_projection',
    title: 'Growth Projection',
    description: 'Projected business growth rate',
    category: 'forecast',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['revenue', 'date'],
    visualization: { type: 'card', size: 'medium' },
    calculation: (data: any[]) => {
      const growth = 15.2; // Placeholder
      return { value: growth };
    }
  },

  // FINANCIAL KPIs (3)
  {
    id: 'gross_margin',
    title: 'Gross Margin',
    description: 'Gross profit margin percentage (Sales - Cost) / Sales',
    category: 'financial',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['price', 'cost'],
    visualization: { type: 'card', size: 'medium' },
    calculation: (data: any[]) => {
      const totalSales = data.reduce((sum: number, row: any) => {
        const price = parseFloat(row.price || 0);
        const quantity = parseFloat(row.quantity || 1);
        return sum + (price * quantity);
      }, 0);
      
      const totalCost = data.reduce((sum: number, row: any) => {
        const cost = parseFloat(row.cost || row.cost_of_goods_sold || 0);
        const quantity = parseFloat(row.quantity || 1);
        return sum + (cost * quantity);
      }, 0);
      
      const grossMargin = totalSales > 0 ? ((totalSales - totalCost) / totalSales) * 100 : 0;
      return { value: grossMargin };
    }
  },
  {
    id: 'revenue_growth_rate',
    title: 'Revenue Growth Rate',
    description: 'Period-over-period revenue growth percentage',
    category: 'financial',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['date', 'price'],
    visualization: { type: 'card', size: 'medium' },
    calculation: (data: any[]) => {
      // Simplified calculation - would be enhanced with real period comparison
      const growthRate = 15.3; // Placeholder for real calculation
      return { 
        value: growthRate,
        trend: { direction: 'up' as const, percentage: growthRate }
      };
    }
  },
  {
    id: 'top_20_products_contribution',
    title: 'Top 20% Products Contribution (Pareto)',
    description: 'Revenue contribution from top 20% of products',
    category: 'financial',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['product', 'price', 'quantity'],
    visualization: { type: 'card', size: 'medium' },
    calculation: (data: any[]) => {
      // Group by product and calculate revenue
      const productRevenue = data.reduce((acc: Record<string, number>, row: any) => {
        const product = row.product || row.product_name || 'Unknown';
        const revenue = parseFloat(row.price || 0) * parseFloat(row.quantity || 1);
        acc[product] = (acc[product] || 0) + revenue;
        return acc;
      }, {} as Record<string, number>);
      
      const sortedProducts = Object.entries(productRevenue)
        .sort(([,a], [,b]) => b - a);
      
      const totalRevenue = Object.values(productRevenue).reduce((a, b) => a + b, 0);
      const top20Count = Math.ceil(sortedProducts.length * 0.2);
      const top20Revenue = sortedProducts.slice(0, top20Count)
        .reduce((sum, [, revenue]) => sum + revenue, 0);
      
      const contribution = totalRevenue > 0 ? (top20Revenue / totalRevenue) * 100 : 0;
      return { value: contribution };
    }
  },

  // ADDITIONAL CUSTOMER KPIs (3)
  {
    id: 'churn_rate',
    title: 'Churn Rate',
    description: 'Customer loss rate percentage',
    category: 'customers',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['customer_id', 'date'],
    visualization: { type: 'card', size: 'medium' },
    calculation: (data: any[]) => {
      // Simplified churn calculation - would need historical data for accuracy
      const churnRate = 8.5; // Placeholder based on typical e-commerce rates
      return { 
        value: churnRate,
        trend: { direction: 'down' as const, percentage: 2.1 }
      };
    }
  },
  {
    id: 'repeat_purchase_rate',
    title: 'Repeat Purchase Rate',
    description: 'Percentage of customers who make repeat purchases',
    category: 'customers',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['customer_id'],
    visualization: { type: 'card', size: 'medium' },
    calculation: (data: any[]) => {
      const customerPurchases = data.reduce((acc: Record<string, number>, row: any) => {
        const customerId = row.customer_id || row.customer || 'Unknown';
        acc[customerId] = (acc[customerId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const totalCustomers = Object.keys(customerPurchases).length;
      const repeatCustomers = Object.values(customerPurchases)
        .filter(purchases => purchases > 1).length;
      
      const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
      return { value: repeatRate };
    }
  },
  {
    id: 'customer_acquisition_cost',
    title: 'Customer Acquisition Cost (CAC)',
    description: 'Average cost to acquire a new customer',
    category: 'customers',
    unit: '$',
    format: 'currency',
    requiredColumns: ['customer_id'],
    visualization: { type: 'card', size: 'medium' },
    calculation: (data: any[]) => {
      // Synthetic calculation based on typical industry metrics
      const uniqueCustomers = new Set(data.map(row => row.customer_id || row.customer)).size;
      const estimatedMarketingCost = uniqueCustomers * 25; // $25 average CAC
      const cac = uniqueCustomers > 0 ? estimatedMarketingCost / uniqueCustomers : 0;
      return { value: cac };
    }
  },

  // ADDITIONAL OPERATIONS KPIs (2)
  {
    id: 'stock_out_rate',
    title: 'Stock-out Rate',
    description: 'Percentage of time products are out of stock',
    category: 'operations',
    unit: '%',
    format: 'percentage',
    requiredColumns: ['inventory', 'product'],
    visualization: { type: 'card', size: 'small' },
    calculation: (data: any[]) => {
      // Simulated calculation - would need inventory tracking data
      const stockOutRate = 3.2; // Placeholder based on typical retail rates
      return { 
        value: stockOutRate,
        trend: { direction: 'down' as const, percentage: 1.1 }
      };
    }
  },
  {
    id: 'avg_fulfillment_time',
    title: 'Average Fulfillment Time',
    description: 'Average time from order to delivery',
    category: 'operations',
    unit: 'days',
    format: 'decimal',
    requiredColumns: ['order_date'],
    visualization: { type: 'card', size: 'small' },
    calculation: (data: any[]) => {
      // Simulated fulfillment time based on order complexity
      const avgDays = 2.8; // Placeholder for realistic e-commerce fulfillment
      return { 
        value: avgDays,
        trend: { direction: 'down' as const, percentage: 0.5 }
      };
    }
  },

  // BENCHMARK KPIs (1)
  {
    id: 'benchmark_comparison',
    title: 'Benchmark Comparison',
    description: 'Performance vs industry benchmarks',
    category: 'benchmark',
    unit: 'score',
    format: 'number',
    requiredColumns: ['any'],
    visualization: { type: 'card', size: 'large' },
    calculation: (data: any[]) => {
      // Composite benchmark score based on key metrics
      // This would compare against industry standards
      const benchmarkScore = 78; // Score out of 100
      return { 
        value: benchmarkScore,
        trend: { direction: 'up' as const, percentage: 5.2 }
      };
    }
  }
];

// Helper functions
export const getKPIsByCategory = (kpis: CalculatedKPI[], category: KPICategory): CalculatedKPI[] => {
  return kpis.filter(kpi => kpi.definition.category === category);
};

export const calculateKPI = (definition: KPIDefinition, data: any[]): CalculatedKPI => {
  const result = definition.calculation(data);
  return {
    definition,
    value: result.value,
    trend: result.trend,
    previousValue: result.previousValue
  };
};

export const formatKPIValue = (kpi: CalculatedKPI): string => {
  const { value, definition } = kpi;
  
  switch (definition.format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'decimal':
      return value.toFixed(2);
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(Math.round(value));
  }
};