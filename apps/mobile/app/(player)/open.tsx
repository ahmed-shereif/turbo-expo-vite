import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { AuthGate, RoleGate } from '../../src/navigation/guards';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOpenSessions, isEligible, type Rank } from '@repo/player-api';
import { auth } from '../../src/lib/authClient';
import { notify } from '../../src/lib/notify';
import { router } from 'expo-router';

export default function Open() {
  const [area, setArea] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const params = useMemo(
    () => ({
      area: area || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      minRankEligible: eligibleOnly || undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    }),
    [area, dateFrom, dateTo, eligibleOnly, priceMin, priceMax],
  );

  const q = useQuery({
    queryKey: ['open-sessions', params],
    queryFn: () => fetchOpenSessions(auth as any, params as any),
    useErrorBoundary: (e) => (e as any)?.status >= 500,
    retry: 1,
    onError: (e: any) => notify.error(e?.message || 'Unexpected error, please try again.'),
  });

  return (
    <AuthGate>
      <RoleGate roles={['PLAYER']}>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 20, marginBottom: 8 }}>Open Sessions</Text>
          <View style={{ gap: 8 }}>
            <Text>Area</Text>
            <TextInput value={area} onChangeText={setArea} placeholder="Area" style={{ borderWidth: 1, padding: 8 }} />
            <Text>Date From (ISO)</Text>
            <TextInput value={dateFrom} onChangeText={setDateFrom} placeholder="YYYY-MM-DDTHH:mm" style={{ borderWidth: 1, padding: 8 }} />
            <Text>Date To (ISO)</Text>
            <TextInput value={dateTo} onChangeText={setDateTo} placeholder="YYYY-MM-DDTHH:mm" style={{ borderWidth: 1, padding: 8 }} />
            <Text>Eligible only: {eligibleOnly ? 'Yes' : 'No'}</Text>
            <Pressable onPress={() => setEligibleOnly((v) => !v)} style={{ borderWidth: 1, padding: 8 }}>
              <Text>Toggle Eligible</Text>
            </Pressable>
            <Text>Price Min</Text>
            <TextInput keyboardType="numeric" value={priceMin} onChangeText={setPriceMin} style={{ borderWidth: 1, padding: 8 }} />
            <Text>Price Max</Text>
            <TextInput keyboardType="numeric" value={priceMax} onChangeText={setPriceMax} style={{ borderWidth: 1, padding: 8 }} />
          </View>

          {q.isLoading && <Text>Loading...</Text>}
          {q.isSuccess && (
            <FlatList
              data={q.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable onPress={() => router.push(`/(player)/session/${item.id}`)} style={{ padding: 12, borderWidth: 1, marginTop: 8 }}>
                  <Text>{item.court.name} — {item.court.area}</Text>
                  <Text>Trainer: {item.trainer.name}</Text>
                  <Text>Seats: {item.seats.filled}/{item.seats.total}</Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </RoleGate>
    </AuthGate>
  );
}


