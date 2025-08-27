'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SortDesc, Star, Grid, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RecentWorkspaces } from '@/components/workspace/recent-workspaces';
import { SavedWorkspace, WorkspaceFilters } from '@/types/workspace';

// Mock data for demonstration
const mockWorkspaces: SavedWorkspace[] = [
  {
    id: '1',
    name: 'Ocak 2024 Satış Analizi',
    description: 'Ocak ayı satış performansı ve trend analizi',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    analysisType: 'sales',
    kpiCount: 15,
    chartCount: 8,
    dataRows: 25000,
    summary: {
      totalSales: 1250000,
      topMetrics: [
        { name: 'Toplam Satış', value: 1250000, type: 'currency' },
        { name: 'Ortalama Sipariş', value: 2777, type: 'currency' },
        { name: 'Müşteri Sayısı', value: 450, type: 'number' },
        { name: 'Dönüşüm Oranı', value: 3.2, type: 'percentage' }
      ]
    },
    tags: ['satış', 'ocak', '2024', 'aylık-rapor'],
    starred: true,
    visibility: 'private',
    data: {
      kpiData: [],
      chartData: [],
      rawData: [],
      filters: {},
      metadata: {}
    }
  },
  {
    id: '2',
    name: 'Müşteri Segmentasyonu Q4',
    description: 'Q4 dönemi müşteri davranışları ve segmentasyon analizi',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    analysisType: 'customer',
    kpiCount: 12,
    chartCount: 6,
    dataRows: 18000,
    summary: {
      topMetrics: [
        { name: 'Aktif Müşteri', value: 380, type: 'number' },
        { name: 'Yeni Müşteri', value: 95, type: 'number' },
        { name: 'Churn Oranı', value: 8.5, type: 'percentage' },
        { name: 'CLV', value: 5200, type: 'currency' }
      ]
    },
    tags: ['müşteri', 'segmentasyon', 'Q4', 'davranış'],
    starred: false,
    visibility: 'team',
    data: {
      kpiData: [],
      chartData: [],
      rawData: [],
      filters: {},
      metadata: {}
    }
  },
  {
    id: '3',
    name: 'Ürün Performans Özeti',
    description: 'En çok satan ürünler ve kategori performansı',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    analysisType: 'product',
    kpiCount: 10,
    chartCount: 5,
    dataRows: 12000,
    summary: {
      topMetrics: [
        { name: 'Toplam Ürün', value: 85, type: 'number' },
        { name: 'Aktif Ürün', value: 68, type: 'number' },
        { name: 'Ortalama Fiyat', value: 245, type: 'currency' },
        { name: 'Stok Devir', value: 4.2, type: 'number' }
      ]
    },
    tags: ['ürün', 'performans', 'stok'],
    starred: true,
    visibility: 'private',
    data: {
      kpiData: [],
      chartData: [],
      rawData: [],
      filters: {},
      metadata: {}
    }
  }
];

export default function RecentAnalysisPage() {
  const [workspaces, setWorkspaces] = useState<SavedWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WorkspaceFilters>({
    search: '',
    analysisType: 'all',
    starred: undefined
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setWorkspaces(mockWorkspaces);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStar = (workspaceId: string) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, starred: !w.starred } : w
    ));
  };

  const handleDelete = (workspaceId: string) => {
    if (confirm('Bu workspace\'i silmek istediğinizden emin misiniz?')) {
      setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    }
  };

  const handleShare = (workspaceId: string) => {
    // TODO: Implement share functionality
    alert('Paylaşım özelliği yakında eklenecek!');
  };

  const filteredWorkspaces = workspaces.filter(workspace => {
    if (filter.search && !workspace.name.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    if (filter.analysisType && filter.analysisType !== 'all' && workspace.analysisType !== filter.analysisType) {
      return false;
    }
    if (filter.starred !== undefined && workspace.starred !== filter.starred) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-100)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-100)' }}>
            Son Analizler
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-200)' }}>
            Kaydettiğiniz workspace'leri ve analizleri görüntüleyin
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-200)' }} />
                    <Input
                      placeholder="Workspace ara..."
                      value={filter.search || ''}
                      onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Analysis Type Filter */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'Tümü' },
                    { value: 'sales', label: 'Satış' },
                    { value: 'customer', label: 'Müşteri' },
                    { value: 'product', label: 'Ürün' },
                    { value: 'region', label: 'Bölgesel' },
                    { value: 'comprehensive', label: 'Kapsamlı' }
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={filter.analysisType === type.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(prev => ({ ...prev, analysisType: type.value as any }))}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant={filter.starred ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(prev => ({ ...prev, starred: prev.starred ? undefined : true }))}
                  >
                    <Star className={`w-4 h-4 mr-1 ${filter.starred ? 'fill-current' : ''}`} />
                    Favoriler
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <span style={{ color: 'var(--text-100)' }}>Workspace Listesi</span>
                  <Badge variant="secondary">
                    {filteredWorkspaces.length} / {workspaces.length}
                  </Badge>
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-200)' }}>
                  <SortDesc className="w-4 h-4" />
                  <span>Son güncellenen</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RecentWorkspaces
                workspaces={filteredWorkspaces}
                loading={loading}
                onStar={handleStar}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}