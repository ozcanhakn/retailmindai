import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star, Zap, Building2, Crown, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { PRICING_PLANS } from '@/constants/pricing';
import { PricingPlan } from '@/types/pricing';

interface PricingPlansProps {
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
  currentPlanId?: string;
  loading?: boolean;
}

const formatPrice = (price: number, currency: string) => {
  if (price === 0) return 'Ücretsiz';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const getDiscount = (plan: PricingPlan) => {
  if (plan.price.yearly === 0) return 0;
  const monthlyTotal = plan.price.monthly * 12;
  return Math.round(((monthlyTotal - plan.price.yearly) / monthlyTotal) * 100);
};

const getPlanIcon = (planId: string) => {
  switch (planId) {
    case 'free':
      return <Star className="w-7 h-7" />;
    case 'pro':
      return <Zap className="w-7 h-7" />;
    case 'enterprise':
      return <Building2 className="w-7 h-7" />;
    default:
      return <Star className="w-7 h-7" />;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 17
    }
  }
};

export const PricingPlans: React.FC<PricingPlansProps> = ({
  onSelectPlan,
  currentPlanId = 'free',
  loading = false
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header Section - Compact */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-4" style={{ color: '#B4C2DC' }}>
          Size 
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            uygun planı
          </span>
          seçin
        </h2>
        <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: '#B4C2DC' }}>
          Gelişmiş AI destekli analizler ve profesyonel raporlama araçları ile işletmenizi büyütün.
        </p>
      </motion.div>
      {/* Billing Toggle - Compact */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex justify-center mb-8"
      >
        <div className="relative border border-gray-600 p-1.5 rounded-xl shadow-lg" style={{ backgroundColor: '#292E3B' }}>
          <div className="grid grid-cols-2 gap-1">
            {[
              { value: 'monthly', label: 'Aylık' },
              { value: 'yearly', label: 'Yıllık' }
            ].map((option) => (
              <motion.button
                key={option.value}
                onClick={() => setBillingCycle(option.value as 'monthly' | 'yearly')}
                className={`relative px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  billingCycle === option.value
                    ? 'text-white shadow-lg'
                    : 'hover:bg-gray-600'
                }`} style={{
                  color: billingCycle === option.value ? '#ffffff' : '#B4C2DC'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {billingCycle === option.value && (
                  <motion.div
                    layoutId="activeTabModal"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{option.label}</span>
                {option.value === 'yearly' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 z-20"
                  >
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 shadow-lg">
                      %20
                    </Badge>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards - Compact */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-8">
          {PRICING_PLANS.map((plan, index) => {
          const isCurrentPlan = currentPlanId === plan.id;
          const discount = getDiscount(plan);
          const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
          const monthlyEquivalent = billingCycle === 'yearly' ? Math.round(plan.price.yearly / 12) : plan.price.monthly;
          const isPopular = plan.popular || plan.recommended;

          return (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover="hover"
              onHoverStart={() => setHoveredPlan(plan.id)}
              onHoverEnd={() => setHoveredPlan(null)}
              className={`relative group w-full max-w-sm mx-auto ${
                isPopular ? 'lg:scale-105 z-10' : 'lg:scale-100'
              }`}
            >
              {/* Popular/Recommended Badge */}
              <AnimatePresence>
                {(plan.popular || plan.recommended) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20"
                  >
                    <Badge className={`px-6 py-2 text-sm font-semibold shadow-lg ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                        : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    }`}>
                      {plan.popular ? (
                        <><Star className="w-4 h-4 mr-2" />En Popüler</>
                      ) : (
                        <><Crown className="w-4 h-4 mr-2" />Önerilen</>
                      )}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className={`h-full relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl border-2 shadow-xl hover:shadow-2xl`} style={{
                backgroundColor: '#292E3B',
                borderColor: isPopular ? plan.color.primary : '#3a4050'
              }}>
                {/* Gradient Background */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${
                  plan.color.gradient
                }`} style={{
                  background: `linear-gradient(135deg, ${plan.color.primary}, ${plan.color.secondary})`
                }} />

                <CardHeader className="text-center relative pb-6 pt-6">
                  {/* Icon */}
                  <motion.div 
                    className="flex justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={`p-3 rounded-xl shadow-lg ${
                      hoveredPlan === plan.id ? 'shadow-xl' : 'shadow-lg'
                    } transition-all duration-300`} style={{
                      background: `linear-gradient(135deg, ${plan.color.primary}, ${plan.color.secondary})`,
                      color: 'white'
                    }}>
                      {getPlanIcon(plan.id)}
                    </div>
                  </motion.div>

                  <CardTitle className="text-xl font-bold mb-2" style={{ color: '#B4C2DC' }}>
                    {plan.name}
                  </CardTitle>
                  
                  <p className="text-sm leading-relaxed mb-6 max-w-sm mx-auto" style={{ color: '#B4C2DC' }}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="space-y-1">
                    <motion.div 
                      className="flex items-baseline justify-center space-x-1"
                      key={`${plan.id}-${billingCycle}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-3xl font-bold" style={{ color: '#B4C2DC' }}>
                        {formatPrice(price, plan.currency)}
                      </span>
                      {price > 0 && (
                        <span className="text-sm font-medium" style={{ color: '#B4C2DC' }}>
                          /{billingCycle === 'yearly' ? 'yıl' : 'ay'}
                        </span>
                      )}
                    </motion.div>
                    
                    {billingCycle === 'yearly' && price > 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-1"
                      >
                        <p className="text-xs" style={{ color: '#B4C2DC' }}>
                          Aylık {formatPrice(monthlyEquivalent, plan.currency)}
                        </p>
                        {discount > 0 && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                            %{discount} tasarruf
                          </Badge>
                        )}
                      </motion.div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 relative px-6 pb-6">
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.slice(0, 6).map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: (index * 0.1) + (featureIndex * 0.05),
                          duration: 0.4
                        }}
                        className="flex items-start space-x-3 group/feature"
                      >
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 ${
                          feature.included 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-red-400 to-red-500'
                        }`}>
                          {feature.included ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <X className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm font-medium leading-relaxed ${
                            feature.included 
                              ? 'included-feature' 
                              : 'line-through opacity-60'
                          }`} style={{
                            color: feature.included 
                              ? (plan.id === 'free' ? '#B4B8B7' : '#B4C2DC')
                              : '#6b7280'
                          }}>
                            {feature.name}
                          </span>
                          {feature.limit && (
                            <span className="text-xs block mt-0.5" style={{
                              color: plan.id === 'free' ? '#B4B8B7' : '#B4C2DC'
                            }}>
                              {feature.limit}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    
                    {plan.features.length > 6 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center pt-1"
                      >
                        <span className="text-xs font-medium" style={{ color: '#B4C2DC' }}>
                          +{plan.features.length - 6} daha fazla özellik
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Action Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={plan.id === 'pro' ? 'hover:drop-shadow-xl' : ''}
                  >
                    <Button
                      onClick={() => onSelectPlan(plan.id, billingCycle)}
                      disabled={loading || isCurrentPlan}
                      className={`w-full h-12 font-semibold text-sm rounded-xl transition-all duration-300 relative overflow-hidden group/button ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-600 border-2 border-gray-200 cursor-not-allowed'
                          : plan.id === 'pro'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl border-0'
                          : isPopular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl border-0'
                          : 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl border-0'
                      }`}
                      style={{
                        background: !isCurrentPlan && plan.id === 'pro' 
                          ? 'linear-gradient(135deg, #FF4D4D, #FF1F1F, #E60000)'
                          : undefined,
                        boxShadow: !isCurrentPlan && plan.id === 'pro'
                          ? '0 6px 20px rgba(255, 77, 77, 0.3), 0 2px 12px rgba(255, 77, 77, 0.2)'
                          : undefined
                      }}
                    >
                      {!isCurrentPlan && !loading && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000"
                          initial={false}
                        />
                      )}
                      
                      <span className="relative z-10 flex items-center justify-center gap-2" style={{ color: '#ffffff' }}>
                        {loading ? (
                          'İşleniyor...'
                        ) : isCurrentPlan ? (
                          <><Shield className="w-4 h-4" />Mevcut Planınız</>
                        ) : plan.id === 'free' ? (
                          <>Ücretsiz Başlayın <ArrowRight className="w-4 h-4" /></>
                        ) : (
                          <>Planı Seçin <ArrowRight className="w-4 h-4" /></>
                        )}
                      </span>
                    </Button>
                  </motion.div>

                  {/* Security Badge */}
                  {!isCurrentPlan && plan.id !== 'free' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="flex items-center justify-center gap-1 mt-4 text-xs"
                      style={{ color: '#B4C2DC' }}
                    >
                      <Shield className="w-3 h-3" />
                      <span>14 gün ücretsiz deneme</span>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
          })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};