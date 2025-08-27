"use client"

import { EnhancedDashboard } from '@/modules/dashboard/ui/components/enhanced-dashboard';
import { authClient } from "@/lib/aut-client";
import { useRouter } from "next/navigation";

export const HomeView = () => {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    
    if(!session){
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return <EnhancedDashboard />;
};

