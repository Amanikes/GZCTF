import { generateColors } from '@mantine/colors-generator'
import {
  ActionIcon,
  Avatar,
  Badge,
  Code,
  Loader,
  MantineThemeOverride,
  Menu,
  Modal,
  Popover,
  Switch,
  Tabs,
  Tooltip,
  TooltipFloating,
  useMantineTheme,
} from '@mantine/core'
import { createStyles } from '@mantine/emotion'
import { useLocalStorage, useMediaQuery } from '@mantine/hooks'
import { useMemo } from 'react'
import { useConfig } from '@Hooks/useConfig'
import tooltipClasses from '@Styles/Tooltip.module.css'

const CustomTheme: MantineThemeOverride = {
  colors: {
    gray: [
      '#F8FAFC',
      '#F1F5F9',
      '#E2E8F0',
      '#CBD5E1',
      '#94A3B8',
      '#64748B',
      '#475569',
      '#1E293B',
      '#0F172A',
      '#020617',
    ],
    brand: [
      '#FEF2F2',
      '#FEE2E2',
      '#FECACA',
      '#FCA5A5',
      '#F87171',
      '#EF4444',
      '#DC2626',
      '#B91C1C',
      '#991B1B',
      '#7F1D1D',
    ],
    alert: [
      '#FFB4B4',
      '#FFA0A0',
      '#FF8c8c',
      '#FF7878',
      '#FF6464',
      '#FE5050',
      '#FE3c3c',
      '#FE2828',
      '#FC1414',
      '#FC0000',
    ],
    light: [
      '#FFFFFF',
      '#F8F8F8',
      '#EFEFEF',
      '#E0E0E0',
      '#DFDFDF',
      '#D0D0D0',
      '#CFCFCF',
      '#C0C0C0',
      '#BFBFBF',
      '#B0B0B0',
    ],
    dark: [
      '#F8FAFC',
      '#E2E8F0',
      '#94A3B8',
      '#7C8DA6',
      '#334155',
      '#273449',
      '#1E293B',
      '#0F172A',
      '#0B1220',
      '#020617',
    ],
  },
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 6 },
  defaultRadius: 'md',
  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.625rem',
    lg: '0.875rem',
    xl: '1.25rem',
  },
  fontFamily:
    'Geist, Lexend, -apple-system, BlinkMacSystemFont, Helvetica Neue, PingFang SC, Microsoft YaHei, Source Han Sans SC, Noto Sans CJK SC, sans-serif',
  fontFamilyMonospace:
    'Geist Mono, JetBrains Mono, ui-monospace, SFMono-Regular, Monaco, Consolas, Courier New, monospace, sans-serif',
  headings: {
    fontFamily: 'Geist, Lexend, sans-serif',
  },
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '74em',
    xl: '90em',
    w18: '1800px',
    w24: '2400px',
    w30: '3000px',
    w36: '3600px',
    w42: '4200px',
    w48: '4800px',
  },
  components: {
    Loader: Loader.extend({
      defaultProps: {
        type: 'bars',
      },
    }),
    Switch: Switch.extend({
      styles: {
        body: {
          alignItems: 'center',
        },
        labelWrapper: {
          display: 'flex',
        },
      },
    }),
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        styles: {
          title: {
            fontWeight: 'bold',
          },
        },
      },
    }),
    Popover: Popover.extend({
      defaultProps: {
        withinPortal: true,
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        variant: 'transparent',
      },
    }),
    Badge: Badge.extend({
      defaultProps: {
        variant: 'outline',
        autoContrast: true,
      },
    }),
    Tabs: Tabs.extend({
      styles: {
        tab: {
          padding: 'var(--mantine-spacing-xs)',
          fontWeight: 500,
        },
      },
    }),
    Avatar: Avatar.extend({
      defaultProps: {
        color: 'brand',
      },
    }),
    Menu: Menu.extend({
      styles: {
        item: {
          fontWeight: 500,
        },
      },
    }),
    Code: Code.extend({
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    }),
    Tooltip: Tooltip.extend({
      classNames: tooltipClasses,
    }),
    TooltipFloating: TooltipFloating.extend({
      classNames: tooltipClasses,
    }),
  },
}

export enum ColorProvider {
  Managed = 'Managed',
  Default = 'Default',
  Custom = 'Custom',
}

export interface CustomColor {
  provider: ColorProvider
  color: string
}

export const useCustomColor = () => {
  const [customColor, setCustomColorInner] = useLocalStorage<CustomColor>({
    key: 'custom-theme',
    defaultValue: { provider: ColorProvider.Managed, color: '' } as CustomColor,
    getInitialValueInEffect: false,
    serialize: (value: CustomColor) => {
      if (value.provider === ColorProvider.Custom && /^#[0-9A-F]{6}$/i.test(value.color)) {
        return value.color
      } else if (value.provider === ColorProvider.Managed) {
        return ''
      } else {
        return 'brand'
      }
    },
    deserialize: (value?: string) => {
      if (typeof value !== 'string') return { provider: ColorProvider.Managed, color: '' }

      if (value === 'brand') {
        return { provider: ColorProvider.Default, color: '' }
      } else if (/^#[0-9A-F]{6}$/i.test(value)) {
        return { provider: ColorProvider.Custom, color: value }
      } else {
        return { provider: ColorProvider.Managed, color: '' }
      }
    },
  })

  const setCustomColor = (color: CustomColor) => {
    // validate custom color, do not save invalid values
    if (color.provider === ColorProvider.Custom && !/^#[0-9A-F]{6}$/i.test(color.color)) return

    setCustomColorInner(color)
  }

  // color: null for use platform color, 'brand' for default theme
  //        or hex color string for custom color
  return { customColor, setCustomColor }
}

export const useCustomTheme = () => {
  const { config } = useConfig()
  const { customColor } = useCustomColor()

  const resolveManaged = (color: string | null | undefined) => {
    return color && /^#[0-9A-F]{6}$/i.test(color) ? color : null
  }

  const theme = useMemo<MantineThemeOverride>(() => {
    if (customColor.provider === ColorProvider.Default) {
      return CustomTheme
    }

    const resolvedColor =
      customColor.provider === ColorProvider.Custom
        ? customColor.color
        : customColor.provider === ColorProvider.Managed
          ? resolveManaged(config.customTheme)
          : null

    if (!resolvedColor) {
      return CustomTheme
    }

    return {
      ...CustomTheme,
      colors: {
        ...CustomTheme.colors,
        custom: generateColors(resolvedColor),
      },
      components: {
        ...CustomTheme.components,
        Avatar: Avatar.extend({
          defaultProps: {
            color: 'custom',
          },
        }),
      },
      primaryColor: 'custom',
    }
  }, [customColor, config.customTheme])

  return { theme }
}

export const useIsMobile = (limit?: number) => {
  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${limit ? `${limit}px` : theme.breakpoints.sm})`)
  return isMobile
}

interface UseDisplayInputStylesProps {
  ff?: 'monospace' | 'text'
  fw?: React.CSSProperties['fontWeight']
  lh?: React.CSSProperties['lineHeight']
  cs?: React.CSSProperties['cursor']
}

export const useDisplayInputStyles = createStyles(
  (theme, { fw = 'normal', lh = '1.5rem', ff = 'text', cs = 'auto' }: UseDisplayInputStylesProps) => ({
    wrapper: {
      width: '100%',
    },
    input: {
      fontWeight: fw,
      fontFamily: ff === 'text' ? theme.fontFamily : theme.fontFamilyMonospace,
      height: lh,
      lineHeight: lh,
      cursor: cs,
      userSelect: 'none',
      minHeight: '1rem',
      maxHeight: '2rem',
    },
  })
)
