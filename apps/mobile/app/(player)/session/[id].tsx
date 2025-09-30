import { View, Text, Pressable, Modal, FlatList, Alert } from 'react-native';
import { Screen, BrandCard, BrandButton } from '@repo/ui'
import { useLocalSearchParams, router } from 'expo-router';
import { AuthGate, RoleGate } from '../../../src/navigation/guards';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSession,
  getCourtConfirmation,
  joinSession,
  confirmWithCurrent,
  leaveSession,
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
  const isPlayer = user?.roles?.includes('PLAYER');
  const isTrainer = user?.roles?.includes('TRAINER');

  // Determine the correct back navigation path based on user role
  const getBackNavigationPath = () => {
    if (isTrainer) return '/(trainer)/home';
    if (isPlayer) return '/(player)/home';
    return '/(app)'; // fallback
  };

  const sessionQ = useQuery({
    queryKey: ['session', id],
    queryFn: () => fetchSession(auth as any, id!),
    enabled: !!id,
    retry: 1,
    onError: (e: any) => {
      if ((e?.status ?? 0) === 404) {
        notify.error('Session no longer available.');
        router.replace(getBackNavigationPath());
        return;
      }
      notify.error(e?.message || 'Could not load session. Please try again.');
    },
  });

  const courtQ = useQuery({
    queryKey: ['court-confirmation', id],
    queryFn: () => getCourtConfirmation(auth as any, id!),
    enabled: !!id,
    retry: 1,
    onError: (e: any) => notify.error(e?.message || 'Could not load session. Please try again.'),
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

  const leaveMut = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Missing user');
      return leaveSession(auth as any, id!, user.id);
    },
    onSuccess: (res: any) => {
      const refund = res?.refund as 'FULL' | 'NONE' | 'PARTIAL' | undefined;
      notify.success(`You left the session.${refund ? ` Refund: ${refund}` : ''}`.trim());
      qc.invalidateQueries({ queryKey: ['session', id] });
      qc.invalidateQueries({ queryKey: ['my-sessions'] });
      qc.invalidateQueries({ queryKey: ['open-sessions'] });
      router.replace(getBackNavigationPath());
    },
    onError: (e: any) => notify.error(e?.message || 'Could not leave session.'),
  });

  const isMember = !!sessionQ.data?.members?.some((m: any) => m.playerId === (user?.id || ''));

  return (
    <AuthGate>
      <RoleGate roles={['PLAYER', 'TRAINER']}>
        <Screen>
          {sessionQ.isLoading && <Text>Loading...</Text>}
          {sessionQ.isSuccess && (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <BrandButton 
                  icon="ArrowLeft" 
                  variant="outline" 
                  onPress={() => router.push(getBackNavigationPath())}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ fontSize: 20, fontWeight: '600' }}>Session Detail</Text>
              </View>
              <BrandCard>
                <Text>Court: {(sessionQ.data as any)?.court?.name} — {(sessionQ.data as any)?.court?.area}</Text>
                <Text>Trainer: {(sessionQ.data as any)?.trainer?.name}</Text>
                <Text>Seats: {(sessionQ.data as any)?.seats?.filled}/{(sessionQ.data as any)?.seats?.total}</Text>
                {courtQ.isSuccess && (
                  <Text>
                    {(courtQ.data as any)?.status === 'PENDING'
                      ? 'Awaiting court confirmation'
                      : 'Court confirmed'}
                  </Text>
                )}
              </BrandCard>
              <BrandCard>
                <Text style={{ marginTop: 8, fontWeight: '600' }}>Players in this session</Text>
                <FlatList
                  data={(sessionQ.data as any)?.members || []}
                  keyExtractor={(m: any) => m.playerId}
                  renderItem={({ item }: { item: any }) => (
                    <View testID={`member-item-${item.playerId}`} style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'var(--color-border-primary)' }}>
                      <Text>
                        {(item.name || '•••')} {item.playerId === (user?.id || '') ? '(You)' : ''} — {item.role}
                        {item.rank ? ` — Rank: ${item.rank}` : ''}
                      </Text>
                      {item.joinedAt ? <Text style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>Joined: {new Date(item.joinedAt).toLocaleString()}</Text> : null}
                    </View>
                  )}
                />
                {!(sessionQ.data as any)?.members?.some((m: any) => m.playerId === (user?.id || '')) &&
                  isEligible(user?.rank as Rank | undefined, (sessionQ.data as any)?.minRank as Rank | undefined) &&
                  (sessionQ.data as any)?.seats?.filled < (sessionQ.data as any)?.seats?.total && isPlayer && (
                    <BrandButton icon="CalendarPlus" onPress={() => joinMut.mutate()}>
                      Join Session
                    </BrandButton>
                  )}
                {(sessionQ.data as any)?.members?.some((m: any) => m.playerId === (user?.id || '')) &&
                  (sessionQ.data as any)?.seats?.filled < (sessionQ.data as any)?.seats?.total && isPlayer && (
                    <BrandButton icon="Users" onPress={() => confirmMut.mutate()}>
                      Confirm with Current Players
                    </BrandButton>
                  )}
                {isMember && isPlayer && (
                  <BrandButton
                    testID="leave-session-button"
                    onPress={() =>
                      Alert.alert(
                        'Leave Session',
                        'Are you sure you want to leave this session?\n\n• >24h before start: Full refund if you already paid.\n• <24h before start: No refund; your payment is redistributed to remaining players.\n\nContinue?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Leave', style: 'destructive', onPress: () => leaveMut.mutate() },
                        ],
                      )
                    }
                    variant="outline"
                  >
                    <Text style={{ color: 'var(--color-feedback-error-text)' }}>{leaveMut.isPending ? 'Leaving…' : 'Leave Session'}</Text>
                  </BrandButton>
                )}
              </BrandCard>
            </View>
          )}
          <Modal visible={visible} transparent animationType="fade">
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-overlay)' }}>
              <View style={{ backgroundColor: 'var(--color-surface-primary)', padding: 16, width: '80%' }}>
                <Text>{modalText}</Text>
                <BrandButton onPress={() => setVisible(false)} variant="outline" style={{ marginTop: 12 }}>
                  Close
                </BrandButton>
              </View>
            </View>
          </Modal>
        </Screen>
      </RoleGate>
    </AuthGate>
  );
}



