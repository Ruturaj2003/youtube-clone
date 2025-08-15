"use client";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UserCircleIcon } from "lucide-react";

export const AuthButton = () => {
  return (
    <>
      <SignedIn>
        <UserButton />
        {/* Add Menu Items For  Studio and User Profile  */}
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button
            variant={"outline"}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-500/65 rounded-full shadow-none "
          >
            <UserCircleIcon />
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
};
