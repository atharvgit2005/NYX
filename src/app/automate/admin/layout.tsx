import type { Metadata } from "next";
import AdminShellClient from "./AdminShellClient";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AdminShellClient>{children}</AdminShellClient>;
}
