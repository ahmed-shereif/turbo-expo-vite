// import React from 'react'
import { Button, type ButtonProps, XStack } from 'tamagui'
import { Icon, type IconName } from './Icon'
import { SafeText } from './SafeText'

type BrandVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

export interface BrandButtonProps extends Omit<ButtonProps, 'size' | 'variant' | 'icon' | 'iconAfter'> {
  variant?: BrandVariant
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  icon?: IconName
  iconAfter?: IconName
}

const getColorsForVariant = (variant: BrandVariant) => {
  switch (variant) {
    case 'secondary':
      return { bg: '$secondary', color: '$primaryContrast', border: 'transparent' }
    case 'outline':
      return { bg: '$surface', color: '$primary', border: '$primary' }
    case 'ghost':
      return { bg: 'transparent', color: '$primary', border: 'transparent' }
    case 'primary':
    default:
      return { bg: '$primary', color: '$primaryContrast', border: 'transparent' }
  }
}

const getPaddingsForSize = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return { px: '$4', py: '$3', fontSize: '$4' }
    case 'lg':
      return { px: '$6', py: '$4', fontSize: '$6' }
    case 'md':
    default:
      return { px: '$5', py: '$4', fontSize: '$5' }
  }
}

export function BrandButton({
  children,
  variant = 'primary',
  fullWidth,
  size = 'md',
  loading,
  icon,
  iconAfter,
  ...rest
}: BrandButtonProps) {
  const { bg, color, border } = getColorsForVariant(variant)
  const { px, py, fontSize } = getPaddingsForSize(size)
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16

  // Filter out props that shouldn't be passed to DOM elements
  const { 
    textAlign, 
    textTransform, 
    letterSpacing, 
    fontWeight, 
    fontFamily, 
    lineHeight,
    ...buttonProps 
  } = rest as any

  const content = (
    <XStack alignItems="center" justifyContent="center" gap={6}>
      {icon && <Icon name={icon} size={iconSize} color={color} />}
      <SafeText color={color} fontSize={fontSize} fontWeight="700" textTransform="uppercase" letterSpacing={0.5}>
        {loading ? 'Please wait…' : children}
      </SafeText>
      {iconAfter && <Icon name={iconAfter} size={iconSize} color={color} />}
    </XStack>
  )

  return (
    <Button
      width={fullWidth ? '100%' : undefined}
      backgroundColor={bg}
      color={color}
      borderColor={border}
      borderWidth={variant === 'outline' ? 2 : 0}
      borderRadius="$5"
      paddingHorizontal={px}
      paddingVertical={py}
      animation="quick"
      hoverStyle={{ opacity: 0.95 }}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      {...buttonProps}
    >
      {content}
    </Button>
  )
}


