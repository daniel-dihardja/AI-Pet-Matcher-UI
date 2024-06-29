import { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { getSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request);
  const isAuthenticated = session.get("isAuthenticated");
  return { isAuthenticated };
};

export default function Index() {
  const { isAuthenticated } = useLoaderData<{ isAuthenticated: boolean }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/petmatch");
    }
  }, [isAuthenticated, navigate]);

  return <></>;
}
