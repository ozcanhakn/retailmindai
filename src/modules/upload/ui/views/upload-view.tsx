'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Table, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { UploadFile, UploadStats } from '../../types';
import { FileValidator } from '../../utils/file-validator';
import { AnalyzeService } from '@/modules/analyze/utils/analyze-service';
import { UploadArea } from '../components/upload-area';
import { FileList } from '../components/file-list';
import { UploadStatsComponent } from '../components/upload-stats';

export const UploadView: React.FC = () => {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const { validFiles, invalidFiles } = FileValidator.validateFileList(files);

    // Invalid dosyalar için error state'i oluştur
    const errorFiles: UploadFile[] = invalidFiles.map(({ file, error }) => ({
      id: generateId(),
      file,
      status: 'error',
      progress: 0,
      error
    }));

    // Valid dosyalar için waiting state'i oluştur
    const newFiles: UploadFile[] = validFiles.map(file => ({
      id: generateId(),
      file,
      status: 'waiting',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...errorFiles, ...newFiles]);

    // Valid dosyaları process etmeye başla
    newFiles.forEach(uploadFile => {
      setTimeout(() => processFile(uploadFile.id), 500);
    });
  }, []);

  const processFile = useCallback(async (fileId: string) => {
    const updateFileStatus = (
      status: UploadFile['status'], 
      progress: number, 
      error?: string,
      processedData?: UploadFile['processedData']
    ) => {
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId 
          ? { ...f, status, progress, error, processedData }
          : f
        )
      );
    };

    try {
      setIsProcessing(true);

      // Upload aşaması (simulated)
      updateFileStatus('uploading', 0);
      
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateFileStatus('uploading', i);
      }

      // Processing aşaması (simulated)
      updateFileStatus('processing', 0);
      
      const processingSteps = [
        { progress: 20, delay: 800 },  // Reading file
        { progress: 40, delay: 1200 }, // Data cleaning
        { progress: 60, delay: 1000 }, // Feature extraction
        { progress: 80, delay: 900 },  // Validation
        { progress: 100, delay: 600 }  // Finalization
      ];

      for (const step of processingSteps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        updateFileStatus('processing', step.progress);
      }

      // Mock processed data
      const processedData = {
        rows: Math.floor(Math.random() * 10000) + 1000,
        columns: Math.floor(Math.random() * 20) + 5,
        preview: [],
        features: ['date', 'product', 'sales', 'region', 'customer']
      };

      updateFileStatus('completed', 100, undefined, processedData);
    } catch (error) {
      updateFileStatus('error', 0, 'İşleme sırasında hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const clearAllFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const handleStartAnalysis = async () => {
    try {
      setIsCreatingWorkspace(true);
  
      const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
      if (completedFiles.length === 0) {
        alert("Analiz için önce en az bir dosya yüklemelisiniz.");
        return;
      }
  
      // Dosyaları sırayla yükleyelim ve yüklenen dosya id'lerini toplayalım
      const uploadedFileIds: string[] = [];
  
      for (const fileObj of completedFiles) {
        const formData = new FormData();
        formData.append("file", fileObj.file);
  
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
  
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Dosya yükleme hatası");
          return;
        }
        // Backend'den dönen id'yi al
        uploadedFileIds.push(data.uploadedFile.id);
      }
  
      alert(`${uploadedFileIds.length} dosya başarıyla yüklendi!`);
  
      // Workspace oluştur
      const workspaceResponse = await AnalyzeService.createWorkspace({
        name: `Analiz - ${new Date().toLocaleDateString('tr-TR')}`,
        description: `${uploadedFileIds.length} dosya ile oluşturulan analiz workspace'i`,
        fileIds: uploadedFileIds,
      });
  
      if (workspaceResponse.success && workspaceResponse.workspace) {
        router.push(`/dashboard/analyze/${workspaceResponse.workspace.id}`);
      } else {
        throw new Error("Workspace oluşturulamadı");
      }
    } catch (error) {
      console.error("Start analysis error:", error);
      alert("Analiz başlatılırken bir hata oluştu.");
    } finally {
      setIsCreatingWorkspace(false);
    }
  };
  
  
  

  const getUploadStats = (): UploadStats => {
    const totalFiles = uploadedFiles.length;
    const completedFiles = uploadedFiles.filter(f => f.status === 'completed').length;
    const totalSize = uploadedFiles.reduce((sum, f) => sum + f.file.size, 0);
    const processedSize = uploadedFiles
      .filter(f => f.status === 'completed')
      .reduce((sum, f) => sum + f.file.size, 0);

    return { totalFiles, completedFiles, totalSize, processedSize };
  };

  const canStartAnalysis = uploadedFiles.some(f => f.status === 'completed');

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#1A1F2B' }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#B4C2DC' }}>
            Veri Upload Center
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: '#B4C2DC' }}>
            CSV veya Excel dosyalarınızı yükleyin ve analize başlayın. 
            Sistem otomatik olarak verilerinizi işleyecek ve analiz için hazırlayacaktır.
          </p>
        </div>

        {/* Upload Stats */}
        {uploadedFiles.length > 0 && (
          <div key="upload-stats">
            <UploadStatsComponent stats={getUploadStats()} />
          </div>
        )}

        {/* Upload Area */}
        <Card style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#B4C2DC' }}>
              <Upload className="w-5 h-5" />
              Dosya Yükleme
            </CardTitle>
            <CardDescription style={{ color: '#B4C2DC' }}>
              Desteklenen formatlar: CSV, Excel (.xlsx, .xls) • Maksimum boyut: 50MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadArea onFileSelect={handleFileSelect} />
          </CardContent>
        </Card>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <Card key="file-list" style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle style={{ color: '#B4C2DC' }}>
                    Yüklenen Dosyalar ({uploadedFiles.length})
                  </CardTitle>
                  <CardDescription style={{ color: '#B4C2DC' }}>
                    Dosyalarınızın yükleme ve işleme durumu
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={clearAllFiles}
                  disabled={isProcessing}
                  className="border-gray-600 hover:bg-gray-700"
                  style={{ color: '#B4C2DC', borderColor: '#3a4050' }}
                >
                  Tümünü Temizle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FileList 
                files={uploadedFiles}
                onRemoveFile={removeFile}
              />
            </CardContent>
          </Card>
        )}

        {/* Action Section */}
        {canStartAnalysis && (
          <Card key="action-section" style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm" style={{ color: '#B4C2DC' }}>
                    {uploadedFiles.filter(f => f.status === 'completed').length} dosya analiz için hazır
                  </span>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleStartAnalysis}
                  disabled={isCreatingWorkspace}
                >
                  <div className="flex items-center">
                    {isCreatingWorkspace ? (
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Table className="w-4 h-4 mr-2" />
                    )}
                    <span>
                      {isCreatingWorkspace ? 'Workspace Oluşturuluyor...' : 'Analize Başla'}
                    </span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
            <CardContent className="pt-6">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <h4 className="font-semibold" style={{ color: '#B4C2DC' }}>Otomatik Veri Temizleme</h4>
              </div>
              <p className="text-sm" style={{ color: '#B4C2DC' }}>
                Sistem verilerinizi otomatik olarak temizler, boşlukları doldurur ve analiz için optimize eder.
              </p>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
            <CardContent className="pt-6">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <h4 className="font-semibold" style={{ color: '#B4C2DC' }}>Kapsamlı Analiz</h4>
              </div>
              <p className="text-sm" style={{ color: '#B4C2DC' }}>
                Mağaza, ürün, müşteri ve zaman bazlı analizler ile detaylı istatistikler elde edin.
              </p>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
            <CardContent className="pt-6">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <h4 className="font-semibold" style={{ color: '#B4C2DC' }}>AI Chatbot Desteği</h4>
              </div>
              <p className="text-sm" style={{ color: '#B4C2DC' }}>
                Verileriniz hakkında soru sorun ve AI destekli öneriler alın.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};