import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { designTokens } from './tokens';

/**
 * Design System Utilities
 * Helper functions for consistent styling and component composition
 */

// Core utility function - combines clsx and tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Theme utilities
export const themeUtils = {
  // Get current theme
  getCurrentTheme: (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  // Apply theme classes
  getThemeClasses: (theme: 'light' | 'dark') => {
    return theme === 'dark' ? 'dark' : '';
  },

  // Get theme-specific color
  getThemeColor: (colorKey: keyof typeof designTokens.themes.light, theme: 'light' | 'dark' = 'light') => {
    return designTokens.themes[theme][colorKey];
  }
};

// Color utilities
export const colorUtils = {
  // Generate color classes
  getColorClasses: (color: string, variant: 'background' | 'text' | 'border' = 'background') => {
    const colorMap = {
      primary: {
        background: 'bg-primary-500',
        text: 'text-primary-500',
        border: 'border-primary-500'
      },
      secondary: {
        background: 'bg-secondary-500',
        text: 'text-secondary-500',
        border: 'border-secondary-500'
      },
      success: {
        background: 'bg-green-500',
        text: 'text-green-500',
        border: 'border-green-500'
      },
      warning: {
        background: 'bg-yellow-500',
        text: 'text-yellow-500',
        border: 'border-yellow-500'
      },
      error: {
        background: 'bg-red-500',
        text: 'text-red-500',
        border: 'border-red-500'
      }
    };

    return colorMap[color as keyof typeof colorMap]?.[variant] || '';
  },

  // Get gradient classes
  getGradientClasses: (gradient: keyof typeof designTokens.colors.gradients) => {
    return `bg-gradient-to-r ${designTokens.colors.gradients[gradient]}`;
  },

  // Get chart color by index
  getChartColor: (index: number) => {
    return designTokens.colors.chart[index % designTokens.colors.chart.length];
  }
};

// Typography utilities
export const typographyUtils = {
  // Get heading classes
  getHeadingClasses: (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    const headingMap = {
      1: 'text-4xl font-bold leading-tight',
      2: 'text-3xl font-bold leading-tight',
      3: 'text-2xl font-semibold leading-normal',
      4: 'text-xl font-semibold leading-normal',
      5: 'text-lg font-medium leading-normal',
      6: 'text-base font-medium leading-normal'
    };

    return headingMap[level];
  },

  // Get text size classes
  getTextSizeClasses: (size: keyof typeof designTokens.typography.fontSize) => {
    const sizeMap = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
      '7xl': 'text-7xl'
    };

    return sizeMap[size] || 'text-base';
  },

  // Get font weight classes
  getFontWeightClasses: (weight: keyof typeof designTokens.typography.fontWeight) => {
    const weightMap = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold'
    };

    return weightMap[weight] || 'font-normal';
  }
};

// Spacing utilities
export const spacingUtils = {
  // Get padding classes
  getPaddingClasses: (
    size: keyof typeof designTokens.spacing,
    direction?: 'x' | 'y' | 't' | 'r' | 'b' | 'l'
  ) => {
    const prefix = direction ? `p${direction}` : 'p';
    return `${prefix}-${size}`;
  },

  // Get margin classes
  getMarginClasses: (
    size: keyof typeof designTokens.spacing,
    direction?: 'x' | 'y' | 't' | 'r' | 'b' | 'l'
  ) => {
    const prefix = direction ? `m${direction}` : 'm';
    return `${prefix}-${size}`;
  },

  // Get gap classes
  getGapClasses: (size: keyof typeof designTokens.spacing, direction?: 'x' | 'y') => {
    const prefix = direction ? `gap-${direction}` : 'gap';
    return `${prefix}-${size}`;
  }
};

// Component variant utilities
export const variantUtils = {
  // Button variants
  getButtonVariant: (variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' = 'primary') => {
    const variants = {
      primary: 'bg-primary-500 hover:bg-primary-600 text-white border-transparent',
      secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-900 border-transparent',
      outline: 'border-primary-500 text-primary-500 hover:bg-primary-50 bg-transparent',
      ghost: 'hover:bg-secondary-100 text-secondary-900 border-transparent bg-transparent',
      destructive: 'bg-red-500 hover:bg-red-600 text-white border-transparent'
    };

    return variants[variant];
  },

  // Card variants
  getCardVariant: (variant: 'default' | 'outlined' | 'elevated' | 'glass' = 'default') => {
    const variants = {
      default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      outlined: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
      elevated: 'bg-white dark:bg-gray-800 shadow-lg border-0',
      glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20'
    };

    return variants[variant];
  },

  // Badge variants
  getBadgeVariant: (variant: 'default' | 'secondary' | 'success' | 'warning' | 'error' = 'default') => {
    const variants = {
      default: 'bg-primary-100 text-primary-800 border-primary-200',
      secondary: 'bg-gray-100 text-gray-800 border-gray-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };

    return variants[variant];
  }
};

// Animation utilities
export const animationUtils = {
  // Get transition classes
  getTransitionClasses: (
    property: 'all' | 'colors' | 'opacity' | 'shadow' | 'transform' = 'all',
    duration: keyof typeof designTokens.animations.duration = 'normal'
  ) => {
    const transitionMap = {
      all: 'transition-all',
      colors: 'transition-colors',
      opacity: 'transition-opacity',
      shadow: 'transition-shadow',
      transform: 'transition-transform'
    };

    const durationMap = {
      fast: 'duration-150',
      normal: 'duration-300',
      slow: 'duration-500',
      slower: 'duration-750'
    };

    return `${transitionMap[property]} ${durationMap[duration]} ease-in-out`;
  },

  // Get animation classes
  getAnimationClasses: (animation: 'pulse' | 'spin' | 'ping' | 'bounce') => {
    const animationMap = {
      pulse: 'animate-pulse',
      spin: 'animate-spin',
      ping: 'animate-ping',
      bounce: 'animate-bounce'
    };

    return animationMap[animation];
  },

  // Get hover animation classes
  getHoverAnimationClasses: (type: 'scale' | 'lift' | 'glow' = 'scale') => {
    const hoverMap = {
      scale: 'hover:scale-105 transition-transform duration-200',
      lift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
      glow: 'hover:shadow-lg hover:shadow-primary-500/25 transition-shadow duration-200'
    };

    return hoverMap[type];
  }
};

// Accessibility utilities
export const a11yUtils = {
  // Get focus ring classes
  getFocusRingClasses: (color: 'primary' | 'secondary' | 'error' = 'primary') => {
    const colorMap = {
      primary: 'focus:ring-primary-500',
      secondary: 'focus:ring-gray-500',
      error: 'focus:ring-red-500'
    };

    return `focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorMap[color]}`;
  },

  // Get screen reader only classes
  getSrOnlyClasses: () => {
    return 'sr-only';
  },

  // Get skip link classes
  getSkipLinkClasses: () => {
    return 'absolute -top-40 left-6 z-50 bg-white px-4 py-2 text-black transition-all focus:top-6';
  },

  // Check if color meets contrast requirements
  meetsContrastRequirement: (
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA'
  ): boolean => {
    // This is a simplified check - in a real implementation,
    // you would use a proper contrast ratio calculation library
    const requirements = {
      AA: designTokens.accessibility.contrast.normal,
      AAA: designTokens.accessibility.contrast.enhanced
    };

    // Placeholder implementation
    return true; // Would calculate actual contrast ratio
  }
};

// Responsive utilities
export const responsiveUtils = {
  // Get responsive classes
  getResponsiveClasses: (
    baseClass: string,
    breakpoints: Partial<Record<keyof typeof designTokens.breakpoints, string>>
  ) => {
    const responsiveClasses = [baseClass];

    Object.entries(breakpoints).forEach(([breakpoint, className]) => {
      if (breakpoint === 'xs') {
        responsiveClasses.push(className);
      } else {
        responsiveClasses.push(`${breakpoint}:${className}`);
      }
    });

    return responsiveClasses.join(' ');
  },

  // Get container classes
  getContainerClasses: (maxWidth?: keyof typeof designTokens.breakpoints) => {
    const baseClasses = 'mx-auto px-4 sm:px-6 lg:px-8';
    
    if (maxWidth) {
      const maxWidthMap = {
        xs: 'max-w-sm',
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-xl',
        xl: 'max-w-2xl',
        '2xl': 'max-w-4xl'
      };
      
      return `${baseClasses} ${maxWidthMap[maxWidth] || 'max-w-7xl'}`;
    }

    return `${baseClasses} max-w-7xl`;
  }
};

// Layout utilities
export const layoutUtils = {
  // Get grid classes
  getGridClasses: (
    cols: number,
    gap?: keyof typeof designTokens.spacing,
    responsive?: Partial<Record<keyof typeof designTokens.breakpoints, number>>
  ) => {
    const colMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12'
    };

    let classes = `grid ${colMap[cols] || 'grid-cols-1'}`;
    
    if (gap) {
      classes += ` gap-${gap}`;
    }

    if (responsive) {
      Object.entries(responsive).forEach(([breakpoint, colCount]) => {
        const responsiveClass = colMap[colCount as number];
        if (responsiveClass) {
          classes += ` ${breakpoint}:${responsiveClass}`;
        }
      });
    }

    return classes;
  },

  // Get flex classes
  getFlexClasses: (
    direction: 'row' | 'col' = 'row',
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly',
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline',
    wrap?: boolean
  ) => {
    let classes = `flex flex-${direction}`;
    
    if (justify) {
      const justifyMap = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly'
      };
      classes += ` ${justifyMap[justify]}`;
    }

    if (align) {
      const alignMap = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
        baseline: 'items-baseline'
      };
      classes += ` ${alignMap[align]}`;
    }

    if (wrap) {
      classes += ' flex-wrap';
    }

    return classes;
  }
};

// Export all utilities
export const designSystemUtils = {
  cn,
  theme: themeUtils,
  color: colorUtils,
  typography: typographyUtils,
  spacing: spacingUtils,
  variant: variantUtils,
  animation: animationUtils,
  a11y: a11yUtils,
  responsive: responsiveUtils,
  layout: layoutUtils
};

export default designSystemUtils;