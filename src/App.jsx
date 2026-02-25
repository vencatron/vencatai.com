import Header from './components/Header';
import Hero from './components/Hero';
import SectionNav from './components/SectionNav';
import AIVideos from './components/AIVideos';
import CustomWebsites from './components/CustomWebsites';
import NextJsApps from './components/NextJsApps';
import ImagesInfographics from './components/ImagesInfographics';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main>
        <Hero />
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
