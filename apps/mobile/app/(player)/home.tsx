import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { AuthGate, RoleGate } from '../../src/navigation/guards';

export default function PlayerHome() {
  return (
    <AuthGate>
      <RoleGate roles={['PLAYER']}>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 20, marginBottom: 12 }}>Player Home</Text>
          <Pressable onPress={() => router.push('/(player)/open')} style={{ marginBottom: 8 }}>
            <Text>Find Open Sessions</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(player)/sessions')}>
            <Text>My Sessions</Text>
          </Pressable>
        </View>
      </RoleGate>
    </AuthGate>
  );
}


