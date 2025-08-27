import React, { lazy, Suspense, ComponentType, ReactNode, useState, useEffect, useCallback, useRef, Component } from 'react';

/**
 * Advanced Lazy Loading Service for Performance Optimization
 * Supports component lazy loading, data lazy loading, and intersection observer
 */

export interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  retryCount?: number;
  retryDelay?: number;
  preload?: boolean;
}

export interface LazyComponentOptions extends LazyLoadOptions {
  loading?: ReactNode;
  error?: ReactNode;
  timeout?: number;
}

export interface DataLoadOptions extends LazyLoadOptions {
  deps?: any[];
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

class LazyLoadingService {
  private intersectionObserver: IntersectionObserver | null = null;
  private observedElements = new Map<Element, () => void>();
  private preloadedComponents = new Set<string>();
  private loadingStates = new Map<string, boolean>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initIntersectionObserver();
    }
  }

  /**
   * Create lazy loaded component with error boundary and loading states
   */
  createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: LazyComponentOptions = {}
  ): ComponentType<React.ComponentProps<T>> {
    const LazyComponent = lazy(importFn);
    
    return (props: React.ComponentProps<T>) => {
      return React.createElement(
        Suspense,
        { fallback: options.loading || React.createElement('div', null, 'Loading...') },
        React.createElement(
          ErrorBoundary,
          { 
            fallback: options.error,
            children: React.createElement(LazyComponent, props)
          }
        )
      );
    };
  }

  /**
   * Preload components for better performance
   */
  async preloadComponent(
    importFn: () => Promise<{ default: ComponentType<any> }>,
    key: string
  ): Promise<void> {
    if (this.preloadedComponents.has(key)) {
      return;
    }

    try {
      await importFn();
      this.preloadedComponents.add(key);
      console.log(`Preloaded component: ${key}`);
    } catch (error) {
      console.warn(`Failed to preload component: ${key}`, error);
    }
  }

  /**
   * Batch preload multiple components
   */
  async preloadComponents(components: Array<{
    key: string;
    importFn: () => Promise<{ default: ComponentType<any> }>;
  }>): Promise<void> {
    const promises = components.map(({ key, importFn }) => 
      this.preloadComponent(importFn, key)
    );
    
    await Promise.allSettled(promises);
  }

  /**
   * Observe element for intersection
   */
  observeElement(
    element: Element,
    callback: () => void,
    options: LazyLoadOptions = {}
  ): void {
    if (!this.intersectionObserver) {
      this.initIntersectionObserver(options);
    }

    this.observedElements.set(element, callback);
    this.intersectionObserver?.observe(element);
  }

  /**
   * Stop observing element
   */
  unobserveElement(element: Element): void {
    this.intersectionObserver?.unobserve(element);
    this.observedElements.delete(element);
  }

  /**
   * Initialize intersection observer
   */
  private initIntersectionObserver(options: LazyLoadOptions = {}): void {
    if (typeof window === 'undefined') return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = this.observedElements.get(entry.target);
            if (callback) {
              callback();
              this.unobserveElement(entry.target);
            }
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px'
      }
    );
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    this.observedElements.clear();
    this.preloadedComponents.clear();
    this.loadingStates.clear();
  }
}

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || React.createElement(
        'div',
        { className: 'p-4 bg-red-50 border border-red-200 rounded-lg' },
        React.createElement('h3', { className: 'text-red-800 font-medium' }, 'Failed to load component'),
        React.createElement(
          'p',
          { className: 'text-red-600 text-sm mt-1' },
          this.state.error?.message || 'Unknown error occurred'
        )
      );
    }

    return this.props.children;
  }
}

// Singleton instance
export const lazyLoadingService = new LazyLoadingService();

// React Hooks
export function useLazyLoad<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: DataLoadOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const retryCountRef = useRef(0);

  const loadData = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      retryCountRef.current = 0;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Retry logic
      const maxRetries = options.retryCount || 3;
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = options.retryDelay || 1000 * retryCountRef.current;
        setTimeout(() => loadData(), delay);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, loading, options.retryCount, options.retryDelay]);

  const refetch = useCallback(() => {
    retryCountRef.current = 0;
    return loadData();
  }, [loadData]);

  // Load data when enabled
  useEffect(() => {
    if (options.enabled !== false) {
      loadData();
    }
  }, [loadData, options.enabled, ...(options.deps || [])]);

  // Refetch on window focus
  useEffect(() => {
    if (options.refetchOnWindowFocus) {
      const handleFocus = () => {
        if (data && !loading) {
          loadData();
        }
      };
      
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [data, loading, loadData, options.refetchOnWindowFocus]);

  return { data, loading, error, refetch };
}

export function useIntersectionObserver(
  callback: () => void,
  options: LazyLoadOptions = {}
) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    lazyLoadingService.observeElement(element, callback, options);

    return () => {
      lazyLoadingService.unobserveElement(element);
    };
  }, [callback, options]);

  return elementRef;
}

// Utility functions
export const lazyUtils = {
  // Preload critical components
  preloadCritical: async (components: string[]) => {
    const imports = components.map(component => {
      switch (component) {
        case 'Dashboard':
          return {
            key: 'Dashboard',
            importFn: () => import('@/modules/dashboard/ui/components/advanced-kpi-dashboard')
          };
        case 'AnalysisCharts':
          return {
            key: 'AnalysisCharts',
            importFn: () => import('@/modules/analyze/ui/components/sales-analysis-charts')
          };
        case 'Reports':
          return {
            key: 'Reports',
            importFn: () => import('@/modules/reports/ui/components/report-management')
          };
        default:
          return null;
      }
    }).filter(Boolean) as Array<{
      key: string;
      importFn: () => Promise<{ default: ComponentType<any> }>;
    }>;

    await lazyLoadingService.preloadComponents(imports);
  },

  // Create lazy route component
  createLazyRoute: (importFn: () => Promise<{ default: ComponentType<any> }>) => {
    return lazyLoadingService.createLazyComponent(importFn, {
      loading: React.createElement(
        'div',
        { className: 'flex items-center justify-center min-h-screen' },
        React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' })
      ),
      error: React.createElement(
        'div',
        { className: 'flex items-center justify-center min-h-screen' },
        React.createElement(
          'div',
          { className: 'text-center p-6' },
          React.createElement('h2', { className: 'text-xl font-semibold text-gray-900 mb-2' }, 'Failed to load page'),
          React.createElement('p', { className: 'text-gray-600' }, 'Please try refreshing the page')
        )
      )
    });
  }
};

export default lazyLoadingService;