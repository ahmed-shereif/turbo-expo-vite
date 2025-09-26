import { YStack, type StackProps } from 'tamagui'
import { CardShadow } from './ShadowSystem'

export interface BrandCardProps extends StackProps {
  elevated?: boolean
}

export function BrandCard({ elevated = true, children, ...rest }: BrandCardProps) {
  return (
    <CardShadow
      elevated={elevated}
      color="default"
    >
      <YStack
        backgroundColor="$surface"
        borderRadius="$5"
        padding="$4"
        borderWidth={1}
        borderColor="$color5"
        {...rest}
      >
        {children}
      </YStack>
    </CardShadow>
  )
}


