import { Button } from "@nextui-org/react";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { sessionStorage } from "~/utils/session.server";

type ActionData = {
  success: boolean;
  message?: string;
};

const { USERNAME, PASSWORD } = process.env;

export const action: ActionFunction = async ({ request }) => {
  const formData = new URLSearchParams(await request.text());
  const username = formData.get("username");
  const password = formData.get("password");

  if (username === USERNAME && password === PASSWORD) {
    const session = await sessionStorage.getSession();
    session.set("isAuthenticated", true);

    return redirect("/petmatch", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } else {
    return json<ActionData>(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }
};

export default function Login() {
  const fetcher = useFetcher();

  return (
    <>
      <div className="container mx-auto px-6 max-w-[1024px] mt-2">
        <fetcher.Form
          method="post"
          onSubmit={(event) => {
            event.preventDefault();
            fetcher.submit(event.currentTarget);
          }}
          className="grid grid-cols-1 gap-4 pt-6 px-8"
        >
          <div className="flex justify-center items-center">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="border rounded-md p-2 w-1/2"
            />
          </div>

          <div className="flex justify-center items-center">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border rounded-md p-2 w-1/2"
            />
          </div>

          <div className="flex justify-center items-center">
            {fetcher.data?.message && (
              <p className="text-red-600">{fetcher.data.message}</p>
            )}
          </div>

          <div className="flex justify-center items-center">
            <Button
              type="submit"
              color="default"
              variant="flat"
              isLoading={fetcher.state === "submitting"}
              className="px-8"
            >
              {fetcher.state === "submitting" ? "Logging in..." : "Login"}
            </Button>
          </div>
        </fetcher.Form>
      </div>
    </>
  );
}
