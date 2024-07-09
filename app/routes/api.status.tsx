import { json, LoaderFunction } from "@remix-run/node";
import appCache from "~/utils/app-cache.server";

export const loader: LoaderFunction = async () => {
  const data = appCache.get("matches") as string;
  if (data) {
    const body = JSON.parse(data.body);
    const matches = JSON.parse(body.response.content);
    return json({ matches });
  }
  return json({ matches: null });
};
