import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Provider from "./context/client-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

const roboto = Roboto({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Seelenblick - Musikpersönlichkeit",
  description: "Eine Reise zu dir selbst",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="de">
      <body className={roboto.className}>
        <Provider session={session}>{children}</Provider>
      </body>
    </html>
  );
}
