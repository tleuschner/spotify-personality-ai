import { SeelenblickToken, TimeRange } from "@/app/types/types";
import rateLimit from "@/app/utils/rateLitmit";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import SpotifyWebApi from "spotify-web-api-node";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function GET(req: NextRequest) {
  const token = (await getToken({ req })) as SeelenblickToken | null;
  if (!token || !token.accessToken) {
    return NextResponse.error();
  }
  const accessToken = token.accessToken as string;
  const userId = token.user?.id || token.user?.name || "anon";
  const params = req.nextUrl.searchParams;
  const timeRange: TimeRange =
    (params.get("timeRange") as TimeRange) ?? "long_term";
  const spotifyApi = new SpotifyWebApi({ accessToken });

  const _headers = (await limiter.check(5, userId)) as any;
  const topSongsResponse = await spotifyApi.getMyTopTracks({
    limit: 50,
    time_range: timeRange,
  });
  const topSongs = topSongsResponse.body.items.map((track) => track.name);
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Beschreibe die Persönlichkeit der Person, welche folgende Songs am meisten gehört hat. Verhalte dich so, als würdest du direkt mit der Person sprechen und duze sie.
  
          Die Antwort hat dabei folgende Strutkur. Ersetze die [maximal 40. Wörter] mit deiner Persönlichkeitsvorhersage. Verwende keine Bindestriche (-) in deiner Antwort außer für die Struktur
  
          - [maximal 40. Wörter]
          - [maximal 40. Wörter]
          - [maximal 40. Wörter]
      
      ${topSongs.join(",")}`,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  const response = NextResponse.json({
    topSongs: topSongs,
    personality: chatCompletion.choices[0].message.content,
  });

  Object.entries(_headers).forEach((h: any) => {
    response.headers.set(h[0], h[1]);
  });

  return response;
}
