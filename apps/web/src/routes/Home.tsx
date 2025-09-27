import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Screen, BrandCard, BrandButton } from '@repo/ui'

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.roles) {
      if (user.roles.includes('TRAINER')) {
        navigate('/trainer/home', { replace: true });
      } else if (user.roles.includes('PLAYER')) {
        navigate('/player/home', { replace: true });
      } else if (user.roles.includes('ADMIN') || user.roles.includes('SUPER_USER')) {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, navigate]);

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
