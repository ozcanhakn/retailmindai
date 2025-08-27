"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar,
  Filter,
  X,
  Search,
  CalendarIcon,
  MapPin,
  Package,
  Users,
  DollarSign
} from 'lucide-react';

export interface FilterState {
  dateRange: {
    start?: Date;
    end?: Date;
  };
  categories: string[];
  regions: string[];
  products: string[];
  channels: string[];
  customerSegments: string[];
  priceRange: {
    min?: number;
    max?: number;
  };
  searchQuery: string;
}

export interface AvailableFilters {
  categories: string[];
  regions: string[];
  products: string[];
  channels: string[];
  customerSegments: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

interface AnalyticsFiltersProps {
  initialFilters: FilterState;
  availableFilters: AvailableFilters;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  initialFilters,
  availableFilters,
  onFiltersChange,
  className = ""
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const categories = checked 
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    updateFilters({ categories });
  };

  const handleRegionChange = (region: string, checked: boolean) => {
    const regions = checked 
      ? [...filters.regions, region]
      : filters.regions.filter(r => r !== region);
    updateFilters({ regions });
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      dateRange: {},
      categories: [],
      regions: [],
      products: [],
      channels: [],
      customerSegments: [],
      priceRange: {},
      searchQuery: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`w-80 bg-white border-r border-gray-200 h-full overflow-y-auto ${className}`}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-blue-600" />
            Filters
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search products, customers..."
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Date Range */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Date Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="start-date" className="text-xs">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                onChange={(e) => updateFilters({
                  dateRange: {
                    ...filters.dateRange,
                    start: e.target.value ? new Date(e.target.value) : undefined
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-xs">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                onChange={(e) => updateFilters({
                  dateRange: {
                    ...filters.dateRange,
                    end: e.target.value ? new Date(e.target.value) : undefined
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableFilters.categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableFilters.regions.map((region) => (
                <div key={region} className="flex items-center space-x-2">
                  <Checkbox
                    id={`region-${region}`}
                    checked={filters.regions.includes(region)}
                    onCheckedChange={(checked) => 
                      handleRegionChange(region, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`region-${region}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {region}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableFilters.customerSegments.map((segment) => (
                <div key={segment} className="flex items-center space-x-2">
                  <Checkbox
                    id={`segment-${segment}`}
                    checked={filters.customerSegments.includes(segment)}
                    onCheckedChange={(checked) => {
                      const segments = checked 
                        ? [...filters.customerSegments, segment]
                        : filters.customerSegments.filter(s => s !== segment);
                      updateFilters({ customerSegments: segments });
                    }}
                  />
                  <Label 
                    htmlFor={`segment-${segment}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {segment}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Price Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="min-price" className="text-xs">Min Price</Label>
              <Input
                id="min-price"
                type="number"
                placeholder="$0"
                value={filters.priceRange.min || ''}
                onChange={(e) => updateFilters({
                  priceRange: {
                    ...filters.priceRange,
                    min: e.target.value ? parseFloat(e.target.value) : undefined
                  }
                })}
              />
            </div>
            <div>
              <Label htmlFor="max-price" className="text-xs">Max Price</Label>
              <Input
                id="max-price"
                type="number"
                placeholder="$10,000"
                value={filters.priceRange.max || ''}
                onChange={(e) => updateFilters({
                  priceRange: {
                    ...filters.priceRange,
                    max: e.target.value ? parseFloat(e.target.value) : undefined
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Filters Summary */}
        {(filters.categories.length > 0 || filters.regions.length > 0 || filters.searchQuery) && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-800">Active Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filters.categories.length > 0 && (
                  <div className="text-xs text-blue-700">
                    <strong>Categories:</strong> {filters.categories.join(', ')}
                  </div>
                )}
                {filters.regions.length > 0 && (
                  <div className="text-xs text-blue-700">
                    <strong>Regions:</strong> {filters.regions.join(', ')}
                  </div>
                )}
                {filters.searchQuery && (
                  <div className="text-xs text-blue-700">
                    <strong>Search:</strong> "{filters.searchQuery}"
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full mt-2 text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
};