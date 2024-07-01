import { Button, Textarea } from "@nextui-org/react";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { redirect, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import appCache from "~/utils/app-cache.server";
import { isAuthenticated } from "~/utils/session.server";
import { Header } from "../components/Header";

type ActionData = {
  success: boolean;
};

type Matches = {
  summary: string;
  matches: Array<{ name: string; description: string }>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return redirect("/login");
  }
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const message = formData.get("emailContent");

    appCache.flushAll();

    const { GET_MATCHING_PETS_API_URL, API_KEY } = process.env;
    fetch(GET_MATCHING_PETS_API_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY as string,
      },
      body: JSON.stringify({ message }),
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error fetching data:", error);
    return json<ActionData>({ success: false }, { status: 500 });
  }
};

export default function PetMatch() {
  const fetcher = useFetcher();
  const [message, setMessage] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [matches, setMatches] = useState<Matches | null>(null);

  useEffect(() => {
    setIsButtonEnabled(message.trim() !== "");
  }, [message]);

  useEffect(() => {
    if (isPolling && !pollingInterval) {
      const interval = setInterval(async () => {
        const response = await fetch("/api/status");
        const data = await response.json();
        if (data.matches) {
          clearInterval(interval);
          setPollingInterval(null);
          setIsPolling(false);
          setMatches(data.matches);
        }
      }, 3000); // Poll every 5 seconds
      setPollingInterval(interval);
    }
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isPolling, pollingInterval]);

  useEffect(() => {
    if (fetcher.data?.success) {
      setIsPolling(true);
    }
  }, [fetcher.data]);

  return (
    <>
      <Header />
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
              onChange={(e) => setMessage(e.target.value)}
              value={message} // Initialize with loader data and update with user input
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
              isLoading={isPolling}
            >
              <strong>Find Matching Pets</strong>
            </Button>
          </div>
        </fetcher.Form>
        <div className="grid grid-cols-1 gap-4 pt-6 px-8">
          {matches ? (
            <div>
              <p className="mb-8 text-sm">{matches.summary}</p>
              <ul>
                {matches.matches.map((pet, index) => (
                  <li key={index} className="mb-4">
                    <p className="text-xl">
                      <strong>{pet.name}</strong>
                    </p>
                    <p className="text-sm">{pet.description}</p>
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
