import { Link } from 'react-router-dom';

export default function PlayerHome() {
  return (
    <div>
      <h2>Player Home</h2>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/player/open">Find Open Sessions</Link>
        <Link to="/player/sessions">My Sessions</Link>
      </div>
    </div>
  );
}


