import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { NextApiRequest } from "next";
import SpotifyWebApi from "spotify-web-api-node";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export async function GET(req: NextApiRequest) {
  const headersList = headers();
  const accessToken = headersList.get("token")!;
  const spotifyApi = new SpotifyWebApi({ accessToken });

  const topSongsResponse = await spotifyApi.getMyTopTracks({ limit: 50 });
  const topSongs = topSongsResponse.body.items.map((track) => track.name);
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Beschreibe die Persönlichkeit der Person, welche folgende Songs am meisten in den letzen drei Monaten gehört hat. Gib nur 3 Stichpunkte mit bindestrich anstatt zahl mit mindestens 40 wörtern und sonst nichts. Verwende in der weiteren Antwort keine Bindestriche. Verhalte dich so, als würdest du direkt mit der Person sprechen und duze sie.
    
    ${topSongs.join(",")}`,
      },
    ],
    model: "gpt-4",
  });

  return NextResponse.json({
    topSongs: topSongs,
    personality: chatCompletion.choices[0].message.content,
  });
}
