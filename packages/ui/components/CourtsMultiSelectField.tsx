import React, { useState } from 'react'
import { YStack, XStack, Text, Label, Input, ScrollView, type StackProps } from 'tamagui'
import { CheckboxField } from './CheckboxField'
import { Icon } from './Icon'

export interface Court {
  id: string
  name: string
  area?: string
}

export interface CourtsMultiSelectFieldProps extends Omit<StackProps, 'children'> {
  label: string
  description?: string
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  courts: Court[]
  isLoading?: boolean
  error?: string
  searchable?: boolean
  searchPlaceholder?: string
  maxHeight?: number
  disabled?: boolean
  required?: boolean
  selectAllLabel?: string
}

export function CourtsMultiSelectField({
  label,
  description,
  selectedValues,
  onSelectionChange,
  courts,
  isLoading = false,
  error: courtsError,
  searchable = true,
  searchPlaceholder = "Search courts...",
  maxHeight = 200,
  disabled = false,
  error,
  required = false,
  selectAllLabel = "Select All Courts",
  ...rest
}: CourtsMultiSelectFieldProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  
  const filteredCourts = courts.filter(court =>
    court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (court.area && court.area.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
  const allSelected = filteredCourts.length > 0 && 
    filteredCourts.every(court => selectedValues.includes(court.id))
  
  const someSelected = filteredCourts.some(court => selectedValues.includes(court.id))
  
  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all filtered courts
      const filteredIds = filteredCourts.map(court => court.id)
      onSelectionChange(selectedValues.filter(id => !filteredIds.includes(id)))
    } else {
      // Select all filtered courts
      const newValues = [...new Set([...selectedValues, ...filteredCourts.map(court => court.id)])]
      onSelectionChange(newValues)
    }
  }
  
  const handleCourtToggle = (courtId: string) => {
    if (selectedValues.includes(courtId)) {
      onSelectionChange(selectedValues.filter(id => id !== courtId))
    } else {
      onSelectionChange([...selectedValues, courtId])
    }
  }

  const selectedCourts = courts.filter(court => selectedValues.includes(court.id))
  const displayText = selectedCourts.length === 0 
    ? "Select courts..." 
    : selectedCourts.length === 1 
      ? selectedCourts[0].name
      : `${selectedCourts.length} courts selected`

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
        maxHeight={maxHeight + 60}
      >
        <XStack 
          alignItems="center" 
          space="$2" 
          paddingHorizontal="$2" 
          paddingVertical="$2"
          backgroundColor="$bgSoft"
          borderRadius="$3"
          marginBottom="$2"
          onPress={() => setIsOpen(!isOpen)}
          cursor="pointer"
        >
          <Text 
            color={selectedValues.length > 0 ? '$textHigh' : '$textMuted'} 
            fontSize="$4"
            flex={1}
          >
            {displayText}
          </Text>
          <Icon 
            name={isOpen ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            color="$textMuted" 
          />
        </XStack>
        
        {isOpen && (
          <YStack space="$2">
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
            
            {isLoading && (
              <Text fontSize="$3" color="$textMuted" textAlign="center" padding="$2">
                Loading courts...
              </Text>
            )}
            
            {courtsError && (
              <Text fontSize="$3" color="$red10" textAlign="center" padding="$2">
                Error loading courts
              </Text>
            )}
            
            {!isLoading && !courtsError && courts.length === 0 && (
              <Text fontSize="$3" color="$textMuted" textAlign="center" padding="$2">
                No courts available
              </Text>
            )}
            
            {!isLoading && !courtsError && courts.length > 0 && filteredCourts.length === 0 && (
              <Text fontSize="$3" color="$textMuted" textAlign="center" padding="$2">
                No courts match your search
              </Text>
            )}
            
            {!isLoading && !courtsError && filteredCourts.length > 0 && (
              <>
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
                
                <ScrollView maxHeight={maxHeight} showsVerticalScrollIndicator>
                  <YStack space="$2" paddingTop="$2">
                    {filteredCourts.map((court) => (
                      <CheckboxField
                        key={court.id}
                        label={court.area ? `${court.name} • ${court.area}` : court.name}
                        checked={selectedValues.includes(court.id)}
                        onCheckedChange={() => handleCourtToggle(court.id)}
                        disabled={disabled}
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                      />
                    ))}
                  </YStack>
                </ScrollView>
              </>
            )}
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
