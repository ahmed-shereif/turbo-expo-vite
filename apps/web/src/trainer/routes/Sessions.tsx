import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Screen, BrandCard, BrandButton, Text, YStack, XStack, H2 } from '@repo/ui'
import { auth } from '../../lib/authClient'
// @ts-ignore
import { listTrainerSessions } from '@repo/trainer-api'

type TabStatus = 'UPCOMING' | 'PAST' | 'ALL'

export default function TrainerSessions() {
  const [selectedTab, setSelectedTab] = useState<TabStatus>('UPCOMING')

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['trainer-sessions', selectedTab, 1],
    queryFn: () => listTrainerSessions(auth, { status: selectedTab, page: 1, pageSize: 20 }),
  })

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Cairo'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '$orange10'
      case 'APPROVED': return '$blue10'
      case 'LOCKED': return '$purple10'
      case 'UPCOMING': return '$green10'
      case 'COMPLETED': return '$gray10'
      case 'CANCELLED': return '$red10'
      default: return '$gray10'
    }
  }

  const tabs: { value: TabStatus; label: string }[] = [
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'PAST', label: 'Past' },
    { value: 'ALL', label: 'All' },
  ]

  if (isLoading) {
    return (
      <Screen>
        <YStack space="$4" padding="$4">
          <H2>My Sessions</H2>
          <Text>Loading...</Text>
        </YStack>
      </Screen>
    )
  }

  const sessions = sessionsData?.items || []

  return (
    <Screen>
      <YStack space="$4" padding="$4">
        <H2>My Sessions</H2>
        
        {/* Tabs */}
        <XStack space="$2" flexWrap="wrap">
          {tabs.map((tab) => (
            <BrandButton
              key={tab.value}
              variant={selectedTab === tab.value ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setSelectedTab(tab.value)}
            >
              {tab.label}
            </BrandButton>
          ))}
        </XStack>

        {/* Sessions List */}
        <YStack space="$3">
          {sessions.length === 0 ? (
            <BrandCard padding="$4">
              <YStack space="$2" alignItems="center">
                <Text fontSize="$lg" color="$gray10">
                  {selectedTab === 'UPCOMING' 
                    ? 'You have no upcoming sessions.' 
                    : 'Nothing here yet.'
                  }
                </Text>
                {selectedTab === 'UPCOMING' && (
                  <Text fontSize="$sm" color="$gray9">
                    Sessions will appear here once players book training with you.
                  </Text>
                )}
              </YStack>
            </BrandCard>
          ) : (
            sessions.map((session: any) => (
              <BrandCard key={session.id} padding="$4">
                <YStack space="$3">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack space="$1" flex={1}>
                      <Text fontWeight="bold" fontSize="$lg">
                        {session.court.name}
                        {session.court.area && ` • ${session.court.area}`}
                      </Text>
                      <Text color="$gray10">
                        {formatDateTime(session.startAt)} • {session.durationMinutes} min
                      </Text>
                      <Text color="$gray10">
                        {session.seats.filled}/{session.seats.total} seats • {session.type}
                        {session.creator && ` • ${session.creator.name || `Player #${session.creator.playerId}`}`}
                      </Text>
                    </YStack>
                    
                    <YStack space="$2" alignItems="flex-end">
                      <Text 
                        fontSize="$sm" 
                        fontWeight="bold"
                        color={getStatusColor(session.status)}
                      >
                        {session.status}
                      </Text>
                    </YStack>
                  </XStack>

                  <XStack justifyContent="flex-end">
                    <Link to={`/player/session/${session.id}`}>
                      <BrandButton variant="secondary" size="sm">
                        View Details
                      </BrandButton>
                    </Link>
                  </XStack>
                </YStack>
              </BrandCard>
            ))
          )}
        </YStack>

        {/* Pagination info */}
        {sessionsData && sessionsData.totalCount > 0 && (
          <BrandCard padding="$3">
            <Text fontSize="$sm" color="$gray10" textAlign="center">
              Showing {sessions.length} of {sessionsData.totalCount} sessions
            </Text>
          </BrandCard>
        )}
      </YStack>
    </Screen>
  )
}
