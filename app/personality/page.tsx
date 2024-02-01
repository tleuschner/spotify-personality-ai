"use client";
import { signOut, useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";
import css from "./personality.module.css";

export default function About() {
  const session = useSession();
  const [showPersonality, setShowPersonality] = useState(false);
  const [userPersonality, setUserPersonality] = useState([""]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    //@ts-ignore
    if (session?.error === "RefreshAccessTokenError") {
      signIn("spotify");
    }

    if (session.status === "authenticated") {
      setIsFetching(true);
      fetch("/api/spotify", {
        headers: {
          //@ts-ignore
          token: session.data.accessToken,
          user: session.data.user?.name || session.data.user?.email || "anon",
        },
      })
        .then((res) => {
          setIsFetching(false);
          if (!res.ok) {
            setError("Da lief wohl etwas Schief");
            return "";
          }
          return res.json();
        })
        .then((json) => {
          if (!json) return;

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

      {/* {error && error} */}
      {showPersonality && userPersonality.length > 1 && (
        <ul className={css.dashed}>
          {userPersonality.map((trait) => (
            <li key={trait}>{trait.replace("-", "")}</li>
          ))}
        </ul>
      )}

      {isFetching && showPersonality && <div className={css.loader}></div>}
      <br />
      <button
        type="button"
        className="mt-4"
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
