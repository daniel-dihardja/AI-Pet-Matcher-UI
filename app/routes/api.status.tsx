import { json, LoaderFunction } from "@remix-run/node";
import appCache from "~/utils/app-cache.server";

export const loader: LoaderFunction = async () => {
  const data = appCache.get("matches") as string;
  if (data) {
    const { GET_MATCHING_PETS_API_URL } = process.env;
    const isLocalhost = GET_MATCHING_PETS_API_URL?.includes("localhost");
    const body = isLocalhost ? JSON.parse(data.body) : data;
    const matches = JSON.parse(body.response.content);
    return json({ matches });
  }
  return json({ matches: null });
};
