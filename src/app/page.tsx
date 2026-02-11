import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import HowItWorks from "@/components/landing/HowItWorks";
import SocialProof from "@/components/landing/SocialProof";
import Waitlist from "@/components/landing/Waitlist";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <LandingNav />
      <Hero />
      <Problem />
      <HowItWorks />
      <SocialProof />
      <Waitlist />
      <Footer />
    </>
  );
}
