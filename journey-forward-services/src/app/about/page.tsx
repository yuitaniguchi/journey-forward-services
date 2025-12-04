import AboutHero from '@/components/about/AboutHero';
import AboutIntro from '@/components/about/AboutIntro';
import AboutStory from '@/components/about/AboutStory';
import AboutBanner from '@/components/about/AboutBanner';
import WhyDifferent from '@/components/about/WhyDifferent';
import WhatWeOffer from '@/components/about/WhatWeOffer';
import Partners from '@/components/about/Partners';
import AboutCTA from '@/components/about/AboutCTA';

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col antialiased bg-neutralBg">
      <AboutHero />
      <AboutIntro />
      <AboutStory />
      <AboutBanner />
      <WhyDifferent />
      <WhatWeOffer />
      <Partners />
      <AboutCTA />
    </main>
  );
}
