import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './routes/Login';
import Signup from './routes/Signup';
import Home from './routes/Home';
import Admin from './routes/Admin';
import Trainer from './routes/Trainer';
import { RequireAuth, RequireRole } from './auth/guards';
import PlayerHome from './player/routes/Home';
import OpenSessions from './player/routes/OpenSessions';
import MySessions from './player/routes/MySessions';
import SessionDetail from './player/routes/SessionDetail';

function AppRouter() {
  return (
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
        path="/player/session/:id"
        element={
          <RequireAuth>
            <RequireRole roles={['PLAYER']}>
              <SessionDetail />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export { AppRouter };
