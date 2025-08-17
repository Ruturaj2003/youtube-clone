"use client";
import { trpc } from "@/trpc/client";

export const DOta = () => {
  const [data] = trpc.hello.useSuspenseQuery({ text: "As" });

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
