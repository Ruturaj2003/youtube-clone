"use client";
import { trpc } from "@/trpc/client";

export const DOta = () => {
  const [data] = trpc.hello.useSuspenseQuery({
    text: "A",
  });

  return (
    <div className="">
      <div
        className="
        "
      >
        {data.greeting}
      </div>
    </div>
  );
};
