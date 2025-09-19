import { useState } from 'react'
import { TamaguiProvider, Text, View, config, SharedButton } from '@repo/ui'

function App() {
  const [count, setCount] = useState(0)

  return (
    <TamaguiProvider config={config}>
      <View flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" padding="$4" gap="$4">
        <Text fontSize="$8" fontWeight="bold">Web App with Tamagui</Text>
        <SharedButton 
          title={`Shared Button - Count: ${count}`} 
          onPress={() => setCount((count) => count + 1)} 
        />
        <Text color="$gray10">This uses the same design tokens as mobile!</Text>
      </View>
    </TamaguiProvider>
  )
}

export default App
