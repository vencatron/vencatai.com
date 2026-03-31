import Header from './components/Header';
import GridGlow from './components/GridGlow';
import Hero from './components/Hero';
import TerminalHero from './components/TerminalHero';
import SectionNav from './components/SectionNav';
import AIVideos from './components/AIVideos';
import CustomWebsites from './components/CustomWebsites';
import NextJsApps from './components/NextJsApps';
import ImagesInfographics from './components/ImagesInfographics';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <GridGlow />
      <Header />
      <main>
        <Hero />
        <TerminalHero />
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
