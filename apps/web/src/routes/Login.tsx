import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LoginSchema } from '../forms/schemas';
import { useAuth, AuthClientError } from '../auth/AuthContext';
import { notify } from '../lib/notify';

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      notify.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      if (error instanceof AuthClientError) {
        setServerError(error.message);
        notify.error(error.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
        notify.error('Unexpected error. Please try again.');
      }
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
        <div>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <input placeholder="Email" {...field} />
            )}
          />
          {errors.email && (
            <div style={{ color: '#ef4444' }}>{errors.email.message}</div>
          )}
        </div>

        <div>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <input placeholder="Password" type="password" {...field} />
            )}
          />
          {errors.password && (
            <div style={{ color: '#ef4444' }}>{errors.password.message}</div>
          )}
        </div>

        {serverError && (
          <div style={{ color: '#ef4444' }}>{serverError}</div>
        )}

        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Logging in…' : 'Login'}
        </button>
      </form>
      <button onClick={() => navigate('/signup')}>Don't have an account? Sign up</button>
    </div>
  );
}
