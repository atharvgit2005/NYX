import type { Metadata } from "next";
import LoginClient from "@/components/auth/LoginClient";

export const metadata: Metadata = {
  title: "Portal sign in",
  description: "Sign in to the NYX Studio brand partner portal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortalLoginPage() {
  return <LoginClient defaultCallbackUrl="/portal" />;
}
