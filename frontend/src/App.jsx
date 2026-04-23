import TopNav from './components/TopNav';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import RoutersPage from './components/RoutersPage';
import { usePath } from './hooks/usePath';

export default function App() {
  const path = usePath();
  return (
    <div className="page">
      <TopNav />
      <main>{path === '/routers' ? <RoutersPage /> : <LandingPage />}</main>
      <Footer />
    </div>
  );
}
