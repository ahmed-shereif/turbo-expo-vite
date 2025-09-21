import React from 'react'
import * as Lucide from '@tamagui/lucide-icons'
import { Text, View } from '@tamagui/core'

export type IconName = keyof typeof Lucide

export interface IconProps {
  name: IconName
  size?: number
  color?: string
  style?: any
  accessibilityLabel?: string
}

export function Icon({ name, size = 16, color = '$textHigh', style, accessibilityLabel }: IconProps) {
  const Cmp = Lucide[name] as any
  if (!Cmp) {
    return (
      <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
        <Text>{'?'}</Text>
      </View>
    )
  }
  return <Cmp size={size} color={color} style={style} aria-label={accessibilityLabel} />
}


