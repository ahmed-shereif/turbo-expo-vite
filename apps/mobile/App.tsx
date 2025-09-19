import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { TamaguiProvider, config, TamaguiTest, MyComponent, CalendarComponent } from '@repo/ui';

export default function App() {
  return (
    <TamaguiProvider config={config}>
      <View style={styles.container}>
        <Text>Mobile App with Tamagui</Text>
        <TamaguiTest />
        <MyComponent />
        <CalendarComponent />
        <StatusBar style="auto" />
      </View>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
