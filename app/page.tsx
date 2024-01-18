"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const LoggedInStatus: React.FC = () => {
  const session = useSession();
  const [topSongs, setTopSongs] = useState([]);
  console.log({ session });

  useEffect(() => {
    if (session.status === "authenticated") {
      fetch("/api/spotify", {
        headers: { token: session.data.accessToken },
      }).then((res) => {
        if (res.ok) {
          res.json().then((json) => setTopSongs(json.topSongs));
        }
      });
    }
  }, [session.status]);

  return (
    <>
      {session.status === "authenticated" ? (
        <h1>Logged in</h1>
      ) : (
        <h1>Ausgeloggt</h1>
      )}

      {topSongs?.map((song) => (
        <div>{song}</div>
      ))}
    </>
  );
};

export default function Home() {
  return (
    <SessionProvider>
      <main className="">
        <LoggedInStatus />
        <button type="button" onClick={() => signIn("spotify")}>
          Mit Spotify einloggen
        </button>
        <button type="button" onClick={() => signOut()}>
          Ausloggen
        </button>
      </main>
    </SessionProvider>
  );
}
