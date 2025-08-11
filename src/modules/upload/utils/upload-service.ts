interface UploadResponse {
  success: boolean;
  fileId?: string;
  message?: string;
  error?: string;
  metadata?: {
    filename: string;
    size: number;
    type: string;
    uploadTime: string;
    userId: string;
  };
}

interface ProcessResponse {
  success: boolean;
  fileId?: string;
  processedData?: any;
  message?: string;
  error?: string;
}

interface StatusResponse {
  success: boolean;
  fileId?: string;
  status?: string;
  progress?: number;
  message?: string;
  error?: string;
}

export class UploadService {
  private static BASE_URL = '/api/files';

  static async uploadFile(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'Dosya yükleme hatası'
      };
    }
  }

  static async processFile(fileId: string): Promise<ProcessResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Process error:', error);
      return {
        success: false,
        error: 'Veri işleme hatası'
      };
    }
  }

  static async checkStatus(fileId: string): Promise<StatusResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/status/${fileId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      return {
        success: false,
        error: 'Durum kontrolü hatası'
      };
    }
  }

  static async uploadAndProcess(file: File, onProgress?: (progress: number, status: string) => void): Promise<{
    success: boolean;
    fileId?: string;
    processedData?: any;
    error?: string;
  }> {
    try {
      // Step 1: Upload file
      onProgress?.(0, 'uploading');
      const uploadResult = await this.uploadFile(file);
      
      if (!uploadResult.success || !uploadResult.fileId) {
        return {
          success: false,
          error: uploadResult.error || 'Upload failed'
        };
      }

      onProgress?.(50, 'uploading');

      // Step 2: Process file
      onProgress?.(0, 'processing');
      const processResult = await this.processFile(uploadResult.fileId);
      
      if (!processResult.success) {
        return {
          success: false,
          fileId: uploadResult.fileId,
          error: processResult.error || 'Processing failed'
        };
      }

      onProgress?.(100, 'completed');

      return {
        success: true,
        fileId: uploadResult.fileId,
        processedData: processResult.processedData
      };

    } catch (error) {
      console.error('Upload and process error:', error);
      return {
        success: false,
        error: 'İşlem hatası'
      };
    }
  }
}