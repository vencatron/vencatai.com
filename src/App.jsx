import { useEffect } from 'react';
import Header from './components/Header';
import GridGlow from './components/GridGlow';
import Hero from './components/Hero';
import VortexFeature from './components/VortexFeature';
import SectionNav from './components/SectionNav';
import AIVideos from './components/AIVideos';
import CustomWebsites from './components/CustomWebsites';
import NextJsApps from './components/NextJsApps';
import ImagesInfographics from './components/ImagesInfographics';
import Footer from './components/Footer';

export default function App() {
  // The browser's own fragment scroll fires before React renders, so deep links
  // like /#images land at the top of the page without this.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView();
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Global grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <GridGlow />
      <Header />
      <main>
        <Hero />
        <VortexFeature />
        <SectionNav />
        <AIVideos />
        <CustomWebsites />
        <NextJsApps />
        <ImagesInfographics />
      </main>
      <Footer />
    </div>
  );
}
