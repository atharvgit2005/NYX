import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white">
            <Sidebar />
            <div className="md:pl-64 flex flex-col flex-1">
                <Header />
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
