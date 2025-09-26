import { useQuery } from '@tanstack/react-query'
import { Link, router } from 'expo-router'
import { Screen, BrandCard, BrandButton, Text, YStack, XStack, H2, H3 } from '@repo/ui'
import { auth } from '@repo/auth-client'
import { listTrainerRequests } from '@repo/trainer-api'
import { notify } from '../../src/lib/notify'
import { AuthGate, RoleGate } from '../../src/navigation/guards'

export default function TrainerHome() {
  // Get pending requests count
  const { data: pendingRequests } = useQuery({
    queryKey: ['trainer-requests', 'PENDING', 1],
    queryFn: () => listTrainerRequests(auth, { status: 'PENDING', page: 1, pageSize: 1 }),
    select: (data) => data.totalCount,
  })

  // Get next session (mock for now)
  const nextSession = null

  return (
    <AuthGate>
      <RoleGate roles={['TRAINER']}>
        <Screen>
          <YStack space="$4" padding="$4">
            <H2>Trainer Dashboard</H2>
            
            <YStack space="$3">
              <H3>Quick Stats</H3>
              <YStack space="$3">
                <BrandCard padding="$3">
                  <YStack space="$2">
                    <Text fontSize="$sm" color="$gray10">Pending Requests</Text>
                    <Text fontSize="$2xl" fontWeight="bold" color="$blue10">
                      {pendingRequests ?? 0}
                    </Text>
                  </YStack>
                </BrandCard>
                
                <BrandCard padding="$3">
                  <YStack space="$2">
                    <Text fontSize="$sm" color="$gray10">Next Session</Text>
                    <Text fontSize="$lg" fontWeight="bold" color="$green10">
                      {nextSession ? 'Today 4:00 PM' : 'None scheduled'}
                    </Text>
                  </YStack>
                </BrandCard>
                
                <BrandCard padding="$3">
                  <YStack space="$2">
                    <Text fontSize="$sm" color="$gray10">This Week Hours</Text>
                    <Text fontSize="$lg" fontWeight="bold" color="$purple10">
                      12 hours
                    </Text>
                  </YStack>
                </BrandCard>
              </YStack>
            </YStack>

            <YStack space="$3">
              <H3>Quick Actions</H3>
              <YStack space="$2">
                <BrandButton
                  variant="primary"
                  onPress={() => router.push('/(trainer)/requests')}
                >
                  View Requests
                </BrandButton>
                
                <BrandButton
                  variant="secondary"
                  onPress={() => router.push('/(trainer)/profile')}
                >
                  Edit Profile
                </BrandButton>
                
                <BrandButton
                  variant="secondary"
                  onPress={() => router.push('/(trainer)/availability')}
                >
                  Set Availability
                </BrandButton>
                
                <BrandButton
                  variant="secondary"
                  onPress={() => router.push('/(trainer)/sessions')}
                >
                  My Sessions
                </BrandButton>
              </YStack>
            </YStack>

            {pendingRequests > 0 && (
              <BrandCard padding="$3" backgroundColor="$orange3" borderColor="$orange6">
                <YStack space="$2">
                  <Text fontWeight="bold" color="$orange11">
                    You have {pendingRequests} pending request{pendingRequests > 1 ? 's' : ''}
                  </Text>
                  <Text fontSize="$sm" color="$orange10">
                    Respond to training requests to help players find coaching.
                  </Text>
                  <BrandButton
                    variant="primary"
                    size="sm"
                    onPress={() => router.push('/(trainer)/requests')}
                  >
                    View Requests
                  </BrandButton>
                </YStack>
              </BrandCard>
            )}
          </YStack>
        </Screen>
      </RoleGate>
    </AuthGate>
  )
}
