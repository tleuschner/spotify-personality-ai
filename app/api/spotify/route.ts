import rateLimit from "@/app/utils/rateLitmit";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import SpotifyWebApi from "spotify-web-api-node";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function GET() {
  // try {
  const headersList = headers();
  const accessToken = headersList.get("token")!;
  const userId = headersList.get("user")!;
  const spotifyApi = new SpotifyWebApi({ accessToken });

  const _headers = (await limiter.check(5, userId)) as any;
  const topSongsResponse = await spotifyApi.getMyTopTracks({
    limit: 50,
    time_range: "long_term",
  });
  const topSongs = topSongsResponse.body.items.map((track) => track.name);
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Beschreibe die Persönlichkeit der Person, welche folgende Songs am meisten in den letzen drei Monaten gehört hat. Verhalte dich so, als würdest du direkt mit der Person sprechen und duze sie.
  
          Die Antwort hat dabei folgende Strutkur. Ersetze die [maximal 40. Wörter] mit deiner Persönlichkeitsvorhersage
  
          - [maximal 40. Wörter]
          - [maximal 40. Wörter]
          - [maximal 40. Wörter]
      
      ${topSongs.join(",")}`,
      },
    ],
    model: "gpt-4",
  });

  const response = NextResponse.json({
    topSongs: topSongs,
    personality: chatCompletion.choices[0].message.content,
  });

  Object.entries(_headers).forEach((h: any) => {
    response.headers.set(h[0], h[1]);
  });

  return response;
  // } catch (e) {
  //   console.log(e);
  //   return NextResponse.json(
  //     { message: `Something went wrong ${JSON.stringify(e)}` },
  //     { status: 500 }
  //   );
  // }
}
