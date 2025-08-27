import { PricingPlan } from '@/types/pricing';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    description: 'Küçük işletmeler için temel analiz özellikleri',
    price: {
      monthly: 0,
      yearly: 0,
    },
    currency: 'TRY',
    features: [
      { name: 'Temel dashboard', included: true },
      { name: 'CSV dosya yükleme', included: true, limit: '3 dosya/ay' },
      { name: 'Temel KPI\'lar', included: true, limit: '20 KPI' },
      { name: 'Basit grafikler', included: true },
      { name: 'PDF export', included: true, limit: '5 export/ay' },
      { name: 'Gelişmiş analizler', included: false },
      { name: 'AI destekli öngörüler', included: false },
      { name: 'Takım işbirliği', included: false },
      { name: 'API erişimi', included: false },
      { name: 'Öncelikli destek', included: false },
    ],
    color: {
      primary: '#6B7280',
      secondary: '#F3F4F6',
      gradient: 'from-gray-500 to-gray-600',
    },
    limits: {
      workspaces: 1,
      fileUploads: 3,
      dataRows: 10000,
      exports: 5,
      apiCalls: 0,
    },
  },
  {
    id: 'pro',
    name: 'Profesyonel',
    description: 'Büyüyen işletmeler için gelişmiş analiz araçları',
    price: {
      monthly: 299,
      yearly: 2990, // 2 ay ücretsiz
    },
    currency: 'TRY',
    popular: true,
    features: [
      { name: 'Gelişmiş dashboard', included: true },
      { name: 'Sınırsız dosya yükleme', included: true },
      { name: 'Tüm KPI\'lar', included: true, limit: '40+ KPI' },
      { name: 'İnteraktif grafikler', included: true },
      { name: 'Tüm export formatları', included: true },
      { name: 'Gelişmiş analizler', included: true },
      { name: 'AI destekli öngörüler', included: true },
      { name: 'Takım işbirliği', included: true, limit: '5 kullanıcı' },
      { name: 'API erişimi', included: true, limit: '1000 çağrı/ay' },
      { name: 'Email destek', included: true },
    ],
    color: {
      primary: '#3B82F6',
      secondary: '#EBF4FF',
      gradient: 'from-blue-500 to-blue-600',
    },
    limits: {
      workspaces: 10,
      fileUploads: 'unlimited',
      dataRows: 1000000,
      exports: 'unlimited',
      apiCalls: 1000,
    },
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    description: 'Büyük şirketler için tam özellikli çözüm',
    price: {
      monthly: 999,
      yearly: 9990, // 2 ay ücretsiz
    },
    currency: 'TRY',
    recommended: true,
    features: [
      { name: 'Kurumsal dashboard', included: true },
      { name: 'Sınırsız dosya yükleme', included: true },
      { name: 'Özelleştirilebilir KPI\'lar', included: true },
      { name: 'Gerçek zamanlı analizler', included: true },
      { name: 'Sınırsız export', included: true },
      { name: 'Gelişmiş AI analizleri', included: true },
      { name: 'Predictive analytics', included: true },
      { name: 'Sınırsız takım üyesi', included: true },
      { name: 'Tam API erişimi', included: true },
      { name: '7/24 öncelikli destek', included: true },
    ],
    color: {
      primary: '#7C3AED',
      secondary: '#F3F0FF',
      gradient: 'from-purple-500 to-purple-600',
    },
    limits: {
      workspaces: 'unlimited',
      fileUploads: 'unlimited',
      dataRows: 'unlimited',
      exports: 'unlimited',
      apiCalls: 'unlimited',
    },
  },
];

export const FEATURE_DESCRIPTIONS = {
  'Temel dashboard': 'Basit KPI kartları ve grafikler',
  'Gelişmiş dashboard': 'İnteraktif grafikler ve özelleştirilebilir layout',
  'Kurumsal dashboard': 'Tam özelleştirilebilir dashboard ve white-label seçenekleri',
  'CSV dosya yükleme': 'Excel, CSV ve JSON dosyalarını yükleyebilme',
  'Sınırsız dosya yükleme': 'Her türlü veri formatında sınırsız yükleme',
  'Temel KPI\'lar': 'Satış, müşteri ve ürün analizleri için temel metrikler',
  'Tüm KPI\'lar': '40+ profesyonel KPI ve analiz metriği',
  'Özelleştirilebilir KPI\'lar': 'Kendi KPI\'larınızı oluşturabilme',
  'Basit grafikler': 'Çizgi, bar ve pasta grafikleri',
  'İnteraktif grafikler': 'Hover efektleri, zoom ve filtreleme özellikleri',
  'Gerçek zamanlı analizler': 'Canlı veri güncellemeleri ve bildirimler',
  'PDF export': 'Raporları PDF formatında indirebilme',
  'Tüm export formatları': 'PDF, Excel, PNG ve PowerPoint export',
  'Sınırsız export': 'Hiçbir kısıtlama olmaksızın export işlemleri',
  'Gelişmiş analizler': 'Trend analizi, segment analizi ve karşılaştırmalar',
  'Gelişmiş AI analizleri': 'Makine öğrenmesi tabanlı derin analizler',
  'AI destekli öngörüler': 'Gelecek dönem tahminleri ve trend öngörüleri',
  'Predictive analytics': 'Gelişmiş tahminleme modelleri ve senaryo analizleri',
  'Takım işbirliği': 'Raporları paylaşabilme ve yorum yapabilme',
  'Sınırsız takım üyesi': 'Şirket genelinde sınırsız kullanıcı erişimi',
  'API erişimi': 'Programatik veri erişimi ve entegrasyonlar',
  'Tam API erişimi': 'Sınırsız API çağrıları ve webhook desteği',
  'Email destek': 'Email yoluyla teknik destek',
  '7/24 öncelikli destek': 'Telefon, email ve chat ile 7/24 öncelikli destek',
  'Öncelikli destek': 'Hızlı yanıt süreli teknik destek',
};

export const BILLING_CYCLES = [
  { id: 'monthly', name: 'Aylık', discount: 0 },
  { id: 'yearly', name: 'Yıllık', discount: 17 }, // ~2 ay ücretsiz
] as const;

export const CURRENCIES = {
  TRY: { symbol: '₺', name: 'Türk Lirası' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
} as const;