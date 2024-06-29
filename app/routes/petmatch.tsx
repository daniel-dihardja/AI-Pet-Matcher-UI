import { Button, Textarea } from "@nextui-org/react";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { redirect, useFetcher } from "@remix-run/react";
import { Header } from "../components/Header";
import { isAuthenticated } from "~/utils/session.server";
import { useEffect, useState } from "react";

type ActionData = {
  success: boolean;
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
  try {
    const formData = await request.formData();
    const emailContent = formData.get("emailContent");

    const { GET_MATCHING_PETS_API_URL, API_KEY } = process.env;
    const response = await fetch(GET_MATCHING_PETS_API_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        x_api_key: API_KEY as string,
      },
      body: JSON.stringify({ message: emailContent }),
    });

    if (!response.ok) {
      return json<ActionData>({ success: false }, { status: response.status });
    }

    const data = await response.json();
    const content = JSON.parse(data.result.content);

    return json<ActionData>({ success: true, content });
  } catch (error) {
    console.error("Error fetching data:", error);
    return json<ActionData>({ success: false }, { status: 500 });
  }
};

export default function PetMatch() {
  const fetcher = useFetcher();
  const [emailContent, setEmailContent] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    setIsButtonEnabled(emailContent.trim() !== "");
  }, [emailContent]);

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
              onChange={(e) => setEmailContent(e.target.value)}
              isRequired={true}
            />
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              className={`px-16 bg-black text-white ${
                !isButtonEnabled
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-gray-800"
              }`}
              style={!isButtonEnabled ? { pointerEvents: "none" } : {}}
              disabled={!isButtonEnabled}
              isLoading={fetcher.state === "submitting"}
            >
              <strong>Find Matching Pets</strong>
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
