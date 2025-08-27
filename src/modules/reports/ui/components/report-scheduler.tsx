'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Mail,
  Settings,
  Users,
  Bell,
  CheckCircle,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import reportGeneratorInstance, { type ReportTemplate, type ReportSchedule } from '../../services/report-generator';

interface ReportSchedulerProps {
  templates: ReportTemplate[];
  onScheduleCreated?: (schedule: any) => void;
}

export function ReportScheduler({ templates, onScheduleCreated }: ReportSchedulerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [scheduleName, setScheduleName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleType, setScheduleType] = useState<'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly'>('daily');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [isActive, setIsActive] = useState(true);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'both'>('pdf');
  const [timezone, setTimezone] = useState('UTC');

  const reportGenerator = reportGeneratorInstance;

  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const schedule: ReportSchedule = {
      type: scheduleType,
      time: scheduleTime,
      dayOfWeek: scheduleType === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: scheduleType === 'monthly' ? dayOfMonth : undefined,
      timezone
    };

    const scheduledReport = reportGenerator.scheduleReport({
      templateId: selectedTemplate,
      name: scheduleName,
      description,
      schedule,
      recipients: recipients.filter(r => r.trim() !== ''),
      isActive,
      format,
      includeAttachments
    });

    onScheduleCreated?.(scheduledReport);
    
    // Reset form
    setSelectedTemplate('');
    setScheduleName('');
    setDescription('');
    setRecipients(['']);
  };

  const getNextRunDate = () => {
    if (!scheduleType || !scheduleTime) return null;
    
    const schedule: ReportSchedule = {
      type: scheduleType,
      time: scheduleTime,
      dayOfWeek: scheduleType === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: scheduleType === 'monthly' ? dayOfMonth : undefined,
      timezone
    };

    // This would use the calculateNextGeneration method from ReportGenerator
    // For now, we'll show a placeholder
    const now = new Date();
    switch (scheduleType) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek;
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  const nextRun = getNextRunDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Schedule New Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template">Report Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Schedule Name</Label>
                  <Input
                    id="name"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    placeholder="e.g., Weekly Sales Report"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this scheduled report"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={format} onValueChange={(value: any) => setFormat(value)}>
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="active">Active Schedule</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="attachments"
                    checked={includeAttachments}
                    onCheckedChange={setIncludeAttachments}
                  />
                  <Label htmlFor="attachments">Include Attachments</Label>
                </div>

                {nextRun && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        Next Run: {nextRun.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Schedule Configuration</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Istanbul">Istanbul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {scheduleType === 'weekly' && (
                <div className="mt-4">
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scheduleType === 'monthly' && (
                <div className="mt-4">
                  <Label htmlFor="dayOfMonth">Day of Month</Label>
                  <Select value={dayOfMonth.toString()} onValueChange={(value) => setDayOfMonth(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Recipients */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Email Recipients</span>
              </h3>
              
              <div className="space-y-3">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="email"
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      placeholder="recipient@example.com"
                      className="flex-1"
                    />
                    {recipients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRecipient(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRecipient}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Recipient
                </Button>
              </div>
            </div>

            {/* Schedule Summary */}
            {selectedTemplate && scheduleName && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Schedule Summary</span>
                </h3>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Template:</span>
                    <Badge variant="outline">
                      {templates.find(t => t.id === selectedTemplate)?.name}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Frequency:</span>
                    <span className="text-sm font-medium capitalize">{scheduleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Time:</span>
                    <span className="text-sm font-medium">{scheduleTime} {timezone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Recipients:</span>
                    <span className="text-sm font-medium">
                      {recipients.filter(r => r.trim() !== '').length} people
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Format:</span>
                    <Badge variant="outline">{format.toUpperCase()}</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!selectedTemplate || !scheduleName || recipients.filter(r => r.trim() !== '').length === 0}
              >
                Create Schedule
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ReportScheduler;