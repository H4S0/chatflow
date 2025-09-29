import Navbar from '@/components/navigation/navbar';
import { FeatureSection } from '@/components/sections/feature-section';
import Footer from '@/components/sections/footer';
import HeroSection from '@/components/sections/hero-section';

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl md:max-w-7xl p-8">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <Footer />
    </div>
  );
}
