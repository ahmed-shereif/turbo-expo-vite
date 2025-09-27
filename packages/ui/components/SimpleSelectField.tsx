import React, { useState, useRef, useEffect } from 'react'
import { YStack, XStack, Text, Label, Button, type StackProps } from 'tamagui'
import { Icon } from './Icon'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SimpleSelectFieldProps extends Omit<StackProps, 'children'> {
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

export function SimpleSelectField({
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
}: SimpleSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const selectedOption = options.find(option => option.value === value)
  const displayValue = selectedOption ? selectedOption.label : placeholder

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <YStack space="$2" position="relative" ref={containerRef} {...rest}>
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
      
      <Button
        id={label}
        backgroundColor="$surface"
        borderColor={error ? '$red10' : '$color6'}
        borderWidth={1}
        borderRadius="$4"
        paddingHorizontal="$4"
        paddingVertical="$3"
        minHeight={48}
        justifyContent="space-between"
        alignItems="center"
        disabled={disabled}
        onPress={() => setIsOpen(!isOpen)}
        focusStyle={{ 
          borderColor: error ? '$red10' : '$primary',
          outlineColor: error ? '$red10' : '$primary'
        }}
        pressStyle={{
          backgroundColor: '$bgSoft'
        }}
      >
        <Text 
          color={selectedOption ? '$textHigh' : '$textMuted'} 
          fontSize="$4"
          flex={1}
        >
          {displayValue}
        </Text>
        <Icon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          color="$textMuted" 
        />
      </Button>
      
      {isOpen && (
        <YStack
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          backgroundColor="$surface"
          borderRadius="$4"
          borderWidth={1}
          borderColor="$color6"
          elevation={8}
          maxHeight={200}
          overflow="hidden"
          marginTop="$1"
        >
          <YStack maxHeight={200} overflow="scroll">
            {options.map((option) => (
              <Button
                key={option.value}
                backgroundColor="transparent"
                paddingHorizontal="$4"
                paddingVertical="$3"
                justifyContent="flex-start"
                alignItems="center"
                disabled={option.disabled || disabled}
                onPress={() => {
                  onValueChange(option.value)
                  setIsOpen(false)
                }}
                hoverStyle={{
                  backgroundColor: '$bgSoft'
                }}
                pressStyle={{
                  backgroundColor: '$primary',
                  color: '$primaryContrast'
                }}
                opacity={option.disabled ? 0.5 : 1}
              >
                <Text 
                  color={option.disabled ? '$textMuted' : '$textHigh'}
                  fontSize="$4"
                  flex={1}
                >
                  {option.label}
                </Text>
                {value === option.value && (
                  <Icon name="Check" size={16} color="$primary" marginLeft="$2" />
                )}
              </Button>
            ))}
          </YStack>
        </YStack>
      )}
      
      {error && (
        <Text color="$red10" fontSize="$2">
          {error}
        </Text>
      )}
    </YStack>
  )
}
