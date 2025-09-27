import { Text as TamaguiText } from '@tamagui/core'
import { forwardRef } from 'react'

// Safe Text component that filters out problematic props for web
export const SafeText = forwardRef<any, any>((props, ref) => {
  const { textAlign, textTransform, letterSpacing, ...safeProps } = props
  
  // Handle textAlign properly for web
  const style = {
    ...safeProps.style,
    ...(textAlign && { textAlign }),
    ...(textTransform && { textTransform }),
    ...(letterSpacing && { letterSpacing })
  }
  
  return <TamaguiText {...safeProps} style={style} ref={ref} />
})

SafeText.displayName = 'SafeText'