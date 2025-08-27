'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Type,
  Layout,
  Zap,
  Accessibility,
  Code,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Plus,
  Download,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { designTokens } from '@/lib/design-system/tokens';
import { designSystemUtils } from '@/lib/design-system/utils';

export function DesignSystemDocs() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const ColorPalette = ({ colorName, colors }: { colorName: string; colors: Record<string, string> }) => (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 capitalize">
        {colorName}
      </h4>
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(colors).map(([shade, color]) => (
          <motion.div
            key={`${colorName}-${shade}`}
            whileHover={{ scale: 1.05 }}
            className="group cursor-pointer"
            onClick={() => copyToClipboard(color, `${colorName}-${shade}`)}
          >
            <div
              className="w-full h-12 rounded-lg border border-gray-200 shadow-sm"
              style={{ backgroundColor: color }}
            />
            <div className="mt-1 text-xs text-center">
              <div className="font-medium">{shade}</div>
              <div className="text-gray-500 group-hover:text-gray-700 transition-colors">
                {copiedToken === `${colorName}-${shade}` ? 'Copied!' : color}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const TypographyScale = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-lg mb-4">Typography Scale</h4>
        <div className="space-y-4">
          {Object.entries(designTokens.typography.fontSize).map(([size, value]) => (
            <div key={size} className="flex items-baseline space-x-4 p-4 border rounded-lg">
              <div className="w-16 text-sm text-gray-500 font-mono">{size}</div>
              <div className="w-20 text-sm text-gray-500 font-mono">{value}</div>
              <div style={{ fontSize: value }} className="font-medium">
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-lg mb-4">Font Weights</h4>
        <div className="space-y-2">
          {Object.entries(designTokens.typography.fontWeight).map(([weight, value]) => (
            <div key={weight} className="flex items-center space-x-4 p-3 border rounded">
              <div className="w-24 text-sm text-gray-500 capitalize">{weight}</div>
              <div className="w-12 text-sm text-gray-500 font-mono">{value}</div>
              <div style={{ fontWeight: value }} className="text-lg">
                Sample Text
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SpacingScale = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">Spacing Scale</h4>
      <div className="space-y-2">
        {Object.entries(designTokens.spacing).slice(0, 20).map(([token, value]) => (
          <div key={token} className="flex items-center space-x-4">
            <div className="w-16 text-sm text-gray-500 font-mono">{token}</div>
            <div className="w-20 text-sm text-gray-500 font-mono">{value}</div>
            <div
              className="bg-blue-200 dark:bg-blue-800"
              style={{ width: value, height: '16px' }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const ComponentShowcase = () => (
    <div className="space-y-8">
      {/* Buttons */}
      <div>
        <h4 className="font-semibold text-lg mb-4">Buttons</h4>
        <div className="flex flex-wrap gap-4">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button disabled>Disabled Button</Button>
        </div>
        
        <div className="mt-4">
          <h5 className="font-medium mb-2">Button Sizes</h5>
          <div className="flex items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div>
        <h4 className="font-semibold text-lg mb-4">Cards</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                This is a default card with standard styling.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardHeader>
              <CardTitle>Gradient Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                This card uses a subtle gradient background.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-gray-300">
            <CardHeader>
              <CardTitle>Dashed Border</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                This card has a dashed border for emphasis.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h4 className="font-semibold text-lg mb-4">Badges</h4>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-green-100 text-green-800">Success</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
        </div>
      </div>

      {/* Form Elements */}
      <div>
        <h4 className="font-semibold text-lg mb-4">Form Elements</h4>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Text Input</label>
            <Input placeholder="Enter text here..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Disabled Input</label>
            <Input placeholder="Disabled input" disabled />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Input with Icon</label>
            <div className="relative">
              <Input placeholder="Search..." className="pl-10" />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Eye className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div>
        <h4 className="font-semibold text-lg mb-4">Status Indicators</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 dark:text-green-200">Success message</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 dark:text-yellow-200">Warning message</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <X className="h-5 w-5 text-red-600" />
            <span className="text-red-800 dark:text-red-200">Error message</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200">Information message</span>
          </div>
        </div>
      </div>
    </div>
  );

  const IconShowcase = () => {
    const iconComponents = [
      { name: 'Palette', component: Palette },
      { name: 'Type', component: Type },
      { name: 'Layout', component: Layout },
      { name: 'Zap', component: Zap },
      { name: 'Accessibility', component: Accessibility },
      { name: 'Code', component: Code },
      { name: 'Eye', component: Eye },
      { name: 'CheckCircle', component: CheckCircle },
      { name: 'AlertCircle', component: AlertCircle },
      { name: 'Info', component: Info },
      { name: 'X', component: X },
      { name: 'Plus', component: Plus },
      { name: 'Download', component: Download },
      { name: 'Copy', component: Copy }
    ];

    const iconSizes = [
      { name: 'Small', class: 'w-4 h-4' },
      { name: 'Medium', class: 'w-6 h-6' },
      { name: 'Large', class: 'w-8 h-8' },
      { name: 'Extra Large', class: 'w-12 h-12' }
    ];

    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-lg mb-4">Icon Sizes</h4>
          <div className="grid grid-cols-4 gap-6">
            {iconSizes.map(({ name, class: sizeClass }) => (
              <div key={name} className="text-center space-y-2">
                <div className="flex justify-center">
                  <Palette className={sizeClass} />
                </div>
                <div className="text-sm text-gray-600">{name}</div>
                <div className="text-xs text-gray-500 font-mono">{sizeClass}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-4">Icon Grid</h4>
          <div className="grid grid-cols-7 gap-4">
            {iconComponents.map(({ name, component: IconComponent }) => (
              <div key={name} className="text-center space-y-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex justify-center">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-xs text-gray-600">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Design System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A comprehensive design system with consistent tokens, components, and accessibility features
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto mb-4">
                      <Palette className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Color System</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Comprehensive color palette with semantic meanings
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit mx-auto mb-4">
                      <Type className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Typography</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Consistent type scale and font weights
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit mx-auto mb-4">
                      <Layout className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Components</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Reusable UI components with variants
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full w-fit mx-auto mb-4">
                      <Accessibility className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Accessibility</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      WCAG compliant with proper contrast ratios
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Design Principles */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Design Principles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Consistency</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Unified visual language across all components and interactions
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Accessibility</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Inclusive design ensuring usability for all users
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Scalability</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Flexible system that grows with product needs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <div className="space-y-8">
              <ColorPalette colorName="primary" colors={designTokens.colors.primary} />
              <ColorPalette colorName="secondary" colors={designTokens.colors.secondary} />
              <ColorPalette colorName="success" colors={designTokens.colors.success} />
              <ColorPalette colorName="warning" colors={designTokens.colors.warning} />
              <ColorPalette colorName="error" colors={designTokens.colors.error} />
              
              <div>
                <h4 className="font-semibold text-lg mb-4">Chart Colors</h4>
                <div className="grid grid-cols-6 gap-4">
                  {designTokens.colors.chart.map((color, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer text-center"
                      onClick={() => copyToClipboard(color, `chart-${index}`)}
                    >
                      <div
                        className="w-full h-16 rounded-lg border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                      <div className="mt-2 text-xs">
                        <div className="font-medium">#{index + 1}</div>
                        <div className="text-gray-500">
                          {copiedToken === `chart-${index}` ? 'Copied!' : color}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography">
            <TypographyScale />
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing">
            <SpacingScale />
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components">
            <ComponentShowcase />
          </TabsContent>

          {/* Icons Tab */}
          <TabsContent value="icons">
            <IconShowcase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default DesignSystemDocs;