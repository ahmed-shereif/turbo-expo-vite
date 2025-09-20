import React from 'react'
import { View, Text } from '@tamagui/core'
import { BrandButton } from './BrandButton'
import { BrandCard } from './BrandCard'

type ErrorFallbackProps = {
  error: unknown
  resetErrorBoundary: () => void
  onReport?: (error: unknown) => void
}

export function ErrorFallback({ error, resetErrorBoundary, onReport }: ErrorFallbackProps) {
  const message = (error && typeof error === 'object' && 'message' in error)
    ? String((error as any).message)
    : 'Something went wrong.'

  return (
    <View flex={1} minHeight="100vh" justifyContent="center" alignItems="center" padding="$6" backgroundColor="$bgSoft">
      <BrandCard elevated width={520} maxWidth="94%">
        <View gap="$4">
          <Text fontSize="$8" fontWeight="800" color="$textHigh">Unexpected error</Text>
          <Text fontSize="$4" color="$textMedium">{message}</Text>
          <View flexDirection="row" gap="$3" marginTop="$2">
            <BrandButton onPress={resetErrorBoundary}>Try again</BrandButton>
            <BrandButton variant="outlined" onPress={() => onReport?.(error)}>Report issue</BrandButton>
          </View>
        </View>
      </BrandCard>
    </View>
  )
}

export default ErrorFallback


