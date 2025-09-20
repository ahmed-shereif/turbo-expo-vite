import React from 'react'
import { Input, type InputProps } from 'tamagui'

export interface TextFieldProps extends InputProps {
  fullWidth?: boolean
}

export function TextField({ fullWidth, ...rest }: TextFieldProps) {
  return (
    <Input
      width={fullWidth ? '100%' : undefined}
      height={48}
      paddingHorizontal="$4"
      fontSize="$5"
      backgroundColor="$surface"
      color="$textHigh"
      borderRadius="$5"
      borderWidth={1}
      borderColor="$color6"
      placeholderTextColor="$textMuted"
      focusStyle={{ borderColor: '$primary', outlineColor: '$primary' }}
      pressStyle={{ opacity: 0.95 }}
      {...rest}
    />
  )
}


