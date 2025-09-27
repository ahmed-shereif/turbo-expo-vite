import { useState } from 'react';
import { Screen, BrandCard, BrandButton, SafeText } from '@repo/ui';
import { useTrainerRequests, useRespondTrainerRequest } from '../hooks/useTrainerQueries';
import { YStack, XStack, H2, Button, TextArea } from 'tamagui';
import { Dialog } from '@tamagui/dialog';
import { notify } from '../../lib/notify';

// Types for trainer requests
interface TrainerRequest {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  startAt: string;
  durationMinutes: number;
  expiresAt: string;
  seats: {
    filled: number;
    total: number;
  };
  court: {
    name: string;
    area?: string;
  };
  creator: {
    name?: string;
    playerId: string;
  };
}


const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'DECLINED', label: 'Declined' },
  { key: 'EXPIRED', label: 'Expired' },
];

export default function TrainerRequests() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [declineModal, setDeclineModal] = useState<{ id: string; open: boolean }>({ id: '', open: false });
  const [declineComment, setDeclineComment] = useState('');
  
  const { data, isLoading } = useTrainerRequests(activeTab === 'ALL' ? undefined : activeTab);
  console.log('my data ',data )
  // The API returns data directly as a Pagination object
  const requestsData = data || { items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 0 };
  const respondMutation = useRespondTrainerRequest();

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

  return (
    <Screen>
      <YStack space="$4" padding="$4">
        <H2>Training Requests</H2>

        {/* Tabs */}
        <XStack space="$2" flexWrap="wrap">
          {TABS.map((tab) => (
            <Button
              key={tab.key}
              size="$3"
              variant={activeTab === tab.key ? 'outlined' : 'outlined'}
              onPress={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </XStack>

        {/* Requests List */}
        <YStack space="$3">
          {isLoading ? (
            <SafeText>Loading...</SafeText>
          ) : !requestsData.items.length ? (
            <BrandCard>
              <SafeText textAlign="center" color="$gray11">
                {activeTab === 'PENDING' 
                  ? 'No pending requests right now.' 
                  : 'Nothing here yet.'}
              </SafeText>
            </BrandCard>
          ) : (
            requestsData.items.map((request: TrainerRequest) => (
              <BrandCard key={request.id}>
                <YStack space="$3">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack flex={1} space="$2">
                      <SafeText fontSize="$4" fontWeight="600">
                        {request.court.name}
                        {request.court.area && ` • ${request.court.area}`}
                      </SafeText>
                      <SafeText fontSize="$3" color="$gray11">
                        {new Date(request.startAt).toLocaleDateString()} at{' '}
                        {new Date(request.startAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} • {request.durationMinutes}min
                      </SafeText>
                      <SafeText fontSize="$3" color="$gray11">
                        Seats: {request.seats.filled}/{request.seats.total} • 
                        Creator: {request.creator.name || `Player #${request.creator.playerId}`}
                      </SafeText>
                      {request.status === 'PENDING' && (
                        <SafeText fontSize="$2" color="$orange10" fontWeight="600">
                          {getTimeLeft(request.expiresAt)}
                        </SafeText>
                      )}
                    </YStack>
                    
                    {request.status === 'PENDING' && (
                      <XStack space="$2">
                        <BrandButton 
                          size="sm" 
                          onPress={() => handleAccept(request.id)}
                          disabled={respondMutation.isPending}
                        >
                          Accept
                        </BrandButton>
                        <Button 
                          size="sm" 
                          variant="outlined"
                          onPress={() => setDeclineModal({ id: request.id, open: true })}
                          disabled={respondMutation.isPending}
                        >
                          Decline
                        </Button>
                      </XStack>
                    )}
                    
                    {request.status !== 'PENDING' && (
                      <SafeText 
                        fontSize="$3" 
                        fontWeight="600"
                        color={request.status === 'ACCEPTED' ? '$green10' : '$red10'}
                      >
                        {request.status}
                      </SafeText>
                    )}
                  </XStack>
                </YStack>
              </BrandCard>
            ))
          )}
        </YStack>

        {/* Decline Modal */}
        <Dialog modal open={declineModal.open} onOpenChange={(open) => setDeclineModal({ ...declineModal, open })}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <YStack space="$4" padding="$4">
                <Dialog.Title>Decline Request</Dialog.Title>
                <SafeText color="$gray11">
                  Optionally tell the player why you're declining.
                </SafeText>
                <TextArea
                  placeholder="Reason (optional)"
                  value={declineComment}
                  onChangeText={setDeclineComment}
                  minHeight={80}
                />
                <XStack space="$3" justifyContent="flex-end">
                  <Dialog.Close asChild>
                    <Button variant="outlined">Cancel</Button>
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