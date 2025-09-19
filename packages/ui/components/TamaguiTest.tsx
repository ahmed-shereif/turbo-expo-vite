import { View, Text } from '@tamagui/core'

export function TamaguiTest() {
  return (
    <View padding="$4" margin="$4" backgroundColor="$color2" borderRadius="$4">
      <View gap="$3">
        <Text fontSize="$6" fontWeight="bold">Tamagui Test</Text>
        <Text fontSize="$4">This component tests basic Tamagui functionality</Text>
        
        <View flexDirection="row" gap="$2">
          <View padding="$3" backgroundColor="$blue10" borderRadius="$3">
            <Text color="white">Primary</Text>
          </View>
          <View padding="$3" backgroundColor="$gray5" borderRadius="$3">
            <Text>Secondary</Text>
          </View>
        </View>
        
        <View padding="$3" backgroundColor="$green3" borderRadius="$3">
          <Text fontSize="$3">
            Nested view with theme colors
          </Text>
        </View>
      </View>
    </View>
  )
}