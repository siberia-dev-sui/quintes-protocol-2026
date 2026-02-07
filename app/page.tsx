'use client'

import { Hero } from "@/components/hero";
import { PartnersCarousel } from "@/components/partners-carousel";
import { FeaturesSection } from "@/components/features-section";
import { CollaboratorsCarousel } from "@/components/collaborators-carousel";
import { AssetsSection } from "@/components/assets-section";
import { FAQSection } from "@/components/faq-section";
import { WhitelistSectionWrapper } from "@/components/whitelist-section";
import { Footer } from "@/components/footer";
import { Leva } from "leva";

export default function Home() {
  return (
    <>
      <Hero />
      <PartnersCarousel />
      <FeaturesSection />
      <AssetsSection />
      <CollaboratorsCarousel />
      <FAQSection />
      <WhitelistSectionWrapper />
      <Footer />
      <Leva hidden />
    </>
  );
}

