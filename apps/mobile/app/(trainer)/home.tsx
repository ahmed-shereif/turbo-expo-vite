import { useRouter } from 'expo-router';
import { Screen, BrandCard, BrandButton } from '@repo/ui';
import { YStack, XStack, H2, Text, Separator } from '@tamagui/core';
import { useQuery } from '@tanstack/react-query';
import { authClient } from '../../src/lib/authClient';
import { listTrainerRequests, listTrainerSessions } from '@repo/trainer-api';

export default function TrainerHome() {
  const router = useRouter();
  
  const { data: pendingRequests } = useQuery({
    queryKey: ['trainer-requests', 'PENDING', 1],
    queryFn: () => listTrainerRequests(authClient, { status: 'PENDING', page: 1, pageSize: 5 }),
  });
  
  const { data: upcomingSessions } = useQuery({
    queryKey: ['trainer-sessions', 'UPCOMING', 1],
    queryFn: () => listTrainerSessions(authClient, { status: 'UPCOMING', page: 1, pageSize: 3 }),
  });

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
          <YStack space="$3">
            <BrandButton onPress={() => router.push('/(trainer)/requests')}>
              View Requests {pendingCount > 0 && `(${pendingCount})`}
            </BrandButton>
            <BrandButton variant="outlined" onPress={() => router.push('/(trainer)/profile')}>
              Edit Profile
            </BrandButton>
            <BrandButton variant="outlined" onPress={() => router.push('/(trainer)/sessions')}>
              My Sessions
            </BrandButton>
            <BrandButton variant="outlined" onPress={() => router.push('/(trainer)/availability')}>
              Availability
            </BrandButton>
          </YStack>
        </YStack>
      </YStack>
    </Screen>
  );
}