import {
  Button,
  Textarea,
  Card,
  CardBody,
  Link,
  Avatar,
} from "@nextui-org/react";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { redirect, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import appCache from "~/utils/app-cache.server";
import { isAuthenticated } from "~/utils/session.server";
import { Header } from "../components/Header";

type ActionData = {
  success: boolean;
};

type PetDetail = {
  name: string;
  url: string;
  image: string;
  description: string;
};

type Matches = {
  summary: string;
  matches: Array<PetDetail>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return redirect("/login");
  }
  return json({});
};

const queryPets = (message: string) => {
  return new Promise((resolve, reject) => {
    appCache.flushAll();
    const { GET_MATCHING_PETS_API_URL, API_KEY } = process.env;
    fetch(GET_MATCHING_PETS_API_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY as string,
      },
      body: JSON.stringify({ message }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        appCache.set("matches", data);
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const message = formData.get("emailContent");
    queryPets(message as string);
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
          console.log({ data });
          clearInterval(interval);
          setPollingInterval(null);
          setIsPolling(false);
          setMatches(data.matches);
        }
      }, 3000);
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
      setMatches(null);
      setIsPolling(true);
    }
  }, [fetcher.data]);

  return (
    <>
      {/* <Header /> */}
      <div className="container mx-auto px-2 max-w-[1024px] mt-8">
        <fetcher.Form method="post" className="grid grid-cols-1 gap-4">
          <div>
            {/* <Avatar src="/assets/logo.webp" size="lg"></Avatar> */}
            {/* <img
              src="/assets/logo.webp"
              alt="owl"
              className=" h-32 border rounded-lg"
            ></img> */}
          </div>

          <div>
            <Textarea
              id="petDescription"
              name="emailContent"
              placeholder="Describe the pet you are looking for..."
              fullWidth={true}
              size="lg"
              minRows={3}
              onChange={(e) => setMessage(e.target.value)}
              isRequired={true}
            />
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              className={`w-full md:w-64 p-6 bg-black text-white ${
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

        {matches ? (
          <div>
            {/* <p className="mt-8 text-large">{matches.summary}</p> */}
            <div className="columns-1 md:columns-2 gap-4 mt-6">
              {matches.matches.map((pet, index) => (
                <Card key={index} className="mb-4">
                  <CardBody>
                    <div className="grid grid-cols-1">
                      <div>
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full rounded-md"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <h3 className="py-3">
                          <strong>{pet.name}</strong>
                        </h3>
                        <p>{pet.description}</p>
                        <p className=" pt-2">
                          <Link
                            className="text-blue-600 underline"
                            href={pet.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {pet.url}
                          </Link>
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
