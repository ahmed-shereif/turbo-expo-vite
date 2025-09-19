import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, Text, View, config, SharedButton } from '@repo/ui';

export default function App() {
  return (
    <TamaguiProvider config={config}>
      <View flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" gap="$4">
        <Text fontSize="$6" fontWeight="bold">Mobile App with Tamagui</Text>
        <SharedButton title="Shared Button (Mobile)" onPress={() => console.log('Mobile pressed')} />
        <Text color="$gray10">This uses the same design tokens!</Text>
        <StatusBar style="auto" />
      </View>
    </TamaguiProvider>
  );
}
