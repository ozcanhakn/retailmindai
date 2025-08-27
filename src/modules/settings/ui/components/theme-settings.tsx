'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme, Theme } from '@/lib/theme-context';
import { Palette, Moon, Sun, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Error boundary for theme settings
function ThemeSettingsErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('useTheme must be used within a ThemeProvider')) {
        setHasError(true);
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="text-red-600 mb-4">
          <h2 className="text-lg font-semibold">Theme System Initialization Error</h2>
        </div>
        <div className="text-sm text-gray-500 space-y-2">
          <p>The theme provider is not properly initialized.</p>
          <p>This might be a temporary loading issue.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }
  
  try {
    return <>{children}</>;
  } catch (error) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="text-red-600 mb-4">
          <h2 className="text-lg font-semibold">Theme Settings Error</h2>
        </div>
        <div className="text-sm text-gray-500">
          <p>Unable to load theme settings. Please try refreshing the page.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }
}

interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  preview: {
    bg: string;
    card: string;
    text: string;
    accent: string;
  };
}

const themeOptions: ThemeOption[] = [
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Clean and bright interface for daytime use',
    icon: Sun,
    colors: {
      primary: '#bb2649',
      accent: '#ffadad',
      background: '#ffffff',
      text: '#4b4f5d',
    },
    preview: {
      bg: 'bg-white',
      card: 'bg-gray-50',
      text: 'text-gray-900',
      accent: 'bg-pink-100',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Easy on the eyes for low-light environments',
    icon: Moon,
    colors: {
      primary: '#0D6E6E',
      accent: '#FF3D3D',
      background: '#0D1F2D',
      text: '#FFFFFF',
    },
    preview: {
      bg: 'bg-slate-900',
      card: 'bg-slate-800',
      text: 'text-white',
      accent: 'bg-teal-900',
    },
  },
];

export const ThemeSettings: React.FC = () => {
  return (
    <ThemeSettingsErrorBoundary>
      <ThemeSettingsContent />
    </ThemeSettingsErrorBoundary>
  );
};

const ThemeSettingsContent: React.FC = () => {
  // Always call useTheme first to maintain hook order
  const { theme, setTheme } = useTheme();
  const [isReady, setIsReady] = React.useState(false);
  
  // Wait for client-side hydration
  React.useEffect(() => {
    setIsReady(true);
  }, []);
  
  if (!isReady) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 animate-pulse">
              <div className="h-5 w-5 bg-blue-300 rounded"></div>
            </div>
            <div>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-60 bg-gray-100 rounded animate-pulse mt-2"></div>
            </div>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading theme settings...</p>
        </div>
      </div>
    );
  }

  const handleThemeSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
            <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Theme Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize the appearance of your RetailMind AI dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Current Theme Info */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Current Theme</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {React.createElement(
                themeOptions.find(option => option.id === theme)?.icon || Sun,
                { className: "h-5 w-5" }
              )}
              <div>
                <div className="font-medium">
                  {themeOptions.find(option => option.id === theme)?.name}
                </div>
                <div className="text-sm text-gray-500">
                  {themeOptions.find(option => option.id === theme)?.description}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Theme Options */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Available Themes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themeOptions.map((option) => {
            const isSelected = theme === option.id;
            const IconComponent = option.icon;
            
            return (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-lg dark:bg-slate-800 dark:border-slate-700",
                    isSelected 
                      ? "ring-2 ring-blue-500 border-blue-300 shadow-md dark:border-blue-600" 
                      : "hover:border-gray-300 dark:hover:border-slate-600"
                  )}
                  onClick={() => handleThemeSelect(option.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          option.id === 'light' 
                            ? "bg-yellow-100 text-yellow-600" 
                            : "bg-blue-100 text-blue-600"
                        )}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{option.name}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="p-1 rounded-full bg-blue-500"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Color Palette Preview */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Color Palette
                      </div>
                      <div className="flex space-x-2">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: option.colors.primary }}
                          title="Primary Color"
                        />
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: option.colors.accent }}
                          title="Accent Color"
                        />
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: option.colors.background }}
                          title="Background Color"
                        />
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: option.colors.text }}
                          title="Text Color"
                        />
                      </div>
                    </div>

                    {/* UI Preview */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Preview
                      </div>
                      <div className={cn(
                        "p-3 rounded-lg border-2 border-dashed border-gray-200",
                        option.preview.bg
                      )}>
                        <div className={cn("p-2 rounded", option.preview.card)}>
                          <div className={cn("text-sm font-medium mb-1", option.preview.text)}>
                            Sample Dashboard
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={cn("px-2 py-1 text-xs rounded", option.preview.accent)}>
                              KPI Card
                            </div>
                            <div className="text-xs text-gray-500">Sample content</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant={isSelected ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleThemeSelect(option.id)}
                    >
                      {isSelected ? 'Currently Active' : `Switch to ${option.name}`}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto Theme Detection</div>
              <div className="text-sm text-gray-500">
                Automatically switch between light and dark themes based on system preference
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Reset to Default</div>
              <div className="text-sm text-gray-500">
                Reset all theme settings to their default values
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setTheme('light')}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};