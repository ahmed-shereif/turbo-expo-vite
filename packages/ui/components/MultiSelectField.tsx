import React, { useState } from 'react'
import { YStack, XStack, Text, Label, Input, ScrollView, type StackProps } from 'tamagui'
import { CheckboxField } from './CheckboxField'
import { Icon } from './Icon'

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface MultiSelectFieldProps extends Omit<StackProps, 'children'> {
  label: string
  description?: string
  options: MultiSelectOption[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  searchable?: boolean
  searchPlaceholder?: string
  maxHeight?: number
  disabled?: boolean
  error?: string
  required?: boolean
  selectAllLabel?: string
}

export function MultiSelectField({
  label,
  description,
  options,
  selectedValues,
  onSelectionChange,
  searchable = true,
  searchPlaceholder = "Search options...",
  maxHeight = 200,
  disabled = false,
  error,
  required = false,
  selectAllLabel = "Select All",
  ...rest
}: MultiSelectFieldProps) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const allSelected = filteredOptions.length > 0 && 
    filteredOptions.every(option => selectedValues.includes(option.value))
  
  const someSelected = filteredOptions.some(option => selectedValues.includes(option.value))
  
  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all filtered options
      const filteredValues = filteredOptions.map(option => option.value)
      onSelectionChange(selectedValues.filter(value => !filteredValues.includes(value)))
    } else {
      // Select all filtered options
      const newValues = [...new Set([...selectedValues, ...filteredOptions.map(option => option.value)])]
      onSelectionChange(newValues)
    }
  }
  
  const handleOptionToggle = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onSelectionChange(selectedValues.filter(value => value !== optionValue))
    } else {
      onSelectionChange([...selectedValues, optionValue])
    }
  }

  return (
    <YStack space="$3" {...rest}>
      <XStack alignItems="center" space="$1">
        <Label fontSize="$4" fontWeight="500" color="$textHigh">
          {label}
        </Label>
        {required && <Text color="$red10" fontSize="$4">*</Text>}
      </XStack>
      
      {description && (
        <Text fontSize="$3" color="$textMuted">
          {description}
        </Text>
      )}
      
      <YStack
        backgroundColor="$surface"
        borderColor={error ? '$red10' : '$color6'}
        borderWidth={1}
        borderRadius="$4"
        padding="$3"
        maxHeight={maxHeight + 60} // Account for search and select all
      >
        {searchable && (
          <XStack 
            alignItems="center" 
            space="$2" 
            paddingHorizontal="$2" 
            paddingVertical="$2"
            backgroundColor="$bgSoft"
            borderRadius="$3"
            marginBottom="$2"
          >
            <Icon name="Search" size={16} color="$textMuted" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChangeText={setSearchTerm}
              borderWidth={0}
              backgroundColor="transparent"
              flex={1}
              fontSize="$4"
              focusStyle={{ outlineColor: 'transparent' }}
            />
            {searchTerm && (
              <Icon 
                name="X" 
                size={16} 
                color="$textMuted"
                cursor="pointer"
                onPress={() => setSearchTerm('')}
              />
            )}
          </XStack>
        )}
        
        {filteredOptions.length > 0 && (
          <CheckboxField
            label={selectAllLabel}
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            disabled={disabled}
            paddingHorizontal="$2"
            paddingVertical="$1"
            backgroundColor={someSelected && !allSelected ? '$primary' : 'transparent'}
            opacity={someSelected && !allSelected ? 0.1 : 1}
          />
        )}
        
        <ScrollView maxHeight={maxHeight} showsVerticalScrollIndicator>
          <YStack space="$2" paddingTop="$2">
            {filteredOptions.map((option) => (
              <CheckboxField
                key={option.value}
                label={option.label}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={() => handleOptionToggle(option.value)}
                disabled={disabled || option.disabled}
                paddingHorizontal="$2"
                paddingVertical="$1"
              />
            ))}
          </YStack>
        </ScrollView>
        
        {filteredOptions.length === 0 && searchTerm && (
          <YStack alignItems="center" padding="$4">
            <Icon name="SearchX" size={24} color="$textMuted" />
            <Text color="$textMuted" fontSize="$3" textAlign="center">
              {`No options found for "${searchTerm}"`}
            </Text>
          </YStack>
        )}
      </YStack>
      
      {error && (
        <Text color="$red10" fontSize="$2">
          {error}
        </Text>
      )}
    </YStack>
  )
}
