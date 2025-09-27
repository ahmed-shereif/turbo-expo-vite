import { useState } from 'react';
import { FlatList, Alert } from 'react-native';
import { Screen, BrandCard, BrandButton, SafeText } from '@repo/ui';
import { YStack, XStack, H2, Text, Button, TextArea } from 'tamagui';
import { Dialog } from '@tamagui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth as authClient } from '../../src/lib/authClient';
import { listTrainerRequests, respondTrainerRequest, TrainerRequest } from '@repo/trainer-api';
import { notify } from '../../src/lib/notify';

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'DECLINED', label: 'Declined' },
  { key: 'EXPIRED', label: 'Expired' },
];

export default function TrainerRequests() {
  console.log('😟', )
  const [activeTab, setActiveTab] = useState('PENDING');
  const [declineModal, setDeclineModal] = useState<{ id: string; open: boolean }>({ id: '', open: false });
  const [declineComment, setDeclineComment] = useState('');
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['trainer-requests', activeTab],
    queryFn: () => listTrainerRequests(authClient, { 
      status: activeTab === 'ALL' ? undefined : activeTab as any 
    }),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, accept, comment }: { id: string; accept: boolean; comment?: string }) =>
      respondTrainerRequest(authClient, id, accept, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-requests'] });
    },
  });

  const handleAccept = async (id: string) => {
    try {
      await respondMutation.mutateAsync({ id, accept: true });
      notify.success('Request accepted');
    } catch (error) {
      notify.error('Failed to accept request');
    }
  };

  const handleDecline = async () => {
    try {
      await respondMutation.mutateAsync({ 
        id: declineModal.id, 
        accept: false, 
        comment: declineComment || undefined 
      });
      notify.success('Request declined');
      setDeclineModal({ id: '', open: false });
      setDeclineComment('');
    } catch (error) {
      notify.error('Failed to decline request');
    }
  };

  const getTimeLeft = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m left`;
    }
    return `${remainingMinutes}m left`;
  };

  const renderRequest = ({ item }: { item: TrainerRequest }) => (
    <BrandCard marginBottom="$3">
      <YStack space="$3">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} space="$2">
            <Text fontSize="$4" fontWeight="600">
              {item.court.name}
              {item.court.area && ` • ${item.court.area}`}
            </Text>
            <Text fontSize="$3" color="$gray11">
              {new Date(item.startAt).toLocaleDateString()} at{' '}
              {new Date(item.startAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} • {item.durationMinutes}min
            </Text>
            <Text fontSize="$3" color="$gray11">
              Seats: {item.seats.filled}/{item.seats.total} • 
              Creator: {item.creator.name || `Player #${item.creator.playerId}`}
            </Text>
            {item.status === 'PENDING' && (
              <Text fontSize="$2" color="$orange10" fontWeight="600">
                {getTimeLeft(item.expiresAt)}
              </Text>
            )}
          </YStack>
        </XStack>
        
        {item.status === 'PENDING' && (
          <XStack space="$2" justifyContent="flex-end">
            <BrandButton 
              size="md" 
              onPress={() => handleAccept(item.id)}
              disabled={respondMutation.isPending}
            >
              Accept
            </BrandButton>
            <BrandButton 
              size="sm" 
              variant="ghost"
              onPress={() => setDeclineModal({ id: item.id, open: true })}
              disabled={respondMutation.isPending}
            >
              Decline
            </BrandButton>
          </XStack>
        )}
        
        {item.status !== 'PENDING' && (
          <XStack justifyContent="flex-end">
            <Text
              fontSize="$3"
              fontWeight="600"
              color={item.status === 'ACCEPTED' ? '$green10' : '$red10'}
            >
              {item.status}
            </Text>
          </XStack>
        )}
      </YStack>
    </BrandCard>
  );

  return (
    <Screen>
      <YStack space="$4" padding="$4" flex={1}>
        <H2>Training Requests</H2>

        {/* Tabs */}
        <XStack space="$2" flexWrap="wrap">
          {TABS.map((tab) => (
            <BrandButton
              key={tab.key}
              size="sm"
              variant={activeTab === tab.key ? 'outline' : 'ghost'}
              onPress={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </BrandButton>
          ))}
        </XStack>

        {/* Requests List */}
        {isLoading ? (
          <Text>Loading...</Text>
        ) : !(data?.items && data.items.length) ? (
          <BrandCard>
            <Text color="$gray11" style={{ textAlign: 'center' }}>
              {activeTab === 'PENDING' 
                ? 'No pending requests right now.' 
                : 'Nothing here yet.'}
            </Text>
          </BrandCard>
        ) : (
          <FlatList
            data={data.items}
            renderItem={renderRequest}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Decline Modal */}
        <Dialog modal open={declineModal.open} onOpenChange={(open) => setDeclineModal({ ...declineModal, open })}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <YStack space="$4" padding="$4">
                <Dialog.Title>Decline Request</Dialog.Title>
                <Text color="$gray11">
                  Optionally tell the player why you're declining.
                </Text>
                <TextArea
                  placeholder="Reason (optional)"
                  value={declineComment}
                  onChangeText={setDeclineComment}
                  minHeight={80}
                />
                <XStack space="$3" justifyContent="flex-end">
                  <Dialog.Close asChild>
                    <BrandButton variant="ghost">Cancel</BrandButton>
                  </Dialog.Close>
                  <BrandButton onPress={handleDecline} disabled={respondMutation.isPending}>
                    Decline Request
                  </BrandButton>
                </XStack>
              </YStack>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </YStack>
    </Screen>
  );
}