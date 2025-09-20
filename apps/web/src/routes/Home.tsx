import { useAuth } from '../auth/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome</h1>
      {user && <p>Logged in as {user.email}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
