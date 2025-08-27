import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";

interface Props {
    children: React.ReactNode;
}

const Layout = ( {children}: Props) => {
    return (
        <SidebarProvider>
            <DashboardSidebar />
            <main className="flex flex-col h-screen w-screen" style={{ backgroundColor: 'var(--bg-100)', color: 'var(--text-100)' }}>
                <DashboardNavbar />
            {children}
            </main>
        </SidebarProvider>
    );
};

export default Layout;