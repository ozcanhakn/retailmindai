"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  FileText, 
  Home, 
  MessageSquare, 
  Settings, 
  Upload,
  Trash2,
  FolderOpen,
  Calendar,
  CreditCard,
  PieChart,
  Activity,
  Palette
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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

export function Sidebar() {
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Workspace yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    if (!confirm('Bu workspace\'i silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces?id=${workspaceId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
        alert('Workspace başarıyla silindi');
      } else {
        alert('Workspace silme hatası: ' + data.error);
      }
    } catch (error) {
      console.error('Workspace silme hatası:', error);
      alert('Workspace silinirken hata oluştu');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <span className="font-semibold text-lg">RetailMind AI</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-4">
          {/* Ana Menü */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Ana Menü
            </h3>
            <nav className="space-y-1">
              <Link href="/">
                <Button
                  variant={pathname === "/" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === "/" && "bg-blue-50 text-blue-700"
                  )}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ana Sayfa
                </Button>
              </Link>
              <Link href="/upload">
                <Button
                  variant={pathname === "/upload" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === "/upload" && "bg-blue-50 text-blue-700"
                  )}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Dosya Yükle
                </Button>
              </Link>
              <Link href="/ai-chat">
                <Button
                  variant={pathname === "/ai-chat" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === "/ai-chat" && "bg-blue-50 text-blue-700"
                  )}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  AI Chatbot
                </Button>
              </Link>
              <Link href="/analysis">
                <Button
                  variant={pathname === "/analysis" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === "/analysis" && "bg-blue-50 text-blue-700"
                  )}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Gelişmiş Analiz
                </Button>
              </Link>
              <Link href="/kpi-dashboard">
                <Button
                  variant={pathname === "/kpi-dashboard" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === "/kpi-dashboard" && "bg-blue-50 text-blue-700"
                  )}
                >
                  <PieChart className="mr-2 h-4 w-4" />
                  KPI Dashboard
                </Button>
              </Link>
              <Link href="/reports">
                <Button
                  variant={pathname === "/reports" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === "/reports" && "bg-blue-50 text-blue-700"
                  )}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Raporlar
                </Button>
              </Link>
              <Link href="/performance">
                <Button
                  variant={pathname === "/performance" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === "/performance" && "bg-blue-50 text-blue-700"
                  )}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Performans
                </Button>
              </Link>
              <Link href="/design-system">
                <Button
                  variant={pathname === "/design-system" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === "/design-system" && "bg-blue-50 text-blue-700"
                  )}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Design System
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant={pathname === "/pricing" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === "/pricing" && "bg-blue-50 text-blue-700"
                  )}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Fiyatlandırma
                </Button>
              </Link>
            </nav>
          </div>

          {/* Workspace'ler */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Workspace'lerim
            </h3>
            {loading ? (
              <div className="text-sm text-gray-500">Yükleniyor...</div>
            ) : workspaces.length === 0 ? (
              <div className="text-sm text-gray-500">Henüz workspace yok</div>
            ) : (
              <div className="space-y-2">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="group relative bg-white rounded-lg border p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <FolderOpen className="h-4 w-4 text-blue-500" />
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {workspace.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {workspace.fileCount} dosya • {workspace.totalRows.toLocaleString()} satır
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(workspace.createdAt)} • {formatFileSize(workspace.totalSize)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteWorkspace(workspace.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Dosya Listesi */}
                    <div className="mt-2 space-y-1">
                      {workspace.files.slice(0, 3).map((file) => (
                        <div key={file.id} className="flex items-center space-x-2 text-xs">
                          <FileText className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600 truncate">{file.fileName}</span>
                          <span className={cn(
                            "px-1 py-0.5 rounded text-xs",
                            file.status === 'completed' ? "bg-green-100 text-green-700" :
                            file.status === 'processing' ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-700"
                          )}>
                            {file.status}
                          </span>
                        </div>
                      ))}
                      {workspace.files.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{workspace.files.length - 3} dosya daha
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ayarlar */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Ayarlar
            </h3>
            <nav className="space-y-1">
              <Link href="/settings">
                <Button
                  variant={pathname === "/settings" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === "/settings" && "bg-blue-50 text-blue-700"
                  )}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Ayarlar
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
