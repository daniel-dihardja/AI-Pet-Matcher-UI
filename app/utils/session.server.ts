import { createCookieSessionStorage } from "@remix-run/node";

const { SESSION_SECRET } = process.env;

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET as string],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function isAuthenticated(request: Request) {
  const session = await getSession(request);
  return session.get("isAuthenticated");
}

export async function destroySession(request: Request) {
  const session = await getSession(request);
  return sessionStorage.destroySession(session);
}
