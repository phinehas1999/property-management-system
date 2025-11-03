import { Hero115 } from "@/components/Hero";
import { Link, Link2Off, LogOutIcon, SquareArrowOutUpRight, Zap } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Hero115
        heading={"Property Management System"}
        description={
          "Manage your properties, tenants, and payments effortlessly with our all-in-one property management platform"
        }
        button={{
          text: "Go to Dashboard",
          icon: <SquareArrowOutUpRight className="ml-2 size-4" />,
          url: "/dashboard",
        }}
      />
    </div>
  );
}
