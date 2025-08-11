// src/modules/upload/utils/file-validator.ts

import { FileValidationResult, FileFormat, FileMetadata } from '../types';

const ALLOWED_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
] as const;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES_COUNT = 10;

export class FileValidator {
  static validateFile(file: File): FileValidationResult {
    // Type validation
    if (!ALLOWED_TYPES.includes(file.type as any)) {
      return {
        isValid: false,
        error: 'Sadece CSV ve Excel (.xlsx, .xls) dosyaları desteklenmektedir'
      };
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'Dosya boyutu 50MB\'ı geçemez'
      };
    }

    // Empty file validation
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'Boş dosya yüklenemez'
      };
    }

    return { isValid: true };
  }

  static validateFileList(files: FileList | File[]): {
    validFiles: File[];
    invalidFiles: Array<{ file: File; error: string }>;
  } {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const invalidFiles: Array<{ file: File; error: string }> = [];

    // Count validation
    if (fileArray.length > MAX_FILES_COUNT) {
      return {
        validFiles: [],
        invalidFiles: fileArray.map(file => ({
          file,
          error: `Tek seferde maksimum ${MAX_FILES_COUNT} dosya yükleyebilirsiniz`
        }))
      };
    }

    // Individual file validation
    fileArray.forEach(file => {
      const validation = this.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, error: validation.error! });
      }
    });

    return { validFiles, invalidFiles };
  }

  static getFileFormat(file: File): FileFormat {
    const type = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (type === 'text/csv' || extension === 'csv') return 'csv';
    if (type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || extension === 'xlsx') return 'xlsx';
    if (type === 'application/vnd.ms-excel' || extension === 'xls') return 'xls';

    throw new Error('Unsupported file format');
  }

  static extractFileMetadata(file: File): FileMetadata {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      format: this.getFileFormat(file),
      lastModified: file.lastModified
    };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}