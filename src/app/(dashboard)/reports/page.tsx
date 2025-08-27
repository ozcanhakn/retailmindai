'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, FileText, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ReportManagement from '@/modules/reports/ui/components/report-management';
import ReportScheduler from '@/modules/reports/ui/components/report-scheduler';
import reportGeneratorInstance from '@/modules/reports/services/report-generator';

const reportGenerator = reportGeneratorInstance;

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('management');
  const [showScheduler, setShowScheduler] = useState(false);
  const [templates, setTemplates] = useState(reportGenerator.getAllTemplates());

  const handleScheduleCreated = (schedule: any) => {
    setShowScheduler(false);
    setActiveTab('management'); // Switch back to management view
    // Optionally refresh data or show success message
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Report Center
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                Create, schedule, and manage automated reports for your business insights
              </p>
            </div>
            <div className="flex space-x-3">
              <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Schedule Automated Report</DialogTitle>
                  </DialogHeader>
                  <ReportScheduler 
                    templates={templates}
                    onScheduleCreated={handleScheduleCreated}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-96">
              <TabsTrigger value="management" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Management</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="management">
              <ReportManagement />
            </TabsContent>

            <TabsContent value="analytics">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Report Analytics Coming Soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Detailed analytics about report generation, usage patterns, and performance metrics will be available here.
                  </p>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="settings">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Report Settings Coming Soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Configure global report settings, email templates, and default styling options.
                  </p>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}