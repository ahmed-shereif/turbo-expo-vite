import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SignupSchema } from '../forms/schemas';
import { useAuth, AuthClientError } from '../auth/AuthContext';
// Using simple HTML elements to avoid UI package coupling in this build
import { notify } from '../lib/notify';

type SignupFormValues = z.infer<typeof SignupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setServerError(null);
    try {
      await signup(data.name, data.email, data.phone, data.password, data.role);
      await login(data.email, data.password);
      notify.success('Account created');
      if (data.role === 'TRAINER') {
        navigate('/trainer', { replace: true });
      } else if (data.role === 'COURT_OWNER') {
        navigate('/', { replace: true }); // Placeholder, add court-owner route if available
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      if (error instanceof AuthClientError) {
        if (error.fieldErrors) {
          for (const [field, message] of Object.entries(error.fieldErrors)) {
            setError(field as keyof SignupFormValues, { message });
          }
          notify.error('Please fix the highlighted fields');
        } else {
          setServerError(error.message);
          notify.error(error.message);
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
        notify.error('Unexpected error. Please try again.');
      }
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
        <div>
          <Controller control={control} name="name" render={({ field }) => (<input placeholder="Name" {...field} />)} />
          {errors.name && <div style={{ color: '#ef4444' }}>{errors.name.message}</div>}
        </div>
        <div>
          <Controller control={control} name="phone" render={({ field }) => (<input placeholder="Phone (+201234567890)" {...field} />)} />
          {errors.phone && <div style={{ color: '#ef4444' }}>{errors.phone.message}</div>}
        </div>
        <div>
          <Controller control={control} name="email" render={({ field }) => (<input placeholder="Email" {...field} />)} />
          {errors.email && <div style={{ color: '#ef4444' }}>{errors.email.message}</div>}
        </div>
        <div>
          <Controller control={control} name="password" render={({ field }) => (<input placeholder="Password" type="password" {...field} />)} />
          {errors.password && <div style={{ color: '#ef4444' }}>{errors.password.message}</div>}
        </div>
        <div>
          <Controller control={control} name="birthday" render={({ field }) => (<input placeholder="Birthday (YYYY-MM-DD)" {...field} />)} />
          {errors.birthday && <div style={{ color: '#ef4444' }}>{errors.birthday.message}</div>}
        </div>
        <div>
          <div>You are a</div>
          <Controller
            control={control}
            name="role"
            render={({ field: { value, onChange } }) => (
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => onChange('PLAYER')}>Player {value === 'PLAYER' ? '✓' : ''}</button>
                <button type="button" onClick={() => onChange('COURT_OWNER')}>Court owner {value === 'COURT_OWNER' ? '✓' : ''}</button>
                <button type="button" onClick={() => onChange('TRAINER')}>Trainer {value === 'TRAINER' ? '✓' : ''}</button>
              </div>
            )}
          />
          {errors.role && <div style={{ color: '#ef4444' }}>{(errors as any).role?.message}</div>}
        </div>
        {serverError && <div style={{ color: '#ef4444' }}>{serverError}</div>}
        <button disabled={isSubmitting} type="submit">{isSubmitting ? 'Signing up…' : 'Sign up'}</button>
      </form>
      <button onClick={() => navigate('/login')}>Already have an account? Log in</button>
    </div>
  );
}
