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

  const generateId = () => Math.random().toString(36).substr(2, 9);

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

  const processFile = async (fileId: string) => {
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
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Veri Upload Center
          </h1>
          <p className="text-gray-600">
            CSV veya Excel dosyalarınızı yükleyin ve analize başlayın. 
            Sistem otomatik olarak verilerinizi işleyecek ve analiz için hazırlayacaktır.
          </p>
        </div>

        {/* Upload Stats */}
        {uploadedFiles.length > 0 && (
          <UploadStatsComponent stats={getUploadStats()} />
        )}

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Dosya Yükleme
            </CardTitle>
            <CardDescription>
              Desteklenen formatlar: CSV, Excel (.xlsx, .xls) • Maksimum boyut: 50MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadArea onFileSelect={handleFileSelect} />
          </CardContent>
        </Card>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Yüklenen Dosyalar ({uploadedFiles.length})
                  </CardTitle>
                  <CardDescription>
                    Dosyalarınızın yükleme ve işleme durumu
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={clearAllFiles}
                  disabled={isProcessing}
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">
                    {uploadedFiles.filter(f => f.status === 'completed').length} dosya analiz için hazır
                  </span>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleStartAnalysis}
                  disabled={isCreatingWorkspace}
                >
                  {isCreatingWorkspace ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Workspace Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Table className="w-4 h-4 mr-2" />
                      Analize Başla
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <h4 className="font-semibold text-gray-900">Otomatik Veri Temizleme</h4>
              </div>
              <p className="text-sm text-gray-600">
                Sistem verilerinizi otomatik olarak temizler, boşlukları doldurur ve analiz için optimize eder.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <h4 className="font-semibold text-gray-900">Kapsamlı Analiz</h4>
              </div>
              <p className="text-sm text-gray-600">
                Mağaza, ürün, müşteri ve zaman bazlı analizler ile detaylı istatistikler elde edin.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <h4 className="font-semibold text-gray-900">AI Chatbot Desteği</h4>
              </div>
              <p className="text-sm text-gray-600">
                Verileriniz hakkında soru sorun ve AI destekli öneriler alın.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};