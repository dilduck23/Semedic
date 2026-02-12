export const dynamic = "force-dynamic";

import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { SearchBar } from "@/components/dashboard/search-bar";
import { ActionCards } from "@/components/dashboard/action-cards";
import { NextAppointmentCard } from "@/components/dashboard/next-appointment-card";
import { NearMeSection } from "@/components/dashboard/near-me-section";
import { OffersCarousel } from "@/components/dashboard/offers-carousel";

export default function DashboardPage() {
  return (
    <>
      <WelcomeHeader />
      <main className="px-6 lg:px-8 space-y-6 pt-4 lg:max-w-5xl">
        <SearchBar />
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
          <div className="lg:col-span-2 space-y-6">
            <ActionCards />
            <NextAppointmentCard />
          </div>
          <div className="space-y-6">
            <NearMeSection />
          </div>
        </div>
        <OffersCarousel />
      </main>
    </>
  );
}
