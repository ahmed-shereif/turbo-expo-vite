import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Trainer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.roles?.includes('TRAINER')) {
      navigate('/trainer/home', { replace: true });
    }
  }, [user, navigate]);

  return null;
}
