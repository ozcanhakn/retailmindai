import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

import { UploadFile } from '../../types';
import { FileValidator } from '../../utils/file-validator';

interface FileItemProps {
  file: UploadFile;
  onRemove: () => void;
}

export const FileItem: React.FC<FileItemProps> = ({ file, onRemove }) => {
  const getStatusIcon = () => {
    switch (file.status) {
      case 'waiting':
        return <FileText className="w-5 h-5 text-gray-400" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case 'waiting':
        return 'Bekliyor...';
      case 'uploading':
        return 'Yükleniyor...';
      case 'processing':
        return 'Veri işleniyor...';
      case 'completed':
        return 'Tamamlandı';
      case 'error':
        return file.error || 'Hata oluştu';
      default:
        return 'Bilinmeyen durum';
    }
  };

  const getStatusColor = () => {
    switch (file.status) {
      case 'waiting':
        return 'text-gray-600';
      case 'uploading':
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFileIcon = () => {
    try {
      const format = FileValidator.getFileFormat(file.file);
      return format === 'csv' ? 
        <FileText className="w-5 h-5 text-blue-500" /> : 
        <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    } catch {
      return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center flex-1 min-w-0">
        {/* File Icon */}
        <div className="flex-shrink-0 mr-3">
          {getFileIcon()}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900 truncate pr-2">
              {file.file.name}
            </h4>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-sm text-gray-500">
                {FileValidator.formatFileSize(file.file.size)}
              </span>
              {file.status === 'completed' && file.processedData && (
                <Badge variant="secondary" className="text-xs">
                  {file.processedData.rows} satır
                </Badge>
              )}
            </div>
          </div>
          
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon()}
              <span className={`text-sm ml-2 ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              {(file.status === 'uploading' || file.status === 'processing') && (
                <span className="text-sm text-gray-500 ml-2">
                  {file.progress}%
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {file.status === 'completed' && (
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          {(file.status === 'uploading' || file.status === 'processing') && (
            <div className="mt-2">
              <Progress value={file.progress} className="h-2" />
            </div>
          )}

          {/* Processed Data Info */}
          {file.status === 'completed' && file.processedData && (
            <div className="mt-2 text-xs text-gray-500 space-x-4">
              <span>{file.processedData.columns} kolon</span>
              <span>{file.processedData.features.length} özellik</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};