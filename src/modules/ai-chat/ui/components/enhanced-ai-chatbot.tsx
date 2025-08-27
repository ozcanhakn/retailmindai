'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  Send,
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  Image as ImageIcon,
  Paperclip,
  MoreVertical,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Zap,
  Brain,
  Download,
  Settings,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  suggestions?: string[];
  metadata?: {
    model?: string;
    responseTime?: number;
    confidence?: number;
  };
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isAvailable: boolean;
  isPremium?: boolean;
}

const availableModels: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model for complex analysis',
    icon: Brain,
    isAvailable: true,
    isPremium: true
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for general queries',
    icon: Zap,
    isAvailable: true,
    isPremium: false
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    description: 'Excellent for detailed explanations',
    icon: Bot,
    isAvailable: false,
    isPremium: true
  }
];

const quickPrompts = [
  "Analyze my sales performance trends",
  "What are my top performing products?",
  "Show me customer behavior insights",
  "Generate a business summary report",
  "Identify seasonal patterns in my data",
  "Compare product categories performance",
  "Find revenue optimization opportunities",
  "Analyze customer churn patterns"
];

interface EnhancedAIChatbotProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
}

export const EnhancedAIChatbot: React.FC<EnhancedAIChatbotProps> = ({
  isFullscreen = false,
  onToggleFullscreen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(availableModels[0]);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${input}". Based on your data, here's my analysis:\n\nThis is a simulated response that would normally come from the AI model. The actual implementation would integrate with your backend API to analyze the real data and provide meaningful insights.\n\nWould you like me to dive deeper into any specific aspect?`,
        timestamp: new Date(),
        suggestions: [
          "Tell me more details",
          "Show me the data",
          "Generate a report",
          "What's the next step?"
        ],
        metadata: {
          model: selectedModel.name,
          responseTime: 1850,
          confidence: 0.92
        }
      };

      setMessages(prev => prev.slice(0, -1).concat(assistantMessage));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const regenerateResponse = (messageId: string) => {
    // Implement regenerate logic
    console.log('Regenerating response for message:', messageId);
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Implement voice recognition logic
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden",
        isFullscreen 
          ? "fixed inset-0 z-50 bg-black/90 backdrop-blur-xl" 
          : "w-full max-w-4xl mx-auto"
      )}
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 70, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      <Card className="relative z-10 border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
        {/* Header */}
        <CardHeader className="border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* AI Avatar */}
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl blur-lg opacity-75"
                />
                <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 p-3 rounded-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  RetailMind AI Assistant
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">Online</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-white/10 border-white/20">
                    {selectedModel.name}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-black/90 backdrop-blur-xl border-white/20">
                  <div className="p-2">
                    <p className="text-sm font-medium text-white mb-2">AI Model</p>
                    {availableModels.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => setSelectedModel(model)}
                        disabled={!model.isAvailable}
                        className={cn(
                          "flex items-center justify-between p-2 rounded cursor-pointer",
                          selectedModel.id === model.id ? "bg-blue-500/20" : "hover:bg-white/10",
                          !model.isAvailable && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <model.icon className="w-4 h-4" />
                          <div>
                            <p className="text-sm font-medium text-white">{model.name}</p>
                            <p className="text-xs text-gray-400">{model.description}</p>
                          </div>
                        </div>
                        {model.isPremium && (
                          <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
                            Pro
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem onClick={clearChat} className="text-red-400 hover:bg-red-500/10">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {onToggleFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFullscreen}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              )}

              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white/80 hover:text-white hover:bg-red-500/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className={cn(
              "overflow-auto custom-scrollbar bg-black/10 backdrop-blur-sm",
              isFullscreen ? "h-[calc(100vh-200px)]" : "h-96"
            )}
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)'
            }}
          >
            <div className="p-6 space-y-4">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 space-y-6"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
                    />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
                      <Sparkles className="w-10 h-10 text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h4 className="text-xl font-bold text-white">Start a conversation</h4>
                    <p className="text-gray-300 max-w-md">
                      Ask me anything about your data, get insights, or explore analytics. I'm here to help you understand your business better.
                    </p>
                  </div>

                  {/* Quick Suggestions */}
                  <div className="grid grid-cols-2 gap-2 max-w-2xl">
                    {quickPrompts.slice(0, 4).map((prompt, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => handleSuggestionClick(prompt)}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm text-gray-300 hover:text-white transition-all duration-200 backdrop-blur-sm text-left"
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "flex w-full",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-4 rounded-2xl backdrop-blur-sm border",
                          message.role === 'user'
                            ? "bg-blue-500/20 border-blue-500/30 text-white"
                            : "bg-white/10 border-white/20 text-gray-100"
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          {message.role === 'assistant' && (
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <Bot className="w-3 h-3 text-white" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            {message.isLoading ? (
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-sm text-gray-400">Thinking...</span>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                
                                {message.metadata && (
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                                    <span>{message.metadata.model}</span>
                                    <span>{message.metadata.responseTime}ms</span>
                                    <span>{Math.round((message.metadata.confidence || 0) * 100)}% confidence</span>
                                  </div>
                                )}

                                {message.suggestions && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {message.suggestions.map((suggestion, index) => (
                                      <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs text-gray-300 hover:text-white transition-all duration-200"
                                      >
                                        {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {message.role === 'assistant' && !message.isLoading && (
                                  <div className="flex items-center space-x-2 mt-3">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(message.content)}
                                      className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                                    >
                                      <Copy className="w-3 h-3 mr-1" />
                                      Copy
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => regenerateResponse(message.id)}
                                      className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                                    >
                                      <RefreshCw className="w-3 h-3 mr-1" />
                                      Regenerate
                                    </Button>
                                    <div className="flex space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-gray-400 hover:text-green-400"
                                      >
                                        <ThumbsUp className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                                      >
                                        <ThumbsDown className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {message.role === 'user' && (
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <User className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/10 bg-black/10 backdrop-blur-sm">
            <div className="relative">
              <div className="flex items-end space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                {/* Attachment Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-white/10 h-10 w-10 p-0"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>

                {/* Text Input */}
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about your data..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 border-0 resize-none focus:ring-0 focus:outline-none min-h-[40px] max-h-32"
                  rows={1}
                />

                {/* Voice Input Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoiceInput}
                  className={cn(
                    "h-10 w-10 p-0 transition-all duration-200",
                    isListening 
                      ? "text-red-400 bg-red-500/20 hover:bg-red-500/30" 
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>

                {/* Send Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className={cn(
                      "h-10 w-10 p-0 rounded-xl transition-all duration-200",
                      isLoading || !input.trim()
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                    )}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Input Helper */}
              <div className="flex items-center justify-between mt-3 px-2">
                <p className="text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>Powered by</span>
                  <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                    {selectedModel.name}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};