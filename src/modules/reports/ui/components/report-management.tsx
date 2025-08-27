'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Calendar,
  Download,
  Settings,
  Clock,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  Eye,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import reportGeneratorInstance, { type ReportTemplate, type ScheduledReport, type GeneratedReport } from '../../services/report-generator';

const reportGenerator = reportGeneratorInstance;

interface ReportManagementProps {
  className?: string;
}

export function ReportManagement({ className }: ReportManagementProps) {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTemplates(reportGenerator.getAllTemplates());
    setScheduledReports(reportGenerator.getAllScheduledReports());
    // Note: In a real app, this would be loaded from API
    setGeneratedReports([]);
  };

  const handleGenerateReport = async (templateId: string) => {
    setIsGenerating(true);
    try {
      const report = await reportGenerator.generateReport(templateId);
      setGeneratedReports(prev => [report, ...prev]);
      // Show success notification
    } catch (error) {
      console.error('Report generation failed:', error);
      // Show error notification
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dashboard': return BarChart3;
      case 'analytics': return TrendingUp;
      case 'sales': return DollarSign;
      case 'kpi': return PieChart;
      default: return FileText;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600' : 'text-gray-400';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Report Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Create, schedule, and manage automated reports
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => loadData()}
          >
            <Clock className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create Report Template</DialogTitle>
              </DialogHeader>
              <TemplateCreator onSave={(template) => {
                const newTemplate = reportGenerator.createTemplate(template);
                setTemplates(prev => [...prev, newTemplate]);
                setShowCreateDialog(false);
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Templates',
            value: templates.length.toString(),
            icon: FileText,
            color: 'from-blue-500 to-cyan-500'
          },
          {
            title: 'Scheduled Reports',
            value: scheduledReports.filter(r => r.isActive).length.toString(),
            icon: Calendar,
            color: 'from-green-500 to-emerald-500'
          },
          {
            title: 'Generated Today',
            value: generatedReports.filter(r => 
              new Date(r.generatedAt).toDateString() === new Date().toDateString()
            ).length.toString(),
            icon: Download,
            color: 'from-purple-500 to-pink-500'
          },
          {
            title: 'Total Downloads',
            value: generatedReports.length.toString(),
            icon: TrendingUp,
            color: 'from-yellow-500 to-orange-500'
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Report Dashboard</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="kpi">KPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="generated">Generated</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredTemplates.map((template, index) => {
                    const IconComponent = getTypeIcon(template.type);
                    return (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                  <IconComponent className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {template.name}
                                  </h3>
                                  <Badge variant="secondary" className="mt-1">
                                    {template.type}
                                  </Badge>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleGenerateReport(template.id)}>
                                    <Play className="w-4 h-4 mr-2" />
                                    Generate Now
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Template
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                              {template.description}
                            </p>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Sections:</span>
                                <span className="font-medium">{template.sections.length}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Format:</span>
                                <Badge variant="outline">{template.format}</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Layout:</span>
                                <span className="font-medium capitalize">{template.layout}</span>
                              </div>
                            </div>
                            
                            <div className="mt-6 flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleGenerateReport(template.id)}
                                disabled={isGenerating}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              >
                                {isGenerating ? (
                                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4 mr-2" />
                                )}
                                Generate
                              </Button>
                              <Button size="sm" variant="outline">
                                <Calendar className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="mt-6">
              <div className="space-y-4">
                {scheduledReports.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Scheduled Reports
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Create your first scheduled report to automate report generation
                    </p>
                  </div>
                ) : (
                  scheduledReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-full ${report.isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <Clock className={`w-5 h-5 ${getStatusColor(report.isActive)}`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {report.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {report.description || 'No description'}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <Badge variant={report.isActive ? 'default' : 'secondary'}>
                                    {report.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {report.schedule.type} at {report.schedule.time}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Next: {new Date(report.nextGeneration).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                {report.isActive ? (
                                  <>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Schedule
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Edit Recipients
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Template
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="generated" className="mt-6">
              <div className="space-y-4">
                {generatedReports.length === 0 ? (
                  <div className="text-center py-12">
                    <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Generated Reports
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Generate your first report from a template to see it here
                    </p>
                  </div>
                ) : (
                  generatedReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                                <FileText className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {report.name}
                                </h3>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Generated: {new Date(report.generatedAt).toLocaleString()}
                                  </span>
                                  <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                                  <span className="text-xs text-gray-500">
                                    {(report.fileSize / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Template Creator Component
function TemplateCreator({ onSave }: { onSave: (template: any) => void }) {
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    type: 'dashboard' as const,
    layout: 'portrait' as const,
    format: 'both' as const,
    sections: []
  });

  const handleSave = () => {
    onSave(templateData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Template Name</label>
          <Input
            value={templateData.name}
            onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
            placeholder="Enter template name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <Select
            value={templateData.type}
            onValueChange={(value: any) => setTemplateData({ ...templateData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="kpi">KPI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Input
          value={templateData.description}
          onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
          placeholder="Enter template description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Layout</label>
          <Select
            value={templateData.layout}
            onValueChange={(value: any) => setTemplateData({ ...templateData, layout: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <Select
            value={templateData.format}
            onValueChange={(value: any) => setTemplateData({ ...templateData, format: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF Only</SelectItem>
              <SelectItem value="excel">Excel Only</SelectItem>
              <SelectItem value="both">Both Formats</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave}>Create Template</Button>
      </div>
    </div>
  );
}

export default ReportManagement;