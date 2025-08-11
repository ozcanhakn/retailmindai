// src/modules/upload/ui/components/upload-stats.tsx

'use client';

import React from 'react';
import { Files, CheckCircle, HardDrive, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { UploadStats } from '../../types';
import { FileValidator } from '../../utils/file-validator';

interface UploadStatsProps {
  stats: UploadStats;
}

export const UploadStatsComponent: React.FC<UploadStatsProps> = ({ stats }) => {
  const completionPercentage = stats.totalFiles > 0 
    ? Math.round((stats.completedFiles / stats.totalFiles) * 100) 
    : 0;
    
  const sizePercentage = stats.totalSize > 0 
    ? Math.round((stats.processedSize / stats.totalSize) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Files */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Dosya</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
            </div>
            <Files className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Completed Files */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedFiles}</p>
              <div className="flex items-center mt-2">
                <Progress value={completionPercentage} className="h-2 flex-1 mr-2" />
                <span className="text-xs text-gray-500">{completionPercentage}%</span>
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Total Size */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Boyut</p>
              <p className="text-2xl font-bold text-gray-900">
                {FileValidator.formatFileSize(stats.totalSize)}
              </p>
            </div>
            <HardDrive className="w-8 h-8 text-gray-500" />
          </div>
        </CardContent>
      </Card>

      {/* Processed Size */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">İşlenen Boyut</p>
              <p className="text-2xl font-bold text-purple-600">
                {FileValidator.formatFileSize(stats.processedSize)}
              </p>
              <div className="flex items-center mt-2">
                <Progress value={sizePercentage} className="h-2 flex-1 mr-2" />
                <span className="text-xs text-gray-500">{sizePercentage}%</span>
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};