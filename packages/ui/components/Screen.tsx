import React from 'react'
import { YStack, type StackProps } from 'tamagui'

export interface ScreenProps extends StackProps {
  children: React.ReactNode
  containerMaxWidth?: number | string
}

// Provides a consistent page background and centered content container
export function Screen({ children, containerMaxWidth = 1200, ...rest }: ScreenProps) {
  return (
    <YStack backgroundColor="$bgSoft" minHeight="100%" {...rest}>
      <YStack
        width="100%"
        maxWidth={containerMaxWidth}
        alignSelf="center"
        paddingHorizontal="$4"
        paddingVertical="$4"
        gap="$4"
      >
        {children}
      </YStack>
    </YStack>
  )
}

export default Screen


