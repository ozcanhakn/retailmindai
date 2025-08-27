"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  FileText, 
  Home, 
  Upload,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  Target,
  PieChart,
  LineChart,
  Activity,
  Calendar,
  Filter,
  Download,
  Settings,
  Database,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Workspace {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  totalRows: number;
  totalSize: number;
  createdAt: string;
  files: Array<{
    id: string;
    fileName: string;
    status: string;
  }>;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  expanded?: boolean;
}

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

export function AnalyticsSidebar() {
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['analytics', 'overview'])
  );

  const navigationSections: NavSection[] = [
    {
      id: 'main',
      title: 'Main Menu',
      icon: Home,
      items: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          href: '/',
          icon: Home,
          description: 'Main dashboard overview'
        },
        {
          id: 'upload',
          title: 'Data Upload',
          href: '/upload',
          icon: Upload,
          description: 'Upload CSV files'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      expanded: true,
      items: [
        {
          id: 'overview',
          title: 'Overview',
          href: '/analytics/overview',
          icon: PieChart,
          badge: '8 KPIs',
          description: 'Key performance indicators'
        },
        {
          id: 'sales',
          title: 'Sales Analytics',
          href: '/analytics/sales',
          icon: TrendingUp,
          badge: '12 KPIs',
          description: 'Revenue and sales metrics'
        },
        {
          id: 'customers',
          title: 'Customer Analytics',
          href: '/analytics/customers',
          icon: Users,
          badge: '10 KPIs',
          description: 'Customer behavior insights'
        },
        {
          id: 'operations',
          title: 'Operations',
          href: '/analytics/operations',
          icon: Package,
          badge: '8 KPIs',
          description: 'Operational efficiency'
        },
        {
          id: 'forecast',
          title: 'Forecasting',
          href: '/analytics/forecast',
          icon: Target,
          badge: '5 KPIs',
          description: 'Predictive analytics'
        }
      ]
    },
    {
      id: 'tools',
      title: 'Tools',
      icon: Settings,
      items: [
        {
          id: 'filters',
          title: 'Filters',
          href: '/analytics/filters',
          icon: Filter,
          description: 'Data filtering options'
        },
        {
          id: 'export',
          title: 'Export',
          href: '/analytics/export',
          icon: Download,
          description: 'Export reports'
        },
        {
          id: 'settings',
          title: 'Settings',
          href: '/settings',
          icon: Settings,
          description: 'Application settings and theme configuration'
        }
      ]
    }
  ];

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      const data = await response.json();
      if (data.success) {
        setWorkspaces(data.workspaces);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="flex h-full w-72 flex-col border-r shadow-sm" style={{ backgroundColor: 'var(--bg-200)', borderColor: 'var(--bg-300)', color: 'var(--text-100)' }}>
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6" style={{ borderColor: 'var(--bg-300)' }}>
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--primary-100)' }}>
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-lg" style={{ color: 'var(--text-100)' }}>RetailMind</span>
            <div className="text-xs" style={{ color: 'var(--text-200)' }}>Analytics Dashboard</div>
          </div>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-6">
          {/* Navigation Sections */}
          {navigationSections.map((section) => (
            <div key={section.id} className="space-y-3">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <section.icon className="h-4 w-4" />
                  <span>{section.title}</span>
                </span>
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.has(section.id) && (
                  <motion.nav
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {section.items.map((item) => (
                      <Link key={item.id} href={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant={pathname === item.href ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start h-auto p-3 text-left",
                              pathname === item.href 
                                ? "bg-blue-50 text-blue-700 border-blue-200" 
                                : "hover:bg-gray-50 text-gray-700"
                            )}
                          >
                            <div className="flex items-center space-x-3 w-full">
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{item.title}</span>
                                  {item.badge && (
                                    <Badge 
                                      variant="secondary" 
                                      className="text-xs px-2 py-0 h-5"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                      </Link>
                    ))}
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>
          ))}

          <Separator />

          {/* Active Workspaces */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Workspaces
              </h3>
              <Badge variant="outline" className="text-xs">
                {workspaces.length}
              </Badge>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : workspaces.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No workspaces found
              </div>
            ) : (
              <div className="space-y-2">
                {workspaces.slice(0, 3).map((workspace) => (
                  <motion.div
                    key={workspace.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative bg-gray-50 rounded-lg border border-gray-200 p-3 hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <Link href={`/analyze/${workspace.id}`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <Database className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {workspace.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {workspace.fileCount} files
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {workspace.totalRows.toLocaleString()} rows
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatDate(workspace.createdAt)}
                            </span>
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                              {formatFileSize(workspace.totalSize)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                
                {workspaces.length > 3 && (
                  <Link href="/workspaces">
                    <Button variant="ghost" className="w-full text-xs text-gray-500 h-8">
                      View all {workspaces.length} workspaces
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }} className="rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="h-4 w-4" style={{ color: '#B4C2DC' }} />
              <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Quick Stats</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#B4C2DC' }}>Total KPIs</span>
                <span className="font-medium" style={{ color: '#FFFFFF' }}>43</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#B4C2DC' }}>Categories</span>
                <span className="font-medium" style={{ color: '#FFFFFF' }}>5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#B4C2DC' }}>Data Sources</span>
                <span className="font-medium" style={{ color: '#FFFFFF' }}>{workspaces.length}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}