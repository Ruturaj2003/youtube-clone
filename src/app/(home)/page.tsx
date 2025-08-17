import { HydrateClient, trpc } from "@/trpc/server";
import { DOta } from "./dota";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
export default async function Home() {
  void trpc.hello.prefetch({ text: "As" });
  return (
    <HydrateClient>
      <Suspense fallback={"Loading"}>
        <ErrorBoundary fallback={"Error"}>
          <div className="bg-teal-50 flex items-center justify-center w-full h-full">
            <div className="text-center  mx-auto text-2xl">
              Videos Will be loaded soon
              <DOta></DOta>
            </div>
          </div>
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
