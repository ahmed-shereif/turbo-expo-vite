// import React from 'react'
import { YStack, type StackProps } from 'tamagui'

export interface BrandCardProps extends StackProps {
  elevated?: boolean
}

export function BrandCard({ elevated = true, children, ...rest }: BrandCardProps) {
  return (
    <YStack
      backgroundColor="$surface"
      borderRadius="$5"
      padding="$4"
      borderWidth={1}
      borderColor="$color5"
      elevation={elevated ? 3 : 0}
      // Web shadow for depth
      style={{ boxShadow: elevated ? '0 4px 16px rgba(0,0,0,0.12)' : 'none' }}
      {...rest}
    >
      {children}
    </YStack>
  )
}


