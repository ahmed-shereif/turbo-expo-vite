import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'
import { Screen, BrandCard, BrandButton, Text, YStack, XStack, H2, H3, ScrollView } from '@repo/ui'
import { auth } from '@repo/auth-client'
import { listTrainerRequests, respondTrainerRequest, RequestStatus } from '@repo/trainer-api'
import { notify } from '../../src/lib/notify'
import { AuthGate, RoleGate } from '../../src/navigation/guards'

type TabStatus = 'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'

export default function TrainerRequests() {
  const [selectedTab, setSelectedTab] = useState<TabStatus>('ALL')
  
  const queryClient = useQueryClient()

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['trainer-requests', selectedTab, 1],
    queryFn: () => listTrainerRequests(auth, { status: selectedTab, page: 1, pageSize: 20 }),
  })

  const respondMutation = useMutation({
    mutationFn: ({ id, accept, comment }: { id: string; accept: boolean; comment?: string }) =>
      respondTrainerRequest(auth, id, accept, comment),
    onSuccess: (data, variables) => {
      notify.success(variables.accept ? 'Request accepted' : 'Request declined')
      queryClient.invalidateQueries({ queryKey: ['trainer-requests'] })
    },
    onError: (error: any) => {
      notify.error(error.message || 'Failed to respond to request')
    },
  })

  const handleAccept = (requestId: string) => {
    respondMutation.mutate({ id: requestId, accept: true })
  }

  const handleDecline = (requestId: string) => {
    Alert.prompt(
      'Decline Request',
      'Optionally tell the player why you\'re declining:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Decline', 
          onPress: (comment) => respondMutation.mutate({ 
            id: requestId, 
            accept: false, 
            comment: comment || undefined 
          })
        }
      ],
      'plain-text'
    )
  }

  const formatTimeLeft = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffMs = expires.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Expired'
    
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m left`
    } else {
      return `${diffMins}m left`
    }
  }

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

  const tabs: { value: TabStatus; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'DECLINED', label: 'Declined' },
    { value: 'EXPIRED', label: 'Expired' },
  ]

  if (isLoading) {
    return (
      <AuthGate>
        <RoleGate roles={['TRAINER']}>
          <Screen>
            <YStack space="$4" padding="$4">
              <H2>Training Requests</H2>
              <Text>Loading...</Text>
            </YStack>
          </Screen>
        </RoleGate>
      </AuthGate>
    )
  }

  const requests = requestsData?.requests || []

  return (
    <AuthGate>
      <RoleGate roles={['TRAINER']}>
        <Screen>
          <YStack space="$4" padding="$4">
            <H2>Training Requests</H2>
            
            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack space="$2">
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
            </ScrollView>

            {/* Requests List */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack space="$3">
                {requests.length === 0 ? (
                  <BrandCard padding="$4">
                    <YStack space="$2" alignItems="center">
                      <Text fontSize="$lg" color="$gray10">
                        {selectedTab === 'PENDING' 
                          ? 'No pending requests right now.' 
                          : 'Nothing here yet.'
                        }
                      </Text>
                      {selectedTab === 'PENDING' && (
                        <Text fontSize="$sm" color="$gray9">
                          Check back later for new training requests.
                        </Text>
                      )}
                    </YStack>
                  </BrandCard>
                ) : (
                  requests.map((request) => (
                    <BrandCard key={request.id} padding="$4">
                      <YStack space="$3">
                        <XStack justifyContent="space-between" alignItems="flex-start">
                          <YStack space="$1" flex={1}>
                            <Text fontWeight="bold" fontSize="$lg">
                              {request.court.name}
                              {request.court.area && ` • ${request.court.area}`}
                            </Text>
                            <Text color="$gray10">
                              {formatDateTime(request.startAt)} • {request.durationMinutes} min
                            </Text>
                            <Text color="$gray10">
                              {request.seats.filled}/{request.seats.total} seats • {request.creator.name || `Player #${request.creator.playerId}`}
                            </Text>
                          </YStack>
                          
                          <YStack space="$2" alignItems="flex-end">
                            {request.status === 'PENDING' && (
                              <Text 
                                fontSize="$sm" 
                                fontWeight="bold"
                                color={request.expiresAt > new Date().toISOString() ? '$orange10' : '$red10'}
                              >
                                {formatTimeLeft(request.expiresAt)}
                              </Text>
                            )}
                            
                            <Text 
                              fontSize="$sm" 
                              fontWeight="bold"
                              color={
                                request.status === 'ACCEPTED' ? '$green10' :
                                request.status === 'DECLINED' ? '$red10' :
                                request.status === 'EXPIRED' ? '$gray10' :
                                '$orange10'
                              }
                            >
                              {request.status}
                            </Text>
                          </YStack>
                        </XStack>

                        {request.status === 'PENDING' && (
                          <XStack space="$2" justifyContent="flex-end">
                            <BrandButton
                              variant="ghost"
                              size="sm"
                              onPress={() => handleDecline(request.id)}
                              disabled={respondMutation.isPending}
                            >
                              Decline
                            </BrandButton>
                            <BrandButton
                              variant="primary"
                              size="sm"
                              onPress={() => handleAccept(request.id)}
                              disabled={respondMutation.isPending}
                            >
                              Accept
                            </BrandButton>
                          </XStack>
                        )}

                        {request.status === 'ACCEPTED' && (
                          <XStack justifyContent="flex-end">
                            <BrandButton
                              variant="secondary"
                              size="sm"
                              onPress={() => router.push(`/(player)/session/${request.sessionId}`)}
                            >
                              View Session
                            </BrandButton>
                          </XStack>
                        )}
                      </YStack>
                    </BrandCard>
                  ))
                )}
              </YStack>
            </ScrollView>
          </YStack>
        </Screen>
      </RoleGate>
    </AuthGate>
  )
}
