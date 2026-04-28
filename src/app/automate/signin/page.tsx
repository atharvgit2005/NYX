import type { Metadata } from "next";
import SigninClient from "./SigninClient";

export const metadata: Metadata = {
    title: "Signin",
    description: "Continue into the NYX Studio automate workspace.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function SignInPage() {
    return <SigninClient />;
}
