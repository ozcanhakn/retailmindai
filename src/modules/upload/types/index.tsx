// src/modules/upload/types/index.ts

export interface UploadFile {
  id: string;
  file: File;
  status: 'waiting' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  processedData?: {
    rows: number;
    columns: number;
    preview: Record<string, any>[];
    features: string[];
  };
}

export interface UploadStats {
  totalFiles: number;
  completedFiles: number;
  totalSize: number;
  processedSize: number;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ProcessingStep {
  step: string;
  description: string;
  progress: number;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export type FileFormat = 'csv' | 'xlsx' | 'xls';

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  format: FileFormat;
  lastModified: number;
}