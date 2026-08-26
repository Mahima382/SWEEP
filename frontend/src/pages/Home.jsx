import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import Roles from "../components/Roles.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import Features from "../components/Features.jsx";
import Impact from "../components/Impact.jsx";
import Gallery from "../components/Gallery.jsx";
import Faq from "../components/Faq.jsx";
import Cta from "../components/Cta.jsx";
import Footer from "../components/Footer.jsx";

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#top"
      aria-label="Back to top"
      className={`fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-forest text-lime shadow-lg shadow-leaf/30 transition-all duration-300 hover:-translate-y-1 hover:bg-leaf hover:text-white ${
        show ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </a>
  );
}

/**
 * Landing page for SWEEP — marketing homepage with the three-role marketplace.
 * @returns {JSX.Element} The home page.
 */
function Home() {
  return (
    <div className="min-h-screen bg-cream font-sans text-ink antialiased">
      <Navbar />
      <main id="main">
        <Hero />
        <Roles />
        <HowItWorks />
        <Features />
        <Gallery />
        <Impact />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default Home;
