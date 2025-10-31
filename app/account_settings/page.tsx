// 1. ADD THIS DIRECTIVE at the very top of the file
"use client";

import { AccountSettings } from "@stackframe/stack";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation"; // Use 'next/navigation' for App Router

export default function MyAccountPage() {
  // Now useRouter() will work because the component is a Client Component
  const router = useRouter();

  const handleBack = () => {
    // Navigates to the specified path
    router.push("/dashboard");
  };

  return (
    <>
      {/* Back Button Container */}
      <div
        style={{
          marginBottom: "20px",
          paddingLeft: "20px",
          paddingTop: "10px",
        }}
      >
        <button onClick={handleBack}>
          {/* Back Icon */}
          <ArrowLeft size={28} className="" />
        </button>
      </div>

      {/* Original Component */}
      <AccountSettings />
    </>
  );
}
