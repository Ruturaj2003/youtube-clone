import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { SearchInput } from "./search-input";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";

export const HomeNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50">
      <div className="flex items-center gap-4 w-full">
        {/* Menu And Logo */}
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />
          <Link href={"/"} className="hidden md:block">
            <div className="p-4 flex items-center gap-1">
              <Image
                src={"/logo.svg"}
                height={32}
                width={32}
                alt="Logo"
              ></Image>
              <p className="text-xl font-semibold tracking-tight">ViewTube</p>
            </div>
          </Link>
        </div>

        {/* Search bar */}
        <div className="flex flex-1 justify-center max-w-[720px] mx-auto">
          {/* Search Input */}
          <SearchInput />
        </div>
        {/* XX  */}
        <div className="flex-shrink-0 flex items-center gap-4">
          {/* Auth Button */}
          <AuthButton />
        </div>
        {/* XX */}
      </div>
    </nav>
  );
};
