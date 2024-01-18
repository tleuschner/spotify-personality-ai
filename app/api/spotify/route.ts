import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { NextApiRequest } from "next";
import SpotifyWebApi from "spotify-web-api-node";

export async function GET(req: NextApiRequest) {
  const headersList = headers();
  const accessToken = headersList.get("token")!;
  const spotifyApi = new SpotifyWebApi({ accessToken });

  const topSongsResponse = await spotifyApi.getMyTopTracks({ limit: 50 });
  const topSongs = topSongsResponse.body.items.map((track) => track.name);
  console.log(topSongs);

  return NextResponse.json({ topSongs: topSongs });
}
