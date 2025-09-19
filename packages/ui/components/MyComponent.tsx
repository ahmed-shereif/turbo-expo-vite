import { Button, H1, YStack } from 'tamagui'

export function MyComponent() {
  return (
    <YStack
      padding="$4"
      margin="$4"
      space
      backgroundColor="$color2"
      borderRadius="$4"
      alignItems="center"
    >
      <H1>My Tamagui Component</H1>
      <Button>Hello World</Button>
    </YStack>
  )
}
