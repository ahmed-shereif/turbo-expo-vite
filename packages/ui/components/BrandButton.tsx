import React from 'react'
import { Button, type ButtonProps } from 'tamagui'

type BrandVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

export interface BrandButtonProps extends Omit<ButtonProps, 'size'> {
  variant?: BrandVariant
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
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
  ...rest
}: BrandButtonProps) {
  const { bg, color, border } = getColorsForVariant(variant)
  const { px, py, fontSize } = getPaddingsForSize(size)

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
      fontSize={fontSize}
      fontWeight="700"
      textTransform="uppercase"
      letterSpacing={0.5}
      animation="quick"
      hoverStyle={{ opacity: 0.95 }}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      {...rest}
    >
      {children}
    </Button>
  )
}


