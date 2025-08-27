import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield, Sparkles, Zap, TrendingUp, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PricingPlans } from './pricing-plans';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId?: string;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  currentPlanId = 'free'
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ planId: string; cycle: 'monthly' | 'yearly' } | null>(null);

  const handleSelectPlan = async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    if (planId === currentPlanId) return;
    
    setLoading(true);
    setSelectedPlan({ planId, cycle: billingCycle });
    
    try {
      // TODO: Integrate with payment system
      console.log('Selected plan:', { planId, billingCycle });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just show success and close
      alert(`${planId} planına yükseltme başarılı!`);
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Yükseltme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const benefits = [
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
      title: 'AI Destekli Öngörüler',
      description: 'Gelişmiş makine öğrenmesi algoritmaları ile gelecek trendleri öngörün',
      highlight: 'Yeni!'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: 'Gelişmiş Analizler',
      description: 'Derinlemesine veri analizleri ve özelleştirilebilir KPI\'lar',
      highlight: 'Popüler'
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-500" />,
      title: 'Sınırsız Export',
      description: 'PDF, Excel, PowerPoint ve daha fazla formatta sınırsız export',
      highlight: null
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: 'Takım İşbirliği',
      description: 'Ekibinizle raporları paylaşın ve beraber çalışın',
      highlight: null
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-500" />,
      title: 'Öncelikli Destek',
      description: '7/24 teknik destek ve hızlı yanıt garantisi',
      highlight: null
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      title: 'API Erişimi',
      description: 'Programatik veri erişimi ve üçüncü parti entegrasyonlar',
      highlight: 'Pro'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="relative px-8 py-6 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Planınızı Yükseltin
                    </DialogTitle>
                  </div>
                  <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                    Daha güçlü AI analizleri, sınırsız özellikler ve profesyonel destek ile iş süreçlerinizi optimize edin
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onClose}
                  className="flex-shrink-0 h-10 w-10 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Benefits Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Neden <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Premium</span>'a Geçmelisiniz?
                </h3>
                <p className="text-gray-600">İşletmenizi bir sonraki seviyeye taşıyacak özellikler</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="group"
                  >
                    <Card className="h-full bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl group-hover:shadow-lg transition-all duration-300">
                              {benefit.icon}
                            </div>
                            {benefit.highlight && (
                              <Badge className={`text-xs font-semibold ${
                                benefit.highlight === 'Yeni!' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                benefit.highlight === 'Popüler' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                                'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                              }`}>
                                {benefit.highlight}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300">
                              {benefit.title}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Pricing Plans */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mb-8"
            >
              <PricingPlans
                onSelectPlan={handleSelectPlan}
                currentPlanId={currentPlanId}
                loading={loading}
              />
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white flex-shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-lg">Güvenli ve Garantili Ödeme</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Tüm ödemeleriniz 256-bit SSL şifreleme ile korunmaktadır. 14 gün ücretsiz deneme süresi boyunca 
                      istediğiniz zaman iptal edebilir, tam para iadesi alabilirsiniz. Kredi kartı bilgileriniz hiçbir zaman 
                      sunucularımızda saklanmaz.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        ✓ 256-bit SSL Şifreleme
                      </Badge>
                      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                        ✓ 14 Gün Para İadesi
                      </Badge>
                      <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                        ✓ PCI DSS Uyumlu
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};