import { json, ActionFunction } from "@remix-run/node";
import appCache from "~/utils/app-cache.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const data = await request.json(); // Read and parse the JSON data from the request
    const content = JSON.parse(data.message.content);
    appCache.set("matches", content);
    return json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return json({ error: "Error processing webhook" }, { status: 500 });
  }
};
