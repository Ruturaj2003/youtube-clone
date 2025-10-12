"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { UserPageBanner } from "../components/user-page-banner";
import { UserPageInfo } from "../components/user-page-info";

interface UserSectionProps {
  userId: string;
}

export const UserSection = ({ userId }: UserSectionProps) => {
  return (
    <Suspense fallback={<h1>Loading PLease WAIT</h1>}>
      <ErrorBoundary fallback={<h2>Something Went wrong</h2>}>
        <UserSectionSuspense userId={userId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const UserSectionSuspense = ({ userId }: UserSectionProps) => {
  const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });

  return (
    <div className="flex flex-col">
      <UserPageBanner user={user} />
      <UserPageInfo user={user} />
    </div>
  );
};
