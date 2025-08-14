import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-teal-500">
      <Button variant={"ghost"}>sad</Button>

      <Image height={50} width={50} alt="logo" src={"./logo.svg"}></Image>
    </div>
  );
}
