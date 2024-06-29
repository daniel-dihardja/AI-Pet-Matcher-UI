import { Button, Textarea } from "@nextui-org/react";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { redirect, useFetcher } from "@remix-run/react";
import { Header } from "../components/Header";
import { isAuthenticated } from "~/utils/session.server";

type ActionData = {
  success: boolean;
  result?: undefined;
  content?: undefined;
};

export const loader: LoaderFunction = async ({ request }) => {
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return redirect("/login");
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const emailContent = formData.get("emailContent");

  const response = await fetch("http://localhost:8000/get_matching_pets/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      x_api_key: "secret",
    },
    body: JSON.stringify({ message: emailContent }),
  });

  if (!response.ok) {
    return json<ActionData>({ success: false }, { status: response.status });
  }

  const result = await response.json();
  const content = JSON.parse(result.result.content);

  return json<ActionData>({ success: true, result: result.result, content });
};

export default function PetMatch() {
  const fetcher = useFetcher();

  return (
    <>
      <Header></Header>
      <div className="container mx-auto px-6 max-w-[1024px] mt-2">
        <div className=" h-16"></div>
        <fetcher.Form method="post" className="grid grid-cols-1 gap-4">
          <div>
            <Textarea
              name="emailContent"
              placeholder="Please copy the enquiry email here"
              fullWidth={true}
              size="md"
              minRows={10}
            />
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              color="default"
              variant="flat"
              isLoading={fetcher.state === "submitting"}
              className="px-16"
            >
              <strong>
                {fetcher.state === "submitting" ? "Matching..." : "Match"}
              </strong>
            </Button>
          </div>
        </fetcher.Form>
        <div className="grid grid-cols-1 gap-4 pt-6 px-8">
          {fetcher.data?.success ? (
            <div>
              <p className="mb-8 text-sm">{fetcher.data.content.summary}</p>
              <ul>
                {fetcher.data.content.matches.map((match, index) => (
                  <li key={index} className="mb-4">
                    <p className="text-xl">
                      <strong>{match.name}</strong>
                    </p>
                    <p className="text-sm">{match.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
