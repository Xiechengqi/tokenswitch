import TopNav from './components/TopNav';
import Hero from './components/Hero';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="page">
      <TopNav />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
