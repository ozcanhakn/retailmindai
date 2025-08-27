"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
    BotIcon, 
    StarIcon, 
    VideoIcon,
    BarChart3,
    Users,
    Package,
    TrendingUp,
    MessageSquare,
    FileText,
    Activity,
    Database,
    Settings,
    Upload,
    Filter,
    Columns,
    Lightbulb,
    FileBarChart,
    AlertTriangle,
    PieChart,
    Layout,
    Presentation,
    Download,
    Clock,
    BookOpen,
    Crown
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UpgradePlanModal } from '@/components/pricing/upgrade-plan-modal';

const workspaceSection = [
    {
        icon: Activity,
        label: "Dashboard",
        href: "/dashboard",
    },
    {
        icon: BarChart3,
        label: "KPI Dashboard",
        href: "/dashboard/kpi-dashboard",
    },
    {
        icon: FileText,
        label: "Recent Analysis",
        href: "/dashboard/recent",
    },
    {
        icon: BookOpen,
        label: "Saved Reports",
        href: "/dashboard/saved",
    },
    {
        icon: Clock,
        label: "Analysis History",
        href: "/dashboard/history",
    },
];

const dataSection = [
    {
        icon: Upload,
        label: "Upload Center",
        href: "/upload",
    },
    {
        icon: Database,
        label: "Data Sources",
        href: "/dashboard/data-sources",
    },
    {
        icon: Filter,
        label: "Data Cleaning",
        href: "/dashboard/cleaning",
    },
    {
        icon: Columns,
        label: "Column Mapping",
        href: "/dashboard/mapping",
    },
];

const aiSection = [
    {
        icon: MessageSquare,
        label: "Ask Your Data",
        href: "/dashboard/ai-chat",
    },
    {
        icon: Lightbulb,
        label: "Smart Insights",
        href: "/dashboard/insights",
    },
    {
        icon: FileBarChart,
        label: "Auto Reports",
        href: "/dashboard/auto-reports",
    },
    {
        icon: TrendingUp,
        label: "Forecasting",
        href: "/dashboard/forecasting",
    },
];

const analyticsSection = [
    {
        icon: BarChart3,
        label: "Sales Performance",
        href: "/dashboard/sales",
    },
    {
        icon: Users,
        label: "Customer Behavior",
        href: "/dashboard/customers",
    },
    {
        icon: Package,
        label: "Product Intelligence",
        href: "/dashboard/products",
    },
    {
        icon: AlertTriangle,
        label: "Anomaly Detection",
        href: "/dashboard/anomalies",
    },
];

const visualizationSection = [
    {
        icon: PieChart,
        label: "Chart Builder",
        href: "/dashboard/charts",
    },
    {
        icon: Layout,
        label: "Dashboard Creator",
        href: "/dashboard/creator",
    },
    {
        icon: Presentation,
        label: "Presentation Mode",
        href: "/dashboard/presentation",
    },
    {
        icon: Download,
        label: "Export Options",
        href: "/dashboard/export",
    },
];

const upgradeSection = [
    {
        icon: StarIcon,
        label: "Upgrade Plan",
        href: "/upgrade",
    },
];

export const DashboardSidebar = () => {
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [currentPlan] = useState('free'); // This would come from user context/state

    const handleUpgradeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsUpgradeModalOpen(true);
    };
    return (
        <Sidebar className="bg-black border-r border-gray-800">
            <SidebarHeader className="bg-black border-b border-gray-800">
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-4">
                    <Image src="/logo.svg" height={32} width={32} alt="RetailMind AI"/>
                    <p className="text-xl font-semibold text-white">RetailMind.AI</p>
                </Link>
            </SidebarHeader>
            
            <SidebarContent className="bg-black">
                {/* My Workspace Section */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <div className="px-4 py-2">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    My Workspace
                                </p>
                            </div>
                            {workspaceSection.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        asChild 
                                        className="text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                                    >
                                        <Link href={item.href} className="flex items-center gap-3 px-4 py-3">
                                            <item.icon className="h-5 w-5" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                            {item.label === 'Recent Analysis' && (
                                                <div className="ml-auto">
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                                </div>
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="px-4 py-2">
                    <Separator className="bg-gray-800" />
                </div>

                {/* Data Management Section */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <div className="px-4 py-2">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Data Management
                                </p>
                            </div>
                            {dataSection.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        asChild 
                                        className="text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                                    >
                                        <Link href={item.href} className="flex items-center gap-3 px-4 py-3">
                                            <item.icon className="h-5 w-5" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="px-4 py-2">
                    <Separator className="bg-gray-800" />
                </div>

                {/* AI Analysis Engine Section */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <div className="px-4 py-2">
                                <p className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                                    AI Analysis Engine
                                </p>
                            </div>
                            {aiSection.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        asChild 
                                        className="text-gray-300 hover:text-white hover:bg-blue-900/30 hover:border-l-2 hover:border-blue-400 transition-all"
                                    >
                                        <Link href={item.href} className="flex items-center gap-3 px-4 py-3">
                                            <item.icon className="h-5 w-5 text-blue-400" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="px-4 py-2">
                    <Separator className="bg-gray-800" />
                </div>

                {/* Analytics Dashboard Section */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <div className="px-4 py-2">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Analytics Dashboard
                                </p>
                            </div>
                            {analyticsSection.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        asChild 
                                        className="text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                                    >
                                        <Link href={item.href} className="flex items-center gap-3 px-4 py-3">
                                            <item.icon className="h-5 w-5" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="px-4 py-2">
                    <Separator className="bg-gray-800" />
                </div>

                {/* Visualization Studio Section */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <div className="px-4 py-2">
                                <p className="text-xs font-medium text-green-400 uppercase tracking-wider">
                                    Visualization Studio
                                </p>
                            </div>
                            {visualizationSection.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        asChild 
                                        className="text-gray-300 hover:text-white hover:bg-green-900/30 hover:border-l-2 hover:border-green-400 transition-all"
                                    >
                                        <Link href={item.href} className="flex items-center gap-3 px-4 py-3">
                                            <item.icon className="h-5 w-5 text-green-400" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="px-4 py-2">
                    <Separator className="bg-gray-800" />
                </div>

                {/* Settings Section */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <div className="px-4 py-2">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Settings & Tools
                                </p>
                            </div>
                            <SidebarMenuItem>
                                <SidebarMenuButton 
                                    asChild 
                                    className="text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                                >
                                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3">
                                        <Settings className="h-5 w-5" />
                                        <span className="text-sm font-medium">Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-black border-t border-gray-800">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            onClick={handleUpgradeClick}
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-gradient-to-r hover:from-yellow-900/30 hover:to-orange-900/30 transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-3 px-4 py-3 w-full">
                                <div className="relative">
                                    <Crown className="h-5 w-5" />
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                </div>
                                <span className="text-sm font-medium">Upgrade Plan</span>
                                <div className="ml-auto">
                                    <div className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold rounded-full">
                                        PRO
                                    </div>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            
            {/* Upgrade Plan Modal */}
            <UpgradePlanModal 
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                currentPlanId={currentPlan}
            />
        </Sidebar>
    );
};