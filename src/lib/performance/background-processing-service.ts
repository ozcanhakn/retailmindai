/**
 * Background Processing Service for Performance Optimization
 * Implements web workers, task queuing, and progress tracking
 */

export interface TaskOptions {
  priority?: 'low' | 'normal' | 'high';
  timeout?: number;
  retries?: number;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (result: any) => void;
}

export interface Task {
  id: string;
  type: string;
  payload: any;
  options: TaskOptions;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: any;
  error?: Error;
  progress: number;
  retryCount: number;
}

export interface ProcessingStats {
  totalTasks: number;
  pendingTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageProcessingTime: number;
  queueLength: number;
  workerCount: number;
  memoryUsage: number;
}

class BackgroundProcessingService {
  private workers: Worker[] = [];
  private taskQueue: Task[] = [];
  private activeTasks = new Map<string, Task>();
  private completedTasks = new Map<string, Task>();
  private maxWorkers: number = 4;
  private maxRetries: number = 3;
  private taskIdCounter = 0;
  private processingStats: ProcessingStats = {
    totalTasks: 0,
    pendingTasks: 0,
    runningTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageProcessingTime: 0,
    queueLength: 0,
    workerCount: 0,
    memoryUsage: 0
  };

  constructor(options: { maxWorkers?: number; maxRetries?: number } = {}) {
    this.maxWorkers = options.maxWorkers || Math.max(2, navigator.hardwareConcurrency - 1);
    this.maxRetries = options.maxRetries || 3;
    
    this.initializeWorkers();
    this.startQueueProcessor();
  }

  /**
   * Add task to processing queue
   */
  async addTask<T>(
    type: string,
    payload: any,
    options: TaskOptions = {}
  ): Promise<T> {
    const taskId = this.generateTaskId();
    
    const task: Task = {
      id: taskId,
      type,
      payload,
      options: {
        priority: 'normal',
        timeout: 30000, // 30 seconds default
        retries: this.maxRetries,
        ...options
      },
      status: 'pending',
      createdAt: Date.now(),
      progress: 0,
      retryCount: 0
    };

    // Add to queue with priority sorting
    this.insertTaskByPriority(task);
    this.updateStats();

    // Return promise that resolves when task completes
    return new Promise((resolve, reject) => {
      const checkCompletion = () => {
        const completedTask = this.completedTasks.get(taskId);
        if (completedTask) {
          if (completedTask.status === 'completed') {
            resolve(completedTask.result);
          } else if (completedTask.status === 'failed') {
            reject(completedTask.error);
          }
          return;
        }

        // Check if task still exists (not cancelled)
        const activeTask = this.activeTasks.get(taskId);
        const queuedTask = this.taskQueue.find(t => t.id === taskId);
        
        if (!activeTask && !queuedTask) {
          reject(new Error('Task was cancelled'));
          return;
        }

        // Continue checking
        setTimeout(checkCompletion, 100);
      };

      checkCompletion();
    });
  }

  /**
   * Cancel task by ID
   */
  cancelTask(taskId: string): boolean {
    // Remove from queue
    const queueIndex = this.taskQueue.findIndex(t => t.id === taskId);
    if (queueIndex >= 0) {
      const task = this.taskQueue[queueIndex];
      task.status = 'cancelled';
      this.taskQueue.splice(queueIndex, 1);
      this.completedTasks.set(taskId, task);
      this.updateStats();
      return true;
    }

    // Cancel running task
    const activeTask = this.activeTasks.get(taskId);
    if (activeTask) {
      activeTask.status = 'cancelled';
      this.activeTasks.delete(taskId);
      this.completedTasks.set(taskId, activeTask);
      this.updateStats();
      return true;
    }

    return false;
  }

  /**
   * Get task status and progress
   */
  getTask(taskId: string): Task | null {
    return (
      this.activeTasks.get(taskId) ||
      this.completedTasks.get(taskId) ||
      this.taskQueue.find(t => t.id === taskId) ||
      null
    );
  }

  /**
   * Get all tasks with optional filtering
   */
  getTasks(filter?: {
    status?: Task['status'];
    type?: string;
    limit?: number;
  }): Task[] {
    const allTasks = [
      ...this.taskQueue,
      ...Array.from(this.activeTasks.values()),
      ...Array.from(this.completedTasks.values())
    ];

    let filteredTasks = allTasks;

    if (filter?.status) {
      filteredTasks = filteredTasks.filter(t => t.status === filter.status);
    }

    if (filter?.type) {
      filteredTasks = filteredTasks.filter(t => t.type === filter.type);
    }

    if (filter?.limit) {
      filteredTasks = filteredTasks.slice(0, filter.limit);
    }

    return filteredTasks.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get processing statistics
   */
  getStats(): ProcessingStats {
    return { ...this.processingStats };
  }

  /**
   * Process data analysis task
   */
  async processDataAnalysis(data: any[], options: TaskOptions = {}): Promise<any> {
    return this.addTask('dataAnalysis', { data }, {
      ...options,
      priority: 'high'
    });
  }

  /**
   * Process report generation task
   */
  async processReportGeneration(template: any, data: any, options: TaskOptions = {}): Promise<any> {
    return this.addTask('reportGeneration', { template, data }, {
      ...options,
      priority: 'normal',
      timeout: 60000 // 1 minute for reports
    });
  }

  /**
   * Process chart data calculation
   */
  async processChartCalculation(chartConfig: any, rawData: any[], options: TaskOptions = {}): Promise<any> {
    return this.addTask('chartCalculation', { chartConfig, rawData }, {
      ...options,
      priority: 'high'
    });
  }

  /**
   * Process file export task
   */
  async processFileExport(exportConfig: any, data: any, options: TaskOptions = {}): Promise<any> {
    return this.addTask('fileExport', { exportConfig, data }, {
      ...options,
      priority: 'normal',
      timeout: 45000 // 45 seconds for exports
    });
  }

  /**
   * Cleanup completed and failed tasks
   */
  cleanupTasks(olderThanHours: number = 24): number {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [id, task] of this.completedTasks) {
      if ((task.completedAt || task.createdAt) < cutoffTime) {
        this.completedTasks.delete(id);
        cleaned++;
      }
    }

    this.updateStats();
    return cleaned;
  }

  // Private methods

  private generateTaskId(): string {
    return `task_${++this.taskIdCounter}_${Date.now()}`;
  }

  private insertTaskByPriority(task: Task): void {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const taskPriority = priorityOrder[task.options.priority || 'normal'];

    let insertIndex = this.taskQueue.length;
    for (let i = 0; i < this.taskQueue.length; i++) {
      const queueTaskPriority = priorityOrder[this.taskQueue[i].options.priority || 'normal'];
      if (taskPriority < queueTaskPriority) {
        insertIndex = i;
        break;
      }
    }

    this.taskQueue.splice(insertIndex, 0, task);
  }

  private async initializeWorkers(): Promise<void> {
    // Create worker blob for processing tasks
    const workerScript = `
      // Web Worker for background processing
      self.onmessage = async function(e) {
        const { taskId, type, payload, options } = e.data;
        
        try {
          let result;
          let progress = 0;
          
          // Report initial progress
          self.postMessage({ taskId, type: 'progress', progress: 0 });
          
          switch (type) {
            case 'dataAnalysis':
              result = await processDataAnalysis(payload.data, (p) => {
                progress = p;
                self.postMessage({ taskId, type: 'progress', progress });
              });
              break;
              
            case 'reportGeneration':
              result = await processReportGeneration(payload.template, payload.data, (p) => {
                progress = p;
                self.postMessage({ taskId, type: 'progress', progress });
              });
              break;
              
            case 'chartCalculation':
              result = await processChartCalculation(payload.chartConfig, payload.rawData, (p) => {
                progress = p;
                self.postMessage({ taskId, type: 'progress', progress });
              });
              break;
              
            case 'fileExport':
              result = await processFileExport(payload.exportConfig, payload.data, (p) => {
                progress = p;
                self.postMessage({ taskId, type: 'progress', progress });
              });
              break;
              
            default:
              throw new Error('Unknown task type: ' + type);
          }
          
          self.postMessage({ taskId, type: 'complete', result });
          
        } catch (error) {
          self.postMessage({ 
            taskId, 
            type: 'error', 
            error: error.message || 'Unknown error' 
          });
        }
      };
      
      // Processing functions
      async function processDataAnalysis(data, progressCallback) {
        const total = data.length;
        let processed = 0;
        const results = [];
        
        for (const item of data) {
          // Simulate processing
          await new Promise(resolve => setTimeout(resolve, 10));
          
          // Process item (placeholder logic)
          results.push({
            ...item,
            processed: true,
            timestamp: Date.now()
          });
          
          processed++;
          progressCallback(Math.round((processed / total) * 100));
        }
        
        return {
          processedData: results,
          summary: {
            totalItems: total,
            processedItems: processed,
            processingTime: Date.now()
          }
        };
      }
      
      async function processReportGeneration(template, data, progressCallback) {
        progressCallback(10);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        progressCallback(30);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        progressCallback(60);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        progressCallback(90);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        progressCallback(100);
        
        return {
          reportId: 'report_' + Date.now(),
          template: template.name,
          dataSize: data.length,
          generatedAt: new Date().toISOString(),
          downloadUrl: '/api/reports/download/' + Date.now()
        };
      }
      
      async function processChartCalculation(chartConfig, rawData, progressCallback) {
        const total = rawData.length;
        let processed = 0;
        const chartData = [];
        
        for (const item of rawData) {
          // Calculate chart points
          chartData.push({
            x: item.date || item.timestamp,
            y: item.value || item.amount,
            label: item.label || item.name
          });
          
          processed++;
          progressCallback(Math.round((processed / total) * 100));
          
          // Small delay to prevent blocking
          if (processed % 100 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
          }
        }
        
        return {
          chartType: chartConfig.type,
          data: chartData,
          aggregations: {
            total: chartData.reduce((sum, item) => sum + (item.y || 0), 0),
            average: chartData.length > 0 ? chartData.reduce((sum, item) => sum + (item.y || 0), 0) / chartData.length : 0,
            count: chartData.length
          }
        };
      }
      
      async function processFileExport(exportConfig, data, progressCallback) {
        progressCallback(15);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        progressCallback(45);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        progressCallback(75);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        progressCallback(95);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        progressCallback(100);
        
        return {
          fileId: 'export_' + Date.now(),
          format: exportConfig.format,
          size: data.length * 100, // Simulated file size
          downloadUrl: '/api/exports/download/' + Date.now(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
      }
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    for (let i = 0; i < this.maxWorkers; i++) {
      try {
        const worker = new Worker(workerUrl);
        worker.onmessage = this.handleWorkerMessage.bind(this);
        worker.onerror = this.handleWorkerError.bind(this);
        this.workers.push(worker);
      } catch (error) {
        console.warn('Failed to create worker:', error);
      }
    }

    URL.revokeObjectURL(workerUrl);
    this.updateStats();
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { taskId, type, progress, result, error } = event.data;
    const task = this.activeTasks.get(taskId);
    
    if (!task) return;

    switch (type) {
      case 'progress':
        task.progress = progress;
        task.options.onProgress?.(progress);
        break;
        
      case 'complete':
        task.status = 'completed';
        task.result = result;
        task.completedAt = Date.now();
        task.progress = 100;
        this.activeTasks.delete(taskId);
        this.completedTasks.set(taskId, task);
        task.options.onComplete?.(result);
        break;
        
      case 'error':
        task.error = new Error(error);
        this.handleTaskError(task);
        break;
    }

    this.updateStats();
  }

  private handleWorkerError(event: ErrorEvent): void {
    console.error('Worker error:', event.error);
  }

  private handleTaskError(task: Task): void {
    task.retryCount++;
    
    if (task.retryCount < (task.options.retries || this.maxRetries)) {
      // Retry task
      task.status = 'pending';
      task.progress = 0;
      this.activeTasks.delete(task.id);
      this.insertTaskByPriority(task);
    } else {
      // Task failed permanently
      task.status = 'failed';
      task.completedAt = Date.now();
      this.activeTasks.delete(task.id);
      this.completedTasks.set(task.id, task);
      task.options.onError?.(task.error!);
    }
    
    this.updateStats();
  }

  private startQueueProcessor(): void {
    const processQueue = () => {
      // Process pending tasks
      while (this.taskQueue.length > 0 && this.activeTasks.size < this.maxWorkers) {
        const task = this.taskQueue.shift()!;
        this.processTask(task);
      }
      
      // Schedule next processing cycle
      setTimeout(processQueue, 100);
    };

    processQueue();
  }

  private processTask(task: Task): void {
    const availableWorker = this.workers.find(worker => {
      // Find idle worker (simplified - in real implementation you'd track worker states)
      return true;
    });

    if (!availableWorker) {
      // No available worker, put task back in queue
      this.taskQueue.unshift(task);
      return;
    }

    task.status = 'running';
    task.startedAt = Date.now();
    this.activeTasks.set(task.id, task);

    // Setup timeout
    if (task.options.timeout) {
      setTimeout(() => {
        if (this.activeTasks.has(task.id)) {
          task.error = new Error('Task timeout');
          this.handleTaskError(task);
        }
      }, task.options.timeout);
    }

    // Send task to worker
    availableWorker.postMessage({
      taskId: task.id,
      type: task.type,
      payload: task.payload,
      options: task.options
    });

    this.updateStats();
  }

  private updateStats(): void {
    const totalTasks = this.taskQueue.length + this.activeTasks.size + this.completedTasks.size;
    const completedTasks = Array.from(this.completedTasks.values()).filter(t => t.status === 'completed').length;
    const failedTasks = Array.from(this.completedTasks.values()).filter(t => t.status === 'failed').length;
    
    let totalProcessingTime = 0;
    let processedCount = 0;
    
    for (const task of this.completedTasks.values()) {
      if (task.status === 'completed' && task.startedAt && task.completedAt) {
        totalProcessingTime += task.completedAt - task.startedAt;
        processedCount++;
      }
    }

    this.processingStats = {
      totalTasks,
      pendingTasks: this.taskQueue.length,
      runningTasks: this.activeTasks.size,
      completedTasks,
      failedTasks,
      averageProcessingTime: processedCount > 0 ? totalProcessingTime / processedCount : 0,
      queueLength: this.taskQueue.length,
      workerCount: this.workers.length,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    const taskSize = 1000; // Estimated bytes per task
    return (this.taskQueue.length + this.activeTasks.size + this.completedTasks.size) * taskSize;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Terminate all workers
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    
    // Clear all tasks
    this.taskQueue = [];
    this.activeTasks.clear();
    this.completedTasks.clear();
  }
}

// Singleton instance
export const backgroundProcessingService = new BackgroundProcessingService();

// Utility functions and hooks
export const processingUtils = {
  // Create processing task with automatic retry
  createTask: <T>(
    type: string,
    payload: any,
    options: TaskOptions = {}
  ): Promise<T> => {
    return backgroundProcessingService.addTask<T>(type, payload, options);
  },

  // Process multiple tasks in parallel
  processBatch: async <T>(
    tasks: Array<{ type: string; payload: any; options?: TaskOptions }>
  ): Promise<T[]> => {
    const promises = tasks.map(({ type, payload, options }) =>
      backgroundProcessingService.addTask<T>(type, payload, options)
    );
    
    return Promise.all(promises);
  },

  // Get processing statistics
  getStats: () => backgroundProcessingService.getStats(),

  // Monitor task progress
  monitorTask: (taskId: string, onUpdate: (task: Task | null) => void) => {
    const interval = setInterval(() => {
      const task = backgroundProcessingService.getTask(taskId);
      onUpdate(task);
      
      if (task && ['completed', 'failed', 'cancelled'].includes(task.status)) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }
};

export default backgroundProcessingService;