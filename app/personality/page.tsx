"use client";
import { signOut, useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";
import "./personality.module.css";

export default function About() {
  const session = useSession();
  const [showPersonality, setShowPersonality] = useState(false);
  const [userPersonality, setUserPersonality] = useState([""]);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signIn("spotify");
    }

    if (session.status === "authenticated") {
      fetch("/api/spotify", {
        headers: {
          token: session.data.accessToken,
          user: session.data.user?.name || session.data.user?.email || "anon",
        },
      })
        .then((res) => res.json())
        .then((json) => {
          const { personality } = json;
          setUserPersonality(personality.split("-").filter(Boolean));
        });
    }
  }, [session]);

  return (
    <main>
      <h1 className="text-4xl font-bold mb-6">
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
            <li key={trait}>&bull; {trait}</li>
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
