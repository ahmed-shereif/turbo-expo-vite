import { View, Text, Pressable } from 'react-native';
import { Screen, BrandCard, BrandButton } from '@repo/ui'
import { router } from 'expo-router';
import { AuthGate, RoleGate } from '../../src/navigation/guards';

export default function PlayerHome() {
  return (
    <AuthGate>
      <RoleGate roles={['PLAYER']}>
        <Screen>
          <BrandCard>
            <Text style={{ fontSize: 20, marginBottom: 12 }}>Player Home</Text>
            <View style={{ gap: 8 }}>
              <BrandButton icon="Plus" onPress={() => router.push('/(player)/create')}>Create Session</BrandButton>
              <BrandButton variant="outline" icon="Search" onPress={() => router.push('/(player)/open')}>Find Open Sessions</BrandButton>
              <BrandButton variant="outline" icon="Calendar" onPress={() => router.push('/(player)/sessions')}>My Sessions</BrandButton>
            </View>
          </BrandCard>
        </Screen>
      </RoleGate>
    </AuthGate>
  );
}


