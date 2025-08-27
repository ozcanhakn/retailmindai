'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Star, Zap, Building2, Crown, Sparkles, ArrowRight, Shield, ChevronRight, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { PRICING_PLANS } from '@/constants/pricing';
import { PricingPlan } from '@/types/pricing';

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
      return <Star className="w-8 h-8" />;
    case 'pro':
      return <Zap className="w-8 h-8" />;
    case 'enterprise':
      return <Building2 className="w-8 h-8" />;
    default:
      return <Star className="w-8 h-8" />;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 20,
      duration: 0.8
    }
  },
  hover: {
    y: -12,
    scale: 1.03,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
};

const heroVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut" as const
    }
  }
};

export const PricingPageView: React.FC = () => {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    setLoading(true);
    
    try {
      // TODO: Integrate with payment system
      console.log('Selected plan:', { planId, billingCycle });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to dashboard or success page
      alert(`${planId} planına yükseltme başarılı!`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Yükseltme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1A1F2B' }}>
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 w-full" style={{ backgroundColor: '#292E3B', borderBottomColor: '#3a4050' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2 hover:bg-gray-700" style={{ color: '#B4C2DC' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Geri
              </Button>
              <div className="h-6 w-px bg-gray-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: '#B4C2DC' }}>
                  RetailMind AI
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hover:bg-gray-700" style={{ color: '#B4C2DC' }}>
                SSS
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-gray-700" style={{ color: '#B4C2DC' }}>
                İletişim
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden pt-20 pb-16"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-sm font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Pricing Plans
          </div>
          
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-8 leading-tight"
            style={{ color: '#B4C2DC' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Size 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}uygun planı{' '}
            </span>
            seçin
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto mb-12"
            style={{ color: '#B4C2DC' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Gelişmiş AI destekli analizler, profesyonel raporlama araçları ve kapsamlı veri görselleştirmeleri ile 
            işletmenizi büyütün. Her plan 14 gün ücretsiz deneme ile birlikte gelir.
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm mb-16"
            style={{ color: '#B4C2DC' }}
          >
            {[
              { icon: <Shield className="w-4 h-4" />, text: "14 gün ücretsiz deneme" },
              { icon: <CreditCard className="w-4 h-4" />, text: "Kredi kartı gerekmez" },
              { icon: <Star className="w-4 h-4" />, text: "7/24 müşteri desteği" },
              { icon: <Check className="w-4 h-4" />, text: "İstediğiniz zaman iptal" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Billing Toggle */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex justify-center mb-20"
      >
        <div className="relative border border-gray-600 p-2 rounded-2xl shadow-2xl" style={{ backgroundColor: '#292E3B' }}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'monthly', label: 'Aylık Ödeme' },
              { value: 'yearly', label: 'Yıllık Ödeme' }
            ].map((option) => (
              <motion.button
                key={option.value}
                onClick={() => setBillingCycle(option.value as 'monthly' | 'yearly')}
                className={`relative px-10 py-4 rounded-xl text-base font-semibold transition-all duration-300 ${
                  billingCycle === option.value
                    ? 'text-white shadow-xl'
                    : 'hover:bg-gray-600'
                }`} style={{
                  color: billingCycle === option.value ? '#ffffff' : '#B4C2DC'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {billingCycle === option.value && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{option.label}</span>
                {option.value === 'yearly' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -right-3 z-20"
                  >
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1 shadow-lg">
                      %20 İndirim
                    </Badge>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Cards */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full px-6 pb-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 px-4 lg:px-8">
            {PRICING_PLANS.map((plan, index) => {
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
                {(plan.popular || plan.recommended) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20"
                  >
                    <Badge className={`px-8 py-3 text-sm font-bold shadow-2xl ${
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

                <Card className={`h-full relative overflow-hidden transition-all duration-700 border-2 shadow-2xl`} style={{
                  backgroundColor: '#292E3B',
                  borderColor: isPopular ? plan.color.primary : '#3a4050'
                }}>
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700`} style={{
                    background: `linear-gradient(135deg, ${plan.color.primary}, ${plan.color.secondary})`
                  }} />

                  <CardHeader className="text-center relative pb-8 pt-12">
                    {/* Icon */}
                    <motion.div 
                      className="flex justify-center mb-8"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className={`p-5 rounded-3xl shadow-xl transition-all duration-300`} style={{
                        background: `linear-gradient(135deg, ${plan.color.primary}, ${plan.color.secondary})`,
                        color: 'white',
                        boxShadow: hoveredPlan === plan.id ? `0 20px 40px ${plan.color.primary}30` : '0 10px 20px rgba(0,0,0,0.1)'
                      }}>
                        {getPlanIcon(plan.id)}
                      </div>
                    </motion.div>

                    <CardTitle className="text-3xl font-bold mb-4" style={{ color: '#B4C2DC' }}>
                      {plan.name}
                    </CardTitle>
                    
                    <p className="text-lg leading-relaxed mb-10 max-w-sm mx-auto" style={{ color: '#B4C2DC' }}>
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="space-y-3">
                      <motion.div 
                        className="flex items-baseline justify-center space-x-2"
                        key={`${plan.id}-${billingCycle}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <span className="text-6xl font-bold" style={{ color: '#B4C2DC' }}>
                          {formatPrice(price, plan.currency)}
                        </span>
                        {price > 0 && (
                          <span className="text-xl font-medium" style={{ color: '#B4C2DC' }}>
                            /{billingCycle === 'yearly' ? 'yıl' : 'ay'}
                          </span>
                        )}
                      </motion.div>
                      
                      {billingCycle === 'yearly' && price > 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2"
                        >
                          <p className="" style={{ color: '#B4C2DC' }}>
                            Aylık sadece {formatPrice(monthlyEquivalent, plan.currency)}
                          </p>
                          {discount > 0 && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                              %{discount} tasarruf ediyorsunuz
                            </Badge>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 relative px-10 pb-10">
                    {/* Features */}
                    <div className="space-y-5 mb-12">
                      {plan.features.slice(0, 8).map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: (index * 0.1) + (featureIndex * 0.05),
                            duration: 0.4
                          }}
                          className="flex items-start space-x-4"
                        >
                          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 transition-all duration-300 ${
                            feature.included 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-r from-red-400 to-red-500'
                          }`}>
                            {feature.included ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : (
                              <X className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className={`text-base font-medium leading-relaxed ${
                              feature.included 
                                ? plan.id === 'free' 
                                  ? 'text-gray-900' 
                                  : 'text-gray-900'
                                : 'line-through opacity-60'
                            }`} style={{
                              color: feature.included 
                                ? (plan.id === 'free' ? '#B4B8B7' : '#B4C2DC')
                                : '#6b7280'
                            }}>
                              {feature.name}
                            </span>
                            {feature.limit && (
                              <span className="text-sm block mt-1" style={{
                                color: plan.id === 'free' ? '#B4B8B7' : '#B4C2DC'
                              }}>
                                {feature.limit}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      
                      {plan.features.length > 8 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="text-center pt-3"
                        >
                          <span className="font-medium flex items-center justify-center gap-2" style={{ color: '#B4C2DC' }}>
                            +{plan.features.length - 8} daha fazla özellik
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Action Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={plan.id === 'pro' ? 'hover:drop-shadow-2xl' : ''}
                    >
                      <Button
                        onClick={() => handleSelectPlan(plan.id, billingCycle)}
                        disabled={loading}
                        className={`w-full h-16 font-bold text-lg rounded-2xl transition-all duration-500 relative overflow-hidden group/button ${
                          plan.id === 'pro'
                            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-2xl hover:shadow-3xl border-0'
                            : isPopular
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl border-0'
                            : 'bg-gray-900 hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl border-0'
                        }`}
                        style={{
                          background: plan.id === 'pro' 
                            ? 'linear-gradient(135deg, #FF4D4D, #FF1F1F, #E60000)'
                            : undefined,
                          boxShadow: plan.id === 'pro'
                            ? '0 10px 30px rgba(255, 77, 77, 0.4), 0 4px 20px rgba(255, 77, 77, 0.2)'
                            : undefined
                        }}
                      >
                        {!loading && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000"
                            initial={false}
                          />
                        )}
                        
                        <span className="relative z-10 flex items-center justify-center gap-3" style={{ color: '#ffffff' }}>
                          {loading ? (
                            'İşleniyor...'
                          ) : plan.id === 'free' ? (
                            <>Ücretsiz Başlayın <ArrowRight className="w-5 h-5" /></>
                          ) : (
                            <>Planı Seçin <ArrowRight className="w-5 h-5" /></>
                          )}
                        </span>
                      </Button>
                    </motion.div>

                    {/* Security Badge */}
                    {plan.id !== 'free' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="flex items-center justify-center gap-2 mt-6 text-sm"
                      style={{ color: '#B4C2DC' }}
                      >
                        <Shield className="w-4 h-4" />
                        <span>14 gün ücretsiz deneme • İstediğiniz zaman iptal edin</span>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}  
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="max-w-4xl mx-auto px-6 pb-20"
      >
        <div className="rounded-3xl p-12 border shadow-2xl" style={{ backgroundColor: '#292E3B', borderColor: '#3a4050' }}>
          <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: '#B4C2DC' }}>
            Sıkça Sorulan Sorular
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: "Ücretsiz deneme nasıl çalışır?",
                a: "14 gün boyunca tüm premium özellikleri ücretsiz kullanabilirsiniz. Kredi kartı bilgisi gerekmez."
              },
              {
                q: "İstediğim zaman iptal edebilir miyim?",
                a: "Evet, herhangi bir taahhüt olmadan istediğiniz zaman planınızı iptal edebilirsiniz."
              },
              {
                q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
                a: "Visa, Mastercard, American Express ve PayPal ile ödeme yapabilirsiniz."
              },
              {
                q: "Teknik destek alabilir miyim?",
                a: "Tüm planlarımızda email desteği, Premium ve Enterprise planlarında 7/24 öncelikli destek sunuyoruz."
              }
            ].map((faq, i) => (
              <div key={i} className="space-y-3">
                <h4 className="font-semibold text-lg" style={{ color: '#B4C2DC' }}>{faq.q}</h4>
                <p className="leading-relaxed" style={{ color: '#B4C2DC' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};