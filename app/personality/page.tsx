"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function About() {
  const session = useSession();
  const router = useRouter();

  const [userPersonality, setUserPersonality] = useState([""]);

  useEffect(() => {
    if (session.status === "authenticated") {
      fetch("/api/spotify", {
        headers: {
          token: session.data.accessToken,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          const { topSongs, personality } = json;
          console.log(personality);
          setUserPersonality(personality.split("-"));
        });
    }
  }, [session.status]);

  return (
    <>
      <div>{session.data?.user?.name} persönlicher Seelenblick</div>
      <ul>
        {userPersonality.map((trait) => (
          <li>{trait}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() =>
          signOut({
            callbackUrl: window.location.origin,
          })
        }
      >
        Ausloggen
      </button>
    </>
  );
}
