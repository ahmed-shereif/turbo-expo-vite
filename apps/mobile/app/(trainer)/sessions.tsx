import { useState } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, BrandCard, BrandButton } from '@repo/ui';
import { YStack, XStack, H2, Text, Button } from '@tamagui/core';
import { useQuery } from '@tanstack/react-query';
import { authClient } from '../../src/lib/authClient';
import { listTrainerSessions, SessionSummary } from '@repo/trainer-api';

const TABS = [
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'PAST', label: 'Past' },
];

export default function TrainerSessions() {
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const router = useRouter();
  
  const { data, isLoading } = useQuery({
    queryKey: ['trainer-sessions', activeTab],
    queryFn: () => listTrainerSessions(authClient, { status: activeTab as any }),
  });

  const renderSession = ({ item }: { item: SessionSummary }) => (
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
            <XStack space="$4" flexWrap="wrap">
              <Text fontSize="$3" color="$gray11">
                Seats: {item.seats.filled}/{item.seats.total}
              </Text>
              <Text fontSize="$3" color="$gray11">
                Type: {item.type}
              </Text>
              <Text fontSize="$3" color="$gray11">
                Status: {item.status}
              </Text>
            </XStack>
            {item.creator && (
              <Text fontSize="$3" color="$gray11">
                Creator: {item.creator.name || `Player #${item.creator.playerId}`}
              </Text>
            )}
          </YStack>
        </XStack>
        
        <XStack justifyContent="flex-end">
          <BrandButton 
            size="$3" 
            variant="outlined"
            onPress={() => router.push(`/(player)/session/${item.id}`)}
          >
            View Details
          </BrandButton>
        </XStack>
      </YStack>
    </BrandCard>
  );

  return (
    <Screen>
      <YStack space="$4" padding="$4" flex={1}>
        <H2>My Sessionsssssss</H2>

        {/* Tabs */}
        <XStack space="$2">
          {TABS.map((tab) => (
            <Button
              key={tab.key}
              size="$3"
              variant={activeTab === tab.key ? 'outlined' : 'ghost'}
              onPress={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </XStack>

        {/* Sessions List */}
        {isLoading ? (
          <Text>Loading...</Text>
        ) : !data?.items.length ? (
          <BrandCard>
            <Text textAlign="center" color="$gray11">
              {activeTab === 'UPCOMING' 
                ? 'You have no upcoming sessions.' 
                : 'No past sessions found.'}
            </Text>
          </BrandCard>
        ) : (
          <FlatList
            data={data.items}
            renderItem={renderSession}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <XStack space="$2" justifyContent="center">
            <Text fontSize="$3" color="$gray11">
              Page {data.page} of {data.totalPages}
            </Text>
          </XStack>
        )}
      </YStack>
    </Screen>
  );
}