import { RoleGate } from '../../src/navigation/guards';
import { YStack, Text } from 'tamagui';
import { Screen, BrandCard } from '@repo/ui'

export default function TrainerScreen() {
  return (
    <RoleGate roles={['TRAINER']}>
      <Screen>
        <BrandCard>
          <Text fontSize="$6">Trainer Area</Text>
        </BrandCard>
      </Screen>
    </RoleGate>
  );
}
