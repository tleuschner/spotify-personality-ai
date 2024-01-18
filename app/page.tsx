"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LoggedInStatus: React.FC = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/personality");
    }
  }, [session.status]);
  // console.log({ session });

  // useEffect(() => {
  //   if (session.status === "authenticated") {
  //     fetch("/api/spotify", {
  //       headers: { token: session.data.accessToken },
  //     }).then((res) => {
  //       if (res.ok) {
  //         res.json().then((json) => setTopSongs(json.topSongs));
  //       }
  //     });
  //   }
  // }, [session.status]);

  return (
    <>
      {session.status === "authenticated" ? (
        <h1>Logged in</h1>
      ) : (
        <h1>Ausgeloggt</h1>
      )}
    </>
  );
};

export default function Home() {
  return (
    <main className="">
      <LoggedInStatus />
      <button type="button" onClick={() => signIn("spotify")}>
        Mit Spotify einloggen
      </button>
      <button type="button" onClick={() => signOut()}>
        Ausloggen
      </button>
    </main>
  );
}
