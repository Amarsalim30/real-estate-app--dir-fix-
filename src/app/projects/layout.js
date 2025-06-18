"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Navbar } from "@/components/layout/navbar";
import { useSession } from "next-auth/react";

export default function ProjectsLayout({ children }) {
    const { data: session, status } = useSession();

    // Show loading UI while session is being fetched
    
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If user is logged in
    if (session?.user) {
        return <DashboardLayout>{children}</DashboardLayout>;
    }

    // If user is not logged in
    return <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-13">{children}</main>
        </div>
}
