import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Star, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Share, 
  Download,
  BarChart3,
  Users,
  Package,
  MapPin,
  Activity,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SavedWorkspace, WorkspaceFilter, WorkspaceStats } from '@/types/workspace';
import Link from 'next/link';

interface RecentWorkspacesProps {
  workspaces: SavedWorkspace[];
  loading?: boolean;
  onStar?: (workspaceId: string) => void;
  onDelete?: (workspaceId: string) => void;
  onShare?: (workspaceId: string) => void;
}

export const RecentWorkspaces: React.FC<RecentWorkspacesProps> = ({
  workspaces,
  loading = false,
  onStar,
  onDelete,
  onShare
}) => {
  const [filter, setFilter] = useState<WorkspaceFilter>({ sortBy: 'updatedAt', sortOrder: 'desc' });
  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(null);

  const getAnalysisIcon = (analysisType: SavedWorkspace['analysisType']) => {
    switch (analysisType) {
      case 'sales':
        return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'customer':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'product':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'region':
        return <MapPin className="w-4 h-4 text-orange-500" />;
      case 'comprehensive':
        return <Activity className="w-4 h-4 text-red-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAnalysisTypeLabel = (analysisType: SavedWorkspace['analysisType']) => {
    switch (analysisType) {
      case 'sales':
        return 'Satış';
      case 'customer':
        return 'Müşteri';
      case 'product':
        return 'Ürün';
      case 'region':
        return 'Bölgesel';
      case 'comprehensive':
        return 'Kapsamlı';
      default:
        return 'Analiz';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatValue = (value: number | string, type: 'currency' | 'number' | 'percentage' | 'text' | 'count') => {
    switch (type) {
      case 'currency':
        return `₺${typeof value === 'number' ? value.toLocaleString('tr-TR') : value}`;
      case 'percentage':
        return `${value}%`;
      case 'number':
      case 'count':
        return typeof value === 'number' ? value.toLocaleString('tr-TR') : value;
      default:
        return value;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32" />
                      <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-100)' }}>
          Henüz kayıtlı workspace yok
        </h3>
        <p className="text-sm mt-2" style={{ color: 'var(--text-200)' }}>
          İlk analizinizi yapın ve kaydedin
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-100)' }}>
                {workspaces.length}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-200)' }}>
                Toplam Workspace
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-100)' }}>
                {workspaces.filter(w => w.starred).length}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-200)' }}>
                Favoriler
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workspace List */}
      <div className="space-y-3">
        <AnimatePresence>
          {workspaces.slice(0, 10).map((workspace, index) => (
            <motion.div
              key={workspace.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Analysis Type Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getAnalysisIcon(workspace.analysisType)}
                      </div>
                      
                      {/* Workspace Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Link 
                            href={`/analyze/${workspace.id}`}
                            className="font-medium hover:underline truncate"
                            style={{ color: 'var(--text-100)' }}
                          >
                            {workspace.name}
                          </Link>
                          {workspace.starred && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3 text-xs mb-2" style={{ color: 'var(--text-200)' }}>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(workspace.updatedAt)}</span>
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {getAnalysisTypeLabel(workspace.analysisType)}
                          </Badge>
                        </div>
                        
                        {/* Quick Metrics */}
                        <div className="flex items-center space-x-3 text-xs" style={{ color: 'var(--text-200)' }}>
                          <span>{workspace.kpiCount} KPI</span>
                          <span>•</span>
                          <span>{workspace.chartCount} Grafik</span>
                          <span>•</span>
                          <span>{workspace.dataRows.toLocaleString('tr-TR')} Satır</span>
                        </div>
                        
                        {/* Tags */}
                        {workspace.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {workspace.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {workspace.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{workspace.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onStar && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStar(workspace.id);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Star className={`w-3 h-3 ${workspace.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                        </Button>
                      )}
                      
                      {onShare && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShare(workspace.id);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Share className="w-3 h-3 text-gray-400" />
                        </Button>
                      )}
                      
                      <Link href={`/analyze/${workspace.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-3 h-3 text-gray-400" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedWorkspace === workspace.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--bg-300)' }}
                    >
                      {workspace.description && (
                        <p className="text-sm mb-3" style={{ color: 'var(--text-200)' }}>
                          {workspace.description}
                        </p>
                      )}
                      
                      {/* Top Metrics */}
                      {workspace.summary.topMetrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {workspace.summary.topMetrics.slice(0, 4).map((metric, metricIndex) => (
                            <div key={metricIndex} className="text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-200)' }}>
                              <div className="text-sm font-medium" style={{ color: 'var(--text-100)' }}>
                                {formatValue(metric.value, metric.type || 'text')}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-200)' }}>
                                {metric.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {workspaces.length > 10 && (
        <div className="text-center">
          <Link href="/dashboard/recent">
            <Button variant="outline" className="w-full">
              Tümünü Görüntüle ({workspaces.length})
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};