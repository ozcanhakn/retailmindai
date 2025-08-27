"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload,
  File,
  CheckCircle,
  AlertTriangle,
  X,
  FileText,
  Database,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  onKPIsDetected: (kpis: any[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
}

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  preview?: {
    rows: number;
    columns: string[];
    sampleData: Record<string, any>[];
  };
}

export const AdvancedFileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  onKPIsDetected,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.csv', '.xlsx', '.xls'],
  className
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
    }
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `File type ${extension} not supported. Please upload ${acceptedTypes.join(', ')} files`;
    }
    
    return null;
  };

  const processFile = async (file: File): Promise<UploadedFile> => {
    const id = generateId();
    const uploadedFile: UploadedFile = {
      file,
      id,
      status: 'uploading',
      progress: 0
    };

    try {
      // Simulate file processing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        uploadedFile.progress = i;
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: i } : f));
      }

      // Parse CSV (simplified)
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, '')) || [];
      
      const sampleData = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, any> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      uploadedFile.preview = {
        rows: lines.length - 1,
        columns: headers,
        sampleData
      };

      uploadedFile.status = 'success';
      return uploadedFile;
    } catch (error) {
      uploadedFile.status = 'error';
      uploadedFile.error = error instanceof Error ? error.message : 'Failed to process file';
      return uploadedFile;
    }
  };

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList);
    
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsProcessing(true);

    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        continue;
      }

      const uploadedFile: UploadedFile = {
        file,
        id: generateId(),
        status: 'uploading',
        progress: 0
      };

      setFiles(prev => [...prev, uploadedFile]);
      
      const processedFile = await processFile(file);
      setFiles(prev => prev.map(f => f.id === processedFile.id ? processedFile : f));
    }

    setIsProcessing(false);
    
    // Trigger callbacks
    const successfulFiles = files.filter(f => f.status === 'success').map(f => f.file);
    if (successfulFiles.length > 0) {
      onFilesUploaded(successfulFiles);
      // Mock KPI detection
      onKPIsDetected([
        { id: 'total_revenue', available: true },
        { id: 'avg_order_value', available: true },
        { id: 'total_orders', available: true }
      ]);
    }
  }, [files, maxFiles, onFilesUploaded, onKPIsDetected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return <FileText className="h-8 w-8 text-green-600" />;
      case 'xlsx':
      case 'xls':
        return <Database className="h-8 w-8 text-blue-600" />;
      default:
        return <File className="h-8 w-8 text-gray-600" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragging 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className={cn(
              "h-12 w-12 mb-4",
              isDragging ? "text-blue-600" : "text-gray-400"
            )} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Your Data Files
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Drag and drop your CSV or Excel files here, or click to browse
            </p>
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant="outline">CSV</Badge>
              <Badge variant="outline">Excel</Badge>
              <Badge variant="outline">Max {Math.round(maxSize / 1024 / 1024)}MB</Badge>
            </div>
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                Choose Files
              </Button>
            </label>
          </CardContent>
        </Card>
      </motion.div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
            
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.file.name)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-900 truncate">
                            {file.file.name}
                          </h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                          <span>{(file.file.size / 1024).toFixed(1)} KB</span>
                          {file.preview && (
                            <>
                              <span>•</span>
                              <span>{file.preview.rows.toLocaleString()} rows</span>
                              <span>•</span>
                              <span>{file.preview.columns.length} columns</span>
                            </>
                          )}
                        </div>

                        {file.status === 'uploading' && (
                          <div className="space-y-2">
                            <Progress value={file.progress} className="h-2" />
                            <span className="text-xs text-gray-500">
                              Processing... {file.progress}%
                            </span>
                          </div>
                        )}

                        {file.status === 'success' && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-700">
                              Successfully processed
                            </span>
                          </div>
                        )}

                        {file.status === 'error' && (
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-xs text-red-700">
                              {file.error || 'Processing failed'}
                            </span>
                          </div>
                        )}

                        {/* File Preview */}
                        {file.preview && file.status === 'success' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 p-3 bg-gray-50 rounded-md"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <BarChart3 className="h-4 w-4 text-blue-600" />
                              <span className="text-xs font-medium text-gray-700">Data Preview</span>
                            </div>
                            
                            <div className="text-xs text-gray-600 mb-2">
                              Columns: {file.preview.columns.slice(0, 5).join(', ')}
                              {file.preview.columns.length > 5 && ` +${file.preview.columns.length - 5} more`}
                            </div>
                            
                            {file.preview.sampleData.length > 0 && (
                              <div className="text-xs text-gray-500">
                                Sample: {JSON.stringify(file.preview.sampleData[0]).slice(0, 100)}...
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};