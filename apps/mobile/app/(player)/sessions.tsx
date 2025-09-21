import { View, Text, Pressable, FlatList } from 'react-native';
import { Screen, BrandCard, BrandButton } from '@repo/ui'
import { AuthGate, RoleGate } from '../../src/navigation/guards';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMySessions } from '@repo/player-api';
import { auth } from '../../src/lib/authClient';
import { notify } from '../../src/lib/notify';
import { router } from 'expo-router';

export default function Sessions() {
  const [tab, setTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const params = useMemo(() => ({ status: tab, page: 1, pageSize: 20 }), [tab]);

  const q = useQuery({
    queryKey: ['my-sessions', params],
    queryFn: () => fetchMySessions(auth as any, params),
    useErrorBoundary: (e) => (e as any)?.status >= 500,
    retry: 1,
    onError: (e: any) => notify.error(e?.message || 'Unexpected error, please try again.'),
  });

  return (
    <AuthGate>
      <RoleGate roles={['PLAYER']}>
        <Screen>
          <Text style={{ fontSize: 20, marginBottom: 8 }}>My Sessions</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <BrandButton icon="Clock" variant={tab === 'UPCOMING' ? 'primary' : 'outline'} onPress={() => setTab('UPCOMING')}>Upcoming</BrandButton>
            <BrandButton icon="History" variant={tab === 'PAST' ? 'primary' : 'outline'} onPress={() => setTab('PAST')}>Past</BrandButton>
          </View>
          {q.isLoading && (
            <BrandCard>
              <Text>Loading your sessions…</Text>
            </BrandCard>
          )}
          {q.isSuccess && (
            <BrandCard>
              <FlatList
                data={q.data.sessions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable onPress={() => router.push(`/(player)/session/${item.id}`)} style={{ padding: 12, borderWidth: 1, marginTop: 8 }}>
                    <Text>{item.court.name} — {item.court.area}</Text>
                    <Text>Trainer: {item.trainer.name}</Text>
                    <Text>Seats: {item.seats.filled}/{item.seats.total}</Text>
                  </Pressable>
                )}
              />
            </BrandCard>
          )}
        </Screen>
      </RoleGate>
    </AuthGate>
  );
}


