"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoggedInStatus: React.FC = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/personality");
    }
  }, [session.status]);

  return <></>;
};

export default function Home() {
  return (
    <main className="">
      <LoggedInStatus />
      <button
        type="button"
        className="spotify-login-button text-black pt-2 pb-2 pl-4 pr-4 rounded-full"
        onClick={() => signIn("spotify")}
      >
        Mit Spotify einloggen
      </button>
      <button type="button" onClick={() => signOut()}>
        Ausloggen
      </button>
    </main>
  );
}
