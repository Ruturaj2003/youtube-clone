"use client";
import {
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export const StudioSidebarHeader = () => {
  const { user } = useUser();
  const { state } = useSidebar();
  if (!user) {
    return (
      <SidebarHeader className="flex items-center justify-center pb-4">
        <Skeleton className="size-[112px] rounded-full" />
        <div className="flex flex-col items-center gap-y-2 mt-2">
          <Skeleton className="h-4 w-[80px]"></Skeleton>
          <Skeleton className="h-4 w-[100px]"></Skeleton>
        </div>
      </SidebarHeader>
    );
  }

  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={"Your Profile"}>
          <Link href={"/users/current"}>
            <UserAvatar
              size={"sm"}
              imageUrl={user?.imageUrl}
              name={user?.fullName ?? "User"}
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarHeader className="flex items-center justify-center pb-4">
      <Link href={"/users/current"}>
        <UserAvatar
          className="size-[112px] hover:opacity-80 transition-opacity"
          imageUrl={user?.imageUrl}
          name={user?.fullName ?? "User"}
        />
      </Link>
      <div className="flex flex-col items-center mt-2">
        <p className="text-sm font-medium">Your Profile</p>
        <p className="text-sm text-muted-foreground">{user.fullName}</p>
      </div>
    </SidebarHeader>
  );
};
