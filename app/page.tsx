"use client";

import { NextUIProvider } from "@nextui-org/react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoggedInStatus: React.FC = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/personality");
    }
  }, [session.status, router]);

  return <></>;
};

export default function Home() {
  return (
    <NextUIProvider>
      <main className="dark text-foreground bg-background">
        <LoggedInStatus />
        <h1 className="text-4xl font-bold mb-2">
          Dein persönlicher Seelenblick
        </h1>
        <p>
          Was bewegt dich, wovor hast du Angst und was sind deine Stärken?
          Fragen, die nicht einfach zu beantworten waren - bis jetzt!
        </p>
        <p>
          Mach dich bereit auf eine Reise zu dir selbst und erlebe dich
          vollkommen neu!
        </p>
        <p>
          Mithilfe deiner Lieblingssongs und neuster künstlicher Intelligenz
          sind neue, bisher unvorstellbare Möglichkeiten möglich. Worauf wartest
          du?
        </p>
        <button
          type="button"
          className="spotify-login-button text-black pt-2 pb-2 pl-4 pr-4 rounded-full mt-4"
          onClick={() => signIn("spotify")}
        >
          Mit Spotify einloggen
        </button>
      </main>
    </NextUIProvider>
  );
}
