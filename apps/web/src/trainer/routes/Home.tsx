import { Screen, BrandCard, BrandButton } from '@repo/ui';
import { useNavigate } from 'react-router-dom';
import { useTrainerRequests, useTrainerSessions } from '../hooks/useTrainerQueries';
import { YStack, XStack, H2, Text, Separator } from 'tamagui';

export default function TrainerHome() {
  const navigate = useNavigate();
  const { data: pendingRequests } = useTrainerRequests('PENDING', 1, 5);
  const { data: upcomingSessions } = useTrainerSessions('UPCOMING', 1, 3);

  const pendingCount = pendingRequests?.totalCount || 0;
  const nextSession = upcomingSessions?.items[0];

  return (
    <Screen>
      <YStack space="$4" padding="$4">
        <H2>Trainer Dashboard</H2>
        
        <BrandCard>
          <YStack space="$3">
            <Text fontSize="$5" fontWeight="600">Quick Stats</Text>
            <XStack space="$4">
              <YStack>
                <Text fontSize="$7" fontWeight="bold" color="$orange10">
                  {pendingCount}
                </Text>
                <Text fontSize="$3" color="$gray11">Pending Requests</Text>
              </YStack>
              {nextSession && (
                <YStack>
                  <Text fontSize="$4" fontWeight="600">Next Session</Text>
                  <Text fontSize="$3" color="$gray11">
                    {new Date(nextSession.startAt).toLocaleDateString()} at{' '}
                    {new Date(nextSession.startAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </YStack>
              )}
            </XStack>
          </YStack>
        </BrandCard>

        <Separator />

        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">Quick Actions</Text>
          <XStack space="$3" flexWrap="wrap">
            <BrandButton onPress={() => navigate('/trainer/requests')}>
              View Requests {pendingCount > 0 && `(${pendingCount})`}
            </BrandButton>
            <BrandButton variant="outline" onPress={() => navigate('/trainer/profile')}>
              Edit Profile
            </BrandButton>
            <BrandButton variant="outline" onPress={() => navigate('/trainer/sessions')}>
              My Sessions
            </BrandButton>
            <BrandButton variant="outline" onPress={() => navigate('/trainer/availability')}>
              Availability
            </BrandButton>
          </XStack>
        </YStack>
      </YStack>
    </Screen>
  );
}