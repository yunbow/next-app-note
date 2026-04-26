import { LPHeader } from "@/components/landing/LPHeader";
import { LandingContent } from "@/components/landing/LandingContent";
import { LPFooter } from "@/components/landing/LPFooter";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LPHeader />
      <main className="flex-1">
        <LandingContent />
      </main>
      <LPFooter />
    </div>
  );
}
