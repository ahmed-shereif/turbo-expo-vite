import { Button, Text } from '@tamagui/core'

interface SharedButtonProps {
  title: string
  onPress?: () => void
}

export function SharedButton({ title, onPress }: SharedButtonProps) {
  return (
    <Button
      backgroundColor="$blue10"
      color="$white1"
      borderRadius="$4"
      paddingHorizontal="$4"
      paddingVertical="$3"
      pressStyle={{ backgroundColor: '$blue9' }}
      hoverStyle={{ backgroundColor: '$blue11' }}
      onPress={onPress}
    >
      <Text color="$white1" fontWeight="600">
        {title}
      </Text>
    </Button>
  )
}