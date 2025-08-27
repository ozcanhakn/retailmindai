// src/modules/analytics/utils/kpi-detector.ts

import { KPI_DEFINITIONS, KPIDefinition, CalculatedKPI } from '../types/kpi-definitions';

export interface ColumnMapping {
  detectedColumn: string;
  requiredColumn: string;
  confidence: number;
  dataType: 'string' | 'number' | 'date' | 'boolean';
}

export interface KPIDetectionResult {
  availableKPIs: CalculatedKPI[];
  columnMappings: ColumnMapping[];
  coverage: {
    total: number;
    available: number;
    percentage: number;
  };
  recommendations: string[];
}

class KPIDetector {
  // Common column name variations for different data types
  private columnMappings = {
    // Revenue/Price related
    price: ['price', 'amount', 'revenue', 'total', 'value', 'cost', 'sales'],
    quantity: ['quantity', 'qty', 'count', 'units', 'items'],
    
    // Order related
    order_id: ['order_id', 'order', 'id', 'transaction_id', 'trans_id'],
    order_date: ['order_date', 'date', 'created_at', 'timestamp', 'order_time'],
    
    // Customer related
    customer_id: ['customer_id', 'customer', 'user_id', 'client_id'],
    customer_age: ['customer_age', 'age'],
    customer_segment: ['customer_segment', 'segment', 'tier', 'category'],
    customer_type: ['customer_type', 'type', 'new_customer', 'returning'],
    
    // Product related
    product: ['product', 'product_name', 'item', 'sku', 'product_id'],
    category: ['category', 'product_category', 'type', 'group'],
    
    // Geographic
    region: ['region', 'country', 'state', 'location', 'area'],
    customer_region: ['customer_region', 'region', 'location'],
    
    // Channel
    channel: ['channel', 'source', 'platform', 'method'],
    
    // Status
    status: ['status', 'state', 'order_status']
  };

  detectColumnMappings(csvColumns: string[], sampleData: any[]): ColumnMapping[] {
    const mappings: ColumnMapping[] = [];
    const normalizedColumns = csvColumns.map(col => col.toLowerCase().trim());

    for (const [requiredColumn, variations] of Object.entries(this.columnMappings)) {
      let bestMatch: ColumnMapping | null = null;
      let highestConfidence = 0;

      for (let i = 0; i < normalizedColumns.length; i++) {
        const column = normalizedColumns[i];
        const originalColumn = csvColumns[i];
        
        // Calculate confidence based on string similarity
        const confidence = this.calculateColumnSimilarity(column, variations);
        
        if (confidence > highestConfidence && confidence > 0.5) {
          const dataType = this.detectDataType(sampleData, originalColumn);
          
          bestMatch = {
            detectedColumn: originalColumn,
            requiredColumn,
            confidence,
            dataType
          };
          highestConfidence = confidence;
        }
      }

      if (bestMatch) {
        mappings.push(bestMatch);
      }
    }

    return mappings;
  }

  detectAvailableKPIs(data: any[], columnMappings: ColumnMapping[]): KPIDetectionResult {
    const availableColumns = new Set(columnMappings.map(m => m.requiredColumn));
    const availableKPIs: CalculatedKPI[] = [];
    const recommendations: string[] = [];

    // Check each KPI definition
    for (const definition of KPI_DEFINITIONS) {
      const hasRequiredColumns = definition.requiredColumns.every((col: string) => 
        availableColumns.has(col)
      );

      if (hasRequiredColumns) {
        try {
          // Calculate the KPI with sample data
          const result = definition.calculation(data);
          availableKPIs.push({
            definition,
            value: result.value,
            trend: result.trend,
            previousValue: result.previousValue
          });
        } catch (error) {
          recommendations.push(
            `KPI "${definition.title}" requires valid data in columns: ${definition.requiredColumns.join(', ')}`
          );
        }
      } else {
        const missingColumns = definition.requiredColumns.filter((col: string) => 
          !availableColumns.has(col)
        );
        
        if (missingColumns.length <= 2) { // Only suggest if few columns missing
          recommendations.push(
            `Add columns [${missingColumns.join(', ')}] to enable "${definition.title}" KPI`
          );
        }
      }
    }

    // Generate coverage statistics
    const coverage = {
      total: KPI_DEFINITIONS.length,
      available: availableKPIs.length,
      percentage: (availableKPIs.length / KPI_DEFINITIONS.length) * 100
    };

    // Add general recommendations
    if (coverage.percentage < 50) {
      recommendations.unshift(
        "Consider adding more standard e-commerce columns to increase KPI coverage"
      );
    }

    if (!availableColumns.has('date') && !availableColumns.has('order_date')) {
      recommendations.push(
        "Add date columns to enable time-based analytics and trending"
      );
    }

    return {
      availableKPIs,
      columnMappings,
      coverage,
      recommendations: recommendations.slice(0, 5) // Limit to top 5 recommendations
    };
  }

  private calculateColumnSimilarity(column: string, variations: string[]): number {
    let maxSimilarity = 0;

    for (const variation of variations) {
      // Exact match
      if (column === variation) {
        return 1.0;
      }

      // Contains match
      if (column.includes(variation) || variation.includes(column)) {
        maxSimilarity = Math.max(maxSimilarity, 0.8);
      }

      // Levenshtein distance similarity
      const distance = this.levenshteinDistance(column, variation);
      const maxLength = Math.max(column.length, variation.length);
      const similarity = 1 - (distance / maxLength);
      
      if (similarity > 0.6) {
        maxSimilarity = Math.max(maxSimilarity, similarity * 0.7);
      }
    }

    return maxSimilarity;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private detectDataType(sampleData: any[], columnName: string): 'string' | 'number' | 'date' | 'boolean' {
    if (!sampleData.length || !columnName) return 'string';

    const samples = sampleData
      .map(row => row[columnName])
      .filter(val => val !== null && val !== undefined && val !== '')
      .slice(0, 10);

    if (samples.length === 0) return 'string';

    let numberCount = 0;
    let dateCount = 0;
    let booleanCount = 0;

    for (const sample of samples) {
      const str = String(sample).toLowerCase().trim();

      // Check if it's a number
      if (!isNaN(Number(str)) && !isNaN(parseFloat(str))) {
        numberCount++;
      }

      // Check if it's a date
      const dateObj = new Date(str);
      if (!isNaN(dateObj.getTime()) && str.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/)) {
        dateCount++;
      }

      // Check if it's boolean
      if (['true', 'false', '1', '0', 'yes', 'no'].includes(str)) {
        booleanCount++;
      }
    }

    const total = samples.length;
    
    if (numberCount / total > 0.8) return 'number';
    if (dateCount / total > 0.8) return 'date';
    if (booleanCount / total > 0.8) return 'boolean';
    
    return 'string';
  }

  // Method to get KPI suggestions based on available columns
  getKPISuggestions(availableColumns: string[]): KPIDefinition[] {
    const normalizedColumns = availableColumns.map(col => col.toLowerCase());
    const suggestions: KPIDefinition[] = [];

    for (const definition of KPI_DEFINITIONS) {
      const matchingColumns = definition.requiredColumns.filter((reqCol: string) => {
        const variations = this.columnMappings[reqCol as keyof typeof this.columnMappings] || [reqCol];
        return variations.some((variation: string) => 
          normalizedColumns.some((col: string) => col.includes(variation) || variation.includes(col))
        );
      });

      // Suggest KPIs where we have at least 50% of required columns
      if (matchingColumns.length >= definition.requiredColumns.length * 0.5) {
        suggestions.push(definition);
      }
    }

    return suggestions.sort((a, b) => b.requiredColumns.length - a.requiredColumns.length);
  }
}

export const kpiDetector = new KPIDetector();
