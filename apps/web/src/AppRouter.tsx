import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RequireAuth, RequireRole } from './auth/guards';

const Login = lazy(() => import('./routes/Login'));
const Signup = lazy(() => import('./routes/Signup'));
const Home = lazy(() => import('./routes/Home'));
const Admin = lazy(() => import('./routes/Admin'));
const Trainer = lazy(() => import('./routes/Trainer'));
const PlayerHome = lazy(() => import('./player/routes/Home'));
const OpenSessions = lazy(() => import('./player/routes/OpenSessions'));
const MySessions = lazy(() => import('./player/routes/MySessions'));
const SessionDetail = lazy(() => import('./player/routes/SessionDetail'));
const Wizard = lazy(() => import('./player/create/Wizard').then(m => ({ default: m.Wizard })));
const TrainerHome = lazy(() => import('./trainer/routes/Home'));
const TrainerRequests = lazy(() => import('./trainer/routes/Requests'));
const TrainerProfile = lazy(() => import('./trainer/routes/Profile'));
const TrainerSessions = lazy(() => import('./trainer/routes/Sessions'));
const TrainerAvailability = lazy(() => import('./trainer/routes/Availability'));

const Loading = () => <div>Loading...</div>;

function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireRole roles={['ADMIN', 'SUPER_USER']}>
              <Admin />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/trainer"
        element={
          <RequireAuth>
            <RequireRole roles={['TRAINER']}>
              <Trainer />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/trainer/home"
        element={
          <RequireAuth>
            <RequireRole roles={['TRAINER']}>
              <TrainerHome />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/trainer/requests"
        element={
          <RequireAuth>
            <RequireRole roles={['TRAINER']}>
              <TrainerRequests />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/trainer/profile"
        element={
          <RequireAuth>
            <RequireRole roles={['TRAINER']}>
              <TrainerProfile />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/trainer/sessions"
        element={
          <RequireAuth>
            <RequireRole roles={['TRAINER']}>
              <TrainerSessions />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/trainer/availability"
        element={
          <RequireAuth>
            <RequireRole roles={['TRAINER']}>
              <TrainerAvailability />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/player/home"
        element={
          <RequireAuth>
            <RequireRole roles={['PLAYER']}>
              <PlayerHome />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/player/open"
        element={
          <RequireAuth>
            <RequireRole roles={['PLAYER']}>
              <OpenSessions />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/player/sessions"
        element={
          <RequireAuth>
            <RequireRole roles={['PLAYER']}>
              <MySessions />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/session/:id"
        element={
          <RequireAuth>
            <RequireRole roles={['PLAYER', 'TRAINER']}>
              <SessionDetail />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/player/create"
        element={
          <RequireAuth>
            <RequireRole roles={['PLAYER']}>
              <Wizard />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

export { AppRouter };
