import { HeroSection } from "@/components/home/HeroSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { PlatformSection } from "@/components/home/PlatformSection";
import { WhySection } from "@/components/home/WhySection";
import { ProofSection } from "@/components/home/ProofSection";
import { CustomersSection } from "@/components/home/CustomersSection";
import { RecognitionSection } from "@/components/home/RecognitionSection";
import { CtaSection } from "@/components/home/CtaSection";
import { ThemeScripts } from "@/components/site/ThemeScripts";

export default function HomePage() {
  return (
    <div className="entry-content wp-block-post-content is-layout-constrained wp-block-post-content-is-layout-constrained">
      <HeroSection />
      <ProblemSection />
      <PlatformSection />
      <WhySection />
      <ProofSection />
      <CustomersSection />
      <RecognitionSection />
      <CtaSection />
      <ThemeScripts home />
    </div>
  );
}
