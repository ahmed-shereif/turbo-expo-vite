import { useAuth } from '../auth/AuthContext';
import { Screen, BrandCard, BrandButton } from '@repo/ui'

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <Screen containerMaxWidth={720}>
      <BrandCard style={{ alignSelf: 'center', width: '100%' }}>
        <h1>Welcome</h1>
        {user && <p>Logged in as {user.email}</p>}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BrandButton onPress={logout} fullWidth>Logout</BrandButton>
        </div>
      </BrandCard>
    </Screen>
  );
}
