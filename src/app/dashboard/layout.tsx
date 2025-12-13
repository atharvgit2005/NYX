import { SidebarProvider } from '@/context/SidebarContext';
import DashboardShell from '@/components/DashboardShell';

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
