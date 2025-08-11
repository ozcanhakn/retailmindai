"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Router'ı import et
import { authClient } from "@/lib/aut-client"; // Doğru import path
import { 
    Search, 
    Bell, 
    User, 
    Settings, 
    LogOut, 
    CreditCard,
    Users,
    Key,
    HelpCircle,
    ChevronDown,
    Menu,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Zap,
    Home,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface DashboardNavbarProps {
    onMenuClick?: () => void;
    breadcrumbs?: { label: string; href?: string }[];
    currentPlan?: "starter" | "professional" | "business" | "enterprise";
    // user prop'unu kaldırdık çünkü session'dan alacağız
}

const mockNotifications = [
    {
        id: 1,
        type: "success",
        title: "Analysis Complete",
        message: "Your sales report is ready to view",
        time: "2 min ago",
        unread: true
    },
    {
        id: 2,
        type: "warning",
        title: "Data Quality Issue",
        message: "15 missing values detected in uploaded CSV",
        time: "1 hour ago",
        unread: true
    },
    {
        id: 3,
        type: "info",
        title: "New Insights Available",
        message: "AI discovered seasonal trends in your data",
        time: "3 hours ago",
        unread: false
    }
];

const getNotificationIcon = (type: string) => {
    switch (type) {
        case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
        case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case "info": return <Activity className="h-4 w-4 text-blue-500" />;
        default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
};

const getAIStatusColor = (status: string) => {
    switch (status) {
        case "online": return "bg-green-500";
        case "processing": return "bg-yellow-500 animate-pulse";
        case "offline": return "bg-red-500";
        case "high-load": return "bg-orange-500 animate-pulse";
        default: return "bg-gray-500";
    }
};

const planLimits = {
    starter: { apiCalls: 10, storage: 1, maxApiCalls: 10, maxStorage: 1 },
    professional: { apiCalls: 145, storage: 2.3, maxApiCalls: 200, maxStorage: 5 },
    business: { apiCalls: 890, storage: 15.2, maxApiCalls: 1000, maxStorage: 50 },
    enterprise: { apiCalls: 2450, storage: 125.8, maxApiCalls: 5000, maxStorage: 500 }
};

export const DashboardNavbar = ({ 
    onMenuClick, 
    breadcrumbs = [{ label: "Dashboard" }],
    currentPlan = "professional"
}: DashboardNavbarProps) => {
    // Tüm hook'ları önce çağır
    const { data: session } = authClient.useSession();
    const router = useRouter(); // Router hook'unu ekle
    const [searchQuery, setSearchQuery] = useState("");
    const [aiStatus, setAiStatus] = useState<"online" | "processing" | "offline" | "high-load">("online");
    const [unreadNotifications, setUnreadNotifications] = useState(2);
    
    // useEffect'i de hook'lar bölümünde çağır
    useEffect(() => {
        const interval = setInterval(() => {
            const statuses: Array<typeof aiStatus> = ["online", "processing", "online", "high-load"];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            setAiStatus(randomStatus);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Logout function'ı ekle
    const handleSignOut = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/sign-in");
                    }
                }
            });
        } catch (error) {
            console.error("Sign out error:", error);
            // Hata durumunda da yönlendir
            router.push("/sign-in");
        }
    };
    
    // Early return'ü hook'lardan sonra yap
    if (!session) {
        return (
            <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
                <div className="flex items-center justify-center">
                    <div className="text-gray-400">Loading...</div>
                </div>
            </nav>
        );
    }

    const user = {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: undefined // Avatar şimdilik yok, initials kullanacağız
    };
    
    const currentLimits = planLimits[currentPlan];
    const apiUsagePercent = (currentLimits.apiCalls / currentLimits.maxApiCalls) * 100;
    const storageUsagePercent = (currentLimits.storage / currentLimits.maxStorage) * 100;

    const getAIStatusText = () => {
        switch (aiStatus) {
            case "online": return "AI Online";
            case "processing": return "Processing...";
            case "offline": return "AI Offline";
            case "high-load": return "High Load";
            default: return "Unknown";
        }
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMenuClick}
                        className="lg:hidden text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* Breadcrumbs */}
                    <div className="hidden md:flex items-center space-x-2 text-sm">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                {index === 0 && <Home className="h-4 w-4 text-gray-400" />}
                                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-500" />}
                                <span 
                                    className={`${
                                        index === breadcrumbs.length - 1 
                                            ? "text-white font-medium" 
                                            : "text-gray-400 hover:text-white cursor-pointer"
                                    }`}
                                >
                                    {breadcrumb.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center Section - Search */}
                <div className="flex-1 max-w-md mx-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search reports, data, insights..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {searchQuery && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
                                <div className="p-2 text-sm text-gray-400">
                                    Search results for "{searchQuery}"...
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* AI Status */}
                    <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-full">
                        <div className={`w-2 h-2 rounded-full ${getAIStatusColor(aiStatus)}`}></div>
                        <span className="text-xs text-gray-300">{getAIStatusText()}</span>
                    </div>

                    {/* Usage Meter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                                <div className="flex items-center space-x-2">
                                    <Activity className="h-4 w-4" />
                                    <span className="hidden md:inline text-xs">
                                        {currentLimits.apiCalls}/{currentLimits.maxApiCalls}
                                    </span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-72 bg-gray-800 border-gray-700">
                            <DropdownMenuLabel className="text-white">Usage This Month</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <div className="p-3 space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">API Calls</span>
                                        <span className="text-white">{currentLimits.apiCalls}/{currentLimits.maxApiCalls}</span>
                                    </div>
                                    <Progress value={apiUsagePercent} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">Storage</span>
                                        <span className="text-white">{currentLimits.storage}GB/{currentLimits.maxStorage}GB</span>
                                    </div>
                                    <Progress value={storageUsagePercent} className="h-2" />
                                </div>
                            </div>
                            {(apiUsagePercent > 80 || storageUsagePercent > 80) && (
                                <>
                                    <DropdownMenuSeparator className="bg-gray-700" />
                                    <DropdownMenuItem className="text-yellow-400 hover:bg-gray-700">
                                        <Zap className="mr-2 h-4 w-4" />
                                        Upgrade Plan
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-white hover:bg-gray-800">
                                <Bell className="h-5 w-5" />
                                {unreadNotifications > 0 && (
                                    <Badge 
                                        variant="destructive" 
                                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                    >
                                        {unreadNotifications}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 bg-gray-800 border-gray-700">
                            <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <div className="max-h-72 overflow-y-auto">
                                {mockNotifications.map((notification) => (
                                    <DropdownMenuItem 
                                        key={notification.id} 
                                        className={`p-3 cursor-pointer hover:bg-gray-700 ${
                                            notification.unread ? "bg-gray-750" : ""
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3 w-full">
                                            {getNotificationIcon(notification.type)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {notification.time}
                                                </p>
                                            </div>
                                            {notification.unread && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                            )}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Profile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="bg-gray-700 text-white">
                                        {user.name ? 
                                            user.name.split(' ').map(n => n[0]).join('').toUpperCase() 
                                            : 'U'
                                        }
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                                    <p className="text-xs leading-none text-gray-400">{user.email}</p>
                                    <Badge variant="secondary" className="w-fit mt-1 text-xs capitalize">
                                        {currentPlan}
                                    </Badge>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                                <Settings className="mr-2 h-4 w-4" />
                                Account Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Billing & Usage
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                                <Users className="mr-2 h-4 w-4" />
                                Team Management
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                                <Key className="mr-2 h-4 w-4" />
                                API Keys
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Help & Support
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem 
                                className="text-red-400 hover:text-red-300 hover:bg-gray-700 cursor-pointer"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
};