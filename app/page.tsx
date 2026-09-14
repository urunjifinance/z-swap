import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MostWanted } from "@/components/landing/most-wanted";
import { Incentives } from "@/components/landing/incentives";
import { Testimonials } from "@/components/landing/testimonials";
import { ComplianceDisclaimer, Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <MostWanted />
      <Incentives />
      <Testimonials />
      <ComplianceDisclaimer />
      <Footer />
    </main>
  );
}
