import TopNav from './components/TopNav';
import Hero from './components/Hero';
import StatsStrip from './components/StatsStrip';
import Features from './components/Features';
import MapSection from './components/MapSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="page">
      <TopNav />
      <main>
        <Hero />
        <StatsStrip />
        <Features />
        <MapSection />
      </main>
      <Footer />
    </div>
  );
}
