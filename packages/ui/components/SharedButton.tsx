import { View, Text } from '@tamagui/core'

interface SharedButtonProps {
  title: string
  onPress?: () => void
}

export function SharedButton({ title, onPress }: SharedButtonProps) {
  return (
    <View
      backgroundColor="$blue10"
      borderRadius="$4"
      paddingHorizontal="$4"
      paddingVertical="$3"
      cursor="pointer"
      onPress={onPress}
    >
      <Text color="$white1" fontWeight="600">
        {title}
      </Text>
    </View>
  )
}