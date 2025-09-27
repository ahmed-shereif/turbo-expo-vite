import React from 'react'
import { YStack, Text, Label, XStack, type StackProps } from 'tamagui'
import { TextField } from './TextField'
import { Icon } from './Icon'

export interface PriceInputProps extends Omit<StackProps, 'children'> {
  label: string
  description?: string
  value: number
  onValueChange: (value: number) => void
  currency?: string
  min?: number
  max?: number
  disabled?: boolean
  error?: string
  required?: boolean
}

export function PriceInput({
  label,
  description,
  value,
  onValueChange,
  currency = 'LE',
  min = 0,
  max = 999999,
  disabled = false,
  error,
  required = false,
  ...rest
}: PriceInputProps) {
  const handleTextChange = (text: string) => {
    const numericValue = parseInt(text.replace(/\D/g, '')) || 0
    const clampedValue = Math.min(Math.max(numericValue, min), max)
    onValueChange(clampedValue)
  }

  const formatValue = (val: number) => {
    return val === 0 ? '' : val.toString()
  }

  return (
    <YStack space="$2" {...rest}>
      <XStack alignItems="center" space="$1">
        <Label htmlFor={label} fontSize="$4" fontWeight="500" color="$textHigh">
          {label}
        </Label>
        {required && <Text color="$red10" fontSize="$4">*</Text>}
      </XStack>
      
      {description && (
        <Text fontSize="$3" color="$textMuted">
          {description}
        </Text>
      )}
      
      <XStack 
        alignItems="center" 
        backgroundColor="$surface"
        borderColor={error ? '$red10' : '$color6'}
        borderWidth={1}
        borderRadius="$4"
        paddingHorizontal="$4"
        minHeight={48}
        focusWithinStyle={{ 
          borderColor: error ? '$red10' : '$primary',
          outlineColor: error ? '$red10' : '$primary'
        }}
      >
        <TextField
          id={label}
          value={formatValue(value)}
          onChangeText={handleTextChange}
          placeholder={`${min}-${max}`}
          keyboardType="numeric"
          disabled={disabled}
          borderWidth={0}
          backgroundColor="transparent"
          paddingHorizontal={0}
          focusStyle={{ outlineColor: 'transparent' }}
          flex={1}
        />
        
        <XStack alignItems="center" space="$2" paddingLeft="$2">
          <Icon name="Coins" size={16} color="$textMuted" />
          <Text fontSize="$4" color="$textMuted" fontWeight="500">
            {currency}
          </Text>
        </XStack>
      </XStack>
      
      {error && (
        <Text color="$red10" fontSize="$2">
          {error}
        </Text>
      )}
    </YStack>
  )
}
