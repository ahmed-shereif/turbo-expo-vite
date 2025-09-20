import { View, Text, Pressable, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AuthGate, RoleGate } from '../../../src/navigation/guards';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSession,
  getCourtConfirmation,
  joinSession,
  confirmWithCurrent,
  isEligible,
  type Rank,
} from '@repo/player-api';
import { auth } from '../../../src/lib/authClient';
import { notify } from '../../../src/lib/notify';
import { useAuth } from '../../../src/providers/AuthProvider';
import { useState } from 'react';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [modalText, setModalText] = useState('');

  const sessionQ = useQuery({
    queryKey: ['session', id],
    queryFn: () => fetchSession(auth as any, id!),
    enabled: !!id,
    useErrorBoundary: (e) => (e as any)?.status >= 500,
    retry: 1,
    onError: (e: any) => notify.error(e?.message || 'Unexpected error, please try again.'),
  });

  const courtQ = useQuery({
    queryKey: ['court-confirmation', id],
    queryFn: () => getCourtConfirmation(auth as any, id!),
    enabled: !!id,
    useErrorBoundary: (e) => (e as any)?.status >= 500,
    retry: 1,
    onError: (e: any) => notify.error(e?.message || 'Unexpected error, please try again.'),
  });

  const joinMut = useMutation({
    mutationFn: () => joinSession(auth as any, id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['session', id] }),
    onError: (e: any) => {
      const status = e?.status;
      const message: string = e?.message || '';
      if (status === 409 || status === 422 || /filled/i.test(message)) {
        notify.error('This session just filled. Please choose another session.');
      } else {
        notify.error('Unexpected error, please try again.');
      }
    },
  });

  const confirmMut = useMutation({
    mutationFn: () => confirmWithCurrent(auth as any, id!),
    onSuccess: (data) => {
      setModalText(
        `You'll proceed with the current group. Your share will be ${
          data.proposedActualShare ?? 'computed'
        } EGP. All players must accept to continue.`,
      );
      setVisible(true);
    },
    onError: (e: any) => notify.error(e?.message || 'Unexpected error, please try again.'),
  });

  return (
    <AuthGate>
      <RoleGate roles={['PLAYER']}>
        <View style={{ padding: 16 }}>
          {sessionQ.isLoading && <Text>Loading...</Text>}
          {sessionQ.isSuccess && (
            <View>
              <Text style={{ fontSize: 20, marginBottom: 8 }}>Session Detail</Text>
              <Text>Court: {sessionQ.data.court.name} — {sessionQ.data.court.area}</Text>
              <Text>Trainer: {sessionQ.data.trainer.name}</Text>
              <Text>Seats: {sessionQ.data.seats.filled}/{sessionQ.data.seats.total}</Text>
              {courtQ.isSuccess && (
                <Text>
                  {courtQ.data.status === 'PENDING'
                    ? 'Awaiting court confirmation'
                    : 'Court confirmed. You can proceed to payment once payment UI is implemented.'}
                </Text>
              )}
              {!sessionQ.data.members.some((m) => m.playerId === (user?.id || '')) &&
                isEligible(user?.rank as Rank | undefined, sessionQ.data.minRank as Rank | undefined) &&
                sessionQ.data.seats.filled < sessionQ.data.seats.total && (
                  <Pressable onPress={() => joinMut.mutate()} style={{ padding: 12, borderWidth: 1, marginTop: 8 }}>
                    <Text>Join Session</Text>
                  </Pressable>
                )}
              {sessionQ.data.members.some((m) => m.playerId === (user?.id || '')) &&
                sessionQ.data.seats.filled < sessionQ.data.seats.total && (
                  <Pressable onPress={() => confirmMut.mutate()} style={{ padding: 12, borderWidth: 1, marginTop: 8 }}>
                    <Text>Confirm with Current Players</Text>
                  </Pressable>
                )}
            </View>
          )}
          <Modal visible={visible} transparent animationType="fade">
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <View style={{ backgroundColor: 'white', padding: 16, width: '80%' }}>
                <Text>{modalText}</Text>
                <Pressable onPress={() => setVisible(false)} style={{ marginTop: 12, borderWidth: 1, padding: 8 }}>
                  <Text>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </RoleGate>
    </AuthGate>
  );
}


