'use client';

import PerformanceMonitor from '@/modules/performance/ui/components/performance-monitor';

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto px-6 py-8">
        <PerformanceMonitor />
      </div>
    </div>
  );
}