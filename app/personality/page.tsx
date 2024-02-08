"use client";
import { Select, SelectItem } from "@nextui-org/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";
import PersonalityTraitsList from "./PersonalityTraitsList";
import css from "./personality.module.css";
import { TimeRange } from "../types";

const timeFrameOptions = [
  { value: "long_term", label: "Aller Zeiten" },
  { value: "medium_term", label: "Letzte 6 Monate" },
  { value: "short_term", label: "Letzte 3 Monate" },
];

export default function About() {
  const session = useSession();
  const [showPersonality, setShowPersonality] = useState(false);
  const [userPersonality, setUserPersonality] = useState([""]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("long_term");

  useEffect(() => {
    console.log(session);
    //@ts-ignore
    if (session?.data.error === "RefreshAccessTokenError") {
      signIn("spotify");
    }
    if (session.status === "authenticated") {
      setIsFetching(true);
      const queryParams = new URLSearchParams({ timeRange });
      fetch(`/api/spotify?${queryParams.toString()}`, {
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
  }, [session, timeRange]);

  // TODO playlistenoptimierung (siehe chat in stream)
  // TODO warum userPersonality.length > 1; und was sagt das aus?
  const showTraitsList = showPersonality && userPersonality.length > 1;
  const showLoadingSpinner = isFetching && showPersonality;
  return (
    <main className="flex flex-col dark text-foreground bg-background">
      <Select
        label="Zeitraum"
        defaultSelectedKeys={[timeFrameOptions[0].value]}
        className="w-52"
        onChange={(e) => setTimeRange(e.target.value as TimeRange)}
      >
        {timeFrameOptions.map((timeFrameOption) => (
          <SelectItem key={timeFrameOption.value} value={timeFrameOption.value}>
            {timeFrameOption.label}
          </SelectItem>
        ))}
      </Select>
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
      {showTraitsList && <PersonalityTraitsList traits={userPersonality} />}
      {showLoadingSpinner && <div className={css.loader}></div>}
      <div className="flex-1" />
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
