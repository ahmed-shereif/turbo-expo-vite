import React from 'react'
import { YStack, XStack, Text, Label, type StackProps } from 'tamagui'
import { Icon } from './Icon'

export interface CheckboxFieldProps extends Omit<StackProps, 'children'> {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  error?: string
  required?: boolean
}

export function CheckboxField({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  error,
  required = false,
  ...rest
}: CheckboxFieldProps) {
  return (
    <YStack space="$2" {...rest}>
      <XStack 
        space="$3" 
        alignItems="center" 
        cursor={disabled ? 'not-allowed' : 'pointer'}
        opacity={disabled ? 0.6 : 1}
        onPress={disabled ? undefined : () => onCheckedChange(!checked)}
        pressStyle={{ opacity: 0.8 }}
      >
        <YStack
          width={20}
          height={20}
          borderRadius="$2"
          borderWidth={2}
          borderColor={checked ? '$primary' : '$color6'}
          backgroundColor={checked ? '$primary' : 'transparent'}
          alignItems="center"
          justifyContent="center"
        >
          {checked && (
            <Icon 
              name="Check" 
              size={12} 
              color="$primaryContrast" 
            />
          )}
        </YStack>
        
        <YStack flex={1}>
          <XStack alignItems="center" space="$1">
            <Text 
              fontSize="$4" 
              fontWeight="500" 
              color="$textHigh"
              cursor="inherit"
            >
              {label}
            </Text>
            {required && <Text color="$red10" fontSize="$4">*</Text>}
          </XStack>
          {description && (
            <Text 
              fontSize="$3" 
              color="$textMuted"
              cursor="inherit"
            >
              {description}
            </Text>
          )}
        </YStack>
      </XStack>
      
      {error && (
        <Text color="$red10" fontSize="$2" marginLeft="$8">
          {error}
        </Text>
      )}
    </YStack>
  )
}
