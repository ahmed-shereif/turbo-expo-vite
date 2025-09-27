import React from 'react'
import { YStack, Text, Label, Select, type StackProps } from 'tamagui'
import { Icon } from './Icon'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectFieldProps extends Omit<StackProps, 'children'> {
  label: string
  description?: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  error?: string
  required?: boolean
}

export function SelectField({
  label,
  description,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  error,
  required = false,
  ...rest
}: SelectFieldProps) {
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
      
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled}
        native={false}
      >
        <Select.Trigger
          id={label}
          backgroundColor="$surface"
          borderColor={error ? '$red10' : '$color6'}
          borderWidth={1}
          borderRadius="$4"
          paddingHorizontal="$4"
          paddingVertical="$3"
          minHeight={48}
          focusStyle={{ 
            borderColor: error ? '$red10' : '$primary',
            outlineColor: error ? '$red10' : '$primary'
          }}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon marginLeft="auto">
            <Icon name="ChevronDown" size={16} color="$textMuted" />
          </Select.Icon>
        </Select.Trigger>
        
        <Select.Content
          zIndex={1000}
          backgroundColor="$surface"
          borderRadius="$4"
          borderWidth={1}
          borderColor="$color6"
          elevation={8}
          maxHeight={200}
          overflow="hidden"
          position="relative"
        >
          <Select.Viewport padding="$2">
            {options.map((option, index) => (
              <Select.Item 
                key={option.value} 
                index={index} 
                value={option.value}
                disabled={option.disabled}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$3"
                hoverStyle={{
                  backgroundColor: '$bgSoft'
                }}
                focusStyle={{
                  backgroundColor: '$primary',
                  color: '$primaryContrast'
                }}
              >
                <Select.ItemText color="$textHigh">
                  {option.label}
                </Select.ItemText>
                <Select.ItemIndicator marginLeft="auto">
                  <Icon name="Check" size={16} color="$primary" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select>
      
      {error && (
        <Text color="$red10" fontSize="$2">
          {error}
        </Text>
      )}
    </YStack>
  )
}
