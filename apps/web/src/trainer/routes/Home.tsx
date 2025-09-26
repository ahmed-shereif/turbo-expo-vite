import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Screen, BrandCard, BrandButton, Text, YStack, XStack, H2, H3 } from '@repo/ui'
import { auth } from '../../lib/authClient'
// @ts-ignore
import { listTrainerRequests } from '@repo/trainer-api'

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
    <Screen>
      <YStack space="$4" padding="$4">
        <H2>Trainer Dashboard</H2>
        
        <YStack space="$3">
          <H3>Quick Stats</H3>
          <XStack space="$3" flexWrap="wrap">
            <BrandCard padding="$3" minWidth={200}>
              <YStack space="$2">
                <Text fontSize="$sm" color="$gray10">Pending Requests</Text>
                <Text fontSize="$2xl" fontWeight="bold" color="$blue10">
                  {pendingRequests ?? 0}
                </Text>
              </YStack>
            </BrandCard>
            
            <BrandCard padding="$3" minWidth={200}>
              <YStack space="$2">
                <Text fontSize="$sm" color="$gray10">Next Session</Text>
                <Text fontSize="$lg" fontWeight="bold" color="$green10">
                  {nextSession ? 'Today 4:00 PM' : 'None scheduled'}
                </Text>
              </YStack>
            </BrandCard>
            
            <BrandCard padding="$3" minWidth={200}>
              <YStack space="$2">
                <Text fontSize="$sm" color="$gray10">This Week Hours</Text>
                <Text fontSize="$lg" fontWeight="bold" color="$purple10">
                  12 hours
                </Text>
              </YStack>
            </BrandCard>
          </XStack>
        </YStack>

        <YStack space="$3">
          <H3>Quick Actions</H3>
          <XStack space="$3" flexWrap="wrap">
            <Link to="/trainer/requests">
              <BrandButton variant="primary">
                View Requests
              </BrandButton>
            </Link>
            
            <Link to="/trainer/profile">
              <BrandButton variant="secondary">
                Edit Profile
              </BrandButton>
            </Link>
            
            <Link to="/trainer/availability">
              <BrandButton variant="secondary">
                Set Availability
              </BrandButton>
            </Link>
            
            <Link to="/trainer/sessions">
              <BrandButton variant="secondary">
                My Sessions
              </BrandButton>
            </Link>
          </XStack>
        </YStack>

        {(pendingRequests ?? 0) > 0 && (
          <BrandCard padding="$3" backgroundColor="$orange3" borderColor="$orange6">
            <YStack space="$2">
              <Text fontWeight="bold" color="$orange11">
                You have {pendingRequests ?? 0} pending request{(pendingRequests ?? 0) > 1 ? 's' : ''}
              </Text>
              <Text fontSize="$sm" color="$orange10">
                Respond to training requests to help players find coaching.
              </Text>
              <Link to="/trainer/requests">
                <BrandButton variant="primary" size="sm">
                  View Requests
                </BrandButton>
              </Link>
            </YStack>
          </BrandCard>
        )}
      </YStack>
    </Screen>
  )
}
