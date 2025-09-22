import { View, type ViewProps } from 'tamagui'

export type ShadowLevel = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type ShadowColor = 'default' | 'primary' | 'secondary' | 'accent'
export type ShadowState = 'default' | 'hover' | 'pressed'

export interface ShadowProps extends Omit<ViewProps, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'> {
  level?: ShadowLevel
  color?: ShadowColor
  state?: ShadowState
  elevated?: boolean
}

const getShadowProps = (level: ShadowLevel, color: ShadowColor, state: ShadowState, elevated: boolean) => {
  if (!elevated) {
    return {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    }
  }

  // Base shadow values
  const shadowValues = {
    xs: { offset: { width: 0, height: 1 }, opacity: 0.05, radius: 2, elevation: 1 },
    sm: { offset: { width: 0, height: 1 }, opacity: 0.1, radius: 3, elevation: 2 },
    md: { offset: { width: 0, height: 4 }, opacity: 0.07, radius: 6, elevation: 3 },
    lg: { offset: { width: 0, height: 10 }, opacity: 0.1, radius: 15, elevation: 4 },
    xl: { offset: { width: 0, height: 20 }, opacity: 0.1, radius: 25, elevation: 5 },
    '2xl': { offset: { width: 0, height: 25 }, opacity: 0.15, radius: 50, elevation: 6 },
  }

  // Color mapping
  const colorValues = {
    default: '$color8',
    primary: '$primary',
    secondary: '$secondary',
    accent: '$accent',
  }

  // State modifications
  const stateModifiers = {
    default: { multiplier: 1, offsetMultiplier: 1 },
    hover: { multiplier: 1.2, offsetMultiplier: 1.5 },
    pressed: { multiplier: 0.8, offsetMultiplier: 0.5 },
  }

  const baseShadow = shadowValues[level]
  const colorValue = colorValues[color]
  const modifier = stateModifiers[state]

  return {
    shadowColor: colorValue,
    shadowOffset: {
      width: baseShadow.offset.width * modifier.offsetMultiplier,
      height: baseShadow.offset.height * modifier.offsetMultiplier,
    },
    shadowOpacity: baseShadow.opacity * modifier.multiplier,
    shadowRadius: baseShadow.radius * modifier.multiplier,
    elevation: Math.round(baseShadow.elevation * modifier.multiplier),
  }
}

export function ShadowView({
  level = 'md',
  color = 'default',
  state = 'default',
  elevated = true,
  children,
  ...rest
}: ShadowProps) {
  const shadowProps = getShadowProps(level, color, state, elevated)

  return (
    <View
      {...shadowProps}
      {...rest}
    >
      {children}
    </View>
  )
}

// Convenience components for common use cases
export function CardShadow({ children, ...rest }: Omit<ShadowProps, 'level'>) {
  return (
    <ShadowView level="md" {...rest}>
      {children}
    </ShadowView>
  )
}

export function ButtonShadow({ children, ...rest }: Omit<ShadowProps, 'level'>) {
  return (
    <ShadowView level="sm" {...rest}>
      {children}
    </ShadowView>
  )
}

export function ModalShadow({ children, ...rest }: Omit<ShadowProps, 'level'>) {
  return (
    <ShadowView level="xl" {...rest}>
      {children}
    </ShadowView>
  )
}

export function FloatingShadow({ children, ...rest }: Omit<ShadowProps, 'level'>) {
  return (
    <ShadowView level="lg" {...rest}>
      {children}
    </ShadowView>
  )
}
