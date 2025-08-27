import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Star, Tag, Eye, EyeOff, Users, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SaveWorkspaceRequest } from '@/types/workspace';

interface SaveWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workspace: SaveWorkspaceRequest) => Promise<void>;
  analysisData: {
    kpiData: any[];
    chartData: any[];
    rawData: any[];
    filters: any;
    metadata: any;
  };
  defaultName?: string;
  loading?: boolean;
}

export const SaveWorkspaceModal: React.FC<SaveWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  analysisData,
  defaultName = '',
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: defaultName,
    description: '',
    tags: [] as string[],
    visibility: 'private' as 'private' | 'team' | 'public'
  });
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        ...formData,
        analysisData
      });
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        tags: [],
        visibility: 'private'
      });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'team':
        return <Users className="w-4 h-4" />;
      case 'public':
        return <Eye className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return 'Sadece siz görebilir ve düzenleyebilirsiniz';
      case 'team':
        return 'Takım üyeleriniz görüntüleyebilir';
      case 'public':
        return 'Herkes görüntüleyebilir (salt okunur)';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center space-x-2">
              <Save className="w-5 h-5" style={{ color: 'var(--primary-100)' }} />
              <span style={{ color: 'var(--text-100)' }}>Analizi Kaydet</span>
            </DialogTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Analysis Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-100)' }}>
                  Analiz Özeti
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span style={{ color: 'var(--text-200)' }}>KPI Sayısı:</span>
                    <span className="ml-2 font-medium" style={{ color: 'var(--text-100)' }}>
                      {analysisData.kpiData?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-200)' }}>Grafik Sayısı:</span>
                    <span className="ml-2 font-medium" style={{ color: 'var(--text-100)' }}>
                      {analysisData.chartData?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-200)' }}>Veri Satırı:</span>
                    <span className="ml-2 font-medium" style={{ color: 'var(--text-100)' }}>
                      {analysisData.rawData?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-200)' }}>Dosya:</span>
                    <span className="ml-2 font-medium" style={{ color: 'var(--text-100)' }}>
                      {analysisData.metadata?.fileName || 'Bilinmiyor'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Workspace Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="name" className="text-sm font-medium" style={{ color: 'var(--text-100)' }}>
              Workspace Adı *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ör: Ocak 2024 Satış Analizi"
              required
              className="w-full"
            />
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="description" className="text-sm font-medium" style={{ color: 'var(--text-100)' }}>
              Açıklama (Opsiyonel)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Bu analiz hakkında kısa bir açıklama..."
              rows={3}
              className="w-full"
            />
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <Label className="text-sm font-medium" style={{ color: 'var(--text-100)' }}>
              Etiketler
            </Label>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Etiket ekle..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                <Tag className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-1 cursor-pointer hover:bg-red-100"
                    onClick={() => removeTag(tag)}
                  >
                    <span>{tag}</span>
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>

          {/* Visibility */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <Label className="text-sm font-medium" style={{ color: 'var(--text-100)' }}>
              Görünürlük
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: 'private', label: 'Özel', desc: 'Sadece siz görebilir ve düzenleyebilirsiniz' },
                { value: 'team', label: 'Takım', desc: 'Takım üyeleriniz görüntüleyebilir' },
                { value: 'public', label: 'Herkese Açık', desc: 'Herkes görüntüleyebilir (salt okunur)' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    formData.visibility === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    backgroundColor: formData.visibility === option.value ? 'var(--primary-100)/10' : 'var(--bg-200)',
                    borderColor: formData.visibility === option.value ? 'var(--primary-100)' : 'var(--bg-300)'
                  }}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={formData.visibility === option.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as any }))}
                    className="sr-only"
                  />
                  <div style={{ color: formData.visibility === option.value ? 'var(--primary-100)' : 'var(--text-200)' }}>
                    {getVisibilityIcon(option.value)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: 'var(--text-100)' }}>{option.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-200)' }}>{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex space-x-3 pt-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={saving}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!formData.name.trim() || saving}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};