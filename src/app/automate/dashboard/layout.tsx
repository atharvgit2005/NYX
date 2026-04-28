import { SidebarProvider } from '@/context/SidebarContext';
import DashboardShell from '@/components/DashboardShell';
import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <DashboardShell>
                {children}
            </DashboardShell>
        </SidebarProvider>
    );
}
