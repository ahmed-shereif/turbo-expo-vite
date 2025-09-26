import { Button, type ButtonProps, XStack, Text } from 'tamagui'
import { Icon, type IconName } from './Icon'
import { ButtonShadow } from './ShadowSystem'

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
      return { 
        bg: '$secondary', 
        color: '$primaryContrast', 
        border: 'transparent',
        hoverBg: '#10B981', // Darker green on hover
        shadowColor: 'secondary' as const
      }
    case 'outline':
      return { 
        bg: '$surface', 
        color: '$primary', 
        border: '$primary',
        hoverBg: '$primary',
        hoverColor: '$primaryContrast',
        shadowColor: 'primary' as const
      }
    case 'ghost':
      return { 
        bg: 'transparent', 
        color: '$primary', 
        border: 'transparent',
        hoverBg: 'rgba(30, 144, 255, 0.1)',
        shadowColor: 'default' as const
      }
    case 'primary':
    default:
      return { 
        bg: '$primary', 
        color: '$primaryContrast', 
        border: 'transparent',
        hoverBg: '#0066CC', // Darker blue on hover
        shadowColor: 'primary' as const
      }
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
  const { bg, color, border, hoverBg, hoverColor, shadowColor } = getColorsForVariant(variant)
  const { px, py, fontSize } = getPaddingsForSize(size)
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16

  const content = (
    <XStack alignItems="center" justifyContent="center" gap={6}>
      {icon && (
        <Icon 
          name={icon} 
          size={iconSize} 
          color={color}
        />
      )}
      <Text 
        color={color} 
        fontSize={fontSize} 
        fontWeight="700" 
        textTransform="uppercase" 
        letterSpacing={0.5}
        animation="quick"
        hoverStyle={{ color: hoverColor || color }}
      >
        {loading ? 'Please wait…' : children}
      </Text>
      {iconAfter && (
        <Icon 
          name={iconAfter} 
          size={iconSize} 
          color={color}
        />
      )}
    </XStack>
  )

  return (
    <ButtonShadow
      color={shadowColor}
      state="default"
      elevated={variant !== 'ghost'}
    >
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
        hoverStyle={{ 
          backgroundColor: hoverBg,
          scale: 1.02,
        }}
        pressStyle={{ 
          scale: 0.98, 
          opacity: 0.9,
        }}
        {...rest}
      >
        {content}
      </Button>
    </ButtonShadow>
  )
}


