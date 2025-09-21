import { Link } from 'react-router-dom';
import { Screen, BrandCard, BrandButton } from '@repo/ui'

export default function PlayerHome() {
  return (
    <Screen>
      <BrandCard>
        <h2>Player Home</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/player/open"><BrandButton variant="outline">Find Open Sessions</BrandButton></Link>
          <Link to="/player/sessions"><BrandButton variant="outline">My Sessions</BrandButton></Link>
        </div>
      </BrandCard>
    </Screen>
  );
}


