import { ActionFunction, redirect } from "@remix-run/node";
import { destroySession } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(request),
    },
  });
};

export const loader = () => {
  return redirect("/login");
};
