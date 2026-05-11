"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-[#FF2E2E]/30 border-t-[#FF2E2E] animate-spin"></div>
    </div>
  );
}
