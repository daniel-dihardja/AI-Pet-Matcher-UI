import { json, LoaderFunction } from "@remix-run/node";
import appCache from "~/utils/app-cache.server";

export const loader: LoaderFunction = async () => {
  const matches = appCache.get("matches");
  if (matches) {
    return json({ matches });
  }
  return json({ matches: null });
};
