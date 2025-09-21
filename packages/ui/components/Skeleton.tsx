import React from 'react'
import { YStack, type StackProps } from 'tamagui'

export interface SkeletonProps extends StackProps {
  width?: number | string
  height?: number | string
  borderRadius?: number | string
}

export function Skeleton({ width = '100%', height = 16, borderRadius = '$4', ...rest }: SkeletonProps) {
  return (
    <YStack
      width={width}
      height={height}
      backgroundColor="$color6"
      borderRadius={borderRadius}
      opacity={0.6}
      {...rest}
    />
  )
}

export default Skeleton


