import type { WizardState } from './types';
import { Icon, BrandCard, SafeText } from '@repo/ui';
import { YStack, XStack, Text, View, Button, H4 } from 'tamagui';
import { formatEGP, type Rank } from '@repo/player-api';

interface Step4_ReviewProps {
  state: WizardState;
  onSeatsChange: (seatsTotal: 2 | 3 | 4) => void;
  onTypeChange: (type: 'OPEN' | 'PRIVATE') => void;
  onMinRankChange: (minRank?: Rank) => void;
  estimateIntendedShareLE: (
    courtPriceLE?: number,
    trainerPriceLE?: number,
    seatsTotal?: number,
    appFeeLE?: number
  ) => number;
}

const rankLabels: Record<Rank, string> = {
  UNKNOWN: 'Unknown',
  LOW_D: 'Low D',
  MID_D: 'Mid D',
  HIGH_D: 'High D',
};

export function Step4_Review({
  state,
  onSeatsChange,
  onTypeChange,
  onMinRankChange,
  estimateIntendedShareLE,
}: Step4_ReviewProps) {
  const {
    dayISO,
    court,
    startTimeHHmm,
    durationMinutes,
    trainer,
    seatsTotal,
    type,
    minRank,
  } = state;

  const formatLocalTime = (iso: string) => {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const intendedShare = estimateIntendedShareLE(
    court?.priceHourlyLE,
    trainer?.priceHourlyLE,
    seatsTotal
  );

  return (
    <YStack gap="$4" maxWidth={700} marginHorizontal="auto">
      {/* Compact Header */}
      <YStack alignItems="center" marginBottom="$1">
        <View
          width={40}
          height={40}
          backgroundColor="$purple4"
          borderRadius="$6"
          alignItems="center"
          justifyContent="center"
          marginBottom="$2"
        >
          <Icon name="CheckCircle" size={16} color="#9333ea" />
        </View>
        <SafeText fontSize="$5" fontWeight="600" color="$textHigh" textAlign="center" marginBottom="$1">Review & Confirm</SafeText>
        <SafeText color="$textMuted" fontSize="$3" textAlign="center" opacity={0.8}>
          Everything looks perfect! Review your session details before creating.
        </SafeText>
      </YStack>

      {/* Compact Session Summary */}
      <BrandCard elevated padding="$0">
        <View backgroundColor="$blue9" paddingHorizontal="$3" paddingVertical="$2" borderTopLeftRadius="$5" borderTopRightRadius="$5">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center">
              <Icon name="Clipboard" size={14} color="white" />
              <Text fontSize="$4" fontWeight="600" color="white" marginLeft="$2">Session Details</Text>
            </XStack>
            <View backgroundColor="rgba(255,255,255,0.2)" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
              <Text fontSize="$2" color="white" fontWeight="500">{durationMinutes}min</Text>
            </View>
          </XStack>
        </View>
        
        <YStack padding="$3" gap="$2">
          {/* Date & Time - More compact */}
          <XStack alignItems="center" justifyContent="space-between" padding="$2" backgroundColor="$blue2" borderRadius="$3">
            <XStack alignItems="center">
              <View
                width={24}
                height={24}
                backgroundColor="$blue4"
                borderRadius="$4"
                alignItems="center"
                justifyContent="center"
                marginRight="$2"
              >
                <Icon name="Calendar" size={12} color="#2563eb" />
              </View>
              <YStack>
                <Text fontSize="$2" fontWeight="500" color="$textMuted">Date & Time</Text>
                <Text fontSize="$3" fontWeight="600" color="$textHigh">
                  {dayISO && startTimeHHmm && formatLocalTime(
                    new Date(`${dayISO}T${startTimeHHmm}:00`).toISOString()
                  )}
                </Text>
              </YStack>
            </XStack>
          </XStack>
          
          {/* Court & Trainer - Side by side */}
          <XStack gap="$2">
            <View flex={1} padding="$2" backgroundColor="$orange2" borderRadius="$3">
              <XStack alignItems="center" marginBottom="$1">
                <View
                  width={20}
                  height={20}
                  backgroundColor="$orange4"
                  borderRadius="$3"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="$2"
                >
                  <Icon name="Building" size={10} color="#ea580c" />
                </View>
                <Text fontSize="$2" fontWeight="500" color="$textMuted">Court</Text>
              </XStack>
              <Text fontSize="$3" fontWeight="600" color="$textHigh">{court?.name}</Text>
              {court?.area && <Text fontSize="$2" color="$textMuted" marginTop="$1">{court.area}</Text>}
            </View>
            
            <View flex={1} padding="$2" backgroundColor="$purple2" borderRadius="$3">
              <XStack alignItems="center" marginBottom="$1">
                <View
                  width={20}
                  height={20}
                  backgroundColor="$purple4"
                  borderRadius="$3"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="$2"
                >
                  <Icon name="User" size={10} color="#9333ea" />
                </View>
                <Text fontSize="$2" fontWeight="500" color="$textMuted">Trainer</Text>
              </XStack>
              <Text fontSize="$3" fontWeight="600" color="$textHigh">{trainer?.name}</Text>
            </View>
          </XStack>
        </YStack>
      </BrandCard>

      {/* Compact Session Configuration */}
      <BrandCard elevated padding="$0">
        <View backgroundColor="$green9" paddingHorizontal="$3" paddingVertical="$2" borderTopLeftRadius="$5" borderTopRightRadius="$5">
          <XStack alignItems="center">
            <Icon name="Settings" size={14} color="white" />
            <Text fontSize="$4" fontWeight="600" color="white" marginLeft="$2">Session Configuration</Text>
          </XStack>
        </View>
        
        <YStack padding="$3" gap="$3">
          {/* Seats Total - More compact */}
          <YStack>
            <XStack alignItems="center" marginBottom="$2">
              <Icon name="Users" size={12} color="#2563eb" />
              <Text fontSize="$3" fontWeight="600" color="$textMuted" marginLeft="$2">Number of Seats</Text>
            </XStack>
            <XStack gap="$2">
              {[2, 3, 4].map(seats => {
                const isSelected = seatsTotal === seats;
                return (
                  <Button
                    key={seats}
                    flex={1}
                    onPress={() => onSeatsChange(seats as 2 | 3 | 4)}
                    padding="$2"
                    borderRadius="$3"
                    borderWidth={1.5}
                    backgroundColor={isSelected ? '$blue9' : '$surface'}
                    borderColor={isSelected ? '$blue9' : '$color5'}
                    animation="quick"
                    hoverStyle={{ borderColor: '$blue6', backgroundColor: isSelected ? '$blue9' : '$blue2' }}
                    pressStyle={{ scale: 0.98 }}
                  >
                    <YStack alignItems="center">
                      <Text fontSize="$5" fontWeight="700" color={isSelected ? 'white' : '$textHigh'}>{seats}</Text>
                      <Text fontSize="$2" color={isSelected ? 'white' : '$textMuted'} opacity={0.8}>seats</Text>
                    </YStack>
                  </Button>
                );
              })}
            </XStack>
          </YStack>

          {/* Session Type & Min Rank - Side by side */}
          <XStack gap="$3" $md={{ flexDirection: 'column' }}>
            <YStack flex={1}>
              <XStack alignItems="center" marginBottom="$2">
                <Icon name="Lock" size={12} color="#16a34a" />
                <Text fontSize="$3" fontWeight="600" color="$textMuted" marginLeft="$2">Session Type</Text>
              </XStack>
              <XStack gap="$2">
                {(['OPEN', 'PRIVATE'] as const).map(sessionType => {
                  const isSelected = type === sessionType;
                  return (
                    <Button
                      key={sessionType}
                      flex={1}
                      onPress={() => onTypeChange(sessionType)}
                      padding="$2"
                      borderRadius="$3"
                      borderWidth={1.5}
                      backgroundColor={isSelected ? '$green9' : '$surface'}
                      borderColor={isSelected ? '$green9' : '$color5'}
                      animation="quick"
                      hoverStyle={{ borderColor: '$green6', backgroundColor: isSelected ? '$green9' : '$green2' }}
                      pressStyle={{ scale: 0.98 }}
                    >
                      <YStack alignItems="center">
                        <Text fontSize="$3" fontWeight="600" color={isSelected ? 'white' : '$textHigh'}>{sessionType}</Text>
                        <Text fontSize="$2" color={isSelected ? 'white' : '$textMuted'} opacity={0.8}>
                          {sessionType === 'OPEN' ? 'Open' : 'Private'}
                        </Text>
                      </YStack>
                    </Button>
                  );
                })}
              </XStack>
            </YStack>

            <YStack flex={1}>
              <XStack alignItems="center" marginBottom="$2">
                <Icon name="Award" size={12} color="#ea580c" />
                <Text fontSize="$3" fontWeight="600" color="$textMuted" marginLeft="$2">Min Rank</Text>
              </XStack>
              <XStack flexWrap="wrap" gap="$2">
                <Button
                  onPress={() => onMinRankChange(undefined)}
                  padding="$2"
                  borderRadius="$3"
                  borderWidth={1.5}
                  backgroundColor={!minRank ? '$orange9' : '$surface'}
                  borderColor={!minRank ? '$orange9' : '$color5'}
                  animation="quick"
                  hoverStyle={{ borderColor: '$orange6', backgroundColor: !minRank ? '$orange9' : '$orange2' }}
                  pressStyle={{ scale: 0.98 }}
                  minWidth={70}
                >
                  <Text fontSize="$2" fontWeight="500" color={!minRank ? 'white' : '$textHigh'}>Any</Text>
                </Button>
                {(['UNKNOWN', 'LOW_D', 'MID_D', 'HIGH_D'] as const).map(rank => {
                  const isSelected = minRank === rank;
                  return (
                    <Button
                      key={rank}
                      onPress={() => onMinRankChange(rank)}
                      padding="$2"
                      borderRadius="$3"
                      borderWidth={1.5}
                      backgroundColor={isSelected ? '$orange9' : '$surface'}
                      borderColor={isSelected ? '$orange9' : '$color5'}
                      animation="quick"
                      hoverStyle={{ borderColor: '$orange6', backgroundColor: isSelected ? '$orange9' : '$orange2' }}
                      pressStyle={{ scale: 0.98 }}
                      minWidth={70}
                    >
                      <Text fontSize="$2" fontWeight="500" color={isSelected ? 'white' : '$textHigh'}>{rankLabels[rank]}</Text>
                    </Button>
                  );
                })}
              </XStack>
            </YStack>
          </XStack>
        </YStack>
      </BrandCard>

      {/* Compact Pricing Preview */}
      <BrandCard elevated padding="$0">
        <View backgroundColor="$green9" paddingHorizontal="$3" paddingVertical="$2" borderTopLeftRadius="$5" borderTopRightRadius="$5">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center">
              <Icon name="DollarSign" size={14} color="white" />
              <Text fontSize="$4" fontWeight="600" color="white" marginLeft="$2">Pricing Breakdown</Text>
            </XStack>
            <View backgroundColor="rgba(255,255,255,0.2)" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
              <Text fontSize="$2" color="white" fontWeight="500">{formatEGP(intendedShare)}</Text>
            </View>
          </XStack>
        </View>
        
        <YStack padding="$3">
          <YStack gap="$2" marginBottom="$3">
            {court?.priceHourlyLE && (
              <XStack alignItems="center" justifyContent="space-between" padding="$2" backgroundColor="$blue2" borderRadius="$3">
                <XStack alignItems="center">
                  <View
                    width={24}
                    height={24}
                    backgroundColor="$blue4"
                    borderRadius="$4"
                    alignItems="center"
                    justifyContent="center"
                    marginRight="$2"
                  >
                    <Icon name="Building" size={12} color="#2563eb" />
                  </View>
                  <YStack>
                    <Text fontSize="$3" fontWeight="600" color="$textHigh">Court Fee</Text>
                    <Text fontSize="$2" color="$textMuted">{formatEGP(court.priceHourlyLE)}/hour ÷ {seatsTotal}</Text>
                  </YStack>
                </XStack>
                <Text fontSize="$4" fontWeight="700" color="$blue11">{formatEGP(court.priceHourlyLE / seatsTotal)}</Text>
              </XStack>
            )}
            
            {trainer?.priceHourlyLE && (
              <XStack alignItems="center" justifyContent="space-between" padding="$2" backgroundColor="$orange2" borderRadius="$3">
                <XStack alignItems="center">
                  <View
                    width={24}
                    height={24}
                    backgroundColor="$orange4"
                    borderRadius="$4"
                    alignItems="center"
                    justifyContent="center"
                    marginRight="$2"
                  >
                    <Icon name="User" size={12} color="#ea580c" />
                  </View>
                  <YStack>
                    <Text fontSize="$3" fontWeight="600" color="$textHigh">Trainer Fee</Text>
                    <Text fontSize="$2" color="$textMuted">{formatEGP(trainer.priceHourlyLE)}/hour ÷ {seatsTotal}</Text>
                  </YStack>
                </XStack>
                <Text fontSize="$4" fontWeight="700" color="$orange11">{formatEGP(trainer.priceHourlyLE / seatsTotal)}</Text>
              </XStack>
            )}
          </YStack>
          
          <View borderTopWidth={1} borderTopColor="$color4" paddingTop="$3">
            <View backgroundColor="$green2" borderRadius="$3" padding="$3" alignItems="center">
              <View
                width={32}
                height={32}
                backgroundColor="$green9"
                borderRadius="$6"
                alignItems="center"
                justifyContent="center"
                marginBottom="$2"
              >
                <Icon name="DollarSign" size={14} color="white" />
              </View>
              <Text fontSize="$3" fontWeight="600" color="$textHigh" marginBottom="$1">Your Estimated Share</Text>
              <Text fontSize="$6" fontWeight="700" color="$green11" marginBottom="$2">{formatEGP(intendedShare)}</Text>
              <SafeText fontSize="$2" color="$textMuted" textAlign="center" opacity={0.8}>
                💡 Final amount may vary if you start early or make changes
              </SafeText>
            </View>
          </View>
        </YStack>
      </BrandCard>
    </YStack>
  );
}
