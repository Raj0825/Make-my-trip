import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  className?: string;
  variant?: "light" | "dark" | "pill";
}

export default function BackButton({
  fallbackUrl = "/",
  label = "Back",
  className = "",
  variant = "light",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  const variantStyles = {
    light: "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm",
    dark: "bg-black/30 backdrop-blur text-white hover:bg-black/40 border-white/20 hover:border-white/40",
    pill: "bg-white text-blue-600 hover:bg-blue-50 border-blue-200 rounded-full px-4 shadow-sm",
  }[variant];

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all hover:shadow hover:-translate-x-0.5 active:translate-x-0 cursor-pointer ${variantStyles} ${className}`}
      aria-label="Go to previous page"
    >
      <ArrowLeft size={16} className="shrink-0" />
      <span>{label}</span>
    </button>
  );
}
