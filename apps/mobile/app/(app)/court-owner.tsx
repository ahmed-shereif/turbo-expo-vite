import { RoleGate } from '../../src/navigation/guards';
import { YStack, Text } from 'tamagui';
import { Screen, BrandCard } from '@repo/ui'

export default function CourtOwnerScreen() {
  return (
    <RoleGate roles={['COURT_OWNER']}>
      <Screen>
        <BrandCard>
          <Text fontSize="$6">Court Owner Area</Text>
        </BrandCard>
      </Screen>
    </RoleGate>
  );
}


