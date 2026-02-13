export const dynamic = "force-dynamic";

import { BottomNav } from "@/components/layout/bottom-nav";
import { EmergencyFAB } from "@/components/layout/emergency-fab";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="lg:flex min-h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 max-w-md mx-auto lg:max-w-none lg:mx-0 relative min-h-screen pb-24 lg:pb-0 overflow-hidden">
        {children}
      </div>
      <EmergencyFAB />
      <BottomNav />
    </div>
  );
}
