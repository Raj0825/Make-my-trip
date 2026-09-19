import { useEffect } from "react";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";

export default function MyBookingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile#my-bookings");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader />
    </div>
  );
}
