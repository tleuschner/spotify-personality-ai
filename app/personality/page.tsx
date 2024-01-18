"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";
import "./personality.module.css";

export default function About() {
  const session = useSession();
  const router = useRouter();
  const [showPersonality, setShowPersonality] = useState(false);
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
          setUserPersonality(personality.split("-"));
        });
    }
  }, [session]);

  return (
    <main>
      <h1 className="text-4xl font-bold">
        <Typewriter
          onInit={(typewriter) => {
            typewriter
              .pauseFor(100)
              .typeString(
                `${session.data?.user?.name} persönlicher Seelenblick`
              )
              .start()
              .callFunction(() => {
                setShowPersonality(true);
              });
          }}
        />
      </h1>

      {showPersonality && (
        <ul className="dashed">
          {userPersonality.map((trait) => (
            <li key={trait}>{trait}</li>
          ))}
        </ul>
      )}
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
    </main>
  );
}
