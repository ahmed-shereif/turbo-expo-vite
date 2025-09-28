import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, BrandCard, BrandButton, SafeText, SessionStatusBadge } from '@repo/ui';
import { useTrainerSessions } from '../hooks/useTrainerQueries';
import { YStack, XStack, H2, Text, Button } from 'tamagui';
import type { SessionSummary, Pagination } from '@repo/trainer-api';
import type { SessionStatus } from '@repo/player-api';

type TabKey = 'UPCOMING' | 'PAST';

interface Tab {
  key: TabKey;
  label: string;
}

const TABS: Tab[] = [
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'PAST', label: 'Past' },
];

export default function TrainerSessions() {
  const [activeTab, setActiveTab] = useState<TabKey>('UPCOMING');
  const navigate = useNavigate();

  const { data, isLoading }: { data: Pagination<SessionSummary> | undefined; isLoading: boolean } = useTrainerSessions(activeTab);
  return (
    <Screen>
      <YStack space="$4" padding="$4">
        <H2>My Sessions</H2>

        {/* Tabs */}
        <XStack space="$2">
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

        {/* Sessions List */}
        <YStack space="$3">
          {isLoading ? (
            <Text>Loading...</Text>
          ) : !data?.items?.length ? (
            <BrandCard>
              <SafeText textAlign="center" color="$gray11">
                {activeTab === 'UPCOMING'
                  ? 'You have no upcoming sessions.'
                  : 'No past sessions found.'}
              </SafeText>
            </BrandCard>
          ) : (
            data.items.map((session: SessionSummary) => (
              <BrandCard key={session.id}>
                <YStack space="$3">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack flex={1} space="$2">
                      <Text fontSize="$4" fontWeight="600">
                        {session.court?.name || 'Unknown Court'}
                        {session.court?.area && ` • ${session.court.area}`}
                      </Text>
                      <Text fontSize="$3" color="$gray11">
                        {new Date(session.startAt).toLocaleDateString()} at{' '}
                        {new Date(session.startAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} • {session.durationMinutes}min
                      </Text>
                      <XStack space="$4">
                        <Text fontSize="$3" color="$gray11">
                          Seats: {session.seats?.filled || 0}/{session.seats?.total || 0}
                        </Text>
                        <Text fontSize="$3" color="$gray11">
                          Type: {session.type}
                        </Text>
                        <SessionStatusBadge status={session.status as SessionStatus} size="sm" />
                      </XStack>
                      {session.creator && (
                        <Text fontSize="$3" color="$gray11">
                          Creator: {session.creator.name || `Player #${session.creator.playerId}`}
                        </Text>
                      )}
                    </YStack>

                    <BrandButton
                      size="sm"
                      variant="outline"
                      onPress={() => navigate(`/session/${session.id}`)}
                    >
                      View Details
                    </BrandButton>
                  </XStack>
                </YStack>
              </BrandCard>
            ))
          )}
        </YStack>

        {/* Pagination */}
        {data && (data.totalPages ?? 0) > 1 && (
          <XStack space="$2" justifyContent="center">
            <Text fontSize="$3" color="$gray11">
              Page {data.page ?? 1} of {data.totalPages ?? 1}
            </Text>
          </XStack>
        )}
      </YStack>
    </Screen>
  );
}