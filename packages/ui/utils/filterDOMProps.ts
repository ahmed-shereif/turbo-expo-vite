// Utility to filter out React Native specific props for web compatibility
const REACT_NATIVE_PROPS = new Set([
  'textAlign',
  'onChangeText', 
  'accessibilityLabel',
  'testID',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing'
])

const STYLE_PROPS = new Set([
  'textAlign',
  'fontFamily', 
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing'
])

export function filterDOMProps(props: Record<string, any>) {
  const domProps: Record<string, any> = {}
  const styleProps: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(props)) {
    if (REACT_NATIVE_PROPS.has(key)) {
      if (STYLE_PROPS.has(key)) {
        styleProps[key] = value
      }
      // Skip React Native specific props
      continue
    }
    
    // Convert React Native props to web equivalents
    if (key === 'accessibilityLabel') {
      domProps['aria-label'] = value
    } else if (key === 'testID') {
      domProps['data-testid'] = value
    } else {
      domProps[key] = value
    }
  }
  
  // Merge style props
  if (Object.keys(styleProps).length > 0) {
    domProps.style = {
      ...domProps.style,
      ...styleProps
    }
  }
  
  return domProps
}

export function createSafeComponent<T = any>(Component: any) {
  return function SafeComponent(props: T) {
    const safeProps = filterDOMProps(props as Record<string, any>)
    return Component(safeProps)
  }
}