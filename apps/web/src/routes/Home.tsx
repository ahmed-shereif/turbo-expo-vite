import { useAuth } from '../auth/AuthContext';
import { Screen, BrandCard, BrandButton } from '@repo/ui'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Role-based redirects
  useEffect(() => {
    if (user?.roles?.includes('TRAINER')) {
      navigate('/trainer/home');
    } else if (user?.roles?.includes('PLAYER')) {
      navigate('/player/home');
    } else if (user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_USER')) {
      navigate('/admin');
    }
  }, [user, navigate]);

  return (
    <Screen containerMaxWidth={720}>
      <BrandCard style={{ alignSelf: 'center', width: '100%' }}>
        <h1>Welcome</h1>
        {user && (
          <>
            <p>Logged in as {user.email}</p>
            <p>Roles: {user.roles?.join(', ')}</p>
            {user.roles?.includes('TRAINER') && (
              <BrandButton onPress={() => navigate('/trainer/home')} fullWidth>
                Trainer Dashboard
              </BrandButton>
            )}
            {user.roles?.includes('PLAYER') && (
              <BrandButton onPress={() => navigate('/player/home')} fullWidth>
                Player Dashboard
              </BrandButton>
            )}
            {(user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_USER')) && (
              <BrandButton onPress={() => navigate('/admin')} fullWidth>
                Admin Dashboard
              </BrandButton>
            )}
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BrandButton onPress={logout} fullWidth>Logout</BrandButton>
        </div>
      </BrandCard>
    </Screen>
  );
}
