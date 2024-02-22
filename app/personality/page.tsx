"use client";
import { Select, SelectItem } from "@nextui-org/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Typewriter from "typewriter-effect";
import PersonalityTraitsList from "./PersonalityTraitsList";
import css from "./personality.module.css";
import { TimeRange } from "../types/types";

const timeFrameOptions = [
  { value: "long_term", label: "Aller Zeiten" },
  { value: "medium_term", label: "Letzte 6 Monate" },
  { value: "short_term", label: "Letzte 3 Monate" },
];

export default function About() {
  const session = useSession({
    required: true,
    onUnauthenticated: () => signIn("spotify"),
  });
  const [typeWriterDone, setTypeWriterDone] = useState(false);
  const [hasFetchedUserPersonality, setHasFetchedUserPersonality] =
    useState(false);
  const [userPersonality, setUserPersonality] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("long_term");

  useEffect(() => {
    if (session?.data?.error === "RefreshAccessTokenError") {
      signIn("spotify");
    }
  }, [session]);

  useEffect(() => {
    setIsFetching(true);
    const queryParams = new URLSearchParams({ timeRange });
    fetch(`/api/spotify?${queryParams.toString()}`)
      .then((res) => {
        setIsFetching(false);
        if (!res.ok) {
          setError("Da lief wohl etwas Schief");
          setHasFetchedUserPersonality(false);
          return "";
        }
        return res.json();
      })
      .then((json) => {
        if (!json) return;
        const { personality } = json;
        setUserPersonality(personality.split("-").filter(Boolean));
        setHasFetchedUserPersonality(true);
      });
  }, [timeRange]);

  // TODO playlistenoptimierung (siehe chat in stream)
  const showTraitsList = typeWriterDone && hasFetchedUserPersonality;
  const showLoadingSpinner = typeWriterDone && isFetching;
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
                setTypeWriterDone(true);
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
