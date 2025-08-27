'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EnhancedAIChatbot } from '@/modules/ai-chat/ui/components/enhanced-ai-chatbot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Zap,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Users,
  Package,
  DollarSign,
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "Advanced AI Analytics",
    description: "Get deep insights from your data with GPT-4 powered analysis",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Zap,
    title: "Real-time Responses",
    description: "Fast processing with intelligent caching for instant answers",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data stays safe with enterprise-grade security",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: TrendingUp,
    title: "Predictive Insights",
    description: "Forecast trends and identify opportunities before they happen",
    color: "from-purple-500 to-pink-500"
  }
];

const useCases = [
  {
    icon: BarChart3,
    title: "Sales Analysis",
    description: "Analyze sales performance and identify growth opportunities",
    example: "What were my top-selling products last quarter?"
  },
  {
    icon: Users,
    title: "Customer Insights",
    description: "Understand customer behavior and segmentation patterns",
    example: "Show me customer churn analysis for premium users"
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Optimize stock levels and predict demand patterns",
    example: "Which products should I restock based on seasonal trends?"
  },
  {
    icon: DollarSign,
    title: "Revenue Optimization",
    description: "Find ways to increase revenue and reduce costs",
    example: "How can I improve my profit margins?"
  }
];

const testimonials = [
  {
    user: "Sarah Johnson",
    role: "Retail Manager",
    content: "This AI assistant helped me identify $50K in revenue opportunities I never would have found manually.",
    rating: 5
  },
  {
    user: "Mike Chen",
    role: "Data Analyst",
    content: "The insights are incredibly accurate. It's like having a senior analyst available 24/7.",
    rating: 5
  },
  {
    user: "Emma Davis",
    role: "Business Owner",
    content: "Finally, an AI that actually understands my business context and gives actionable advice.",
    rating: 5
  }
];

export default function AIChatPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              AI Data Assistant
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Unlock the power of your data with our advanced AI assistant. Get instant insights, 
            detailed analysis, and actionable recommendations from your business data.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              <Sparkles className="w-3 h-3 mr-1" />
              GPT-4 Powered
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <Clock className="w-3 h-3 mr-1" />
              Real-time Analysis
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              <Shield className="w-3 h-3 mr-1" />
              Enterprise Security
            </Badge>
          </div>
        </motion.div>

        {/* Main Chat Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <EnhancedAIChatbot
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful AI Capabilities
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI assistant is equipped with advanced capabilities to help you make data-driven decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-r ${feature.color} p-3 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Use Cases Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Common Use Cases
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover how our AI assistant can help you across different business scenarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="h-full border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <useCase.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {useCase.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {useCase.description}
                        </p>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Example question:</p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 italic">
                            "{useCase.example}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real feedback from businesses transforming their operations with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="h-full border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: testimonial.rating }, (_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="border-t pt-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.user}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center space-y-6"
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 p-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-8">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Start asking questions about your data and discover insights that drive growth. 
                Our AI assistant is ready to help you make smarter decisions.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                onClick={() => {
                  document.querySelector('textarea')?.focus();
                }}
              >
                Start Chatting Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}