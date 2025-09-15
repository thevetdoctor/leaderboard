import { useState } from 'react';

import './App.css';
import leaderboardLogo from './assets/leaderboard.png';
import Auth from './components/Auth';
import WebSocketClient from './components/WebSocketClient';

function App() {
  const [connectionId, setConnectionId] = useState<string | null>(null);

  return (
    <>
      <div>
        <a href="" target="_blank">
          <img
            src={leaderboardLogo}
            className="logo react"
            alt="Leaderboard logo"
          />
        </a>
      </div>
      {/* <h1>LeaderBoard</h1> */}
      <WebSocketClient
        onConnectionId={setConnectionId}
        connectionId={connectionId}
      />
      <div className="card">
        <Auth connectionId={connectionId} />
      </div>
    </>
  );
}

export default App;
