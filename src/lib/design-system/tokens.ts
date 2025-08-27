/**
 * Design System Tokens
 * Centralized design tokens for consistent styling across the application
 */

// Color System
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main brand color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  // Chart Colors - Professional palette
  chart: [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#6366f1', // Indigo
    '#84cc16', // Lime
    '#f97316', // Orange
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#a855f7'  // Violet
  ],

  // Gradient Combinations
  gradients: {
    primary: 'from-blue-600 to-blue-700',
    secondary: 'from-gray-600 to-gray-700',
    success: 'from-green-600 to-green-700',
    warning: 'from-yellow-500 to-orange-600',
    error: 'from-red-600 to-red-700',
    purple: 'from-purple-600 to-purple-700',
    blue: 'from-blue-500 to-cyan-600',
    rainbow: 'from-blue-600 via-purple-600 to-cyan-600'
  }
};

// Typography System
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['Monaco', 'Consolas', 'monospace']
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

// Spacing System (based on 4px grid)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

// Border Radius System
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

// Shadow System
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none'
};

// Animation & Transitions
export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms'
  },

  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' }
    },
    slideInUp: {
      '0%': { transform: 'translateY(100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' }
    },
    slideInDown: {
      '0%': { transform: 'translateY(-100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' }
    },
    scaleIn: {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' }
    },
    spin: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' }
    }
  }
};

// Breakpoints for responsive design
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
};

// Icon sizes
export const iconSizes = {
  xs: '12px',
  sm: '16px',
  base: '20px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px'
};

// Component specific tokens
export const components = {
  button: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px'
    },
    padding: {
      sm: '8px 12px',
      md: '12px 16px',
      lg: '16px 24px'
    }
  },

  input: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px'
    }
  },

  card: {
    padding: {
      sm: '16px',
      md: '24px',
      lg: '32px'
    }
  },

  modal: {
    maxWidth: {
      sm: '400px',
      md: '600px',
      lg: '800px',
      xl: '1200px'
    }
  }
};

// Accessibility tokens
export const accessibility = {
  focusRing: {
    width: '2px',
    style: 'solid',
    color: colors.primary[500],
    offset: '2px'
  },

  contrast: {
    // WCAG AA compliance ratios
    normal: 4.5,
    large: 3,
    enhanced: 7 // AAA compliance
  },

  minTarget: {
    // Minimum touch target size
    size: '44px'
  }
};

// Theme variants
export const themes = {
  light: {
    background: colors.secondary[50],
    foreground: colors.secondary[900],
    muted: colors.secondary[100],
    mutedForeground: colors.secondary[600],
    popover: '#ffffff',
    popoverForeground: colors.secondary[900],
    card: '#ffffff',
    cardForeground: colors.secondary[900],
    border: colors.secondary[200],
    input: colors.secondary[200],
    primary: colors.primary[500],
    primaryForeground: '#ffffff',
    secondary: colors.secondary[100],
    secondaryForeground: colors.secondary[900],
    accent: colors.secondary[100],
    accentForeground: colors.secondary[900],
    destructive: colors.error[500],
    destructiveForeground: '#ffffff',
    ring: colors.primary[500]
  },

  dark: {
    background: colors.secondary[950],
    foreground: colors.secondary[50],
    muted: colors.secondary[900],
    mutedForeground: colors.secondary[400],
    popover: colors.secondary[900],
    popoverForeground: colors.secondary[50],
    card: colors.secondary[900],
    cardForeground: colors.secondary[50],
    border: colors.secondary[800],
    input: colors.secondary[800],
    primary: colors.primary[500],
    primaryForeground: '#ffffff',
    secondary: colors.secondary[800],
    secondaryForeground: colors.secondary[50],
    accent: colors.secondary[800],
    accentForeground: colors.secondary[50],
    destructive: colors.error[500],
    destructiveForeground: '#ffffff',
    ring: colors.primary[500]
  }
};

// Export default theme configuration
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  iconSizes,
  components,
  accessibility,
  themes
};

export default designTokens;