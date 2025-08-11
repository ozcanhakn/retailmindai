// src/modules/upload/ui/components/upload-area.tsx

'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadAreaProps {
  onFileSelect: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ 
  onFileSelect, 
  disabled = false 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!disabled && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  }, [onFileSelect, disabled]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200
        ${isDragOver && !disabled
          ? 'border-blue-400 bg-blue-50' 
          : disabled
          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-4">
        {/* Icon */}
        <div className="mx-auto">
          {isDragOver && !disabled ? (
            <FileText className="w-12 h-12 text-blue-500" />
          ) : (
            <Upload className={`w-12 h-12 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
          )}
        </div>

        {/* Text */}
        <div>
          <h3 className={`text-xl font-semibold mb-2 ${
            disabled ? 'text-gray-400' : 'text-gray-700'
          }`}>
            {isDragOver && !disabled 
              ? 'Dosyaları bırakın' 
              : 'Dosyalarınızı buraya sürükleyin'
            }
          </h3>
          <p className={`text-sm mb-6 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
            veya dosya seçmek için tıklayın
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload"
            disabled={disabled}
          />
          
          <Button asChild disabled={disabled}>
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center cursor-pointer ${
                disabled ? 'cursor-not-allowed' : ''
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Dosya Seç
            </label>
          </Button>
        </div>

        {/* Format Info */}
        <div className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-400'}`}>
          Desteklenen formatlar: CSV, Excel (.xlsx, .xls) • Maksimum boyut: 50MB • Maksimum 10 dosya
        </div>
      </div>

      {/* Drag Overlay */}
      {isDragOver && !disabled && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-50 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center">
          <div className="text-blue-600 font-medium">
            Dosyaları buraya bırakın
          </div>
        </div>
      )}
    </div>
  );
};