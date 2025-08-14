import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar} from 'lucide-react';
import Navigation from '@/components/landing/Navigation';
import Hero from '@/components/landing/Hero';
import About from '@/components/landing/About';
import Services from '@/components/landing/Services';
import Promos from '@/components/landing/Promos';
import Booking from '@/components/landing/Booking';
import Gallery from '@/components/landing/Gallery';
import FAQ from '@/components/landing/FAQ';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
   <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Services />
      <Promos />
      <Booking />
      <Gallery />
      <FAQ />
      <Contact />
      <Footer />
    
    </div>
  );
}

  